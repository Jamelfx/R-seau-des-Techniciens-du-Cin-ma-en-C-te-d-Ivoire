"use client"

import { useState, useRef } from "react"
import { Building, Trees, Waves, Landmark, Home, Camera } from "lucide-react"

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
}

// All major cities of Côte d'Ivoire with accurate positions
const cities = [
  // Nord
  { name: "Odienné", x: 15, y: 15 },
  { name: "Boundiali", x: 28, y: 18 },
  { name: "Tengrela", x: 22, y: 8 },
  { name: "Korhogo", x: 38, y: 15, isRegionalCapital: true },
  { name: "Ferkessédougou", x: 48, y: 12 },
  { name: "Bouna", x: 75, y: 18 },
  { name: "Ouangolodougou", x: 42, y: 8 },
  
  // Nord-Ouest
  { name: "Touba", x: 18, y: 28 },
  { name: "Biankouma", x: 14, y: 38 },
  { name: "Man", x: 16, y: 45, isRegionalCapital: true },
  { name: "Danané", x: 10, y: 50 },
  
  // Nord-Centre
  { name: "Séguéla", x: 28, y: 35 },
  { name: "Mankono", x: 35, y: 32 },
  { name: "Katiola", x: 48, y: 30 },
  { name: "Dabakala", x: 58, y: 28 },
  { name: "Bondoukou", x: 78, y: 35, isRegionalCapital: true },
  { name: "Tanda", x: 82, y: 42 },
  
  // Centre
  { name: "Bouaké", x: 50, y: 42, isRegionalCapital: true },
  { name: "Béoumi", x: 42, y: 40 },
  { name: "Sakassou", x: 46, y: 48 },
  { name: "Yamoussoukro", x: 44, y: 52, isCapital: true },
  { name: "Toumodi", x: 48, y: 58 },
  { name: "Dimbokro", x: 55, y: 52 },
  { name: "Bongouanou", x: 62, y: 50 },
  { name: "M'Bahiakro", x: 60, y: 42 },
  
  // Ouest
  { name: "Daloa", x: 30, y: 50, isRegionalCapital: true },
  { name: "Vavoua", x: 28, y: 42 },
  { name: "Issia", x: 30, y: 58 },
  { name: "Duékoué", x: 20, y: 55 },
  { name: "Guiglo", x: 18, y: 62 },
  { name: "Toulépleu", x: 12, y: 58 },
  
  // Centre-Ouest
  { name: "Bouaflé", x: 38, y: 52 },
  { name: "Sinfra", x: 34, y: 55 },
  { name: "Zuénoula", x: 34, y: 45 },
  { name: "Gagnoa", x: 32, y: 62, isRegionalCapital: true },
  { name: "Oumé", x: 40, y: 60 },
  { name: "Lakota", x: 36, y: 68 },
  
  // Centre-Est
  { name: "Abengourou", x: 75, y: 55, isRegionalCapital: true },
  { name: "Agnibilékrou", x: 78, y: 48 },
  { name: "Adzopé", x: 62, y: 62 },
  { name: "Akoupé", x: 65, y: 58 },
  
  // Sud-Ouest
  { name: "San-Pédro", x: 28, y: 78, isRegionalCapital: true },
  { name: "Tabou", x: 15, y: 75 },
  { name: "Sassandra", x: 34, y: 80 },
  { name: "Soubré", x: 30, y: 70 },
  { name: "Buyo", x: 26, y: 65 },
  
  // Sud
  { name: "Divo", x: 42, y: 68 },
  { name: "Tiassalé", x: 50, y: 68 },
  { name: "Agboville", x: 58, y: 68 },
  { name: "Grand-Lahou", x: 45, y: 82 },
  { name: "Fresco", x: 40, y: 85 },
  { name: "Jacqueville", x: 52, y: 82 },
  { name: "Dabou", x: 56, y: 78 },
  
  // Sud-Est (Région des lagunes)
  { name: "Abidjan", x: 65, y: 78, isEconomicCapital: true },
  { name: "Bingerville", x: 68, y: 80 },
  { name: "Anyama", x: 64, y: 74 },
  { name: "Grand-Bassam", x: 72, y: 82 },
  { name: "Assinie", x: 78, y: 85 },
  { name: "Adiaké", x: 80, y: 80 },
  { name: "Aboisso", x: 82, y: 72 },
  { name: "Ayamé", x: 78, y: 65 },
]

// Map décors to city positions
const cityPositions: Record<string, { x: number; y: number }> = {
  "Abidjan": { x: 65, y: 78 },
  "Yamoussoukro": { x: 44, y: 52 },
  "Bouaké": { x: 50, y: 42 },
  "Grand-Bassam": { x: 72, y: 82 },
  "Assinie": { x: 78, y: 85 },
  "San-Pédro": { x: 28, y: 78 },
  "Korhogo": { x: 38, y: 15 },
  "Man": { x: 16, y: 45 },
  "Daloa": { x: 30, y: 50 },
  "Bondoukou": { x: 78, y: 35 },
  "Sassandra": { x: 34, y: 80 },
  "Gagnoa": { x: 32, y: 62 },
  "Abengourou": { x: 75, y: 55 },
  "Divo": { x: 42, y: 68 },
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

export function CoteIvoireMap({ locations, selectedLocation, onSelectLocation }: CoteIvoireMapProps) {
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
    
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6
    
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
      className="relative w-full aspect-[4/5] max-h-[550px] rounded-2xl overflow-hidden border border-border"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
    >
      <div 
        className="w-full h-full transition-transform duration-150 ease-out relative"
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        {/* SVG Map */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 4px 20px rgba(249, 115, 22, 0.15))" }}
        >
          <defs>
            <linearGradient id="mapFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#171717" />
              <stop offset="50%" stopColor="#0a0a0a" />
              <stop offset="100%" stopColor="#171717" />
            </linearGradient>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c4a6e" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Accurate Côte d'Ivoire shape based on the provided image */}
          <path
            d="M 8 8 
               L 12 6 L 18 5 L 25 4 L 32 3 L 40 4 L 48 3 L 55 4 L 62 5 L 70 6 L 78 8 L 85 12
               L 88 18 L 90 25 L 89 32 L 88 40 L 87 48 L 86 55 L 85 62 L 84 68 L 82 75 L 80 80
               L 78 84 L 74 86 L 68 88 L 60 89 L 52 88 L 45 87 L 38 88 L 32 87 L 25 85
               L 18 82 L 12 78 L 8 72 L 6 65 L 5 58 L 4 50 L 5 42 L 6 35 L 7 28 L 8 20 L 8 8 Z"
            fill="url(#mapFill)"
            stroke="#f97316"
            strokeWidth="0.4"
            className="transition-all duration-300"
          />

          {/* Regional borders */}
          <g stroke="#404040" strokeWidth="0.12" fill="none" opacity="0.4">
            {/* Horizontal regional lines */}
            <path d="M 8 25 Q 45 28, 88 25" />
            <path d="M 6 45 Q 45 48, 87 45" />
            <path d="M 5 62 Q 45 65, 85 62" />
            {/* Vertical regional lines */}
            <path d="M 25 4 Q 28 45, 25 85" />
            <path d="M 45 3 Q 48 45, 45 88" />
            <path d="M 65 5 Q 62 45, 68 88" />
          </g>

          {/* Lagoon system near Abidjan */}
          <ellipse cx="65" cy="80" rx="8" ry="2.5" fill="url(#waterGradient)" opacity="0.6" />
          <ellipse cx="72" cy="82" rx="5" ry="1.5" fill="url(#waterGradient)" opacity="0.5" />
          <ellipse cx="58" cy="82" rx="4" ry="1.2" fill="url(#waterGradient)" opacity="0.4" />

          {/* Ocean indication */}
          <path
            d="M 8 78 Q 25 90, 50 92 Q 75 90, 82 80"
            stroke="#0c4a6e"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <text x="50" y="97" fontSize="2.5" fill="#0ea5e9" textAnchor="middle" opacity="0.4">
            Océan Atlantique
          </text>

          {/* Cities */}
          {cities.map((city) => {
            const isHovered = hoveredCity === city.name
            const citySize = city.isEconomicCapital ? 2 : city.isCapital ? 1.8 : city.isRegionalCapital ? 1.2 : 0.6
            const showLabel = city.isEconomicCapital || city.isCapital || city.isRegionalCapital || isHovered
            
            return (
              <g 
                key={city.name}
                onMouseEnter={() => setHoveredCity(city.name)}
                onMouseLeave={() => setHoveredCity(null)}
                className="cursor-pointer"
              >
                {/* City glow effect */}
                {(city.isEconomicCapital || city.isCapital) && (
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={citySize + 1}
                    fill={city.isEconomicCapital ? "#f97316" : "#eab308"}
                    opacity="0.2"
                    filter="url(#softGlow)"
                  />
                )}
                
                {/* City dot */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isHovered ? citySize * 1.5 : citySize}
                  fill={city.isEconomicCapital ? "#f97316" : city.isCapital ? "#eab308" : city.isRegionalCapital ? "#a3a3a3" : "#525252"}
                  className="transition-all duration-200"
                  filter={isHovered ? "url(#glow)" : undefined}
                />
                
                {/* City label */}
                {showLabel && (
                  <text
                    x={city.x}
                    y={city.y - (citySize + 1.5)}
                    fontSize={city.isEconomicCapital || city.isCapital ? 2.8 : 2.2}
                    fill={city.isEconomicCapital ? "#fb923c" : city.isCapital ? "#fbbf24" : "#d4d4d4"}
                    textAnchor="middle"
                    fontWeight={city.isEconomicCapital || city.isCapital ? "bold" : "normal"}
                    className="pointer-events-none select-none"
                  >
                    {city.name}
                  </text>
                )}
              </g>
            )
          })}

          {/* Décor location markers */}
          {locations.map((location) => {
            const pos = getLocationPosition(location)
            const isSelected = selectedLocation === location.id
            const isHovered = hoveredLocation === location.id
            
            return (
              <g
                key={location.id}
                className="cursor-pointer"
                onClick={() => onSelectLocation(location.id)}
                onMouseEnter={() => setHoveredLocation(location.id)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* Pulse animation for selected */}
                {isSelected && (
                  <>
                    <circle cx={pos.x} cy={pos.y} r="5" fill="none" stroke="#f97316" strokeWidth="0.3" opacity="0.6">
                      <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
                
                {/* Marker background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected || isHovered ? 3.5 : 2.5}
                  fill={isSelected ? "#f97316" : isHovered ? "#fb923c" : "#ea580c"}
                  filter="url(#glow)"
                  className="transition-all duration-200"
                />
                
                {/* Inner circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected || isHovered ? 2 : 1.5}
                  fill="#ffffff"
                  opacity="0.9"
                />

                {/* Tooltip */}
                {(isHovered || isSelected) && (
                  <g className="pointer-events-none">
                    <rect
                      x={pos.x - 18}
                      y={pos.y - 14}
                      width="36"
                      height="8"
                      rx="1.5"
                      fill="rgba(0,0,0,0.9)"
                      stroke="#f97316"
                      strokeWidth="0.2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 9}
                      fontSize="2.5"
                      fill="#ffffff"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {location.name.length > 16 ? location.name.substring(0, 16) + "..." : location.name}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>

        {/* Décor icon overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {locations.map((location) => {
            const pos = getLocationPosition(location)
            const IconComponent = getLocationIcon(location.filters)
            const isSelected = selectedLocation === location.id
            const isHovered = hoveredLocation === location.id
            
            return (
              <div
                key={`icon-${location.id}`}
                className="absolute pointer-events-auto cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${isSelected || isHovered ? 1.4 : 1})`,
                  transition: "transform 0.2s ease"
                }}
                onClick={() => onSelectLocation(location.id)}
                onMouseEnter={() => setHoveredLocation(location.id)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                <div className={`p-1.5 rounded-full shadow-lg ${
                  isSelected 
                    ? 'bg-primary ring-2 ring-primary/50' 
                    : isHovered 
                      ? 'bg-primary/90' 
                      : 'bg-primary/80'
                }`}>
                  <IconComponent className="h-3 w-3 text-white" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm rounded-xl p-3 text-xs border border-neutral-800">
          <h4 className="font-semibold text-white mb-2">Légende</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-neutral-300">Capitale économique</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="text-neutral-300">Capitale politique</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neutral-400" />
              <span className="text-neutral-300">Chefs-lieux</span>
            </div>
            <div className="h-px bg-neutral-700 my-2" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5">
                <Building className="h-3 w-3 text-primary" />
                <span className="text-neutral-400">Urbain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Waves className="h-3 w-3 text-primary" />
                <span className="text-neutral-400">Plage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trees className="h-3 w-3 text-primary" />
                <span className="text-neutral-400">Nature</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Landmark className="h-3 w-3 text-primary" />
                <span className="text-neutral-400">Historique</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title & Instructions */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold text-white">Carte des Décors</h3>
            <p className="text-xs text-neutral-400">Côte d&apos;Ivoire</p>
          </div>
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-neutral-400 border border-neutral-800">
            Effet 3D au survol
          </div>
        </div>

        {/* 3D shine effect */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `linear-gradient(${105 + transform.rotateY * 5}deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)`,
          }}
        />
      </div>
    </div>
  )
}
