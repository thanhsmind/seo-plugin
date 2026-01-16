import type { FAQSchemaData } from '../types';

export function buildFAQSchema(data: FAQSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
	};

	if (data.questions && data.questions.length > 0) {
		schema.mainEntity = data.questions.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer,
			},
		}));
	}

	return schema;
}
