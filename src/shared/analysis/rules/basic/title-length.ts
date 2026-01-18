import type { SeoAnalysisRule } from '../../types';

const MIN_LENGTH = 30;
const MAX_LENGTH = 60;

export const titleLengthRule: SeoAnalysisRule = {
    id: 'title-length',
    group: 'basic',
    name: 'Độ dài Tiêu đề',
    description: 'Tiêu đề nên nằm trong khoảng 30-60 ký tự',
    check: (context) => {
        const { title } = context;

        if (!title) {
            return { status: 'skip' };
        }

        const length = title.length;
        const isGood = length >= MIN_LENGTH && length <= MAX_LENGTH;

        return {
            status: isGood ? 'pass' : 'fail',
            value: { length },
        };
    },
    messages: {
        pass: (v) => `Tiêu đề dài ${v?.length ?? 0} ký tự. Độ dài lý tưởng!`,
        fail: (v) => (v?.length ?? 0) < MIN_LENGTH
            ? `Tiêu đề quá ngắn (${v?.length ?? 0} ký tự). Nên ít nhất ${MIN_LENGTH} ký tự.`
            : `Tiêu đề quá dài (${v?.length ?? 0} ký tự). Nên dưới ${MAX_LENGTH} ký tự để tránh bị cắt trên Google.`,
        skip: 'Không có tiêu đề để phân tích.',
    },
};
