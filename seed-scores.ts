import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  console.log('Iniciando carga de puntuaciones demo...')
  
  // 1. Get all inscriptions
  const { data: inscriptions, error: insErr } = await supabase
    .from('inscriptions')
    .select('id, promotion_id, promotions(gender)')

  if (insErr) throw new Error(insErr.message)
  console.log(`Encontradas ${inscriptions?.length} inscripciones.`)

  for (const ins of inscriptions || []) {
    const gender = (ins.promotions as any).gender
    const apparatusList = gender === 'female' 
      ? ['vault', 'bars', 'beam', 'floor']
      : ['floor', 'pommel', 'rings', 'vault', 'p_bars', 'h_bar']

    for (const app of apparatusList) {
      const scoreValue = 10 + Math.random() * 5 // Random score between 10 and 15
      
      const { error: scoreErr } = await supabase
        .from('scores')
        .upsert({
          inscription_id: ins.id,
          apparatus: app,
          score: parseFloat(scoreValue.toFixed(2))
        }, { onConflict: 'inscription_id,apparatus' })

      if (scoreErr) {
        console.error(`Error insertando nota para ${ins.id} en ${app}:`, scoreErr.message)
      }
    }
  }

  console.log('✅ Puntuaciones demo cargadas con éxito.')
}

run().catch(console.error)
