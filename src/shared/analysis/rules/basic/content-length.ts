import type { SeoAnalysisRule } from '../../types';
import { countWords } from '../../utils';

const MINIMUM_WORDS = 600;

export const contentLengthRule: SeoAnalysisRule = {
	id: 'content-length',
	group: 'basic',
	name: 'Độ dài nội dung',
	description: 'Nội dung nên có ít nhất 600 từ',
	check: (context) => {
		const { content } = context;

		if (!content) {
			return { status: 'skip' };
		}

		const wordCount = countWords(content);

		return {
			status: wordCount >= MINIMUM_WORDS ? 'pass' : 'fail',
			value: { wordCount },
		};
	},
	messages: {
		pass: (v) => `Nội dung dài ${v?.wordCount} từ. Làm tốt lắm!`,
		fail: (v) => `Nội dung chỉ có ${v?.wordCount} từ. Nên có ít nhất ${MINIMUM_WORDS} từ.`,
		skip: 'Không có nội dung để phân tích.',
	},
};
