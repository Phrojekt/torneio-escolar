"use client"

import { useState } from "react"

interface BannerDuplaProps {
  dupla: any
  className?: string
  showTag?: boolean
}

export const BannerDupla = ({ dupla, className = "", showTag = true }: BannerDuplaProps) => {
  const [imagemFalhou, setImagemFalhou] = useState(false)
  
  const handleImageError = () => {
    setImagemFalhou(true)
  }
  
  // Se tem banner válido e não falhou, mostrar imagem
  if (dupla?.bannerUrl && !imagemFalhou) {
    return (
      <div className={`w-full h-full relative overflow-hidden rounded-lg ${className}`}>
        <img 
          src={dupla.bannerUrl} 
          alt={`Banner da dupla ${dupla.tag}`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
    )
  }
  
  // Fallback - mostrar tag da dupla
  return (
    <div className={`bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 border-2 border-blue-300 flex items-center justify-center rounded-lg p-4 ${className}`}>
      {showTag && (
        <p className="font-bold text-gray-800 text-center">
          {dupla?.tag || 'TAG'}
        </p>
      )}
    </div>
  )
}
