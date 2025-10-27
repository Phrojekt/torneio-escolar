import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.MY_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.MY_AWS_S3_BUCKET || 'jambalaia';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const maxKeys = parseInt(searchParams.get('maxKeys') || '50');

    console.log(`📁 Listando objetos no S3 - Bucket: ${BUCKET_NAME}, Prefix: ${prefix}`);

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await s3Client.send(command);

    const objects = response.Contents || [];
    const folders = response.CommonPrefixes || [];

    const result = {
      success: true,
      bucket: BUCKET_NAME,
      prefix: prefix,
      count: objects.length,
      totalSize: objects.reduce((total, obj) => total + (obj.Size || 0), 0),
      objects: objects.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${obj.Key}`
      })),
      folders: folders.map(folder => folder.Prefix),
      isTruncated: response.IsTruncated || false
    };

    console.log(`✅ Encontrados ${objects.length} objetos no S3`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro ao listar objetos S3:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Erro ao listar objetos: ${error}`,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}