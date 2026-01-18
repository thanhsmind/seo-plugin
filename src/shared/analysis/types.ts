/**
 * SEO Analysis Rule Types
 */

export type RuleGroup = 'basic' | 'additional' | 'title-readability' | 'content-readability';

export type RuleStatus = 'pass' | 'fail' | 'skip';

export interface RuleContext {
	title: string;
	metaDescription: string;
	focusKeyphrase: string;
	slug: string;
	content: string;
}

export interface RuleResultValue {
	atBeginning?: boolean;
	wordCount?: number;
	percentage?: number;
	density?: number;
	occurrences?: number;
	longCount?: number;
	total?: number;
	skipped?: boolean;
	urlLength?: number;
	longParagraphs?: number;
	length?: number;
	[key: string]: unknown;
}

export interface RuleResult {
	status: RuleStatus;
	value?: RuleResultValue;
}

export interface RuleMessages {
	pass: string | ((value?: RuleResultValue) => string);
	fail: string | ((value?: RuleResultValue) => string);
	skip?: string;
}

export interface SeoAnalysisRule {
	id: string;
	group: RuleGroup;
	name: string;
	description: string;
	check: (context: RuleContext) => RuleResult;
	messages: RuleMessages;
}

export interface RuleAnalysisResult {
	id: string;
	group: RuleGroup;
	name: string;
	status: RuleStatus;
	message: string;
	keyword?: string;
}

export interface GroupedRuleResults {
	group: RuleGroup;
	groupName: string;
	results: RuleAnalysisResult[];
	passCount: number;
	failCount: number;
}

export interface KeywordAnalysisResult {
	keyword: string;
	isPrimary: boolean;
	score: number;
	results: RuleAnalysisResult[];
	groupedResults: GroupedRuleResults[];
}

export interface MultiKeywordAnalysisResult {
	keywords: KeywordAnalysisResult[];
	overallScore: number;
	primaryKeyword: string;
}
