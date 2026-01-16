import type { SeoRule, RuleResult } from '../types';
import { wordCount, averageSentenceLength } from '../../text';

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countHeadings(content: string, levels: number[]): number {
	let count = 0;
	for (const level of levels) {
		const htmlRegex = new RegExp(`<h${level}[^>]*>`, 'gi');
		const mdRegex = new RegExp(`^#{${level}}\\s+`, 'gm');
		count += (content.match(htmlRegex) || []).length;
		count += (content.match(mdRegex) || []).length;
	}
	return count;
}

function extractParagraphs(content: string): string[] {
	const htmlParagraphs = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
	if (htmlParagraphs.length > 0) {
		return htmlParagraphs.map((p) => stripHtml(p)).filter((p) => p.length > 0);
	}

	const plainText = stripHtml(content);
	return plainText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
}

function hasMedia(content: string): boolean {
	const imgHtml = /<img\s+[^>]*>/i.test(content);
	const imgMd = /!\[[^\]]*\]\([^)]+\)/.test(content);
	const video =
		/<video\s+[^>]*>/i.test(content) ||
		/<iframe[^>]*(?:youtube|vimeo)[^>]*>/i.test(content) ||
		/<embed[^>]*>/i.test(content);
	return imgHtml || imgMd || video;
}

function hasTocIndicators(content: string): boolean {
	const explicitToc =
		/<div[^>]*(?:class|id)="[^"]*toc[^"]*"[^>]*>/i.test(content) ||
		/<nav[^>]*(?:class|id)="[^"]*toc[^"]*"[^>]*>/i.test(content) ||
		/\[TOC\]/i.test(content) ||
		/<!--\s*toc\s*-->/i.test(content);
	if (explicitToc) return true;

	const h2Count = countHeadings(content, [2]);
	const h3Count = countHeadings(content, [3]);
	return h2Count >= 3 || (h2Count >= 2 && h3Count >= 2);
}

function countPassiveVoice(content: string): number {
	const text = stripHtml(content);
	const passivePatterns = /\b(được|bị)\s+\w+/gi;
	return (text.match(passivePatterns) || []).length;
}

export const contentReadabilityRules: SeoRule[] = [
	{
		id: 'table-of-contents',
		group: 'content-readability',
		name: 'Có mục lục',
		description: 'Kiểm tra xem nội dung có mục lục hoặc nhiều tiêu đề phụ không.',
		check: (context): RuleResult => {
			const { content } = context;
			if (!content) {
				return { pass: false, data: { hasToc: false, isShort: true } };
			}

			const words = wordCount(stripHtml(content));
			const isShort = words < 1000;

			if (isShort) {
				return { pass: true, data: { hasToc: false, isShort: true, wordCount: words, neutral: true } };
			}

			const hasToc = hasTocIndicators(content);
			return { pass: hasToc, data: { hasToc, isShort: false, wordCount: words } };
		},
		messages: {
			pass: (data) =>
				data.isShort
					? 'Nội dung ngắn, không cần mục lục.'
					: 'Nội dung có mục lục hoặc cấu trúc tiêu đề tốt.',
			fail: 'Nội dung dài nhưng thiếu mục lục. Cân nhắc thêm mục lục để cải thiện trải nghiệm đọc.',
		},
	},
	{
		id: 'short-paragraphs',
		group: 'content-readability',
		name: 'Đoạn văn ngắn',
		description: 'Kiểm tra xem các đoạn văn có dưới 150 từ trung bình không.',
		check: (context): RuleResult => {
			const { content } = context;
			if (!content) {
				return { pass: true, data: { avgWords: 0, paragraphCount: 0 } };
			}

			const paragraphs = extractParagraphs(content);
			if (paragraphs.length === 0) {
				return { pass: true, data: { avgWords: 0, paragraphCount: 0 } };
			}

			const totalWords = paragraphs.reduce((sum, p) => sum + wordCount(p), 0);
			const avgWords = Math.round(totalWords / paragraphs.length);

			return {
				pass: avgWords <= 150,
				data: { avgWords, paragraphCount: paragraphs.length },
			};
		},
		messages: {
			pass: (data) => `Đoạn văn có độ dài hợp lý (trung bình ${data.avgWords} từ/đoạn).`,
			fail: (data) =>
				`Đoạn văn quá dài (trung bình ${data.avgWords} từ/đoạn). Nên chia nhỏ thành các đoạn dưới 150 từ.`,
		},
	},
	{
		id: 'has-media',
		group: 'content-readability',
		name: 'Có hình ảnh/video',
		description: 'Kiểm tra xem nội dung có hình ảnh hoặc video không.',
		check: (context): RuleResult => {
			const { content } = context;
			if (!content) {
				return { pass: false, data: { hasMedia: false } };
			}

			const hasMediaContent = hasMedia(content);
			return { pass: hasMediaContent, data: { hasMedia: hasMediaContent } };
		},
		messages: {
			pass: 'Nội dung có hình ảnh hoặc video, giúp tăng tương tác.',
			fail: 'Nội dung chưa có hình ảnh hoặc video. Cân nhắc thêm media để tăng tương tác và SEO.',
		},
	},
	{
		id: 'content-has-subheadings',
		group: 'content-readability',
		name: 'Nội dung có tiêu đề phụ',
		description: 'Kiểm tra xem nội dung có ít nhất 2 tiêu đề phụ (H2-H6) không.',
		check: (context): RuleResult => {
			const { content } = context;
			if (!content) {
				return { pass: false, data: { subheadingCount: 0 } };
			}

			const subheadingCount = countHeadings(content, [2, 3, 4, 5, 6]);
			return { pass: subheadingCount >= 2, data: { subheadingCount } };
		},
		messages: {
			pass: (data) => `Nội dung có ${data.subheadingCount} tiêu đề phụ, cấu trúc tốt.`,
			fail: (data) =>
				`Nội dung chỉ có ${data.subheadingCount} tiêu đề phụ. Cân nhắc thêm tiêu đề phụ (H2-H6) để cải thiện cấu trúc.`,
		},
	},
	{
		id: 'sentence-length',
		group: 'content-readability',
		name: 'Độ dài câu',
		description: 'Kiểm tra xem độ dài câu trung bình có dưới 20 từ không.',
		check: (context): RuleResult => {
			const { content } = context;
			if (!content) {
				return { pass: true, data: { avgSentenceLength: 0 } };
			}

			const plainText = stripHtml(content);
			const avgLength = Math.round(averageSentenceLength(plainText));

			return { pass: avgLength <= 20, data: { avgSentenceLength: avgLength } };
		},
		messages: {
			pass: (data) => `Độ dài câu trung bình là ${data.avgSentenceLength} từ, dễ đọc.`,
			fail: (data) =>
				`Độ dài câu trung bình là ${data.avgSentenceLength} từ, quá dài. Nên rút ngắn câu xuống dưới 20 từ.`,
		},
	},
	{
		id: 'passive-voice',
		group: 'content-readability',
		name: 'Câu bị động',
		description: 'Kiểm tra việc sử dụng câu bị động trong tiếng Việt (được/bị).',
		check: (context): RuleResult => {
			const { content } = context;
			if (!content) {
				return { pass: true, data: { passiveCount: 0, neutral: true } };
			}

			const passiveCount = countPassiveVoice(content);
			const plainText = stripHtml(content);
			const words = wordCount(plainText);
			const passiveRatio = words > 0 ? (passiveCount / words) * 100 : 0;

			return {
				pass: true,
				data: {
					passiveCount,
					passiveRatio: Math.round(passiveRatio * 100) / 100,
					neutral: true,
				},
			};
		},
		messages: {
			pass: (data) =>
				data.passiveCount === 0
					? 'Không phát hiện câu bị động (được/bị).'
					: `Phát hiện ${data.passiveCount} cấu trúc bị động (được/bị). Đây chỉ là thông tin tham khảo.`,
			fail: 'Có nhiều câu bị động. Cân nhắc sử dụng câu chủ động để văn bản mạch lạc hơn.',
		},
	},
];
