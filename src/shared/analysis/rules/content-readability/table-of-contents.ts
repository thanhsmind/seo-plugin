import type { SeoAnalysisRule } from '../../types';
import { countWords, detectTableOfContents } from '../../utils';

const MIN_WORDS_FOR_TOC = 1500;

export const tableOfContentsRule: SeoAnalysisRule = {
	id: 'table-of-contents',
	group: 'content-readability',
	name: 'Mục lục',
	description: 'Nội dung dài nên có mục lục để dễ điều hướng',
	check: (context) => {
		const { content } = context;

		if (!content) {
			return { status: 'skip' };
		}

		const wordCount = countWords(content);

		// Only check for long content
		if (wordCount < MIN_WORDS_FOR_TOC) {
			return { status: 'skip', value: { skipped: true, wordCount } };
		}

		const hasToc = detectTableOfContents(content);

		return { status: hasToc ? 'pass' : 'fail' };
	},
	messages: {
		pass: 'Có vẻ như bạn đang sử dụng Table of Contents để chia nhỏ văn bản.',
		fail: 'Nội dung dài, hãy cân nhắc thêm mục lục.',
		skip: 'Nội dung chưa đủ dài để cần mục lục.',
	},
};
