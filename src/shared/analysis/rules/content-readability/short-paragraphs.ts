import type { RuleResultValue, SeoAnalysisRule } from '../../types';
import { countWords, extractParagraphs } from '../../utils';

const MAX_WORDS_PER_PARAGRAPH = 120;

export const shortParagraphsRule: SeoAnalysisRule = {
	id: 'short-paragraphs',
	group: 'content-readability',
	name: 'Đoạn văn ngắn',
	description: 'Các đoạn văn nên ngắn gọn, dưới 120 từ',
	check: (context) => {
		const { content } = context;

		if (!content) {
			return { status: 'skip' };
		}

		const paragraphs = extractParagraphs(content);

		if (paragraphs.length === 0) {
			return { status: 'skip' };
		}

		const longParagraphs = paragraphs.filter(p => countWords(p) > MAX_WORDS_PER_PARAGRAPH);

		return {
			status: longParagraphs.length === 0 ? 'pass' : 'fail',
			value: {
				longParagraphs: longParagraphs.length,
				highlights: longParagraphs.map(p => p.length > 100 ? p.substring(0, 100) + '...' : p),
			},
		};
	},
	messages: {
		pass: 'Bạn đang sử dụng các đoạn văn ngắn gọn. Tốt!',
		fail: (v?: RuleResultValue) => `Có ${v?.longParagraphs} đoạn văn quá dài (>${MAX_WORDS_PER_PARAGRAPH} từ). Hãy chia nhỏ hơn.`,
		skip: 'Không tìm thấy đoạn văn trong nội dung.',
	},
};
