import type { HowToSchemaData } from '../types';

export function buildHowToSchema(data: HowToSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'HowTo',
	};

	if (data.name) {
		schema.name = data.name;
	}

	if (data.description) {
		schema.description = data.description;
	}

	if (data.image) {
		schema.image = data.image;
	}

	if (data.totalTime) {
		schema.totalTime = data.totalTime;
	}

	if (data.estimatedCost) {
		schema.estimatedCost = {
			'@type': 'MonetaryAmount',
			currency: 'VND',
			value: data.estimatedCost,
		};
	}

	if (data.steps && data.steps.length > 0) {
		schema.step = data.steps.map((step, index) => ({
			'@type': 'HowToStep',
			position: index + 1,
			name: step.name,
			text: step.text,
			...(step.image && { image: step.image }),
		}));
	}

	return schema;
}
