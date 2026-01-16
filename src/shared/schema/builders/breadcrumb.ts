import type { BreadcrumbSchemaData } from '../types';

export function buildBreadcrumbSchema(data: BreadcrumbSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
	};

	if (data.items && data.items.length > 0) {
		schema.itemListElement = data.items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url,
		}));
	}

	return schema;
}
