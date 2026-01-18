/**
 * SEO Analysis Engine
 * Runs all SEO analysis rules and returns grouped results
 */

import type { GroupedRuleResults, RuleAnalysisResult, RuleContext, RuleGroup, SeoAnalysisRule } from './types';
import { allRules } from './rules';

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
	};
}

export function runAllRules(context: RuleContext): RuleAnalysisResult[] {
	return allRules.map(rule => runRule(rule, context));
}

export function groupRuleResults(results: RuleAnalysisResult[]): GroupedRuleResults[] {
	const grouped: GroupedRuleResults[] = [];

	for (const group of GROUP_ORDER) {
		const groupResults = results.filter(r => r.group === group && r.status !== 'skip');

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

export * from './types';
export * from './rules';
