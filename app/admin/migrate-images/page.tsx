'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MigrateImagesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const addError = (error: string) => {
    setErrors(prev => [...prev, error]);
    addLog(`❌ ERRO: ${error}`);
  };

  const migrateImages = async () => {
    setIsLoading(true);
    setProgress(0);
    setLogs([]);
    setErrors([]);
    
    try {
      addLog('🚀 Iniciando migração de imagens...');
      
      const response = await fetch('/api/migrate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na migração: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Não foi possível ler a resposta');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'progress') {
              setProgress(data.progress);
            } else if (data.type === 'log') {
              addLog(data.message);
            } else if (data.type === 'error') {
              addError(data.message);
            } else if (data.type === 'complete') {
              addLog('✅ Migração concluída com sucesso!');
            }
          } catch (e) {
            // Linha não é JSON válido, ignorar
          }
        }
      }
    } catch (error) {
      addError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Migração de Imagens para S3</CardTitle>
          <CardDescription>
            Migrate imagens do GitHub para AWS S3 para resolver problemas de rate limiting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Status da Migração</h3>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Em progresso...' : 'Pronto para iniciar'}
              </p>
            </div>
            <Button 
              onClick={migrateImages} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Migrando...' : 'Iniciar Migração'}
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Erros encontrados:</strong>
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm">{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Logs de Execução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                  <div className="font-mono text-xs space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}