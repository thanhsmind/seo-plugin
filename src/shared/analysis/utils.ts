/**
 * Analysis Utility Functions
 */

import { stripHtml, stripMarkdown } from '../utils';

/**
 * Parse comma-separated keywords
 * First keyword is primary, rest are secondary
 */
export function parseKeywords(focusKeyphrase: string): { primary: string; secondary: string[] } {
	if (!focusKeyphrase) {
		return { primary: '', secondary: [] };
	}

	const keywords = focusKeyphrase.split(',').map(k => k.trim()).filter(Boolean);

	return {
		primary: keywords[0] || '',
		secondary: keywords.slice(1),
	};
}

/**
 * Normalize text for comparison (lowercase, trim whitespace)
 */
export function normalize(text: string): string {
	if (!text) return '';
	return text.toLowerCase().trim();
}

/**
 * Get words array from text
 */
export function getWords(text: string): string[] {
	if (!text) return [];
	const clean = stripMarkdown(stripHtml(text));
	return clean.split(/\s+/).filter(Boolean);
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
	return getWords(text).length;
}

/**
 * Slugify text (convert to URL-friendly format)
 */
export function slugify(text: string): string {
	if (!text) return '';
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'd')
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

/**
 * Extract headings (H2-H6) from HTML and Markdown content
 */
export function extractHeadings(content: string): { level: number; text: string }[] {
	if (!content) return [];

	const headings: { level: number; text: string }[] = [];

	// HTML headings
	const htmlRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gi;
	let match: RegExpExecArray | null;

	while ((match = htmlRegex.exec(content)) !== null) {
		headings.push({
			level: parseInt(match[1] || '2', 10),
			text: stripHtml(match[2] || ''),
		});
	}

	// Markdown headings
	const mdRegex = /^(#{2,6})\s+(\S.*)$/gm;
	while ((match = mdRegex.exec(content)) !== null) {
		headings.push({
			level: (match[1] || '##').length,
			text: (match[2] || '').trim(),
		});
	}

	return headings;
}

/**
 * Extract paragraphs from HTML and Markdown content
 */
export function extractParagraphs(content: string): string[] {
	if (!content) return [];

	// If it's HTML, we want to split by block-level elements
	if (content.includes('<') && content.includes('>')) {
		// Replace common block tags with a marker for splitting
		const blockTags = ['p', 'div', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
		let tempContent = content;

		for (const tag of blockTags) {
			const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gis');
			tempContent = tempContent.replace(regex, (_, p1) => `\n\n${p1}\n\n`);
		}

		const blocks = stripHtml(tempContent)
			.split(/\n\s*\n/)
			.map(p => p.trim())
			.filter(Boolean);

		return blocks;
	}

	// Markdown or plain text
	const clean = stripHtml(content);
	const blocks = clean.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

	// Filter out headings for Markdown
	return blocks.filter(block => !block.startsWith('#'));
}

/**
 * Extract sentences from text
 */
export function extractSentences(content: string): string[] {
	if (!content) return [];

	const clean = stripMarkdown(stripHtml(content));
	// Split by sentence-ending punctuation followed by space or end
	const sentences = clean
		.split(/[.!?]+\s+|[.!?]+$/)
		.map(s => s.trim())
		.filter(Boolean);

	return sentences;
}

/**
 * Detect Table of Contents in content
 */
export function detectTableOfContents(content: string): boolean {
	if (!content) return false;

	const tocPatterns = [
		/<nav[^>]*class="[^"]*toc[^"]*"[^>]*>/i,
		/<div[^>]*class="[^"]*table-of-contents[^"]*"[^>]*>/i,
		/<ul[^>]*class="[^"]*toc[^"]*"[^>]*>/i,
		/\[toc\]/i,
		/\[\[toc\]\]/i,
		/\{:toc\}/i,
		/## (mục lục|table of contents|nội dung|contents)/i,
	];

	return tocPatterns.some(pattern => pattern.test(content));
}

/**
 * Extract images from content
 */
export function extractImages(content: string): string[] {
	if (!content) return [];

	const images: string[] = [];

	// HTML images
	const htmlImgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
	let match: RegExpExecArray | null;

	while ((match = htmlImgRegex.exec(content)) !== null) {
		if (match[1]) images.push(match[1]);
	}

	// Markdown images
	const mdImgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
	while ((match = mdImgRegex.exec(content)) !== null) {
		if (match[1]) images.push(match[1]);
	}

	return images;
}

/**
 * Extract videos from content
 */
export function extractVideos(content: string): string[] {
	if (!content) return [];

	const videos: string[] = [];

	// HTML video elements
	const videoRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>/gi;
	let match: RegExpExecArray | null;

	while ((match = videoRegex.exec(content)) !== null) {
		if (match[1]) videos.push(match[1]);
	}

	// iframe embeds (YouTube, Vimeo, etc.)
	const iframeRegex = /<iframe[^>]*src=["']([^"']*(?:youtube|vimeo|dailymotion)[^"']*)["'][^>]*>/gi;
	while ((match = iframeRegex.exec(content)) !== null) {
		if (match[1]) videos.push(match[1]);
	}

	return videos;
}

/**
 * Check if title contains a number
 */
export function hasNumberInTitle(title: string): boolean {
	if (!title) return false;
	return /\d+/.test(title);
}

/**
 * Count keyword occurrences in text
 */
export function countKeywordOccurrences(text: string, keyword: string): number {
	if (!text || !keyword) return 0;

	const normalizedText = normalize(text);
	const normalizedKeyword = normalize(keyword);

	if (!normalizedKeyword) return 0;

	let count = 0;
	let pos = 0;

	while ((pos = normalizedText.indexOf(normalizedKeyword, pos)) !== -1) {
		count++;
		pos += normalizedKeyword.length;
	}

	return count;
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(text: string, keyword: string): { density: number; occurrences: number } {
	const wordCount = countWords(text);
	if (wordCount === 0 || !keyword) {
		return { density: 0, occurrences: 0 };
	}

	const occurrences = countKeywordOccurrences(stripMarkdown(stripHtml(text)), keyword);
	const keywordWords = getWords(keyword).length;
	const density = (occurrences * keywordWords / wordCount) * 100;

	return { density, occurrences };
}

/**
 * Finds transition words in Vietnamese text
 */
export function findTransitionWords(text: string): string[] {
	if (!text) return [];
	const transitionWords = [
		'tuy nhiên', 'nhưng', 'vì vậy', 'do đó', 'ngoài ra', 'hơn nữa',
		'tóm lại', 'ví dụ', 'hơn thế nữa', 'cụ thể là', 'ngược lại', 'đồng thời',
		'mặc dù', 'cho nên', 'thậm chí', 'đặc biệt là', 'nói cách khác',
		'tuy vậy', 'tuy thế', 'tổng kết lại', 'thêm vào đó', 'kết luận là',
		'mặt khác', 'bên cạnh đó', 'về cơ bản', 'nói tóm lại'
	];

	const normalizedText = text.toLowerCase();
	const found: string[] = [];

	for (const word of transitionWords) {
		const regex = new RegExp(`\\b${word}\\b`, 'gi');
		const matches = normalizedText.match(regex);
		if (matches) {
			found.push(...matches);
		}
	}

	return found;
}

/**
 * Counts transition words in Vietnamese text
 */
export function countTransitionWords(text: string): number {
	return findTransitionWords(text).length;
}

/**
 * Checks if any heading contains a question (ends with or contains question words)
 */
export function hasQuestionInHeadings(content: string): boolean {
	const headings = extractHeadings(content);
	const questionWords = [
		'làm sao', 'tại sao', 'thế nào', 'bao giờ', 'đâu là', 'ai là',
		'đâu', 'nào', 'mấy', 'bao nhiêu', 'ai', 'gì', 'chưa', 'không'
	];

	return headings.some(h => {
		const text = h.text.toLowerCase();
		// Look for '?' or question words at the end or as isolated words
		const hasQuestionWord = questionWords.some(q => {
			const regex = new RegExp(`\\b${q}\\b`, 'gi');
			return regex.test(text);
		});
		return text.endsWith('?') || hasQuestionWord;
	});
}

/**
 * Finds all generic anchor text in HTML or Markdown like "tại đây", "click here"
 */
export function findGenericAnchorTexts(html: string): string[] {
	if (!html) return [];
	const genericWords = ['tại đây', 'xem thêm', 'click here', 'truy cập', 'đường dẫn', 'link'];
	const found: string[] = [];

	const linkTextRegex = /<a[^>]*>(.*?)<\/a>/gi;
	let match;

	while ((match = linkTextRegex.exec(html)) !== null) {
		const rawText = match[1];
		if (rawText) {
			const text = stripHtml(rawText).trim();
			if (genericWords.includes(text.toLowerCase())) {
				found.push(text);
			}
		}
	}

	// Support Markdown links [text](url)
	const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	while ((match = mdLinkRegex.exec(html)) !== null) {
		const rawText = match[1];
		if (rawText) {
			const text = rawText.trim();
			if (genericWords.includes(text.toLowerCase())) {
				found.push(text);
			}
		}
	}

	return found;
}

/**
 * Checks if HTML contains generic anchor text
 */
export function hasGenericAnchorText(html: string): boolean {
	return findGenericAnchorTexts(html).length > 0;
}

/**
 * Checks if keyword is in the last N% of the text
 */
export function isKeywordInSuffix(text: string, keyword: string, percentage: number = 10): boolean {
	if (!text || !keyword) return false;
	const lengthToCheck = Math.ceil(text.length * (percentage / 100));
	const suffix = text.substring(text.length - lengthToCheck).toLowerCase();
	return suffix.includes(keyword.toLowerCase());
}

/**
 * Checks if content contains video elements or embeds
 */
export function hasVideoContent(html: string): boolean {
	return extractVideos(html).length > 0;
}
