import type { PersonSchemaData } from '../types';

export function buildPersonSchema(data: PersonSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Person',
	};

	if (data.name) {
		schema.name = data.name;
	}

	if (data.image) {
		schema.image = data.image;
	}

	if (data.jobTitle) {
		schema.jobTitle = data.jobTitle;
	}

	if (data.url) {
		schema.url = data.url;
	}

	if (data.sameAs && data.sameAs.length > 0) {
		schema.sameAs = data.sameAs;
	}

	return schema;
}
