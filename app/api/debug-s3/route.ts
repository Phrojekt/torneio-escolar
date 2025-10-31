import { NextRequest, NextResponse } from 'next/server';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    console.log('🔍 Verificando configuração S3...');
    
    // Verificar se as variáveis de ambiente estão presentes
    const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY;
    const region = process.env.MY_AWS_REGION;
    const bucket = process.env.MY_AWS_S3_BUCKET;
    
    console.log('Environment Check:', {
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      region: region,
      bucket: bucket,
      accessKeyLength: accessKeyId?.length,
      secretKeyLength: secretAccessKey?.length
    });
    
    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais AWS não configuradas',
        details: {
          hasAccessKey: !!accessKeyId,
          hasSecretKey: !!secretAccessKey
        }
      }, { status: 500 });
    }
    
    // Criar cliente S3 com configuração explícita
    const s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: false, // Usar style virtual-hosted-style
    });
    
    // Testar conexão com bucket
    const headBucketCommand = new HeadBucketCommand({
      Bucket: bucket || 'jambalaia'
    });
    
    await s3Client.send(headBucketCommand);
    
    return NextResponse.json({
      success: true,
      message: 'S3 configurado corretamente',
      config: {
        region: region,
        bucket: bucket,
        credentialsConfigured: true
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na verificação S3:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro na configuração S3',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      errorName: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 });
  }
}