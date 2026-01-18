import type { SeoAnalysisRule } from '../../types';
import { findTransitionWords, countWords } from '../../utils';
import { normalizeContent } from '../../../utils';

export const transitionWordsRule: SeoAnalysisRule = {
    id: 'transition-words',
    group: 'content-readability',
    name: 'Sử dụng từ nối',
    description: 'Sử dụng các từ nối (Tuy nhiên, Vì vậy,...) giúp bài viết lưu loát hơn',
    check: (context) => {
        const { content } = context;

        if (!content) {
            return { status: 'skip' };
        }

        const cleanContent = normalizeContent(content);
        const wordCount = countWords(cleanContent);
        const transitions = findTransitionWords(cleanContent);
        const transitionCount = transitions.length;

        if (wordCount < 200) {
            return { status: 'skip' };
        }

        // Aim for at least 1 transition word per 200 words
        const ratio = (transitionCount / wordCount) * 100;
        const isGood = ratio >= 0.5;

        return {
            status: isGood ? 'pass' : 'fail',
            value: {
                transitionCount,
                wordCount,
                percentage: Math.round(ratio * 100) / 100,
                highlights: Array.from(new Set(transitions)).slice(0, 5), // Unique ones
            },
        };
    },
    messages: {
        pass: (v?: any) => `Rất tốt! Bạn đã sử dụng ${v?.transitionCount} từ nối (${v?.percentage}%).`,
        fail: (v?: any) => `Bài viết hơi khô khan (${v?.percentage}% từ nối). Hãy bổ sung các từ như "Tuy nhiên", "Vì vậy", "Ngoài ra" để bài viết lưu loát hơn.`,
        skip: 'Bài viết quá ngắn để phân tích tính lưu loát.',
    },
};
