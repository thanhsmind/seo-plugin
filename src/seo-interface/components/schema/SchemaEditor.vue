<script setup lang="ts">
import type { SchemaMarkup, SchemaType } from '../../../shared/schema/types';
import { computed, ref, watch } from 'vue';
import { t } from '../../locales';
import JsonLdPreview from './JsonLdPreview.vue';
import SchemaFieldsForm from './SchemaFieldsForm.vue';
import SchemaTypeSelect from './SchemaTypeSelect.vue';

const props = defineProps<{
	modelValue: SchemaMarkup | undefined;
	disabled?: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: SchemaMarkup): void;
}>();

const internalEnabled = ref(props.modelValue?.enabled ?? false);
const internalType = ref<SchemaType | undefined>(props.modelValue?.type);
const internalData = ref<Record<string, unknown>>(props.modelValue?.data ?? {});

watch(
	() => props.modelValue,
	(newValue) => {
		if (newValue) {
			internalEnabled.value = newValue.enabled;
			internalType.value = newValue.type;
			internalData.value = newValue.data ?? {};
		}
	},
	{ deep: true },
);

function emitUpdate() {
	emit('update:modelValue', {
		enabled: internalEnabled.value,
		type: internalType.value as SchemaType,
		data: internalData.value,
	});
}

function handleEnabledChange(value: boolean) {
	internalEnabled.value = value;
	emitUpdate();
}

function handleTypeChange(value: SchemaType) {
	internalType.value = value;
	internalData.value = {};
	emitUpdate();
}

function handleDataChange(value: Record<string, unknown>) {
	internalData.value = value;
	emitUpdate();
}

const showForm = computed(() => internalEnabled.value && internalType.value);
</script>

<template>
	<div class="schema-editor">
		<div class="schema-header">
			<interface-boolean
				:model-value="internalEnabled"
				:disabled="disabled"
				:label="t('schema.enableLabel')"
				@update:model-value="handleEnabledChange"
			/>
		</div>

		<div v-if="internalEnabled" class="schema-content">
			<div class="field">
				<label class="label field-label type-label">{{ t('schema.typeLabel') }}</label>
				<SchemaTypeSelect
					:model-value="internalType"
					:disabled="disabled"
					@update:model-value="handleTypeChange"
				/>
			</div>

			<div v-if="showForm" class="schema-form">
				<SchemaFieldsForm
					:schema-type="internalType"
					:model-value="internalData"
					:disabled="disabled"
					@update:model-value="handleDataChange"
				/>

				<JsonLdPreview
					:schema-type="internalType"
					:schema-data="internalData"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.schema-editor {
	.schema-header {
		margin-bottom: 16px;
	}

	.schema-content {
		padding-top: 8px;
		border-top: 1px solid var(--theme--border-color);
	}

	.schema-form {
		margin-top: 16px;
	}

	.field {
		margin-bottom: 16px;
	}

	.label {
		display: block;
		margin-bottom: 8px;
	}
}
</style>
