import type { SeoAnalysisRule } from '../../types';
import { normalize } from '../../utils';

export const keywordInTitleRule: SeoAnalysisRule = {
	id: 'keyword-in-title',
	group: 'basic',
	name: 'Từ khóa trong Tiêu đề SEO',
	description: 'Từ khóa chính phải xuất hiện trong tiêu đề SEO, tốt nhất ở đầu',
	check: (context) => {
		const { title, focusKeyphrase } = context;

		if (!title || !focusKeyphrase) {
			return { status: 'skip' };
		}

		const normalizedTitle = normalize(title);
		const normalizedKeyphrase = normalize(focusKeyphrase);

		if (!normalizedTitle.includes(normalizedKeyphrase)) {
			return { status: 'fail' };
		}

		// Check if keyword is at beginning (first 50% of title)
		const halfLength = Math.ceil(normalizedTitle.length / 2);
		const firstHalf = normalizedTitle.substring(0, halfLength);
		const atBeginning = firstHalf.includes(normalizedKeyphrase);

		return { status: 'pass', value: { atBeginning } };
	},
	messages: {
		pass: (v) => v?.atBeginning
			? 'Tuyệt vời! Từ khóa chính được sử dụng ở đầu tiêu đề SEO.'
			: 'Từ khóa chính có trong tiêu đề. Tốt hơn nếu đưa lên đầu.',
		fail: 'Từ khóa chính không có trong tiêu đề SEO. Hãy thêm vào!',
		skip: 'Cần có tiêu đề và từ khóa chính để phân tích.',
	},
};
