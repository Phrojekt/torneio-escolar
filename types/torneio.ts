// Tipos para o sistema de torneio
export interface Dupla {
  id: string;
  tag: string; // Tag de até 5 letras/números para identificação
  bannerUrl?: string; // URL da imagem banner 700x200 (obrigatório para exibição)
  medalhas: number;
  estrelas: number;
  moedas: number;
  medalhasPorRodada: { [rodada: string]: number };
  estrelasPorRodada: { [rodada: string]: number };
  moedasPorRodada: { [rodada: string]: number };
  medalhasPorBonus?: { [bonusId: string]: { [partidaId: string]: number } };
  estrelasPorBonus?: { [bonusId: string]: { [partidaId: string]: number } };
  moedasPorBonus?: { [bonusId: string]: { [partidaId: string]: number } };
  status: 'ativa' | 'aguardando' | 'eliminada' | 'JambaVIP' | 'Jamberlinda' | 'Dupla Aguardando Resultado';
  categoria?: 'JambaVIP' | 'Jamberlinda' | 'normal';
}

export interface Rodada {
  id: string;
  nome: string;
  numero: number;
  descricao: string;
  ativa: boolean;
  finalizada: boolean;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface ItemLoja {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  rodada: string;
  disponivel: boolean;
  imagem?: string;
  quantidadeTotal: number; // Quantidade total cadastrada
  quantidadeDisponivel: number; // Quantidade ainda disponível para compra
}

export interface Compra {
  id: string;
  duplaId: string;
  itemId: string;
  dataCompra: Date;
  preco: number;
}

export interface TorneioConfig {
  id: string;
  nome: string;
  ativo: boolean;
  rodadaAtual: string;
  maxItensLojaPorRodada: number;
  dataInicio: Date;
  dataFim?: Date;
}

export interface Usuario {
  id: string;
  email: string;
  tipo: 'administrador' | 'jogador';
  nome: string;
  duplaId?: string; // Para jogadores
}

export interface Atividade {
  id: string;
  nome: string;
  descricao: string;
  rodada: string;
  medalhas: number;
  estrelas: number;
  moedas: number;
  dataRealizacao: Date;
  participantes: string[]; // IDs das duplas
}

export interface Bonus {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  partidas: Partida[];
  dataInicio?: Date;
  dataFim?: Date;
}

export interface Partida {
  id: string;
  nome: string;
  descricao: string;
  multiplicadorMedalhas: number; // Multiplicador para medalhas
  multiplicadorEstrelas: number; // Multiplicador para estrelas
  multiplicadorMoedas: number; // Multiplicador para moedas
  bonusId: string;
  ativa: boolean;
  finalizada: boolean;
}
