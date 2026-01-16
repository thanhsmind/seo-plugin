import type { ProductSchemaData } from '../types';

export function buildProductSchema(data: ProductSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Product',
	};

	if (data.name) {
		schema.name = data.name;
	}

	if (data.description) {
		schema.description = data.description;
	}

	if (data.image) {
		schema.image = data.image;
	}

	if (data.brand) {
		schema.brand = {
			'@type': 'Brand',
			name: data.brand,
		};
	}

	if (data.sku) {
		schema.sku = data.sku;
	}

	if (data.price !== undefined && data.price !== null) {
		schema.offers = {
			'@type': 'Offer',
			price: data.price,
			priceCurrency: data.priceCurrency || 'VND',
			availability: data.availability ? `https://schema.org/${data.availability}` : 'https://schema.org/InStock',
		};
	}

	if (data.ratingValue !== undefined && data.reviewCount !== undefined) {
		schema.aggregateRating = {
			'@type': 'AggregateRating',
			ratingValue: data.ratingValue,
			reviewCount: data.reviewCount,
		};
	}

	return schema;
}
