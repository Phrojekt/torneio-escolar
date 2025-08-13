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
    return {
      ...dupla,
      pontos: Number(dupla.pontos) || 0,
      moedas: Number(dupla.moedas) || 0,
      medalhas: Number(dupla.medalhas) || 0,
      pontosPorRodada: dupla.pontosPorRodada || {},
      moedasPorRodada: dupla.moedasPorRodada || {},
      medalhasPorRodada: dupla.medalhasPorRodada || {},
      pontosPorBonus: dupla.pontosPorBonus || {},
      moedasPorBonus: dupla.moedasPorBonus || {},
      medalhasPorBonus: dupla.medalhasPorBonus || {},
      status: dupla.status || 'ativa'
    };
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

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar dados em paralelo
      const [
        duplasDados,
        rodadasDados,
        configDados,
        rodadaAtivaDados,
        bonusDados,
        bonusAtivoDados
      ] = await Promise.all([
        duplaService.buscarTodas(),
        rodadaService.buscarTodas(),
        torneioService.buscarConfig(),
        rodadaService.buscarAtiva(),
        bonusService.buscarTodos(),
        bonusService.buscarAtivo()
      ]);

      // Normalizar duplas
      const duplasNormalizadas = duplasDados.map(normalizarDupla);

      setDuplas(duplasNormalizadas);
      setRodadas(rodadasDados);
      setConfig(configDados);
      setRodadaAtiva(rodadaAtivaDados);
      setBonus(bonusDados);
      setBonusAtivo(bonusAtivoDados);

      // Carregar itens da loja da rodada ativa
      if (rodadaAtivaDados) {
        const itens = await lojaService.buscarPorRodada(rodadaAtivaDados.id);
        setItensLoja(itens);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar duplas
  const criarDupla = async (aluno1: string, aluno2: string) => {
    try {
      const novaDupla: Omit<Dupla, 'id'> = {
        aluno1,
        aluno2,
        pontos: 0,
        moedas: 0,
        medalhas: 0,
        pontosPorRodada: {},
        moedasPorRodada: {},
        medalhasPorRodada: {},
        pontosPorBonus: {},
        moedasPorBonus: {},
        medalhasPorBonus: {},
        status: 'ativa'
      };

      await duplaService.criar(novaDupla);
      // Os dados serão atualizados automaticamente pelo listener
    } catch (error) {
      console.error('Erro ao criar dupla:', error);
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
      const novaRodadaAtiva = await rodadaService.buscarAtiva();
      setRodadaAtiva(novaRodadaAtiva);
      
      // Carregar itens da nova rodada ativa
      if (novaRodadaAtiva) {
        const itens = await lojaService.buscarPorRodada(novaRodadaAtiva.id);
        setItensLoja(itens);
      }
    } catch (error) {
      console.error('Erro ao ativar rodada:', error);
      throw error;
    }
  };

  // Funções para gerenciar loja
  const adicionarItemLoja = async (nome: string, descricao: string, preco: number, rodada: string) => {
    try {
      const novoItem: Omit<ItemLoja, 'id'> = {
        nome,
        descricao,
        preco,
        rodada,
        disponivel: true
      };

      await lojaService.criarItem(novoItem);
      
      // Recarregar itens da loja se for da rodada ativa
      if (rodadaAtiva && rodada === rodadaAtiva.id) {
        const itens = await lojaService.buscarPorRodada(rodada);
        setItensLoja(itens);
      }
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

  const removerItemLoja = async (itemId: string) => {
    try {
      await lojaService.remover(itemId);
      
      // Recarregar itens da loja
      if (rodadaAtiva) {
        const itens = await lojaService.buscarPorRodada(rodadaAtiva.id);
        setItensLoja(itens);
      }
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
      const novoBonusAtivo = await bonusService.buscarAtivo();
      setBonusAtivo(novoBonusAtivo);
    } catch (error) {
      console.error('Erro ao ativar bônus:', error);
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
    multiplicadorPontos: number,
    multiplicadorMoedas: number = 1,
    multiplicadorMedalhas: number = 1
  ) => {
    try {
      const novaPartida: Omit<Partida, 'id'> = {
        nome,
        descricao,
        pontuacaoMaxima,
        multiplicadorPontos,
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

  const calcularPontuacaoBonus = async (duplaId: string, bonusId: string): Promise<{pontos: number, moedas: number, medalhas: number}> => {
    try {
      return await bonusService.calcularPontuacaoBonus(duplaId, bonusId);
    } catch (error) {
      console.error('Erro ao calcular pontuação do bônus:', error);
      return {pontos: 0, moedas: 0, medalhas: 0};
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

    return {
      pontos: pontosRodadas + pontosBonusTotal,
      moedas: moedasRodadas + moedasBonusTotal,
      medalhas: medalhasRodadas + medalhasBonusTotal
    };
  };

  // Funções auxiliares para rankings
  const getRankingGeral = () => {
    return [...duplas]
      .map(dupla => {
        const totaisReais = calcularTotaisReais(dupla);
        return {
          ...dupla,
          pontos: totaisReais.pontos,
          moedas: totaisReais.moedas,
          medalhas: totaisReais.medalhas
        };
      })
      .sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
  };

  const getRankingPorRodada = (rodadaId: string) => {
    return [...duplas]
      .map(dupla => {
        const pontosRodada = Number(dupla.pontosPorRodada?.[rodadaId]) || 0;
        const moedasRodada = Number(dupla.moedasPorRodada?.[rodadaId]) || 0;
        const medalhasRodada = Number(dupla.medalhasPorRodada?.[rodadaId]) || 0;
        
        return {
          ...dupla,
          pontosRodada: isNaN(pontosRodada) ? 0 : pontosRodada,
          moedasRodada: isNaN(moedasRodada) ? 0 : moedasRodada,
          medalhasRodada: isNaN(medalhasRodada) ? 0 : medalhasRodada
        };
      })
      .sort((a, b) => (b.pontosRodada || 0) - (a.pontosRodada || 0));
  };

  const getRankingPorBonus = (bonusId: string, bonusData: Bonus) => {
    return [...duplas]
      .map(dupla => {
        // Calcular pontos, moedas e medalhas totais do bônus (já com multiplicadores aplicados)
        let pontosBonus = 0;
        let moedasBonus = 0;
        let medalhasBonus = 0;
        
        if (dupla.pontosPorBonus?.[bonusId]) {
          pontosBonus = Object.values(dupla.pontosPorBonus[bonusId])
            .reduce((total, pontos) => total + (Number(pontos) || 0), 0);
        }
        
        if (dupla.moedasPorBonus?.[bonusId]) {
          moedasBonus = Object.values(dupla.moedasPorBonus[bonusId])
            .reduce((total, moedas) => total + (Number(moedas) || 0), 0);
        }
        
        if (dupla.medalhasPorBonus?.[bonusId]) {
          medalhasBonus = Object.values(dupla.medalhasPorBonus[bonusId])
            .reduce((total, medalhas) => total + (Number(medalhas) || 0), 0);
        }

        // Garantir que todos os valores são números válidos
        pontosBonus = isNaN(pontosBonus) ? 0 : pontosBonus;
        moedasBonus = isNaN(moedasBonus) ? 0 : moedasBonus;
        medalhasBonus = isNaN(medalhasBonus) ? 0 : medalhasBonus;

        return {
          ...dupla,
          pontosBonus,
          moedasBonus,
          medalhasBonus
        };
      })
      .sort((a, b) => (b.pontosBonus || 0) - (a.pontosBonus || 0));
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

    // Funções de rodadas
    criarRodada,
    ativarRodada,

    // Funções de bônus
    criarBonus,
    ativarBonus,
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
    comprarItem,
    removerItemLoja,

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
