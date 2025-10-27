"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MigrateCompletePage() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const executeCompleteMigration = async () => {
    setMigrating(true);
    setResult(null);
    
    try {
      console.log('🚀 Iniciando migração COMPLETA de imagens para S3...');
      
      const response = await fetch('/api/migrate-images-to-s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        toast.success('Migração completa realizada com sucesso!');
        console.log('✅ Migração completa concluída:', data);
      } else {
        throw new Error(data.message || 'Erro na migração completa');
      }
    } catch (error) {
      console.error('❌ Erro na migração completa:', error);
      toast.error('Erro durante a migração completa');
      setResult({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-blue-200 to-cyan-300 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-6">
            <CardTitle className="text-2xl font-black">
              🔄 Migração COMPLETA para S3
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2">⚠️ IMPORTANTE</h3>
              <p className="text-yellow-700 text-sm">
                Esta operação irá:
              </p>
              <ul className="list-disc list-inside text-yellow-700 text-sm mt-2 space-y-1">
                <li>Baixar TODAS as imagens do GitHub</li>
                <li>Enviar TODAS para o bucket S3</li>
                <li>Atualizar TODAS as URLs no Firebase</li>
                <li>Substituir completamente o sistema antigo</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">🎯 O que será migrado</h3>
              <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                <li>• Banners de todas as duplas</li>
                <li>• Imagens de todos os itens da loja</li>
                <li>• URLs antigas do GitHub → URLs S3 diretas</li>
                <li>• URLs antigas do proxy → URLs S3 diretas</li>
              </ul>
            </div>

            <Button 
              onClick={executeCompleteMigration}
              disabled={migrating}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 text-lg"
            >
              {migrating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Migrando imagens...
                </>
              ) : (
                'EXECUTAR MIGRAÇÃO COMPLETA'
              )}
            </Button>

            {result && (
              <div className="mt-6">
                {result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-bold text-red-800 mb-2">❌ Erro na Migração</h3>
                    <p className="text-red-700 text-sm">{result.error}</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-4">✅ Migração Completa Finalizada!</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-semibold text-green-700 mb-2">📁 Duplas</h4>
                        <p>• Migradas: <span className="font-bold">{result.duplas?.migradas || 0}</span></p>
                        <p>• Erros: <span className="font-bold">{result.duplas?.erros || 0}</span></p>
                        <p>• Total: <span className="font-bold">{result.duplas?.total || 0}</span></p>
                      </div>
                      
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-semibold text-green-700 mb-2">🛍️ Itens</h4>
                        <p>• Migrados: <span className="font-bold">{result.itens?.migrados || 0}</span></p>
                        <p>• Erros: <span className="font-bold">{result.itens?.erros || 0}</span></p>
                        <p>• Total: <span className="font-bold">{result.itens?.total || 0}</span></p>
                      </div>
                    </div>

                    <div className="mt-4 bg-blue-100 p-3 rounded">
                      <p className="text-blue-800 text-sm">
                        <span className="font-bold">Total de migrações:</span> {result.totalMigracoes || 0}
                      </p>
                      <p className="text-blue-800 text-sm">
                        <span className="font-bold">Total de erros:</span> {result.totalErros || 0}
                      </p>
                    </div>

                    {result.message && (
                      <p className="text-green-700 text-sm mt-3 font-medium">{result.message}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
              <p><strong>Nota:</strong> Após a migração completa, todas as imagens estarão disponíveis diretamente do S3 e o sistema será muito mais rápido!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}