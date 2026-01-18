import type { SeoAnalysisRule } from '../../types';
import { normalize, slugify } from '../../utils';

export const keywordInUrlRule: SeoAnalysisRule = {
	id: 'keyword-in-url',
	group: 'basic',
	name: 'Từ khóa trong URL',
	description: 'Từ khóa chính nên xuất hiện trong URL/slug',
	check: (context) => {
		const { slug, focusKeyphrase } = context;

		if (!slug || !focusKeyphrase) {
			return { status: 'skip' };
		}

		const slugWords = slugify(focusKeyphrase).split('-').filter(Boolean);
		const urlSlug = normalize(slug);

		const hasKeyword = slugWords.some(word => urlSlug.includes(word));

		return { status: hasKeyword ? 'pass' : 'fail' };
	},
	messages: {
		pass: 'Từ khóa chính đã được sử dụng trong URL.',
		fail: 'URL không chứa từ khóa chính.',
		skip: 'Cần có URL/slug và từ khóa chính để phân tích.',
	},
};
