"use client"

import { useRef } from "react"
import { Clapperboard, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ProfessionalCardProps {
  member: {
    id: string
    name: string
    role: string
    category: "A" | "B" | "C"
    title?: string
    photo?: string
  }
  showActions?: boolean
  size?: "sm" | "md" | "lg"
}

export function ProfessionalCard({ member, showActions = true, size = "md" }: ProfessionalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const sizeClasses = {
    sm: "w-[200px] h-[320px]",
    md: "w-[280px] h-[440px]",
    lg: "w-[320px] h-[500px]"
  }
  
  const photoSizes = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-32 h-32"
  }
  
  const textSizes = {
    sm: { name: "text-lg", role: "text-xs", badge: "text-[10px] px-2 py-0.5", id: "text-[10px]" },
    md: { name: "text-xl", role: "text-sm", badge: "text-xs px-3 py-1", id: "text-xs" },
    lg: { name: "text-2xl", role: "text-base", badge: "text-sm px-4 py-1.5", id: "text-sm" }
  }
  
  // Generate unique QR code data URL based on member ID
  const generateQRCodeSVG = (data: string) => {
    // Create a simple QR-like pattern based on the member ID
    const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const size = 7
    const cells: boolean[][] = []
    
    for (let i = 0; i < size; i++) {
      cells[i] = []
      for (let j = 0; j < size; j++) {
        // Create deterministic pattern based on hash
        cells[i][j] = ((hash + i * j + i + j) % 3) !== 0
      }
    }
    
    // Add finder patterns (corners)
    const addFinderPattern = (startX: number, startY: number) => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (startX + i < size && startY + j < size) {
            cells[startY + j][startX + i] = i === 1 && j === 1 ? true : (i === 0 || i === 2 || j === 0 || j === 2)
          }
        }
      }
    }
    
    addFinderPattern(0, 0)
    addFinderPattern(size - 3, 0)
    addFinderPattern(0, size - 3)
    
    return cells
  }
  
  const qrCells = generateQRCodeSVG(member.id)
  
  const handlePrint = () => {
    if (cardRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Carte Professionnelle - ${member.name}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh;
                  background: #f5f5f5;
                }
                .card {
                  width: 85.6mm;
                  height: 140mm;
                  background: linear-gradient(180deg, #1a0a0a 0%, #0a0a0a 30%, #0a0a0a 100%);
                  border-radius: 12px;
                  padding: 20px;
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  color: white;
                  font-family: system-ui, -apple-system, sans-serif;
                  position: relative;
                  overflow: hidden;
                }
                .card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 120px;
                  background: linear-gradient(180deg, rgba(220, 38, 38, 0.3) 0%, transparent 100%);
                }
                .header {
                  width: 100%;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  position: relative;
                  z-index: 1;
                  margin-bottom: 20px;
                }
                .icon {
                  width: 32px;
                  height: 32px;
                  color: #dc2626;
                }
                .category {
                  background: rgba(255,255,255,0.1);
                  border: 1px solid rgba(255,255,255,0.2);
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 11px;
                  font-weight: 500;
                }
                .photo-container {
                  width: 100px;
                  height: 100px;
                  border-radius: 50%;
                  border: 3px solid #dc2626;
                  overflow: hidden;
                  margin-bottom: 16px;
                  position: relative;
                  z-index: 1;
                }
                .photo {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
                .name {
                  font-size: 22px;
                  font-weight: 700;
                  margin-bottom: 4px;
                  text-align: center;
                }
                .role {
                  color: #dc2626;
                  font-size: 14px;
                  font-weight: 500;
                  margin-bottom: 12px;
                }
                .title {
                  background: rgba(255,255,255,0.1);
                  padding: 6px 16px;
                  border-radius: 20px;
                  font-size: 12px;
                  margin-bottom: auto;
                }
                .id-section {
                  width: calc(100% + 40px);
                  margin: 0 -20px -20px;
                  padding: 16px 20px;
                  background: rgba(20, 20, 20, 0.8);
                  border-top: 1px solid rgba(255,255,255,0.1);
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-top: 20px;
                }
                .id-label {
                  font-size: 10px;
                  color: rgba(255,255,255,0.6);
                  margin-bottom: 2px;
                }
                .id-value {
                  font-size: 13px;
                  font-weight: 600;
                  color: #dc2626;
                }
                .qr-code {
                  width: 50px;
                  height: 50px;
                  background: white;
                  border-radius: 4px;
                  padding: 4px;
                }
                @media print {
                  body { background: white; }
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4z"/>
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
                    <rect x="8" y="8" width="8" height="8" rx="1"/>
                  </svg>
                  <span class="category">CATÉGORIE ${member.category}</span>
                </div>
                <div class="photo-container">
                  <img class="photo" src="${member.photo || '/placeholder.svg'}" alt="${member.name}" />
                </div>
                <div class="name">${member.name}</div>
                <div class="role">${member.role}</div>
                ${member.title ? `<div class="title">${member.title}</div>` : ''}
                <div class="id-section">
                  <div>
                    <div class="id-label">ID MEMBRE</div>
                    <div class="id-value">${member.id}</div>
                  </div>
                  <div class="qr-code">
                    <svg viewBox="0 0 70 70" fill="none">
                      ${qrCells.map((row, y) => 
                        row.map((cell, x) => 
                          cell ? `<rect x="${x * 10}" y="${y * 10}" width="10" height="10" fill="black"/>` : ''
                        ).join('')
                      ).join('')}
                    </svg>
                  </div>
                </div>
              </div>
              <script>window.onload = () => window.print();</script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card */}
      <div 
        ref={cardRef}
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden relative flex flex-col`}
        style={{
          background: 'linear-gradient(180deg, #1a0a0a 0%, #0a0a0a 30%, #0a0a0a 100%)'
        }}
      >
        {/* Red gradient overlay at top */}
        <div 
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(220, 38, 38, 0.35) 0%, transparent 100%)'
          }}
        />
        
        {/* Header */}
        <div className="relative z-10 flex justify-between items-start p-4">
          <Clapperboard className="w-8 h-8 text-red-600" />
          <span className={`${textSizes[size].badge} rounded-full bg-white/10 border border-white/20 text-white/90 font-medium`}>
            CATÉGORIE {member.category}
          </span>
        </div>
        
        {/* Photo */}
        <div className="relative z-10 flex justify-center mt-2">
          <div className={`${photoSizes[size]} rounded-full border-[3px] border-red-600 overflow-hidden`}>
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
        </div>
        
        {/* Name & Role */}
        <div className="relative z-10 text-center mt-4 px-4">
          <h3 className={`${textSizes[size].name} font-bold text-white`}>{member.name}</h3>
          <p className={`${textSizes[size].role} text-red-500 font-medium mt-1`}>{member.role}</p>
          
          {member.title && (
            <span className={`inline-block mt-3 ${textSizes[size].badge} rounded-full bg-white/10 text-white/80`}>
              {member.title}
            </span>
          )}
        </div>
        
        {/* ID Section */}
        <div className="mt-auto relative z-10">
          <div className="bg-[#141414]/90 border-t border-white/10 px-4 py-3 flex justify-between items-center">
            <div>
              <p className={`${textSizes[size].id} text-white/50 font-medium`}>ID MEMBRE</p>
              <p className={`${textSizes[size].role} text-red-500 font-semibold`}>{member.id}</p>
            </div>
            
            {/* QR Code */}
            <div className="bg-white rounded p-1.5">
              <svg 
                viewBox="0 0 70 70" 
                className={size === "sm" ? "w-10 h-10" : size === "md" ? "w-12 h-12" : "w-14 h-14"}
              >
                {qrCells.map((row, y) => 
                  row.map((cell, x) => 
                    cell ? (
                      <rect 
                        key={`${x}-${y}`}
                        x={x * 10} 
                        y={y * 10} 
                        width="10" 
                        height="10" 
                        fill="black"
                      />
                    ) : null
                  )
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      )}
    </div>
  )
}
