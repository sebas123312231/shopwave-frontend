import { NextRequest, NextResponse } from 'next/server';
import { brotliDecompress, gunzip, inflate } from 'zlib';
import { promisify } from 'util';

const brotliDecompressAsync = promisify(brotliDecompress);
const gunzipAsync = promisify(gunzip);
const inflateAsync = promisify(inflate);

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://shopwave-backend-ky66.onrender.com';

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

async function decodeBody(buffer: ArrayBuffer, encoding: string | null): Promise<string> {
  if (!encoding || buffer.byteLength === 0) {
    return new TextDecoder('utf-8').decode(buffer);
  }

  const enc = encoding.toLowerCase().trim();
  const buf = Buffer.from(buffer);

  try {
    if (enc === 'br') {
      const decompressed = await brotliDecompressAsync(buf);
      return new TextDecoder('utf-8').decode(decompressed);
    }
    if (enc === 'gzip' || enc === 'x-gzip') {
      const decompressed = await gunzipAsync(buf);
      return new TextDecoder('utf-8').decode(decompressed);
    }
    if (enc === 'deflate') {
      const decompressed = await inflateAsync(buf);
      return new TextDecoder('utf-8').decode(decompressed);
    }
  } catch (err) {
    console.error('[proxy] Failed to decode body with encoding', encoding, err);
  }

  return new TextDecoder('utf-8').decode(buffer);
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
  'content-encoding',
]);

const STRIPPED_HEADERS = new Set([
  'www-authenticate',
  'content-encoding',
  'content-length',
  'transfer-encoding',
]);

function buildResponseHeaders(backendHeaders: Headers, origin: string | null): Headers {
  const headers = new Headers();
  backendHeaders.forEach((value, key) => {
    if (STRIPPED_HEADERS.has(key.toLowerCase())) return;
    if (key.toLowerCase() === 'access-control-allow-origin' && origin) {
      headers.set(key, origin);
      return;
    }
    headers.set(key, value);
  });
  return headers;
}

async function fetchAndForward(request: NextRequest, targetUrl: string): Promise<NextResponse> {
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

  const origin = request.headers.get('origin');

  const backendResponse = await fetch(targetUrl, init);

  if (backendResponse.status === 308 || backendResponse.status === 301 || backendResponse.status === 302) {
    const location = backendResponse.headers.get('location');
    if (location) {
      const redirectResponse = await fetch(location, init);
      const responseHeaders = buildResponseHeaders(redirectResponse.headers, origin);
      const buffer = await redirectResponse.arrayBuffer();
      const encoding = redirectResponse.headers.get('content-encoding');
      const text = await decodeBody(buffer, encoding);
      const cleanedBody = cleanResponseBody(text);
      return new NextResponse(cleanedBody, {
        status: redirectResponse.status,
        statusText: redirectResponse.statusText,
        headers: responseHeaders,
      });
    }
  }

  const responseHeaders = buildResponseHeaders(backendResponse.headers, origin);
  const buffer = await backendResponse.arrayBuffer();
  const encoding = backendResponse.headers.get('content-encoding');
  const text = await decodeBody(buffer, encoding);
  const cleanedBody = cleanResponseBody(text);

  return new NextResponse(cleanedBody, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  let path = request.nextUrl.pathname.replace(/^\/api/, '');
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const searchParams = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${path}${searchParams}`;

  try {
    return await fetchAndForward(request, targetUrl);
  } catch (err) {
    console.error('[proxy] Error forwarding request', targetUrl, err);
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

export const dynamic = 'force-dynamic';
