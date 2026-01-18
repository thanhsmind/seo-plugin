import type { SeoAnalysisRule } from '../../types';
import { countWords, extractSentences } from '../../utils';

const MAX_WORDS_PER_SENTENCE = 20;
const MAX_LONG_SENTENCE_PERCENTAGE = 25;

export const sentenceLengthRule: SeoAnalysisRule = {
	id: 'sentence-length',
	group: 'content-readability',
	name: 'Độ dài câu',
	description: 'Không quá 25% câu nên dài hơn 20 từ',
	check: (context) => {
		const { content } = context;

		if (!content) {
			return { status: 'skip' };
		}

		const sentences = extractSentences(content);

		if (sentences.length === 0) {
			return { status: 'skip' };
		}

		const longSentences = sentences.filter(s => countWords(s) > MAX_WORDS_PER_SENTENCE);
		const percentage = (longSentences.length / sentences.length) * 100;

		return {
			status: percentage <= MAX_LONG_SENTENCE_PERCENTAGE ? 'pass' : 'fail',
			value: {
				percentage,
				longCount: longSentences.length,
				total: sentences.length,
			},
		};
	},
	messages: {
		pass: 'Độ dài câu phù hợp.',
		fail: (v) => `${v?.percentage?.toFixed(0)}% câu quá dài (>${MAX_WORDS_PER_SENTENCE} từ). Nên dưới ${MAX_LONG_SENTENCE_PERCENTAGE}%.`,
		skip: 'Không tìm thấy câu trong nội dung.',
	},
};
