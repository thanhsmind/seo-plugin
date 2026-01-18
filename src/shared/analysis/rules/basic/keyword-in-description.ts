import type { SeoAnalysisRule } from '../../types';
import { normalize } from '../../utils';

export const keywordInDescriptionRule: SeoAnalysisRule = {
	id: 'keyword-in-description',
	group: 'basic',
	name: 'Từ khóa trong Mô tả Meta',
	description: 'Từ khóa chính phải xuất hiện trong mô tả meta',
	check: (context) => {
		const { metaDescription, focusKeyphrase } = context;

		if (!metaDescription || !focusKeyphrase) {
			return { status: 'skip' };
		}

		const hasKeyphrase = normalize(metaDescription).includes(normalize(focusKeyphrase));

		return { status: hasKeyphrase ? 'pass' : 'fail' };
	},
	messages: {
		pass: 'Đã sử dụng từ khóa chính trong Mô tả Meta SEO.',
		fail: 'Mô tả Meta không chứa từ khóa chính.',
		skip: 'Cần có mô tả meta và từ khóa chính để phân tích.',
	},
};
