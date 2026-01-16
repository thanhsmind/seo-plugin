import type { ArticleSchemaData } from '../types';

export function buildArticleSchema(data: ArticleSchemaData, type: 'Article' | 'NewsArticle' | 'BlogPosting' = 'Article'): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': type,
	};

	if (data.headline) {
		schema.headline = data.headline;
	}

	if (data.description) {
		schema.description = data.description;
	}

	if (data.image) {
		schema.image = data.image;
	}

	if (data.datePublished) {
		schema.datePublished = data.datePublished;
	}

	if (data.dateModified) {
		schema.dateModified = data.dateModified;
	}

	if (data.author) {
		schema.author = {
			'@type': 'Person',
			name: data.author,
			...(data.authorUrl && { url: data.authorUrl }),
		};
	}

	return schema;
}
