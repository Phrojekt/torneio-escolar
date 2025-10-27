"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MigratePage() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const executeMigration = async () => {
    setMigrating(true);
    setResult(null);
    
    try {
      console.log('🚀 Iniciando migração para S3...');
      
      const response = await fetch('/api/migrate-to-s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        toast.success('Migração concluída com sucesso!');
        console.log('✅ Migração concluída:', data);
      } else {
        throw new Error(data.message || 'Erro na migração');
      }
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      toast.error('Erro durante a migração');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-6">
            <CardTitle className="text-2xl font-black">
              🔄 Migração para S3
            </CardTitle>
            <p className="text-blue-100">
              Converter todas as URLs do GitHub para URLs S3 diretas no Firebase
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">ℹ️ O que esta migração faz:</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Converte URLs do GitHub para URLs S3 diretas</li>
                  <li>• Atualiza todas as duplas no Firebase</li>
                  <li>• Atualiza todos os itens da loja no Firebase</li>
                  <li>• Remove dependência do image-proxy</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">⚠️ Importante:</h3>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Certifique-se que as imagens já estão no S3</li>
                  <li>• Esta operação modifica o banco de dados</li>
                  <li>• Faça backup se necessário</li>
                </ul>
              </div>

              <Button
                onClick={executeMigration}
                disabled={migrating}
                className="w-full h-12 text-lg font-bold"
                size="lg"
              >
                {migrating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Migrando...
                  </div>
                ) : (
                  '🚀 Executar Migração'
                )}
              </Button>

              {result && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">✅ Migração Concluída!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-bold text-green-700">Duplas:</p>
                        <p>Verificadas: {result.estatisticas.duplasVerificadas}</p>
                        <p>Migradas: {result.estatisticas.duplasMigradas}</p>
                      </div>
                      <div>
                        <p className="font-bold text-green-700">Itens:</p>
                        <p>Verificados: {result.estatisticas.itensVerificados}</p>
                        <p>Migrados: {result.estatisticas.itensMigrados}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded">
                      <p className="font-bold text-green-800">
                        Total de migrações: {result.estatisticas.totalMigracoes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}