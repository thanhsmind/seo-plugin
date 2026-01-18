import type { SeoAnalysisRule } from '../../types';
import { extractImages, extractVideos } from '../../utils';

export const hasMediaRule: SeoAnalysisRule = {
	id: 'has-media',
	group: 'content-readability',
	name: 'Có hình ảnh/video',
	description: 'Nội dung nên có hình ảnh hoặc video để tăng tương tác',
	check: (context) => {
		const { content } = context;

		if (!content) {
			return { status: 'skip' };
		}

		const images = extractImages(content);
		const videos = extractVideos(content);
		const hasMedia = images.length > 0 || videos.length > 0;

		return { status: hasMedia ? 'pass' : 'fail' };
	},
	messages: {
		pass: 'Nội dung của bạn chứa hình ảnh và/hoặc video.',
		fail: 'Hãy thêm hình ảnh hoặc video vào nội dung.',
		skip: 'Không có nội dung để phân tích.',
	},
};
