<script setup lang="ts">
import type { SchemaType, SchemaFieldDefinition } from '../../../shared/schema/types';
import { getSchemaDefinition } from '../../../shared/schema/definitions';
import { computed, watch } from 'vue';

const props = defineProps<{
	schemaType: SchemaType | undefined;
	modelValue: Record<string, unknown>;
	disabled?: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: Record<string, unknown>): void;
}>();

const schemaDefinition = computed(() => {
	if (!props.schemaType) return null;
	return getSchemaDefinition(props.schemaType);
});

const fields = computed(() => schemaDefinition.value?.fields || []);

function updateField(fieldName: string, value: unknown) {
	emit('update:modelValue', {
		...props.modelValue,
		[fieldName]: value,
	});
}

function getFieldValue(fieldName: string): unknown {
	return props.modelValue?.[fieldName] ?? '';
}

function isArrayField(field: SchemaFieldDefinition): boolean {
	return field.type === 'array';
}

function getArrayItems(fieldName: string): unknown[] {
	const value = getFieldValue(fieldName);
	return Array.isArray(value) ? value : [];
}

function addArrayItem(fieldName: string, field: SchemaFieldDefinition) {
	const items = getArrayItems(fieldName);
	const newItem: Record<string, unknown> = {};

	if (field.items?.properties) {
		for (const prop of field.items.properties) {
			newItem[prop.name] = '';
		}
	}

	updateField(fieldName, [...items, newItem]);
}

function removeArrayItem(fieldName: string, index: number) {
	const items = getArrayItems(fieldName);
	const newItems = items.filter((_, i) => i !== index);
	updateField(fieldName, newItems);
}

function updateArrayItem(fieldName: string, index: number, propName: string, value: unknown) {
	const items = getArrayItems(fieldName) as Record<string, unknown>[];
	const newItems = [...items];
	newItems[index] = {
		...newItems[index],
		[propName]: value,
	};
	updateField(fieldName, newItems);
}

watch(
	() => props.schemaType,
	(newType, oldType) => {
		if (newType !== oldType) {
			emit('update:modelValue', {});
		}
	},
);
</script>

<template>
	<div v-if="schemaDefinition" class="schema-fields-form">
		<template v-for="field in fields" :key="field.name">
			<!-- Array fields (FAQ questions, HowTo steps, etc.) -->
			<div v-if="isArrayField(field)" class="field array-field">
				<label class="label field-label type-label">
					{{ field.label }}
					<span v-if="field.required" class="required">*</span>
				</label>

				<div class="array-items">
					<div
						v-for="(item, index) in getArrayItems(field.name)"
						:key="index"
						class="array-item"
					>
						<div class="array-item-header">
							<span class="item-index">#{{ index + 1 }}</span>
							<v-button
								icon
								x-small
								secondary
								:disabled="disabled"
								@click="removeArrayItem(field.name, index)"
							>
								<v-icon name="close" />
							</v-button>
						</div>

						<div v-if="field.items?.properties" class="array-item-fields">
							<template v-for="prop in field.items.properties" :key="prop.name">
								<div class="field half-left" :class="{ full: prop.type === 'text' }">
									<v-input
										v-if="prop.type === 'string' || prop.type === 'url'"
										:model-value="(item as Record<string, unknown>)[prop.name] || ''"
										:placeholder="prop.label"
										:disabled="disabled"
										@update:model-value="updateArrayItem(field.name, index, prop.name, $event)"
									/>
									<v-textarea
										v-else-if="prop.type === 'text'"
										:model-value="(item as Record<string, unknown>)[prop.name] || ''"
										:placeholder="prop.label"
										:disabled="disabled"
										@update:model-value="updateArrayItem(field.name, index, prop.name, $event)"
									/>
								</div>
							</template>
						</div>
					</div>
				</div>

				<v-button
					small
					secondary
					:disabled="disabled"
					@click="addArrayItem(field.name, field)"
				>
					<v-icon name="add" />
					Thêm {{ field.items?.label || 'mục' }}
				</v-button>
			</div>

			<!-- Regular fields -->
			<div v-else class="field" :class="{ half: field.type !== 'text' }">
				<label class="label field-label type-label">
					{{ field.label }}
					<span v-if="field.required" class="required">*</span>
				</label>

				<v-input
					v-if="field.type === 'string' || field.type === 'url' || field.type === 'number'"
					:model-value="getFieldValue(field.name)"
					:type="field.type === 'number' ? 'number' : 'text'"
					:placeholder="field.placeholder || field.label"
					:disabled="disabled"
					@update:model-value="updateField(field.name, $event)"
				/>

				<v-textarea
					v-else-if="field.type === 'text'"
					:model-value="getFieldValue(field.name)"
					:placeholder="field.placeholder || field.label"
					:disabled="disabled"
					@update:model-value="updateField(field.name, $event)"
				/>

				<v-input
					v-else-if="field.type === 'date'"
					:model-value="getFieldValue(field.name)"
					type="date"
					:disabled="disabled"
					@update:model-value="updateField(field.name, $event)"
				/>

				<v-input
					v-else-if="field.type === 'datetime'"
					:model-value="getFieldValue(field.name)"
					type="datetime-local"
					:disabled="disabled"
					@update:model-value="updateField(field.name, $event)"
				/>

				<v-input
					v-else-if="field.type === 'image'"
					:model-value="getFieldValue(field.name)"
					placeholder="URL hình ảnh"
					:disabled="disabled"
					@update:model-value="updateField(field.name, $event)"
				>
					<template #prepend>
						<v-icon name="image" />
					</template>
				</v-input>

				<small v-if="field.description" class="hint">{{ field.description }}</small>
			</div>
		</template>
	</div>

	<div v-else class="empty-state">
		Chọn loại Schema để bắt đầu cấu hình.
	</div>
</template>

<style lang="scss" scoped>
.schema-fields-form {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;

	.field {
		&.half {
			grid-column: span 1;
		}

		&.full,
		&.array-field {
			grid-column: span 2;
		}
	}
}

.label {
	display: block;
	margin-bottom: 8px;

	.required {
		color: var(--theme--danger);
	}
}

.hint {
	display: block;
	margin-top: 4px;
	color: var(--theme--foreground-subdued);
	font-size: 12px;
}

.array-field {
	.array-items {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 12px;
	}

	.array-item {
		padding: 12px;
		border: 1px solid var(--theme--border-color);
		border-radius: var(--theme--border-radius);
		background-color: var(--theme--background-subdued);

		.array-item-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;

			.item-index {
				font-weight: 600;
				color: var(--theme--foreground-subdued);
			}
		}

		.array-item-fields {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;

			.field {
				margin-bottom: 0;

				&.full {
					grid-column: span 2;
				}
			}
		}
	}
}

.empty-state {
	color: var(--theme--foreground-subdued);
	font-style: italic;
	padding: 16px;
	text-align: center;
	border: 1px dashed var(--theme--border-color);
	border-radius: var(--theme--border-radius);
}
</style>
