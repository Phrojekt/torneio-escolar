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
    const unsubscribe = duplaService.escutarMudancas((novasDuplas) => {
      // Normalizar todas as duplas recebidas
      const duplasNormalizadas = novasDuplas.map(normalizarDupla);
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
    pontos: number,
    moedas: number,
    medalhas: number,
    rodada: string
  ) => {
    try {
      await duplaService.atualizarPontuacao(duplaId, pontos, moedas, medalhas, rodada);
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao adicionar pontuação:', error);
      throw error;
    }
  };

  const atualizarStatusDupla = async (duplaId: string, status: 'ativa' | 'aguardando' | 'eliminada') => {
    try {
      await duplaService.atualizarStatus(duplaId, status);
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
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
  const criarRodada = async (nome: string, numero: number, descricao: string, pontuacaoMaxima: number) => {
    try {
      const novaRodada: Omit<Rodada, 'id'> = {
        nome,
        numero,
        descricao,
        pontuacaoMaxima,
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
    pontos: number,
    moedas: number = 0,
    medalhas: number = 0
  ) => {
    try {
      await bonusService.adicionarPontuacao(duplaId, bonusId, partidaId, pontos, moedas, medalhas);
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
    pontuacaoMaxima: number,
    multiplicadorEstrelas: number,
    multiplicadorMoedas: number = 1,
    multiplicadorMedalhas: number = 1
  ) => {
    try {
      const novaPartida: Omit<Partida, 'id'> = {
        nome,
        descricao,
        pontuacaoMaxima,
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

  const calcularPontuacaoBonus = async (duplaId: string, bonusId: string): Promise<{estrelas: number, moedas: number, medalhas: number}> => {
    try {
      return await bonusService.calcularPontuacaoBonus(duplaId, bonusId);
    } catch (error) {
      console.error('Erro ao calcular pontuação do bônus:', error);
      return {estrelas: 0, moedas: 0, medalhas: 0};
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

  // Função para calcular totais reais (rodadas + bônus) de uma dupla
  const calcularTotaisReais = (dupla: any) => {
    // Totais das rodadas
    const pontosRodadas = Object.values(dupla.pontosPorRodada || {})
      .reduce((total: number, pontos: any) => total + (Number(pontos) || 0), 0);
    const moedasRodadas = Object.values(dupla.moedasPorRodada || {})
      .reduce((total: number, moedas: any) => total + (Number(moedas) || 0), 0);
    const medalhasRodadas = Object.values(dupla.medalhasPorRodada || {})
      .reduce((total: number, medalhas: any) => total + (Number(medalhas) || 0), 0);

    // Totais dos bônus
    const pontosBonusTotal = Object.values(dupla.pontosPorBonus || {})
      .reduce((total: number, bonusPartidas: any) => 
        total + Object.values(bonusPartidas || {})
          .reduce((subTotal: number, pontos: any) => subTotal + (Number(pontos) || 0), 0), 0
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

    const totais = {
      pontos: pontosRodadas + pontosBonusTotal,
      moedas: moedasRodadas + moedasBonusTotal,
      medalhas: medalhasRodadas + medalhasBonusTotal
    };

    // Log para debug
    if (dupla.tag) {
      console.log(`🏆 Totais ${dupla.tag}:`, {
        rodadas: { pontosRodadas, moedasRodadas, medalhasRodadas },
        bonus: { pontosBonusTotal, moedasBonusTotal, medalhasBonusTotal },
        totais,
        estrutura: {
          pontosPorRodada: dupla.pontosPorRodada,
          pontosPorBonus: dupla.pontosPorBonus
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
        console.log(`🔢 ${dupla.tag} - Totais calculados:`, totaisReais);
        return {
          ...dupla,
          pontos: totaisReais.pontos,
          moedas: totaisReais.moedas,
          medalhas: totaisReais.medalhas
        };
      })
      .sort((a, b) => (b.pontos || 0) - (a.pontos || 0));

    console.log("🏆 Ranking final ordenado:", ranking.map(d => ({ tag: d.tag, pontos: d.pontos })));
    return ranking;
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
      .sort((a, b) => (b.estrelasRodada || 0) - (a.estrelasRodada || 0));

    console.log("🎯 Ranking por rodada final:", ranking.map(d => ({ 
      tag: d.tag, 
      estrelasRodada: d.estrelasRodada 
    })));
    return ranking;
  };

  const getRankingPorBonus = (bonusId: string, bonusData: Bonus) => {
    return [...duplas]
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

        // Garantir que todos os valores são números válidos
        estrelasBonus = isNaN(estrelasBonus) ? 0 : estrelasBonus;
        moedasBonus = isNaN(moedasBonus) ? 0 : moedasBonus;
        medalhasBonus = isNaN(medalhasBonus) ? 0 : medalhasBonus;

        return {
          ...dupla,
          estrelasBonus,
          moedasBonus,
          medalhasBonus
        };
      })
      .sort((a, b) => (b.estrelasBonus || 0) - (a.estrelasBonus || 0));
  };

  const getDuplasPorCategoria = (categoria: 'JambaVIP' | 'Jamberlinda') => {
    return duplas.filter(dupla => dupla.categoria === categoria);
  };

  const getDuplasAguardando = () => {
    return duplas.filter(dupla => dupla.status === 'aguardando');
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
    atualizarStatusDupla,
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

    // Função para migrar URLs de banners antigos
    migrarBannersAntigos: async () => {
      try {
        console.log("🔄 Iniciando migração de banners antigos...");
        const duplasComBannersAntigos = duplas.filter(dupla => 
          dupla.bannerUrl && dupla.bannerUrl.startsWith('/banners/')
        );
        
        if (duplasComBannersAntigos.length === 0) {
          console.log("✅ Nenhum banner antigo encontrado para migrar");
          return;
        }

        console.log(`📋 Encontradas ${duplasComBannersAntigos.length} duplas com banners antigos`);
        
        for (const dupla of duplasComBannersAntigos) {
          const bannerAntigoPath = dupla.bannerUrl;
          // Remover o banner URL antigo (vai usar o fallback)
          await duplaService.atualizar(dupla.id, { bannerUrl: '' });
          console.log(`🔄 Removido banner antigo da dupla ${dupla.tag}: ${bannerAntigoPath}`);
        }
        
        console.log("✅ Migração concluída! As duplas agora usarão o banner padrão até novo upload.");
      } catch (error) {
        console.error("❌ Erro na migração de banners:", error);
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
