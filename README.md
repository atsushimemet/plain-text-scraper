# Plain Text Scraper

Webサイトからプレーンテキストを抽出するMVPアプリケーション

## 🚀 プロジェクト概要

Plain Text Scraperは、入力されたURLからプレーンテキストのみを抽出し、UI上に表示・コピーできる最小プロダクトです。SNSポスト用のインプットデータ作成を目的としています。

## ✨ 主な機能

- 🔐 ユーザー認証（Supabase Auth）
- 🌐 URL入力によるテキスト抽出
- ⚡ リアルタイムジョブ進行状況表示
- 📋 ワンクリックコピー機能
- 🚦 レート制限（1分間5回）
- 🤖 robots.txt準拠

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (Auth + Database + Edge Functions)
- **データベース**: PostgreSQL with Row Level Security
- **抽出エンジン**: Supabase Edge Functions (Deno runtime)
- **デプロイ**: Vercel + Supabase

## 📚 ドキュメント

- [セットアップガイド](./docs/setup/SETUP.md)
- [プロジェクト仕様書](./docs/README.md)
- [アーキテクチャ](./docs/architecture/)
- [価格体系](./docs/pricing/)
- [API仕様](./docs/api/)
- [デプロイメント](./docs/deployment/)

## 🏃‍♂️ クイックスタート

### 1. 環境設定

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# .env.localを編集してSupabaseの情報を設定
```

### 2. Supabaseセットアップ

```bash
# Supabaseにログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref your-project-ref

# データベーススキーマ適用
supabase db push

# Edge Function デプロイ
supabase functions deploy scrape_page
```

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセス

## 🏗️ プロジェクト構成

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 認証ページ
│   ├── dashboard/         # メインアプリ
│   └── page.tsx           # ランディング
├── docs/                  # プロジェクトドキュメント
│   ├── setup/            # セットアップガイド
│   ├── architecture/     # アーキテクチャ
│   ├── pricing/          # 価格体系
│   └── api/              # API仕様
├── lib/                   # ライブラリ
├── types/                 # 型定義
├── supabase/             # Supabase設定
│   ├── functions/        # Edge Functions
│   └── migrations/       # DBマイグレーション
└── utils/                # ユーティリティ
```

## 📋 ユースケース

1. **ニュースサイトのスクレイピング** → プレーンテキスト取得
2. **ChatGPTへの入力準備** → 要約生成
3. **SNS投稿** → Twitterでのシェア

## 🔒 セキュリティ

- Row Level Security (RLS) 有効
- 認証必須のAPI
- レート制限実装
- robots.txt準拠
- CORS対応

## 💰 コスト構造

- **開発**: Freeプラン（月50万回まで無料）
- **本番**: Proプラン（月200万回 + $25）
- **超過**: $2 per 100万回

詳細は [価格体系ドキュメント](./docs/pricing/supabase-edge-functions.md) を参照

## 🤝 コントリビューション

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 ライセンス

This project is licensed under the MIT License.

## 🆘 サポート

問題やご質問は [Issues](https://github.com/your-username/plain-text-scraper/issues) からお気軽にどうぞ。

---

**Generated with ❤️ for efficient content creation**