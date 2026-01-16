import type { EventSchemaData } from '../types';

export function buildEventSchema(data: EventSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Event',
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

	if (data.startDate) {
		schema.startDate = data.startDate;
	}

	if (data.endDate) {
		schema.endDate = data.endDate;
	}

	if (data.location?.name || data.location?.address) {
		schema.location = {
			'@type': 'Place',
			...(data.location.name && { name: data.location.name }),
			...(data.location.address && {
				address: {
					'@type': 'PostalAddress',
					streetAddress: data.location.address,
				},
			}),
		};
	}

	if (data.performer) {
		schema.performer = {
			'@type': 'Person',
			name: data.performer,
		};
	}

	if (data.organizer) {
		schema.organizer = {
			'@type': 'Organization',
			name: data.organizer,
		};
	}

	if (data.eventStatus) {
		schema.eventStatus = `https://schema.org/${data.eventStatus}`;
	}

	if (data.eventAttendanceMode) {
		schema.eventAttendanceMode = `https://schema.org/${data.eventAttendanceMode}`;
	}

	return schema;
}
