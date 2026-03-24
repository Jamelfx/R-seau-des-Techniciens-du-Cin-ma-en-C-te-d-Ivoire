"use client"

import { useState, useRef } from "react"
import { Building, Trees, Waves, Landmark, Home, Camera } from "lucide-react"
import Image from "next/image"

interface FilmLocation {
  id: string
  name: string
  city: string
  description?: string
  image?: string
  tags?: string[]
  filters: string[]
  coordinates?: { lat: number; lng: number }
}

interface CoteIvoireMapProps {
  locations: FilmLocation[]
  selectedLocation: string | null
  onSelectLocation: (id: string) => void
  mapImageUrl?: string // Allow custom map image
}

// All major cities of Côte d'Ivoire with positions calibrated for the map image
const cities = [
  // Nord
  { name: "Odienné", x: 18, y: 18 },
  { name: "Boundiali", x: 32, y: 20 },
  { name: "Tengrela", x: 26, y: 10 },
  { name: "Korhogo", x: 42, y: 18, isRegionalCapital: true },
  { name: "Ferkessédougou", x: 52, y: 15 },
  { name: "Bouna", x: 78, y: 22 },
  { name: "Ouangolodougou", x: 46, y: 10 },
  
  // Nord-Ouest
  { name: "Touba", x: 22, y: 32 },
  { name: "Biankouma", x: 16, y: 42 },
  { name: "Man", x: 18, y: 48, isRegionalCapital: true },
  { name: "Danané", x: 12, y: 54 },
  
  // Nord-Centre
  { name: "Séguéla", x: 30, y: 38 },
  { name: "Mankono", x: 38, y: 35 },
  { name: "Katiola", x: 50, y: 33 },
  { name: "Dabakala", x: 60, y: 30 },
  { name: "Bondoukou", x: 80, y: 38, isRegionalCapital: true },
  { name: "Tanda", x: 84, y: 45 },
  
  // Centre
  { name: "Bouaké", x: 52, y: 45, isRegionalCapital: true },
  { name: "Béoumi", x: 44, y: 43 },
  { name: "Sakassou", x: 48, y: 50 },
  { name: "Yamoussoukro", x: 46, y: 55, isCapital: true },
  { name: "Toumodi", x: 50, y: 60 },
  { name: "Dimbokro", x: 58, y: 55 },
  { name: "Bongouanou", x: 65, y: 52 },
  { name: "M'Bahiakro", x: 62, y: 45 },
  
  // Ouest
  { name: "Daloa", x: 32, y: 52, isRegionalCapital: true },
  { name: "Vavoua", x: 30, y: 45 },
  { name: "Issia", x: 32, y: 60 },
  { name: "Duékoué", x: 22, y: 58 },
  { name: "Guiglo", x: 20, y: 65 },
  { name: "Toulépleu", x: 14, y: 62 },
  
  // Centre-Ouest
  { name: "Bouaflé", x: 40, y: 55 },
  { name: "Sinfra", x: 36, y: 58 },
  { name: "Zuénoula", x: 36, y: 48 },
  { name: "Gagnoa", x: 34, y: 65, isRegionalCapital: true },
  { name: "Oumé", x: 42, y: 62 },
  { name: "Lakota", x: 38, y: 70 },
  
  // Centre-Est
  { name: "Abengourou", x: 77, y: 58, isRegionalCapital: true },
  { name: "Agnibilékrou", x: 80, y: 50 },
  { name: "Adzopé", x: 64, y: 65 },
  { name: "Akoupé", x: 67, y: 60 },
  
  // Sud-Ouest
  { name: "San-Pédro", x: 30, y: 82, isRegionalCapital: true },
  { name: "Tabou", x: 17, y: 78 },
  { name: "Sassandra", x: 36, y: 84 },
  { name: "Soubré", x: 32, y: 73 },
  { name: "Buyo", x: 28, y: 68 },
  
  // Sud
  { name: "Divo", x: 44, y: 70 },
  { name: "Tiassalé", x: 52, y: 70 },
  { name: "Agboville", x: 60, y: 70 },
  { name: "Grand-Lahou", x: 47, y: 85 },
  { name: "Fresco", x: 42, y: 88 },
  { name: "Jacqueville", x: 54, y: 85 },
  { name: "Dabou", x: 58, y: 80 },
  
  // Sud-Est (Région des lagunes)
  { name: "Abidjan", x: 68, y: 80, isEconomicCapital: true },
  { name: "Bingerville", x: 72, y: 82 },
  { name: "Anyama", x: 66, y: 76 },
  { name: "Grand-Bassam", x: 76, y: 85 },
  { name: "Assinie", x: 82, y: 88 },
  { name: "Adiaké", x: 84, y: 82 },
  { name: "Aboisso", x: 85, y: 74 },
  { name: "Ayamé", x: 80, y: 68 },
]

// Map décors to city positions
const cityPositions: Record<string, { x: number; y: number }> = {
  "Abidjan": { x: 68, y: 80 },
  "Yamoussoukro": { x: 46, y: 55 },
  "Bouaké": { x: 52, y: 45 },
  "Grand-Bassam": { x: 76, y: 85 },
  "Assinie": { x: 82, y: 88 },
  "San-Pédro": { x: 30, y: 82 },
  "Korhogo": { x: 42, y: 18 },
  "Man": { x: 18, y: 48 },
  "Daloa": { x: 32, y: 52 },
  "Bondoukou": { x: 80, y: 38 },
  "Sassandra": { x: 36, y: 84 },
  "Gagnoa": { x: 34, y: 65 },
  "Abengourou": { x: 77, y: 58 },
  "Divo": { x: 44, y: 70 },
}

function getLocationPosition(location: FilmLocation): { x: number; y: number } {
  return cityPositions[location.city] || { x: 50, y: 50 }
}

function getLocationIcon(filters: string[]) {
  if (filters.includes("beach")) return Waves
  if (filters.includes("nature")) return Trees
  if (filters.includes("historical")) return Landmark
  if (filters.includes("modern") || filters.includes("urban")) return Building
  if (filters.includes("traditional")) return Home
  return Camera
}

// Default map image (the one provided by user)
const DEFAULT_MAP_IMAGE = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ids99Vl85dmY97Syj89FOvlf7mK4RI.png"

export function CoteIvoireMap({ 
  locations, 
  selectedLocation, 
  onSelectLocation,
  mapImageUrl = DEFAULT_MAP_IMAGE
}: CoteIvoireMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    
    setTransform({ rotateX, rotateY })
  }

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 })
    setHoveredCity(null)
    setHoveredLocation(null)
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square max-h-[600px] rounded-2xl overflow-hidden border border-border bg-neutral-100"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1500px" }}
    >
      <div 
        className="w-full h-full transition-transform duration-150 ease-out relative"
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Map Image Background */}
        <div className="absolute inset-0">
          <Image
            src={mapImageUrl}
            alt="Carte de la Côte d'Ivoire"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* City markers overlay */}
        <div className="absolute inset-0">
          {cities.map((city) => {
            const isHovered = hoveredCity === city.name
            const showLabel = city.isEconomicCapital || city.isCapital || city.isRegionalCapital || isHovered
            
            return (
              <div
                key={city.name}
                className="absolute cursor-pointer group"
                style={{
                  left: `${city.x}%`,
                  top: `${city.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
                onMouseEnter={() => setHoveredCity(city.name)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* City dot */}
                <div 
                  className={`rounded-full transition-all duration-200 ${
                    city.isEconomicCapital 
                      ? 'w-4 h-4 bg-primary shadow-lg shadow-primary/50' 
                      : city.isCapital 
                        ? 'w-3.5 h-3.5 bg-yellow-500 shadow-lg shadow-yellow-500/50' 
                        : city.isRegionalCapital 
                          ? 'w-2.5 h-2.5 bg-white border-2 border-neutral-400' 
                          : 'w-1.5 h-1.5 bg-neutral-400'
                  } ${isHovered ? 'scale-150 ring-2 ring-white/50' : ''}`}
                />
                
                {/* City label */}
                {showLabel && (
                  <div 
                    className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      city.isEconomicCapital 
                        ? 'bg-primary text-white -top-6' 
                        : city.isCapital 
                          ? 'bg-yellow-500 text-black -top-6' 
                          : 'bg-black/70 text-white -top-5'
                    }`}
                  >
                    {city.name}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Décor location markers */}
        <div className="absolute inset-0">
          {locations.map((location) => {
            const pos = getLocationPosition(location)
            const IconComponent = getLocationIcon(location.filters)
            const isSelected = selectedLocation === location.id
            const isHovered = hoveredLocation === location.id
            
            return (
              <div
                key={location.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isSelected || isHovered ? 50 : 10
                }}
                onClick={() => onSelectLocation(location.id)}
                onMouseEnter={() => setHoveredLocation(location.id)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* Pulse animation for selected */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/30 animate-ping" />
                  </div>
                )}
                
                {/* Marker icon */}
                <div 
                  className={`relative p-2 rounded-full shadow-xl transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary scale-125 ring-4 ring-primary/30' 
                      : isHovered 
                        ? 'bg-primary scale-110' 
                        : 'bg-primary/90 hover:bg-primary'
                  }`}
                >
                  <IconComponent className="h-4 w-4 text-white" />
                </div>

                {/* Tooltip */}
                {(isHovered || isSelected) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black rounded-lg shadow-xl whitespace-nowrap z-50">
                    <div className="text-sm font-semibold text-white">{location.name}</div>
                    <div className="text-xs text-neutral-400">{location.city}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Compact Legend */}
        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 text-[9px] border border-neutral-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-neutral-400">Abidjan</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              <span className="text-neutral-400">Yamoussoukro</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera className="h-2.5 w-2.5 text-primary" />
              <span className="text-neutral-400">Decor</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-neutral-700/50">
          <h3 className="text-xs font-bold text-white">Carte Decors CI</h3>
        </div>

        {/* 3D shine effect */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `linear-gradient(${105 + transform.rotateY * 5}deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)`,
          }}
        />
      </div>
    </div>
  )
}
