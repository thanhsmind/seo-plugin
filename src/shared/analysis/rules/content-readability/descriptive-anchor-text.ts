import type { SeoAnalysisRule } from '../../types';
import { findGenericAnchorTexts } from '../../utils';

export const descriptiveAnchorTextRule: SeoAnalysisRule = {
    id: 'descriptive-anchor-text',
    group: 'content-readability',
    name: 'Văn bản neo mô tả',
    description: 'Tránh sử dụng các từ chung chung như "tại đây", "xem thêm" làm nội dung link',
    check: (context) => {
        const { content } = context;

        if (!content) {
            return { status: 'skip' };
        }

        const genericTexts = findGenericAnchorTexts(content);

        return {
            status: genericTexts.length > 0 ? 'fail' : 'pass',
            value: { highlights: genericTexts },
        };
    },
    messages: {
        pass: 'Các liên kết của bạn sử dụng văn bản neo mang tính mô tả.',
        fail: 'Một số liên kết sử dụng từ chung chung như "tại đây", "xem thêm". Hãy thay bằng từ mô tả rõ nội dung trang đích.',
        skip: 'Không tìm thấy liên kết để phân tích.',
    },
};
