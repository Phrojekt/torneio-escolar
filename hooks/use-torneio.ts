import { useState, useEffect } from 'react';
import { Dupla, Rodada, ItemLoja, TorneioConfig, Bonus, Partida } from '@/types/torneio';
import { duplaService, rodadaService, lojaService, torneioService, bonusService, partidaService } from '@/lib/torneio-service';

export function useTorneio() {
  const [duplas, setDuplas] = useState<Dupla[]>([]);
  const [rodadas, setRodadas] = useState<Rodada[]>([]);
  const [rodadaAtiva, setRodadaAtiva] = useState<Rodada | null>(null);
  const [bonus, setBonus] = useState<Bonus[]>([]);
  const [bonusAtivo, setBonusAtivo] = useState<Bonus | null>(null);
  const [itensLoja, setItensLoja] = useState<ItemLoja[]>([]);
  const [config, setConfig] = useState<TorneioConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Função utilitária para normalizar dados das duplas
  const normalizarDupla = (dupla: any) => {
    console.log('🔧 Normalizando dupla:', { 
      id: dupla.id, 
      tag: dupla.tag, 
      bannerUrl: dupla.bannerUrl,
      duplaOriginal: dupla 
    });
    
    const normalizada = {
      ...dupla,
      medalhas: Number(dupla.medalhas) || 0,
      estrelas: Number(dupla.estrelas) || 0,
      moedas: Number(dupla.moedas) || 0,
      tag: dupla.tag || '',
      bannerUrl: dupla.bannerUrl || '', // Preservar bannerUrl mesmo se vazio
      medalhasPorRodada: dupla.medalhasPorRodada || {},
      estrelasPorRodada: dupla.estrelasPorRodada || {},
      moedasPorRodada: dupla.moedasPorRodada || {},
      medalhasPorBonus: dupla.medalhasPorBonus || {},
      estrelasPorBonus: dupla.estrelasPorBonus || {},
      moedasPorBonus: dupla.moedasPorBonus || {},
      status: dupla.status || 'ativa'
    };
    
    console.log('✅ Dupla normalizada:', { 
      id: normalizada.id, 
      tag: normalizada.tag, 
      bannerUrl: normalizada.bannerUrl 
    });
    
    return normalizada;
  };

  // Escutar mudanças nas duplas em tempo real
  useEffect(() => {
    console.log('🚀 Registrando listener de duplas...');
    const unsubscribe = duplaService.escutarMudancas((novasDuplas) => {
      console.log('📊 Hook recebeu duplas do listener:', novasDuplas.length);
      // Normalizar todas as duplas recebidas
      const duplasNormalizadas = novasDuplas.map(normalizarDupla);
      console.log('✅ Duplas normalizadas:', duplasNormalizadas.length);
      console.log('📋 Status das duplas carregadas:', duplasNormalizadas.map(d => ({
        id: d.id, 
        tag: d.tag, 
        status: d.status, 
        categoria: d.categoria 
      })));
      setDuplas(duplasNormalizadas);
    });

    return unsubscribe;
  }, []);

  // Escutar mudanças nas rodadas em tempo real
  useEffect(() => {
    const unsubscribe = rodadaService.escutarMudancas((novasRodadas) => {
      setRodadas(novasRodadas);
      // Encontrar e atualizar rodada ativa
      const rodadaAtiva = novasRodadas.find(r => r.ativa);
      setRodadaAtiva(rodadaAtiva || null);
    });

    return unsubscribe;
  }, []);

  // Escutar mudanças nos bônus em tempo real
  useEffect(() => {
    const unsubscribe = bonusService.escutarMudancas((novosBonus) => {
      setBonus(novosBonus);
      // Encontrar e atualizar bônus ativo
      const bonusAtivo = novosBonus.find(b => b.ativo);
      setBonusAtivo(bonusAtivo || null);
    });

    return unsubscribe;
  }, []);

  // Carregar itens da loja quando inicializar e quando houver mudanças
  useEffect(() => {
    const carregarItensLoja = async () => {
      try {
        const itens = await lojaService.buscarTodos();
        setItensLoja(itens);
      } catch (error) {
        console.error('Erro ao carregar itens da loja:', error);
        setItensLoja([]);
      }
    };

    carregarItensLoja();
  }, [rodadaAtiva]); // Recarregar quando mudança na rodada ativa

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar apenas configuração (duplas, rodadas e bônus são gerenciados pelos listeners)
      const configDados = await torneioService.buscarConfig();
      setConfig(configDados);

      // Os itens da loja são carregados automaticamente pelo useEffect do rodadaAtiva
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar duplas
  const criarDupla = async (tag: string, bannerUrl?: string) => {
    console.log("🔧 Hook criarDupla chamado:", { tag, bannerUrl });
    
    try {
      const novaDupla: Omit<Dupla, 'id'> = {
        tag,
        estrelas: 0,
        moedas: 0,
        medalhas: 0,
        estrelasPorRodada: {},
        moedasPorRodada: {},
        medalhasPorRodada: {},
        estrelasPorBonus: {},
        moedasPorBonus: {},
        medalhasPorBonus: {},
        status: 'ativa'
      };

      // Só incluir bannerUrl se tiver valor
      if (bannerUrl && bannerUrl.trim() !== '') {
        novaDupla.bannerUrl = bannerUrl;
        console.log("🖼️ Banner incluído na dupla");
      }

      console.log("💾 Salvando dupla no Firestore...", novaDupla);
      await duplaService.criar(novaDupla);
      console.log("✅ Dupla salva no Firestore!");
      
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('❌ Erro ao criar dupla no hook:', error);
      throw error;
    }
  };

  const adicionarPontuacao = async (
    duplaId: string,
    medalhas: number,
    estrelas: number,
    moedas: number,
    rodada: string
  ) => {
    try {
      await duplaService.atualizarPontuacao(duplaId, medalhas, estrelas, moedas, rodada);
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao adicionar pontuação:', error);
      throw error;
    }
  };

  const atualizarStatusDupla = async (duplaId: string, status: 'ativa' | 'aguardando' | 'eliminada' | 'JambaVIP' | 'Jamberlinda' | 'Dupla Aguardando Resultado') => {
    try {
      await duplaService.atualizarStatus(duplaId, status);
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  };

  const atualizarStatusEspecialDupla = async (duplaId: string, statusEspecial: 'JambaVIP' | 'Jamberlinda' | 'Dupla Aguardando Resultado' | 'normal') => {
    try {
      await duplaService.atualizarStatusEspecial(duplaId, statusEspecial);
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao atualizar status especial:', error);
      throw error;
    }
  };
  
  // Atualizar campos de uma dupla (tag, bannerUrl, etc.)
  const atualizarDupla = async (duplaId: string, dados: Partial<Dupla>) => {
    try {
      await duplaService.atualizar(duplaId, dados);
      // O listener irá propagar as mudanças
    } catch (error) {
      console.error('Erro ao atualizar dupla:', error);
      throw error;
    }
  };

  // Função para buscar duplas por status especial
  const getDuplasPorStatusEspecial = (statusEspecial: 'JambaVIP' | 'Jamberlinda' | 'Dupla Aguardando Resultado') => {
    return duplas.filter(dupla => dupla.status === statusEspecial);
  };

  const removerDupla = async (duplaId: string) => {
    try {
      await duplaService.remover(duplaId);
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao remover dupla:', error);
      throw error;
    }
  };

  // Funções para gerenciar rodadas
  const criarRodada = async (nome: string, numero: number, descricao: string) => {
    try {
      const novaRodada: Omit<Rodada, 'id'> = {
        nome,
        numero,
        descricao,
        ativa: false,
        finalizada: false,
        dataInicio: new Date()
      };

      await rodadaService.criar(novaRodada);
      await carregarDados(); // Recarregar rodadas
    } catch (error) {
      console.error('Erro ao criar rodada:', error);
      throw error;
    }
  };

  const ativarRodada = async (rodadaId: string) => {
    try {
      await rodadaService.ativar(rodadaId);
      // O listener se encarregará de atualizar o estado automaticamente
    } catch (error) {
      console.error('Erro ao ativar rodada:', error);
      throw error;
    }
  };

  const excluirRodada = async (rodadaId: string) => {
    try {
      await rodadaService.remover(rodadaId);
      // O listener se encarregará de atualizar o estado automaticamente
    } catch (error) {
      console.error('Erro ao excluir rodada:', error);
      throw error;
    }
  };

  // Funções para gerenciar loja
  const adicionarItemLoja = async (nome: string, descricao: string, preco: number, rodada: string, quantidade: number, imagem?: string) => {
    try {
      const novoItem: Omit<ItemLoja, 'id'> = {
        nome,
        descricao,
        preco,
        rodada,
        disponivel: true,
        quantidadeTotal: quantidade,
        quantidadeDisponivel: quantidade,
        imagem
      };

      await lojaService.criarItem(novoItem);
      
      // Recarregar todos os itens da loja
      const itens = await lojaService.buscarTodos();
      setItensLoja(itens);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  };

  const comprarItem = async (duplaId: string, itemId: string) => {
    try {
      await lojaService.comprar(duplaId, itemId);
      // Os dados das duplas serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao comprar item:', error);
      throw error;
    }
  };

  const editarItemLoja = async (itemId: string, nome: string, descricao: string, preco: number, rodada: string, quantidade?: number, imagem?: string) => {
    try {
      const itemEditado: Partial<Omit<ItemLoja, 'id'>> = {
        nome,
        descricao,
        preco,
        rodada,
        disponivel: true
      };

      // Se uma nova quantidade foi fornecida, atualizá-la
      if (quantidade !== undefined) {
        itemEditado.quantidadeTotal = quantidade;
        itemEditado.quantidadeDisponivel = quantidade;
      }

      // Se uma nova imagem foi fornecida, atualizá-la
      if (imagem !== undefined) {
        itemEditado.imagem = imagem;
      }

      await lojaService.editar(itemId, itemEditado);
      
      // Recarregar todos os itens da loja
      const itens = await lojaService.buscarTodos();
      setItensLoja(itens);
    } catch (error) {
      console.error('Erro ao editar item:', error);
      throw error;
    }
  };

  const removerItemLoja = async (itemId: string) => {
    try {
      await lojaService.remover(itemId);
      
      // Recarregar todos os itens da loja
      const itens = await lojaService.buscarTodos();
      setItensLoja(itens);
    } catch (error) {
      console.error('Erro ao remover item:', error);
      throw error;
    }
  };

  // Funções para gerenciar bônus
  const criarBonus = async (nome: string, descricao: string) => {
    try {
      const novoBonus: Omit<Bonus, 'id'> = {
        nome,
        descricao,
        ativo: false,
        partidas: [],
        dataInicio: new Date()
      };

      await bonusService.criar(novoBonus);
      await carregarDados(); // Recarregar bônus
    } catch (error) {
      console.error('Erro ao criar bônus:', error);
      throw error;
    }
  };

  const ativarBonus = async (bonusId: string) => {
    try {
      await bonusService.ativar(bonusId);
      // O listener se encarregará de atualizar o estado automaticamente
    } catch (error) {
      console.error('Erro ao ativar bônus:', error);
      throw error;
    }
  };

  const excluirBonus = async (bonusId: string) => {
    try {
      await bonusService.remover(bonusId);
      // O listener se encarregará de atualizar o estado automaticamente
    } catch (error) {
      console.error('Erro ao excluir bônus:', error);
      throw error;
    }
  };

  const adicionarPontuacaoBonus = async (
    duplaId: string,
    bonusId: string,
    partidaId: string,
    medalhas: number,
    estrelas: number = 0,
    moedas: number = 0
  ) => {
    try {
      await bonusService.adicionarPontuacao(duplaId, bonusId, partidaId, medalhas, estrelas, moedas);
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao adicionar pontuação de bônus:', error);
      throw error;
    }
  };

  // Funções para gerenciar partidas dos bônus
  const criarPartidaBonus = async (
    bonusId: string,
    nome: string,
    descricao: string,
    multiplicadorEstrelas: number,
    multiplicadorMoedas: number = 1,
    multiplicadorMedalhas: number = 1
  ) => {
    try {
      const novaPartida: Omit<Partida, 'id'> = {
        nome,
        descricao,
        multiplicadorEstrelas,
        multiplicadorMoedas,
        multiplicadorMedalhas,
        bonusId,
        ativa: true,
        finalizada: false
      };

      await partidaService.criar(novaPartida);
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao criar partida de bônus:', error);
      throw error;
    }
  };

  const buscarPartidasBonus = async (bonusId: string): Promise<Partida[]> => {
    try {
      return await partidaService.buscarPorBonus(bonusId);
    } catch (error) {
      console.error('Erro ao buscar partidas do bônus:', error);
      return [];
    }
  };

  const atualizarPartidaBonus = async (
    partidaId: string,
    dados: Partial<Partida>
  ) => {
    try {
      await partidaService.atualizar(partidaId, dados);
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao atualizar partida de bônus:', error);
      throw error;
    }
  };

  const alternarStatusPartida = async (partidaId: string, ativa: boolean) => {
    try {
      await partidaService.alternarStatus(partidaId, ativa);
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao alterar status da partida:', error);
      throw error;
    }
  };

  const finalizarPartida = async (partidaId: string) => {
    try {
      await partidaService.finalizar(partidaId);
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao finalizar partida:', error);
      throw error;
    }
  };

  const deletarPartidaBonus = async (partidaId: string) => {
    try {
      await partidaService.deletar(partidaId);
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao deletar partida de bônus:', error);
      throw error;
    }
  };

  const calcularPontuacaoBonus = async (duplaId: string, bonusId: string): Promise<{medalhas: number, estrelas: number, moedas: number}> => {
    try {
      return await bonusService.calcularPontuacaoBonus(duplaId, bonusId);
    } catch (error) {
      console.error('Erro ao calcular pontuação do bônus:', error);
      return {medalhas: 0, estrelas: 0, moedas: 0};
    }
  };

  // Função para sincronizar totais de uma dupla no banco
  const sincronizarTotaisDupla = async (duplaId: string) => {
    try {
      await duplaService.recalcularTotais(duplaId);
      await carregarDados(); // Recarregar dados após sincronização
    } catch (error) {
      console.error('Erro ao sincronizar totais da dupla:', error);
      throw error;
    }
  };

  // Função para sincronizar totais de todas as duplas
  const sincronizarTodosTotais = async () => {
    try {
      for (const dupla of duplas) {
        await duplaService.recalcularTotais(dupla.id);
      }
      await carregarDados(); // Recarregar dados após sincronização
    } catch (error) {
      console.error('Erro ao sincronizar todos os totais:', error);
      throw error;
    }
  };

  // Função para calcular APENAS os totais das rodadas (sem bônus) para o ranking geral
  const calcularTotaisReais = (dupla: any) => {
    // Para o ranking geral, calculamos APENAS os valores das rodadas, SEM incluir bônus
    const medalhasRodadas = Object.values(dupla.medalhasPorRodada || {})
      .reduce((total: number, medalhas: any) => total + (Number(medalhas) || 0), 0);
    
    const estrelasRodadas = Object.values(dupla.estrelasPorRodada || {})
      .reduce((total: number, estrelas: any) => total + (Number(estrelas) || 0), 0);
    
    const moedasRodadas = Object.values(dupla.moedasPorRodada || {})
      .reduce((total: number, moedas: any) => total + (Number(moedas) || 0), 0);

    const totais = {
      estrelas: estrelasRodadas,
      moedas: moedasRodadas,
      medalhas: medalhasRodadas
    };

    // Log para debug
    if (dupla.tag) {
      console.log(`🏆 Totais APENAS RODADAS ${dupla.tag}:`, {
        totaisRodadas: totais,
        totalBanco: {
          estrelas: dupla.estrelas,
          moedas: dupla.moedas,
          medalhas: dupla.medalhas
        },
        estrutura: {
          medalhasPorRodada: dupla.medalhasPorRodada,
          estrelasPorRodada: dupla.estrelasPorRodada
        }
      });
    }

    return totais;
  };

  // Funções auxiliares para rankings
  const getRankingGeral = () => {
    console.log("🏆 getRankingGeral - duplas originais:", duplas.map(d => ({
      tag: d.tag,
      estrelas: d.estrelas,
      estrelasPorRodada: d.estrelasPorRodada,
      estrelasPorBonus: d.estrelasPorBonus
    })));

    const ranking = [...duplas]
      .map(dupla => {
        const totaisReais = calcularTotaisReais(dupla);
        // Calcular totais de bônus para desempate
        let estrelasBonusTotal = 0;
        let moedasBonusTotal = 0;
        let medalhasBonusTotal = 0;

        if (dupla.estrelasPorBonus) {
          Object.values(dupla.estrelasPorBonus).forEach((bonusPartidas: any) => {
            estrelasBonusTotal += Object.values(bonusPartidas || {}).reduce((t: number, v: any) => t + (Number(v) || 0), 0);
          });
        }

        if (dupla.moedasPorBonus) {
          Object.values(dupla.moedasPorBonus).forEach((bonusPartidas: any) => {
            moedasBonusTotal += Object.values(bonusPartidas || {}).reduce((t: number, v: any) => t + (Number(v) || 0), 0);
          });
        }

        if (dupla.medalhasPorBonus) {
          Object.values(dupla.medalhasPorBonus).forEach((bonusPartidas: any) => {
            medalhasBonusTotal += Object.values(bonusPartidas || {}).reduce((t: number, v: any) => t + (Number(v) || 0), 0);
          });
        }

        console.log(`🔢 ${dupla.tag} - Totais calculados (rodadas):`, totaisReais, 'bonus:', { estrelasBonusTotal, moedasBonusTotal, medalhasBonusTotal });

        return {
          ...dupla,
          estrelas: totaisReais.estrelas,
          moedas: totaisReais.moedas,
          medalhas: totaisReais.medalhas,
          estrelasBonus: estrelasBonusTotal,
          moedasBonus: moedasBonusTotal,
          medalhasBonus: medalhasBonusTotal
        };
      })
      .sort((a, b) => {
        // Ordenar por medalhas (principal)
        const medalhasA = a.medalhas || 0;
        const medalhasB = b.medalhas || 0;
        if (medalhasB !== medalhasA) return medalhasB - medalhasA;

        // Se empate em medalhas -> estrelas
        const estrelasA = a.estrelas || 0;
        const estrelasB = b.estrelas || 0;
        if (estrelasB !== estrelasA) return estrelasB - estrelasA;

        // Se empate em estrelas -> moedas
        const moedasA = a.moedas || 0;
        const moedasB = b.moedas || 0;
        if (moedasB !== moedasA) return moedasB - moedasA;

        // Desempates por pontuações de bônus (estrelasBonus, moedasBonus, medalhasBonus)
        const estrelasBonusA = a.estrelasBonus || 0;
        const estrelasBonusB = b.estrelasBonus || 0;
        if (estrelasBonusB !== estrelasBonusA) return estrelasBonusB - estrelasBonusA;

        const moedasBonusA = a.moedasBonus || 0;
        const moedasBonusB = b.moedasBonus || 0;
        if (moedasBonusB !== moedasBonusA) return moedasBonusB - moedasBonusA;

        const medalhasBonusA = a.medalhasBonus || 0;
        const medalhasBonusB = b.medalhasBonus || 0;
        if (medalhasBonusB !== medalhasBonusA) return medalhasBonusB - medalhasBonusA;

        // Tudo igual -> empate
        return 0;
      });

    // Calcular posições com empates (dense ranking) para o ranking geral
    let posicaoAtual = 1;
    let chaveAnterior: string | null = null;
    const rankingComPosicao = ranking.map((dupla) => {
      const chaveAtual = `${dupla.medalhas || 0}|${dupla.estrelas || 0}|${dupla.moedas || 0}`;
      if (chaveAnterior === null) {
        chaveAnterior = chaveAtual;
      } else if (chaveAtual !== chaveAnterior) {
        posicaoAtual += 1;
        chaveAnterior = chaveAtual;
      }

      return {
        ...dupla,
        posicao: posicaoAtual
      };
    });

    console.log("🏆 Ranking final ordenado:", rankingComPosicao.map(d => ({ tag: d.tag, estrelas: d.estrelas, posicao: d.posicao })));
    return rankingComPosicao;
  };

  const getRankingPorRodada = (rodadaId: string) => {
    console.log(`🎯 getRankingPorRodada - rodada: ${rodadaId}`);
    console.log("📊 duplas para análise:", duplas.map(d => ({
      tag: d.tag,
      estrelasPorRodada: d.estrelasPorRodada,
      valorEspecifico: d.estrelasPorRodada?.[rodadaId]
    })));

    const ranking = [...duplas]
      .map(dupla => {
        const estrelasRodada = Number(dupla.estrelasPorRodada?.[rodadaId]) || 0;
        const moedasRodada = Number(dupla.moedasPorRodada?.[rodadaId]) || 0;
        const medalhasRodada = Number(dupla.medalhasPorRodada?.[rodadaId]) || 0;
        
        console.log(`📈 ${dupla.tag} - rodada ${rodadaId}:`, { 
          estrelasRodada, 
          moedasRodada, 
          medalhasRodada,
          original: {
            estrelas: dupla.estrelasPorRodada?.[rodadaId],
            moedas: dupla.moedasPorRodada?.[rodadaId],
            medalhas: dupla.medalhasPorRodada?.[rodadaId]
          }
        });
        
        return {
          ...dupla,
          estrelasRodada: isNaN(estrelasRodada) ? 0 : estrelasRodada,
          moedasRodada: isNaN(moedasRodada) ? 0 : moedasRodada,
          medalhasRodada: isNaN(medalhasRodada) ? 0 : medalhasRodada
        };
      })
      .sort((a, b) => {
        // Ordenação principal: medalhas da rodada
        if ((b.medalhasRodada || 0) !== (a.medalhasRodada || 0)) return (b.medalhasRodada || 0) - (a.medalhasRodada || 0);
        // Desempate por estrelas da rodada
        if ((b.estrelasRodada || 0) !== (a.estrelasRodada || 0)) return (b.estrelasRodada || 0) - (a.estrelasRodada || 0);
        // Desempate por moedas da rodada
        return (b.moedasRodada || 0) - (a.moedasRodada || 0);
      });

    // Dense ranking para a rodada
    let posicaoAtualRodada = 1;
    let chaveAnteriorRodada: string | null = null;
    const rankingComPosicaoRodada = ranking.map((dupla) => {
      // chave baseada na ordem de desempate usada: medalhas|estrelas|moedas
      const chaveAtual = `${dupla.medalhasRodada || 0}|${dupla.estrelasRodada || 0}|${dupla.moedasRodada || 0}`;
      if (chaveAnteriorRodada === null) {
        chaveAnteriorRodada = chaveAtual;
      } else if (chaveAtual !== chaveAnteriorRodada) {
        posicaoAtualRodada += 1;
        chaveAnteriorRodada = chaveAtual;
      }

      return {
        ...dupla,
        posicao: posicaoAtualRodada
      };
    });

    console.log("🎯 Ranking por rodada final:", rankingComPosicaoRodada.map(d => ({ tag: d.tag, posicao: d.posicao, estrelasRodada: d.estrelasRodada })));
    return rankingComPosicaoRodada;
  };

  const getRankingPorBonus = (bonusId: string, bonusData: Bonus) => {
    const ranking = [...duplas]
      .map(dupla => {
        // Calcular estrelas, moedas e medalhas totais do bônus (já com multiplicadores aplicados)
        let estrelasBonus = 0;
        let moedasBonus = 0;
        let medalhasBonus = 0;
        
        if (dupla.estrelasPorBonus?.[bonusId]) {
          estrelasBonus = Object.values(dupla.estrelasPorBonus[bonusId])
            .reduce((total: number, estrelas: unknown) => total + (Number(estrelas) || 0), 0);
        }
        
        if (dupla.moedasPorBonus?.[bonusId]) {
          moedasBonus = Object.values(dupla.moedasPorBonus[bonusId])
            .reduce((total: number, moedas: unknown) => total + (Number(moedas) || 0), 0);
        }
        
        if (dupla.medalhasPorBonus?.[bonusId]) {
          medalhasBonus = Object.values(dupla.medalhasPorBonus[bonusId])
            .reduce((total: number, medalhas: unknown) => total + (Number(medalhas) || 0), 0);
        }

        // Garantir que todos os valores são números válidos e calcular total de bônus
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
      // Ordenar por total de bônus primeiro, depois desempates por campos de bônus
      .sort((a, b) => {
        const totalA = a.totalBonus || 0;
        const totalB = b.totalBonus || 0;
        if (totalB !== totalA) return totalB - totalA;
        if ((b.estrelasBonus || 0) !== (a.estrelasBonus || 0)) return (b.estrelasBonus || 0) - (a.estrelasBonus || 0);
        if ((b.moedasBonus || 0) !== (a.moedasBonus || 0)) return (b.moedasBonus || 0) - (a.moedasBonus || 0);
        if ((b.medalhasBonus || 0) !== (a.medalhasBonus || 0)) return (b.medalhasBonus || 0) - (a.medalhasBonus || 0);
        return 0;
      });

    // Dense ranking para bonus (baseado em totalBonus e desempates de bônus)
    let posicaoAtualBonus = 1;
    let chaveAnteriorBonus: string | null = null;
    const rankingComPosicaoBonus = ranking.map((dupla) => {
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

    return rankingComPosicaoBonus;
  };

  const getDuplasPorCategoria = (categoria: 'JambaVIP' | 'Jamberlinda') => {
    return duplas.filter(dupla => dupla.categoria === categoria);
  };

  const getDuplasAguardando = () => {
    const aguardando = duplas.filter(dupla => dupla.status === 'Dupla Aguardando Resultado');
    console.log('🔍 Buscando duplas aguardando resultado:', {
      totalDuplas: duplas.length,
      duplasAguardando: aguardando.length,
      statusDuplas: duplas.map(d => ({ id: d.id, tag: d.tag, status: d.status }))
    });
    return aguardando;
  };

  // Função para recalcular todos os totais de uma vez
  const recalcularTodosTotais = async (torneioId: string) => {
    try {
      await duplaService.recalcularTodosTotais(torneioId);
      await carregarDados(); // Recarregar dados após recálculo
      console.log('Totais recalculados para todas as duplas');
    } catch (error) {
      console.error('Erro ao recalcular todos os totais:', error);
      throw error;
    }
  };

  return {
    // Estados
    duplas,
    rodadas,
    rodadaAtiva,
    bonus,
    bonusAtivo,
    itensLoja,
    config,
    loading,

    // Funções de duplas
    criarDupla,
    adicionarPontuacao,
  atualizarDupla,
    atualizarStatusDupla,
    atualizarStatusEspecialDupla,
    getDuplasPorStatusEspecial,
    removerDupla,

    // Funções de rodadas
    criarRodada,
    ativarRodada,
    excluirRodada,

    // Funções de bônus
    criarBonus,
    ativarBonus,
    excluirBonus,
    adicionarPontuacaoBonus,
    criarPartidaBonus,
    buscarPartidasBonus,
    atualizarPartidaBonus,
    alternarStatusPartida,
    finalizarPartida,
    deletarPartidaBonus,
    calcularPontuacaoBonus,
    sincronizarTotaisDupla,
    sincronizarTodosTotais,
    recalcularTodosTotais,

    // Funções de loja
    adicionarItemLoja,
    editarItemLoja,
    comprarItem,
    removerItemLoja,

    // Função para migrar URLs de imagens do GitHub para S3
    migrarImagensParaS3: async () => {
      try {
        const response = await fetch('/api/migrate-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erro na migração: ${response.statusText}`);
        }

        // Ler stream de progresso
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Não foi possível ler a resposta');
        }

        const results = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              results.push(data);
            } catch (e) {
              // Linha não é JSON válido, ignorar
            }
          }
        }

        return results;
      } catch (error) {
        console.error("❌ Erro na migração S3:", error);
        throw error;
      }
    },

    // Função para verificar configuração S3
    verificarConfiguracaoS3: async () => {
      try {
        const response = await fetch('/api/migrate-images');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("❌ Erro ao verificar configuração S3:", error);
        throw error;
      }
    },

    // Funções auxiliares
    getRankingGeral,
    getRankingPorRodada,
    getRankingPorBonus,
    getDuplasPorCategoria,
    getDuplasAguardando,

    // Função para recarregar dados
    recarregar: carregarDados
  };
}
