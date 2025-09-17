# plain-text-scraper
## 目的 / 背景
- 入力されたURLからプレーンテキストのみを抽出し、UI上に表示・コピーできる最小プロダクトを構築する。
- 抽出されたデータはSNSで実施するポストのインプットデータにする。

## ユースケース
- あるサイトのニュースをスクレイピングし、プレーンテキストを得る
- このプレーンテキストをChatGPTに入力し、要約を得る
- この要約をArisaアカウントでツイートする

## スコープ（MVP）
### 含む
- URL入力フォーム（単発ジョブ）
- 抽出ジョブの作成・実行・結果表示（本文テキスト/タイトル）
- 取得結果のコピーアイコン設置によるコピー
- Rate Limit（1ユーザー/分あたりN件）
- robots.txt尊重・拡張UA設定・タイムアウト/サイズ上限
- 失敗時の再試行（最大2回）
### 含まない（将来）
- JS実行レンダリング（SPA完全対応のヘッドレスブラウザ）
- 差分クロール/定期クロール
- 多言語翻訳・要約
- PDF/Doc等の非HTML

## 主要要求
- プレーンテキスト品質：可読ブロック（記事本文）優先、ナビ/広告/フッタを可能な限り除去
- 順法：robots.txtおよびサイト規約に従う。禁止サイトのブロックリスト
- 可用性：抽出～保存までP95 < 8秒（200KB未満HTML想定）

## アーキテクチャ
- フロント：Next.js 14（App Router）/ TypeScript / Tailwind CSS v3
- 認証：Supabase Auth（メール/パスワード開始、後日OAuth）
- DB/Storage：Supabase Postgres / RLS / pg_builtins（text search）
- ジョブ実行：**Supabase Edge Functions（Deno）**でサーバーサイド抽出
- 理由：CORS回避、秘密管理、Deno DOMParserが利用可能
- キュー：DBにjobsテーブルを持ち、Edge Functionが即時実行（将来はcronで再試行/再キュー）
- 抽出ライブラリ：
  - HTML取得：fetch（UAヘッダ/タイムアウト/最大サイズ）
  - 解析：DOMParser + Mozilla Readability（Deno対応版）または簡易ヒューリスティック（article, main, 長文p要素抽出）
  - 正規化：改行・空白整形、全角/半角は保持
- フルテキスト検索：pages.contentをto_tsvector('simple', …)でインデックス。日本語は将来MeCab/pgroonga検討

### データフロー
1. Next UIでURL入力 → /api/scrape (Next Route Handler) がjobs作成
2. Edge Function scrape_page を呼出（URL, job_id, user_id）
3. Edge Functionがrobots.txt確認 → HTML取得 → 本文抽出 → pages/jobs更新
4. UIはSWRでjobs.statusをポーリング → 完了で本文表示
## ドメインモデル / スキーマ（RLS前提）
```
-- users: Supabase Authのユーザー参照（profilesで拡張）
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  created_at timestamp with time zone default now()
);

create table pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text,
  description text,
  content text, -- プレーンテキスト
  content_char_count int generated always as (char_length(coalesce(content, ''))) stored,
  site_host text,
  fetched_at timestamptz,
  created_at timestamptz default now()
);

create index pages_user_created_idx on pages(user_id, created_at desc);
create index pages_fts_idx on pages using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,'')));

create table jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  status text not null check (status in ('queued','running','succeeded','failed')),
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  page_id uuid references pages(id),
  created_at timestamptz default now()
);

create table quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  count int not null default 0
);

-- RLS
alter table pages enable row level security;
create policy pages_owner on pages
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table jobs enable row level security;
create policy jobs_owner on jobs
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table quotas enable row level security;
create policy quotas_owner on quotas
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```
## API（Next.js Route Handlers）
- POST /api/scrape
  - body: { url: string } → 201 { jobId }
    - 前段でRate Limit判定（quotasを1分ウィンドウで更新）
    - URLバリデーション（http/https, 最大長）
    - Edge Function呼び出し（fetch with service role on server)
- GET /api/jobs/:id → ジョブ状態/エラー/結果page_id
- GET /api/pages?query=&limit=&offset= → 自分の結果一覧・検索
- GET /api/pages/:id → 自分の1件詳細（本文テキスト）

## Edge Function：scrape_page
- 入力：{ job_id, user_id, url }（JWT検証 or service role + jobsレコード検証）
- 手順：
  - robots.txt 取得 → User-agent: * で/と対象パスが許可か判定（Disallowにマッチで中止）
  - fetch(url, { headers: { 'User-Agent': 'PlainTextScraper/1.0 (+contact-url)' }, redirect:'follow' })
    - タイムアウト（例：6s）、最大content-length 3MB
    - content-typeがtext/html系のみ処理
  - HTML → DOMParser → Readability（fallback: article, main, 長文<p>連結）
  - タイトル/メタ説明抽出、本文正規化（余計な改行/空白の縮約）
  - pages upsert → jobs更新（succeeded/failed）
- 失敗分類：robots拒否/タイムアウト/サイズ超過/非HTML/抽出空

## UI要件（最小）
- トップ：URL入力→「抽出」→ ステータス表示（進行/成功/失敗）
- 詳細：タイトル/URL/抽出本文（コピー用UI）
