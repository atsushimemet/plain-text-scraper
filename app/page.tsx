export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Plain Text Scraper
          </h1>
          <p className="text-gray-600 mb-8">
            URLからプレーンテキストを抽出します
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            抽出開始
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            ログインが必要です。
            <a href="/auth/login" className="text-blue-600 hover:text-blue-500 ml-1">
              ログイン
            </a>
            または
            <a href="/auth/signup" className="text-blue-600 hover:text-blue-500 ml-1">
              新規登録
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}