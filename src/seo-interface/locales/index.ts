export const interfaceLocales = {
	en: {
		tabs: {
			basic: 'Basic',
			advanced: 'Advanced',
			customFields: 'Custom Fields',
			keyphrase: 'Keyphrase',
			schema: 'Schema',
		},
		analysis: {
			title: 'Analysis',
			emptyState: 'Enter a focus keyphrase to analyze your content.',
			allNeutral: 'We found nothing to report! This might happen if content is missing or too short.',
			noResults: 'Could not generate analysis results. Check configuration and content fields.',
			collapseAll: 'Collapse all',
			expandAll: 'Expand all',
		},
		schema: {
			title: 'Schema Markup',
			tooltip: 'Structured data helps Google understand your content',
			enableLabel: 'Enable Schema Markup',
			typeLabel: 'Schema Type',
			typePlaceholder: 'Select schema type...',
			preview: 'JSON-LD Preview',
			copyTooltip: 'Copy JSON-LD',
			copied: 'Copied!',
			collapse: 'Collapse',
			expand: 'Expand',
			emptyPreview: 'Fill in Schema information to see JSON-LD preview',
		},
		sitemap: {
			title: 'Sitemap Settings',
			tooltip: 'Control how search engines crawl and index your site',
		},
		searchControls: {
			title: 'Search Engine Controls',
			tooltip: 'Control how search engines interact with this page',
			warningBoth: "This page will be hidden from search engines and its links won't be followed",
			warningNoIndex: 'This page will be hidden from search engines',
			warningNoFollow: "Links on this page won't be followed by search engines",
		},
	},
	vi: {
		tabs: {
			basic: 'Cơ bản',
			advanced: 'Nâng cao',
			customFields: 'Trường tùy chỉnh',
			keyphrase: 'Từ khóa',
			schema: 'Schema',
		},
		analysis: {
			title: 'Phân tích',
			emptyState: 'Nhập từ khóa chính để phân tích nội dung.',
			allNeutral: 'Không có gì cần báo cáo! Điều này có thể xảy ra nếu nội dung bị thiếu hoặc quá ngắn.',
			noResults: 'Không thể tạo kết quả phân tích. Kiểm tra cấu hình và các trường nội dung.',
			collapseAll: 'Thu gọn tất cả',
			expandAll: 'Mở rộng tất cả',
		},
		schema: {
			title: 'Schema Markup',
			tooltip: 'Structured data giúp Google hiểu nội dung trang',
			enableLabel: 'Bật Schema Markup',
			typeLabel: 'Loại Schema',
			typePlaceholder: 'Chọn loại Schema...',
			preview: 'Xem trước JSON-LD',
			copyTooltip: 'Copy JSON-LD',
			copied: 'Đã copy!',
			collapse: 'Thu gọn',
			expand: 'Mở rộng',
			emptyPreview: 'Điền thông tin Schema để xem JSON-LD preview',
		},
		sitemap: {
			title: 'Cài đặt Sitemap',
			tooltip: 'Kiểm soát cách công cụ tìm kiếm crawl và index trang',
		},
		searchControls: {
			title: 'Điều khiển công cụ tìm kiếm',
			tooltip: 'Kiểm soát cách công cụ tìm kiếm tương tác với trang này',
			warningBoth: 'Trang này sẽ bị ẩn khỏi công cụ tìm kiếm và các liên kết sẽ không được theo dõi',
			warningNoIndex: 'Trang này sẽ bị ẩn khỏi công cụ tìm kiếm',
			warningNoFollow: 'Các liên kết trên trang này sẽ không được công cụ tìm kiếm theo dõi',
		},
	},
};

export type InterfaceLocale = keyof typeof interfaceLocales;
export type InterfaceTranslations = (typeof interfaceLocales)['en'];

// Simple locale detection - default to Vietnamese
export function getInterfaceLocale(): InterfaceLocale {
	// Can be extended to detect from browser/Directus settings
	return 'vi';
}

export function t(key: string, locale?: InterfaceLocale): string {
	const currentLocale = locale || getInterfaceLocale();
	const translations = interfaceLocales[currentLocale] || interfaceLocales.en;

	const keys = key.split('.');
	let value: unknown = translations;

	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = (value as Record<string, unknown>)[k];
		} else {
			// Fallback to English
			value = interfaceLocales.en;
			for (const fallbackKey of keys) {
				if (value && typeof value === 'object' && fallbackKey in value) {
					value = (value as Record<string, unknown>)[fallbackKey];
				} else {
					return key;
				}
			}
			break;
		}
	}

	return typeof value === 'string' ? value : key;
}
