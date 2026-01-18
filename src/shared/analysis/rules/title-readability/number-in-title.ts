import type { SeoAnalysisRule } from '../../types';
import { hasNumberInTitle } from '../../utils';

export const numberInTitleRule: SeoAnalysisRule = {
	id: 'number-in-title',
	group: 'title-readability',
	name: 'Có số trong tiêu đề',
	description: 'Tiêu đề có chứa số thường thu hút sự chú ý hơn',
	check: (context) => {
		const { title } = context;

		if (!title) {
			return { status: 'skip' };
		}

		const hasNumber = hasNumberInTitle(title);

		return { status: hasNumber ? 'pass' : 'fail' };
	},
	messages: {
		pass: 'Tiêu đề của bạn có chứa số. Tuyệt vời!',
		fail: 'Cân nhắc thêm số vào tiêu đề để thu hút sự chú ý hơn.',
		skip: 'Không có tiêu đề để phân tích.',
	},
};
