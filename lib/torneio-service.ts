import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Dupla, Rodada, ItemLoja, Compra, TorneioConfig, Atividade, Bonus, Partida } from '@/types/torneio';

// Serviços para Duplas
export const duplaService = {
  // Criar nova dupla
  async criar(dupla: Omit<Dupla, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'duplas'), dupla);
    return docRef.id;
  },

  // Buscar todas as duplas
  async buscarTodas(): Promise<Dupla[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'duplas'), orderBy('pontos', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Dupla));
  },

  // Buscar duplas por categoria
  async buscarPorCategoria(categoria: string): Promise<Dupla[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'duplas'), 
        where('categoria', '==', categoria),
        orderBy('pontos', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Dupla));
  },

  // Buscar duplas aguardando resultado
  async buscarAguardando(): Promise<Dupla[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'duplas'), where('status', '==', 'aguardando'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Dupla));
  },

  // Atualizar pontuação de uma dupla
  async atualizarPontuacao(
    id: string, 
    pontos: number, 
    moedas: number, 
    medalhas: number, 
    rodada: string
  ): Promise<void> {
    const duplaRef = doc(db, 'duplas', id);
    const duplaDoc = await getDoc(duplaRef);
    
    if (duplaDoc.exists()) {
      const duplaAtual = duplaDoc.data() as Dupla;
      
      // Atualizar pontos da rodada específica
      const novosPontosPorRodada = {
        ...duplaAtual.pontosPorRodada,
        [rodada]: (duplaAtual.pontosPorRodada?.[rodada] || 0) + pontos
      };

      // Atualizar moedas da rodada específica
      const novasMoedasPorRodada = {
        ...duplaAtual.moedasPorRodada,
        [rodada]: (duplaAtual.moedasPorRodada?.[rodada] || 0) + moedas
      };

      // Atualizar medalhas da rodada específica
      const novasMedalhasPorRodada = {
        ...duplaAtual.medalhasPorRodada,
        [rodada]: (duplaAtual.medalhasPorRodada?.[rodada] || 0) + medalhas
      };

      // Calcular totais somando todas as rodadas
      const pontosTotaisRodadas = Object.values(novosPontosPorRodada).reduce((total, pontosRodada) => total + pontosRodada, 0);
      const moedasTotaisRodadas = Object.values(novasMoedasPorRodada).reduce((total, moedasRodada) => total + moedasRodada, 0);
      const medalhasTotaisRodadas = Object.values(novasMedalhasPorRodada).reduce((total, medalhasRodada) => total + medalhasRodada, 0);

      // Calcular totais dos bônus
      const pontosTotaisBonus = Object.values(duplaAtual.pontosPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, pontos) => subTotal + pontos, 0), 0
      );
      
      const moedasTotaisBonus = Object.values(duplaAtual.moedasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, moedas) => subTotal + moedas, 0), 0
      );
      
      const medalhasTotaisBonus = Object.values(duplaAtual.medalhasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, medalhas) => subTotal + medalhas, 0), 0
      );

      await updateDoc(duplaRef, {
        pontos: pontosTotaisRodadas + pontosTotaisBonus,
        moedas: moedasTotaisRodadas + moedasTotaisBonus,
        medalhas: medalhasTotaisRodadas + medalhasTotaisBonus,
        pontosPorRodada: novosPontosPorRodada,
        moedasPorRodada: novasMoedasPorRodada,
        medalhasPorRodada: novasMedalhasPorRodada
      });
    }
  },

  // Atualizar status da dupla
  async atualizarStatus(id: string, status: 'ativa' | 'aguardando' | 'eliminada'): Promise<void> {
    const duplaRef = doc(db, 'duplas', id);
    await updateDoc(duplaRef, { status });
  },

  // Recalcular totais de uma dupla (rodadas + bônus)
  async recalcularTotais(id: string): Promise<void> {
    const duplaRef = doc(db, 'duplas', id);
    const duplaDoc = await getDoc(duplaRef);
    
    if (duplaDoc.exists()) {
      const dupla = duplaDoc.data() as Dupla;
      
      // Calcular totais das rodadas
      const pontosRodadas = Object.values(dupla.pontosPorRodada || {}).reduce((total, pontos) => total + pontos, 0);
      const moedasRodadas = Object.values(dupla.moedasPorRodada || {}).reduce((total, moedas) => total + moedas, 0);
      const medalhasRodadas = Object.values(dupla.medalhasPorRodada || {}).reduce((total, medalhas) => total + medalhas, 0);
      
      // Calcular totais dos bônus
      const pontosBonusTotal = Object.values(dupla.pontosPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, pontos) => subTotal + pontos, 0), 0
      );
      
      const moedasBonusTotal = Object.values(dupla.moedasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, moedas) => subTotal + moedas, 0), 0
      );
      
      const medalhasBonusTotal = Object.values(dupla.medalhasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, medalhas) => subTotal + medalhas, 0), 0
      );

      // Atualizar totais
      await updateDoc(duplaRef, {
        pontos: pontosRodadas + pontosBonusTotal,
        moedas: moedasRodadas + moedasBonusTotal,
        medalhas: medalhasRodadas + medalhasBonusTotal
      });
    }
  },

  // Recalcular totais de todas as duplas de um torneio
  async recalcularTodosTotais(torneioId: string): Promise<void> {
    const querySnapshot = await getDocs(collection(db, `torneios/${torneioId}/duplas`));
    
    for (const duplaDoc of querySnapshot.docs) {
      const dupla = duplaDoc.data() as Dupla;
      
      // Calcular totais das rodadas
      const pontosRodadas = Object.values(dupla.pontosPorRodada || {}).reduce((total, pontos) => total + pontos, 0);
      const moedasRodadas = Object.values(dupla.moedasPorRodada || {}).reduce((total, moedas) => total + moedas, 0);
      const medalhasRodadas = Object.values(dupla.medalhasPorRodada || {}).reduce((total, medalhas) => total + medalhas, 0);
      
      // Calcular totais dos bônus
      const pontosBonusTotal = Object.values(dupla.pontosPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, pontos) => subTotal + pontos, 0), 0
      );
      
      const moedasBonusTotal = Object.values(dupla.moedasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, moedas) => subTotal + moedas, 0), 0
      );
      
      const medalhasBonusTotal = Object.values(dupla.medalhasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, medalhas) => subTotal + medalhas, 0), 0
      );
      
      // Atualizar totais
      await updateDoc(duplaDoc.ref, {
        pontos: pontosRodadas + pontosBonusTotal,
        moedas: moedasRodadas + moedasBonusTotal,
        medalhas: medalhasRodadas + medalhasBonusTotal
      });
    }
  },

  // Remover dupla
  async remover(id: string): Promise<void> {
    await deleteDoc(doc(db, 'duplas', id));
  },

  // Escutar mudanças em tempo real
  escutarMudancas(callback: (duplas: Dupla[]) => void) {
    return onSnapshot(
      query(collection(db, 'duplas'), orderBy('pontos', 'desc')),
      (snapshot) => {
        const duplas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Dupla));
        callback(duplas);
      }
    );
  }
};

// Serviços para Rodadas
export const rodadaService = {
  // Criar nova rodada
  async criar(rodada: Omit<Rodada, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'rodadas'), rodada);
    return docRef.id;
  },

  // Buscar todas as rodadas
  async buscarTodas(): Promise<Rodada[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'rodadas'), orderBy('numero', 'asc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rodada));
  },

  // Buscar rodada ativa
  async buscarAtiva(): Promise<Rodada | null> {
    const querySnapshot = await getDocs(
      query(collection(db, 'rodadas'), where('ativa', '==', true))
    );
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Rodada;
  },

  // Ativar rodada
  async ativar(id: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Desativar todas as rodadas
    const todasRodadas = await getDocs(collection(db, 'rodadas'));
    todasRodadas.docs.forEach(doc => {
      batch.update(doc.ref, { ativa: false });
    });
    
    // Ativar a rodada específica
    const rodadaRef = doc(db, 'rodadas', id);
    batch.update(rodadaRef, { ativa: true });
    
    await batch.commit();
  },

  // Remover rodada
  async remover(id: string): Promise<void> {
    await deleteDoc(doc(db, 'rodadas', id));
  },

  // Escutar mudanças nas rodadas em tempo real
  escutarMudancas(callback: (rodadas: Rodada[]) => void) {
    return onSnapshot(
      query(collection(db, 'rodadas'), orderBy('numero', 'asc')),
      (querySnapshot) => {
        const rodadas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Rodada));
        callback(rodadas);
      }
    );
  }
};

// Serviços para Loja
export const lojaService = {
  // Criar novo item
  async criarItem(item: Omit<ItemLoja, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'itensLoja'), item);
    return docRef.id;
  },

  // Buscar itens por rodada
  async buscarPorRodada(rodada: string): Promise<ItemLoja[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'itensLoja'), 
        where('rodada', '==', rodada),
        where('disponivel', '==', true)
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ItemLoja));
  },

  // Realizar compra
  async comprar(duplaId: string, itemId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Buscar item e dupla
    const itemDoc = await getDoc(doc(db, 'itensLoja', itemId));
    const duplaDoc = await getDoc(doc(db, 'duplas', duplaId));
    
    if (!itemDoc.exists() || !duplaDoc.exists()) {
      throw new Error('Item ou dupla não encontrado');
    }
    
    const item = itemDoc.data() as ItemLoja;
    const dupla = duplaDoc.data() as Dupla;
    
    if (dupla.moedas < item.preco) {
      throw new Error('Moedas insuficientes');
    }
    
    // Atualizar moedas da dupla
    batch.update(doc(db, 'duplas', duplaId), {
      moedas: dupla.moedas - item.preco
    });
    
    // Criar registro de compra
    const compraRef = doc(collection(db, 'compras'));
    batch.set(compraRef, {
      duplaId,
      itemId,
      dataCompra: new Date(),
      preco: item.preco
    });
    
    await batch.commit();
  },

  // Remover item
  async remover(id: string): Promise<void> {
    await deleteDoc(doc(db, 'itensLoja', id));
  }
};

// Serviços para Configuração do Torneio
export const torneioService = {
  // Buscar configuração atual
  async buscarConfig(): Promise<TorneioConfig | null> {
    const querySnapshot = await getDocs(collection(db, 'torneioConfig'));
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as TorneioConfig;
  },

  // Atualizar configuração
  async atualizarConfig(config: Partial<TorneioConfig>): Promise<void> {
    const querySnapshot = await getDocs(collection(db, 'torneioConfig'));
    
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'torneioConfig'), config);
    } else {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, config);
    }
  }
};

// Serviços para Atividades
export const atividadeService = {
  // Criar nova atividade
  async criar(atividade: Omit<Atividade, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'atividades'), atividade);
    return docRef.id;
  },

  // Buscar atividades por rodada
  async buscarPorRodada(rodada: string): Promise<Atividade[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'atividades'), 
        where('rodada', '==', rodada),
        orderBy('dataRealizacao', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Atividade));
  }
};

// Serviços para Bônus
export const bonusService = {
  // Criar novo bônus
  async criar(bonus: Omit<Bonus, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'bonus'), bonus);
    return docRef.id;
  },

  // Buscar todos os bônus
  async buscarTodos(): Promise<Bonus[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'bonus'), orderBy('dataInicio', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Bonus));
  },

  // Buscar bônus ativo
  async buscarAtivo(): Promise<Bonus | null> {
    const querySnapshot = await getDocs(
      query(collection(db, 'bonus'), where('ativo', '==', true))
    );
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Bonus;
  },

  // Atualizar bônus
  async atualizar(id: string, bonus: Partial<Bonus>): Promise<void> {
    const bonusRef = doc(db, 'bonus', id);
    await updateDoc(bonusRef, bonus);
  },

  // Ativar bônus específico
  async ativar(id: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Desativar todos os bônus
    const todosBonus = await getDocs(collection(db, 'bonus'));
    todosBonus.docs.forEach(doc => {
      batch.update(doc.ref, { ativo: false });
    });
    
    // Ativar o bônus específico
    const bonusRef = doc(db, 'bonus', id);
    batch.update(bonusRef, { ativo: true });
    
    await batch.commit();
  },

  // Adicionar pontuação para partida específica do bônus com multiplicador
  async adicionarPontuacao(
    duplaId: string,
    bonusId: string, 
    partidaId: string,
    pontos: number,
    moedas: number = 0,
    medalhas: number = 0
  ): Promise<void> {
    const duplaRef = doc(db, 'duplas', duplaId);
    const duplaDoc = await getDoc(duplaRef);
    
    if (duplaDoc.exists()) {
      const duplaAtual = duplaDoc.data() as Dupla;
      
      // Buscar a partida para obter os multiplicadores
      const partidaDoc = await getDoc(doc(db, 'partidas', partidaId));
      if (!partidaDoc.exists()) return;
      
      const partida = partidaDoc.data() as Partida;
      const pontosFinal = pontos * partida.multiplicadorPontos;
      const moedasFinal = moedas * partida.multiplicadorMoedas;
      const medalhasFinal = medalhas * partida.multiplicadorMedalhas;
      
      // Atualizar pontos do bônus específico
      const novosPontosPorBonus = {
        ...(duplaAtual.pontosPorBonus || {}),
        [bonusId]: {
          ...(duplaAtual.pontosPorBonus?.[bonusId] || {}),
          [partidaId]: pontosFinal
        }
      };

      // Atualizar moedas do bônus específico
      const novasMoedasPorBonus = {
        ...(duplaAtual.moedasPorBonus || {}),
        [bonusId]: {
          ...(duplaAtual.moedasPorBonus?.[bonusId] || {}),
          [partidaId]: moedasFinal
        }
      };

      // Atualizar medalhas do bônus específico
      const novasMedalhasPorBonus = {
        ...(duplaAtual.medalhasPorBonus || {}),
        [bonusId]: {
          ...(duplaAtual.medalhasPorBonus?.[bonusId] || {}),
          [partidaId]: medalhasFinal
        }
      };

      // Recalcular totais gerais incluindo bônus
      const pontosTotaisBonus = Object.values(novosPontosPorBonus).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, pontos) => subTotal + pontos, 0), 0
      );
      
      const moedasTotaisBonus = Object.values(novasMoedasPorBonus).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, moedas) => subTotal + moedas, 0), 0
      );
      
      const medalhasTotaisBonus = Object.values(novasMedalhasPorBonus).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, medalhas) => subTotal + medalhas, 0), 0
      );

      // Somar com pontos das rodadas normais
      const pontosRodadas = Object.values(duplaAtual.pontosPorRodada || {}).reduce((total, pontos) => total + pontos, 0);
      const moedasRodadas = Object.values(duplaAtual.moedasPorRodada || {}).reduce((total, moedas) => total + moedas, 0);
      const medalhasRodadas = Object.values(duplaAtual.medalhasPorRodada || {}).reduce((total, medalhas) => total + medalhas, 0);

      await updateDoc(duplaRef, {
        pontosPorBonus: novosPontosPorBonus,
        moedasPorBonus: novasMoedasPorBonus,
        medalhasPorBonus: novasMedalhasPorBonus,
        // Atualizar totais gerais
        pontos: pontosRodadas + pontosTotaisBonus,
        moedas: moedasRodadas + moedasTotaisBonus,
        medalhas: medalhasRodadas + medalhasTotaisBonus
      });
    }
  },

  // Calcular pontuação total de um bônus para uma dupla
  async calcularPontuacaoBonus(duplaId: string, bonusId: string): Promise<{pontos: number, moedas: number, medalhas: number}> {
    const duplaDoc = await getDoc(doc(db, 'duplas', duplaId));
    if (!duplaDoc.exists()) return {pontos: 0, moedas: 0, medalhas: 0};
    
    const dupla = duplaDoc.data() as Dupla;
    
    const pontosPorBonus = dupla.pontosPorBonus?.[bonusId] || {};
    const moedasPorBonus = dupla.moedasPorBonus?.[bonusId] || {};
    const medalhasPorBonus = dupla.medalhasPorBonus?.[bonusId] || {};
    
    const pontos = Object.values(pontosPorBonus).reduce((total, pontos) => total + pontos, 0);
    const moedas = Object.values(moedasPorBonus).reduce((total, moedas) => total + moedas, 0);
    const medalhas = Object.values(medalhasPorBonus).reduce((total, medalhas) => total + medalhas, 0);
    
    return { pontos, moedas, medalhas };
  },

  // Remover bônus
  async remover(id: string): Promise<void> {
    await deleteDoc(doc(db, 'bonus', id));
  },

  // Escutar mudanças nos bônus em tempo real
  escutarMudancas(callback: (bonus: Bonus[]) => void) {
    return onSnapshot(
      query(collection(db, 'bonus'), orderBy('dataInicio', 'desc')),
      (querySnapshot) => {
        const bonus = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Bonus));
        callback(bonus);
      }
    );
  }
};

// Serviços para Partidas dos Bônus
export const partidaService = {
  // Criar nova partida
  async criar(partida: Omit<Partida, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'partidas'), partida);
    return docRef.id;
  },

  // Buscar todas as partidas de um bônus
  async buscarPorBonus(bonusId: string): Promise<Partida[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'partidas'), where('bonusId', '==', bonusId))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Partida));
  },

  // Buscar partida por ID
  async buscarPorId(id: string): Promise<Partida | null> {
    const partidaDoc = await getDoc(doc(db, 'partidas', id));
    if (!partidaDoc.exists()) return null;
    
    return {
      id: partidaDoc.id,
      ...partidaDoc.data()
    } as Partida;
  },

  // Atualizar partida
  async atualizar(id: string, partida: Partial<Partida>): Promise<void> {
    const partidaRef = doc(db, 'partidas', id);
    await updateDoc(partidaRef, partida);
  },

  // Deletar partida
  async deletar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'partidas', id));
  },

  // Ativar/desativar partida
  async alternarStatus(id: string, ativa: boolean): Promise<void> {
    const partidaRef = doc(db, 'partidas', id);
    await updateDoc(partidaRef, { ativa });
  },

  // Finalizar partida
  async finalizar(id: string): Promise<void> {
    const partidaRef = doc(db, 'partidas', id);
    await updateDoc(partidaRef, { finalizada: true, ativa: false });
  }
};
