import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ heroImageUrl: null })
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_image_url')
      .single()
    if (error) return NextResponse.json({ heroImageUrl: null })
    return NextResponse.json({ heroImageUrl: data?.value ?? null })
  } catch {
    return NextResponse.json({ heroImageUrl: null })
  }
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 })
  }
  try {
    const formData = await request.formData()
    const file = formData.get('image')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large (max 5MB)' }, { status: 400 })
    }
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `hero/${timestamp}-${sanitizedName}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(storagePath, fileBuffer, { contentType: file.type, upsert: false })
    if (uploadError) {
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })
    }
    const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(storagePath)
    const publicUrl = urlData?.publicUrl
    if (!publicUrl) {
      return NextResponse.json({ success: false, error: 'Failed to get public URL' }, { status: 500 })
    }
    const { error: upsertError } = await supabase
      .from('site_settings')
      .upsert({ key: 'hero_image_url', value: publicUrl }, { onConflict: 'key' })
    if (upsertError) {
      return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, heroImageUrl: publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
