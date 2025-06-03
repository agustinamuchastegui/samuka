import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL recibida:', supabaseUrl)
console.log('Key recibida:', supabaseKey)

export const supabase = createClient(supabaseUrl, supabaseKey)

// Obtener datos del deportista
export async function getAthleteData(athleteCode) {
  try {
    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .select('*')
      .eq('code', athleteCode)
      .single()
    if (athleteError || !athlete) return null
    const { data: checkins } = await supabase
      .from('checkins')
      .select('*')
      .eq('athlete_id', athlete.id)
      .order('date', { ascending: true })
    return { athlete, checkins: checkins || [] }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

// Guardar check-in
export async function saveCheckin(athleteId, energy, mood) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('checkins')
      .upsert({
        athlete_id: athleteId,
        date: today,
        energy,
        mood,
        timestamp: new Date().toISOString()
      }, {
        onConflict: 'athlete_id,date'
      })
      .select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Obtener todos los deportistas (admin)
export async function getAllAthletes() {
  try {
    const { data: athletes } = await supabase
      .from('athletes')
      .select(`
        *,
        checkins (
          date,
          energy,
          mood,
          timestamp
        )
      `)
      .eq('active', true)
      .order('name')
    return athletes?.map(athlete => ({
      ...athlete,
      checkins: athlete.checkins.sort((a, b) => new Date(a.date) - new Date(b.date))
    })) || []
  } catch (error) {
    return []
  }
}
