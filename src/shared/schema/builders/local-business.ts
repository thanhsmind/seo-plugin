import type { LocalBusinessSchemaData } from '../types';

export function buildLocalBusinessSchema(data: LocalBusinessSchemaData): Record<string, unknown> {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
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

	if (data.telephone) {
		schema.telephone = data.telephone;
	}

	if (data.email) {
		schema.email = data.email;
	}

	if (data.address) {
		const address: Record<string, unknown> = {
			'@type': 'PostalAddress',
		};

		if (data.address.streetAddress) {
			address.streetAddress = data.address.streetAddress;
		}
		if (data.address.addressLocality) {
			address.addressLocality = data.address.addressLocality;
		}
		if (data.address.addressRegion) {
			address.addressRegion = data.address.addressRegion;
		}
		if (data.address.postalCode) {
			address.postalCode = data.address.postalCode;
		}
		if (data.address.addressCountry) {
			address.addressCountry = data.address.addressCountry;
		}

		schema.address = address;
	}

	if (data.geo?.latitude !== undefined && data.geo?.longitude !== undefined) {
		schema.geo = {
			'@type': 'GeoCoordinates',
			latitude: data.geo.latitude,
			longitude: data.geo.longitude,
		};
	}

	if (data.priceRange) {
		schema.priceRange = data.priceRange;
	}

	if (data.openingHours && data.openingHours.length > 0) {
		schema.openingHours = data.openingHours;
	}

	return schema;
}
