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

  // Atualizar dupla
  async atualizar(id: string, dados: Partial<Dupla>): Promise<void> {
    const duplaRef = doc(db, 'duplas', id);
    await updateDoc(duplaRef, dados);
  },

  // Buscar todas as duplas
  async buscarTodas(): Promise<Dupla[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'duplas'), orderBy('medalhas', 'desc'))
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
        orderBy('medalhas', 'desc')
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
    medalhas: number, 
    estrelas: number, 
    moedas: number, 
    rodada: string
  ): Promise<void> {
    const duplaRef = doc(db, 'duplas', id);
    const duplaDoc = await getDoc(duplaRef);
    
    if (duplaDoc.exists()) {
      const duplaAtual = duplaDoc.data() as Dupla;
      
      // Atualizar medalhas da rodada específica
      const novasMedalhasPorRodada = {
        ...duplaAtual.medalhasPorRodada,
        [rodada]: (duplaAtual.medalhasPorRodada?.[rodada] || 0) + medalhas
      };

      // Atualizar estrelas da rodada específica
      const novasEstrelasPorRodada = {
        ...duplaAtual.estrelasPorRodada,
        [rodada]: (duplaAtual.estrelasPorRodada?.[rodada] || 0) + estrelas
      };

      // Atualizar moedas da rodada específica
      const novasMoedasPorRodada = {
        ...duplaAtual.moedasPorRodada,
        [rodada]: (duplaAtual.moedasPorRodada?.[rodada] || 0) + moedas
      };

      // Calcular totais somando todas as rodadas
      const medalhasTotaisRodadas = Object.values(novasMedalhasPorRodada).reduce((total, medalhasRodada) => total + medalhasRodada, 0);
      const estrelasTotaisRodadas = Object.values(novasEstrelasPorRodada).reduce((total, estrelasRodada) => total + estrelasRodada, 0);
      const moedasTotaisRodadas = Object.values(novasMoedasPorRodada).reduce((total, moedasRodada) => total + moedasRodada, 0);

      // Calcular totais dos bônus
      const medalhasTotaisBonus = Object.values(duplaAtual.medalhasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, medalhas) => subTotal + medalhas, 0), 0
      );
      
      const estrelasTotaisBonus = Object.values(duplaAtual.estrelasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, estrelas) => subTotal + estrelas, 0), 0
      );
      
      const moedasTotaisBonus = Object.values(duplaAtual.moedasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, moedas) => subTotal + moedas, 0), 0
      );

      await updateDoc(duplaRef, {
        medalhas: medalhasTotaisRodadas + medalhasTotaisBonus,
        estrelas: estrelasTotaisRodadas + estrelasTotaisBonus,
        moedas: moedasTotaisRodadas + moedasTotaisBonus,
        medalhasPorRodada: novasMedalhasPorRodada,
        estrelasPorRodada: novasEstrelasPorRodada,
        moedasPorRodada: novasMoedasPorRodada
      });
    }
  },

  // Atualizar status da dupla
  async atualizarStatus(id: string, status: 'ativa' | 'aguardando' | 'eliminada' | 'JambaVIP' | 'Jamberlinda' | 'Dupla Aguardando Resultado'): Promise<void> {
    const duplaRef = doc(db, 'duplas', id);
    await updateDoc(duplaRef, { status });
  },

  // Atualizar categoria especial da dupla
  async atualizarStatusEspecial(id: string, statusEspecial: 'JambaVIP' | 'Jamberlinda' | 'Dupla Aguardando Resultado' | 'normal'): Promise<void> {
    const duplaRef = doc(db, 'duplas', id);
    const updates: any = {
      status: statusEspecial === 'normal' ? 'ativa' : statusEspecial
    };
    
    if (statusEspecial !== 'normal') {
      updates.categoria = statusEspecial === 'Dupla Aguardando Resultado' ? 'normal' : statusEspecial;
    } else {
      updates.categoria = 'normal';
    }
    
    await updateDoc(duplaRef, updates);
  },

  // Recalcular totais de uma dupla (rodadas + bônus)
  async recalcularTotais(id: string): Promise<void> {
    const duplaRef = doc(db, 'duplas', id);
    const duplaDoc = await getDoc(duplaRef);
    
    if (duplaDoc.exists()) {
      const dupla = duplaDoc.data() as Dupla;
      
      // Calcular totais das rodadas
      const medalhasRodadas = Object.values(dupla.medalhasPorRodada || {}).reduce((total, medalhas) => total + medalhas, 0);
      const estrelasRodadas = Object.values(dupla.estrelasPorRodada || {}).reduce((total, estrelas) => total + estrelas, 0);
      const moedasRodadas = Object.values(dupla.moedasPorRodada || {}).reduce((total, moedas) => total + moedas, 0);
      
      // Calcular totais dos bônus
      const medalhasBonusTotal = Object.values(dupla.medalhasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, medalhas) => subTotal + medalhas, 0), 0
      );
      
      const estrelasBonusTotal = Object.values(dupla.estrelasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, estrelas) => subTotal + estrelas, 0), 0
      );
      
      const moedasBonusTotal = Object.values(dupla.moedasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, moedas) => subTotal + moedas, 0), 0
      );

      // Atualizar totais
      await updateDoc(duplaRef, {
        medalhas: medalhasRodadas + medalhasBonusTotal,
        estrelas: estrelasRodadas + estrelasBonusTotal,
        moedas: moedasRodadas + moedasBonusTotal
      });
    }
  },

  // Recalcular totais de todas as duplas de um torneio
  async recalcularTodosTotais(torneioId: string): Promise<void> {
    const querySnapshot = await getDocs(collection(db, `torneios/${torneioId}/duplas`));
    
    for (const duplaDoc of querySnapshot.docs) {
      const dupla = duplaDoc.data() as Dupla;
      
      // Calcular totais das rodadas
      const medalhasRodadas = Object.values(dupla.medalhasPorRodada || {}).reduce((total, medalhas) => total + medalhas, 0);
      const estrelasRodadas = Object.values(dupla.estrelasPorRodada || {}).reduce((total, estrelas) => total + estrelas, 0);
      const moedasRodadas = Object.values(dupla.moedasPorRodada || {}).reduce((total, moedas) => total + moedas, 0);
      
      // Calcular totais dos bônus
      const medalhasBonusTotal = Object.values(dupla.medalhasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, medalhas) => subTotal + medalhas, 0), 0
      );
      
      const estrelasBonusTotal = Object.values(dupla.estrelasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, estrelas) => subTotal + estrelas, 0), 0
      );
      
      const moedasBonusTotal = Object.values(dupla.moedasPorBonus || {}).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, moedas) => subTotal + moedas, 0), 0
      );
      
      // Atualizar totais
      await updateDoc(duplaDoc.ref, {
        medalhas: medalhasRodadas + medalhasBonusTotal,
        estrelas: estrelasRodadas + estrelasBonusTotal,
        moedas: moedasRodadas + moedasBonusTotal
      });
    }
  },

  // Remover dupla
  async remover(id: string): Promise<void> {
    // Primeiro buscar a dupla para obter a URL da imagem
    const duplaDoc = await getDoc(doc(db, 'duplas', id));
    if (duplaDoc.exists()) {
      const dupla = duplaDoc.data() as Dupla;
      
      // Se tem banner, deletar do GitHub
      if (dupla.bannerUrl && dupla.bannerUrl.includes('raw.githubusercontent.com')) {
        try {
          const response = await fetch('/api/delete-image', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: dupla.bannerUrl })
          });
          
          if (response.ok) {
            console.log('✅ Banner da dupla deletado do GitHub');
          } else {
            console.warn('⚠️ Erro ao deletar banner da dupla do GitHub');
          }
        } catch (error) {
          console.error('❌ Erro ao deletar banner:', error);
        }
      }
    }
    
    // Deletar a dupla do Firestore
    await deleteDoc(doc(db, 'duplas', id));
  },

  // Escutar mudanças em tempo real
  escutarMudancas(callback: (duplas: Dupla[]) => void) {
    return onSnapshot(
      query(collection(db, 'duplas'), orderBy('pontos', 'desc')),
      (snapshot) => {
        console.log('🔄 Firestore listener triggered, docs:', snapshot.docs.length);
        const duplas = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📄 Documento Firestore:', { 
            id: doc.id, 
            tag: data.tag, 
            bannerUrl: data.bannerUrl,
            hasbanner: !!data.bannerUrl,
            allFields: Object.keys(data)
          });
          return {
            id: doc.id,
            ...data
          } as Dupla;
        });
        console.log('📦 Duplas processadas para callback:', duplas.map(d => ({ 
          id: d.id, 
          tag: d.tag, 
          bannerUrl: d.bannerUrl 
        })));
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

  // Buscar todos os itens
  async buscarTodos(): Promise<ItemLoja[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'itensLoja'), 
        where('disponivel', '==', true)
      )
    );
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ItemLoja))
      .filter(item => (item.quantidadeDisponivel || 0) > 0);
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
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ItemLoja))
      .filter(item => (item.quantidadeDisponivel || 0) > 0);
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

    // Verificar se há quantidade disponível
    if (item.quantidadeDisponivel <= 0) {
      throw new Error('Item esgotado');
    }
    
    // Atualizar moedas da dupla
    batch.update(doc(db, 'duplas', duplaId), {
      moedas: dupla.moedas - item.preco
    });

    // Decrementar quantidade disponível do item
    batch.update(doc(db, 'itensLoja', itemId), {
      quantidadeDisponivel: item.quantidadeDisponivel - 1,
      disponivel: item.quantidadeDisponivel - 1 > 0 // Marcar como indisponível se esgotar
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

  // Editar item
  async editar(id: string, item: Partial<Omit<ItemLoja, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'itensLoja', id), item);
  },

  // Remover item
  async remover(id: string): Promise<void> {
    // Primeiro buscar o item para obter a URL da imagem
    const itemDoc = await getDoc(doc(db, 'itensLoja', id));
    if (itemDoc.exists()) {
      const item = itemDoc.data() as ItemLoja;
      
      // Se tem imagem, deletar do GitHub
      if (item.imagem && item.imagem.includes('raw.githubusercontent.com')) {
        try {
          const response = await fetch('/api/delete-image', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: item.imagem })
          });
          
          if (response.ok) {
            console.log('✅ Imagem do item deletada do GitHub');
          } else {
            console.warn('⚠️ Erro ao deletar imagem do item do GitHub');
          }
        } catch (error) {
          console.error('❌ Erro ao deletar imagem do item:', error);
        }
      }
    }
    
    // Deletar o item do Firestore
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
    medalhas: number,
    estrelas: number = 0,
    moedas: number = 0
  ): Promise<void> {
    const duplaRef = doc(db, 'duplas', duplaId);
    const duplaDoc = await getDoc(duplaRef);
    
    if (duplaDoc.exists()) {
      const duplaAtual = duplaDoc.data() as Dupla;
      
      // Buscar a partida para obter os multiplicadores
      const partidaDoc = await getDoc(doc(db, 'partidas', partidaId));
      if (!partidaDoc.exists()) return;
      
      const partida = partidaDoc.data() as Partida;
      const medalhasFinal = medalhas * partida.multiplicadorMedalhas;
      const estrelasFinal = estrelas * partida.multiplicadorEstrelas;
      const moedasFinal = moedas * partida.multiplicadorMoedas;
      
      // Atualizar medalhas do bônus específico
      const novasMedalhasPorBonus = {
        ...(duplaAtual.medalhasPorBonus || {}),
        [bonusId]: {
          ...(duplaAtual.medalhasPorBonus?.[bonusId] || {}),
          [partidaId]: medalhasFinal
        }
      };

      // Atualizar estrelas do bônus específico
      const novasEstrelasPorBonus = {
        ...(duplaAtual.estrelasPorBonus || {}),
        [bonusId]: {
          ...(duplaAtual.estrelasPorBonus?.[bonusId] || {}),
          [partidaId]: estrelasFinal
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

      // Recalcular totais gerais incluindo bônus
      const medalhasTotaisBonus = Object.values(novasMedalhasPorBonus).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, medalhas) => subTotal + medalhas, 0), 0
      );
      
      const estrelasTotaisBonus = Object.values(novasEstrelasPorBonus).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, estrelas) => subTotal + estrelas, 0), 0
      );
      
      const moedasTotaisBonus = Object.values(novasMoedasPorBonus).reduce((total, bonusPartidas) => 
        total + Object.values(bonusPartidas).reduce((subTotal, moedas) => subTotal + moedas, 0), 0
      );
      
      // Somar com medalhas/estrelas/moedas das rodadas normais
      const medalhasRodadas = Object.values(duplaAtual.medalhasPorRodada || {}).reduce((total, medalhas) => total + medalhas, 0);
      const estrelasRodadas = Object.values(duplaAtual.estrelasPorRodada || {}).reduce((total, estrelas) => total + estrelas, 0);
      const moedasRodadas = Object.values(duplaAtual.moedasPorRodada || {}).reduce((total, moedas) => total + moedas, 0);

      await updateDoc(duplaRef, {
        medalhasPorBonus: novasMedalhasPorBonus,
        estrelasPorBonus: novasEstrelasPorBonus,
        moedasPorBonus: novasMoedasPorBonus,
        // Atualizar totais gerais
        medalhas: medalhasRodadas + medalhasTotaisBonus,
        estrelas: estrelasRodadas + estrelasTotaisBonus,
        moedas: moedasRodadas + moedasTotaisBonus
      });
    }
  },

  // Calcular pontuação total de um bônus para uma dupla
  async calcularPontuacaoBonus(duplaId: string, bonusId: string): Promise<{medalhas: number, estrelas: number, moedas: number}> {
    const duplaDoc = await getDoc(doc(db, 'duplas', duplaId));
    if (!duplaDoc.exists()) return {medalhas: 0, estrelas: 0, moedas: 0};
    
    const dupla = duplaDoc.data() as Dupla;
    
    const medalhasPorBonus = dupla.medalhasPorBonus?.[bonusId] || {};
    const estrelasPorBonus = dupla.estrelasPorBonus?.[bonusId] || {};
    const moedasPorBonus = dupla.moedasPorBonus?.[bonusId] || {};
    
    const medalhas = Object.values(medalhasPorBonus).reduce((total, medalhas) => total + medalhas, 0);
    const estrelas = Object.values(estrelasPorBonus).reduce((total, estrelas) => total + estrelas, 0);
    const moedas = Object.values(moedasPorBonus).reduce((total, moedas) => total + moedas, 0);
    
    return { medalhas, estrelas, moedas };
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
