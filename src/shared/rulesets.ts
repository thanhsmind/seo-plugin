export interface SeoRule {
	field: string;
	minLength: number;
	maxLength: number;
}

export type SeoRuleKey = 'title' | 'meta_description' | 'slug' | 'content';

export const seoRules: Record<SeoRuleKey, SeoRule> = {
	title: {
		field: 'title',
		minLength: 30, // RankMath: min 30
		maxLength: 60, // RankMath: recommended max 60
	},
	meta_description: {
		field: 'meta_description',
		minLength: 120, // RankMath: min 120
		maxLength: 160, // RankMath: max 160
	},
	slug: {
		field: 'slug',
		minLength: 3,
		maxLength: 75, // RankMath: max 75
	},
	content: {
		field: 'content',
		minLength: 600, // Good
		maxLength: 2500, // Best
	},
};

export const keywordRules = {
	density: {
		min: 0.5,
		max: 2.5,
	},
	firstTenPercent: true,
	titleStart: true,
};
