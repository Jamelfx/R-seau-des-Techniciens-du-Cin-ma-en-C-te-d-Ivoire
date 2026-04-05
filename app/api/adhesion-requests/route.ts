import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      first_name,
      last_name,
      email,
      phone,
      profession,
      birth_date,
      birth_place,
      years_experience,
      biography,
      filmography,
      signature_data,
      profile_photo_base64,
    } = body

    // ── Validation des champs obligatoires ──
    const missing: string[] = []
    if (!first_name?.trim()) missing.push("prénoms")
    if (!last_name?.trim()) missing.push("nom")
    if (!email?.trim()) missing.push("email")
    if (!phone?.trim()) missing.push("téléphone")
    if (!profession?.trim()) missing.push("profession")
    if (!years_experience || years_experience < 0) missing.push("années d'expérience")
    if (!signature_data) missing.push("signature")

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Champs obligatoires manquants : ${missing.join(", ")}` },
        { status: 400 }
      )
    }

    // ── Validation email ──
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      )
    }

    // ── Upload photo de profil si fournie ──
    let profilePhotoUrl: string | null = null
    if (profile_photo_base64) {
      try {
        const base64Match = profile_photo_base64.match(/^data:image\/(\w+);base64,/)
        if (!base64Match) {
          return NextResponse.json(
            { error: "Format de photo invalide. Utilisez un fichier JPEG." },
            { status: 400 }
          )
        }

        const mimeType = base64Match[1]
        if (!["jpeg", "jpg", "png", "webp"].includes(mimeType)) {
          return NextResponse.json(
            { error: "Seuls les fichiers JPEG, PNG et WebP sont acceptés pour la photo." },
            { status: 400 }
          )
        }

        const base64Data = profile_photo_base64.replace(/^data:image\/\w+;base64,/, "")
        const buffer = Buffer.from(base64Data, "base64")

        // Vérifier la taille (1 Mo max)
        if (buffer.length > 1 * 1024 * 1024) {
          return NextResponse.json(
            { error: "La photo doit faire moins de 1 Mo." },
            { status: 400 }
          )
        }

        const filename = `adhesion-${Date.now()}.${mimeType === "jpeg" || mimeType === "jpg" ? "jpg" : mimeType}`

        const { error: uploadError } = await createClient(supabaseUrl, supabaseAnonKey)
          .storage
          .from("member-photos")
          .upload(`adhesions/${filename}`, buffer, {
            contentType: mimeType === "jpg" ? "image/jpeg" : `image/${mimeType}`,
            upsert: true,
          })

        if (uploadError) {
          console.error("Erreur upload photo:", uploadError.message)
          // Continue sans photo — on ne bloque pas l'inscription
        } else {
          const { data: urlData } = createClient(supabaseUrl, supabaseAnonKey)
            .storage
            .from("member-photos")
            .getPublicUrl(`adhesions/${filename}`)
          profilePhotoUrl = urlData.publicUrl
        }
      } catch (photoErr) {
        console.error("Erreur traitement photo:", photoErr)
        // Continue sans photo
      }
    }

    // ── Insertion dans adhesion_requests ──
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const insertData: Record<string, unknown> = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      profession: profession.trim(),
      birth_date: birth_date || null,
      birth_place: birth_place?.trim() || null,
      years_experience: parseInt(String(years_experience), 10),
      biography: biography?.trim() || null,
      filmography: filmography ? JSON.stringify(filmography) : null,
      profile_photo: profilePhotoUrl,
      signature_data,
      status: "pending",
    }

    const { data, error } = await supabase
      .from("adhesion_requests")
      .insert(insertData)
      .select("id")
      .single()

    if (error) {
      console.error("Erreur insertion adhesion:", error)

      // Email en doublon
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
        return NextResponse.json(
          { error: "Une demande d'adhésion avec cet email a déjà été soumise." },
          { status: 409 }
        )
      }

      // Colonne manquante dans la table
      if (error.message?.includes("does not exist") || error.message?.includes("column")) {
        return NextResponse.json(
          {
            error: "Erreur de base de données. Veuillez contacter l'administrateur.",
            detail: error.message,
          },
          { status: 500 }
        )
      }

      return NextResponse.json({ error: "Erreur lors de l'enregistrement." }, { status: 500 })
    }

    // ── TODO : Envoi de l'accusé de réception par email ──
    // Cette partie doit être implémentée via :
    // - Supabase Edge Function (recommandé) avec Resend ou SendGrid
    // - Ou un service email externe (Resend, Brevo, etc.)
    //
    // Exemple avec Resend :
    // await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     from: "RETECHCI <contact@retechci.org>",
    //     to: email,
    //     subject: "Accusé de réception — Demande d'adhésion RETECHCI",
    //     html: `<p>Bonjour ${first_name},</p><p>Nous avons bien reçu votre demande d'adhésion à RETECHCI...</p>`,
    //   }),
    // })

    return NextResponse.json({
      success: true,
      message: "Demande d'adhésion envoyée avec succès",
      request_id: data.id,
    })
  } catch (err) {
    console.error("Erreur interne adhesion-requests:", err)
    return NextResponse.json(
      { error: "Erreur interne du serveur. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
