import { duplaService, rodadaService, lojaService, torneioService } from '@/lib/torneio-service';

// Função para inicializar dados do torneio
export async function inicializarTorneio() {
  try {
    // Verificar se já existe configuração
    const configExistente = await torneioService.buscarConfig();
    
    if (configExistente) {
      console.log('Torneio já inicializado');
      return;
    }

    // Criar configuração do torneio
    await torneioService.atualizarConfig({
      nome: 'Torneio Jambalaia 2',
      ativo: true,
      rodadaAtual: '',
      maxItensLojaPorRodada: 4,
      dataInicio: new Date()
    });

    // Criar rodadas
    const rodada1Id = await rodadaService.criar({
      nome: 'Bônus 1',
      numero: 1,
      descricao: 'Primeira rodada de desafios - Conhecimentos gerais',
      pontuacaoMaxima: 500,
      ativa: true,
      finalizada: false,
      dataInicio: new Date()
    });

    await rodadaService.criar({
      nome: 'Bônus 2',
      numero: 2,
      descricao: 'Segunda rodada - Desafios práticos e lógica',
      pontuacaoMaxima: 750,
      ativa: false,
      finalizada: false
    });

    await rodadaService.criar({
      nome: 'Bônus 3',
      numero: 3,
      descricao: 'Rodada final - Super desafio integrado',
      pontuacaoMaxima: 1000,
      ativa: false,
      finalizada: false
    });

    // Criar duplas de exemplo
    const duplas = [
      { aluno1: 'João', aluno2: 'Maria', categoria: 'JambaVIP' },
      { aluno1: 'Pedro', aluno2: 'Ana', categoria: 'JambaVIP' },
      { aluno1: 'Carlos', aluno2: 'Lucia', categoria: 'Jamberlinda' },
      { aluno1: 'Rafael', aluno2: 'Sofia', categoria: 'Jamberlinda' },
      { aluno1: 'Bruno', aluno2: 'Carla', status: 'aguardando' },
      { aluno1: 'Diego', aluno2: 'Elena', status: 'aguardando' },
      { aluno1: 'Felipe', aluno2: 'Gabi', status: 'aguardando' }
    ];

    for (const dupla of duplas) {
      const pontosRodada1 = Math.floor(Math.random() * 300) + 100;
      const moedasRodada1 = Math.floor(Math.random() * 50) + 10;
      const medalhasRodada1 = Math.floor(Math.random() * 3) + 1;
      
      await duplaService.criar({
        aluno1: dupla.aluno1,
        aluno2: dupla.aluno2,
        pontos: pontosRodada1, // Total será calculado automaticamente
        moedas: moedasRodada1, // Total será calculado automaticamente 
        medalhas: medalhasRodada1, // Total será calculado automaticamente
        pontosPorRodada: {
          [rodada1Id]: pontosRodada1
        },
        moedasPorRodada: {
          [rodada1Id]: moedasRodada1
        },
        medalhasPorRodada: {
          [rodada1Id]: medalhasRodada1
        },
        pontosPorBonus: {},
        moedasPorBonus: {},
        medalhasPorBonus: {},
        status: (dupla as any).status || 'ativa',
        categoria: (dupla as any).categoria
      });
    }

    // Criar itens da loja
    const itensLoja = [
      {
        nome: 'Poder Especial',
        descricao: 'Dobra os pontos da próxima atividade',
        preco: 50,
        rodada: rodada1Id
      },
      {
        nome: 'Dica Secreta',
        descricao: 'Revela uma pista importante',
        preco: 30,
        rodada: rodada1Id
      },
      {
        nome: 'Escudo Protetor',
        descricao: 'Protege de penalizações',
        preco: 40,
        rodada: rodada1Id
      },
      {
        nome: 'Moeda Extra',
        descricao: 'Ganha 10 moedas extras',
        preco: 20,
        rodada: rodada1Id
      }
    ];

    for (const item of itensLoja) {
      await lojaService.criarItem({
        ...item,
        disponivel: true
      });
    }

    console.log('Torneio inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar torneio:', error);
  }
}

// Função para resetar dados do torneio (usar com cuidado!)
export async function resetarTorneio() {
  try {
    // Esta função deve ser implementada com cuidado
    // Por enquanto, apenas log
    console.log('Função de reset não implementada para segurança');
  } catch (error) {
    console.error('Erro ao resetar torneio:', error);
  }
}
