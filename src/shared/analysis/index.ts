/**
 * SEO Analysis Engine
 * Runs all SEO analysis rules and returns grouped results
 */

import type { GroupedRuleResults, KeywordAnalysisResult, MultiKeywordAnalysisResult, RuleAnalysisResult, RuleContext, RuleGroup, SeoAnalysisRule } from './types';
import { allRules } from './rules';
import { parseKeywords } from './utils';

const GROUP_NAMES: Record<RuleGroup, string> = {
	'basic': 'SEO Cơ bản',
	'additional': 'Bổ sung',
	'title-readability': 'Khả năng đọc tiêu đề',
	'content-readability': 'Khả năng đọc nội dung',
};

const GROUP_ORDER: RuleGroup[] = ['basic', 'additional', 'title-readability', 'content-readability'];

function getMessage(rule: SeoAnalysisRule, status: 'pass' | 'fail' | 'skip', value?: Record<string, unknown>): string {
	if (status === 'skip') {
		return typeof rule.messages.skip === 'string' ? rule.messages.skip : 'Bỏ qua.';
	}

	const messageTemplate = status === 'pass' ? rule.messages.pass : rule.messages.fail;

	if (typeof messageTemplate === 'function') {
		return messageTemplate(value);
	}

	return messageTemplate;
}

export function runRule(rule: SeoAnalysisRule, context: RuleContext): RuleAnalysisResult {
	const result = rule.check(context);

	return {
		id: rule.id,
		group: rule.group,
		name: rule.name,
		status: result.status,
		message: getMessage(rule, result.status, result.value),
		details: result.value,
	};
}

export function runAllRules(context: RuleContext): RuleAnalysisResult[] {
	return allRules.map(rule => runRule(rule, context));
}

export function groupRuleResults(results: RuleAnalysisResult[]): GroupedRuleResults[] {
	const grouped: GroupedRuleResults[] = [];

	for (const group of GROUP_ORDER) {
		const groupResults = results.filter(r => r.group === group);

		if (groupResults.length === 0) continue;

		grouped.push({
			group,
			groupName: GROUP_NAMES[group],
			results: groupResults,
			passCount: groupResults.filter(r => r.status === 'pass').length,
			failCount: groupResults.filter(r => r.status === 'fail').length,
		});
	}

	return grouped;
}

export function calculateScore(results: RuleAnalysisResult[]): number {
	const scorableResults = results.filter(r => r.status !== 'skip');

	if (scorableResults.length === 0) return 0;

	const passCount = scorableResults.filter(r => r.status === 'pass').length;

	return Math.round((passCount / scorableResults.length) * 100);
}

/**
 * Run analysis for a single keyword
 */
export function runKeywordAnalysis(
	keyword: string,
	isPrimary: boolean,
	baseContext: Omit<RuleContext, 'focusKeyphrase'>,
): KeywordAnalysisResult {
	const context: RuleContext = {
		...baseContext,
		focusKeyphrase: keyword,
	};

	const results = runAllRules(context).map(r => ({
		...r,
		keyword,
	}));

	const groupedResults = groupRuleResults(results);
	const score = calculateScore(results);

	return {
		keyword,
		isPrimary,
		score,
		results,
		groupedResults,
	};
}

/**
 * Run analysis for multiple keywords (comma-separated)
 */
export function runMultiKeywordAnalysis(
	focusKeyphrase: string,
	baseContext: Omit<RuleContext, 'focusKeyphrase'>,
): MultiKeywordAnalysisResult {
	const { primary, secondary } = parseKeywords(focusKeyphrase);

	if (!primary) {
		return {
			keywords: [],
			overallScore: 0,
			primaryKeyword: '',
		};
	}

	const keywords: KeywordAnalysisResult[] = [];

	// Analyze primary keyword
	keywords.push(runKeywordAnalysis(primary, true, baseContext));

	// Analyze secondary keywords
	for (const keyword of secondary) {
		keywords.push(runKeywordAnalysis(keyword, false, baseContext));
	}

	// Overall score is weighted: primary keyword counts more
	const primaryScore = keywords[0]?.score ?? 0;
	const secondaryScores = keywords.slice(1).map(k => k.score);
	const avgSecondaryScore = secondaryScores.length > 0
		? secondaryScores.reduce((a, b) => a + b, 0) / secondaryScores.length
		: 0;

	// Primary keyword = 70%, Secondary = 30%
	const overallScore = secondaryScores.length > 0
		? Math.round(primaryScore * 0.7 + avgSecondaryScore * 0.3)
		: primaryScore;

	return {
		keywords,
		overallScore,
		primaryKeyword: primary,
	};
}

export * from './types';
export * from './rules';
