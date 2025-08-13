"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, ShoppingBag, Medal, Star, Coins, Menu, X, Plus, Save, Users, Target, Crown, Trash2, LogOut, Calendar, Settings } from "lucide-react"
import { useTorneio } from "@/hooks/use-torneio"
import { Dupla } from "@/types/torneio"
import { toast } from "sonner"
import { inicializarTorneio } from "@/lib/inicializar-torneio"

export default function LoginPage() {
  const [userType, setUserType] = useState<"professor" | "aluno" | null>(null)
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    if (userType === "professor" && password === "admin123") {
      setIsLoggedIn(true)
    } else if (userType === "aluno") {
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserType(null)
    setPassword("")
  }

  if (isLoggedIn) {
    if (userType === "professor") {
      return <ProfessorDashboard onLogout={handleLogout} />
    } else {
      return <AlunoDashboard onLogout={handleLogout} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black mb-2">Torneio Escolar</CardTitle>
            <CardDescription className="text-blue-100 font-semibold text-sm sm:text-base">
              Sistema de Acompanhamento
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-base sm:text-lg font-bold text-gray-700">Tipo de Usuário</Label>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={userType === "professor" ? "default" : "outline"}
                onClick={() => setUserType("professor")}
                className={`h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base ${userType === "professor"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                👨‍🏫 Professor
              </Button>
              <Button
                variant={userType === "aluno" ? "default" : "outline"}
                onClick={() => setUserType("aluno")}
                className={`h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base ${userType === "aluno"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                👨‍🎓 Aluno
              </Button>
            </div>
          </div>

          {userType === "professor" && (
            <div className="space-y-3">
              <Label className="text-base sm:text-lg font-bold text-gray-700">Senha</Label>
              <Input
                type="password"
                placeholder="Digite a senha do professor"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 sm:h-14 rounded-xl border-2 border-gray-300 text-sm sm:text-base"
              />
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!userType || (userType === "professor" && !password)}
            className="w-full h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            ENTRAR
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfessorDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("gerenciar")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const torneio = useTorneio()

  if (torneio.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Carregando dados do torneio...</p>
          </div>
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: "gerenciar", label: "Gerenciar", icon: Target },
    { id: "duplas", label: "Duplas", icon: Users },
    { id: "rodadas", label: "Rodadas", icon: Calendar },
    { id: "bonus", label: "Bônus", icon: Star },
    { id: "rankings", label: "Rankings", icon: Trophy },
    { id: "loja", label: "Loja", icon: ShoppingBag },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-800">Torneio Escolar</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold">Painel do Professor</p>
              </div>
            </div>

            {/* Botão de inicialização, logout e mobile menu */}
            <div className="flex items-center space-x-2">
              {torneio.duplas.length === 0 && (
                <Button
                  onClick={async () => {
                    try {
                      await inicializarTorneio()
                      toast.success("Torneio inicializado com dados de exemplo!")
                      torneio.recarregar()
                    } catch (error) {
                      toast.error("Erro ao inicializar torneio")
                    }
                  }}
                  className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Inicializar</span>
                </Button>
              )}


              <button
                className="sm:hidden p-2 rounded-lg bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden sm:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all ${activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}

              <Button
                onClick={onLogout}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </nav>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <div className="sm:hidden py-4 border-t">
              <div className="overflow-x-auto custom-scrollbar">
                <nav className="flex gap-2 pb-2 min-w-max scroll-smooth-x">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setIsMobileMenuOpen(false)
                        }}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all whitespace-nowrap touch-target ${activeTab === tab.id
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}

                  {/* Botão de logout no mobile */}
                  <button
                    onClick={() => {
                      onLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all bg-red-100 text-red-600 hover:bg-red-200 whitespace-nowrap touch-target"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 overflow-x-hidden">
        {activeTab === "gerenciar" && <GerenciamentoDuplas torneio={torneio} />}
        {activeTab === "duplas" && <GerenciamentoDuplasCompleto torneio={torneio} />}
        {activeTab === "rodadas" && <GerenciamentoRodadas torneio={torneio} />}
        {activeTab === "bonus" && <GerenciamentoBonus torneio={torneio} />}
        {activeTab === "rankings" && <RankingsManager torneio={torneio} />}
        {activeTab === "loja" && <LojaManager torneio={torneio} />}
      </main>
    </div>
  )
}

function AlunoDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("geral")
  const [menuOpen, setMenuOpen] = useState(false)
  const torneio = useTorneio()

  if (torneio.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Carregando dados do torneio...</p>
          </div>
        </Card>
      </div>
    )
  }

  const rankingGeral = torneio.getRankingGeral()
  const rodadas = torneio.rodadas

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300 overflow-x-hidden">
      <header className="bg-gradient-to-r from-orange-400 to-yellow-400 shadow-lg">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <h1
                className="text-lg sm:text-3xl font-black text-white drop-shadow-lg leading-tight"
                style={{ textShadow: "2px 2px 0px #000" }}
              >
                TORNEIO JAMBALAIA 2
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setActiveTab("loja")}
                className={`rounded-full px-3 py-2 sm:px-4 sm:py-3 font-bold text-xs sm:text-base flex items-center space-x-2 ${activeTab === "loja"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-orange-500 hover:bg-gray-100"
                  }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Lojinha</span>
              </Button>
              <Button
                onClick={onLogout}
                className="bg-slate-700 text-white border-0 rounded-full px-3 py-2 sm:px-6 sm:py-3 font-bold hover:bg-slate-800 text-xs sm:text-base flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-2 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8 overflow-x-hidden max-w-7xl mx-auto">
        {/* Mobile Navigation */}
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <div className="block sm:hidden">
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-full mb-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-full font-bold"
            >
              {menuOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
              Menu
            </Button>
            {menuOpen && (
              <div className="grid grid-cols-1 gap-2 mb-4 overflow-x-hidden">
                <Button
                  onClick={() => {
                    setActiveTab("geral")
                    setMenuOpen(false)
                  }}
                  className={`rounded-full px-4 py-3 font-bold text-sm ${activeTab === "geral"
                      ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                >
                  Rank Geral
                </Button>
                {rodadas.map((rodada) => (
                  <Button
                    key={rodada.id}
                    onClick={() => {
                      setActiveTab(rodada.id)
                      setMenuOpen(false)
                    }}
                    className={`rounded-full px-4 py-3 font-bold text-sm ${activeTab === rodada.id
                        ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                      }`}
                  >
                    {rodada.nome}
                  </Button>
                ))}
                {torneio.bonus?.map((bonus: any) => (
                  <Button
                    key={bonus.id}
                    onClick={() => {
                      setActiveTab(bonus.id)
                      setMenuOpen(false)
                    }}
                    className={`rounded-full px-4 py-3 font-bold text-sm ${activeTab === bonus.id
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                      }`}
                  >
                    ⭐ BÔNUS - {bonus.nome}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex gap-2 pb-2 min-w-max scroll-smooth-x">
                <Button
                  onClick={() => setActiveTab("geral")}
                  className={`rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0 touch-target ${activeTab === "geral"
                      ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                >
                  Rank Geral
                </Button>
                {rodadas.map((rodada) => (
                  <Button
                    key={rodada.id}
                    onClick={() => setActiveTab(rodada.id)}
                    className={`rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0 touch-target ${activeTab === rodada.id
                        ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                      }`}
                  >
                    {rodada.nome}
                  </Button>
                ))}
                {torneio.bonus?.map((bonus: any) => (
                  <Button
                    key={bonus.id}
                    onClick={() => setActiveTab(bonus.id)}
                    className={`rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0 touch-target ${activeTab === bonus.id
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                      }`}
                  >
                    ⭐ BÔNUS - {bonus.nome}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {activeTab === "geral" && <RankingTable title="Ranking Geral" data={rankingGeral} />}
        {rodadas.map((rodada) =>
          activeTab === rodada.id && (
            <RankingTable
              key={rodada.id}
              title={rodada.nome}
              data={torneio.getRankingPorRodada(rodada.id)}
              showRoundPoints={true}
            />
          )
        )}
        {torneio.bonus?.map((bonus: any) =>
          activeTab === bonus.id && (
            <RankingTable
              key={bonus.id}
              title={`BÔNUS - ${bonus.nome}`}
              data={torneio.getRankingPorBonus(bonus.id, bonus)}
              showBonusPoints={true}
            />
          )
        )}
        {activeTab === "loja" && <LojaView torneio={torneio} />}
      </main>
    </div>
  )
}

// Componente para gerenciar bônus
function GerenciamentoBonus({ torneio }: { torneio: any }) {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [bonusSelecionado, setBonusSelecionado] = useState<string | null>(null)
  const [partidasBonus, setPartidasBonus] = useState<any[]>([])

  // Estados para criação de partidas
  const [nomePartida, setNomePartida] = useState("")
  const [descricaoPartida, setDescricaoPartida] = useState("")
  const [pontuacaoMaxima, setPontuacaoMaxima] = useState("")
  const [multiplicadorPontos, setMultiplicadorPontos] = useState("")
  const [multiplicadorMoedas, setMultiplicadorMoedas] = useState("")
  const [multiplicadorMedalhas, setMultiplicadorMedalhas] = useState("")

  // Estados para pontuação
  const [duplaSelecionada, setDuplaSelecionada] = useState("")
  const [partidaSelecionada, setPartidaSelecionada] = useState("")
  const [pontosInseridos, setPontosInseridos] = useState("")
  const [moedasInseridas, setMoedasInseridas] = useState("")
  const [medalhasInseridas, setMedalhasInseridas] = useState("")

  const handleCriarBonus = async () => {
    try {
      if (!nome || !descricao) {
        toast.error("Preencha todos os campos!")
        return
      }

      await torneio.criarBonus(nome, descricao)
      setNome("")
      setDescricao("")
      toast.success("Bônus criado com sucesso!")
    } catch (error) {
      console.error("Erro ao criar bônus:", error)
      toast.error("Erro ao criar bônus")
    }
  }

  const handleCriarPartida = async () => {
    try {
      if (!bonusSelecionado || !nomePartida || !descricaoPartida || !pontuacaoMaxima || !multiplicadorPontos) {
        toast.error("Preencha todos os campos da partida!")
        return
      }

      await torneio.criarPartidaBonus(
        bonusSelecionado,
        nomePartida,
        descricaoPartida,
        parseInt(pontuacaoMaxima),
        parseFloat(multiplicadorPontos),
        parseFloat(multiplicadorMoedas) || 1,
        parseFloat(multiplicadorMedalhas) || 1
      )

      setNomePartida("")
      setDescricaoPartida("")
      setPontuacaoMaxima("")
      setMultiplicadorPontos("")
      setMultiplicadorMoedas("")
      setMultiplicadorMedalhas("")

      // Recarregar partidas
      if (bonusSelecionado) {
        const partidas = await torneio.buscarPartidasBonus(bonusSelecionado)
        setPartidasBonus(partidas)
      }

      toast.success("Partida criada com sucesso!")
    } catch (error) {
      console.error("Erro ao criar partida:", error)
      toast.error("Erro ao criar partida")
    }
  }

  const handleAdicionarPontuacao = async () => {
    try {
      if (!duplaSelecionada || !partidaSelecionada || !pontosInseridos) {
        toast.error("Preencha pelo menos a dupla, partida e pontos!")
        return
      }

      await torneio.adicionarPontuacaoBonus(
        duplaSelecionada,
        bonusSelecionado,
        partidaSelecionada,
        parseInt(pontosInseridos),
        parseInt(moedasInseridas) || 0,
        parseInt(medalhasInseridas) || 0
      )

      setDuplaSelecionada("")
      setPartidaSelecionada("")
      setPontosInseridos("")
      setMoedasInseridas("")
      setMedalhasInseridas("")

      toast.success("Pontuação adicionada com sucesso!")
    } catch (error) {
      console.error("Erro ao adicionar pontuação:", error)
      toast.error("Erro ao adicionar pontuação")
    }
  }

  const carregarPartidasBonus = async (bonusId: string) => {
    try {
      const partidas = await torneio.buscarPartidasBonus(bonusId)
      setPartidasBonus(partidas)
    } catch (error) {
      console.error("Erro ao carregar partidas:", error)
    }
  }

  const handleSelecionarBonus = (bonusId: string) => {
    setBonusSelecionado(bonusId)
    carregarPartidasBonus(bonusId)
  }

  const calcularPontuacaoComMultiplicador = (pontos: number, moedas: number, medalhas: number, partida: any) => {
    return {
      pontos: pontos * (partida?.multiplicadorPontos || 1),
      moedas: moedas * (partida?.multiplicadorMoedas || 1),
      medalhas: medalhas * (partida?.multiplicadorMedalhas || 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Criar Novo Bônus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Criar Novo Bônus
          </CardTitle>
          <CardDescription>
            Crie tabelas de bônus com multiplicadores para pontuações especiais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Bônus</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Bônus da Copa"
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o bônus..."
            />
          </div>
          <Button onClick={handleCriarBonus} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Criar Bônus
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Bônus Existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Bônus Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {torneio.bonus.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum bônus criado ainda</p>
            ) : (
              torneio.bonus.map((bonus: any) => (
                <div
                  key={bonus.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${bonusSelecionado === bonus.id ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  onClick={() => handleSelecionarBonus(bonus.id)}
                >
                  <div>
                    <h3 className="font-medium">BÔNUS - {bonus.nome}</h3>
                    <p className="text-sm text-gray-600">{bonus.descricao}</p>
                  </div>
                  <div className="flex gap-2">
                    {!bonus.ativo && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          torneio.ativarBonus(bonus.id)
                        }}
                        className="rounded-full bg-green-500 hover:bg-green-600 text-white font-bold"
                      >
                        Ativar
                      </Button>
                    )}
                    {bonus.ativo && (
                      <Button
                        size="sm"
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
                        disabled
                      >
                        Ativo
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gerenciar Partidas do Bônus Selecionado */}
      {bonusSelecionado && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Adicionar Partida ao Bônus
              </CardTitle>
              <CardDescription>
                Crie até 3 partidas com multiplicadores para o bônus selecionado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 sm:space-y-0">
                {/* Container com scroll horizontal para mobile */}
                <div className="overflow-x-auto">
                  <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-3 gap-4 min-w-full">
                    <div className="min-w-0">
                      <Label htmlFor="nomePartida">Nome da Partida</Label>
                      <Input
                        id="nomePartida"
                        value={nomePartida}
                        onChange={(e) => setNomePartida(e.target.value)}
                        placeholder="Ex: Pontuação 1"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <Label htmlFor="multiplicadorPontos">Multiplicador Pontos</Label>
                      <Input
                        id="multiplicadorPontos"
                        type="number"
                        step="0.1"
                        value={multiplicadorPontos}
                        onChange={(e) => setMultiplicadorPontos(e.target.value)}
                        placeholder="Ex: 2.0"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <Label htmlFor="multiplicadorMoedas">Multiplicador Moedas</Label>
                      <Input
                        id="multiplicadorMoedas"
                        type="number"
                        step="0.1"
                        value={multiplicadorMoedas}
                        onChange={(e) => setMultiplicadorMoedas(e.target.value)}
                        placeholder="Ex: 1.5 (opcional)"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-0">
                <div className="overflow-x-auto">
                  <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 gap-4 min-w-full">
                    <div className="min-w-0">
                      <Label htmlFor="multiplicadorMedalhas">Multiplicador Medalhas</Label>
                      <Input
                        id="multiplicadorMedalhas"
                        type="number"
                        step="0.1"
                        value={multiplicadorMedalhas}
                        onChange={(e) => setMultiplicadorMedalhas(e.target.value)}
                        placeholder="Ex: 1.0 (opcional)"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <Label htmlFor="pontuacaoMaxima">Pontuação Máxima</Label>
                      <Input
                        id="pontuacaoMaxima"
                        type="number"
                        value={pontuacaoMaxima}
                        onChange={(e) => setPontuacaoMaxima(e.target.value)}
                        placeholder="Ex: 100"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="descricaoPartida">Descrição da Partida</Label>
                <Textarea
                  id="descricaoPartida"
                  value={descricaoPartida}
                  onChange={(e) => setDescricaoPartida(e.target.value)}
                  placeholder="Descreva a partida..."
                />
              </div>
              <Button
                onClick={handleCriarPartida}
                className="w-full"
                disabled={partidasBonus.length >= 3}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Partida {partidasBonus.length >= 3 && "(Máximo atingido)"}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Partidas do Bônus */}
          <Card>
            <CardHeader>
              <CardTitle>Partidas do Bônus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partidasBonus.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma partida criada ainda</p>
                ) : (
                  partidasBonus.map((partida: any) => (
                    <div
                      key={partida.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{partida.nome}</h4>
                        <p className="text-sm text-gray-600">{partida.descricao}</p>
                        <p className="text-sm text-blue-600">
                          Multiplicadores: Pontos {partida.multiplicadorPontos}x | Moedas {partida.multiplicadorMoedas || 1}x | Medalhas {partida.multiplicadorMedalhas || 1}x
                        </p>
                        <p className="text-sm text-green-600">
                          Max: {partida.pontuacaoMaxima} pontos
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={partida.ativa ? "default" : "outline"}
                          onClick={() => torneio.alternarStatusPartida(partida.id, !partida.ativa)}
                        >
                          {partida.ativa ? "Ativa" : "Inativa"}
                        </Button>
                        {!partida.finalizada && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => torneio.finalizarPartida(partida.id)}
                          >
                            Finalizar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Adicionar Pontuação */}
          {partidasBonus.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5" />
                  Adicionar Pontuação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="duplaSelecionada">Selecionar Dupla</Label>
                    <Select value={duplaSelecionada} onValueChange={setDuplaSelecionada}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma dupla" />
                      </SelectTrigger>
                      <SelectContent>
                        {torneio.duplas.map((dupla: any) => (
                          <SelectItem key={dupla.id} value={dupla.id}>
                            {dupla.aluno1} & {dupla.aluno2}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="partidaSelecionada">Selecionar Partida</Label>
                    <Select value={partidaSelecionada} onValueChange={setPartidaSelecionada}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma partida" />
                      </SelectTrigger>
                      <SelectContent>
                        {partidasBonus.filter(p => p.ativa && !p.finalizada).map((partida: any) => (
                          <SelectItem key={partida.id} value={partida.id}>
                            {partida.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pontosInseridos">Pontos Base</Label>
                    <Input
                      id="pontosInseridos"
                      type="number"
                      value={pontosInseridos}
                      onChange={(e) => setPontosInseridos(e.target.value)}
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="moedasInseridas">Moedas Base</Label>
                    <Input
                      id="moedasInseridas"
                      type="number"
                      value={moedasInseridas}
                      onChange={(e) => setMoedasInseridas(e.target.value)}
                      placeholder="Ex: 10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medalhasInseridas">Medalhas Base</Label>
                    <Input
                      id="medalhasInseridas"
                      type="number"
                      value={medalhasInseridas}
                      onChange={(e) => setMedalhasInseridas(e.target.value)}
                      placeholder="Ex: 2"
                    />
                  </div>
                </div>

                {(pontosInseridos || moedasInseridas || medalhasInseridas) && partidaSelecionada && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Valores finais com multiplicadores:
                    </p>
                    {(() => {
                      const partida = partidasBonus.find(p => p.id === partidaSelecionada);
                      if (!partida) return null;

                      const pontos = parseInt(pontosInseridos || "0");
                      const moedas = parseInt(moedasInseridas || "0");
                      const medalhas = parseInt(medalhasInseridas || "0");

                      const resultado = calcularPontuacaoComMultiplicador(pontos, moedas, medalhas, partida);

                      return (
                        <div className="space-y-1">
                          <p className="text-sm text-blue-700">
                            <strong>Pontos:</strong> {pontos} × {partida.multiplicadorPontos} = {resultado.pontos}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Moedas:</strong> {moedas} × {partida.multiplicadorMoedas || 1} = {resultado.moedas}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Medalhas:</strong> {medalhas} × {partida.multiplicadorMedalhas || 1} = {resultado.medalhas}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <Button onClick={handleAdicionarPontuacao} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Adicionar Pontuação
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// Componente para gerenciar duplas - Adicionar pontuação
function GerenciamentoDuplas({ torneio }: { torneio: any }) {
  const [aluno1, setAluno1] = useState("")
  const [aluno2, setAluno2] = useState("")
  const [duplaId, setDuplaId] = useState("")
  const [pontos, setPontos] = useState("")
  const [moedas, setMoedas] = useState("")
  const [medalhas, setMedalhas] = useState("")
  const [rodadaSelecionada, setRodadaSelecionada] = useState("")

  const handleAdicionarPontuacao = async () => {
    try {
      if (!duplaId || !pontos || !moedas || !medalhas || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      await torneio.adicionarPontuacao(
        duplaId,
        parseInt(pontos),
        parseInt(moedas),
        parseInt(medalhas),
        rodadaSelecionada
      )

      toast.success("Pontuação adicionada com sucesso!")
      setPontos("")
      setMoedas("")
      setMedalhas("")
    } catch (error) {
      toast.error("Erro ao adicionar pontuação")
    }
  }

  const handleCriarDupla = async () => {
    try {
      if (!aluno1 || !aluno2) {
        toast.error("Preencha os nomes dos alunos!")
        return
      }

      await torneio.criarDupla(aluno1, aluno2)
      toast.success("Dupla criada com sucesso!")
      setAluno1("")
      setAluno2("")
    } catch (error) {
      toast.error("Erro ao criar dupla")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Criar Nova Dupla */}
      <Card className="border-0 shadow-lg sm:shadow-xl lg:shadow-2xl bg-white rounded-xl sm:rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-black flex items-center space-x-2">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Criar Nova Dupla</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="overflow-x-auto">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 min-w-full">
                <div className="flex-1 min-w-0">
                  <Label className="font-bold text-gray-700 text-sm">Aluno 1</Label>
                  <Input
                    placeholder="Nome do primeiro aluno"
                    value={aluno1}
                    onChange={(e) => setAluno1(e.target.value)}
                    className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="font-bold text-gray-700 text-sm">Aluno 2</Label>
                  <Input
                    placeholder="Nome do segundo aluno"
                    value={aluno2}
                    onChange={(e) => setAluno2(e.target.value)}
                    className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>
          <Button onClick={handleCriarDupla} className="w-full h-10 sm:h-12 rounded-full font-bold bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white mt-3 sm:mt-4 text-sm sm:text-base">
            CRIAR DUPLA
          </Button>
        </CardContent>
      </Card>

      {/* Adicionar Pontuação */}
      <Card className="border-0 shadow-lg sm:shadow-xl lg:shadow-2xl bg-white rounded-xl sm:rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-black flex items-center space-x-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Adicionar Pontuação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label className="font-bold text-gray-700 text-sm">Selecionar Dupla</Label>
              <Select value={duplaId} onValueChange={setDuplaId}>
                <SelectTrigger className="h-10 sm:h-12 rounded-full border-2 border-gray-300 text-sm sm:text-base">
                  <SelectValue placeholder="Escolha uma dupla" />
                </SelectTrigger>
                <SelectContent>
                  {torneio.duplas.map((dupla: Dupla) => (
                    <SelectItem key={dupla.id} value={dupla.id}>
                      {dupla.aluno1} & {dupla.aluno2}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 min-w-full">
                <div className="flex-1 min-w-0">
                  <Label className="font-bold text-gray-700 text-sm">Pontos</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={pontos}
                    onChange={(e) => setPontos(e.target.value)}
                    className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="font-bold text-gray-700 text-sm">Moedas</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={moedas}
                    onChange={(e) => setMoedas(e.target.value)}
                    className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="font-bold text-gray-700 text-sm">Medalhas</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={medalhas}
                    onChange={(e) => setMedalhas(e.target.value)}
                    className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="font-bold text-gray-700">Rodada</Label>
              <Select value={rodadaSelecionada} onValueChange={setRodadaSelecionada}>
                <SelectTrigger className="h-12 rounded-full border-2 border-gray-300">
                  <SelectValue placeholder="Selecione a rodada" />
                </SelectTrigger>
                <SelectContent>
                  {torneio.rodadas.map((rodada: any) => (
                    <SelectItem key={rodada.id} value={rodada.id}>
                      {rodada.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAdicionarPontuacao} className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white">
              ADICIONAR PONTUAÇÃO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ferramentas Administrativas */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <span>Ferramentas Administrativas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">Sincronizar Totais</h3>
              <p className="text-sm text-yellow-700 mb-4">
                Recalcula e sincroniza os totais de todas as duplas (rodadas + bônus).
                Use se houver inconsistências nos rankings.
              </p>
              <Button
                onClick={async () => {
                  try {
                    await torneio.sincronizarTodosTotais();
                    toast.success("Totais sincronizados com sucesso!");
                  } catch (error) {
                    toast.error("Erro ao sincronizar totais");
                  }
                }}
                className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white"
              >
                SINCRONIZAR TODOS OS TOTAIS
              </Button>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Recalcular Totais (Novo)</h3>
              <p className="text-sm text-green-700 mb-4">
                Recalcula totais usando a nova função otimizada que processa rodadas + bônus de uma vez.
              </p>
              <Button
                onClick={async () => {
                  try {
                    await torneio.recalcularTodosTotais('torneio-escolar-2024');
                    toast.success("Totais recalculados com sucesso!");
                  } catch (error) {
                    toast.error("Erro ao recalcular totais");
                  }
                }}
                className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white"
              >
                RECALCULAR TOTAIS (NOVO)
              </Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Diagnóstico de Dados</h3>
              <p className="text-sm text-blue-700 mb-4">
                Exibe informações detalhadas das duplas no console para debugging.
              </p>
              <Button
                onClick={() => {
                  console.log("=== DIAGNÓSTICO DE DUPLAS ===");
                  torneio.duplas.forEach((dupla: any, index: number) => {
                    console.log(`\nDupla ${index + 1}: ${dupla.aluno1} & ${dupla.aluno2}`);
                    console.log("Totais armazenados:", {
                      pontos: dupla.pontos,
                      moedas: dupla.moedas,
                      medalhas: dupla.medalhas
                    });
                    console.log("Por rodada:", {
                      pontos: dupla.pontosPorRodada,
                      moedas: dupla.moedasPorRodada,
                      medalhas: dupla.medalhasPorRodada
                    });
                    console.log("Por bônus:", {
                      pontos: dupla.pontosPorBonus,
                      moedas: dupla.moedasPorBonus,
                      medalhas: dupla.medalhasPorBonus
                    });
                  });
                  toast.success("Dados exibidos no console!");
                }}
                className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white"
              >
                DIAGNOSTICAR DADOS
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para gerenciar todas as duplas
function GerenciamentoDuplasCompleto({ torneio }: { torneio: any }) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>Todas as Duplas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {torneio.duplas.map((dupla: Dupla) => (
              <div key={dupla.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-lg text-gray-800">{dupla.aluno1} & {dupla.aluno2}</h3>
                  <p className="text-sm text-gray-600 font-semibold">
                    {dupla.pontos} pontos • {dupla.moedas} moedas • {dupla.medalhas} medalhas
                  </p>
                  <p className="text-xs text-gray-500">Status: {dupla.status}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => torneio.atualizarStatusDupla(dupla.id, 'aguardando')}
                    size="sm"
                    className="rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Aguardando
                  </Button>
                  <Button
                    onClick={() => torneio.atualizarStatusDupla(dupla.id, 'ativa')}
                    size="sm"
                    className="rounded-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Ativar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para mostrar rankings
function RankingsManager({ torneio }: { torneio: any }) {
  const [activeTab, setActiveTab] = useState("geral")

  const rankingGeral = torneio.getRankingGeral()
  const rodadas = torneio.rodadas
  const bonus = torneio.bonus

  return (
    <div className="space-y-6">
      {/* Navegação dos Rankings */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setActiveTab("geral")}
          className={`rounded-full px-6 py-3 font-bold ${activeTab === "geral"
              ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
        >
          Ranking Geral
        </Button>
        {rodadas.map((rodada: any) => (
          <Button
            key={rodada.id}
            onClick={() => setActiveTab(rodada.id)}
            className={`rounded-full px-6 py-3 font-bold ${activeTab === rodada.id
                ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
          >
            {rodada.nome}
          </Button>
        ))}
        {bonus.map((bonusItem: any) => (
          <Button
            key={`bonus-${bonusItem.id}`}
            onClick={() => setActiveTab(`bonus-${bonusItem.id}`)}
            className={`rounded-full px-6 py-3 font-bold ${activeTab === `bonus-${bonusItem.id}`
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
          >
            ⭐ BÔNUS - {bonusItem.nome}
          </Button>
        ))}
      </div>

      {/* Tabelas de Ranking */}
      {activeTab === "geral" && <RankingTable title="Ranking Geral" data={rankingGeral} />}
      {rodadas.map((rodada: any) =>
        activeTab === rodada.id && (
          <RankingTable
            key={rodada.id}
            title={rodada.nome}
            data={torneio.getRankingPorRodada(rodada.id)}
            showRoundPoints={true}
          />
        )
      )}
      {bonus.map((bonusItem: any) =>
        activeTab === `bonus-${bonusItem.id}` && (
          <RankingTable
            key={`bonus-table-${bonusItem.id}`}
            title={`BÔNUS - ${bonusItem.nome}`}
            data={torneio.getRankingPorBonus(bonusItem.id, bonusItem)}
            showBonusPoints={true}
          />
        )
      )}
    </div>
  )
}

// Componente para gerenciar a loja
function LojaManager({ torneio }: { torneio: any }) {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [preco, setPreco] = useState("")
  const [rodadaSelecionada, setRodadaSelecionada] = useState("")

  const handleAdicionarItem = async () => {
    try {
      if (!nome || !descricao || !preco || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      await torneio.adicionarItemLoja(nome, descricao, parseInt(preco), rodadaSelecionada)
      toast.success("Item adicionado com sucesso!")
      setNome("")
      setDescricao("")
      setPreco("")
    } catch (error) {
      toast.error("Erro ao adicionar item")
    }
  }

  return (
    <div className="space-y-6">
      {/* Adicionar Item */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black">Gerenciar Loja Misteriosa</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="font-bold text-gray-700">Nome do Item</Label>
              <Input
                placeholder="Ex: Poder Especial"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Descrição</Label>
              <Input
                placeholder="Ex: Dobra os pontos da próxima atividade"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Preço (moedas)</Label>
              <Input
                type="number"
                placeholder="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Rodada</Label>
              <Select value={rodadaSelecionada} onValueChange={setRodadaSelecionada}>
                <SelectTrigger className="h-12 rounded-full border-2 border-gray-300">
                  <SelectValue placeholder="Selecione a rodada" />
                </SelectTrigger>
                <SelectContent>
                  {torneio.rodadas.map((rodada: any) => (
                    <SelectItem key={rodada.id} value={rodada.id}>
                      {rodada.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdicionarItem} className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white">
              ADICIONAR ITEM
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Itens Disponíveis */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black">Itens Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {torneio.itensLoja.map((item: any) => (
              <div key={item.id} className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-orange-200 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-lg text-gray-800">{item.nome}</h3>
                  <p className="text-sm text-gray-600 font-semibold">{item.descricao}</p>
                  <p className="text-lg font-black text-orange-600">{item.preco} moedas</p>
                </div>
                <Button
                  onClick={() => torneio.removerItemLoja(item.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente da tabela de ranking
function RankingTable({
  title,
  data,
  showRoundPoints = false,
  showBonusPoints = false
}: {
  title: string;
  data: (Dupla & {
    pontosRodada?: number;
    moedasRodada?: number;
    medalhasRodada?: number;
    pontosBonus?: number;
    moedasBonus?: number;
    medalhasBonus?: number;
  })[];
  showRoundPoints?: boolean;
  showBonusPoints?: boolean;
}) {
  return (
    <div className="ranking-card table-container-responsive bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border-0 max-w-full">
      {title && (
        <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white text-center drop-shadow-lg">{title}</h2>
        </div>
      )}
      <div className="p-3 sm:p-4 lg:p-6 max-w-full overflow-hidden">
        {/* Container com scroll horizontal para mobile e desktop compacto */}
        <div className="overflow-x-auto custom-scrollbar mobile-scroll-container">
          <div className="min-w-full space-y-3 sm:space-y-4">
            {data.map((dupla, index) => {
              // Determinar quais valores exibir baseado no tipo de tabela
              let pontosParaExibir, moedasParaExibir, medalhasParaExibir;

              if (showBonusPoints) {
                // Para tabelas de bônus, mostrar apenas os valores do bônus
                pontosParaExibir = Number(dupla.pontosBonus) || 0;
                moedasParaExibir = Number(dupla.moedasBonus) || 0;
                medalhasParaExibir = Number(dupla.medalhasBonus) || 0;
              } else if (showRoundPoints) {
                // Para tabelas de rodada, mostrar apenas valores da rodada
                pontosParaExibir = Number(dupla.pontosRodada) || 0;
                moedasParaExibir = Number(dupla.moedasRodada) || 0;
                medalhasParaExibir = Number(dupla.medalhasRodada) || 0;
              } else {
                // Para ranking geral, mostrar totais
                pontosParaExibir = Number(dupla.pontos) || 0;
                moedasParaExibir = Number(dupla.moedas) || 0;
                medalhasParaExibir = Number(dupla.medalhas) || 0;
              }

              // Garantir que todos os valores são números válidos
              pontosParaExibir = isNaN(pontosParaExibir) ? 0 : pontosParaExibir;
              moedasParaExibir = isNaN(moedasParaExibir) ? 0 : moedasParaExibir;
              medalhasParaExibir = isNaN(medalhasParaExibir) ? 0 : medalhasParaExibir;

              return (
                <div
                  key={dupla.id}
                  className="ranking-card flex items-center gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border-2 border-transparent hover:border-pink-200 min-w-max mobile-scroll-item desktop-compact shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Posição - com gradiente da classe CSS */}
                  <div className="ranking-position w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-white text-sm sm:text-lg lg:text-xl flex-shrink-0">
                    {index + 1}°
                  </div>

                  {/* Nome da Dupla - sem cortes, texto completo */}
                  <div className="ranking-name-container rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 min-w-0 flex-1">
                    <p className="team-name-full table-text-proportional font-black text-gray-800 leading-tight">
                      {dupla.aluno1} & {dupla.aluno2}
                    </p>
                  </div>

                  {/* Estatísticas - com classes CSS customizadas */}
                  <div className="flex gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
                    {/* Medalhas */}
                    <div className="medals-badge stat-badge w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 touch-target">
                      <Medal className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mb-0.5" />
                      <span className="font-black text-xs sm:text-sm lg:text-base">{medalhasParaExibir}</span>
                    </div>

                    {/* Estrelas */}
                    <div className="stars-badge stat-badge w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 touch-target">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mb-0.5" />
                      <span className="font-black text-xs sm:text-sm lg:text-base">{Math.floor(pontosParaExibir / 100)}</span>
                    </div>

                    {/* Moedas */}
                    <div className="coins-badge stat-badge w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 touch-target">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mb-0.5" />
                      <span className="font-black text-xs sm:text-sm lg:text-base">{moedasParaExibir}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente da loja para alunos
function LojaView({ torneio }: { torneio: any }) {
  const jambaVIP = torneio.getDuplasPorCategoria('JambaVIP')
  const jamberlinda = torneio.getDuplasPorCategoria('Jamberlinda')
  const aguardando = torneio.getDuplasAguardando()

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 max-w-6xl mx-auto">
      {/* Loja Misteriosa */}
      <Card className="border-0 shadow-lg sm:shadow-xl lg:shadow-2xl bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-base sm:text-lg lg:text-2xl font-black">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <span>Lojinha Misteriosa</span>
          </CardTitle>
          <CardDescription className="text-slate-200 font-semibold text-xs sm:text-sm lg:text-base">
            Use suas moedas para comprar itens especiais
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 lg:p-6">
          {/* Container com scroll horizontal otimizado */}
          <div className="overflow-x-auto custom-scrollbar">
            <div className="flex gap-3 sm:gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 xl:gap-6 min-w-full scroll-smooth-x">
              {torneio.itensLoja.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-64 sm:w-72 lg:w-auto p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <h3 className="font-black text-sm sm:text-base lg:text-xl text-gray-800 mb-2 line-clamp-1">{item.nome}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4 font-semibold line-clamp-2 lg:line-clamp-3">{item.descricao}</p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <span className="text-base sm:text-lg lg:text-2xl font-black text-orange-600">{item.preco} moedas</span>
                    <Button className="w-full sm:w-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-3 sm:px-4 lg:px-6 py-1 sm:py-2 text-xs sm:text-sm lg:text-base touch-target">
                      Comprar
                    </Button>
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
          <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
            <CardTitle className="text-sm sm:text-base lg:text-xl font-black">JambaVIP</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 lg:p-6">
            <div className="space-y-2 sm:space-y-3 lg:space-y-4 max-h-48 sm:max-h-56 lg:max-h-80 overflow-y-auto">
              {jambaVIP.slice(0, 2).map((dupla: Dupla) => (
                <div key={dupla.id} className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200">
                  <p className="font-black text-gray-800">{dupla.aluno1} & {dupla.aluno2}</p>
                  <p className="text-sm text-gray-600 font-semibold">{dupla.pontos} pontos • {dupla.moedas} moedas</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jamberlinda */}
        <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-400 to-red-400 text-white px-6 py-4">
            <CardTitle className="text-xl font-black">Jamberlinda</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {jamberlinda.slice(0, 2).map((dupla: Dupla) => (
                <div key={dupla.id} className="p-4 bg-gradient-to-r from-pink-100 to-red-100 rounded-2xl border-2 border-pink-200">
                  <p className="font-black text-gray-800">{dupla.aluno1} & {dupla.aluno2}</p>
                  <p className="text-sm text-gray-600 font-semibold">{dupla.pontos} pontos • {dupla.moedas} moedas</p>
                </div>
              ))}
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
              {aguardando.map((dupla: Dupla) => (
                <div key={dupla.id} className="flex-shrink-0 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl text-center border-2 border-yellow-200 min-w-48">
                  <p className="font-black text-gray-800">{dupla.aluno1} & {dupla.aluno2}</p>
                  <p className="text-sm text-gray-600 font-semibold">Aguardando...</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para gerenciar rodadas
function GerenciamentoRodadas({ torneio }: { torneio: any }) {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [pontuacaoMaxima, setPontuacaoMaxima] = useState("")
  const [numero, setNumero] = useState("")

  const handleCriarRodada = async () => {
    try {
      if (!nome || !descricao || !pontuacaoMaxima || !numero) {
        toast.error("Preencha todos os campos!")
        return
      }

      await torneio.criarRodada(nome, parseInt(numero), descricao, parseInt(pontuacaoMaxima))
      toast.success("Rodada criada com sucesso!")
      setNome("")
      setDescricao("")
      setPontuacaoMaxima("")
      setNumero("")
    } catch (error) {
      toast.error("Erro ao criar rodada")
    }
  }

  return (
    <div className="space-y-6">
      {/* Criar Nova Rodada */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black flex items-center space-x-2">
            <Calendar className="w-6 h-6" />
            <span>Criar Nova Rodada</span>
          </CardTitle>
          <CardDescription className="text-indigo-100 font-semibold">
            Configure uma nova etapa do torneio
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold text-gray-700">Nome da Rodada</Label>
                <Input
                  placeholder="Ex: Bônus 4"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="rounded-full border-2 border-gray-300 h-12"
                />
              </div>
              <div>
                <Label className="font-bold text-gray-700">Número da Rodada</Label>
                <Input
                  type="number"
                  placeholder="4"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="rounded-full border-2 border-gray-300 h-12"
                />
              </div>
            </div>

            <div>
              <Label className="font-bold text-gray-700">Descrição</Label>
              <Textarea
                placeholder="Ex: Desafio de conhecimentos gerais com perguntas sobre história, geografia e ciências"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="rounded-xl border-2 border-gray-300 min-h-[80px] resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label className="font-bold text-gray-700">Pontuação Máxima</Label>
              <Input
                type="number"
                placeholder="500"
                value={pontuacaoMaxima}
                onChange={(e) => setPontuacaoMaxima(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>

            <Button
              onClick={handleCriarRodada}
              className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              CRIAR RODADA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Rodadas Existentes */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black">Rodadas do Torneio</CardTitle>
          <CardDescription className="text-blue-100 font-semibold">
            Gerencie todas as etapas do torneio
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {torneio.rodadas.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">Nenhuma rodada criada ainda</p>
                <p className="text-sm text-gray-400">Crie a primeira rodada usando o formulário acima</p>
              </div>
            ) : (
              torneio.rodadas.map((rodada: any, index: number) => (
                <div
                  key={rodada.id}
                  className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-black text-xl text-gray-800">{rodada.nome}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${rodada.ativa
                          ? 'bg-green-100 text-green-800'
                          : rodada.finalizada
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {rodada.ativa ? 'ATIVA' : rodada.finalizada ? 'FINALIZADA' : 'PENDENTE'}
                      </div>
                    </div>
                    <p className="text-gray-600 font-semibold mb-3">{rodada.descricao}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-gray-700">
                          Pontuação Máxima: {rodada.pontuacaoMaxima}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-gray-700">
                          Rodada #{rodada.numero}
                        </span>
                      </div>
                      {rodada.dataInicio && (
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-indigo-500" />
                          <span className="font-semibold text-gray-700">
                            Criada em: {new Date(rodada.dataInicio.seconds * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {!rodada.ativa && !rodada.finalizada && (
                      <Button
                        onClick={() => torneio.ativarRodada(rodada.id)}
                        size="sm"
                        className="rounded-full bg-green-500 hover:bg-green-600 text-white font-bold"
                      >
                        Ativar
                      </Button>
                    )}
                    {rodada.ativa && (
                      <Button
                        size="sm"
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
                        disabled
                      >
                        Ativa
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}