export interface ExtractedLink {
	href: string;
	text: string;
	isNofollow: boolean;
}

export function extractLinks(content: string): ExtractedLink[] {
	if (!content) return [];

	const links: ExtractedLink[] = [];

	const htmlLinkRegex = /<a\s+([^>]*)>(.*?)<\/a>/gi;
	let match: RegExpExecArray | null;

	while ((match = htmlLinkRegex.exec(content)) !== null) {
		const attrs = match[1];
		const text = match[2].replace(/<[^>]*>/g, '').trim();

		const hrefMatch = /href=["']([^"']*)["']/i.exec(attrs);
		const href = hrefMatch ? hrefMatch[1] : '';

		const relMatch = /rel=["']([^"']*)["']/i.exec(attrs);
		const rel = relMatch ? relMatch[1].toLowerCase() : '';
		const isNofollow = rel.includes('nofollow');

		if (href) {
			links.push({ href, text, isNofollow });
		}
	}

	const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

	while ((match = mdLinkRegex.exec(content)) !== null) {
		const text = match[1];
		const href = match[2];

		if (href && !href.startsWith('!')) {
			links.push({ href, text, isNofollow: false });
		}
	}

	return links;
}

export function isExternalLink(href: string, siteUrl?: string): boolean {
	if (!href) return false;

	if (href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
		return false;
	}

	if (href.startsWith('http://') || href.startsWith('https://')) {
		if (siteUrl) {
			try {
				const linkHost = new URL(href).hostname;
				const siteHost = new URL(siteUrl).hostname;
				return linkHost !== siteHost;
			} catch {
				return true;
			}
		}
		return true;
	}

	return false;
}

export function isInternalLink(href: string, siteUrl?: string): boolean {
	if (!href) return false;

	if (href.startsWith('#')) return false;

	if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
		return true;
	}

	if ((href.startsWith('http://') || href.startsWith('https://')) && siteUrl) {
		try {
			const linkHost = new URL(href).hostname;
			const siteHost = new URL(siteUrl).hostname;
			return linkHost === siteHost;
		} catch {
			return false;
		}
	}

	return false;
}

export function extractSubheadings(content: string): string[] {
	if (!content) return [];

	const subheadings: string[] = [];

	const htmlHeadingRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gi;
	let match: RegExpExecArray | null;

	while ((match = htmlHeadingRegex.exec(content)) !== null) {
		const headingText = match[2].replace(/<[^>]*>/g, '').trim();
		if (headingText) {
			subheadings.push(headingText);
		}
	}

	const mdHeadingRegex = /^#{2,6}\s+(\S.*)$/gm;

	while ((match = mdHeadingRegex.exec(content)) !== null) {
		const headingText = match[1].trim();
		if (headingText) {
			subheadings.push(headingText);
		}
	}

	return subheadings;
}

export function extractImageAltTexts(content: string): string[] {
	if (!content) return [];

	const altTexts: string[] = [];

	const imgRegex = /<img[^>]*alt=["']([^"']*)["'][^>]*>/gi;
	let match: RegExpExecArray | null;

	while ((match = imgRegex.exec(content)) !== null) {
		const altText = match[1].trim();
		if (altText) {
			altTexts.push(altText);
		}
	}

	const mdImgRegex = /!\[([^\]]*)\]\([^)]+\)/g;

	while ((match = mdImgRegex.exec(content)) !== null) {
		const altText = match[1].trim();
		if (altText) {
			altTexts.push(altText);
		}
	}

	return altTexts;
}
