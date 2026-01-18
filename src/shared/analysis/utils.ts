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

	const paragraphs: string[] = [];

	// HTML paragraphs
	const htmlParagraphRegex = /<p[^>]*>(.*?)<\/p>/gis;
	let match: RegExpExecArray | null;

	while ((match = htmlParagraphRegex.exec(content)) !== null) {
		const text = stripHtml(match[1] || '').trim();
		if (text) {
			paragraphs.push(text);
		}
	}

	// If no HTML paragraphs found, split by double newlines (Markdown style)
	if (paragraphs.length === 0) {
		const clean = stripHtml(content);
		const blocks = clean.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
		// Filter out headings
		for (const block of blocks) {
			if (!block.startsWith('#')) {
				paragraphs.push(block);
			}
		}
	}

	return paragraphs;
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
