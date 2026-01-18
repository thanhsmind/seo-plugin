import type { SeoAnalysisRule } from '../../types';
import { isKeywordInSuffix } from '../../utils';
import { normalizeContent } from '../../../utils';

export const keywordInEndRule: SeoAnalysisRule = {
    id: 'keyword-in-end',
    group: 'basic',
    name: 'Từ khóa ở phần Kết luận',
    description: 'Từ khóa chính nên xuất hiện lại ở 10% cuối cùng của nội dung',
    check: (context) => {
        const { content, focusKeyphrase } = context;

        if (!content || !focusKeyphrase) {
            return { status: 'skip' };
        }

        const cleanContent = normalizeContent(content);
        const hasKeyword = isKeywordInSuffix(cleanContent, focusKeyphrase, 10);

        return {
            status: hasKeyword ? 'pass' : 'fail',
            value: { highlights: hasKeyword ? [focusKeyphrase] : [] },
        };
    },
    messages: {
        pass: 'Đã nhắc lại từ khóa chính ở phần kết bài.',
        fail: 'Nên nhắc lại từ khóa chính trong đoạn kết bài để khẳng định lại chủ đề.',
        skip: 'Cần có nội dung và từ khóa để phân tích.',
    },
};
