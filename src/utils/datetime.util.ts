export const BOLIVIA_TIMEZONE = 'America/La_Paz';

const dateOpts: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: BOLIVIA_TIMEZONE,
};

const dateTimeOpts: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: BOLIVIA_TIMEZONE,
};

const shortDateOpts: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: BOLIVIA_TIMEZONE,
};

export function formatBoliviaDate(value: string | Date): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-BO', dateOpts);
}

export function formatBoliviaDateTime(value: string | Date): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-BO', dateTimeOpts);
}

export function formatBoliviaShortDate(value: string | Date): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-BO', shortDateOpts);
}
