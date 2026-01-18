import type { SeoAnalysisRule } from '../../types';
import { extractImageAltText } from '../../../utils';

export const keywordInImageAltRule: SeoAnalysisRule = {
	id: 'keyword-in-image-alt',
	group: 'additional',
	name: 'Từ khóa trong alt hình ảnh',
	description: 'Từ khóa chính nên xuất hiện trong thuộc tính alt của ít nhất một hình ảnh',
	check: (context) => {
		const { content, focusKeyphrase } = context;

		if (!content || !focusKeyphrase) {
			return { status: 'skip' };
		}

		const altTexts = extractImageAltText(content);

		if (altTexts.length === 0) {
			return { status: 'skip', value: { skipped: true } };
		}

		const normalizedKeyword = focusKeyphrase.toLowerCase();
		const matchingAlts = altTexts.filter((alt: string) =>
			alt.toLowerCase().includes(normalizedKeyword),
		);

		return {
			status: matchingAlts.length > 0 ? 'pass' : 'fail',
			value: { highlights: altTexts },
		};
	},
	messages: {
		pass: 'Đã tìm thấy từ khóa chính trong alt của hình ảnh.',
		fail: 'Không có hình ảnh nào có alt chứa từ khóa chính.',
		skip: 'Không tìm thấy hình ảnh trong nội dung.',
	},
};
