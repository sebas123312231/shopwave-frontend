import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'content-length',
]);

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  let path = request.nextUrl.pathname.replace(/^\/api/, '');
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const searchParams = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${path}${searchParams}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const backendResponse = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'www-authenticate') return;
      responseHeaders.set(key, value);
    });

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { message: 'Error de conexión con el servidor. Intenta nuevamente.' },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}