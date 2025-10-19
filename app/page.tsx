"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trophy, ShoppingBag, Menu, X, Plus, Save, Users, Target, Crown, Trash2, LogOut, Calendar, Settings, Edit } from "lucide-react"
import Image from "next/image"
import { useTorneio } from "@/hooks/use-torneio"
import { Dupla } from "@/types/torneio"
import { toast } from "sonner"
import { LoginPage } from "@/components/auth/login-page"
import { BannerDupla } from "@/components/tournament/banner-dupla"
import { deleteField } from 'firebase/firestore'

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

export default function App() {
  const [userType, setUserType] = useState<"administrador" | "jogador" | null>(null)

  const handleLogin = (type: "administrador" | "jogador") => {
    setUserType(type)
  }

  const handleLogout = () => {
    setUserType(null)
  }

  if (!userType) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (userType === "administrador") {
    return <AdministradorDashboard onLogout={handleLogout} />
  } else {
    return <JogadorDashboard onLogout={handleLogout} />
  }
}

function AdministradorDashboard({ onLogout }: { onLogout: () => void }) {
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
    { id: "bonus", label: "Bônus", icon: () => <Image src="/star_icon.png" alt="Star" width={16} height={16} /> },
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
                <h1 className="text-lg sm:text-2xl font-black text-gray-800">Torneio Jamboree</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold">Painel do Administrador</p>
              </div>
            </div>

            {/* Botões de navegação e mobile menu */}
            <div className="flex items-center space-x-2">
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
                className="hidden sm:flex items-center space-x-2 text-white px-4 py-2 rounded-xl font-bold text-sm"
                style={{ backgroundColor: "#0f006d" }}
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
                        className={`flex-shrink-0 px-6 py-4 rounded-xl font-bold text-base flex items-center space-x-3 transition-all whitespace-nowrap touch-target ${activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        <Icon className="w-5 h-5" />
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
                    className="flex-shrink-0 px-6 py-4 rounded-xl font-bold text-base flex items-center space-x-3 transition-all text-white whitespace-nowrap touch-target"
                    style={{ backgroundColor: "#0f006d" }}
                  >
                    <LogOut className="w-5 h-5" />
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

function JogadorDashboard({ onLogout }: { onLogout: () => void }) {
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

  // Calcular ranking geral diretamente das duplas - APENAS RODADAS (sem bônus)
  const calcularRankingGeral = () => {
    console.log("🏆 [JogadorDashboard] calcularRankingGeral - iniciando com duplas:", torneio.duplas.length);

    const resultado = [...torneio.duplas]
      .map(dupla => {
        // Para ranking geral, calcular APENAS os valores das rodadas (sem bônus)
        const estrelasRodadas = Object.values(dupla.estrelasPorRodada || {})
          .reduce((total: number, estrelas: any) => total + (Number(estrelas) || 0), 0);
        const moedasRodadas = Object.values(dupla.moedasPorRodada || {})
          .reduce((total: number, moedas: any) => total + (Number(moedas) || 0), 0);
        const medalhasRodadas = Object.values(dupla.medalhasPorRodada || {})
          .reduce((total: number, medalhas: any) => total + (Number(medalhas) || 0), 0);

        // Calcular bônus separadamente para referência
        const estrelasBonusTotal = Object.values(dupla.estrelasPorBonus || {})
          .reduce((total: number, bonusPartidas: any) =>
            total + Object.values(bonusPartidas || {})
              .reduce((subTotal: number, estrelas: any) => subTotal + (Number(estrelas) || 0), 0), 0
          );
        const moedasBonusTotal = Object.values(dupla.moedasPorBonus || {})
          .reduce((total: number, bonusPartidas: any) =>
            total + Object.values(bonusPartidas || {})
              .reduce((subTotal: number, moedas: any) => subTotal + (Number(moedas) || 0), 0), 0
          );
        const medalhasBonusTotal = Object.values(dupla.medalhasPorBonus || {})
          .reduce((total: number, bonusPartidas: any) =>
            total + Object.values(bonusPartidas || {})
              .reduce((subTotal: number, medalhas: any) => subTotal + (Number(medalhas) || 0), 0), 0
          );

        const resultado = {
          ...dupla,
          // Usar APENAS valores das rodadas para o ranking geral
          estrelas: estrelasRodadas,
          moedas: moedasRodadas,
          medalhas: medalhasRodadas,
          // Manter totais de bônus separados para referência
          estrelasBonus: estrelasBonusTotal,
          moedasBonus: moedasBonusTotal,
          medalhasBonus: medalhasBonusTotal
        };

        console.log(`📊 [JogadorDashboard] ${dupla.tag}: rodadas=${estrelasRodadas}, bonus=${estrelasBonusTotal}, total_banco=${dupla.estrelas}, ranking_geral=${resultado.estrelas}`);
        return resultado;
      })
      // Ordenar por: medalhas (principal), depois estrelas, depois moedas, depois bônus
      .sort((a, b) => {
        const medalhasA = a.medalhas || 0;
        const medalhasB = b.medalhas || 0;
        if (medalhasB !== medalhasA) return medalhasB - medalhasA;

        const estrelasA = a.estrelas || 0;
        const estrelasB = b.estrelas || 0;
        if (estrelasB !== estrelasA) return estrelasB - estrelasA;

        const moedasA = a.moedas || 0;
        const moedasB = b.moedas || 0;
        if (moedasB !== moedasA) return moedasB - moedasA;

        // Desempates por bônus
        const estrelasBonusA = a.estrelasBonus || 0;
        const estrelasBonusB = b.estrelasBonus || 0;
        if (estrelasBonusB !== estrelasBonusA) return estrelasBonusB - estrelasBonusA;

        const moedasBonusA = a.moedasBonus || 0;
        const moedasBonusB = b.moedasBonus || 0;
        if (moedasBonusB !== moedasBonusA) return moedasBonusB - moedasBonusA;

        const medalhasBonusA = a.medalhasBonus || 0;
        const medalhasBonusB = b.medalhasBonus || 0;
        if (medalhasBonusB !== medalhasBonusA) return medalhasBonusB - medalhasBonusA;

        return 0; // total empate
      });

    // Calcular posições com empates (dense ranking)
    let posicaoAtual = 1;
    let chaveAnterior: string | null = null;
    const resultadoComRanking = resultado.map((dupla) => {
      const chaveAtual = `${dupla.medalhas || 0}|${dupla.estrelas || 0}|${dupla.moedas || 0}`;
      if (chaveAnterior === null) {
        // primeira entrada
        chaveAnterior = chaveAtual;
      } else if (chaveAtual !== chaveAnterior) {
        // diferente -> próxima posição (dense)
        posicaoAtual += 1;
        chaveAnterior = chaveAtual;
      }

      return {
        ...dupla,
        posicao: posicaoAtual
      };
    });

    console.log("🏆 [JogadorDashboard] Ranking geral final:", resultadoComRanking.map(d => ({ tag: d.tag, posicao: d.posicao, estrelas: d.estrelas })));
    return resultadoComRanking;
  };

  // Calcular ranking por rodada diretamente das duplas
  const calcularRankingPorRodada = (rodadaId: string) => {
    console.log(`🎯 [JogadorDashboard] calcularRankingPorRodada - rodada: ${rodadaId}, duplas: ${torneio.duplas.length}`);

    const resultado = [...torneio.duplas]
      .map(dupla => {
        const estrelasRodada = Number(dupla.estrelasPorRodada?.[rodadaId]) || 0;
        const moedasRodada = Number(dupla.moedasPorRodada?.[rodadaId]) || 0;
        const medalhasRodada = Number(dupla.medalhasPorRodada?.[rodadaId]) || 0;

        // Calcular bônus total para desempate
        const estrelasBonusTotal = Object.values(dupla.estrelasPorBonus || {})
          .reduce((total: number, bonusPartidas: any) =>
            total + Object.values(bonusPartidas || {})
              .reduce((subTotal: number, estrelas: any) => subTotal + (Number(estrelas) || 0), 0), 0
          );

        console.log(`📈 [JogadorDashboard] ${dupla.tag} - rodada ${rodadaId}: estrelas=${estrelasRodada}, dados originais:`, dupla.estrelasPorRodada);

        return {
          ...dupla,
          estrelasRodada: isNaN(estrelasRodada) ? 0 : estrelasRodada,
          moedasRodada: isNaN(moedasRodada) ? 0 : moedasRodada,
          medalhasRodada: isNaN(medalhasRodada) ? 0 : medalhasRodada,
          estrelasBonusTotal
        };
      })
      // Ordenar por medalhas da rodada, depois estrelas, depois moedas (apenas por essa rodada)
      .sort((a, b) => {
        if ((b.medalhasRodada || 0) !== (a.medalhasRodada || 0)) {
          return (b.medalhasRodada || 0) - (a.medalhasRodada || 0);
        }
        if ((b.estrelasRodada || 0) !== (a.estrelasRodada || 0)) {
          return (b.estrelasRodada || 0) - (a.estrelasRodada || 0);
        }
        return (b.moedasRodada || 0) - (a.moedasRodada || 0);
      });

    // Calcular posições com empates para rodada (dense ranking)
    let posicaoAtual = 1;
    let chaveAnteriorRodada: string | null = null;
    const resultadoComRanking = resultado.map((dupla) => {
      const chaveAtual = `${dupla.medalhasRodada || 0}|${dupla.estrelasRodada || 0}|${dupla.moedasRodada || 0}`;
      if (chaveAnteriorRodada === null) {
        chaveAnteriorRodada = chaveAtual;
      } else if (chaveAtual !== chaveAnteriorRodada) {
        posicaoAtual += 1;
        chaveAnteriorRodada = chaveAtual;
      }

      return {
        ...dupla,
        posicao: posicaoAtual
      };
    });

    console.log("🎯 [JogadorDashboard] Ranking por rodada final:", resultadoComRanking.map(d => ({ tag: d.tag, posicao: d.posicao, estrelasRodada: d.estrelasRodada })));
    return resultadoComRanking;
  };

  // Calcular ranking por bônus diretamente das duplas  
  const calcularRankingPorBonus = (bonusId: string) => {
    const resultado = [...torneio.duplas]
      .map(dupla => {
        let estrelasBonus = 0;
        let moedasBonus = 0;
        let medalhasBonus = 0;

        if (dupla.estrelasPorBonus?.[bonusId]) {
          estrelasBonus = Object.values(dupla.estrelasPorBonus[bonusId])
            .reduce((total: number, estrelas: any) => total + (Number(estrelas) || 0), 0);
        }

        if (dupla.moedasPorBonus?.[bonusId]) {
          moedasBonus = Object.values(dupla.moedasPorBonus[bonusId])
            .reduce((total: number, moedas: any) => total + (Number(moedas) || 0), 0);
        }

        if (dupla.medalhasPorBonus?.[bonusId]) {
          medalhasBonus = Object.values(dupla.medalhasPorBonus[bonusId])
            .reduce((total: number, medalhas: any) => total + (Number(medalhas) || 0), 0);
        }

        const estrelasB = isNaN(estrelasBonus) ? 0 : estrelasBonus;
        const moedasB = isNaN(moedasBonus) ? 0 : moedasBonus;
        const medalhasB = isNaN(medalhasBonus) ? 0 : medalhasBonus;
        const totalBonus = estrelasB + moedasB + medalhasB;

        return {
          ...dupla,
          estrelasBonus: estrelasB,
          moedasBonus: moedasB,
          medalhasBonus: medalhasB,
          totalBonus
        };
      })
      // Ordenar por total de pontos de bônus primeiro, depois desempates por campos de bônus
      .sort((a, b) => {
        const totalA = a.totalBonus || 0;
        const totalB = b.totalBonus || 0;
        if (totalB !== totalA) return totalB - totalA;
        if ((b.estrelasBonus || 0) !== (a.estrelasBonus || 0)) return (b.estrelasBonus || 0) - (a.estrelasBonus || 0);
        if ((b.moedasBonus || 0) !== (a.moedasBonus || 0)) return (b.moedasBonus || 0) - (a.moedasBonus || 0);
        if ((b.medalhasBonus || 0) !== (a.medalhasBonus || 0)) return (b.medalhasBonus || 0) - (a.medalhasBonus || 0);
        return 0;
      });

    // Dense ranking para bônus (baseado em totalBonus e desempates de bônus)
    let posicaoAtualBonus = 1;
    let chaveAnteriorBonus: string | null = null;
    const resultadoComRankingBonus = resultado.map((dupla) => {
      const chaveAtual = `${dupla.totalBonus || 0}|${dupla.estrelasBonus || 0}|${dupla.moedasBonus || 0}|${dupla.medalhasBonus || 0}`;
      if (chaveAnteriorBonus === null) {
        chaveAnteriorBonus = chaveAtual;
      } else if (chaveAtual !== chaveAnteriorBonus) {
        posicaoAtualBonus += 1;
        chaveAnteriorBonus = chaveAtual;
      }

      return {
        ...dupla,
        posicao: posicaoAtualBonus
      };
    });

    return resultadoComRankingBonus;
  };

  const rankingGeral = calcularRankingGeral();
  const rodadas = torneio.rodadas

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat overflow-x-hidden">
      <header className="shadow-lg" style={{ backgroundColor: "#0f006d" }}>
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex justify-around items-center py-3 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img
                src="/Torneio_Jamboree.png"
                alt="Torneio Jamboree"
                className="h-8 sm:h-12 w-auto object-contain drop-shadow-lg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setActiveTab("loja")}
                className={`rounded-full px-6 py-4 sm:px-4 sm:py-3 font-bold text-base sm:text-base flex items-center justify-center sm:space-x-3 cursor-pointer transition-all duration-300 transform ${activeTab === "loja"
                  ? "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 hover:shadow-lg scale-105 shadow-lg"
                  : "bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 hover:shadow-lg"
                  }`}
              >
                <img src="/shop_icon.png" alt="Loja" className="w-5 h-5" />
                <span className="hidden sm:inline sm:ml-0">Lojinha</span>
              </Button>
              <Button
                onClick={onLogout}
                className="bg-slate-700 text-white border-0 rounded-full px-6 py-4 sm:px-6 sm:py-3 font-bold hover:bg-slate-800 text-base sm:text-base flex items-center justify-center sm:space-x-3 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline sm:ml-0">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-2 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8 overflow-x-hidden max-w-7xl mx-auto justify-around">
        {/* Mobile Navigation */}
        <div className="mb-3 justify-around sm:mb-4 lg:mb-6">
          <div className="block sm:hidden">
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-full mb-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-full font-bold cursor-pointer px-6 py-4 text-base"
            >
              {menuOpen ? <X className="w-5 h-5 mr-3" /> : <Menu className="w-5 h-5 mr-3" />}
              Menu
            </Button>
            {menuOpen && (
              <div className="grid grid-cols-1 gap-2 mb-4 overflow-x-hidden">
                <Button
                  onClick={() => {
                    setActiveTab("geral")
                    setMenuOpen(false)
                  }}
                  className={`rounded-full px-6 py-4 font-bold text-base cursor-pointer ${activeTab === "geral"
                    ? "bg-gradient-to-r bg-[#0f006d] text-white"
                    : "bg-gray-300 text-black hover:bg-gray-400"
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
                    className={`rounded-full px-6 py-4 font-bold text-base cursor-pointer ${activeTab === rodada.id
                      ? "bg-gradient-to-r bg-[#0f006d] text-white"
                      : "bg-gray-300 text-black hover:bg-gray-400"
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
                    className={`rounded-full px-6 py-4 font-bold text-base cursor-pointer ${activeTab === bonus.id
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                      : "bg-gray-300 text-black hover:bg-gray-400"
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
                  className={`rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0 touch-target cursor-pointer ${activeTab === "geral"
                    ? "bg-gradient-to-r bg-[#0f006d] text-white"
                    : "bg-gray-300 text-black hover:bg-gray-400"
                    }`}
                >
                  Rank Geral
                </Button>
                {rodadas.map((rodada) => (
                  <Button
                    key={rodada.id}
                    onClick={() => setActiveTab(rodada.id)}
                    className={`rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0 touch-target cursor-pointer ${activeTab === rodada.id
                      ? "bg-gradient-to-r bg-[#0f006d] text-white"
                      : "bg-gray-300 text-black hover:bg-gray-400"
                      }`}
                  >
                    {rodada.nome}
                  </Button>
                ))}
                {torneio.bonus?.map((bonus: any) => (
                  <Button
                    key={bonus.id}
                    onClick={() => setActiveTab(bonus.id)}
                    className={`rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0 touch-target cursor-pointer ${activeTab === bonus.id
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                      : "bg-gray-300 text-black hover:bg-gray-400"
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
          activeTab === rodada.id ? (
            <RankingTable
              key={rodada.id}
              title={rodada.nome}
              data={calcularRankingPorRodada(rodada.id)}
              showRoundPoints={true}
            />
          ) : null
        )}
        {torneio.bonus?.map((bonus: any) =>
          activeTab === bonus.id && (
            <RankingTable
              key={bonus.id}
              title={`BÔNUS - ${bonus.nome}`}
              data={calcularRankingPorBonus(bonus.id)}
              showBonusPoints={true}
            />
          )
        )}
        {activeTab === "loja" && <LojaView torneio={torneio} showComprarButton={false} />}
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
  const [bonusParaExcluir, setBonusParaExcluir] = useState<string | null>(null)

  // Estados para criação de partidas
  const [nomePartida, setNomePartida] = useState("")
  const [descricaoPartida, setDescricaoPartida] = useState("")
  const [multiplicadorEstrelas, setMultiplicadorEstrelas] = useState("0")
  const [multiplicadorMoedas, setMultiplicadorMoedas] = useState("0")
  const [multiplicadorMedalhas, setMultiplicadorMedalhas] = useState("0")

  // Estados para pontuação
  const [duplaSelecionada, setDuplaSelecionada] = useState("")
  const [partidaSelecionada, setPartidaSelecionada] = useState("")
  const [estrelasInseridas, setEstrelasInseridas] = useState("0")
  const [moedasInseridas, setMoedasInseridas] = useState("0")
  const [medalhasInseridas, setMedalhasInseridas] = useState("0")

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

  const handleExcluirBonus = async (bonusId: string) => {
    try {
      const bonus = torneio.bonus.find((b: any) => b.id === bonusId)
      await torneio.excluirBonus(bonusId)
      setBonusParaExcluir(null)
      // Se o bônus excluído estava selecionado, limpar seleção
      if (bonusSelecionado === bonusId) {
        setBonusSelecionado(null)
        setPartidasBonus([])
      }
      toast.success(`Bônus "${bonus?.nome}" excluído com sucesso!`)
    } catch (error) {
      console.error('Erro ao excluir bônus:', error)
      toast.error("Erro ao excluir bônus!")
    }
  }

  const handleCriarPartida = async () => {
    try {
      if (!bonusSelecionado || !nomePartida || !descricaoPartida || !multiplicadorEstrelas) {
        toast.error("Preencha todos os campos da partida!")
        return
      }

      await torneio.criarPartidaBonus(
        bonusSelecionado,
        nomePartida,
        descricaoPartida,
        parseFloat(multiplicadorEstrelas),
        parseFloat(multiplicadorMoedas) || 1,
        parseFloat(multiplicadorMedalhas) || 1
      )

      setNomePartida("")
      setDescricaoPartida("")
      setMultiplicadorEstrelas("0")
      setMultiplicadorMoedas("0")
      setMultiplicadorMedalhas("0")

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
      if (!duplaSelecionada || !partidaSelecionada) {
        toast.error("Preencha pelo menos a dupla e partida!")
        return
      }

      await torneio.adicionarPontuacaoBonus(
        duplaSelecionada,
        bonusSelecionado,
        partidaSelecionada,
        parseInt(medalhasInseridas) || 0, // medalhas - padrão 0
        parseInt(estrelasInseridas) || 0, // estrelas - padrão 0
        parseInt(moedasInseridas) || 0    // moedas - padrão 0
      )

      setDuplaSelecionada("")
      setPartidaSelecionada("")
      setEstrelasInseridas("0")
      setMoedasInseridas("0")
      setMedalhasInseridas("0")

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

  const calcularPontuacaoComMultiplicador = (medalhas: number, estrelas: number, moedas: number, partida: any) => {
    return {
      medalhas: medalhas * (partida?.multiplicadorMedalhas || 1),
      estrelas: estrelas * (partida?.multiplicadorEstrelas || 1),
      moedas: moedas * (partida?.multiplicadorMoedas || 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Criar Novo Bônus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image src="/star_icon.png" alt="Star" width={20} height={20} />
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
              placeholder="Nome do bônus"
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
              <p className="text-gray-500 text-center py-4">Nenhum bônus criado ainda. Crie o primeiro bônus!</p>
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
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setBonusParaExcluir(bonus.id)
                      }}
                      variant="destructive"
                      className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                Crie partidas com multiplicadores para o bônus selecionado
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
                        placeholder="Nome da pontuação"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <Label htmlFor="multiplicadorMedalhas">Multiplicador Bônus 1</Label>
                      <Input
                        id="multiplicadorMedalhas"
                        type="number"
                        step="0.1"
                        value={multiplicadorMedalhas}
                        onChange={(e) => setMultiplicadorMedalhas(e.target.value)}
                        placeholder="0"
                        className="w-full no-scroll"
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </div>
                    <div className="min-w-0">
                      <Label htmlFor="multiplicadorEstrelas">Multiplicador Bônus 2</Label>
                      <Input
                        id="multiplicadorEstrelas"
                        type="number"
                        step="0.1"
                        value={multiplicadorEstrelas}
                        onChange={(e) => setMultiplicadorEstrelas(e.target.value)}
                        placeholder="0"
                        className="w-full no-scroll"
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-0">
                <div className="overflow-x-auto">
                  <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 gap-4 min-w-full">
                    <div className="min-w-0">
                      <Label htmlFor="multiplicadorMoedas">Multiplicador Bônus 3</Label>
                      <Input
                        id="multiplicadorMoedas"
                        type="number"
                        step="0.1"
                        value={multiplicadorMoedas}
                        onChange={(e) => setMultiplicadorMoedas(e.target.value)}
                        placeholder="0"
                        className="w-full no-scroll"
                        onWheel={(e) => e.currentTarget.blur()}
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
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Partida
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
                          Multiplicadores: Bônus 1 {partida.multiplicadorMedalhas || 1}x | Bônus 2 {partida.multiplicadorEstrelas}x | Bônus 3 {partida.multiplicadorMoedas || 1}x
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
                  <Image src="/medal_icon.png" alt="Medal" width={20} height={20} />
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
                            {dupla.tag}
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
                    <Label htmlFor="medalhasInseridas">Bônus 1</Label>
                    <Input
                      id="medalhasInseridas"
                      type="number"
                      value={medalhasInseridas}
                      onChange={(e) => setMedalhasInseridas(e.target.value)}
                      placeholder="0"
                      className="no-scroll"
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estrelasInseridas">Bônus 2</Label>
                    <Input
                      id="estrelasInseridas"
                      type="number"
                      value={estrelasInseridas}
                      onChange={(e) => setEstrelasInseridas(e.target.value)}
                      placeholder="0"
                      className="no-scroll"
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="moedasInseridas">Bônus 3</Label>
                    <Input
                      id="moedasInseridas"
                      type="number"
                      value={moedasInseridas}
                      onChange={(e) => setMoedasInseridas(e.target.value)}
                      placeholder="0"
                      className="no-scroll"
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>
                </div>

                {(estrelasInseridas || moedasInseridas || medalhasInseridas) && partidaSelecionada && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Valores finais com multiplicadores:
                    </p>
                    {(() => {
                      const partida = partidasBonus.find(p => p.id === partidaSelecionada);
                      if (!partida) return null;

                      const estrelas = parseInt(estrelasInseridas || "0");
                      const moedas = parseInt(moedasInseridas || "0");
                      const medalhas = parseInt(medalhasInseridas || "0");

                      const resultado = calcularPontuacaoComMultiplicador(medalhas, estrelas, moedas, partida);

                      return (
                        <div className="space-y-1">
                          <p className="text-sm text-blue-700">
                            <strong>Bônus 1:</strong> {medalhas} × {partida.multiplicadorMedalhas || 1} = {resultado.medalhas}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Bônus 2:</strong> {estrelas} × {partida.multiplicadorEstrelas} = {resultado.estrelas}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Bônus 3:</strong> {moedas} × {partida.multiplicadorMoedas || 1} = {resultado.moedas}
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

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={!!bonusParaExcluir} onOpenChange={() => setBonusParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const bonus = torneio.bonus.find((b: any) => b.id === bonusParaExcluir);
                if (bonus?.ativo) {
                  return "ATENÇÃO: Você está prestes a excluir o bônus ATIVO! Esta ação removerá o bônus atual do torneio e todos os dados associados serão perdidos permanentemente. Tem certeza?";
                }
                return "Tem certeza que deseja excluir este bônus? Esta ação não pode ser desfeita e todos os dados associados serão perdidos permanentemente.";
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bonusParaExcluir && handleExcluirBonus(bonusParaExcluir)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir Bônus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Componente para gerenciar duplas - Adicionar pontuação
function GerenciamentoDuplas({ torneio }: { torneio: any }) {
  const [tag, setTag] = useState("")
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [duplaId, setDuplaId] = useState("")
  const [estrelasPontuacao, setEstrelasPontuacao] = useState("0")
  const [moedas, setMoedas] = useState("0")
  const [medalhas, setMedalhas] = useState("0")
  const [rodadaSelecionada, setRodadaSelecionada] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Função para limpar arquivo e preview
  const clearBannerFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setBannerFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Criar preview quando arquivo for selecionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // Limpar preview anterior
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setBannerFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  // Cleanup do preview quando componente for desmontado
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAdicionarPontuacao = async () => {
    try {
      if (!duplaId || !estrelasPontuacao || !moedas || !medalhas || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      console.log("🎯 Adicionando pontuação:", {
        duplaId,
        estrelas: parseInt(estrelasPontuacao),
        moedas: parseInt(moedas),
        medalhas: parseInt(medalhas),
        rodada: rodadaSelecionada
      });

      await torneio.adicionarPontuacao(
        duplaId,
        parseInt(medalhas), // medalhas
        parseInt(estrelasPontuacao),   // estrelas
        parseInt(moedas),   // moedas
        rodadaSelecionada
      )

      console.log("✅ Pontuação adicionada com sucesso!");
      toast.success("Pontuação adicionada com sucesso!")
      setEstrelasPontuacao("0")
      setMoedas("0")
      setMedalhas("0")
    } catch (error) {
      console.error("❌ Erro ao adicionar pontuação:", error);
      toast.error("Erro ao adicionar pontuação")
    }
  }

  const handleCriarDupla = async () => {
    if (isCreating) {
      console.log("⚠️ Criação já em andamento, ignorando...");
      return;
    }

    console.log("🚀 Iniciando criação de dupla...");
    setIsCreating(true);

    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout da operação!");
      toast.error("Operação demorou muito tempo. Tente novamente.");
      setIsCreating(false);
    }, 60000); // 60 segundos para upload local

    try {
      if (!tag) {
        toast.error("Preencha a tag da dupla!")
        return
      }

      if (tag.length < 2) {
        toast.error("A tag deve ter pelo menos 2 caracteres!")
        return
      }

      console.log("✅ Validações iniciais OK");
      let bannerUrl = undefined;
      let loadingToastId = null;

      // Se há um arquivo de banner, fazer upload local
      if (bannerFile) {
        console.log("📁 Iniciando upload local de arquivo...", bannerFile.name);

        try {
          loadingToastId = toast.loading("Fazendo upload da imagem...");

          // Criar FormData para envio
          const formData = new FormData();
          formData.append('file', bannerFile);
          formData.append('tag', tag.toUpperCase());

          console.log("� Enviando arquivo para API local...");

          // Fazer upload via API local
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Erro no upload');
          }

          bannerUrl = result.imageUrl;
          console.log("✅ Upload local concluído:", bannerUrl);

          if (loadingToastId) {
            toast.dismiss(loadingToastId);
            loadingToastId = null;
          }

        } catch (uploadError: any) {
          console.error("❌ Erro no upload local:", uploadError);
          if (loadingToastId) {
            toast.dismiss(loadingToastId);
          }

          const errorMessage = uploadError?.message || "Erro desconhecido no upload";
          toast.error(`Erro ao fazer upload: ${errorMessage}`);
          return;
        }
      }

      // Criar dupla com ou sem banner
      console.log("👥 Criando dupla no banco...", { tag: tag.toUpperCase(), bannerUrl });
      await torneio.criarDupla(tag.toUpperCase(), bannerUrl);
      console.log("✅ Dupla criada com sucesso!");

      clearTimeout(timeoutId);
      toast.success("Dupla criada com sucesso!");
      setTag("");
      clearBannerFile();

    } catch (error) {
      console.error("❌ Erro geral ao criar dupla:", error);
      clearTimeout(timeoutId);
      toast.error("Erro ao criar dupla");
    } finally {
      setIsCreating(false);
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
            <div className="space-y-3">
              <div>
                <Label className="font-bold text-gray-700 text-sm">Tag da Dupla</Label>
                <Input
                  placeholder="Nome da dupla (TAG)"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toUpperCase())}
                  className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base"
                />
              </div>
              <div>
                <Label className="font-bold text-gray-700 text-sm">Banner da Dupla</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">💡 Recomendação: 700x200 pixels para melhor visualização (opcional)</p>
                <p className="text-xs text-green-600 mt-1">✅ Arquivos de até 50MB são suportados</p>
                {bannerFile && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">✅ {bannerFile.name}</p>
                      <button
                        type="button"
                        onClick={clearBannerFile}
                        className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                      >
                        Remover
                      </button>
                    </div>
                    {previewUrl && (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview do banner"
                          className="w-full max-w-md h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">Preview do banner</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={handleCriarDupla}
            disabled={isCreating || !tag || tag.length < 2}
            className="w-full h-10 sm:h-12 rounded-full font-bold bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white mt-3 sm:mt-4 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                CRIANDO...
              </div>
            ) : (
              "CRIAR DUPLA"
            )}
          </Button>
        </CardContent>
      </Card>


      {/* Adicionar Pontuação */}
      <Card className="border-0 shadow-lg sm:shadow-xl lg:shadow-2xl bg-white rounded-xl sm:rounded-2xl overflow-hidden">
        <CardHeader className="text-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6" style={{ backgroundColor: "#0f006d" }}>
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
                      {dupla.tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 min-w-full">
                <div className="flex-1 min-w-0">
                  <Label className="font-bold text-gray-700 text-sm">Medalhas</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={medalhas}
                    onChange={(e) => setMedalhas(e.target.value)}
                    className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base no-scroll"
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="font-bold text-gray-700 text-sm">Estrelas</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={estrelasPontuacao}
                    onChange={(e) => setEstrelasPontuacao(e.target.value)}
                    className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base no-scroll"
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="font-bold text-gray-700 text-sm">Moedas</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={moedas}
                    onChange={(e) => setMoedas(e.target.value)}
                    className="rounded-full border-2 border-gray-300 h-10 sm:h-12 w-full text-sm sm:text-base no-scroll"
                    onWheel={(e) => e.currentTarget.blur()}
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

            <Button onClick={handleAdicionarPontuacao} className="w-full h-12 rounded-full font-bold text-white" style={{ backgroundColor: "#0f006d" }}>
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
  const [duplaParaRemover, setDuplaParaRemover] = useState<string | null>(null)
  const [modalIconeAberto, setModalIconeAberto] = useState<string | null>(null)
  const [duplaSelecionada, setDuplaSelecionada] = useState<string>('')

  const handleAtribuirIcone = async (duplaId: string, iconeUrl: string) => {
    try {
      if (iconeUrl) {
        await torneio.atualizarDupla(duplaId, { 
          itemIcon: iconeUrl 
        })
      } else {
        await torneio.atualizarDupla(duplaId, { 
          itemIcon: deleteField() 
        })
      }
      toast.success("Ícone atribuído com sucesso!")
    } catch (error) {
      toast.error("Erro ao atribuir ícone")
    }
  }

  const handleRemoverIcone = async (duplaId: string) => {
    try {
      await torneio.atualizarDupla(duplaId, { 
        itemIcon: deleteField() 
      })
      toast.success("Ícone removido com sucesso!")
    } catch (error) {
      toast.error("Erro ao remover ícone")
    }
  }

  // Cada linha terá estado local para edição (evita perda de foco enquanto digita)
  function DuplaRow({ dupla }: { dupla: Dupla }) {
    const [isEditing, setIsEditing] = useState(false)
    const [tagValue, setTagValue] = useState(dupla.tag || '')
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
      setTagValue(dupla.tag || '')
      setFile(null)
    }, [dupla.id])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] || null
      setFile(f)
    }

    const handleSave = async () => {
      try {
        let bannerUrlToSave = dupla.bannerUrl || ''
        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('tag', tagValue.toUpperCase())

          const response = await fetch('/api/upload', { method: 'POST', body: formData })
          const result = await response.json()
          if (result.success) {
            bannerUrlToSave = result.imageUrl
          } else {
            toast.error(result.message || 'Erro no upload da imagem')
            return
          }
        }

        await torneio.atualizarDupla(dupla.id, { tag: tagValue, bannerUrl: bannerUrlToSave })
        toast.success('Dupla atualizada')
        setIsEditing(false)
      } catch (error) {
        toast.error('Erro ao atualizar dupla')
      }
    }

    const handleCancel = () => {
      setIsEditing(false)
      setTagValue(dupla.tag || '')
      setFile(null)
    }

    const valores = calcularValoresRodadas(dupla)

    return (
      <div key={dupla.id} className="p-3 rounded-xl border-2 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-20 h-14 sm:w-24 sm:h-16 md:w-28 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
            <BannerDupla dupla={dupla} className="w-full h-full text-xs" />
          </div>
          <div className="flex-1">
            {!isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-gray-800">{dupla.tag}</h3>
                  {dupla.itemIcon && (
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center">
                      <img 
                        src={dupla.itemIcon} 
                        alt="Ícone" 
                        className="w-4 h-4 object-contain"
                        title="Ícone atribuído à dupla"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 font-semibold">{`🏅 ${valores.medalhasRodadas} • ⭐ ${valores.estrelasRodadas} • 🪙 ${valores.moedasRodadas}`}</p>
              </>
            ) : (
              <div className="space-y-2">
                <Input value={tagValue} onChange={(e) => setTagValue(e.target.value)} className="rounded-full" />
                <div className="border-2 rounded-lg p-2 cursor-pointer">
                  <Label className="text-xs font-semibold cursor-pointer">Upload de novo banner (opcional)</Label>
                  <input type="file" accept="image/*" className="cursor-pointer" onChange={handleFileChange} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="sm" className="rounded-full text-white text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600">Editar</Button>
          ) : (
            <>
              <Button onClick={handleSave} size="sm" className="rounded-full bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1">Salvar</Button>
              <Button onClick={handleCancel} size="sm" variant="outline" className="rounded-full border-2 text-xs px-3 py-1">Cancelar</Button>
            </>
          )}

          <Button 
            onClick={() => setModalIconeAberto(dupla.id)} 
            size="sm" 
            className="rounded-full text-white text-xs px-3 py-1 bg-purple-500 hover:bg-purple-600 flex items-center space-x-1"
          >
            {dupla.itemIcon ? (
              <img 
                src={dupla.itemIcon} 
                alt="Ícone atual" 
                className="w-3 h-3 object-contain"
              />
            ) : (
              <Trophy className="w-3 h-3" />
            )}
            <span>{dupla.itemIcon ? 'Alterar' : 'Ícone'}</span>
          </Button>

          <Button onClick={() => handleAtualizarStatusEspecial(dupla.id, 'JambaVIP')} size="sm" className={`rounded-full text-white text-xs px-3 py-1 ${dupla.status === 'JambaVIP' ? 'bg-purple-600' : 'bg-purple-400 hover:bg-purple-500'}`}>👑 JambaVIP</Button>
          <Button onClick={() => handleAtualizarStatusEspecial(dupla.id, 'Jamberlinda')} size="sm" className={`rounded-full text-white text-xs px-3 py-1 ${dupla.status === 'Jamberlinda' ? 'bg-pink-600' : 'bg-pink-400 hover:bg-pink-500'}`}>Jamberlinda</Button>
          <Button onClick={() => handleAtualizarStatusEspecial(dupla.id, 'Dupla Aguardando Resultado')} size="sm" className={`rounded-full text-white text-xs px-3 py-1 ${dupla.status === 'Dupla Aguardando Resultado' ? 'bg-orange-600' : 'bg-orange-400 hover:bg-orange-500'}`}>⏳ Aguardando</Button>
          <Button onClick={() => handleAtualizarStatusEspecial(dupla.id, 'normal')} size="sm" className={`rounded-full text-white text-xs px-3 py-1 ${!['JambaVIP', 'Jamberlinda', 'Dupla Aguardando Resultado'].includes(dupla.status) ? 'bg-gray-600' : 'bg-gray-400 hover:bg-gray-500'}`}>👥 Normal</Button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          {duplaParaRemover === dupla.id ? (
            <div className="flex space-x-2 items-center">
              <span className="text-sm font-semibold text-red-600 mr-2">Confirmar remoção?</span>
              <Button onClick={() => handleRemoverDupla(dupla.id)} size="sm" className="rounded-full bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1">Sim</Button>
              <Button onClick={() => setDuplaParaRemover(null)} size="sm" className="rounded-full bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1">Não</Button>
            </div>
          ) : (
            <Button onClick={() => setDuplaParaRemover(dupla.id)} size="sm" className="rounded-full bg-red-400 hover:bg-red-500 text-white flex items-center space-x-1 text-xs px-3 py-1">
              <Trash2 className="w-3 h-3" />
              <span>Remover</span>
            </Button>
          )}
        </div>
      </div>
    )
  }

  const handleRemoverDupla = async (duplaId: string) => {
    try {
      const dupla = torneio.duplas.find((d: Dupla) => d.id === duplaId)
      await torneio.removerDupla(duplaId)
      setDuplaParaRemover(null)
      toast.success(`Dupla "${dupla?.tag}" removida com sucesso!`)
    } catch (error) {
      console.error('Erro ao remover dupla:', error)
      toast.error("Erro ao remover dupla!")
    }
  }

  const handleAtualizarStatusEspecial = async (duplaId: string, statusEspecial: 'JambaVIP' | 'Jamberlinda' | 'Dupla Aguardando Resultado' | 'normal') => {
    try {
      const dupla = torneio.duplas.find((d: Dupla) => d.id === duplaId)
      await torneio.atualizarStatusEspecialDupla(duplaId, statusEspecial)
      const statusTexto = statusEspecial === 'normal' ? 'Normal' : statusEspecial
      toast.success(`Dupla "${dupla?.tag}" definida como "${statusTexto}"!`)
    } catch (error) {
      console.error('Erro ao atualizar status especial:', error)
      toast.error("Erro ao atualizar status especial!")
    }
  }

  // Separar duplas por status especial
  const jambaVIP = torneio.duplas.filter((d: Dupla) => d.status === 'JambaVIP')
  const jamberlinda = torneio.duplas.filter((d: Dupla) => d.status === 'Jamberlinda')
  const aguardandoResultado = torneio.duplas.filter((d: Dupla) => d.status === 'Dupla Aguardando Resultado')
  const normais = torneio.duplas.filter((d: Dupla) => !['JambaVIP', 'Jamberlinda', 'Dupla Aguardando Resultado'].includes(d.status))

  const StatusCard = ({ titulo, duplas, cor, icone }: { titulo: string, duplas: Dupla[], cor: string, icone: React.ReactNode }) => (
    <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
      <CardHeader className="text-white px-4 py-4" style={{ backgroundColor: cor }}>
        <CardTitle className="text-lg font-black flex items-center space-x-2">
          {icone}
          <span>{titulo}</span>
          <span className="text-sm font-normal">({duplas.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {duplas.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Nenhuma dupla nesta categoria</p>
            </div>
          ) : (
            duplas.map((dupla: Dupla) => (
              <DuplaRow key={dupla.id} dupla={dupla} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header geral */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="text-white px-6 py-6" style={{ backgroundColor: "#0f006d" }}>
          <CardTitle className="text-2xl font-black flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>Gerenciamento de Duplas</span>
          </CardTitle>
          <CardDescription className="text-blue-100 font-semibold">
            Defina o status especial das duplas: JambaVIP, Jamberlinda ou Aguardando Resultado
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Grid responsivo de status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        <StatusCard 
          titulo=" JambaVIP" 
          duplas={jambaVIP} 
          cor="#8B5CF6" 
          icone={<span className="text-lg" />}
        />
        <StatusCard 
          titulo=" Jamberlinda" 
          duplas={jamberlinda} 
          cor="#EC4899" 
          icone={<span className="text-lg"></span>}
        />
        <StatusCard 
          titulo="Aguardando Resultado" 
          duplas={aguardandoResultado} 
          cor="#F97316" 
          icone={<span className="text-lg"></span>}
        />
        <StatusCard 
          titulo=" Duplas Normais" 
          duplas={normais} 
          cor="#6B7280" 
          icone={<span className="text-lg"></span>}
        />
      </div>

      {/* Modal de Seleção de Ícone */}
      {modalIconeAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Selecionar Ícone para Dupla
              </h3>
              <p className="text-purple-100 mt-1">
                Escolha um item da loja para ser o ícone da dupla: <span className="font-bold">{torneio.duplas.find((d: Dupla) => d.id === modalIconeAberto)?.tag}</span>
              </p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {torneio.itensLoja.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500 font-semibold">Nenhum item cadastrado</p>
                  <p className="text-sm text-gray-400">Adicione itens à loja primeiro!</p>
                </div>
              ) : (
                <>
                  {/* Opção para remover ícone */}
                  <div 
                    className="border-2 border-red-200 rounded-xl p-4 cursor-pointer hover:bg-red-50 transition-colors mb-4"
                    onClick={() => {
                      handleRemoverIcone(modalIconeAberto)
                      setModalIconeAberto(null)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <X className="w-8 h-8 text-red-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-red-600">Remover Ícone</h4>
                        <p className="text-sm text-red-500">Clique para não mostrar nenhum ícone</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de itens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {torneio.itensLoja.map((item: any) => (
                      <div
                        key={item.id}
                        className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                        onClick={() => {
                          handleAtribuirIcone(modalIconeAberto, item.imagem)
                          setModalIconeAberto(null)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.imagem}
                              alt={item.nome}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-800 truncate">{item.nome}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.descricao}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                💰 {item.preco}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="border-t bg-gray-50 p-4">
              <Button
                onClick={() => setModalIconeAberto(null)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para mostrar rankings
function RankingsManager({ torneio }: { torneio: any }) {
  const [activeTab, setActiveTab] = useState("geral")

  // Use canonical ranking from hook for admin view
  const calcularRankingGeral = () => torneio.getRankingGeral();

  const calcularRankingPorRodada = (rodadaId: string) => torneio.getRankingPorRodada(rodadaId);

  const calcularRankingPorBonus = (bonusId: string) => torneio.getRankingPorBonus(bonusId, torneio.bonus.find((b: any) => b.id === bonusId));

  const rankingGeral = calcularRankingGeral();
  const rodadas = torneio.rodadas;
  const bonus = torneio.bonus;

  return (
    <div className="space-y-6">
      {/* Navegação dos Rankings */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setActiveTab("geral")}
          className={`rounded-full px-6 py-3 font-bold ${activeTab === "geral"
            ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
            : "bg-gray-300 text-black hover:bg-gray-400"
            }`}
        >
          Ranking Geral
        </Button>
        {rodadas.map((rodada: any) => (
          <Button
            key={rodada.id}
            onClick={() => setActiveTab(rodada.id)}
            className={`rounded-full px-6 py-3 font-bold ${activeTab === rodada.id
              ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
              : "bg-gray-300 text-black hover:bg-gray-400"
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
              ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
              : "bg-gray-300 text-black hover:bg-gray-400"
              }`}
          >
            ⭐ BÔNUS - {bonusItem.nome}
          </Button>
        ))}
      </div>

      {/* Tabelas de Ranking */}
      {activeTab === "geral" && <RankingTable title="Ranking Geral" data={rankingGeral} />}
      {rodadas.map((rodada: any) =>
        activeTab === rodada.id ? (
          <RankingTable
            key={rodada.id}
            title={rodada.nome}
            data={calcularRankingPorRodada(rodada.id)}
            showRoundPoints={true}
          />
        ) : null
      )}
      {bonus.map((bonusItem: any) =>
        activeTab === `bonus-${bonusItem.id}` && (
          <RankingTable
            key={`bonus-table-${bonusItem.id}`}
            title={`BÔNUS - ${bonusItem.nome}`}
            data={calcularRankingPorBonus(bonusItem.id)}
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
  const [quantidade, setQuantidade] = useState("")
  const [rodadaSelecionada, setRodadaSelecionada] = useState("")
  const [itemEditando, setItemEditando] = useState<any>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null)
  const [imagemPreview, setImagemPreview] = useState<string>("")
  const [uploadandoImagem, setUploadandoImagem] = useState(false)
  
  // Estados para tooltip móvel
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const tooltipRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  
  // Estado para seleção de dupla no gerenciamento de ícones
  const [duplaSelecionada, setDuplaSelecionada] = useState<string>('')

  const handleTooltipToggle = (index: number) => {
    if (activeTooltip === index) {
      setActiveTooltip(null)
    } else {
      setActiveTooltip(index)
    }
  }

  const handleClickOutside = () => {
    setActiveTooltip(null)
  }

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (arquivo) {
      setImagemArquivo(arquivo)
      
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagemPreview(reader.result as string)
      }
      reader.readAsDataURL(arquivo)
    }
  }

  const uploadImagem = async (): Promise<string | undefined> => {
    if (!imagemArquivo) return undefined

    try {
      setUploadandoImagem(true)
      
      const formData = new FormData()
      formData.append('file', imagemArquivo)
      formData.append('tag', 'ITEM')
      formData.append('type', 'item')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        return result.imageUrl
      } else {
        toast.error(result.message || 'Erro no upload da imagem')
        return undefined
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro no upload da imagem')
      return undefined
    } finally {
      setUploadandoImagem(false)
    }
  }

  const limparImagem = () => {
    setImagemArquivo(null)
    setImagemPreview("")
  }

  const handleAdicionarItem = async () => {
    try {
      if (!nome || !descricao || !preco || !quantidade || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      // Upload da imagem se houver
      let imagemUrl: string | undefined = undefined
      if (imagemArquivo) {
        imagemUrl = await uploadImagem()
        if (!imagemUrl) return // Se falhou no upload, para a execução
      }

      await torneio.adicionarItemLoja(nome, descricao, parseInt(preco), rodadaSelecionada, parseInt(quantidade), imagemUrl)
      toast.success("Item adicionado com sucesso!")
      setNome("")
      setDescricao("")
      setPreco("")
      setQuantidade("")
      limparImagem()
    } catch (error) {
      toast.error("Erro ao adicionar item")
    }
  }

  const handleEditarItem = (item: any) => {
    setItemEditando(item)
    setNome(item.nome)
    setDescricao(item.descricao)
    setPreco(item.preco.toString())
    setQuantidade(item.quantidadeTotal?.toString() || "0")
    setRodadaSelecionada(item.rodada)
    
    // Carregar imagem atual se existir
    if (item.imagem) {
      setImagemPreview(item.imagem)
    } else {
      setImagemPreview("")
    }
    
    setModoEdicao(true)
  }

  const handleSalvarEdicao = async () => {
    try {
      if (!nome || !descricao || !preco || !quantidade || !rodadaSelecionada) {
        toast.error("Preencha todos os campos!")
        return
      }

      // Upload nova imagem se selecionada
      let imagemUrl: string | undefined = itemEditando.imagem // Manter a atual por padrão
      if (imagemArquivo) {
        const novaImagemUrl = await uploadImagem()
        if (novaImagemUrl) {
          imagemUrl = novaImagemUrl
        } else {
          return // Se falhou no upload, para a execução
        }
      }

      await torneio.editarItemLoja(itemEditando.id, nome, descricao, parseInt(preco), rodadaSelecionada, parseInt(quantidade), imagemUrl)
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
    setQuantidade("")
    setRodadaSelecionada("")
    limparImagem()
  }

  const handleRemoverItem = async (itemId: string) => {
    try {
      await torneio.removerItemLoja(itemId)
      toast.success("Item removido com sucesso!")
    } catch (error) {
      toast.error("Erro ao remover item")
    }
  }

  const handleAtribuirIcone = async (duplaId: string, iconeUrl: string) => {
    try {
      if (iconeUrl) {
        await torneio.atualizarDupla(duplaId, { 
          itemIcon: iconeUrl 
        })
      } else {
        await torneio.atualizarDupla(duplaId, { 
          itemIcon: deleteField() 
        })
      }
      toast.success("Ícone atribuído com sucesso!")
    } catch (error) {
      toast.error("Erro ao atribuir ícone")
    }
  }

  const handleRemoverIcone = async (duplaId: string) => {
    try {
      await torneio.atualizarDupla(duplaId, { 
        itemIcon: deleteField() 
      })
      toast.success("Ícone removido com sucesso!")
    } catch (error) {
      toast.error("Erro ao remover ícone")
    }
  }

  return (
    <div className="space-y-6" onClick={handleClickOutside}>
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
              <Label className="font-bold text-gray-700">Imagem do Item (opcional)</Label>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImagemChange}
                  className="rounded-full border-2 border-gray-300 h-12 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagemPreview && (
                  <div className="relative">
                    <img 
                      src={imagemPreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" 
                    />
                    <button
                      type="button"
                      onClick={limparImagem}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label className="font-bold text-gray-700">Preço (moedas)</Label>
              <Input
                type="number"
                placeholder="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12 no-scroll"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
            <div>
              <Label className="font-bold text-gray-700">Quantidade Disponível</Label>
              <Input
                type="number"
                placeholder="0"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="rounded-full border-2 border-gray-300 h-12 no-scroll"
                min="0"
                onWheel={(e) => e.currentTarget.blur()}
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
                  <Button 
                    onClick={handleSalvarEdicao} 
                    disabled={uploadandoImagem}
                    className="flex-1 h-12 rounded-full font-bold bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white disabled:opacity-50"
                  >
                    {uploadandoImagem ? "ENVIANDO IMAGEM..." : "SALVAR ALTERAÇÕES"}
                  </Button>
                  <Button onClick={handleCancelarEdicao} variant="outline" className="flex-1 h-12 rounded-full font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    CANCELAR
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleAdicionarItem} 
                  disabled={uploadandoImagem}
                  className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-50"
                >
                  {uploadandoImagem ? "ENVIANDO IMAGEM..." : "ADICIONAR ITEM"}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {torneio.itensLoja.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 font-semibold">Nenhum item cadastrado</p>
                <p className="text-sm text-gray-400">Adicione o primeiro item à loja!</p>
              </div>
            ) : (
              torneio.itensLoja.map((item: any, index: number) => (
                <div 
                  key={item.id} 
                  ref={(el) => { tooltipRefs.current[index] = el }}
                  className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all relative group cursor-pointer sm:cursor-default"
                  onClick={(e) => {
                    if (window.innerWidth < 640) { // Apenas mobile
                      e.stopPropagation()
                      handleTooltipToggle(index)
                    }
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    {item.imagem && (
                      <div className="flex-shrink-0">
                        <img 
                          src={item.imagem} 
                          alt={item.nome}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-orange-200" 
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg text-gray-800 mb-1">{item.nome}</h3>
                      <p className="text-sm text-gray-600 font-semibold mb-2 line-clamp-2 cursor-help">
                        {item.descricao}
                      </p>
                      
                      {/* Tooltip com descrição completa */}
                      <div className={`absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-80 max-w-[90vw] bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 z-50 transition-all duration-200 pointer-events-none ${
                        activeTooltip === index ? 'sm:hidden opacity-100 visible' : 'opacity-0 invisible sm:group-hover:opacity-100 sm:group-hover:visible'
                      }`}>
                        <div className="text-sm font-semibold text-gray-800 mb-2">{item.nome}</div>
                        <div className="text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto">{item.descricao}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-lg font-black text-orange-600 whitespace-nowrap">{item.preco} moedas</p>
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-semibold whitespace-nowrap truncate max-w-[120px]">
                          {torneio.rodadas.find((r: any) => r.id === item.rodada)?.nome || 'Rodada não encontrada'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${
                          (item.quantidadeDisponivel || 0) <= 0 
                            ? 'bg-red-200 text-red-800' 
                            : 'bg-green-200 text-green-800'
                        }`}>
                          {(item.quantidadeDisponivel || 0) <= 0 
                            ? 'Esgotado' 
                            : `${item.quantidadeDisponivel || 0}/${item.quantidadeTotal || 0}`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
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

      {/* Gerenciamento de Ícones das Duplas */}
      <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-6">
          <CardTitle className="text-2xl font-black">Atribuir Ícones às Duplas</CardTitle>
          <CardDescription className="text-purple-100 font-semibold">
            Selecione uma dupla e atribua um ícone de item da loja
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {torneio.duplas.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 font-semibold">Nenhuma dupla cadastrada</p>
              <p className="text-sm text-gray-400">Cadastre duplas primeiro para atribuir ícones!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Seleção de Dupla */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Selecionar Dupla
                </Label>
                <select
                  className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={duplaSelecionada}
                  onChange={(e) => setDuplaSelecionada(e.target.value)}
                >
                  <option value="">Escolha uma dupla...</option>
                  {torneio.duplas.map((dupla: Dupla) => (
                    <option key={dupla.id} value={dupla.id}>
                      {dupla.tag} - {dupla.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview da Dupla Selecionada */}
              {duplaSelecionada && (() => {
                const dupla = torneio.duplas.find((d: Dupla) => d.id === duplaSelecionada);
                return dupla ? (
                  <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={dupla.bannerUrl}
                          alt={dupla.tag}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{dupla.tag}</h3>
                        <p className="text-sm text-gray-600">
                          Status: <span className="font-medium">{dupla.status}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">Ícone atual:</span>
                          {dupla.itemIcon ? (
                            <img
                              src={dupla.itemIcon}
                              alt="Ícone da dupla"
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Nenhum ícone</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Seleção de Ícone */}
              {duplaSelecionada && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Selecionar Ícone
                  </Label>
                  <div className="flex gap-3">
                    <select
                      className="flex-1 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={(() => {
                        const dupla = torneio.duplas.find((d: Dupla) => d.id === duplaSelecionada);
                        return dupla?.itemIcon || '';
                      })()}
                      onChange={(e) => handleAtribuirIcone(duplaSelecionada, e.target.value)}
                      disabled={modoEdicao}
                    >
                      <option value="">Remover ícone</option>
                      {torneio.itensLoja.map((item: any) => (
                        <option key={item.id} value={item.imagem}>
                          {item.nome} - 💰 {item.preco}
                        </option>
                      ))}
                    </select>
                    
                    {(() => {
                      const dupla = torneio.duplas.find((d: Dupla) => d.id === duplaSelecionada);
                      return dupla?.itemIcon ? (
                        <Button
                          onClick={() => handleRemoverIcone(duplaSelecionada)}
                          variant="outline"
                          className="rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 px-4"
                          disabled={modoEdicao}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remover
                        </Button>
                      ) : null;
                    })()}
                  </div>
                  
                  {torneio.itensLoja.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ⚠️ Nenhum item cadastrado na loja. Adicione itens primeiro!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
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
  // Debug: Ver os dados que estão chegando
  console.log(`🔍 RankingTable Debug - ${title}:`, {
    dataLength: data.length,
    showRoundPoints,
    showBonusPoints,
    sampleData: data.slice(0, 3).map((d: any) => ({
      tag: d.tag,
      estrelas: d.estrelas,
      estrelasRodada: d.estrelasRodada,
      estrelasBonus: d.estrelasBonus,
      estrelasPorRodada: d.estrelasPorRodada,
      estrelasPorBonus: d.estrelasPorBonus
    }))
  });

  // Verificar se há dados relevantes
  const hasRelevantData = data.some(dupla => {
    if (showRoundPoints) {
      return ((dupla as any).medalhasRodada || 0) > 0 || ((dupla as any).estrelasRodada || 0) > 0 || ((dupla as any).moedasRodada || 0) > 0;
    } else if (showBonusPoints) {
      return ((dupla as any).medalhasBonus || 0) > 0 || ((dupla as any).estrelasBonus || 0) > 0 || ((dupla as any).moedasBonus || 0) > 0;
    }
    return true; // Para ranking geral, sempre mostrar
  });
  return (
    <div className="ranking-card table-container-responsive bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border-0 max-w-full">
      {title && (
        <div className="p-4 sm:p-6 bg-gradient-to-r bg-[#0f006d]">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white text-center drop-shadow-lg">{title}</h2>
        </div>
      )}
      <div className="p-3 sm:p-4 lg:p-6 max-w-full overflow-hidden">
        {/* Container com scroll horizontal para mobile e desktop compacto */}
        <div className="overflow-x-auto custom-scrollbar mobile-scroll-container">
          <div className="min-w-full space-y-3 sm:space-y-4">
            {data.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">Nenhuma dupla encontrada</h3>
                <p className="text-gray-500">Crie duplas primeiro para visualizar o ranking</p>
              </div>
            ) : !hasRelevantData && (showRoundPoints || showBonusPoints) ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">
                  {showRoundPoints ? "Nenhuma pontuação registrada para esta rodada" : "Nenhuma pontuação registrada para este bônus"}
                </h3>
                <p className="text-gray-500">
                  {showRoundPoints
                    ? "Adicione pontuações nas duplas através da aba 'Duplas' para ver o ranking desta rodada"
                    : "Adicione pontuações de bônus através da aba 'Bônus' para ver este ranking"}
                </p>
              </div>
            ) : (
              data.map((dupla, index) => {
                // Determinar quais valores exibir baseado no tipo de tabela
                let medalhasParaExibir, estrelasParaExibir, moedasParaExibir;

                if (showBonusPoints) {
                  // Para tabelas de bônus, mostrar a soma total dos bônus em uma única box
                  const medalhasBonus = Number((dupla as any).medalhasBonus) || 0;
                  const estrelasBonus = Number((dupla as any).estrelasBonus) || 0;
                  const moedasBonus = Number((dupla as any).moedasBonus) || 0;
                  const totalBonus = medalhasBonus + estrelasBonus + moedasBonus;
                  
                  medalhasParaExibir = 0; // Não exibir campos separados
                  estrelasParaExibir = 0;
                  moedasParaExibir = 0;
                  (dupla as any).totalBonus = totalBonus; // Adicionar campo para exibição
                  console.log('DEBUG BONUS:', dupla.tag, { medalhasBonus, estrelasBonus, moedasBonus, totalBonus });
                } else if (showRoundPoints) {
                  // Para tabelas de rodada, mostrar apenas valores da rodada
                  medalhasParaExibir = Number((dupla as any).medalhasRodada) || 0;
                  estrelasParaExibir = Number((dupla as any).estrelasRodada) || 0;
                  moedasParaExibir = Number((dupla as any).moedasRodada) || 0;
                  console.log('DEBUG RODADA:', dupla.tag, { estrelasRodada: (dupla as any).estrelasRodada, estrelasParaExibir });
                } else {
                  // Para ranking geral, mostrar totais
                  medalhasParaExibir = Number(dupla.medalhas) || 0;
                  estrelasParaExibir = Number(dupla.estrelas) || 0;
                  moedasParaExibir = Number(dupla.moedas) || 0;
                  console.log('DEBUG GERAL:', dupla.tag, { estrelas: dupla.estrelas, estrelasParaExibir });
                }

                // Garantir que todos os valores são números válidos
                medalhasParaExibir = isNaN(medalhasParaExibir) ? 0 : medalhasParaExibir;
                estrelasParaExibir = isNaN(estrelasParaExibir) ? 0 : estrelasParaExibir;
                moedasParaExibir = isNaN(moedasParaExibir) ? 0 : moedasParaExibir; return (
                  <div
                    key={dupla.id}
                    className="ranking-card flex items-center gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border-2 border-transparent min-w-max mobile-scroll-item desktop-compact shadow-sm hover:shadow-md transition-all duration-300"
                    style={{ '--hover-border-color': '#0f006d' } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0f006d'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    {/* Posição - com gradiente da classe CSS */}
                    <div className="ranking-position w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-white text-sm sm:text-lg lg:text-xl flex-shrink-0">
                      {(dupla as any).posicao || (index + 1)}°
                    </div>

                    {/* Ícone do Item - container similar ao de posição */}
                    <div className="item-icon-container w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-r from-orange-400 to-yellow-400 flex-shrink-0">
                      {dupla.itemIcon ? (
                        <img 
                          src={dupla.itemIcon} 
                          alt="Item Icon" 
                          className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">?</span>
                        </div>
                      )}
                    </div>

                    {/* Nome da Dupla - com banner quando disponível */}
                    <div className="ranking-name-container rounded-xl sm:rounded-2xl overflow-hidden min-w-0 w-64 sm:w-32 md:flex-1">
                      <div className="relative w-full h-16 sm:h-36 md:h-20 lg:h-36">
                        <BannerDupla 
                          dupla={dupla} 
                          className="w-full h-full rounded-xl sm:rounded-2xl text-xs sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Estatísticas - com classes CSS customizadas */}
                    <div className="flex gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
                      {showBonusPoints ? (
                        // Para ranking de bônus, mostrar apenas uma caixa com o total
                        <div className="bonus-total-badge bg-purple-500 stat-badge w-16 h-12 sm:w-18 sm:h-14 lg:w-20 lg:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 touch-target">
                          <span className="font-bold text-xs mb-0.5">BÔNUS</span>
                          <span className="font-black text-xs sm:text-sm lg:text-base">{(dupla as any).totalBonus || 0}</span>
                        </div>
                      ) : (
                        <>
                          {/* Medalhas */}
                          <div className="medals-badge stat-badge w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 touch-target">
                            <Image src="/medal_icon.png" alt="Medal" width={16} height={16} className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mb-0.5" />
                            <span className="font-black text-xs sm:text-sm lg:text-base">{medalhasParaExibir}</span>
                          </div>

                          {/* Estrelas */}
                          <div className="stars-badge stat-badge w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 touch-target">
                            <Image src="/star_icon.png" alt="Star" width={16} height={16} className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mb-0.5" />
                            <span className="font-black text-xs sm:text-sm lg:text-base">{estrelasParaExibir}</span>
                          </div>

                          {/* Moedas */}
                          <div className="coins-badge bg-amber-300 stat-badge w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 touch-target">
                            <Image src="/coin_icon.png" alt="Coin" width={16} height={16} className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mb-0.5" />
                            <span className="font-black text-xs sm:text-sm lg:text-base">{moedasParaExibir}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente da loja para jogadores
function LojaView({ torneio, showComprarButton = true }: { torneio: any; showComprarButton?: boolean }) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number}>({ x: 0, y: 0 })
  const tooltipRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  // Criar listas ordenadas a partir do ranking geral para garantir consistência
  const rankingGeral = torneio.getRankingGeral()
  const jambaVIP = rankingGeral.filter((d: Dupla) => d.status === 'JambaVIP')
  const jamberlinda = rankingGeral.filter((d: Dupla) => d.status === 'Jamberlinda')
  const aguardando = rankingGeral.filter((d: Dupla) => d.status === 'Dupla Aguardando Resultado')

  // Usar rankingGeral como fonte de verdade para totais das rodadas
  const rankingLookup: Record<string, any> = {}
  rankingGeral.forEach((d: any) => { if (d && d.id) rankingLookup[d.id] = d })

  console.log('🎮 JogadorView - Duplas carregadas:', {
    jambaVIP: jambaVIP.length,
    jamberlinda: jamberlinda.length,  
    aguardando: aguardando.length,
    aguardandoData: aguardando.map((d: any) => ({ id: d.id, tag: d.tag, status: d.status }))
  });

  const handleTooltipToggle = (index: number, event?: React.MouseEvent) => {
    if (activeTooltip === index) {
      setActiveTooltip(null)
    } else {
      setActiveTooltip(index)
      
      // Calcular posição do tooltip baseada no elemento clicado
      if (event && tooltipRefs.current[index]) {
        const rect = event.currentTarget.getBoundingClientRect()
        const scrollY = window.pageYOffset || document.documentElement.scrollTop
        
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + scrollY - 10 // 10px acima do elemento
        })
      }
    }
  }

  const handleClickOutside = () => {
    setActiveTooltip(null)
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 max-w-6xl mx-auto relative" onClick={handleClickOutside}>

      {/* Mascote da Lojinha - Fora do card para não ser cortado */}
      <div className="absolute transform scale-x-[-1] -top-2 -right-2 sm:-top-4 sm:-right-4 w-20 h-20 sm:w-32 sm:h-32 z-50">
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
          🎪 HA HA HA! Bem-vindos à minha loja misteriosa!
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
        <CardContent className="p-2 sm:p-3 carousel-container">
          {/* Container com scroll horizontal otimizado - Carrossel sem quebra */}
          <div className="relative carousel-wrapper">
            <div className="loja-carousel custom-scrollbar">
              <div className="flex gap-3 sm:gap-4 min-w-max scroll-smooth-x p-1 sm:p-2 pb-4 
                             items-start justify-start sm:items-center sm:justify-center 
                             min-h-[240px] sm:min-h-[280px]">
                {torneio.itensLoja.map((item: any, index: number) => (
                  <div
                    key={index}
                    ref={(el) => { tooltipRefs.current[index] = el }}
                    className="loja-carousel-item flex-shrink-0 w-72 sm:w-80 md:w-84 p-3 sm:p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg sm:rounded-xl border-2 border-orange-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer sm:cursor-default"
                    style={{ minWidth: '288px', maxWidth: '320px' }}
                    onClick={(e) => {
                      if (window.innerWidth < 640) { // Apenas mobile
                        e.stopPropagation()
                        handleTooltipToggle(index, e)
                      }
                    }}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Imagem do Item */}
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-orange-200 flex items-center justify-center">
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
                          <span className="text-orange-400 text-xl sm:text-2xl font-bold">
                            {item.nome?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Conteúdo do Item */}
                      <div className="flex-1 min-w-0 relative group">
                        <h3 className="font-black text-sm sm:text-base text-gray-800 mb-2 line-clamp-1">{item.nome}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2 font-semibold line-clamp-2">
                          {item.descricao}
                        </p>
                        
                        {/* Tooltip com descrição completa - Ativo por hover no desktop e clique no mobile */}
                        <div className={`fixed bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4 transition-all duration-200 ${
                          activeTooltip === index ? 'sm:hidden opacity-100 visible z-[9999]' : 'opacity-0 invisible sm:group-hover:opacity-100 sm:group-hover:visible sm:group-hover:z-[9999] z-[-1]'
                        } pointer-events-none`}
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '280px',
                          maxWidth: '90vw'
                        }}>
                          <div className="text-sm font-semibold text-gray-800 mb-2">{item.nome}</div>
                          <div className="text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto">{item.descricao}</div>
                        </div>
                        
                        {/* Quantidade Disponível */}
                        <div className="mb-2 sm:mb-3">
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
                        
                        <div className="flex flex-col gap-2">
                          <span className="text-base sm:text-lg font-black text-orange-600">{item.preco} moedas</span>
                          {showComprarButton && (
                            <Button 
                              className="w-full rounded-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-4 py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantidadeDisponivel <= 0}
                              onClick={(e) => {
                                e.stopPropagation()
                                // Lógica de compra aqui
                                console.log('Comprando item:', item.nome)
                              }}
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
            
            {/* Indicadores de scroll (opcional) */}
            {torneio.itensLoja.length > 1 && (
              <div className="flex justify-center mt-2 gap-1">
                {Array.from({ length: Math.min(torneio.itensLoja.length, 5) }).map((_, index) => (
                  <div key={index} className="w-2 h-2 rounded-full bg-gray-300"></div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categorias Especiais */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 xl:gap-6">
        {/* JambaVIP */}
        <Card className="border-0 shadow-lg sm:shadow-xl lg:shadow-2xl bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden">
          <CardHeader className="text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4" style={{ backgroundColor: "#0f006d" }}>
            <CardTitle className="text-sm sm:text-base lg:text-xl font-black">JambaVIP</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 lg:p-6">
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {jambaVIP.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 mx-auto text-purple-300 mb-2" />
                  <p className="text-purple-600 font-bold text-sm">Categoria vazia</p>
                </div>
              ) : (
                jambaVIP.map((dupla: Dupla) => {
                  const ranked = rankingLookup[dupla.id]
                  const medalhas = ranked?.medalhas ?? calcularValoresRodadas(dupla).medalhasRodadas
                  const estrelas = ranked?.estrelas ?? calcularValoresRodadas(dupla).estrelasRodadas
                  const moedas = ranked?.moedas ?? calcularValoresRodadas(dupla).moedasRodadas
                  return (
                    <div
                      key={dupla.id}
                      className="ranking-card flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                      style={{ '--hover-border-color': '#0f006d' } as React.CSSProperties}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0f006d'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                    {/* Posição VIP - menor */}
                    <div className="ranking-position w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0">
                      VIP
                    </div>

                    {/* Nome da Dupla - flexível */}
                    <div className="ranking-name-container rounded-lg sm:rounded-xl overflow-hidden min-w-0 flex-1">
                      <div className="relative w-full h-14 sm:h-16">
                        <BannerDupla 
                          dupla={dupla} 
                          className="w-full h-full rounded-lg sm:rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                      {/* Estatísticas - compactas (usar rankingGeral como fonte) */}
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      {/* Medalhas */}
                      <div className="medals-badge stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                        <Image src="/medal_icon.png" alt="Medal" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                        <span className="font-bold text-xs">{medalhas || 0}</span>
                      </div>

                      {/* Estrelas */}
                      <div className="stars-badge stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                        <Image src="/star_icon.png" alt="Star" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                        <span className="font-bold text-xs">{estrelas || 0}</span>
                      </div>

                      {/* Moedas */}
                      <div className="coins-badge bg-amber-300 stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                        <Image src="/coin_icon.png" alt="Coin" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                        <span className="font-bold text-xs">{moedas || 0}</span>
                      </div>
                    </div>
                  </div>
                    )
                  })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jamberlinda */}
        <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="text-white px-6 py-4" style={{ backgroundColor: "#0f006d" }}>
            <CardTitle className="text-xl font-black">Jamberlinda</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {jamberlinda.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 mx-auto mb-2" style={{ color: "#0f006d" }} />
                  <p className="font-bold text-sm" style={{ color: "#0f006d" }}>Categoria vazia</p>
                </div>
              ) : (
                jamberlinda.map((dupla: Dupla) => {
                  const ranked = rankingLookup[dupla.id]
                  const medalhas = ranked?.medalhas ?? calcularValoresRodadas(dupla).medalhasRodadas
                  const estrelas = ranked?.estrelas ?? calcularValoresRodadas(dupla).estrelasRodadas
                  const moedas = ranked?.moedas ?? calcularValoresRodadas(dupla).moedasRodadas
                  return (
                    <div
                      key={dupla.id}
                      className="ranking-card flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                      style={{ '--hover-border-color': '#0f006d' } as React.CSSProperties}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0f006d'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                    {/* Posição Linda - menor */}
                    <div className="ranking-position w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0">
                      ⭐
                    </div>

                    {/* Nome da Dupla - flexível */}
                    <div className="ranking-name-container rounded-lg sm:rounded-xl overflow-hidden min-w-0 flex-1">
                      <div className="relative w-full h-14 sm:h-16">
                        <BannerDupla 
                          dupla={dupla} 
                          className="w-full h-full rounded-lg sm:rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Estatísticas - compactas */}
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      {/* Medalhas */}
                      <div className="medals-badge stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                        <Image src="/medal_icon.png" alt="Medal" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                        <span className="font-bold text-xs">{medalhas || 0}</span>
                      </div>

                      {/* Estrelas */}
                      <div className="stars-badge stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                        <Image src="/star_icon.png" alt="Star" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                        <span className="font-bold text-xs">{estrelas || 0}</span>
                      </div>

                      {/* Moedas */}
                      <div className="coins-badge bg-amber-300 stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                        <Image src="/coin_icon.png" alt="Coin" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                        <span className="font-bold text-xs">{moedas || 0}</span>
                      </div>
                    </div>
                    </div>
                  )
                })
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
          <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
            {aguardando.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto bg-yellow-300 rounded-full flex items-center justify-center mb-2">
                  <span className="text-yellow-800 font-bold">!</span>
                </div>
                <p className="text-yellow-600 font-bold text-sm">Nenhuma dupla aguardando resultado</p>
              </div>
            ) : (
              aguardando.map((dupla: Dupla) => {
                const ranked = rankingLookup[dupla.id]
                const medalhas = ranked?.medalhas ?? calcularValoresRodadas(dupla).medalhasRodadas
                const estrelas = ranked?.estrelas ?? calcularValoresRodadas(dupla).estrelasRodadas
                const moedas = ranked?.moedas ?? calcularValoresRodadas(dupla).moedasRodadas
                return (
                  <div
                    key={dupla.id}
                    className="ranking-card flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                    style={{ '--hover-border-color': '#f59e0b' } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f59e0b'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                  {/* Posição Aguardando - menor */}
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0">
                    ⏳
                  </div>

                  {/* Nome da Dupla - flexível */}
                  <div className="ranking-name-container rounded-lg sm:rounded-xl overflow-hidden min-w-0 flex-1">
                    <div className="relative w-full h-16 sm:h-36">
                      <BannerDupla 
                        dupla={dupla} 
                        className="w-full h-full rounded-lg sm:rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Estatísticas - compactas */}
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    {/* Medalhas */}
                    <div className="medals-badge stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                      <Image src="/medal_icon.png" alt="Medal" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                      <span className="font-bold text-xs">{medalhas || 0}</span>
                    </div>

                    {/* Estrelas */}
                    <div className="stars-badge stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                      <Image src="/star_icon.png" alt="Star" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                      <span className="font-bold text-xs">{estrelas || 0}</span>
                    </div>

                    {/* Moedas */}
                    <div className="coins-badge bg-amber-300 stat-badge w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex flex-col items-center justify-center text-white">
                      <Image src="/coin_icon.png" alt="Coin" width={12} height={12} className="w-2 h-2 sm:w-3 sm:h-3 mb-0.5" />
                      <span className="font-bold text-xs">{moedas || 0}</span>
                    </div>
                  </div>
                  </div>
                )
              })
            )}
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
  const [numero, setNumero] = useState("")
  const [rodadaParaExcluir, setRodadaParaExcluir] = useState<string | null>(null)

  const handleCriarRodada = async () => {
    try {
      if (!nome || !descricao || !numero) {
        toast.error("Preencha todos os campos!")
        return
      }

      await torneio.criarRodada(nome, parseInt(numero), descricao)
      toast.success("Rodada criada com sucesso!")
      setNome("")
      setDescricao("")
      setNumero("")
    } catch (error) {
      toast.error("Erro ao criar rodada")
    }
  }

  const handleExcluirRodada = async (rodadaId: string) => {
    try {
      const rodada = torneio.rodadas.find((r: any) => r.id === rodadaId)
      await torneio.excluirRodada(rodadaId)
      setRodadaParaExcluir(null)
      toast.success(`Rodada "${rodada?.nome}" excluída com sucesso!`)
    } catch (error) {
      console.error('Erro ao excluir rodada:', error)
      toast.error("Erro ao excluir rodada!")
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
                  placeholder="Nome da rodada"
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
                  className="rounded-full border-2 border-gray-300 h-12 no-scroll"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>

            <div>
              <Label className="font-bold text-gray-700">Descrição</Label>
              <Textarea
                placeholder="Descrição da rodada"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="rounded-xl border-2 border-gray-300 min-h-[80px] resize-none"
                rows={3}
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
                <p className="text-sm text-gray-400">Crie a primeira rodada para começar!</p>
                <p className="text-sm text-gray-400">Crie a primeira rodada usando o formulário acima</p>
              </div>
            ) : (
              torneio.rodadas.map((rodada: any) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-gray-700">
                          Rodada #{rodada.numero}
                        </span>
                      </div>
                      {rodada.dataInicio && (
                        <div className="flex items-center space-x-2">
                          <Image src="/star_icon.png" alt="Star" width={16} height={16} className="w-4 h-4" />
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
                    <Button
                      onClick={() => setRodadaParaExcluir(rodada.id)}
                      size="sm"
                      variant="destructive"
                      className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={!!rodadaParaExcluir} onOpenChange={() => setRodadaParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const rodada = torneio.rodadas.find((r: any) => r.id === rodadaParaExcluir);
                if (rodada?.ativa) {
                  return "ATENÇÃO: Você está prestes a excluir a rodada ATIVA! Esta ação removerá a rodada atual do torneio e todos os dados associados serão perdidos permanentemente. Tem certeza?";
                }
                return "Tem certeza que deseja excluir esta rodada? Esta ação não pode ser desfeita e todos os dados associados serão perdidos permanentemente.";
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rodadaParaExcluir && handleExcluirRodada(rodadaParaExcluir)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir Rodada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
