import type { WebPageSchemaData } from '../types';

export function buildWebPageSchema(data: WebPageSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
	};

	if (data.name) {
		schema.name = data.name;
	}

	if (data.description) {
		schema.description = data.description;
	}

	if (data.url) {
		schema.url = data.url;
	}

	if (data.datePublished) {
		schema.datePublished = data.datePublished;
	}

	if (data.dateModified) {
		schema.dateModified = data.dateModified;
	}

	return schema;
}
