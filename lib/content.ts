import { createClient } from "@/lib/supabase/server"

export type SiteContent = {
  [key: string]: string | null
}

export type SiteContentJson = {
  [key: string]: any
}

/**
 * Fetch content for a specific section from Supabase
 * Use this in Server Components to get dynamic content
 */
export async function getSectionContent(section: string): Promise<SiteContent> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value')
    .eq('section', section)
    .eq('active', true)
    .order('order_index', { ascending: true })
  
  if (error || !data) {
    console.error(`Error fetching content for section ${section}:`, error)
    return {}
  }
  
  // Convert array to object for easier access
  const content: SiteContent = {}
  data.forEach((item) => {
    content[item.key] = item.value
  })
  
  return content
}

/**
 * Fetch content with JSON values for complex data
 */
export async function getSectionContentWithJson(section: string): Promise<{
  content: SiteContent
  jsonContent: SiteContentJson
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value, value_json')
    .eq('section', section)
    .eq('active', true)
    .order('order_index', { ascending: true })
  
  if (error || !data) {
    console.error(`Error fetching content for section ${section}:`, error)
    return { content: {}, jsonContent: {} }
  }
  
  const content: SiteContent = {}
  const jsonContent: SiteContentJson = {}
  
  data.forEach((item) => {
    content[item.key] = item.value
    if (item.value_json) {
      jsonContent[item.key] = item.value_json
    }
  })
  
  return { content, jsonContent }
}

/**
 * Fetch multiple sections at once
 */
export async function getMultipleSections(sections: string[]): Promise<{
  [section: string]: SiteContent
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_content')
    .select('section, key, value')
    .in('section', sections)
    .eq('active', true)
    .order('order_index', { ascending: true })
  
  if (error || !data) {
    console.error(`Error fetching content for sections:`, error)
    return {}
  }
  
  const result: { [section: string]: SiteContent } = {}
  
  data.forEach((item) => {
    if (!result[item.section]) {
      result[item.section] = {}
    }
    result[item.section][item.key] = item.value
  })
  
  return result
}

// Default content fallbacks (used when database is empty or unavailable)
export const defaultContent = {
  hero: {
    title: "Reseau des Techniciens du Cinema en Cote d'Ivoire",
    subtitle: "Unissons nos talents pour faire rayonner le cinema ivoirien",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop",
    cta_primary_text: "Rejoindre le reseau",
    cta_primary_link: "/adhesion",
    cta_secondary_text: "Decouvrir nos membres",
    cta_secondary_link: "/annuaire",
    stat_members: "500+",
    stat_members_label: "Techniciens",
    stat_productions: "150+",
    stat_productions_label: "Productions",
    stat_experience: "25+",
    stat_experience_label: "Annees"
  },
  about: {
    title: "A Propos du RETECHCI",
    subtitle: "Une organisation professionnelle au service du cinema ivoirien",
    description: "Le RETECHCI est une organisation professionnelle qui regroupe les techniciens du cinema ivoirien."
  },
  sitech: {
    title: "SITECH 2027",
    subtitle: "Salon International des Techniciens du Cinema",
    description: "Le plus grand rassemblement des professionnels techniques du cinema en Afrique de l'Ouest.",
    date: "15-20 Mars 2027",
    location: "Abidjan, Cote d'Ivoire"
  }
}
