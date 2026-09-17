export function formatPrice(minor: number, currency = 'BOB') {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/La_Paz',
  }).format(new Date(value));
}

export function formatStatus(status: string) {
  return {
    PLACED: 'Recibida',
    CONFIRMED: 'Confirmada',
    SHIPPED: 'Enviada',
    DELIVERED: 'Entregada',
    CANCELLED: 'Cancelada',
  }[status] ?? status;
}

export function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  if (/^[\u0000-\u001f]|[\u007f]/.test(value)) return '/';
  if (value.startsWith('/login') || value.startsWith('/register')) return '/';
  return value;
}
