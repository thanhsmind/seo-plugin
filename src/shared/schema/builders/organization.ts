import type { OrganizationSchemaData } from '../types';

export function buildOrganizationSchema(data: OrganizationSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
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

	if (data.logo) {
		schema.logo = data.logo;
	}

	if (data.sameAs && data.sameAs.length > 0) {
		schema.sameAs = data.sameAs;
	}

	return schema;
}
