import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 })
    }

    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Page fetch error:', error)
      return NextResponse.json({ error: 'ページが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Page API error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}