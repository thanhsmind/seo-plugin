<script setup lang="ts">
import type { SchemaType } from '../../../shared/schema/types';
import { buildJsonLd } from '../../../shared/schema/builders';
import { computed, ref } from 'vue';
import { t } from '../../locales';

const props = defineProps<{
	schemaType: SchemaType | undefined;
	schemaData: Record<string, unknown>;
}>();

const isExpanded = ref(false);
const copySuccess = ref(false);

const jsonLdOutput = computed(() => {
	if (!props.schemaType) return '';
	return buildJsonLd(props.schemaType, processSchemaData(props.schemaData));
});

const hasData = computed(() => {
	if (!props.schemaType) return false;
	return Object.keys(props.schemaData).length > 0;
});

function processSchemaData(data: Record<string, unknown>): Record<string, unknown> {
	const processed: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data)) {
		if (value === undefined || value === null || value === '') {
			continue;
		}

		if (typeof value === 'string' && (key === 'sameAs' || key === 'recipeIngredient' || key === 'recipeInstructions')) {
			const lines = value.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
			if (lines.length > 0) {
				processed[key] = lines;
			}
		} else if (key === 'streetAddress' || key === 'addressLocality' || key === 'addressRegion' || key === 'postalCode' || key === 'addressCountry') {
			if (!processed.address) {
				processed.address = {};
			}
			(processed.address as Record<string, unknown>)[key] = value;
		} else if (key === 'latitude' || key === 'longitude') {
			if (!processed.geo) {
				processed.geo = {};
			}
			(processed.geo as Record<string, unknown>)[key] = value;
		} else if (key === 'locationName' || key === 'locationAddress') {
			if (!processed.location) {
				processed.location = {};
			}
			const locationKey = key === 'locationName' ? 'name' : 'address';
			(processed.location as Record<string, unknown>)[locationKey] = value;
		} else if (key === 'calories') {
			processed.nutrition = { calories: value };
		} else {
			processed[key] = value;
		}
	}

	return processed;
}

async function copyToClipboard() {
	try {
		await navigator.clipboard.writeText(jsonLdOutput.value);
		copySuccess.value = true;
		setTimeout(() => {
			copySuccess.value = false;
		}, 2000);
	} catch (err) {
		console.error('Failed to copy:', err);
	}
}

function toggleExpand() {
	isExpanded.value = !isExpanded.value;
}
</script>

<template>
	<div class="json-ld-preview">
		<div class="preview-header">
			<label class="label field-label type-label">
				<v-icon name="code" small />
				{{ t('schema.preview') }}
			</label>
			<div class="actions">
				<v-button
					v-if="hasData"
					v-tooltip="copySuccess ? t('schema.copied') : t('schema.copyTooltip')"
					icon
					x-small
					secondary
					@click="copyToClipboard"
				>
					<v-icon :name="copySuccess ? 'check' : 'content_copy'" />
				</v-button>
				<v-button
					v-if="hasData"
					v-tooltip="isExpanded ? t('schema.collapse') : t('schema.expand')"
					icon
					x-small
					secondary
					@click="toggleExpand"
				>
					<v-icon :name="isExpanded ? 'unfold_less' : 'unfold_more'" />
				</v-button>
			</div>
		</div>

		<div v-if="hasData" class="code-container" :class="{ expanded: isExpanded }">
			<pre><code>{{ jsonLdOutput }}</code></pre>
		</div>

		<div v-else class="empty-preview">
			<v-icon name="data_object" />
			<span>{{ t('schema.emptyPreview') }}</span>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.json-ld-preview {
	margin-top: 16px;
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	overflow: hidden;
}

.preview-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 12px;
	background-color: var(--theme--background-subdued);
	border-bottom: 1px solid var(--theme--border-color);

	.label {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
	}

	.actions {
		display: flex;
		gap: 4px;
	}
}

.code-container {
	max-height: 200px;
	overflow: auto;
	transition: max-height 0.3s ease;

	&.expanded {
		max-height: 500px;
	}

	pre {
		margin: 0;
		padding: 12px;
		background-color: var(--theme--background);
		font-family: var(--theme--fonts--monospace--font-family);
		font-size: 12px;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;

		code {
			color: var(--theme--foreground);
		}
	}
}

.empty-preview {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 24px;
	color: var(--theme--foreground-subdued);
	font-style: italic;

	.v-icon {
		--v-icon-size: 32px;
		opacity: 0.5;
	}
}
</style>
