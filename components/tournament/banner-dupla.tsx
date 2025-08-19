"use client"

import { useState } from "react"

interface BannerDuplaProps {
  dupla: any
  className?: string
  showTag?: boolean
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down'
}

export const BannerDupla = ({ dupla, className = "", showTag = true, objectFit = 'cover' }: BannerDuplaProps) => {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [imagemCarregada, setImagemCarregada] = useState(false);
  
  // Debug: verificar dados da dupla
  console.log('🖼️ BannerDupla render:', { 
    tag: dupla?.tag, 
    bannerUrl: dupla?.bannerUrl, 
    imagemFalhou,
    tentativas,
    duplaCompleta: dupla 
  });
  
  // Verificar se há banner válido
  const temBanner = dupla?.bannerUrl && dupla.bannerUrl.trim() !== '' && !imagemFalhou;
  
  console.log('🔍 Verificação de banner:', { 
    temBanner, 
    bannerUrlValida: dupla?.bannerUrl && dupla.bannerUrl.trim() !== '', 
    imagemFalhou,
    tentativas
  });
  
  const handleImageError = () => {
    console.error('❌ Erro ao carregar imagem (tentativa ' + (tentativas + 1) + '):', dupla.bannerUrl);
    
    // Se for uma URL do GitHub e não passou de 3 tentativas, tentar novamente após delay
    if (dupla?.bannerUrl?.includes('raw.githubusercontent.com') && tentativas < 3) {
      console.log('🔄 Tentando recarregar imagem em 3 segundos...');
      setTimeout(() => {
        setTentativas(prev => prev + 1);
        setImagemFalhou(false); // Reset para tentar novamente
        setCarregando(true); // Reset carregamento para nova tentativa
      }, 3000);
    } else {
      setImagemFalhou(true);
      setCarregando(false);
    }
  };
  
  if (temBanner) {
    console.log('✅ Exibindo imagem:', dupla.bannerUrl);
    
    // Adicionar key para forçar re-render quando tentativas mudar
    return (
      <div className="w-full h-full relative overflow-hidden rounded-lg bg-gray-100">
        {/* Loading placeholder */}
        {carregando && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img 
          key={`${dupla.id}-${tentativas}`}
          src={dupla.bannerUrl} 
          alt={`Banner da dupla ${dupla.tag}`}
          className={`w-full h-full object-${objectFit} object-center filter brightness-110 contrast-110 saturate-110 transition-all duration-300 hover:brightness-105 ${carregando ? 'opacity-0' : 'opacity-100'}`}
          style={{
            imageRendering: 'crisp-edges'
          }}
          onError={handleImageError}
          onLoad={() => {
            console.log('✅ Imagem carregada com sucesso:', dupla.bannerUrl);
            setImagemFalhou(false);
            setTentativas(0); // Reset tentativas em caso de sucesso
            setCarregando(false);
            setImagemCarregada(true);
          }}
        />
      </div>
    )
  }
  
  // Fallback - sempre mostrar
  console.log('🔄 Usando fallback para dupla:', dupla?.tag);
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
