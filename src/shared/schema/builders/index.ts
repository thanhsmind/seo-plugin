import type { SchemaType } from '../types';
import { buildArticleSchema } from './article';
import { buildBreadcrumbSchema } from './breadcrumb';
import { buildCourseSchema } from './course';
import { buildEventSchema } from './event';
import { buildFAQSchema } from './faq';
import { buildHowToSchema } from './how-to';
import { buildLocalBusinessSchema } from './local-business';
import { buildOrganizationSchema } from './organization';
import { buildPersonSchema } from './person';
import { buildProductSchema } from './product';
import { buildRecipeSchema } from './recipe';
import { buildWebPageSchema } from './webpage';

export function buildSchema(type: SchemaType, data: Record<string, unknown>): Record<string, unknown> {
	switch (type) {
		case 'Article':
			return buildArticleSchema(data as any, 'Article');
		case 'NewsArticle':
			return buildArticleSchema(data as any, 'NewsArticle');
		case 'BlogPosting':
			return buildArticleSchema(data as any, 'BlogPosting');
		case 'Product':
			return buildProductSchema(data as any);
		case 'LocalBusiness':
			return buildLocalBusinessSchema(data as any);
		case 'Organization':
			return buildOrganizationSchema(data as any);
		case 'Person':
			return buildPersonSchema(data as any);
		case 'FAQ':
			return buildFAQSchema(data as any);
		case 'HowTo':
			return buildHowToSchema(data as any);
		case 'Recipe':
			return buildRecipeSchema(data as any);
		case 'Event':
			return buildEventSchema(data as any);
		case 'Course':
			return buildCourseSchema(data as any);
		case 'BreadcrumbList':
			return buildBreadcrumbSchema(data as any);
		case 'WebPage':
			return buildWebPageSchema(data as any);
		default:
			return {
				'@context': 'https://schema.org',
				'@type': type,
				...data,
			};
	}
}

export function buildJsonLd(type: SchemaType, data: Record<string, unknown>): string {
	const schema = buildSchema(type, data);
	return JSON.stringify(schema, null, 2);
}

export * from './article';
export * from './breadcrumb';
export * from './course';
export * from './event';
export * from './faq';
export * from './how-to';
export * from './local-business';
export * from './organization';
export * from './person';
export * from './product';
export * from './recipe';
export * from './webpage';
