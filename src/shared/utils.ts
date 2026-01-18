/**
 * Utility functions for SEO analysis
 */

/**
 * Strips HTML tags from a string
 */
export function stripHtml(html: string): string {
	if (!html) return '';
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Strips basic Markdown syntax from a string
 */
export function stripMarkdown(md: string): string {
	if (!md) return '';
	return md
		.replace(/\*\*(.+?)\*\*/g, '$1') // Bold
		.replace(/\*(.+?)\*/g, '$1') // Italic
		.replace(/__(.+?)__/g, '$1') // Bold
		.replace(/_(.+?)_/g, '$1') // Italic
		.replace(/```(.+?)```/g, '$1') // Code blocks
		.replace(/`(.+?)`/g, '$1') // Inline code
		.replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
		.replace(/!\[(.+?)\]\(.+?\)/g, '$1') // Images
		.replace(/#{1,6}\s+(.+)/g, '$1') // Headings
		.replace(/\n+/g, ' ') // Newlines
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Normalizes content by stripping HTML and Markdown
 */
export function normalizeContent(content: string): string {
	if (!content) return '';
	return stripMarkdown(stripHtml(content));
}

/**
 * Counts words in a string, optimized for Vietnamese and other languages
 */
export function countWords(text: string): number {
	if (!text) return 0;
	// Improved word counting for Vietnamese (handling compound words by spaces)
	return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Counts case-insensitive occurrences of a substring in a string
 */
export function countOccurrences(text: string, sub: string): number {
	if (!text || !sub) return 0;

	const normalizedSub = sub.toLowerCase();

	if (normalizedSub.length === 0) return 0;

	// Use regex with escape for special characters to count occurrences
	const escapedSub = normalizedSub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(escapedSub, 'gi');
	return (text.match(regex) || []).length;
}

/**
 * Normalizes a slug for comparison
 */
export function normalizeSlug(slug: string): string {
	if (!slug) return '';
	return slug
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese accents
		.replace(/[đĐ]/g, 'd')
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

/**
 * Calculates keyword density as a percentage
 */
export function calculateDensity(text: string, keyword: string): number {
	const wordCount = countWords(text);
	if (wordCount === 0 || !keyword) return 0;

	const keywordCount = countOccurrences(text, keyword);
	return (keywordCount / wordCount) * 100;
}

/**
 * Extracts links and categorizes them as internal or external
 */
export function extractLinks(html: string, currentHost?: string): { internal: string[]; external: string[] } {
	const internal: string[] = [];
	const external: string[] = [];

	if (!html) return { internal, external };

	const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
	let match;

	while ((match = linkRegex.exec(html)) !== null) {
		const href = match[1];
		if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

		if (href.startsWith('/') || (currentHost && href.includes(currentHost))) {
			internal.push(href);
		} else if (href.startsWith('http')) {
			external.push(href);
		}
	}

	// Also support Markdown links [text](url)
	const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	while ((match = mdLinkRegex.exec(html)) !== null) {
		const href = match[2];
		if (!href || href.startsWith('#')) continue;

		if (href.startsWith('/') || (currentHost && href.includes(currentHost))) {
			internal.push(href);
		} else if (href.startsWith('http')) {
			external.push(href);
		}
	}

	return { internal, external };
}

/**
 * Checks if a string contains any numbers
 */
export function hasNumber(text: string): boolean {
	return /\d/.test(text);
}

/**
 * Checks if a string contains a focus keyword in the first N characters/percentage
 */
export function isKeywordInPrefix(text: string, keyword: string, percentage: number = 10): boolean {
	if (!text || !keyword) return false;
	const lengthToCheck = Math.ceil(text.length * (percentage / 100));
	const prefix = text.substring(0, lengthToCheck).toLowerCase();
	return prefix.includes(keyword.toLowerCase());
}

/**
 * Extracts all alt text attributes from HTML img tags
 */
export function extractImageAltText(html: string): string[] {
	if (!html) return [];

	const altTexts: string[] = [];
	const imgRegex = /<img[^>]*alt=["']([^"']*)["'][^>]*>/gi;
	let match: RegExpExecArray | null;

	while ((match = imgRegex.exec(html)) !== null) {
		const altText = match[1];

		if (altText && altText.trim()) {
			altTexts.push(altText.trim());
		}
	}

	// Also extract from Markdown images
	const mdImgRegex = /!\[([^\]]+)\]\([^)]+\)/g;

	while ((match = mdImgRegex.exec(html)) !== null) {
		const altText = match[1];

		if (altText && altText.trim()) {
			altTexts.push(altText.trim());
		}
	}

	return altTexts;
}

/**
 * Extracts subheadings from HTML and Markdown content
 */
export function extractSubheadings(content: string): string[] {
	if (!content) return [];

	const subheadings: string[] = [];

	// Extract HTML headings h2-h6
	const htmlHeadingRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gi;
	let match: RegExpExecArray | null;

	while ((match = htmlHeadingRegex.exec(content)) !== null) {
		const headingText = stripHtml(match[2] || '');

		if (headingText) {
			subheadings.push(headingText);
		}
	}

	// Extract Markdown headings (## to ######)
	const mdHeadingRegex = /^#{2,6}\s+(\S.*)$/gm;

	while ((match = mdHeadingRegex.exec(content)) !== null) {
		const headingText = match[1];

		if (headingText && headingText.trim()) {
			subheadings.push(headingText.trim());
		}
	}

	return subheadings;
}

/**
 * Truncates a string to a maximum length
 */
export function truncate(text: string | undefined | null, maxLength: number): string {
	if (!text) return '';
	return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/**
 * Counts transition words in Vietnamese text
 */
export function countTransitionWords(text: string): number {
	if (!text) return 0;
	const transitionWords = [
		'tuy nhiên', 'nhưng', 'vì vậy', 'do đó', 'ngoài ra', 'hơn nữa',
		'tóm lại', 'ví dụ', 'hơn thế nữa', 'cụ thể là', 'ngược lại', 'đồng thời',
		'mặc dù', 'cho nên', 'thậm chí', 'đặc biệt là', 'nói cách khác',
	];

	const normalizedText = text.toLowerCase();
	let count = 0;

	for (const word of transitionWords) {
		const regex = new RegExp(`\\b${word}\\b`, 'gi');
		count += (normalizedText.match(regex) || []).length;
	}

	return count;
}

/**
 * Checks if any heading contains a question (ends with or contains question words)
 */
export function hasQuestionInHeadings(content: string): boolean {
	const subheadings = extractSubheadings(content);
	const questionWords = ['làm sao', 'tại sao', 'thế nào', 'bao giờ', 'đâu là', 'ai là'];

	return subheadings.some(h => {
		const text = h.toLowerCase();
		return text.endsWith('?') || questionWords.some(q => text.includes(q));
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
	if (!html) return false;
	const videoRegex = /<(video|iframe|embed|object)[^>]*>|youtube\.com|vimeo\.com|youtu\.be/gi;
	return videoRegex.test(html);
}

/**
 * Extracts all image sources from content
 */
export function extractImages(content: string): string[] {
	if (!content) return [];
	const sources: string[] = [];
	const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
	let match;
	while ((match = imgRegex.exec(content)) !== null) {
		if (match[1]) sources.push(match[1]);
	}
	// Markdown images
	const mdImgRegex = /!\[.*?\]\((.*?)\)/g;
	while ((match = mdImgRegex.exec(content)) !== null) {
		if (match[1]) sources.push(match[1]);
	}
	return sources;
}

/**
 * Extracts all video sources from content
 */
export function extractVideos(content: string): string[] {
	if (!content) return [];
	const sources: string[] = [];
	const videoRegex = /<(video|iframe|embed|object)[^>]*src=["']([^"']*)["'][^>]*>/gi;
	let match;
	while ((match = videoRegex.exec(content)) !== null) {
		if (match[2]) sources.push(match[2]);
	}
	// Support direct YouTube/Vimeo links in text
	const videoLinkRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com)\/\S+/gi;
	while ((match = videoLinkRegex.exec(content)) !== null) {
		sources.push(match[0]);
	}
	return sources;
}

/**
 * Extracts paragraphs from content
 */
export function extractParagraphs(content: string): string[] {
	if (!content) return [];
	const cleanContent = stripHtml(content);
	return cleanContent.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}

/**
 * Extracts sentences from content
 */
export function extractSentences(content: string): string[] {
	if (!content) return [];
	const cleanContent = normalizeContent(content);
	// Basic sentence splitting for most languages including Vietnamese
	return cleanContent.split(/[.!?]+\s+/).map(s => s.trim()).filter(s => s.length > 0);
}
