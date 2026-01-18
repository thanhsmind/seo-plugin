import type { SeoAnalysisRule } from '../../types';
import { getWords, normalize } from '../../utils';

export const keywordInFirst10PercentRule: SeoAnalysisRule = {
	id: 'keyword-in-first-10-percent',
	group: 'basic',
	name: 'Từ khóa trong 10% đầu nội dung',
	description: 'Từ khóa chính nên xuất hiện trong 10% đầu tiên của nội dung',
	check: (context) => {
		const { content, focusKeyphrase } = context;

		if (!content || !focusKeyphrase) {
			return { status: 'skip' };
		}

		const words = getWords(content);

		if (words.length < 10) {
			return { status: 'skip' };
		}

		const first10PercentCount = Math.max(Math.ceil(words.length * 0.1), 10);
		const first10Percent = words.slice(0, first10PercentCount).join(' ');

		const hasKeyphrase = normalize(first10Percent).includes(normalize(focusKeyphrase));

		return { status: hasKeyphrase ? 'pass' : 'fail' };
	},
	messages: {
		pass: 'Từ khóa chính xuất hiện trong 10% nội dung đầu tiên.',
		fail: 'Từ khóa chính không xuất hiện trong phần đầu nội dung.',
		skip: 'Cần có nội dung và từ khóa chính để phân tích.',
	},
};
