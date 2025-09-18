# Plain Text Scraper ドキュメント

Plain Text Scraperプロジェクトの包括的なドキュメント集です。

## 📚 ドキュメント一覧

### 🚀 はじめに
- [プロジェクト概要](./README.md) - プロジェクトの目的・背景・仕様
- [セットアップガイド](./setup/SETUP.md) - 開発環境構築手順

### 🏗️ 設計・アーキテクチャ
- [システムアーキテクチャ](./architecture/README.md) - 全体設計とデータフロー
- [データベーススキーマ](./architecture/sql/schema.sql) - テーブル定義とRLS設定

### 💻 開発
- [開発ガイド](./development/README.md) - 開発環境・コーディング規約
- [API仕様書](./api/README.md) - REST API・Edge Function仕様

### 🚀 デプロイメント
- [デプロイガイド](./deployment/README.md) - 本番環境構築・CI/CD

### 💰 運用・コスト
- [Supabase価格体系](./pricing/supabase-edge-functions.md) - Edge Functions料金とコスト試算

### 📋 コンプライアンス
- [サーバー負荷軽減仕様](./compliance/server-load-compliance.md) - 負荷軽減策の詳細仕様
- [技術的コンプライアンス証明](./compliance/technical-compliance.md) - ソースコード付き技術証明

## 🎯 読み方ガイド

### 初回セットアップ時
1. [プロジェクト概要](./README.md) - まずはプロジェクト全体を理解
2. [セットアップガイド](./setup/SETUP.md) - 手順に従って環境構築
3. [開発ガイド](./development/README.md) - 開発フローの確認

### 開発中
1. [API仕様書](./api/README.md) - API実装時の参考
2. [アーキテクチャ](./architecture/README.md) - 設計判断時の参考
3. [開発ガイド](./development/README.md) - コーディング規約の確認

### 本番化準備
1. [デプロイガイド](./deployment/README.md) - 本番環境構築
2. [価格体系](./pricing/supabase-edge-functions.md) - コスト見積もり
3. [コンプライアンス](./compliance/) - 負荷軽減・技術証明

## 📖 ドキュメント構造

```
docs/
├── INDEX.md                    # このファイル
├── README.md                   # プロジェクト概要
├── setup/                      # セットアップ関連
│   └── SETUP.md               # 環境構築手順
├── architecture/               # アーキテクチャ設計
│   ├── README.md              # システム設計
│   └── sql/                   # データベース
│       └── schema.sql         # スキーマ定義
├── development/                # 開発ガイド
│   └── README.md              # 開発環境・規約
├── api/                       # API仕様
│   └── README.md              # REST API・Edge Function
├── deployment/                 # デプロイメント
│   └── README.md              # 本番環境構築
├── pricing/                   # 価格・コスト
│   └── supabase-edge-functions.md
└── compliance/                # コンプライアンス証明
    ├── server-load-compliance.md   # 負荷軽減仕様
    └── technical-compliance.md     # 技術証明書
```

## 🔧 技術スタック概要

| 分野 | 技術 | 用途 |
|------|------|------|
| フロントエンド | Next.js 14 | App Router、Server Components |
| スタイリング | Tailwind CSS | レスポンシブデザイン |
| 言語 | TypeScript | 型安全性 |
| 認証 | Supabase Auth | JWT認証 |
| データベース | PostgreSQL | Supabase managed |
| バックエンド | Edge Functions | サーバーレス（Deno） |
| ホスティング | Vercel | フロントエンド |
| BaaS | Supabase | バックエンドサービス |

## 🎯 プロジェクト目標

### MVP機能（✅ 実装完了）
- ✅ URL入力によるテキスト抽出
- ✅ ユーザー認証・管理
- ✅ ジョブ進行状況表示
- ✅ 結果表示・コピー機能
- ✅ Rate limiting（1分5回）
- ✅ robots.txt遵守

### Phase 2（将来的拡張）
- 🔲 バッチ処理（複数URL同時処理）
- 🔲 スケジューリング機能
- 🔲 Webhook通知
- 🔲 キャッシュ機能

### Phase 3（企業機能）
- 🔲 API キー管理
- 🔲 チーム機能
- 🔲 使用量分析
- 🔲 SLA保証

## 🚦 ステータス

| 機能分野 | 状態 | 完成度 |
|----------|------|--------|
| 認証システム | ✅ 完了 | 100% |
| UI/UX | ✅ 完了 | 100% |
| API Routes | ✅ 完了 | 100% |
| Edge Functions | ✅ 完了 | 100% |
| データベース | ✅ 完了 | 100% |
| デプロイメント | ✅ 完了 | 100% |
| ドキュメント | ✅ 完了 | 100% |

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します：

1. **ドキュメント改善**: typo修正、内容追加
2. **機能追加**: 新機能の提案・実装
3. **バグ修正**: 問題の報告・修正
4. **パフォーマンス改善**: 最適化提案

### 貢献方法
1. Issues で問題を報告
2. Fork & Pull Request
3. [開発ガイド](./development/README.md) に従って開発

## 📞 サポート

### 質問・相談
- GitHub Issues
- プロジェクトメンテナー

### 緊急時
- 本番環境障害時の連絡先
- エスカレーション手順

---

**最終更新**: 2025年9月17日
**バージョン**: 1.0.0
**メンテナー**: プロジェクトチーム