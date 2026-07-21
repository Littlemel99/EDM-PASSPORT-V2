import { supabase } from '../lib/supabase'
import { resolveFestivalId } from './festivalPersistence.js'

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
    // Existing admin stamps predate festival ownership and are EDC content.
    festivalId: resolveFestivalId(row.festival_id),
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


export async function uploadAdminStampImage(user, file) {
  if (!user) throw new Error('Admin login required to upload stamp images.')
  if (!file) throw new Error('Choose a stamp image first.')

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Use PNG, JPG, JPEG, or WEBP images only.')
  }

  const maxBytes = 5 * 1024 * 1024
  if (file.size > maxBytes) {
    throw new Error('Stamp image must be smaller than 5 MB.')
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'stamp'

  const filePath = `admin-stamps/${user.id}/${Date.now()}-${safeName}.${extension}`

  const { error } = await supabase.storage
    .from('stamp-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error

  const { data } = supabase.storage.from('stamp-images').getPublicUrl(filePath)
  return data.publicUrl
}
