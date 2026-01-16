export function tokenize(text: string): string[] {
	if (!text || typeof text !== 'string') return [];
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0);
}

export function wordCount(text: string): number {
	return tokenize(text).length;
}

export function normalize(text: string): string {
	if (!text || typeof text !== 'string') return '';
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'D')
		.trim();
}

export function sentenceCount(text: string): number {
	if (!text || typeof text !== 'string') return 0;
	const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
	return sentences.length;
}

export function averageSentenceLength(text: string): number {
	const sentences = sentenceCount(text);
	if (sentences === 0) return 0;
	const words = wordCount(text);
	return words / sentences;
}
