"use client"

import { useState } from "react"

interface BannerDuplaProps {
  dupla: any
  className?: string
  showTag?: boolean
}

export const BannerDupla = ({ dupla, className = "", showTag = true }: BannerDuplaProps) => {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  
  // Debug: verificar dados da dupla
  console.log('🖼️ BannerDupla render:', { 
    tag: dupla?.tag, 
    bannerUrl: dupla?.bannerUrl, 
    imagemFalhou 
  });
  
  // Verificar se há banner válido
  const temBanner = dupla?.bannerUrl && dupla.bannerUrl.trim() !== '' && !imagemFalhou;
  
  if (temBanner) {
    return (
      <img 
        src={dupla.bannerUrl} 
        alt={`Banner da dupla ${dupla.tag}`}
        className={`object-cover ${className}`}
        onError={() => {
          console.error('❌ Erro ao carregar imagem:', dupla.bannerUrl);
          setImagemFalhou(true);
        }}
        onLoad={() => {
          console.log('✅ Imagem carregada com sucesso:', dupla.bannerUrl);
          setImagemFalhou(false);
        }}
      />
    )
  }
  
  // Fallback - sempre mostrar
  return (
    <div className={`bg-gradient-to-r from-blue-200 to-purple-200 border-2 border-blue-300 flex items-center justify-center rounded-lg p-2 ${className}`}>
      {showTag && (
        <p className="font-black text-gray-800 text-center text-xs sm:text-sm">
          {dupla?.tag || 'TAG'}
        </p>
      )}
    </div>
  )
}
