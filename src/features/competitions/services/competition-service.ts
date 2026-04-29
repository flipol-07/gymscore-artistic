import { createClient } from '@/lib/supabase/client'
import type { Competition, CompetitionSession, Promotion, RankingEntry, GymnastHistory } from '../types'
import { Apparatus } from '../types'

export async function getCompetitions(onlyPublished = false): Promise<Competition[]> {
  const supabase = createClient()
  let query = supabase
    .from('competitions')
    .select(`
      *,
      promotions (count)
    `)
    
  if (onlyPublished) {
    query = query.eq('is_published', true)
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) {
    console.error('Error fetching competitions:', error)
    return []
  }

  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    location: c.location,
    date: c.date,
    status: c.status as any,
    isPublished: c.is_published,
    adminPassword: c.admin_password,
    programUrl: c.program_url,
    categoryCount: c.promotions[0]?.count || 0
  }))
}

export async function getCompetitionBySlug(slug: string): Promise<Competition | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('competitions')
    .select(`
      *,
      promotions (count)
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    location: data.location,
    date: data.date,
    status: data.status as any,
    isPublished: data.is_published,
    adminPassword: data.admin_password,
    programUrl: data.program_url,
    categoryCount: data.promotions[0]?.count || 0
  }
}

export async function getSessions(competitionId: string): Promise<CompetitionSession[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('competition_id', competitionId)
    .order('ord', { ascending: true })

  if (error) return []
  return data.map((s: any) => ({
    id: s.id,
    competitionId: s.competition_id,
    name: s.name,
    date: s.date,
    location: s.location,
    order: s.ord
  }))
}

export async function getPromotions(sessionId: string): Promise<Promotion[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('session_id', sessionId)
    .order('name', { ascending: true })

  if (error) return []
  return data.map((p: any) => ({
    id: p.id,
    sessionId: p.session_id,
    competitionId: p.competition_id,
    categoryId: p.category_id,
    name: p.name,
    gender: p.gender as any,
    gymnast_count: p.gymnast_count,
    status: p.status as any
  }))
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    sessionId: data.session_id,
    competitionId: data.competition_id,
    categoryId: data.category_id,
    name: data.name,
    gender: data.gender as any,
    gymnast_count: data.gymnast_count,
    status: data.status as any
  }
}

export async function getRankings(promotionId: string): Promise<RankingEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inscriptions')
    .select(`
      id,
      gymnasts (full_name),
      clubs (name, flag_url),
      scores (apparatus, score, d_score, e_score)
    `)
    .eq('promotion_id', promotionId)

  if (error) {
    console.error('getRankings error:', error)
    return []
  }
  if (!data) return []

  const entries: RankingEntry[] = data.map((ins: any) => {
    const scores = ins.scores || []
    const getScore = (app: string) => {
      const val = scores.find((s: any) => s.apparatus === app)?.score
      return val != null ? parseFloat(val) : 0
    }
    const getD = (app: string) => {
      const val = scores.find((s: any) => s.apparatus === app)?.d_score
      return val != null ? parseFloat(val) : 0
    }
    const getE = (app: string) => {
      const val = scores.find((s: any) => s.apparatus === app)?.e_score
      return val != null ? parseFloat(val) : 0
    }
    const vault = getScore('vault')
    const bars = getScore('bars')
    const beam = getScore('beam')
    const floor = getScore('floor')
    const pommel = getScore('pommel')
    const rings = getScore('rings')
    const p_bars = getScore('p_bars')
    const h_bar = getScore('h_bar')
    const total = vault + bars + beam + floor + pommel + rings + p_bars + h_bar

    return {
      position: 0,
      inscriptionId: ins.id,
      gymnastName: ins.gymnasts?.full_name ?? 'Desconocida',
      clubName: ins.clubs?.name ?? 'Club desconocido',
      clubFlag: ins.clubs?.flag_url ?? undefined,
      vaultScore: vault, barsDScore: getD('bars'), barsEScore: getE('bars'),
      barsScore: bars, vaultDScore: getD('vault'), vaultEScore: getE('vault'),
      beamScore: beam, beamDScore: getD('beam'), beamEScore: getE('beam'),
      floorScore: floor, floorDScore: getD('floor'), floorEScore: getE('floor'),
      pommelScore: pommel, pommelDScore: getD('pommel'), pommelEScore: getE('pommel'),
      ringsScore: rings, ringsDScore: getD('rings'), ringsEScore: getE('rings'),
      p_barsScore: p_bars, p_barsDScore: getD('p_bars'), p_barsEScore: getE('p_bars'),
      h_barScore: h_bar, h_barDScore: getD('h_bar'), h_barEScore: getE('h_bar'),
      totalScore: total
    }
  })

  entries.sort((a, b) => b.totalScore - a.totalScore)
  entries.forEach((e, i) => { e.position = i + 1 })
  return entries
}

export async function getInscriptionsByIds(ids: string[]): Promise<RankingEntry[]> {
  if (ids.length === 0) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inscriptions')
    .select(`
      id,
      gymnasts (full_name),
      clubs (name, flag_url),
      scores (apparatus, score, d_score, e_score),
      promotions (
        id,
        competitions (slug)
      )
    `)
    .in('id', ids)

  if (error || !data) return []

  return data.map((ins: any) => {
    const scores = ins.scores || []
    const getScore = (app: string) => parseFloat(scores.find((s: any) => s.apparatus === app)?.score || 0)
    const getD = (app: string) => parseFloat(scores.find((s: any) => s.apparatus === app)?.d_score || 0)
    const getE = (app: string) => parseFloat(scores.find((s: any) => s.apparatus === app)?.e_score || 0)
    const vault = getScore('vault')
    const bars = getScore('bars')
    const beam = getScore('beam')
    const floor = getScore('floor')
    const pommel = getScore('pommel')
    const rings = getScore('rings')
    const p_bars = getScore('p_bars')
    const h_bar = getScore('h_bar')
    const total = vault + bars + beam + floor + pommel + rings + p_bars + h_bar

    return {
      position: 0,
      inscriptionId: ins.id,
      gymnastName: ins.gymnasts.full_name,
      clubName: ins.clubs.name,
      clubFlag: ins.clubs.flag_url,
      vaultScore: vault, vaultDScore: getD('vault'), vaultEScore: getE('vault'),
      barsScore: bars, barsDScore: getD('bars'), barsEScore: getE('bars'),
      beamScore: beam, beamDScore: getD('beam'), beamEScore: getE('beam'),
      floorScore: floor, floorDScore: getD('floor'), floorEScore: getE('floor'),
      pommelScore: pommel, pommelDScore: getD('pommel'), pommelEScore: getE('pommel'),
      ringsScore: rings, ringsDScore: getD('rings'), ringsEScore: getE('rings'),
      p_barsScore: p_bars, p_barsDScore: getD('p_bars'), p_barsEScore: getE('p_bars'),
      h_barScore: h_bar, h_barDScore: getD('h_bar'), h_barEScore: getE('h_bar'),
      totalScore: total,
      competitionSlug: (ins.promotions as any)?.competitions?.slug,
      categoryId: (ins.promotions as any)?.id
    }
  })
}


export async function getGymnastRealHistory(gymnastName: string): Promise<GymnastHistory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inscriptions')
    .select(`
      id,
      gymnasts!inner(full_name),
      clubs(name),
      scores(apparatus, score),
      promotions!inner(
        id,
        name,
        gender,
        competitions!inner(
          name,
          slug,
          date
        )
      )
    `)
    .eq('gymnasts.full_name', gymnastName)

  if (error || !data) {
    if (error) console.error('Error fetching gymnast history:', error)
    return []
  }

  return data.map((ins: any) => {
    const scores = ins.scores || []
    const getS = (app: string) => parseFloat(scores.find((s: any) => s.apparatus === app)?.score || 0)
    
    const vault = getS('vault')
    const bars = getS('bars')
    const beam = getS('beam')
    const floor = getS('floor')
    const pommel = getS('pommel')
    const rings = getS('rings')
    const p_bars = getS('p_bars')
    const h_bar = getS('h_bar')
    
    return {
      competitionName: ins.promotions?.competitions?.name || 'Desconocida',
      competitionSlug: ins.promotions?.competitions?.slug || '',
      categoryName: ins.promotions?.name || '',
      categoryId: ins.promotions?.id || '',
      date: ins.promotions?.competitions?.date || '',
      clubName: ins.clubs?.name || '',
      gender: ins.promotions?.gender || 'female',
      vaultScore: vault,
      barsScore: bars,
      beamScore: beam,
      floorScore: floor,
      pommelScore: pommel,
      ringsScore: rings,
      p_barsScore: p_bars,
      h_barScore: h_bar,
      totalScore: vault + bars + beam + floor + pommel + rings + p_bars + h_bar
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function updateCompetitionProgramUrl(competitionId: string, url: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('competitions')
    .update({ program_url: url })
    .eq('id', competitionId)

  return { success: !error, error }
}

export async function uploadProgram(competitionId: string, file: File): Promise<{ url: string | null, error: any }> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${competitionId}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('programs')
    .upload(filePath, file)

  if (uploadError) return { url: null, error: uploadError }

  const { data: { publicUrl } } = supabase.storage
    .from('programs')
    .getPublicUrl(filePath)

  return { url: publicUrl, error: null }
}

export async function updateCompetitionVisibility(competitionId: string, isPublished: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('competitions')
    .update({ is_published: isPublished })
    .eq('id', competitionId)

  return { success: !error, error }
}

export async function updateCompetitionStatus(competitionId: string, status: 'draft' | 'active' | 'finished') {
  const supabase = createClient()
  const { error } = await supabase
    .from('competitions')
    .update({ status })
    .eq('id', competitionId)

  return { success: !error, error }
}

export async function updateScore(
  inscriptionId: string,
  apparatus: Apparatus,
  score: number,
  dScore: number = 0,
  eScore: number = 0,
  password?: string
) {
  const supabase = createClient()
  const { error } = await supabase
    .rpc('save_score_with_password', {
      p_inscription_id: inscriptionId,
      p_apparatus: apparatus,
      p_score: score,
      p_d_score: dScore,
      p_e_score: eScore,
      p_password: password
    })

  if (error) console.error('updateScore error:', error)
  return { success: !error, error }
}

export async function createCompetition(name: string, location: string, date: string) {
  const supabase = createClient()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data, error } = await supabase
    .from('competitions')
    .insert({
      name,
      slug,
      location,
      date,
      status: 'draft'
    })
    .select()
    .single()

  return { success: !error, data, error }
}

export async function getCompetitionByPassword(password: string): Promise<{ id: string, name: string, slug: string } | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('get_competition_by_password', { p_password: password })
  
  if (error || !data || data.length === 0) {
    if (error) console.error('Error getting competition by password:', error)
    return null
  }
  return data[0]
}

export async function verifyEventPassword(competitionId: string, password: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('verify_competition_password', { 
      p_competition_id: competitionId, 
      p_password: password 
    })
  
  if (error) {
    console.error('Error verifying password:', error)
    return false
  }
  return !!data
}

export async function updateCompetitionAdminPassword(competitionId: string, password: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('competitions')
    .update({ admin_password: password })
    .eq('id', competitionId)

  return { success: !error, error }
}

export async function searchGymnasts(query: string) {
  if (!query || query.length < 2) return []

  const supabase = createClient()
  
  const formattedQuery = `%${query}%`

  // 1. Buscar por nombre del gimnasta
  const { data: gymData } = await supabase
    .from('gymnasts')
    .select(`
      full_name,
      inscriptions (
        clubs (name)
      )
    `)
    .ilike('full_name', formattedQuery)
    .limit(10)

  // 2. Buscar por nombre del club (usando join desde inscriptions)
  const { data: clubData } = await supabase
    .from('inscriptions')
    .select(`
      gymnasts!inner(full_name),
      clubs!inner(name)
    `)
    .ilike('clubs.name', formattedQuery)
    .limit(20)

  const resultsMap = new Map<string, {name: string, club: string}>()

  // Mapear resultados de nombres de gimnastas
  if (gymData) {
    gymData.forEach((g: any) => {
      const name = g.full_name
      const club = g.inscriptions?.[0]?.clubs?.name || 'Independiente'
      resultsMap.set(name, { name, club })
    })
  }

  // Mapear resultados donde coincide el club
  if (clubData) {
    clubData.forEach((ins: any) => {
      const name = ins.gymnasts?.full_name
      const club = ins.clubs?.name
      if (name && club) {
        if (!resultsMap.has(name)) {
          resultsMap.set(name, { name, club })
        }
      }
    })
  }

  return Array.from(resultsMap.values()).slice(0, 15)
}
