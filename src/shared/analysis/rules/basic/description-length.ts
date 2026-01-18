import type { SeoAnalysisRule } from '../../types';

const MIN_LENGTH = 120;
const MAX_LENGTH = 160;

export const descriptionLengthRule: SeoAnalysisRule = {
    id: 'description-length',
    group: 'basic',
    name: 'Độ dài Mô tả Meta',
    description: 'Mô tả meta nên nằm trong khoảng 120-160 ký tự',
    check: (context) => {
        const { metaDescription } = context;

        if (!metaDescription) {
            return { status: 'skip' };
        }

        const length = metaDescription.length;
        const isGood = length >= MIN_LENGTH && length <= MAX_LENGTH;

        return {
            status: isGood ? 'pass' : 'fail',
            value: { length },
        };
    },
    messages: {
        pass: (v) => `Mô tả meta dài ${v?.length ?? 0} ký tự. Rất tốt!`,
        fail: (v) => (v?.length ?? 0) < MIN_LENGTH
            ? `Mô tả meta quá ngắn (${v?.length ?? 0} ký tự). Nên ít nhất ${MIN_LENGTH} ký tự.`
            : `Mô tả meta quá dài (${v?.length ?? 0} ký tự). Nên dưới ${MAX_LENGTH} ký tự.`,
        skip: 'Không có mô tả meta để phân tích.',
    },
};
