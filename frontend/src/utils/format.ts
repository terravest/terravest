import type { LangType } from '../content';

const LOCALE_MAP: Record<LangType, string> = {
  en: 'en-US',
  'pt-br': 'pt-BR',
  es: 'es-419',
  fr: 'fr-FR',
};

export function getLocaleFromLang(lang: LangType): string {
  return LOCALE_MAP[lang] || 'en-US';
}

export function formatCurrency(
  value: number,
  lang: LangType,
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = getLocaleFromLang(lang);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatNumber(
  value: number,
  lang: LangType,
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = getLocaleFromLang(lang);
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(
  value: number,
  lang: LangType,
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = getLocaleFromLang(lang);
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatDate(value: string | number | Date, lang: LangType): string {
  const locale = getLocaleFromLang(lang);
  return new Intl.DateTimeFormat(locale).format(new Date(value));
}

export function formatTime(value: string | number | Date, lang: LangType): string {
  const locale = getLocaleFromLang(lang);
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
