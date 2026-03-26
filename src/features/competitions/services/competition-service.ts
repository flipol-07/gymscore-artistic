import { createClient } from '@/lib/supabase/client'
import type { 
  Competition, 
  Category, 
  Promotion, 
  CompetitionSession, 
  RankingEntry, 
  Apparatus,
  ApparatusScore,
  GymnastHistory
} from '../types'

const supabase = createClient()

export async function getCompetitions(): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select(`
      *,
      promotions (count)
    `)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching competitions:', error)
    return []
  }

  return data.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    location: c.location,
    date: c.date,
    status: c.status as any,
    programUrl: c.program_url,
    categoryCount: c.promotions[0]?.count || 0
  }))
}

export async function getCompetitionBySlug(slug: string): Promise<Competition | null> {
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
    programUrl: data.program_url,
    categoryCount: data.promotions[0]?.count || 0
  }
}

export async function getSessions(competitionId: string): Promise<CompetitionSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('competition_id', competitionId)
    .order('ord', { ascending: true })

  if (error) return []
  return data.map(s => ({
    id: s.id,
    competitionId: s.competition_id,
    name: s.name,
    date: s.date || '', // date is in competition but sessions can have it too
    location: s.location,
    order: s.ord
  }))
}

export async function getPromotions(sessionId: string): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('session_id', sessionId)
    .order('name', { ascending: true })

  if (error) return []
  return data.map(p => ({
    id: p.id,
    sessionId: p.session_id,
    competitionId: p.competition_id,
    categoryId: p.remote_id || p.id, 
    name: p.name,
    gender: p.gender as any,
    gymnast_count: p.gymnast_count,
    status: p.status as any
  }))
}

export async function getPromotionById(promotionId: string): Promise<Promotion | null> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', promotionId)
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    sessionId: data.session_id,
    competitionId: data.competition_id,
    categoryId: data.remote_id || data.id,
    name: data.name,
    gender: data.gender as any,
    gymnast_count: data.gymnast_count,
    status: data.status as any
  }
}

export async function getRankings(promotionId: string): Promise<RankingEntry[]> {
  const { data, error } = await supabase
    .from('inscriptions')
    .select(`
      id,
      gymnasts (full_name),
      clubs (name, flag_url),
      scores (apparatus, score)
    `)
    .eq('promotion_id', promotionId)

  if (error || !data) return []

  const entries: RankingEntry[] = data.map((ins: any) => {
    const scores = ins.scores || []
    const vault = scores.find((s: any) => s.apparatus === 'vault')?.score || 0
    const bars = scores.find((s: any) => s.apparatus === 'bars')?.score || 0
    const beam = scores.find((s: any) => s.apparatus === 'beam')?.score || 0
    const floor = scores.find((s: any) => s.apparatus === 'floor')?.score || 0
    const total = parseFloat(vault) + parseFloat(bars) + parseFloat(beam) + parseFloat(floor)

    return {
      position: 0,
      inscriptionId: ins.id,
      gymnastName: ins.gymnasts.full_name,
      clubName: ins.clubs.name,
      clubFlag: ins.clubs.flag_url,
      vaultScore: parseFloat(vault),
      barsScore: parseFloat(bars),
      beamScore: parseFloat(beam),
      floorScore: parseFloat(floor),
      totalScore: total
    }
  })

  entries.sort((a, b) => b.totalScore - a.totalScore)
  entries.forEach((e, i) => { e.position = i + 1 })
  return entries
}

export async function updateScore(inscriptionId: string, apparatus: Apparatus, score: number) {
  const { error } = await supabase
    .from('scores')
    .upsert({
      inscription_id: inscriptionId,
      apparatus,
      score: score
    }, { onConflict: 'inscription_id,apparatus' })

  return { success: !error, error }
}

export async function createCompetition(name: string, location: string, date: string) {
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

export async function inviteAdmin(email: string, competitionId: string) {
  // 1. Look for existing profile
  const { data: prof } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!prof) {
    return { success: false, error: 'User does not exist. They must sign in once first.' }
  }

  // 2. Link to competition
  const { error } = await supabase
    .from('competition_admins')
    .insert({
      competition_id: competitionId,
      profile_id: prof.id
    })

  return { success: !error, error }
}
