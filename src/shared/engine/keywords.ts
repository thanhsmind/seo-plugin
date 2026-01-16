import { normalize, wordCount } from './text';

export interface ParsedKeywords {
	primary: string;
	secondary: string[];
	all: string[];
}

export function parseKeywords(focusKeyphrase: string): ParsedKeywords {
	if (!focusKeyphrase || typeof focusKeyphrase !== 'string') {
		return { primary: '', secondary: [], all: [] };
	}

	const keywords = focusKeyphrase
		.split(',')
		.map((k) => k.trim())
		.filter((k) => k.length > 0);

	const primary = keywords[0] || '';
	const secondary = keywords.slice(1);

	return {
		primary,
		secondary,
		all: keywords,
	};
}

export function keywordInText(text: string, keyword: string): boolean {
	if (!text || !keyword) return false;
	const normalizedText = normalize(text);
	const normalizedKeyword = normalize(keyword);
	return normalizedText.includes(normalizedKeyword);
}

export function keywordAtBeginning(text: string, keyword: string): boolean {
	if (!text || !keyword) return false;
	const normalizedText = normalize(text);
	const normalizedKeyword = normalize(keyword);
	const halfLength = Math.floor(normalizedText.length / 2);
	const firstHalf = normalizedText.substring(0, halfLength);
	return firstHalf.includes(normalizedKeyword);
}

export function keywordDensity(
	text: string,
	keyword: string
): { density: number; occurrences: number } {
	if (!text || !keyword) {
		return { density: 0, occurrences: 0 };
	}

	const normalizedText = normalize(text);
	const normalizedKeyword = normalize(keyword);
	const words = wordCount(text);

	if (words === 0) {
		return { density: 0, occurrences: 0 };
	}

	let occurrences = 0;
	let searchIndex = 0;

	while (true) {
		const foundIndex = normalizedText.indexOf(normalizedKeyword, searchIndex);
		if (foundIndex === -1) break;
		occurrences++;
		searchIndex = foundIndex + normalizedKeyword.length;
	}

	const keywordWordCount = wordCount(keyword);
	const density = (occurrences * keywordWordCount * 100) / words;

	return { density, occurrences };
}
