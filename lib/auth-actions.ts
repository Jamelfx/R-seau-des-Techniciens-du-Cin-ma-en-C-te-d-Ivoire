"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get user role to redirect appropriately
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role || "member"

  if (role === "director") {
    redirect("/admin/directeur")
  } else if (role === "president") {
    redirect("/admin/president")
  } else if (role === "treasurer") {
    redirect("/admin/tresorier")
  } else {
    redirect("/membre/dashboard")
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/membre/dashboard`,
      data: {
        first_name: firstName,
        last_name: lastName,
        role: "member",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/connexion/confirmation")
}

export async function submitAdhesion(formData: FormData) {
  const supabase = await createClient()

  const adhesionData = {
    first_name: formData.get("firstName") as string,
    last_name: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    birth_date: formData.get("birthDate") as string,
    birth_place: formData.get("birthPlace") as string,
    profession: formData.get("profession") as string,
    years_experience: parseInt(formData.get("yearsExperience") as string),
    signature: formData.get("signature") as string,
    status: "pending",
    submitted_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("adhesion_requests")
    .insert(adhesionData)

  if (error) {
    return { error: error.message }
  }

  redirect("/adhesion/confirmation")
}

export async function createMemberAccount(email: string, memberId: string) {
  const supabase = await createClient()
  
  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      role: "member",
      member_id: memberId,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Send password reset email so user can set their own password
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/connexion/nouveau-mot-de-passe`,
  })

  return { success: true, userId: data.user?.id }
}

export async function updateMemberProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Non authentifié" }
  }

  const profileData = {
    first_name: formData.get("firstName") as string,
    last_name: formData.get("lastName") as string,
    phone: formData.get("phone") as string,
    profession: formData.get("profession") as string,
    bio: formData.get("bio") as string,
    availability: formData.get("availability") as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("members")
    .update(profileData)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function addFilmography(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Non authentifié" }
  }

  // Get member id
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!member) {
    return { error: "Membre non trouvé" }
  }

  const filmData = {
    member_id: member.id,
    title: formData.get("title") as string,
    year: parseInt(formData.get("year") as string),
    role: formData.get("role") as string,
    director: formData.get("director") as string,
    description: formData.get("description") as string,
  }

  const { error } = await supabase
    .from("filmography")
    .insert(filmData)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function recordAttendance(memberId: string, eventId: string, eventType: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("attendance")
    .insert({
      member_id: memberId,
      event_id: eventId,
      event_type: eventType,
      scanned_at: new Date().toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function validatePartnerScan(memberId: string, partnerId: string, benefitType: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("partner_benefits")
    .insert({
      member_id: memberId,
      partner_id: partnerId,
      benefit_type: benefitType,
      scanned_at: new Date().toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
