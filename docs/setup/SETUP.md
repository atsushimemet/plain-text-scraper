# Setup Guide

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトのAPIキーとURLを取得

### 3. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、Supabaseの情報を設定：

```bash
cp .env.local.example .env.local
```

`.env.local`を編集：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. データベーススキーマの作成

Supabaseダッシュボードの「SQL Editor」で`sql/schema.sql`の内容を実行してください。

### 5. Edge Functionのデプロイ

SupabaseのCLIをインストール：

```bash
npm install -g supabase
```

Supabaseにログイン：

```bash
supabase login
```

プロジェクトをリンク：

```bash
supabase link --project-ref your-project-ref
```

Edge Functionをデプロイ：

```bash
supabase functions deploy scrape_page
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 機能

- ユーザー登録・ログイン（Supabase Auth）
- URL入力とプレーンテキスト抽出
- 抽出ジョブの進行状況表示
- 抽出結果の表示とコピー機能
- レート制限（1分間に5回まで）
- robots.txt の尊重

## アーキテクチャ

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (Auth + Database + Edge Functions)
- **データベース**: PostgreSQL (Row Level Security有効)
- **抽出エンジン**: Supabase Edge Functions (Deno runtime)

## 主要ファイル構成

```
├── app/
│   ├── api/          # API Routes
│   ├── auth/         # 認証ページ
│   ├── dashboard/    # メインアプリケーション
│   └── page.tsx      # ランディングページ
├── lib/
│   └── supabase.ts   # Supabaseクライアント
├── types/
│   └── database.ts   # 型定義
├── sql/
│   └── schema.sql    # データベーススキーマ
└── supabase/
    └── functions/    # Edge Functions
```

## 本番デプロイ

### Vercelでのデプロイ

1. プロジェクトをGitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

### 環境変数（本番）

本番環境では以下の環境変数を設定してください：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## トラブルシューティング

### Edge Functionのエラー

Edge Functionのログは以下で確認できます：

```bash
supabase functions logs scrape_page
```

### データベース接続エラー

- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトが正常に作成されているか確認
- Row Level Security (RLS) ポリシーが正しく設定されているか確認