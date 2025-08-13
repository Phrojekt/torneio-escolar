// Tipos para o sistema de torneio
export interface Dupla {
  id: string;
  aluno1: string;
  aluno2: string;
  pontos: number;
  moedas: number;
  medalhas: number;
  pontosPorRodada: { [rodada: string]: number };
  moedasPorRodada: { [rodada: string]: number };
  medalhasPorRodada: { [rodada: string]: number };
  pontosPorBonus?: { [bonusId: string]: { [partidaId: string]: number } };
  moedasPorBonus?: { [bonusId: string]: { [partidaId: string]: number } };
  medalhasPorBonus?: { [bonusId: string]: { [partidaId: string]: number } };
  status: 'ativa' | 'aguardando' | 'eliminada';
  categoria?: 'JambaVIP' | 'Jamberlinda' | 'normal';
}

export interface Rodada {
  id: string;
  nome: string;
  numero: number;
  descricao: string;
  pontuacaoMaxima: number;
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
  tipo: 'professor' | 'aluno';
  nome: string;
  duplaId?: string; // Para alunos
}

export interface Atividade {
  id: string;
  nome: string;
  descricao: string;
  rodada: string;
  pontos: number;
  moedas: number;
  medalhas: number;
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
  pontuacaoMaxima: number;
  multiplicadorPontos: number; // Multiplicador para pontos
  multiplicadorMoedas: number; // Multiplicador para moedas
  multiplicadorMedalhas: number; // Multiplicador para medalhas
  bonusId: string;
  ativa: boolean;
  finalizada: boolean;
}
