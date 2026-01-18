import type { SeoAnalysisRule } from '../../types';
import { calculateKeywordDensity, countWords } from '../../utils';

const MIN_DENSITY = 0.5;
const MAX_DENSITY = 2.5;
const MIN_WORDS = 100;

export const keywordDensityRule: SeoAnalysisRule = {
	id: 'keyword-density',
	group: 'additional',
	name: 'Mật độ từ khóa',
	description: 'Mật độ từ khóa nên nằm trong khoảng 0.5% - 2.5%',
	check: (context) => {
		const { content, focusKeyphrase } = context;

		if (!content || !focusKeyphrase) {
			return { status: 'skip' };
		}

		const wordCount = countWords(content);

		if (wordCount < MIN_WORDS) {
			return { status: 'skip', value: { wordCount } };
		}

		const { density, occurrences } = calculateKeywordDensity(content, focusKeyphrase);
		const isOptimal = density >= MIN_DENSITY && density <= MAX_DENSITY;

		return {
			status: isOptimal ? 'pass' : 'fail',
			value: { density, occurrences },
		};
	},
	messages: {
		pass: (v) => `Mật độ từ khóa: ${v?.density?.toFixed(1)}% (${v?.occurrences} lần). Tốt!`,
		fail: (v) => {
			const density = v?.density ?? 0;
			if (density < MIN_DENSITY) {
				return `Mật độ từ khóa quá thấp: ${density.toFixed(1)}%. Nên từ ${MIN_DENSITY}% đến ${MAX_DENSITY}%.`;
			}
			return `Mật độ từ khóa quá cao: ${density.toFixed(1)}%. Nên từ ${MIN_DENSITY}% đến ${MAX_DENSITY}%.`;
		},
		skip: 'Nội dung quá ngắn để phân tích mật độ từ khóa.',
	},
};
