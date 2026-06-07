import { supabase } from '../lib/supabase'

function normalizeAdminStamp(row) {
  return {
    id: row.id,
    name: row.name,
    image: row.image_url,
    fallback: row.fallback || '✨',
    location: row.location || 'Admin Created Drop',
    rarity: row.rarity || 'normal',
    xp: row.xp || 500,
    glow: row.rarity === 'legendary' ? 'legendary' : row.rarity === 'secret' ? 'rare' : undefined,
    isSecret: row.rarity === 'secret' || row.rarity === 'legendary',
    isAdminCreated: true,
    createdAt: row.created_at,
  }
}

export async function loadAdminStamps() {
  const { data, error } = await supabase
    .from('admin_stamps')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(normalizeAdminStamp)
}

export async function createAdminStamp({ name, rarity, imageUrl, location, xp }) {
  const cleanName = name?.trim()
  const cleanImageUrl = imageUrl?.trim()

  if (!cleanName) throw new Error('Stamp name is required.')
  if (!cleanImageUrl) throw new Error('Stamp image URL is required.')

  const { data, error } = await supabase
    .from('admin_stamps')
    .insert({
      name: cleanName,
      rarity: rarity || 'normal',
      image_url: cleanImageUrl,
      location: location?.trim() || 'Admin Created Drop',
      xp: Number(xp) || 500,
    })
    .select('*')
    .single()

  if (error) throw error
  return normalizeAdminStamp(data)
}
