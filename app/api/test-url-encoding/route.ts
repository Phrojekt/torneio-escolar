import { NextRequest, NextResponse } from 'next/server';
import { fixS3UrlEncoding } from '@/lib/image-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testUrl = searchParams.get('url');
  
  if (!testUrl) {
    return NextResponse.json({ 
      error: 'Forneça uma URL para testar com ?url=...' 
    });
  }
  
  try {
    const correctedUrl = fixS3UrlEncoding(testUrl);
    
    return NextResponse.json({
      original: testUrl,
      corrected: correctedUrl,
      wasChanged: testUrl !== correctedUrl,
      test: 'success'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao processar URL',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}