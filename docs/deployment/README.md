# デプロイメントガイド

Plain Text Scraperの本番環境デプロイメント手順について説明します。

## 🎯 デプロイメント概要

- **フロントエンド**: Vercel
- **バックエンド**: Supabase
- **Edge Functions**: Supabase Edge Runtime
- **データベース**: Supabase PostgreSQL

## 📋 前提条件

- [Vercel](https://vercel.com) アカウント
- [Supabase](https://supabase.com) アカウント
- GitHub リポジトリ
- ドメイン（オプション）

## 🚀 Supabase セットアップ

### 1. プロジェクト作成

```bash
# Supabase CLI でプロジェクト作成
supabase projects create plain-text-scraper-prod

# プロジェクトにリンク
supabase link --project-ref <YOUR_PROJECT_REF>
```

### 2. データベーススキーマ デプロイ

```bash
# マイグレーションを本番に適用
supabase db push

# 適用状況確認
supabase migration list
```

### 3. Edge Functions デプロイ

```bash
# scrape_page 関数をデプロイ
supabase functions deploy scrape_page

# デプロイ確認
supabase functions list
```

### 4. 環境変数取得

Supabaseダッシュボードから以下の情報を取得：

- Project URL: `https://xxx.supabase.co`
- Anon Key: `eyJhb...`
- Service Role Key: `eyJhb...`

## 🌐 Vercel デプロイ

### 1. GitHub連携

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. "New Project" をクリック
3. GitHubリポジトリを選択
4. Import

### 2. 環境変数設定

Vercel Dashboard > Settings > Environment Variables で設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
```

### 3. ビルド設定

`vercel.json` を作成（オプション）：

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  }
}
```

### 4. デプロイ実行

```bash
# CLI経由でデプロイ（オプション）
npx vercel --prod

# または GitHub push で自動デプロイ
git push origin main
```

## 🔧 本番環境設定

### Auth設定更新

Supabase Dashboard > Authentication > Settings で本番URLを追加：

```
Site URL: https://your-domain.vercel.app
Additional Redirect URLs: https://your-domain.vercel.app
```

### CORS設定

必要に応じてSupabase Dashboard > API > CORS で設定更新

### セキュリティ設定

1. **RLS有効確認**
   ```sql
   -- すべてのテーブルでRLSが有効か確認
   SELECT schemaname, tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

2. **API Key ローテーション**
   - 定期的にAPI Keyを更新
   - 古いキーの無効化

## 📊 監視・アラート

### 1. Vercel Analytics

```bash
# Vercel Analytics有効化
npx @vercel/analytics
```

### 2. Supabase監視

- Dashboard > Overview で使用量監視
- Function Logs で Edge Function監視
- Database > Logs でSQL監視

### 3. アラート設定

- 使用量が80%に達したらSlack通知
- エラー率が5%を超えたらメール通知
- レスポンス時間が5秒を超えたらアラート

## 🚨 トラブルシューティング

### よくある問題

#### 1. Environment Variables エラー
```bash
# 環境変数が正しく設定されているか確認
vercel env ls
```

#### 2. Edge Function タイムアウト
```bash
# Function logs確認
supabase functions logs scrape_page
```

#### 3. Database接続エラー
```bash
# 接続テスト
supabase db ping
```

#### 4. CORS エラー
- Supabase Dashboard > API > CORS設定確認
- Next.js middleware でCORSヘッダー追加

### デバッグコマンド

```bash
# Vercel ログ確認
vercel logs

# Supabase ログ確認
supabase logs

# ローカルで本番環境テスト
vercel dev
```

## 🔄 CI/CD パイプライン

### GitHub Actions例

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 スケーリング

### 水平スケーリング

- Vercel: 自動スケーリング
- Supabase: Pro/Team プランでスケーリング

### パフォーマンス最適化

1. **CDN活用**
   - 静的アセットをVercel CDNで配信
   - 画像最適化

2. **データベース最適化**
   - インデックス追加
   - クエリ最適化

3. **キャッシュ戦略**
   - Redis追加（将来）
   - Application-level caching

## 💰 コスト最適化

### Vercel
- Pro プラン: $20/month
- 帯域制限監視

### Supabase
- Pro プラン: $25/month
- Function invocation監視
- Database storage監視

## 🔐 セキュリティチェックリスト

- [ ] RLS有効
- [ ] API Key定期ローテーション
- [ ] HTTPS強制
- [ ] CORS適切設定
- [ ] Rate Limiting有効
- [ ] Secret管理適切
- [ ] 監査ログ有効

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)