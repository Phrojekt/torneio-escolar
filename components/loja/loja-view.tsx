"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Crown } from "lucide-react"
import { BannerDupla } from "@/components/tournament/banner-dupla"
import { Dupla } from "@/types/torneio"

interface LojaViewProps {
  torneio: any
  showComprarButton?: boolean
}

export function LojaView({ torneio, showComprarButton = true }: LojaViewProps) {
  const jambaVIP = torneio.getDuplasPorCategoria('JambaVIP')
  const jamberlinda = torneio.getDuplasPorCategoria('Jamberlinda')
  const aguardando = torneio.getDuplasAguardando()

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 max-w-6xl mx-auto relative">

      {/* Mascote da Lojinha - Fora do card para não ser cortado */}
      <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-20 h-20 sm:w-32 sm:h-32 z-50">
        <img
          src="/shop_crazy.png"
          alt="Mascote da Lojinha"
          className="w-full h-full object-contain animate-bounce"
          style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))" }}
        />
      </div>

      {/* Balão de fala do mascote */}
      <div className="absolute top-2 right-16 sm:right-28 bg-white rounded-2xl p-2 sm:p-3 shadow-lg border-2 border-yellow-300 z-30 hidden sm:block">
        <div className="text-xs sm:text-sm font-bold text-gray-800 whitespace-nowrap">
          🎪 Bem-vindos à minha loja!
        </div>
        <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
      </div>

      {/* Loja Misteriosa */}
      <Card className="border-0 shadow-lg sm:shadow-xl lg:shadow-2xl bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 relative">
          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-base sm:text-lg lg:text-2xl font-black">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <span>Lojinha Misteriosa</span>
          </CardTitle>
          <CardDescription className="text-slate-200 font-semibold text-xs sm:text-sm lg:text-base">
            {showComprarButton ? 'Use suas moedas para comprar itens especiais' : 'Veja os itens especiais disponíveis'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 lg:p-6">
          {/* Container com scroll horizontal otimizado */}
          <div className="overflow-x-auto custom-scrollbar hover-scale-container">
            <div className="flex gap-3 sm:gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 xl:gap-6 min-w-full scroll-smooth-x p-1 sm:p-2">
              {torneio.itensLoja.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-64 sm:w-72 lg:w-auto p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover-scale-item"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Imagem do Item */}
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden bg-orange-200 flex items-center justify-center">
                      {item.imagem ? (
                        <img
                          src={item.imagem}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${item.imagem ? 'hidden' : 'flex'}`}>
                        <span className="text-orange-400 text-xl sm:text-2xl lg:text-3xl font-bold">
                          {item.nome?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Conteúdo do Item */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm sm:text-base lg:text-xl text-gray-800 mb-2 line-clamp-1">{item.nome}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 font-semibold line-clamp-2 lg:line-clamp-3">{item.descricao}</p>
                      
                      {/* Quantidade Disponível */}
                      <div className="mb-2 sm:mb-3 lg:mb-4">
                        <span className={`text-xs sm:text-sm font-bold px-2 py-1 rounded-full ${
                          item.quantidadeDisponivel <= 0 
                            ? 'bg-red-100 text-red-600' 
                            : item.quantidadeDisponivel <= 5 
                              ? 'bg-yellow-100 text-yellow-600' 
                              : 'bg-green-100 text-green-600'
                        }`}>
                          {item.quantidadeDisponivel <= 0 
                            ? 'Esgotado' 
                            : `${item.quantidadeDisponivel} ${item.quantidadeDisponivel === 1 ? 'disponível' : 'disponíveis'}`
                          }
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                        <span className="text-base sm:text-lg lg:text-2xl font-black text-orange-600">{item.preco} moedas</span>
                        {showComprarButton && (
                          <Button 
                            className="w-full sm:w-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-3 sm:px-4 lg:px-6 py-1 sm:py-2 text-xs sm:text-sm lg:text-base touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantidadeDisponivel <= 0}
                          >
                            {item.quantidadeDisponivel <= 0 ? 'Esgotado' : 'Comprar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorias Especiais */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 xl:gap-6">
        {/* JambaVIP */}
        <Card className="border-0 shadow-lg sm:shadow-xl lg:shadow-2xl bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
          <CardHeader className="text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4" style={{ backgroundColor: "#AEE1F9" }}>
            <CardTitle className="text-sm sm:text-base lg:text-xl font-black">JambaVIP</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 lg:p-6">
            <div className="space-y-2 sm:space-y-3 lg:space-y-4 max-h-48 sm:max-h-56 lg:max-h-80 overflow-y-auto">
              {jambaVIP.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 mx-auto text-purple-300 mb-2" />
                  <p className="text-purple-600 font-bold text-sm">Categoria vazia</p>
                </div>
              ) : (
                jambaVIP.slice(0, 2).map((dupla: Dupla) => (
                  <div key={dupla.id} className="p-4 rounded-2xl border-2" style={{ backgroundColor: "#F0F8FF", borderColor: "#AEE1F9" }}>
                    <div className="mb-2">
                      <BannerDupla 
                        dupla={dupla} 
                        className="w-full h-12 rounded-lg text-sm"
                      />
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">{dupla.pontos} pontos • {dupla.moedas} moedas</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jamberlinda */}
        <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="text-white px-6 py-4" style={{ backgroundColor: "#AEE1F9" }}>
            <CardTitle className="text-xl font-black">Jamberlinda</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {jamberlinda.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 mx-auto mb-2" style={{ color: "#AEE1F9" }} />
                  <p className="font-bold text-sm" style={{ color: "#AEE1F9" }}>Categoria vazia</p>
                </div>
              ) : (
                jamberlinda.slice(0, 2).map((dupla: Dupla) => (
                  <div key={dupla.id} className="p-4 rounded-2xl border-2" style={{ backgroundColor: "#F0F8FF", borderColor: "#AEE1F9" }}>
                    <div className="mb-2">
                      <BannerDupla 
                        dupla={dupla} 
                        className="w-full h-12 rounded-lg text-sm"
                      />
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">{dupla.pontos} pontos • {dupla.moedas} moedas</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duplas Aguardando */}
      <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-4">
          <CardTitle className="text-xl font-black">Duplas Aguardando Resultado</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="overflow-x-auto">
            <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-3 gap-4 min-w-full">
              {aguardando.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="w-12 h-12 mx-auto bg-yellow-300 rounded-full flex items-center justify-center mb-2">
                    <span className="text-yellow-800 font-bold">!</span>
                  </div>
                  <p className="text-yellow-600 font-bold text-sm">Nenhuma dupla aguardando resultado</p>
                </div>
              ) : (
                aguardando.map((dupla: Dupla) => (
                  <div key={dupla.id} className="flex-shrink-0 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl text-center border-2 border-yellow-200 min-w-48">
                    <div className="mb-2">
                      <BannerDupla 
                        dupla={dupla} 
                        className="w-full h-12 rounded-lg text-sm mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">Aguardando...</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
