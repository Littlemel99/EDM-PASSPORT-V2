import { supabase } from '../lib/supabase'

function generateFamilyCode(name) {
  const base = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase()

  const random = Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()

  return `${base || 'FAMILY'}-${random}`
}

async function loadMembersForFamilies(familyIds = []) {
  if (!familyIds.length) return {}

  const { data: members, error } = await supabase
    .from('crew_members')
    .select('crew_id, user_id, role, joined_at')
    .in('crew_id', familyIds)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Load family members error:', error)
    return {}
  }

  const userIds = Array.from(new Set((members || []).map((member) => member.user_id)))
  let profilesById = {}

  if (userIds.length) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, rave_name, country, avatar_url')
      .in('id', userIds)

    if (profileError) {
      console.error('Load family member profiles error:', profileError)
    } else {
      profilesById = (profiles || []).reduce((map, profile) => {
        map[profile.id] = profile
        return map
      }, {})
    }
  }

  return (members || []).reduce((map, member) => {
    const profile = profilesById[member.user_id] || {}

    if (!map[member.crew_id]) map[member.crew_id] = []

    map[member.crew_id].push({
      ...member,
      rave_name: profile.rave_name || 'Rave Traveler',
      country: profile.country || '',
      avatar_url: profile.avatar_url || '',
    })

    return map
  }, {})
}

export async function loadFamilies(user) {
  if (!user) return []

  const { data, error } = await supabase
    .from('crew_members')
    .select(`
      role,
      joined_at,
      crews (
        id,
        name,
        code,
        festival_id,
        created_by,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Load families error:', error)
    return []
  }

  const familyRows = (data || []).filter((item) => item.crews)
  const familyIds = familyRows.map((item) => item.crews.id)
  const membersByFamilyId = await loadMembersForFamilies(familyIds)

  return familyRows.map((item) => ({
    ...item.crews,
    role: item.role,
    joined_at: item.joined_at,
    members: membersByFamilyId[item.crews.id] || [],
    member_count: membersByFamilyId[item.crews.id]?.length || 0,
  }))
}

export async function loadPublicFamilies() {
  const { data, error } = await supabase
    .from('crews')
    .select('*')
    .order('name')

  if (error) {
    console.error('Load public families error:', error)
    return []
  }

  const familyIds = (data || []).map((family) => family.id)
  const membersByFamilyId = await loadMembersForFamilies(familyIds)

  return (data || []).map((family) => ({
    ...family,
    members: membersByFamilyId[family.id] || [],
    member_count: membersByFamilyId[family.id]?.length || 0,
  }))
}

export async function createFamily(user, name) {
  if (!user) {
    throw new Error('Login required.')
  }

  const cleanName = name.trim()

  if (!cleanName) {
    throw new Error('Family name required.')
  }

  const code = generateFamilyCode(cleanName)

  const { data: family, error } = await supabase
    .from('crews')
    .insert({
      name: cleanName,
      code,
      festival_id: 'edc-las-vegas-2026',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  const { error: memberError } = await supabase
    .from('crew_members')
    .insert({
      crew_id: family.id,
      user_id: user.id,
      role: 'Founder',
    })

  if (memberError) throw memberError

  return {
    ...family,
    role: 'Founder',
    members: [
      {
        user_id: user.id,
        role: 'Founder',
        rave_name: 'You',
      },
    ],
    member_count: 1,
  }
}

export async function joinFamily(user, code) {
  if (!user) {
    throw new Error('Login required.')
  }

  const cleanCode = code.trim().toUpperCase()

  if (!cleanCode) {
    throw new Error('Family code required.')
  }

  const { data: family, error } = await supabase
    .from('crews')
    .select('*')
    .eq('code', cleanCode)
    .maybeSingle()

  if (error) throw error

  if (!family) {
    throw new Error('Family not found.')
  }

  const { error: memberError } = await supabase
    .from('crew_members')
    .upsert(
      {
        crew_id: family.id,
        user_id: user.id,
        role: 'Member',
      },
      {
        onConflict: 'crew_id,user_id',
      }
    )

  if (memberError) throw memberError

  return {
    ...family,
    role: 'Member',
    members: [],
  }
}

export async function leaveFamily(user, familyId) {
  if (!user) {
    throw new Error('Login required.')
  }

  if (!familyId) {
    throw new Error('Family required.')
  }

  const { error } = await supabase
    .from('crew_members')
    .delete()
    .eq('crew_id', familyId)
    .eq('user_id', user.id)

  if (error) throw error

  return true
}

export async function loadPrimaryFamilyByOwner(ownerId) {
  if (!ownerId) return null

  const { data, error } = await supabase
    .from('crews')
    .select('*')
    .eq('created_by', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Load owner family error:', error)
    return null
  }

  return data
}

/*
  Backward-compatible crew exports.
  These keep older app code working.
*/

export async function loadCrew(user) {
  const families = await loadFamilies(user)
  return families[0] || null
}

export async function createCrew(user, name) {
  return createFamily(user, name)
}

export async function joinCrew(user, code) {
  return joinFamily(user, code)
}
