import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapeRequest {
  job_id: string
  user_id: string
  url: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { job_id, user_id, url }: ScrapeRequest = await req.json()

    if (!job_id || !user_id || !url) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
      .from('jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', job_id)

    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname

      const robotsTxt = await fetchRobotsTxt(hostname)
      if (!isAllowed(robotsTxt, urlObj.pathname)) {
        throw new Error('robots.txt で拒否されています')
      }

      const html = await fetchHtml(url)
      const { title, description, content } = extractContent(html)

      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          user_id,
          url,
          title,
          description,
          content,
          site_host: hostname,
          fetched_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (pageError) {
        console.error('Page insert error:', pageError)
        throw new Error('ページの保存に失敗しました')
      }

      await supabase
        .from('jobs')
        .update({
          status: 'succeeded',
          finished_at: new Date().toISOString(),
          page_id: page.id,
        })
        .eq('id', job_id)

      return new Response(
        JSON.stringify({ success: true, page_id: page.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Scraping error:', error)

      await supabase
        .from('jobs')
        .update({
          status: 'failed',
          error: error.message,
          finished_at: new Date().toISOString(),
        })
        .eq('id', job_id)

      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function fetchRobotsTxt(hostname: string): Promise<string> {
  try {
    const response = await fetch(`https://${hostname}/robots.txt`, {
      headers: {
        'User-Agent': 'PlainTextScraper/1.0 (+https://plain-text-scraper.com)',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      return await response.text()
    }
  } catch {
    // robots.txt が取得できない場合は許可とみなす
  }
  return ''
}

function isAllowed(robotsTxt: string, path: string): boolean {
  if (!robotsTxt) return true

  const lines = robotsTxt.split('\n')
  let userAgentMatch = false

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()

    if (trimmed.startsWith('user-agent:')) {
      const agent = trimmed.substring(11).trim()
      userAgentMatch = agent === '*' || agent === 'plaintextscraper'
    }

    if (userAgentMatch && trimmed.startsWith('disallow:')) {
      const disallowPath = trimmed.substring(9).trim()
      if (disallowPath === '/' || path.startsWith(disallowPath)) {
        return false
      }
    }
  }

  return true
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PlainTextScraper/1.0 (+https://plain-text-scraper.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      throw new Error('HTMLコンテンツではありません')
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 3 * 1024 * 1024) {
      throw new Error('ファイルサイズが制限を超えています')
    }

    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

function extractContent(html: string): { title: string, description: string, content: string } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const title = doc.querySelector('title')?.textContent?.trim() || ''

  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                         doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || ''

  let content = ''

  const article = doc.querySelector('article')
  const main = doc.querySelector('main')

  if (article) {
    content = extractTextFromElement(article)
  } else if (main) {
    content = extractTextFromElement(main)
  } else {
    const contentSelectors = [
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '#main-content'
    ]

    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector)
      if (element) {
        content = extractTextFromElement(element)
        break
      }
    }

    if (!content) {
      const paragraphs = Array.from(doc.querySelectorAll('p'))
        .filter(p => p.textContent && p.textContent.trim().length > 50)
        .slice(0, 20)

      content = paragraphs.map(p => p.textContent?.trim() || '').join('\n\n')
    }
  }

  content = normalizeText(content)

  return {
    title: normalizeText(title),
    description: normalizeText(metaDescription),
    content: content.substring(0, 50000)
  }
}

function extractTextFromElement(element: Element): string {
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    '.advertisement', '.ads', '.social-share', '.comments',
    '.sidebar', '.menu', '.navigation'
  ]

  const clone = element.cloneNode(true) as Element

  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove())
  })

  return clone.textContent || ''
}

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}