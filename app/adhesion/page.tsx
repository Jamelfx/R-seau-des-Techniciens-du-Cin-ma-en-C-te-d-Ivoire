"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, UserPlus, PenLine } from "lucide-react"

const functions = [
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
]

export default function AdhesionPage() {
  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    email: "",
    phone: "",
    fonction: "",
    dateNaissance: "",
    lieuNaissance: "",
    anneesExperience: "",
    acceptAdhesion: false,
    signature: ""
  })
  const [submitted, setSubmitted] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    return (
      formData.nom &&
      formData.prenoms &&
      formData.email &&
      formData.phone &&
      formData.fonction &&
      formData.dateNaissance &&
      formData.lieuNaissance &&
      formData.anneesExperience &&
      formData.acceptAdhesion &&
      formData.signature
    )
  }

  // Signature pad handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.beginPath()
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const signature = canvas.toDataURL()
      updateFormData('signature', signature)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    updateFormData('signature', '')
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
              Votre demande d&apos;adhésion a été transmise au Directeur Exécutif qui la transmettra au 
              Conseil d&apos;Administration pour examen.
            </p>
            <div className="bg-card border border-border rounded-xl p-6 text-left">
              <h3 className="font-semibold text-foreground mb-4">Prochaines étapes :</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Le Directeur Exécutif reçoit votre dossier et le transmet au Président du Conseil d&apos;Administration</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Le Conseil d&apos;Administration examine votre demande (délai de 15 jours)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>En cas d&apos;approbation, vous recevrez un lien par email pour payer vos frais d&apos;adhésion (5 000 FCFA) et créer votre compte</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Après paiement, vous aurez accès à votre espace membre et votre carte professionnelle digitale</span>
                </li>
              </ol>
            </div>
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-left">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <strong>Rappel :</strong> La cotisation mensuelle est de 2 000 FCFA après l&apos;adhésion.
              </p>
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              REJOIGNEZ LE RÉSEAU
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Demande d&apos;adhésion
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Remplissez ce formulaire pour rejoindre le RETECHCI. 
              Votre demande sera examinée par le Conseil d&apos;Administration dans un délai de 15 jours.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Formulaire d&apos;adhésion</CardTitle>
                    <CardDescription>Tous les champs marqués * sont obligatoires</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nom et Prénoms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => updateFormData("nom", e.target.value)}
                      placeholder="BASIRU"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenoms">Prénoms *</Label>
                    <Input
                      id="prenoms"
                      value={formData.prenoms}
                      onChange={(e) => updateFormData("prenoms", e.target.value)}
                      placeholder="Jamel Koffi"
                      required
                    />
                  </div>
                </div>

                {/* Email et Téléphone */}
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

                {/* Fonction */}
                <div className="space-y-2">
                  <Label>Fonction (Uniquement Technicien du cinéma) *</Label>
                  <Select
                    value={formData.fonction}
                    onValueChange={(value) => updateFormData("fonction", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre fonction" />
                    </SelectTrigger>
                    <SelectContent>
                      {functions.map((func) => (
                        <SelectItem key={func} value={func}>
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date et lieu de naissance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateNaissance">Date de naissance *</Label>
                    <Input
                      id="dateNaissance"
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(e) => updateFormData("dateNaissance", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lieuNaissance">Lieu de naissance *</Label>
                    <Input
                      id="lieuNaissance"
                      value={formData.lieuNaissance}
                      onChange={(e) => updateFormData("lieuNaissance", e.target.value)}
                      placeholder="Abidjan, Côte d'Ivoire"
                      required
                    />
                  </div>
                </div>

                {/* Années d'expérience */}
                <div className="space-y-2">
                  <Label htmlFor="anneesExperience">Combien d&apos;années d&apos;expérience ? *</Label>
                  <Input
                    id="anneesExperience"
                    type="number"
                    min="0"
                    value={formData.anneesExperience}
                    onChange={(e) => updateFormData("anneesExperience", e.target.value)}
                    placeholder="Ex: 5"
                    required
                  />
                </div>

                {/* Engagement */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acceptAdhesion"
                      checked={formData.acceptAdhesion}
                      onCheckedChange={(checked) => updateFormData("acceptAdhesion", checked as boolean)}
                    />
                    <Label htmlFor="acceptAdhesion" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      Je signifie ma volonté d&apos;adhérer au RETECHCI et j&apos;accepte que le Conseil d&apos;Administration 
                      examine ma demande. Je comprends que j&apos;aurai une réponse dans un délai de 15 jours. *
                    </Label>
                  </div>
                </div>

                {/* Signature électronique */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <Label className="flex items-center gap-2">
                    <PenLine className="h-4 w-4" />
                    Signature électronique *
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-2 bg-card">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      className="w-full h-32 bg-white dark:bg-gray-900 rounded-lg cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        Dessinez votre signature dans le cadre ci-dessus
                      </p>
                      <Button type="button" variant="ghost" size="sm" onClick={clearSignature}>
                        Effacer
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Informations sur les frais */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-foreground">Frais d&apos;adhésion et cotisation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>- Frais d&apos;adhésion : <strong className="text-foreground">5 000 FCFA</strong> (paiement unique)</li>
                    <li>- Cotisation mensuelle : <strong className="text-foreground">2 000 FCFA</strong></li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2">
                    Vous recevrez un lien de paiement par email après validation de votre demande par le Conseil d&apos;Administration.
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!isFormValid()}
                >
                  Soumettre ma demande d&apos;adhésion
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
