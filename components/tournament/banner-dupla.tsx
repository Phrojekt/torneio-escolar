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
      <div className="banner-dupla-container w-full h-full relative overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center banner-mobile-large sm:banner-tablet lg:banner-desktop">
        {/* Loading placeholder */}
        {carregando && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-gray-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        )}
        
        <img 
          key={`${dupla.id}-${tentativas}`}
          src={dupla.bannerUrl} 
          alt={`Banner da dupla ${dupla.tag}`}
          className={`banner-dupla-image w-full h-full object-${objectFit} object-center transition-all duration-500 ease-out banner-aspect-mobile sm:banner-aspect-tablet lg:banner-aspect-desktop ${
            carregando 
              ? 'opacity-0 scale-95' 
              : 'opacity-100 scale-100 hover:scale-[1.02] hover:brightness-105 hover:contrast-105'
          }`}
          style={{
            imageRendering: 'optimizeQuality' as any,
            filter: carregando ? 'none' : 'brightness(1.05) contrast(1.08) saturate(1.1)',
            transformOrigin: 'center center'
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
    <div className={`banner-dupla-container bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 border-2 border-blue-300 flex items-center justify-center rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md banner-mobile-large sm:banner-tablet lg:banner-desktop ${className}`}>
      {showTag && (
        <p className="font-bold text-gray-800 text-center text-sm sm:text-base md:text-lg leading-tight line-clamp-2">
          {dupla?.tag || 'TAG'}
        </p>
      )}
    </div>
  )
}
