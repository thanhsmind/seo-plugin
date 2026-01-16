import type { SeoValue } from '../types/seo';

export interface AnalyzeConfig {
	title: string;
	metaDescription: string;
	focusKeyphrase: string;
	url?: string;
	content?: string;
}

export interface AnalysisResult {
	id: string;
	status: 'good' | 'warning' | 'error';
	message: string;
	category: 'basic' | 'keyphrase' | 'readability';
}

export interface MetaTags {
	title: string;
	description: string;
	canonical?: string;
	robots?: string;
}

export interface SeoEngine {
	analyze(config: AnalyzeConfig): AnalysisResult[];
	buildMeta(seoValue: SeoValue, itemValues: Record<string, any>): MetaTags;
	buildRobots(seoValue: SeoValue): string;
}

export * from './text';
export * from './keywords';
