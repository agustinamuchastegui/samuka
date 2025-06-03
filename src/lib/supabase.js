import { createClient } from '@supabase/supabase-js'

console.log('🚀 USANDO CÓDIGO NUEVO - HARDCODEADO!')
console.log('URL:', 'https://idewyvicooatumnyzzjy.supabase.co')

onst supabaseUrl = 'https://idewyuicooatummvzziy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXd5dmljb29hdHVtbnl6emlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNTIyNTAsImV4cCI6MjA0ODcyODI1MH0.JpMOmkIJsLJZaJxbHJ8x6qwcCfJSo6xJOQ1WShz4VwA'

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
