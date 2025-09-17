'use client'

import { createClient } from '@supabase/supabase-js'

// クライアントサイド専用のSupabaseクライアント
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Environment check:', {
    url: supabaseUrl ? 'Available' : 'Missing',
    key: supabaseAnonKey ? 'Available' : 'Missing',
    urlValue: supabaseUrl,
    keyValue: supabaseAnonKey?.substring(0, 20) + '...'
  })

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in environment variables')
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
}

export const supabaseClient = createSupabaseClient()