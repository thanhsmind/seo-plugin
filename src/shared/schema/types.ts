export type SchemaType =
	| 'Article'
	| 'NewsArticle'
	| 'BlogPosting'
	| 'Product'
	| 'LocalBusiness'
	| 'Organization'
	| 'Person'
	| 'FAQ'
	| 'HowTo'
	| 'Recipe'
	| 'Event'
	| 'Course'
	| 'BreadcrumbList'
	| 'WebPage';

export interface SchemaMarkup {
	enabled: boolean;
	type: SchemaType;
	data: Record<string, unknown>;
	fieldMappings?: Record<string, string>;
}

export interface SchemaFieldDefinition {
	name: string;
	label: string;
	type: 'string' | 'text' | 'number' | 'date' | 'datetime' | 'url' | 'image' | 'array' | 'object';
	required?: boolean;
	placeholder?: string;
	description?: string;
	items?: SchemaFieldDefinition;
	properties?: SchemaFieldDefinition[];
}

export interface SchemaTypeDefinition {
	type: SchemaType;
	label: string;
	description: string;
	icon: string;
	fields: SchemaFieldDefinition[];
}

export interface FAQItem {
	question: string;
	answer: string;
}

export interface HowToStep {
	name: string;
	text: string;
	image?: string;
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export interface RecipeIngredient {
	item: string;
}

export interface ArticleSchemaData {
	headline?: string;
	author?: string;
	authorUrl?: string;
	datePublished?: string;
	dateModified?: string;
	image?: string;
	description?: string;
}

export interface ProductSchemaData {
	name?: string;
	description?: string;
	image?: string;
	brand?: string;
	sku?: string;
	price?: number;
	priceCurrency?: string;
	availability?: string;
	ratingValue?: number;
	reviewCount?: number;
}

export interface LocalBusinessSchemaData {
	name?: string;
	description?: string;
	image?: string;
	telephone?: string;
	email?: string;
	address?: {
		streetAddress?: string;
		addressLocality?: string;
		addressRegion?: string;
		postalCode?: string;
		addressCountry?: string;
	};
	geo?: {
		latitude?: number;
		longitude?: number;
	};
	priceRange?: string;
	openingHours?: string[];
}

export interface OrganizationSchemaData {
	name?: string;
	description?: string;
	url?: string;
	logo?: string;
	sameAs?: string[];
}

export interface PersonSchemaData {
	name?: string;
	image?: string;
	jobTitle?: string;
	url?: string;
	sameAs?: string[];
}

export interface FAQSchemaData {
	questions: FAQItem[];
}

export interface HowToSchemaData {
	name?: string;
	description?: string;
	image?: string;
	totalTime?: string;
	estimatedCost?: string;
	steps: HowToStep[];
}

export interface RecipeSchemaData {
	name?: string;
	description?: string;
	image?: string;
	author?: string;
	prepTime?: string;
	cookTime?: string;
	totalTime?: string;
	recipeYield?: string;
	recipeIngredient?: string[];
	recipeInstructions?: string[];
	nutrition?: {
		calories?: string;
	};
}

export interface EventSchemaData {
	name?: string;
	description?: string;
	image?: string;
	startDate?: string;
	endDate?: string;
	location?: {
		name?: string;
		address?: string;
	};
	performer?: string;
	organizer?: string;
	eventStatus?: string;
	eventAttendanceMode?: string;
}

export interface CourseSchemaData {
	name?: string;
	description?: string;
	provider?: string;
	providerUrl?: string;
}

export interface BreadcrumbSchemaData {
	items: BreadcrumbItem[];
}

export interface WebPageSchemaData {
	name?: string;
	description?: string;
	url?: string;
	datePublished?: string;
	dateModified?: string;
}
