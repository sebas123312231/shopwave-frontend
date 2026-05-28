import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function cleanResponseBody(text: string): string {
  let trimmed = text.trim();
  if (!trimmed) return text;
  
  trimmed = trimmed.replace(/"hibernateLazyInitializer"\s*([}\]])/g, '"hibernateLazyInitializer":null$1');
  
  let startIndex = -1;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '[' || trimmed[i] === '{') {
      startIndex = i;
      break;
    }
  }
  
  if (startIndex === -1) return text;
  
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let endIndex = trimmed.length;
  
  for (let i = startIndex; i < trimmed.length; i++) {
    const char = trimmed[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (inString) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    
    if (char === '"') {
      inString = true;
      continue;
    }
    
    if (char === '[' || char === '{') {
      depth++;
    } else if (char === ']' || char === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  const jsonPart = trimmed.slice(startIndex, endIndex);
  
  try {
    JSON.parse(jsonPart);
    return jsonPart;
  } catch {
    return text;
  }
}

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
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const backendResponse = await fetch(targetUrl, init);
    
    // Handle 308 redirect manually to preserve Authorization header
    if (backendResponse.status === 308 || backendResponse.status === 301 || backendResponse.status === 302) {
      const location = backendResponse.headers.get('location');
      if (location) {
        const redirectResponse = await fetch(location, init);
        const redirectHeaders = new Headers();
        redirectResponse.headers.forEach((value, key) => {
          if (key.toLowerCase() === 'www-authenticate') return;
          redirectHeaders.set(key, value);
        });
        const bodyText = await redirectResponse.text();
        const cleanedBody = cleanResponseBody(bodyText);
        return new NextResponse(cleanedBody, {
          status: redirectResponse.status,
          statusText: redirectResponse.statusText,
          headers: redirectHeaders,
        });
      }
    }

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'www-authenticate') return;
      responseHeaders.set(key, value);
    });

    const bodyText = await backendResponse.text();
    const cleanedBody = cleanResponseBody(bodyText);

    return new NextResponse(cleanedBody, {
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