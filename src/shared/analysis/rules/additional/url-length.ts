import type { SeoAnalysisRule } from '../../types';

const MAX_URL_LENGTH = 75;

export const urlLengthRule: SeoAnalysisRule = {
	id: 'url-length',
	group: 'additional',
	name: 'Độ dài URL',
	description: 'URL nên ngắn gọn, không quá 75 ký tự',
	check: (context) => {
		const { slug } = context;

		if (!slug) {
			return { status: 'skip' };
		}

		const urlLength = slug.length;
		const isGood = urlLength <= MAX_URL_LENGTH;

		return {
			status: isGood ? 'pass' : 'fail',
			value: { urlLength },
		};
	},
	messages: {
		pass: (v) => `URL dài ${v?.urlLength} ký tự. Tốt!`,
		fail: (v) => `URL quá dài (${v?.urlLength} ký tự). Nên dưới ${MAX_URL_LENGTH} ký tự.`,
		skip: 'Không có URL/slug để phân tích.',
	},
};
