/**
 * Utility functions for SEO analysis
 */

/**
 * Strips HTML tags from a string
 */
export function stripHtml(html: string): string {
	if (!html) return '';
	return html.replaceAll(/<[^>]*>/g, ' ').replaceAll(/\s+/g, ' ').trim();
}

/**
 * Strips basic Markdown syntax from a string
 */
export function stripMarkdown(md: string): string {
	if (!md) return '';
	return md
		.replaceAll(/\*\*(.+?)\*\*/g, '$1') // Bold
		.replaceAll(/\*(.+?)\*/g, '$1') // Italic
		.replaceAll(/__(.+?)__/g, '$1') // Bold
		.replaceAll(/_(.+?)_/g, '$1') // Italic
		.replaceAll(/```(.+?)```/g, '$1') // Code blocks
		.replaceAll(/`(.+?)`/g, '$1') // Inline code
		.replaceAll(/\[(.+?)\]\(.+?\)/g, '$1') // Links
		.replaceAll(/!\[(.+?)\]\(.+?\)/g, '$1') // Images
		.replaceAll(/#{1,6}\s+(.+)/g, '$1') // Headings
		.replaceAll(/\n+/g, ' ') // Newlines
		.replaceAll(/\s+/g, ' ')
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

	const normalizedText = text.toLowerCase();
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
		.replaceAll(/[^\w\s-]/g, '')
		.replaceAll(/[\s_]+/g, '-')
		.replaceAll(/-+/g, '-')
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
