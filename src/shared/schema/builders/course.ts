import type { CourseSchemaData } from '../types';

export function buildCourseSchema(data: CourseSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Course',
	};

	if (data.name) {
		schema.name = data.name;
	}

	if (data.description) {
		schema.description = data.description;
	}

	if (data.provider) {
		schema.provider = {
			'@type': 'Organization',
			name: data.provider,
			...(data.providerUrl && { url: data.providerUrl }),
		};
	}

	return schema;
}
