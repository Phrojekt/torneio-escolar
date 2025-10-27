"use client"

import { useState, useEffect, useRef } from "react"
import { getOptimizedImageUrl } from "@/lib/image-utils"

interface BannerDuplaProps {
  dupla: any
  className?: string
  showTag?: boolean
  // 'auto' will pick cover/contain based on container vs image aspect ratios
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'auto'
}

export const BannerDupla = ({ dupla, className = "", showTag = true, objectFit = 'auto' }: BannerDuplaProps) => {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [computedFit, setComputedFit] = useState<'cover' | 'contain' | 'fill' | 'scale-down'>('cover');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Conectar diretamente ao S3 - sem fallback de proxy
  const { primary } = getOptimizedImageUrl(dupla?.bannerUrl);
  
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('❌ Imagem S3 falhou, usando fallback textual:', {
      duplaTag: dupla?.tag,
      tentativaUrl: event.currentTarget.src,
      originalUrl: dupla?.bannerUrl
    });
    setImagemFalhou(true);
    setCarregando(false);
  };
  
  // Função para calcular melhor objectFit com base nas proporções
  const computeBestFit = (imgW?: number, imgH?: number, contW?: number, contH?: number) => {
    if (!imgW || !imgH || !contW || !contH) return 'cover';
    const imgRatio = imgW / imgH;
    const contRatio = contW / contH;
    const ratioDiff = Math.abs(imgRatio - contRatio) / Math.max(imgRatio, contRatio);
    // Se a diferença de proporção for grande, usar contain para não cortar conteúdo
    if (ratioDiff > 0.18) return 'contain';
    return 'cover';
  }

  // Reset do estado quando a dupla mudar
  useEffect(() => {
    setImagemFalhou(false);
    setCarregando(true);
  }, [dupla?.id, dupla?.bannerUrl]);

  // Setup ResizeObserver para recalcular quando o container muda
  useEffect(() => {
    let ro: ResizeObserver | null = null;
    const el = (containerRef as any)?.current;
    if (el && (window as any).ResizeObserver) {
      ro = new ResizeObserver(() => {
        const imgEl = (imgRef as any)?.current;
        const contRect = el.getBoundingClientRect();
        const contW = contRect.width;
        const contH = contRect.height;
        const imgW = imgEl?.naturalWidth;
        const imgH = imgEl?.naturalHeight;
        if (objectFit === 'auto') {
          const best = computeBestFit(imgW, imgH, contW, contH) as any;
          setComputedFit(best);
        }
      });
      ro.observe(el);
    }
  return () => { if (ro && el) ro.unobserve(el); };
  }, [objectFit]);

  // Handler de load que atualiza o computedFit imediatamente
  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgEl = e.currentTarget;
    const contEl = (containerRef as any)?.current;
    const imgW = imgEl.naturalWidth;
    const imgH = imgEl.naturalHeight;
    const contRect = contEl?.getBoundingClientRect();
    const contW = contRect?.width;
    const contH = contRect?.height;
    
    console.log('✅ IMAGEM S3 CARREGADA:', {
      duplaTag: dupla?.tag,
      loadedUrl: imgEl.src,
      originalUrl: dupla?.bannerUrl,
      dimensions: `${imgW}x${imgH}`,
      complete: imgEl.complete
    });
    
    if (objectFit === 'auto') {
      const best = computeBestFit(imgW, imgH, contW, contH) as any;
      setComputedFit(best);
    }
    setImagemFalhou(false);
    setCarregando(false);
  }

  // Verificar se tem banner válido
  const temBanner = dupla?.bannerUrl && !imagemFalhou;

  if (temBanner) {
    console.log('✅ Exibindo imagem S3:', {
      primary,
      originalUrl: dupla?.bannerUrl,
      duplaId: dupla?.id,
      duplaTag: dupla?.tag,
      isS3: primary?.includes('s3.amazonaws.com')
    });
    
    return (
      <div ref={containerRef as any} className="banner-dupla-container w-full h-full relative overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center banner-mobile-large sm:banner-tablet lg:banner-desktop">
        {/* Loading placeholder */}
        {carregando && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-gray-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        )}
        
        <img 
          key={dupla.id}
          src={primary} 
          alt={`Banner da dupla ${dupla.tag}`}
          ref={imgRef as any}
          onLoad={onImgLoad}
          className={`banner-dupla-image w-full h-full object-center transition-all duration-500 ease-out banner-aspect-mobile sm:banner-aspect-tablet lg:banner-aspect-desktop ${
            carregando 
              ? 'opacity-0 scale-95' 
              : 'opacity-100 scale-100 hover:scale-[1.02] hover:brightness-105 hover:contrast-105'
          }`}
          style={{
            imageRendering: 'optimizeQuality' as any,
            objectFit: objectFit === 'auto' ? computedFit : objectFit,
            objectPosition: 'center center',
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
            filter: carregando ? 'none' : 'brightness(1.05) contrast(1.08) saturate(1.1)',
            transformOrigin: 'center center'
          }}
          onError={handleImageError}
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
