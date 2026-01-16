import type { SeoRule } from '../types';

export const titleReadabilityRules: SeoRule[] = [
	{
		id: 'number-in-title',
		group: 'title-readability',
		name: 'Có số trong tiêu đề',
		description: 'Kiểm tra xem tiêu đề có chứa số không. Số trong tiêu đề giúp tăng CTR.',
		check: (context) => {
			const { title } = context;
			if (!title) {
				return { pass: false, data: { hasNumber: false } };
			}
			const hasNumber = /\d/.test(title);
			return { pass: hasNumber, data: { hasNumber } };
		},
		messages: {
			pass: 'Tiêu đề có chứa số, giúp tăng tỷ lệ nhấp chuột (CTR).',
			fail: 'Tiêu đề không có số. Cân nhắc thêm số (ví dụ: "5 cách...", "Top 10...") để tăng CTR.',
		},
	},
];
