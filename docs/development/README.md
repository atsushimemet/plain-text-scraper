# 開発ガイド

Plain Text Scraperの開発環境セットアップと開発フローについて説明します。

## 🛠️ 開発環境セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Git
- VS Code（推奨）

### 初期セットアップ

```bash
# リポジトリクローン
git clone https://github.com/your-username/plain-text-scraper.git
cd plain-text-scraper

# 依存関係インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# .env.localを編集
```

### VS Code拡張機能（推奨）

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "supabase.supabase-vscode",
    "vercel.turbo-vscode"
  ]
}
```

## 🏗️ プロジェクト構造

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── scrape/        # スクレイピングAPI
│   │   ├── jobs/          # ジョブ管理API
│   │   └── pages/         # ページ管理API
│   ├── auth/              # 認証関連ページ
│   │   ├── login/         # ログインページ
│   │   └── signup/        # サインアップページ
│   ├── dashboard/         # メインアプリケーション
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ランディングページ
├── docs/                  # ドキュメント
├── lib/                   # 共通ライブラリ
│   └── supabase.ts        # Supabaseクライアント
├── types/                 # TypeScript型定義
│   └── database.ts        # データベース型
├── supabase/             # Supabase設定
│   ├── functions/        # Edge Functions
│   ├── migrations/       # マイグレーション
│   └── config.toml       # Supabase設定
└── utils/                # ユーティリティ関数
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# Lint実行
npm run lint

# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 📂 コンポーネント設計

### ディレクトリ構造（将来的な拡張）

```
components/
├── ui/                    # 再利用可能なUIコンポーネント
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── forms/                 # フォーム関連
│   └── UrlInput.tsx
├── layout/                # レイアウト関連
│   └── Navigation.tsx
└── features/              # 機能別コンポーネント
    ├── auth/
    ├── scraping/
    └── results/
```

### コンポーネント命名規則

- PascalCase: `UrlInputForm.tsx`
- props interface: `UrlInputFormProps`
- ファイル名 = export名

## 🎨 スタイリング

### Tailwind CSS

```tsx
// 良い例：意味的なクラス名
<button className="btn-primary">
  送信
</button>

// カスタムクラスを globals.css で定義
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded;
}
```

### レスポンシブデザイン

```tsx
<div className="
  w-full
  max-w-md mx-auto
  bg-white
  rounded-lg shadow-md
  p-6
  sm:max-w-lg
  lg:max-w-xl
">
```

## 🗃️ データベース開発

### マイグレーション作成

```bash
# 新しいマイグレーション作成
supabase migration new add_new_table

# マイグレーション適用（ローカル）
supabase db reset

# リモートに適用
supabase db push
```

### 型生成

```bash
# データベース型を自動生成
supabase gen types typescript --local > types/database.ts
```

### ローカル開発

```bash
# Supabaseローカル起動
supabase start

# Supabase停止
supabase stop

# ステータス確認
supabase status
```

## ⚡ Edge Functions開発

### ローカルテスト

```bash
# 関数をローカルで実行
supabase functions serve scrape_page

# 別ターミナルでテスト
curl -X POST 'http://localhost:54321/functions/v1/scrape_page' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'
```

### デバッグ

```typescript
// Edge Function内でのログ出力
console.log('Debug info:', { url, jobId })
console.error('Error occurred:', error)
```

### デプロイ

```bash
# 関数デプロイ
supabase functions deploy scrape_page

# ログ確認
supabase functions logs scrape_page
```

## 🧪 テスト

### 単体テスト（将来的な拡張）

```bash
# Jest セットアップ
npm install -D jest @testing-library/react @testing-library/jest-dom

# テスト実行
npm test
```

### E2Eテスト（将来的な拡張）

```bash
# Playwright セットアップ
npm install -D @playwright/test

# E2Eテスト実行
npm run test:e2e
```

## 🔍 デバッグ

### フロントエンド

```tsx
// React Developer Tools使用
console.log('State:', state)

// Network タブでAPI確認
// Console タブでエラー確認
```

### バックエンド

```bash
# Supabase ログ
supabase logs

# Edge Function ログ
supabase functions logs scrape_page

# データベースログ
supabase db logs
```

## 📋 開発フロー

### 1. 機能開発

```bash
# feature ブランチ作成
git checkout -b feature/new-feature

# 開発
# コード実装
# テスト

# コミット
git add .
git commit -m "feat: add new feature"

# プッシュ
git push origin feature/new-feature
```

### 2. プルリクエスト

1. GitHub でPR作成
2. コードレビュー
3. CI/CD パス確認
4. マージ

### 3. デプロイ

- `main` ブランチへのマージで自動デプロイ
- Vercel Preview でプレビュー確認

## 🔧 環境変数

### 開発環境（.env.local）

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

### 本番環境

Vercel Dashboard で設定

## 📝 コーディング規約

### TypeScript

```typescript
// 型定義は明示的に
interface UserProps {
  id: string
  name: string
  email: string
}

// 関数型定義
const fetchUser = async (id: string): Promise<User> => {
  // implementation
}
```

### React

```tsx
// Props型定義
interface ComponentProps {
  title: string
  onSubmit: (data: FormData) => void
}

// 関数コンポーネント
export default function Component({ title, onSubmit }: ComponentProps) {
  return <div>{title}</div>
}
```

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // implementation
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 🚀 パフォーマンス最適化

### 画像最適化

```tsx
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority
/>
```

### 動的インポート

```tsx
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

### メモ化

```tsx
import { useMemo, useCallback } from 'react'

const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

const handleClick = useCallback(() => {
  // handle click
}, [dependency])
```

## 🔐 セキュリティ

### 認証チェック

```typescript
// サーバーサイド
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// クライアントサイド
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  router.push('/auth/login')
  return
}
```

### 入力検証

```typescript
const schema = z.object({
  url: z.string().url('Valid URL required'),
})

const result = schema.safeParse(input)
if (!result.success) {
  return { error: 'Invalid input' }
}
```

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)