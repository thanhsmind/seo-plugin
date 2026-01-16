export interface SeoFieldRule {
	minLength: number;
	maxLength: number;
}

export type SeoFieldStatus = 'missing' | 'too-short' | 'too-long' | 'ideal';

export interface SeoFieldState {
	length: number;
	progress: number;
	status: SeoFieldStatus;
	message: string;
}

import type { SchemaMarkup } from '../schema/types';

export type { SchemaMarkup };

// Alias for backward compatibility
export type SchemaMarkupValue = SchemaMarkup;

export interface SeoValue {
	title: string;
	meta_description: string;
	focus_keyphrase?: string;
	og_image?: string;
	additional_fields?: Record<string, string>;
	sitemap?: {
		change_frequency: string;
		priority: string;
	};
	no_index?: boolean;
	no_follow?: boolean;
	schema_markup?: SchemaMarkupValue;
}

export interface SeoInterfaceOptions {
	titleTemplate?: string;
	descriptionTemplate?: string;
	showOgImage?: boolean;
	showSearchControls?: boolean;
	showSitemap?: boolean;
	showSchema?: boolean;
	defaultChangeFrequency?: string;
	defaultPriority?: string;
	additionalFields?: Array<Record<string, unknown>>;
	showFocusKeyphrase?: boolean;
	contentFields?: string | string[];
	slugField?: string;
}
