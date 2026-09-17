import { handleStore } from '@/lib/server/bff';

export const runtime = 'nodejs';

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: Context) { return handleStore(request, (await context.params).path); }
export async function POST(request: Request, context: Context) { return handleStore(request, (await context.params).path); }
export async function PATCH(request: Request, context: Context) { return handleStore(request, (await context.params).path); }
export async function PUT(request: Request, context: Context) { return handleStore(request, (await context.params).path); }
export async function DELETE(request: Request, context: Context) { return handleStore(request, (await context.params).path); }
