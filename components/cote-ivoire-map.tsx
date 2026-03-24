"use client"

import { useState } from "react"
import { MapPin, Camera, Building, Trees, Waves, Landmark, Home } from "lucide-react"

interface FilmLocation {
  id: string
  name: string
  city: string
  description: string
  image: string
  tags: string[]
  filters: string[]
  coordinates: { lat: number; lng: number }
  images?: string[]
}

interface CoteIvoireMapProps {
  locations: FilmLocation[]
  selectedLocation: string | null
  onSelectLocation: (id: string) => void
}

// Côte d'Ivoire cities with approximate positions on the map
const cities = [
  { name: "Abidjan", x: 72, y: 78, isCapital: true },
  { name: "Yamoussoukro", x: 55, y: 58, isCapital: true },
  { name: "Bouaké", x: 55, y: 45 },
  { name: "San-Pédro", x: 35, y: 85 },
  { name: "Korhogo", x: 52, y: 18 },
  { name: "Man", x: 28, y: 42 },
  { name: "Daloa", x: 40, y: 55 },
  { name: "Grand-Bassam", x: 78, y: 80 },
  { name: "Assinie", x: 85, y: 82 },
  { name: "Sassandra", x: 42, y: 82 },
  { name: "Odienné", x: 22, y: 18 },
  { name: "Bondoukou", x: 78, y: 38 },
  { name: "Abengourou", x: 78, y: 55 },
  { name: "Gagnoa", x: 42, y: 65 },
  { name: "Divo", x: 52, y: 70 },
]

// Map location to approximate position
function getLocationPosition(location: FilmLocation): { x: number; y: number } {
  const cityPositions: Record<string, { x: number; y: number }> = {
    "Abidjan": { x: 72, y: 78 },
    "Yamoussoukro": { x: 55, y: 58 },
    "Grand-Bassam": { x: 78, y: 80 },
    "Assinie": { x: 85, y: 82 },
    "Bouaké": { x: 55, y: 45 },
    "Korhogo": { x: 52, y: 18 },
    "Man": { x: 28, y: 42 },
    "San-Pédro": { x: 35, y: 85 },
  }
  
  return cityPositions[location.city] || { x: 50, y: 50 }
}

// Get icon based on location type
function getLocationIcon(filters: string[]) {
  if (filters.includes("beach")) return Waves
  if (filters.includes("nature")) return Trees
  if (filters.includes("historical")) return Landmark
  if (filters.includes("modern")) return Building
  if (filters.includes("traditional")) return Home
  return Camera
}

export function CoteIvoireMap({ locations, selectedLocation, onSelectLocation }: CoteIvoireMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  return (
    <div className="relative w-full aspect-[4/5] max-h-[500px] bg-gradient-to-b from-amber-950/20 to-green-950/20 rounded-2xl overflow-hidden border border-border">
      {/* SVG Map of Côte d'Ivoire */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
      >
        {/* Côte d'Ivoire outline - simplified shape */}
        <path
          d="M 15 10 
             L 25 8 
             L 40 5 
             L 55 8 
             L 70 12 
             L 85 18 
             L 88 25 
             L 85 35 
             L 82 45 
             L 80 55 
             L 82 65 
             L 85 75 
             L 80 85 
             L 70 88 
             L 60 85 
             L 50 88 
             L 40 90 
             L 30 88 
             L 20 82 
             L 15 70 
             L 12 55 
             L 10 40 
             L 12 25 
             L 15 10 Z"
          fill="url(#mapGradient)"
          stroke="#f97316"
          strokeWidth="0.5"
          className="transition-all duration-300"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="50%" stopColor="#262626" />
            <stop offset="100%" stopColor="#1f1f1f" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Lagoons and water features */}
        <ellipse cx="72" cy="80" rx="8" ry="3" fill="#0ea5e9" opacity="0.3" />
        <ellipse cx="78" cy="82" rx="5" ry="2" fill="#0ea5e9" opacity="0.3" />

        {/* Cities dots */}
        {cities.map((city) => (
          <g key={city.name}>
            <circle
              cx={city.x}
              cy={city.y}
              r={city.isCapital ? 1.5 : 0.8}
              fill={city.isCapital ? "#f97316" : "#737373"}
              className="transition-all duration-300"
            />
            <text
              x={city.x}
              y={city.y - 2}
              fontSize="2.5"
              fill="#a3a3a3"
              textAnchor="middle"
              className="pointer-events-none"
            >
              {city.name}
            </text>
          </g>
        ))}

        {/* Ocean label */}
        <text x="50" y="96" fontSize="3" fill="#0ea5e9" textAnchor="middle" opacity="0.5">
          Ocean Atlantique
        </text>
      </svg>

      {/* Location markers */}
      {locations.map((location) => {
        const pos = getLocationPosition(location)
        const isSelected = selectedLocation === location.id
        const isHovered = hoveredLocation === location.id
        const IconComponent = getLocationIcon(location.filters)

        return (
          <button
            key={location.id}
            onClick={() => onSelectLocation(location.id)}
            onMouseEnter={() => setHoveredLocation(location.id)}
            onMouseLeave={() => setHoveredLocation(null)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 ${
              isSelected || isHovered ? "scale-150 z-20" : "scale-100"
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className={`relative ${isSelected ? "animate-pulse" : ""}`}>
              {/* Marker pin */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isSelected 
                  ? "bg-primary shadow-lg shadow-primary/50" 
                  : isHovered
                    ? "bg-primary/80"
                    : "bg-secondary/90 border border-primary/50"
              }`}>
                <IconComponent className={`h-4 w-4 ${isSelected || isHovered ? "text-white" : "text-primary"}`} />
              </div>
              
              {/* Pulse effect for selected */}
              {isSelected && (
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              )}
              
              {/* Tooltip on hover */}
              {(isHovered || isSelected) && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-12 whitespace-nowrap bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-border z-30">
                  <p className="text-xs font-medium text-foreground">{location.name}</p>
                  <p className="text-[10px] text-muted-foreground">{location.city}</p>
                </div>
              )}
            </div>
          </button>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-2">
        <p className="font-medium text-foreground mb-2">Legende</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Selectionne</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Urbain</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Waves className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Plage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trees className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Nature</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Landmark className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Historique</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Home className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Traditionnel</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-3 left-3 right-3">
        <h3 className="text-sm font-semibold text-foreground">Carte des Decors - Cote d&apos;Ivoire</h3>
        <p className="text-xs text-muted-foreground">Cliquez sur un marqueur pour voir les details</p>
      </div>
    </div>
  )
}
