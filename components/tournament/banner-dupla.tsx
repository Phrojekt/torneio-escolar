"use client"

import { useState } from "react"

interface BannerDuplaProps {
  dupla: any
  className?: string
  showTag?: boolean
}

export const BannerDupla = ({ dupla, className = "", showTag = true }: BannerDuplaProps) => {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  
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
      }, 3000);
    } else {
      setImagemFalhou(true);
    }
  };
  
  if (temBanner) {
    console.log('✅ Exibindo imagem:', dupla.bannerUrl);
    
    // Adicionar key para forçar re-render quando tentativas mudar
    return (
      <img 
        key={`${dupla.id}-${tentativas}`}
        src={dupla.bannerUrl} 
        alt={`Banner da dupla ${dupla.tag}`}
        className={`object-cover ${className}`}
        onError={handleImageError}
        onLoad={() => {
          console.log('✅ Imagem carregada com sucesso:', dupla.bannerUrl);
          setImagemFalhou(false);
          setTentativas(0); // Reset tentativas em caso de sucesso
        }}
      />
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
