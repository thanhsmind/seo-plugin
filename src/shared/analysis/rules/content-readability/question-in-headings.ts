import type { SeoAnalysisRule } from '../../types';
import { extractHeadings } from '../../utils';

export const questionInHeadingsRule: SeoAnalysisRule = {
    id: 'question-in-headings',
    group: 'content-readability',
    name: 'Câu hỏi trong Tiêu đề phụ',
    description: 'Sử dụng câu hỏi giúp bài viết dễ lọt vào Featured Snippet (Top 0)',
    check: (context) => {
        const { content } = context;

        if (!content) {
            return { status: 'skip' };
        }

        const headings = extractHeadings(content);
        const questionWords = ['làm sao', 'tại sao', 'thế nào', 'bao giờ', 'đâu là', 'ai là'];

        if (headings.length === 0) {
            return { status: 'skip' };
        }

        const hasQuestion = headings.some(h => {
            const text = h.text.toLowerCase();
            return text.endsWith('?') || questionWords.some(q => text.includes(q));
        });

        return {
            status: hasQuestion ? 'pass' : 'fail',
        };
    },
    messages: {
        pass: 'Tuyệt vời! Bạn có câu hỏi trong tiêu đề phụ, giúp tối ưu cho Featured Snippet.',
        fail: 'Nên có ít nhất một tiêu đề phụ dạng câu hỏi (Ví dụ: "Tại sao...?", "Làm thế nào...?") để tăng khả năng lên Top 0.',
        skip: 'Không tìm thấy tiêu đề phụ để phân tích.',
    },
};
