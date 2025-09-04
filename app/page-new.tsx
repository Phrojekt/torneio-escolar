"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, ShoppingBag, Menu, X, Plus, Save, Users, Target, Crown, Trash2, LogOut, Calendar, Settings, Edit } from "lucide-react"
import Image from "next/image"
import { useTorneio } from "@/hooks/use-torneio"
import { Dupla } from "@/types/torneio"
import { toast } from "sonner"

// Função utilitária para calcular valores apenas das rodadas (sem bônus)
const calcularValoresRodadas = (dupla: any) => {
  const medalhasRodadas = Object.values(dupla.medalhasPorRodada || {})
    .reduce((total: number, medalhas: any) => total + (Number(medalhas) || 0), 0);
  const estrelasRodadas = Object.values(dupla.estrelasPorRodada || {})
    .reduce((total: number, estrelas: any) => total + (Number(estrelas) || 0), 0);
  const moedasRodadas = Object.values(dupla.moedasPorRodada || {})
    .reduce((total: number, moedas: any) => total + (Number(moedas) || 0), 0);
  
  return { medalhasRodadas, estrelasRodadas, moedasRodadas };
};

export default function LoginPage() {
  const [userType, setUserType] = useState<"administrador" | "jogador" | null>(null)
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    if (userType === "administrador" && password === "admin123") {
      setIsLoggedIn(true)
    } else if (userType === "jogador") {
      setIsLoggedIn(true)
    }
  }

  if (isLoggedIn) {
    if (userType === "administrador") {
      return <AdministradorDashboard />
    } else {
      return <JogadorDashboard />
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
            <CardTitle className="text-2xl sm:text-3xl font-black mb-2">Torneio Jamboree</CardTitle>
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
                variant={userType === "administrador" ? "default" : "outline"}
                onClick={() => setUserType("administrador")}
                className={`h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base ${
                  userType === "administrador"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Administrador
              </Button>
              <Button
                variant={userType === "jogador" ? "default" : "outline"}
                onClick={() => setUserType("jogador")}
                className={`h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base ${
                  userType === "jogador"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Jogador
              </Button>
            </div>
          </div>

          {userType === "administrador" && (
            <div className="space-y-3">
              <Label className="text-base sm:text-lg font-bold text-gray-700">Senha</Label>
              <Input
                type="password"
                placeholder="Digite a senha do administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 sm:h-14 rounded-xl border-2 border-gray-300 text-sm sm:text-base"
              />
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!userType || (userType === "administrador" && !password)}
            className="w-full h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            ENTRAR
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AdministradorDashboard() {
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
                <h1 className="text-lg sm:text-2xl font-black text-gray-800">Torneio Jamboree</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold">Painel do Administrador</p>
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

function JogadorDashboard() {
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
        {activeTab === "loja" && <LojaView torneio={torneio} showComprarButton={false} />}
      </main>
    </div>
  )
}

// Componente para gerenciar duplas - Adicionar pontuação
function GerenciamentoDuplas({ torneio }: { torneio: any }) {
  const [aluno1, setAluno1] = useState("")
  const [aluno2, setAluno2] = useState("")
  const [duplaId, setDuplaId] = useState("")
  const [estrelas, setEstrelas] = useState("")
  const [moedas, setMoedas] = useState("")
  const [medalhas, setMedalhas] = useState("")
  const [rodadaSelecionada, setRodadaSelecionada] = useState("")

  const handleAdicionarPontuacao = async () => {
    try {
      if (!duplaId || !estrelas || !moedas || !medalhas || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      await torneio.adicionarPontuacao(
        duplaId,
        parseInt(medalhas), // medalhas
        parseInt(estrelas),   // estrelas
        parseInt(moedas),   // moedas
        rodadaSelecionada
      )

      toast.success("Pontuação adicionada com sucesso!")
      setEstrelas("")
      setMoedas("")
      setMedalhas("")
    } catch (error) {
      toast.error("Erro ao adicionar pontuação")
    }
  }

  const handleCriarDupla = async () => {
    try {
      if (!aluno1 || !aluno2) {
        toast.error("Preencha os nomes dos jogadores!")
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
              <Label className="font-bold text-gray-700">Jogador 1</Label>
              <Input
                placeholder="Nome do primeiro jogador"
                value={aluno1}
                onChange={(e) => setAluno1(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Jogador 2</Label>
              <Input
                placeholder="Nome do segundo jogador"
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
                      {dupla.tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
              <div>
                <Label className="font-bold text-gray-700">Estrelas</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={estrelas}
                  onChange={(e) => setEstrelas(e.target.value)}
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
            {torneio.duplas.map((dupla: Dupla) => {
              const valores = calcularValoresRodadas(dupla);
              return (
                <div key={dupla.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-lg text-gray-800">{dupla.tag}</h3>
                    <p className="text-sm text-gray-600 font-semibold">
                      {valores.medalhasRodadas} medalhas • {valores.estrelasRodadas} estrelas • {valores.moedasRodadas} moedas
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
              );
            })}
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
  const [itemEditando, setItemEditando] = useState<any>(null)
  const [modoEdicao, setModoEdicao] = useState(false)

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

  const handleEditarItem = (item: any) => {
    setItemEditando(item)
    setNome(item.nome)
    setDescricao(item.descricao)
    setPreco(item.preco.toString())
    setRodadaSelecionada(item.rodada)
    setModoEdicao(true)
  }

  const handleSalvarEdicao = async () => {
    try {
      if (!nome || !descricao || !preco || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      await torneio.editarItemLoja(itemEditando.id, nome, descricao, parseInt(preco), rodadaSelecionada)
      toast.success("Item editado com sucesso!")
      handleCancelarEdicao()
    } catch (error) {
      toast.error("Erro ao editar item")
    }
  }

  const handleCancelarEdicao = () => {
    setModoEdicao(false)
    setItemEditando(null)
    setNome("")
    setDescricao("")
    setPreco("")
    setRodadaSelecionada("")
  }

  const handleRemoverItem = async (itemId: string) => {
    try {
      await torneio.removerItemLoja(itemId)
      toast.success("Item removido com sucesso!")
    } catch (error) {
      toast.error("Erro ao remover item")
    }
  }

  return (
    <div className="space-y-6">
      {/* Adicionar/Editar Item */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black">
            {modoEdicao ? 'Editar Item da Loja' : 'Adicionar Item à Loja Misteriosa'}
          </CardTitle>
          {modoEdicao && (
            <CardDescription className="text-slate-200 font-semibold">
              Editando: {itemEditando?.nome}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="font-bold text-gray-700">Nome do Item</Label>
              <Input
                placeholder="Nome do item"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12"
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Descrição</Label>
              <Input
                placeholder="Descrição do item"
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
            <div className="flex gap-3">
              {modoEdicao ? (
                <>
                  <Button onClick={handleSalvarEdicao} className="flex-1 h-12 rounded-full font-bold bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white">
                    SALVAR ALTERAÇÕES
                  </Button>
                  <Button onClick={handleCancelarEdicao} variant="outline" className="flex-1 h-12 rounded-full font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    CANCELAR
                  </Button>
                </>
              ) : (
                <Button onClick={handleAdicionarItem} className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white">
                  ADICIONAR ITEM
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens Disponíveis */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black">Itens Disponíveis</CardTitle>
          <CardDescription className="text-orange-100 font-semibold">
            {torneio.itensLoja.length} {torneio.itensLoja.length === 1 ? 'item' : 'itens'} na loja
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {torneio.itensLoja.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 font-semibold">Nenhum item cadastrado</p>
                <p className="text-sm text-gray-400">Adicione o primeiro item à loja!</p>
              </div>
            ) : (
              torneio.itensLoja.map((item: any) => (
                <div key={item.id} className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-black text-lg text-gray-800 mb-1">{item.nome}</h3>
                      <p className="text-sm text-gray-600 font-semibold mb-2">{item.descricao}</p>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-black text-orange-600">{item.preco} moedas</p>
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-semibold">
                          {torneio.rodadas.find((r: any) => r.id === item.rodada)?.nome || 'Rodada não encontrada'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEditarItem(item)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                        disabled={modoEdicao}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleRemoverItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-2 border-red-300 text-red-600 hover:bg-red-50"
                        disabled={modoEdicao}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
                  {dupla.tag}
                </p>
              </div>

              {/* Estatísticas */}
              <div className="flex gap-2">
                {/* Medalhas */}
                <div className="w-16 h-16 bg-slate-700 rounded-2xl flex flex-col items-center justify-center text-white">
                  <Image src="/medal_icon.png" alt="Medal" width={20} height={20} className="w-5 h-5 mb-1" />
                  <span className="font-black text-sm">{dupla.medalhas}</span>
                </div>

                {/* Estrelas (calculadas das estrelas) */}
                <div className="w-16 h-16 bg-green-400 rounded-2xl flex flex-col items-center justify-center text-white">
                  <Image src="/star_icon.png" alt="Star" width={20} height={20} className="w-5 h-5 mb-1" />
                  <span className="font-black text-sm">{dupla.estrelas}</span>
                </div>

                {/* Moedas */}
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl flex flex-col items-center justify-center text-white">
                  <Image src="/coin_icon.png" alt="Coin" width={20} height={20} className="w-5 h-5 mb-1" />
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

// Componente da loja para jogadores
function LojaView({ torneio, showComprarButton = true }: { torneio: any; showComprarButton?: boolean }) {
  const jambaVIP = torneio.getDuplasPorCategoria('JambaVIP')
  const jamberlinda = torneio.getDuplasPorCategoria('Jamberlinda')
  const aguardando = torneio.getDuplasAguardando()

  // Obter ranking geral (que já calcula APENAS totais das rodadas) e construir lookup por dupla id
  const rankingGeral = torneio.getRankingGeral()
  const rankingLookup: Record<string, any> = {}
  rankingGeral.forEach((d: any) => {
    if (d && d.id) rankingLookup[d.id] = d
  })

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
            {showComprarButton ? 'Use suas moedas para comprar itens especiais' : 'Veja os itens especiais disponíveis'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 tooltip-container overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2 pt-24 pb-4 hover-scale-container">
            {torneio.itensLoja.map((item: any, index: number) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover-scale-item relative group"
              >
                <h3 className="font-black text-xl text-gray-800 mb-2">{item.nome}</h3>
                <p className="text-gray-600 text-sm mb-4 font-semibold line-clamp-3 cursor-help">{item.descricao}</p>
                
                {/* Tooltip com descrição completa */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 max-w-[90vw] bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible item-tooltip pointer-events-none">
                  <div className="text-sm font-semibold text-gray-800 mb-2">{item.nome}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{item.descricao}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-orange-600">{item.preco} moedas</span>
                  {showComprarButton && (
                    <Button className="rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-6 py-2">
                      Comprar
                    </Button>
                  )}
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
              {jambaVIP.slice(0, 2).map((dupla: Dupla) => {
                // Preferir valores do ranking geral para garantir igualdade exata
                const ranked = rankingLookup[dupla.id]
                const estrelas = ranked?.estrelas ?? calcularValoresRodadas(dupla).estrelasRodadas
                const moedas = ranked?.moedas ?? calcularValoresRodadas(dupla).moedasRodadas
                return (
                  <div key={dupla.id} className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200">
                    <p className="font-black text-gray-800">{dupla.tag}</p>
                    <p className="text-sm text-gray-600 font-semibold">{estrelas} estrelas • {moedas} moedas</p>
                  </div>
                );
              })}
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
              {jamberlinda.slice(0, 2).map((dupla: Dupla) => {
                const ranked = rankingLookup[dupla.id]
                const estrelas = ranked?.estrelas ?? calcularValoresRodadas(dupla).estrelasRodadas
                const moedas = ranked?.moedas ?? calcularValoresRodadas(dupla).moedasRodadas
                return (
                  <div key={dupla.id} className="p-4 bg-gradient-to-r from-pink-100 to-red-100 rounded-2xl border-2 border-pink-200">
                    <p className="font-black text-gray-800">{dupla.tag}</p>
                    <p className="text-sm text-gray-600 font-semibold">{estrelas} estrelas • {moedas} moedas</p>
                  </div>
                );
              })}
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
            {aguardando.map((dupla: Dupla) => {
              const ranked = rankingLookup[dupla.id]
              const estrelas = ranked?.estrelas ?? calcularValoresRodadas(dupla).estrelasRodadas
              const moedas = ranked?.moedas ?? calcularValoresRodadas(dupla).moedasRodadas
              return (
                <div key={dupla.id} className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl text-center border-2 border-yellow-200">
                  <p className="font-black text-gray-800">{dupla.tag}</p>
                  <p className="text-sm text-gray-600 font-semibold">Aguardando... • {estrelas} estrelas • {moedas} moedas</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
