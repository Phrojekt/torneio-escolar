"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, ShoppingBag, Medal, Star, Coins, Menu, X, Plus, Save, Users, Target, Crown, Trash2 } from "lucide-react"
import { useTorneio } from "@/hooks/use-torneio"
import { Dupla } from "@/types/torneio"
import { toast } from "sonner"

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

  if (isLoggedIn) {
    if (userType === "professor") {
      return <ProfessorDashboard />
    } else {
      return <AlunoDashboard />
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
                className={`h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base ${
                  userType === "professor"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                👨‍🏫 Professor
              </Button>
              <Button
                variant={userType === "aluno" ? "default" : "outline"}
                onClick={() => setUserType("aluno")}
                className={`h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base ${
                  userType === "aluno"
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

function ProfessorDashboard() {
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
    { id: "rankings", label: "Rankings", icon: Trophy },
    { id: "loja", label: "Loja", icon: ShoppingBag },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300">
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
            
            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 rounded-lg bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden sm:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <div className="sm:hidden py-4 border-t">
              <nav className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`p-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === "gerenciar" && <GerenciamentoDuplas torneio={torneio} />}
        {activeTab === "duplas" && <GerenciamentoDuplasCompleto torneio={torneio} />}
        {activeTab === "rankings" && <RankingsManager torneio={torneio} />}
        {activeTab === "loja" && <LojaManager torneio={torneio} />}
      </main>
    </div>
  )
}

function AlunoDashboard() {
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300">
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
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="bg-slate-700 text-white border-0 rounded-full px-3 py-2 sm:px-6 sm:py-3 font-bold hover:bg-slate-800 text-xs sm:text-base"
            >
              GAYB PLAY
            </Button>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="block sm:hidden">
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-full mb-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-full font-bold"
            >
              {menuOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
              Menu
            </Button>
            {menuOpen && (
              <div className="grid grid-cols-1 gap-2 mb-4">
                <Button
                  onClick={() => {
                    setActiveTab("geral")
                    setMenuOpen(false)
                  }}
                  className={`rounded-full px-4 py-3 font-bold text-sm ${
                    activeTab === "geral"
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
                    className={`rounded-full px-4 py-3 font-bold text-sm ${
                      activeTab === rodada.id
                        ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    {rodada.nome}
                  </Button>
                ))}
                <Button
                  onClick={() => {
                    setActiveTab("loja")
                    setMenuOpen(false)
                  }}
                  className={`rounded-full px-4 py-3 font-bold text-sm ${
                    activeTab === "loja" ? "bg-slate-700 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                >
                  Lojinha Misteriosa
                </Button>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveTab("geral")}
              className={`rounded-full px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base ${
                activeTab === "geral"
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
                className={`rounded-full px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base ${
                  activeTab === rodada.id
                    ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                {rodada.nome}
              </Button>
            ))}
            <Button
              onClick={() => setActiveTab("loja")}
              className={`rounded-full px-4 sm:px-6 py-2 sm:py-3 font-bold text-sm sm:text-base ${
                activeTab === "loja" ? "bg-slate-700 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              Lojinha Misteriosa
            </Button>
          </div>
        </div>

        {activeTab === "geral" && <RankingTable title="Ranking Geral" data={rankingGeral} />}
        {rodadas.map((rodada) => 
          activeTab === rodada.id && (
            <RankingTable 
              key={rodada.id}
              title={rodada.nome} 
              data={torneio.getRankingPorRodada(rodada.id)} 
            />
          )
        )}
        {activeTab === "loja" && <LojaView torneio={torneio} />}
      </main>
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
    <div className="space-y-6">
      {/* Criar Nova Dupla */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black flex items-center space-x-2">
            <Plus className="w-6 h-6" />
            <span>Criar Nova Dupla</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="font-bold text-gray-700">Aluno 1</Label>
              <Input
                placeholder="Nome do primeiro aluno"
                value={aluno1}
                onChange={(e) => setAluno1(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Aluno 2</Label>
              <Input
                placeholder="Nome do segundo aluno"
                value={aluno2}
                onChange={(e) => setAluno2(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
          </div>
          <Button onClick={handleCriarDupla} className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white">
            CRIAR DUPLA
          </Button>
        </CardContent>
      </Card>

      {/* Adicionar Pontuação */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black flex items-center space-x-2">
            <Target className="w-6 h-6" />
            <span>Adicionar Pontuação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="font-bold text-gray-700">Selecionar Dupla</Label>
              <Select value={duplaId} onValueChange={setDuplaId}>
                <SelectTrigger className="h-12 rounded-full border-2 border-gray-300">
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="font-bold text-gray-700">Pontos</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={pontos}
                  onChange={(e) => setPontos(e.target.value)}
                  className="rounded-full border-2 border-gray-300 h-12"
                />
              </div>
              <div>
                <Label className="font-bold text-gray-700">Moedas</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={moedas}
                  onChange={(e) => setMoedas(e.target.value)}
                  className="rounded-full border-2 border-gray-300 h-12"
                />
              </div>
              <div>
                <Label className="font-bold text-gray-700">Medalhas</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={medalhas}
                  onChange={(e) => setMedalhas(e.target.value)}
                  className="rounded-full border-2 border-gray-300 h-12"
                />
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

  return (
    <div className="space-y-6">
      {/* Navegação dos Rankings */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setActiveTab("geral")}
          className={`rounded-full px-6 py-3 font-bold ${
            activeTab === "geral"
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
            className={`rounded-full px-6 py-3 font-bold ${
              activeTab === rodada.id
                ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {rodada.nome}
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
function RankingTable({ title, data }: { title: string; data: Dupla[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-0">
      {title && (
        <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-4">
          <h2 className="text-2xl font-black text-white text-center">{title}</h2>
        </div>
      )}
      <div className="p-6">
        <div className="space-y-3">
          {data.map((dupla, index) => (
            <div
              key={dupla.id}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200"
            >
              {/* Posição */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-xl bg-gradient-to-r from-red-400 to-pink-400">
                {index + 1}°
              </div>

              {/* Nome da Dupla */}
              <div className="flex-1 bg-gray-200 rounded-2xl p-4 min-w-0">
                <p className="font-black text-gray-800 text-lg truncate">
                  {dupla.aluno1} & {dupla.aluno2}
                </p>
              </div>

              {/* Estatísticas */}
              <div className="flex gap-2">
                {/* Medalhas */}
                <div className="w-16 h-16 bg-slate-700 rounded-2xl flex flex-col items-center justify-center text-white">
                  <Medal className="w-5 h-5 mb-1" />
                  <span className="font-black text-sm">{dupla.medalhas}</span>
                </div>

                {/* Estrelas (calculadas dos pontos) */}
                <div className="w-16 h-16 bg-green-400 rounded-2xl flex flex-col items-center justify-center text-white">
                  <Star className="w-5 h-5 mb-1" />
                  <span className="font-black text-sm">{Math.floor(dupla.pontos / 100)}</span>
                </div>

                {/* Moedas */}
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl flex flex-col items-center justify-center text-white">
                  <Coins className="w-5 h-5 mb-1" />
                  <span className="font-black text-sm">{dupla.moedas}</span>
                </div>
              </div>
            </div>
          ))}
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
    <div className="space-y-6">
      {/* Loja Misteriosa */}
      <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 py-6">
          <CardTitle className="flex items-center space-x-3 text-2xl font-black">
            <ShoppingBag className="w-6 h-6" />
            <span>Lojinha Misteriosa</span>
          </CardTitle>
          <CardDescription className="text-slate-200 font-semibold">
            Use suas moedas para comprar itens especiais
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {torneio.itensLoja.map((item: any, index: number) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all transform hover:scale-105"
              >
                <h3 className="font-black text-xl text-gray-800 mb-2">{item.nome}</h3>
                <p className="text-gray-600 text-sm mb-4 font-semibold">{item.descricao}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-orange-600">{item.preco} moedas</span>
                  <Button className="rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-6 py-2">
                    Comprar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorias Especiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* JambaVIP */}
        <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-4">
            <CardTitle className="text-xl font-black">JambaVIP</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
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
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aguardando.map((dupla: Dupla) => (
              <div key={dupla.id} className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl text-center border-2 border-yellow-200">
                <p className="font-black text-gray-800">{dupla.aluno1} & {dupla.aluno2}</p>
                <p className="text-sm text-gray-600 font-semibold">Aguardando...</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
