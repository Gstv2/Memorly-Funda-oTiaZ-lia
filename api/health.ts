// api/health.ts
import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler() {
  try {
    // Faz uma consulta leve para manter o banco de dados acordado
    const { data, error } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Supabase check passed', 
        timestamp: new Date().toISOString() 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    )
  } catch (error) {
    console.error('Health check error:', error)
    return new Response(
      JSON.stringify({ status: 'error', message: 'Failed to check Supabase' }),
      { status: 500 }
    )
  }
}
