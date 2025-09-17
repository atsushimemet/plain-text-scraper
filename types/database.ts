export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          plan: string
          created_at: string
        }
        Insert: {
          user_id: string
          plan?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          plan?: string
          created_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string | null
          description: string | null
          content: string | null
          content_char_count: number | null
          site_host: string | null
          fetched_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title?: string | null
          description?: string | null
          content?: string | null
          site_host?: string | null
          fetched_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string | null
          description?: string | null
          content?: string | null
          site_host?: string | null
          fetched_at?: string | null
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          url: string
          status: 'queued' | 'running' | 'succeeded' | 'failed'
          error: string | null
          started_at: string | null
          finished_at: string | null
          page_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          status: 'queued' | 'running' | 'succeeded' | 'failed'
          error?: string | null
          started_at?: string | null
          finished_at?: string | null
          page_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          status?: 'queued' | 'running' | 'succeeded' | 'failed'
          error?: string | null
          started_at?: string | null
          finished_at?: string | null
          page_id?: string | null
          created_at?: string
        }
      }
      quotas: {
        Row: {
          user_id: string
          window_start: string
          count: number
        }
        Insert: {
          user_id: string
          window_start: string
          count?: number
        }
        Update: {
          user_id?: string
          window_start?: string
          count?: number
        }
      }
    }
  }
}