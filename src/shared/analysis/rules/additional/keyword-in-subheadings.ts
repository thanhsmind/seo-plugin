import type { SeoAnalysisRule } from '../../types';
import { extractHeadings, normalize } from '../../utils';

export const keywordInSubheadingsRule: SeoAnalysisRule = {
	id: 'keyword-in-subheadings',
	group: 'additional',
	name: 'Từ khóa trong tiêu đề phụ',
	description: 'Từ khóa chính nên xuất hiện trong ít nhất một tiêu đề phụ (H2-H6)',
	check: (context) => {
		const { content, focusKeyphrase } = context;

		if (!content || !focusKeyphrase) {
			return { status: 'skip' };
		}

		const headings = extractHeadings(content);

		if (headings.length === 0) {
			return { status: 'skip', value: { skipped: true } };
		}

		const hasKeyphrase = headings.some(h =>
			normalize(h.text).includes(normalize(focusKeyphrase)),
		);

		return { status: hasKeyphrase ? 'pass' : 'fail' };
	},
	messages: {
		pass: 'Đã tìm thấy từ khóa chính trong các tiêu đề phụ.',
		fail: 'Hãy thêm từ khóa chính vào ít nhất một tiêu đề phụ (H2-H6).',
		skip: 'Không tìm thấy tiêu đề phụ trong nội dung.',
	},
};
