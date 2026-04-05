import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null

export type SiteContent = {
  [key: string]: string | null
}

export type SectionContent = SiteContent

export type SiteContentJson = {
  [key: string]: any
}

export async function getSectionContent(section: string): Promise<SiteContent> {
  if (!supabase) return {}
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value')
    .eq('section', section)
    .eq('active', true)
    .order('order_index', { ascending: true })
  if (error || !data) return {}
  const content: SiteContent = {}
  data.forEach((item) => { content[item.key] = item.value })
  return content
}

export async function getSectionContentWithJson(section: string): Promise<{
  content: SiteContent
  jsonContent: SiteContentJson
}> {
  if (!supabase) return { content: {}, jsonContent: {} }
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value, value_json')
    .eq('section', section)
    .eq('active', true)
    .order('order_index', { ascending: true })
  if (error || !data) return { content: {}, jsonContent: {} }
  const content: SiteContent = {}
  const jsonContent: SiteContentJson = {}
  data.forEach((item) => {
    content[item.key] = item.value
    if (item.value_json) jsonContent[item.key] = item.value_json
  })
  return { content, jsonContent }
}

export async function getMultipleSections(sections: string[]): Promise<{
  [section: string]: SiteContent
}> {
  if (!supabase) return {}
  const { data, error } = await supabase
    .from('site_content')
    .select('section, key, value')
    .in('section', sections)
    .eq('active', true)
    .order('order_index', { ascending: true })
  if (error || !data) return {}
  const result: { [section: string]: SiteContent } = {}
  data.forEach((item) => {
    if (!result[item.section]) result[item.section] = {}
    result[item.section][item.key] = item.value
  })
  return result
}
