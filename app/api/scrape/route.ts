import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URLが必要です' }, { status: 400 })
    }

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

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: '無効なURLです' }, { status: 400 })
    }

    const now = new Date()
    const windowStart = new Date(now.getTime() - 60000)

    const { data: quota } = await supabaseAdmin
      .from('quotas')
      .select('count')
      .eq('user_id', user.id)
      .gte('window_start', windowStart.toISOString())
      .single()

    const currentCount = quota?.count || 0
    const rateLimit = 5

    if (currentCount >= rateLimit) {
      return NextResponse.json(
        { error: 'レート制限に達しました。1分後に再試行してください。' },
        { status: 429 }
      )
    }

    await supabaseAdmin
      .from('quotas')
      .upsert({
        user_id: user.id,
        window_start: now.toISOString(),
        count: currentCount + 1,
      })

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        user_id: user.id,
        url,
        status: 'queued',
      })
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      return NextResponse.json({ error: 'ジョブの作成に失敗しました' }, { status: 500 })
    }

    try {
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/scrape_page`
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          job_id: job.id,
          user_id: user.id,
          url,
        }),
      })

      if (!response.ok) {
        console.error('Edge function call failed:', response.status, await response.text())
        await supabaseAdmin
          .from('jobs')
          .update({
            status: 'failed',
            error: 'Edge Function呼び出しに失敗しました',
            finished_at: new Date().toISOString(),
          })
          .eq('id', job.id)
      }
    } catch (error) {
      console.error('Edge function call error:', error)
      await supabaseAdmin
        .from('jobs')
        .update({
          status: 'failed',
          error: 'Edge Function呼び出しエラー',
          finished_at: new Date().toISOString(),
        })
        .eq('id', job.id)
    }

    return NextResponse.json({ jobId: job.id })
  } catch (error) {
    console.error('Scrape API error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}