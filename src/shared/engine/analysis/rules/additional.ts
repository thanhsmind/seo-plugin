import type { SeoRule } from '../types';
import { keywordInText, keywordDensity, parseKeywords } from '../../keywords';
import { normalizeContent } from '../../../utils';
import {
	extractSubheadings,
	extractImageAltTexts,
	extractLinks,
	isExternalLink,
	isInternalLink,
} from '../../html';

const keywordInSubheadingsRule: SeoRule = {
	id: 'keyword-in-subheadings',
	group: 'additional',
	name: 'Từ khóa trong tiêu đề phụ',
	description: 'Kiểm tra xem từ khóa có xuất hiện trong ít nhất một tiêu đề phụ (H2-H6) không',
	check: (context) => {
		const { content, focusKeyphrase } = context;
		if (!content || !focusKeyphrase) {
			return { pass: false, data: { subheadingCount: 0 } };
		}

		const { primary } = parseKeywords(focusKeyphrase);
		const subheadings = extractSubheadings(content);

		if (subheadings.length === 0) {
			return { pass: false, data: { subheadingCount: 0, hasSubheadings: false } };
		}

		const hasKeyword = subheadings.some((heading) => keywordInText(heading, primary));

		return {
			pass: hasKeyword,
			data: {
				subheadingCount: subheadings.length,
				hasSubheadings: true,
				hasKeyword,
			},
		};
	},
	messages: {
		pass: 'Từ khóa xuất hiện trong tiêu đề phụ.',
		fail: (data) => {
			if (!data.hasSubheadings) {
				return 'Nội dung không có tiêu đề phụ (H2-H6). Hãy thêm tiêu đề phụ chứa từ khóa.';
			}
			return `Từ khóa không xuất hiện trong ${data.subheadingCount} tiêu đề phụ. Hãy thêm từ khóa vào ít nhất một tiêu đề phụ.`;
		},
	},
};

const keywordInImageAltRule: SeoRule = {
	id: 'keyword-in-image-alt',
	group: 'additional',
	name: 'Từ khóa trong alt hình ảnh',
	description: 'Kiểm tra xem từ khóa có xuất hiện trong thuộc tính alt của ít nhất một hình ảnh không',
	check: (context) => {
		const { content, focusKeyphrase } = context;
		if (!content || !focusKeyphrase) {
			return { pass: false, data: { imageCount: 0 } };
		}

		const { primary } = parseKeywords(focusKeyphrase);
		const altTexts = extractImageAltTexts(content);

		if (altTexts.length === 0) {
			return { pass: false, data: { imageCount: 0, hasImages: false } };
		}

		const hasKeyword = altTexts.some((alt) => keywordInText(alt, primary));

		return {
			pass: hasKeyword,
			data: {
				imageCount: altTexts.length,
				hasImages: true,
				hasKeyword,
			},
		};
	},
	messages: {
		pass: 'Từ khóa xuất hiện trong alt của hình ảnh.',
		fail: (data) => {
			if (!data.hasImages) {
				return 'Nội dung không có hình ảnh với alt text. Hãy thêm hình ảnh với alt chứa từ khóa.';
			}
			return `Từ khóa không xuất hiện trong alt của ${data.imageCount} hình ảnh. Hãy thêm từ khóa vào alt của ít nhất một hình ảnh.`;
		},
	},
};

const keywordDensityRule: SeoRule = {
	id: 'keyword-density',
	group: 'additional',
	name: 'Mật độ từ khóa',
	description: 'Kiểm tra mật độ từ khóa trong nội dung (khuyến nghị: 0.5% - 2.5%)',
	check: (context) => {
		const { content, focusKeyphrase } = context;
		if (!content || !focusKeyphrase) {
			return { pass: false, data: { density: 0, occurrences: 0 } };
		}

		const { primary } = parseKeywords(focusKeyphrase);
		const normalizedContent = normalizeContent(content);
		const { density, occurrences } = keywordDensity(normalizedContent, primary);

		const isOptimal = density >= 0.5 && density <= 2.5;
		const isTooLow = density < 0.5;
		const isTooHigh = density > 2.5;

		return {
			pass: isOptimal,
			data: {
				density: Math.round(density * 100) / 100,
				occurrences,
				isOptimal,
				isTooLow,
				isTooHigh,
			},
		};
	},
	messages: {
		pass: (data) =>
			`Mật độ từ khóa tốt: ${data.density}% (${data.occurrences} lần xuất hiện).`,
		fail: (data) => {
			if (data.isTooLow) {
				return `Mật độ từ khóa quá thấp: ${data.density}% (${data.occurrences} lần). Khuyến nghị: 0.5% - 2.5%.`;
			}
			return `Mật độ từ khóa quá cao: ${data.density}% (${data.occurrences} lần). Khuyến nghị: 0.5% - 2.5%.`;
		},
		warning: (data) =>
			`Mật độ từ khóa: ${data.density}% (${data.occurrences} lần). Khuyến nghị: 0.5% - 2.5%.`,
	},
};

const urlLengthRule: SeoRule = {
	id: 'url-length',
	group: 'additional',
	name: 'Độ dài URL',
	description: 'Kiểm tra độ dài URL/slug (khuyến nghị: dưới 75 ký tự)',
	check: (context) => {
		const { url, slug } = context;
		const urlToCheck = slug || url || '';

		if (!urlToCheck) {
			return { pass: true, data: { length: 0, hasUrl: false } };
		}

		const length = urlToCheck.length;
		const isOptimal = length <= 75;

		return {
			pass: isOptimal,
			data: {
				length,
				hasUrl: true,
				isOptimal,
			},
		};
	},
	messages: {
		pass: (data) => {
			if (!data.hasUrl) {
				return 'Không có URL/slug để kiểm tra.';
			}
			return `Độ dài URL tốt: ${data.length} ký tự.`;
		},
		fail: (data) =>
			`URL quá dài: ${data.length} ký tự. Khuyến nghị: dưới 75 ký tự.`,
	},
};

const externalLinksRule: SeoRule = {
	id: 'external-links',
	group: 'additional',
	name: 'Liên kết ngoài',
	description: 'Kiểm tra xem nội dung có liên kết đến các trang web bên ngoài không',
	check: (context) => {
		const { content, url } = context;
		if (!content) {
			return { pass: false, data: { externalCount: 0, dofollowCount: 0 } };
		}

		const links = extractLinks(content);
		const externalLinks = links.filter((link) => isExternalLink(link.href, url));
		const dofollowLinks = externalLinks.filter((link) => !link.isNofollow);

		const hasExternal = externalLinks.length > 0;
		const hasDofollow = dofollowLinks.length > 0;

		return {
			pass: hasExternal,
			data: {
				externalCount: externalLinks.length,
				dofollowCount: dofollowLinks.length,
				hasExternal,
				hasDofollow,
			},
		};
	},
	messages: {
		pass: (data) => {
			if (data.hasDofollow) {
				return `Có ${data.externalCount} liên kết ngoài (${data.dofollowCount} dofollow).`;
			}
			return `Có ${data.externalCount} liên kết ngoài (tất cả đều nofollow).`;
		},
		fail: 'Nội dung không có liên kết ngoài. Hãy thêm liên kết đến các nguồn uy tín bên ngoài.',
		warning: (data) =>
			`Có ${data.externalCount} liên kết ngoài nhưng không có liên kết dofollow.`,
	},
};

const internalLinksRule: SeoRule = {
	id: 'internal-links',
	group: 'additional',
	name: 'Liên kết nội bộ',
	description: 'Kiểm tra xem nội dung có liên kết đến các trang nội bộ không',
	check: (context) => {
		const { content, url } = context;
		if (!content) {
			return { pass: false, data: { internalCount: 0 } };
		}

		const links = extractLinks(content);
		const internalLinks = links.filter((link) => isInternalLink(link.href, url));

		const hasInternal = internalLinks.length > 0;

		return {
			pass: hasInternal,
			data: {
				internalCount: internalLinks.length,
				hasInternal,
			},
		};
	},
	messages: {
		pass: (data) => `Có ${data.internalCount} liên kết nội bộ.`,
		fail: 'Nội dung không có liên kết nội bộ. Hãy thêm liên kết đến các bài viết liên quan trong website.',
	},
};

export const additionalRules: SeoRule[] = [
	keywordInSubheadingsRule,
	keywordInImageAltRule,
	keywordDensityRule,
	urlLengthRule,
	externalLinksRule,
	internalLinksRule,
];
