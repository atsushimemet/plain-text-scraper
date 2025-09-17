# API仕様書

Plain Text Scraper の REST API仕様について説明します。

## 認証

すべてのAPIエンドポイントはSupabase Authによる認証が必要です。

```
Authorization: Bearer <JWT_TOKEN>
```

## エンドポイント一覧

### POST /api/scrape

URLからテキストを抽出するジョブを作成します。

**リクエスト**
```json
{
  "url": "https://example.com/article"
}
```

**レスポンス**
```json
{
  "jobId": "uuid"
}
```

**エラー**
- `400`: 無効なURL
- `401`: 認証エラー
- `429`: レート制限超過

---

### GET /api/jobs/{id}

ジョブの状態を取得します。

**レスポンス**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "url": "https://example.com",
  "status": "succeeded",
  "error": null,
  "started_at": "2025-01-01T00:00:00Z",
  "finished_at": "2025-01-01T00:00:05Z",
  "page_id": "uuid",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**ステータス**
- `queued`: キューに追加済み
- `running`: 実行中
- `succeeded`: 成功
- `failed`: 失敗

---

### GET /api/pages

抽出結果一覧を取得します。

**クエリパラメータ**
- `query`: 検索キーワード（オプション）
- `limit`: 取得件数（デフォルト: 20）
- `offset`: オフセット（デフォルト: 0）

**レスポンス**
```json
{
  "pages": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "url": "https://example.com",
      "title": "記事タイトル",
      "description": "記事の説明",
      "content": "抽出されたテキスト内容",
      "content_char_count": 1500,
      "site_host": "example.com",
      "fetched_at": "2025-01-01T00:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /api/pages/{id}

特定の抽出結果詳細を取得します。

**レスポンス**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "url": "https://example.com",
  "title": "記事タイトル",
  "description": "記事の説明",
  "content": "抽出されたテキスト内容（全文）",
  "content_char_count": 1500,
  "site_host": "example.com",
  "fetched_at": "2025-01-01T00:00:00Z",
  "created_at": "2025-01-01T00:00:00Z"
}
```

## エラーレスポンス

```json
{
  "error": "エラーメッセージ"
}
```

## レート制限

- **制限**: 1分間に5回
- **ヘッダー**: レスポンスにレート制限情報は含まれません
- **超過時**: `429 Too Many Requests`

## Edge Function: scrape_page

内部で使用されるSupabase Edge Function。

**入力**
```json
{
  "job_id": "uuid",
  "user_id": "uuid",
  "url": "https://example.com"
}
```

**処理フロー**
1. robots.txt確認
2. HTML取得（6秒タイムアウト、3MB制限）
3. テキスト抽出（Readabilityライクなアルゴリズム）
4. データベース保存
5. ジョブステータス更新

**制限事項**
- 実行時間: 最大400秒（Proプラン）
- メモリ: 256MB
- リクエストサイズ: 3MB

## データベーススキーマ

### profiles テーブル
```sql
user_id uuid PRIMARY KEY
plan text DEFAULT 'free'
created_at timestamptz
```

### pages テーブル
```sql
id uuid PRIMARY KEY
user_id uuid REFERENCES auth.users(id)
url text
title text
description text
content text
content_char_count int GENERATED
site_host text
fetched_at timestamptz
created_at timestamptz
```

### jobs テーブル
```sql
id uuid PRIMARY KEY
user_id uuid REFERENCES auth.users(id)
url text
status text CHECK (status IN ('queued','running','succeeded','failed'))
error text
started_at timestamptz
finished_at timestamptz
page_id uuid REFERENCES pages(id)
created_at timestamptz
```

### quotas テーブル
```sql
user_id uuid PRIMARY KEY
window_start timestamptz
count int DEFAULT 0
```