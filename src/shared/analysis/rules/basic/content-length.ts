import type { SeoAnalysisRule } from '../../types';
import { countWords } from '../../utils';

const IDEAL_MIN = 600;
const GOOD_MIN = 1000;
const BEST_MIN = 2500;

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
			status: wordCount >= IDEAL_MIN ? 'pass' : 'fail',
			value: { wordCount },
		};
	},
	messages: {
		pass: (v) => {
			const count = v?.wordCount ?? 0;
			if (count >= BEST_MIN) return `Bản trường ca này dài ${count} từ. Tuyệt vời cho SEO chuyên sâu!`;
			if (count >= GOOD_MIN) return `Nội dung dài ${count} từ. Rất tốt!`;
			return `Nội dung dài ${count} từ. Tạm ổn.`;
		},
		fail: (v) => `Nội dung chỉ có ${v?.wordCount ?? 0} từ. Khuyến nghị: 600 (Tạm ổn), 1000 (Tốt), 2500 (Tuyệt vời).`,
		skip: 'Không có nội dung để phân tích.',
	},
};
