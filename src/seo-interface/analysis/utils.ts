import type { AnalysisResult } from './types';
import { keywordRules, seoRules } from '../../shared/rulesets';
import {
	calculateDensity,
	countWords,
	extractImageAltText,
	extractLinks,
	extractSubheadings,
	hasNumber,
	isKeywordInPrefix,
	normalizeContent,
	normalizeSlug,
	stripHtml,
} from '../../shared/utils';

interface AnalysisInput {
	focusKeyphrase: string;
	title?: string;
	description?: string;
	slug?: string | null;
	combinedContent?: string;
}

export function analyzeTitle(input: AnalysisInput): AnalysisResult {
	if (!input.focusKeyphrase) {
		return {
			id: 'title',
			title: 'SEO Title',
			status: 'neutral',
			message: 'Nhập từ khóa trọng tâm trước',
		};
	}

	if (!input.title) {
		return {
			id: 'title',
			title: 'SEO Title',
			status: 'error',
			message: 'Vui lòng nhập tiêu đề SEO',
		};
	}

	const titleLength = input.title.length;
	const hasKeyphrase = input.title.toLowerCase().includes(input.focusKeyphrase.toLowerCase());
	const isLengthGood = titleLength >= seoRules.title.minLength && titleLength <= seoRules.title.maxLength;
	const startsWithKeyphrase = input.title.toLowerCase().startsWith(input.focusKeyphrase.toLowerCase());
	const containsNumber = hasNumber(input.title);

	if (!hasKeyphrase) {
		return {
			id: 'title',
			title: 'SEO Title',
			status: 'error',
			message: 'Từ khóa trọng tâm không xuất hiện trong tiêu đề SEO',
		};
	}

	if (!isLengthGood) {
		return {
			id: 'title',
			title: 'SEO Title',
			status: 'warning',
			message: `Độ dài tiêu đề (${titleLength}) chưa tối ưu. Khuyến nghị: ${seoRules.title.minLength}-${seoRules.title.maxLength} ký tự.`,
		};
	}

	if (!startsWithKeyphrase) {
		// RankMath prefers keyword at the beginning
		const keywordPos = input.title.toLowerCase().indexOf(input.focusKeyphrase.toLowerCase());
		if (keywordPos > titleLength / 2) {
			return {
				id: 'title',
				title: 'SEO Title',
				status: 'warning',
				message: 'Từ khóa nên xuất hiện ở nửa đầu tiêu đề để có kết quả tốt nhất',
			};
		}
	}

	if (!containsNumber) {
		return {
			id: 'title',
			title: 'SEO Title',
			status: 'warning', // Power words alternative in RankMath
			message: 'Tiêu đề của bạn không chứa con số (ví dụ: "Top 10..."). Các bài viết có con số thường có CTR cao hơn.',
		};
	}

	return {
		id: 'title',
		title: 'SEO Title',
		status: 'good',
		message: 'Tiêu đề SEO của bạn đã được tối ưu tốt',
		details: { length: titleLength, hasKeyphrase, startsWithKeyphrase, containsNumber },
	};
}

export function analyzeDescription(input: AnalysisInput): AnalysisResult {
	if (!input.focusKeyphrase) {
		return {
			id: 'description',
			title: 'Meta Description',
			status: 'neutral',
			message: 'Nhập từ khóa trọng tâm trước',
		};
	}

	if (!input.description) {
		return {
			id: 'description',
			title: 'Meta Description',
			status: 'error',
			message: 'Vui lòng nhập mô tả meta',
		};
	}

	const length = input.description.length;
	const hasKeyphrase = input.description.toLowerCase().includes(input.focusKeyphrase.toLowerCase());
	const isLengthGood = length >= seoRules.meta_description.minLength && length <= seoRules.meta_description.maxLength;

	if (!hasKeyphrase) {
		return {
			id: 'description',
			title: 'Meta Description',
			status: 'warning',
			message: 'Từ khóa trọng tâm không xuất hiện trong mô tả meta',
		};
	}

	if (!isLengthGood) {
		return {
			id: 'description',
			title: 'Meta Description',
			status: 'warning',
			message: `Độ dài mô tả (${length}) chưa tối ưu. Khuyến nghị: ${seoRules.meta_description.minLength}-${seoRules.meta_description.maxLength} ký tự.`,
		};
	}

	return {
		id: 'description',
		title: 'Meta Description',
		status: 'good',
		message: 'Mô tả meta đã chứa từ khóa và có độ dài lý tưởng',
		details: { length, hasKeyphrase },
	};
}

export function analyzeSlug(input: AnalysisInput): AnalysisResult {
	if (!input.focusKeyphrase || !input.slug) {
		return {
			id: 'slug',
			title: 'URL Slug',
			status: 'neutral',
			message: 'Cần từ khóa và slug để phân tích',
		};
	}

	const normalizedSlug = normalizeSlug(input.slug);
	const normalizedKeyphrase = normalizeSlug(input.focusKeyphrase);
	const hasKeyphrase = normalizedSlug.includes(normalizedKeyphrase);
	const length = input.slug.length;

	if (!hasKeyphrase) {
		return {
			id: 'slug',
			title: 'URL Slug',
			status: 'warning',
			message: 'Từ khóa không xuất hiện trong URL (Slug)',
		};
	}

	if (length > seoRules.slug.maxLength) {
		return {
			id: 'slug',
			title: 'URL Slug',
			status: 'warning',
			message: `URL quá dài (${length} ký tự). Khuyến nghị không quá ${seoRules.slug.maxLength} ký tự.`,
		};
	}

	return {
		id: 'slug',
		title: 'URL Slug',
		status: 'good',
		message: 'URL đã được tối ưu',
		details: { length, hasKeyphrase },
	};
}

export function analyzeContent(input: AnalysisInput): AnalysisResult {
	if (!input.focusKeyphrase || !input.combinedContent) {
		return {
			id: 'content',
			title: 'Content',
			status: 'neutral',
			message: 'Cần nội dung để phân tích',
		};
	}

	const cleanContent = normalizeContent(input.combinedContent);
	const wordCount = countWords(cleanContent);
	const density = calculateDensity(cleanContent, input.focusKeyphrase);
	const inFirst10 = isKeywordInPrefix(cleanContent, input.focusKeyphrase, 10);
	const links = extractLinks(input.combinedContent);

	// Paragraph Analysis (Basic check for long text blocks)
	const paragraphs = input.combinedContent.split(/\n\s*\n/);
	const longParagraphs = paragraphs.filter(p => countWords(stripHtml(p)) > 120);

	// Table of Contents Check
	const hasTOC = /toc|table-of-contents|mục lục|nội dung chính/i.test(input.combinedContent) ||
		(extractLinks(input.combinedContent).internal.some(link => link.startsWith('#')));

	if (wordCount < 50) {
		return {
			id: 'content',
			title: 'Nội dung',
			status: 'error',
			message: 'Nội dung quá ngắn để phân tích SEO',
		};
	}

	if (density === 0) {
		return {
			id: 'content',
			title: 'Nội dung',
			status: 'error',
			message: 'Từ khóa trọng tâm không xuất hiện trong nội dung',
		};
	}

	if (!inFirst10) {
		return {
			id: 'content',
			title: 'Nội dung',
			status: 'warning',
			message: 'Từ khóa không xuất hiện trong 10% đầu tiên của nội dung',
		};
	}

	if (density < keywordRules.density.min || density > keywordRules.density.max) {
		return {
			id: 'content',
			title: 'Nội dung',
			status: 'warning',
			message: `Mật độ từ khóa (${density.toFixed(1)}%) chưa lý tưởng (Khuyến nghị: ${keywordRules.density.min}% - ${keywordRules.density.max}%)`,
		};
	}

	if (links.external.length === 0) {
		return {
			id: 'content',
			title: 'Liên kết',
			status: 'warning',
			message: 'Bài viết chưa có liên kết ra bên ngoài (Outbound links)',
		};
	}

	if (links.internal.length === 0) {
		return {
			id: 'content',
			title: 'Liên kết',
			status: 'warning',
			message: 'Chưa có liên kết nội bộ (Internal links)',
		};
	}

	if (longParagraphs.length > 0) {
		return {
			id: 'content',
			title: 'Cấu trúc',
			status: 'warning',
			message: 'Có một số đoạn văn quá dài (> 120 từ). Hãy chia nhỏ để dễ đọc hơn.',
		};
	}

	if (!hasTOC && wordCount > 1000) {
		return {
			id: 'content',
			title: 'Cấu trúc',
			status: 'warning',
			message: 'Bài viết dài (>1000 từ) nên có Mục lục (Table of Contents)',
		};
	}

	let lengthMsg = wordCount >= seoRules.content.maxLength ? 'Độ dài bài viết tuyệt vời!' :
		wordCount >= seoRules.content.minLength ? 'Độ dài bài viết khá tốt.' :
			'Nội dung hơi ngắn (khuyến nghị trên 600 từ).';

	return {
		id: 'content',
		title: 'Nội dung',
		status: wordCount >= seoRules.content.minLength ? 'good' : 'warning',
		message: `${lengthMsg} (Tổng cộng: ${wordCount} từ).`,
		details: { wordCount, density, inFirst10, internalLinks: links.internal.length, externalLinks: links.external.length, hasTOC },
	};
}

export function analyzeImageAltText(input: AnalysisInput): AnalysisResult {
	if (!input.focusKeyphrase || !input.combinedContent) {
		return {
			id: 'image_alt',
			title: 'Image Alt Text',
			status: 'neutral',
			message: 'Cần từ khóa và nội dung để đếm ảnh',
		};
	}

	const altTexts = extractImageAltText(input.combinedContent);

	if (altTexts.length === 0) {
		return {
			id: 'image_alt',
			title: 'Ảnh',
			status: 'warning',
			message: 'Bài viết không có hình ảnh. Nên có ít nhất 1-3 ảnh.',
		};
	}

	const keyphraseInAlt = altTexts.some((alt) =>
		alt.toLowerCase().includes(input.focusKeyphrase.toLowerCase()),
	);

	if (!keyphraseInAlt) {
		return {
			id: 'image_alt',
			title: 'Ảnh',
			status: 'warning',
			message: 'Các thẻ Alt của ảnh chưa chứa từ khóa trọng tâm',
		};
	}

	return {
		id: 'image_alt',
		title: 'Ảnh',
		status: 'good',
		message: `Đã tìm thấy ${altTexts.length} ảnh và có từ khóa trong thẻ Alt`,
		details: { imageCount: altTexts.length },
	};
}

export function analyzeSubheadings(input: AnalysisInput): AnalysisResult {
	if (!input.focusKeyphrase || !input.combinedContent) {
		return {
			id: 'subheadings',
			title: 'Subheadings',
			status: 'neutral',
			message: 'Cần từ khóa và nội dung để quét thẻ tiêu đề phụ',
		};
	}

	const subheadings = extractSubheadings(input.combinedContent);

	if (subheadings.length === 0) {
		return {
			id: 'subheadings',
			title: 'Tiêu đề phụ',
			status: 'warning',
			message: 'Không tìm thấy các thẻ H2-H6 trong nội dung',
		};
	}

	const keyphraseInSubheadings = subheadings.some((heading) =>
		heading.toLowerCase().includes(input.focusKeyphrase.toLowerCase()),
	);

	if (!keyphraseInSubheadings) {
		return {
			id: 'subheadings',
			title: 'Tiêu đề phụ',
			status: 'warning',
			message: 'Các tiêu đề phụ (H2-H6) chưa chứa từ khóa trọng tâm',
		};
	}

	return {
		id: 'subheadings',
		title: 'Tiêu đề phụ',
		status: 'good',
		message: 'Từ khóa đã xuất hiện trong tiêu đề phụ',
		details: { subheadingCount: subheadings.length },
	};
}
