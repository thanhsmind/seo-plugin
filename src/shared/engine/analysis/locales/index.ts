import { en } from './en';
import { vi } from './vi';

export type Locale = 'en' | 'vi';

export const locales = {
	en,
	vi,
};

export function getLocale(locale: Locale = 'vi') {
	return locales[locale] || locales.vi;
}

export function t(key: string, locale: Locale = 'vi', params?: Record<string, unknown>): string {
	const localeData = getLocale(locale);
	const keys = key.split('.');
	let value: unknown = localeData;

	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = (value as Record<string, unknown>)[k];
		} else {
			return key;
		}
	}

	if (typeof value !== 'string') {
		return key;
	}

	if (params) {
		return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
			return params[paramKey] !== undefined ? String(params[paramKey]) : `{${paramKey}}`;
		});
	}

	return value;
}

export { en, vi };
