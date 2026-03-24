"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Upload, User, Briefcase, GraduationCap, FileText } from "lucide-react"

const specialties = [
  "Chef Opérateur / Directeur Photo",
  "Cadreur",
  "Assistant Caméra",
  "Chef Électricien",
  "Électricien",
  "Chef Machiniste",
  "Machiniste",
  "Ingénieur du Son",
  "Perchiste",
  "Monteur Image",
  "Monteur Son",
  "Étalonneur",
  "Mixeur",
  "Scripte",
  "Régisseur Général",
  "Directeur de Production",
  "Chef Décorateur",
  "Accessoiriste",
  "Chef Costumier",
  "Maquilleur/Coiffeur",
  "Cascadeur",
  "Autre"
]

const experienceLevels = [
  { value: "junior", label: "Junior (0-3 ans)", description: "Début de carrière" },
  { value: "intermediate", label: "Intermédiaire (3-7 ans)", description: "Expérience confirmée" },
  { value: "senior", label: "Senior (7+ ans)", description: "Expert reconnu" },
]

export default function AdhesionPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    city: "",
    // Professional Info
    specialty: "",
    otherSpecialty: "",
    experienceLevel: "",
    yearsExperience: "",
    biography: "",
    // Portfolio
    portfolio: "",
    linkedin: "",
    imdb: "",
    // Documents
    cvFile: null as File | null,
    photoFile: null as File | null,
    idFile: null as File | null,
    // Agreements
    acceptTerms: false,
    acceptSalaryGrid: false,
    acceptEthics: false,
  })
  const [submitted, setSubmitted] = useState(false)

  const updateFormData = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    updateFormData(field, file)
  }

  const isStep1Valid = () => {
    return formData.firstName && formData.lastName && formData.email && formData.phone && formData.birthDate
  }

  const isStep2Valid = () => {
    return formData.specialty && formData.experienceLevel && formData.biography
  }

  const isStep3Valid = () => {
    return formData.cvFile && formData.photoFile
  }

  const isStep4Valid = () => {
    return formData.acceptTerms && formData.acceptSalaryGrid && formData.acceptEthics
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Membership application submitted:", formData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-8 px-6 lg:px-20 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Demande envoyée avec succès !</h1>
            <p className="text-muted-foreground mb-6">
              Votre demande d&apos;adhésion a été transmise au Bureau Exécutif du RETECHCI. 
              Vous recevrez une réponse par email dans un délai de 7 jours ouvrables.
            </p>
            <div className="bg-card border border-border rounded-xl p-6 text-left">
              <h3 className="font-semibold text-foreground mb-4">Prochaines étapes :</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Vérification de votre dossier par le Bureau Exécutif</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Entretien téléphonique ou en personne (si nécessaire)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Validation par le Conseil d&apos;Administration</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Réception de votre carte professionnelle digitale</span>
                </li>
              </ol>
            </div>
            <Button className="mt-8" onClick={() => window.location.href = "/"}>
              Retour à l&apos;accueil
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8 px-6 lg:px-20 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              REJOIGNEZ LE RÉSEAU
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Demande d&apos;adhésion
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Rejoignez le RETECHCI et bénéficiez de la carte professionnelle, 
              de l&apos;accès à l&apos;annuaire et de la protection de la grille salariale.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-12 lg:w-20 h-1 mx-1 ${step > s ? "bg-primary" : "bg-secondary"}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Informations Personnelles</CardTitle>
                      <CardDescription>Vos coordonnées de contact</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                        placeholder="Votre prénom"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData("lastName", e.target.value)}
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        placeholder="+225 XX XX XX XX XX"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Date de naissance *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => updateFormData("birthDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        placeholder="Abidjan"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse complète</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      placeholder="Quartier, rue, commune"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Informations Professionnelles</CardTitle>
                      <CardDescription>Votre métier et expérience</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Spécialité principale *</Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(value) => updateFormData("specialty", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.specialty === "Autre" && (
                    <div className="space-y-2">
                      <Label htmlFor="otherSpecialty">Précisez votre spécialité</Label>
                      <Input
                        id="otherSpecialty"
                        value={formData.otherSpecialty}
                        onChange={(e) => updateFormData("otherSpecialty", e.target.value)}
                        placeholder="Votre spécialité"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Niveau d&apos;expérience *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {experienceLevels.map((level) => (
                        <div
                          key={level.value}
                          className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                            formData.experienceLevel === level.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => updateFormData("experienceLevel", level.value)}
                        >
                          <div className="font-medium text-foreground text-sm">{level.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Années d&apos;expérience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min="0"
                      value={formData.yearsExperience}
                      onChange={(e) => updateFormData("yearsExperience", e.target.value)}
                      placeholder="Ex: 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biography">Biographie professionnelle *</Label>
                    <Textarea
                      id="biography"
                      value={formData.biography}
                      onChange={(e) => updateFormData("biography", e.target.value)}
                      placeholder="Décrivez votre parcours, vos compétences et vos réalisations principales..."
                      rows={5}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Minimum 100 caractères</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Site portfolio</Label>
                      <Input
                        id="portfolio"
                        type="url"
                        value={formData.portfolio}
                        onChange={(e) => updateFormData("portfolio", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => updateFormData("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imdb">IMDb</Label>
                      <Input
                        id="imdb"
                        type="url"
                        value={formData.imdb}
                        onChange={(e) => updateFormData("imdb", e.target.value)}
                        placeholder="https://imdb.com/name/..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Documents</CardTitle>
                      <CardDescription>Pièces justificatives</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        id="photoFile"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange("photoFile")}
                      />
                      <label htmlFor="photoFile" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium text-foreground">Photo de profil *</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formData.photoFile ? formData.photoFile.name : "JPG ou PNG, max 5MB"}
                        </p>
                      </label>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        id="cvFile"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileChange("cvFile")}
                      />
                      <label htmlFor="cvFile" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium text-foreground">CV / Filmographie *</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formData.cvFile ? formData.cvFile.name : "PDF, DOC ou DOCX, max 10MB"}
                        </p>
                      </label>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        id="idFile"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleFileChange("idFile")}
                      />
                      <label htmlFor="idFile" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium text-foreground">Pièce d&apos;identité</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formData.idFile ? formData.idFile.name : "CNI, Passeport ou Permis (optionnel)"}
                        </p>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Agreements */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Engagements</CardTitle>
                      <CardDescription>Validation des conditions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-border">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => updateFormData("acceptTerms", checked as boolean)}
                      />
                      <label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                        <span className="font-medium text-foreground">J&apos;accepte les statuts et le règlement intérieur du RETECHCI *</span>
                        <p className="text-muted-foreground mt-1">
                          Je m&apos;engage à respecter les valeurs de professionnalisme, de solidarité et d&apos;éthique de l&apos;association.
                        </p>
                      </label>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-border">
                      <Checkbox
                        id="acceptSalaryGrid"
                        checked={formData.acceptSalaryGrid}
                        onCheckedChange={(checked) => updateFormData("acceptSalaryGrid", checked as boolean)}
                      />
                      <label htmlFor="acceptSalaryGrid" className="text-sm cursor-pointer">
                        <span className="font-medium text-foreground">J&apos;adhère à la grille salariale de référence *</span>
                        <p className="text-muted-foreground mt-1">
                          Je m&apos;engage à respecter les tarifs minimaux recommandés par le RETECHCI pour mes prestations.
                        </p>
                      </label>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-border">
                      <Checkbox
                        id="acceptEthics"
                        checked={formData.acceptEthics}
                        onCheckedChange={(checked) => updateFormData("acceptEthics", checked as boolean)}
                      />
                      <label htmlFor="acceptEthics" className="text-sm cursor-pointer">
                        <span className="font-medium text-foreground">J&apos;accepte la charte éthique et déontologique *</span>
                        <p className="text-muted-foreground mt-1">
                          Je m&apos;engage à adopter un comportement professionnel et respectueux sur tous les plateaux.
                        </p>
                      </label>
                    </div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <strong>Cotisation annuelle :</strong> 25 000 FCFA
                      <br />
                      <span className="text-muted-foreground">
                        Le paiement sera effectué après validation de votre candidature.
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                Précédent
              </Button>
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={() => setStep(s => Math.min(4, s + 1))}
                  disabled={
                    (step === 1 && !isStep1Valid()) ||
                    (step === 2 && !isStep2Valid()) ||
                    (step === 3 && !isStep3Valid())
                  }
                >
                  Continuer
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={!isStep4Valid()}
                >
                  Soumettre ma candidature
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
