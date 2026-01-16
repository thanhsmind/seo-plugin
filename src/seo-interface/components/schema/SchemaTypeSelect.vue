<script setup lang="ts">
import type { SchemaType } from '../../../shared/schema/types';
import { schemaTypeDefinitions } from '../../../shared/schema/definitions';
import { computed } from 'vue';
import { t } from '../../locales';

const props = defineProps<{
	modelValue: SchemaType | undefined;
	disabled?: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: SchemaType): void;
}>();

const schemaOptions = computed(() =>
	schemaTypeDefinitions.map((def) => ({
		text: def.label,
		value: def.type,
		icon: def.icon,
		description: def.description,
	})),
);

function handleSelect(value: SchemaType) {
	emit('update:modelValue', value);
}
</script>

<template>
	<div class="schema-type-select">
		<v-select
			:model-value="modelValue"
			:items="schemaOptions"
			:disabled="disabled"
			:placeholder="t('schema.typePlaceholder')"
			@update:model-value="handleSelect"
		>
			<template #preview="{ item }">
				<div class="preview-item">
					<v-icon v-if="item?.icon" :name="item.icon" small />
					<span>{{ item?.text }}</span>
				</div>
			</template>
		</v-select>
	</div>
</template>

<style lang="scss" scoped>
.schema-type-select {
	width: 100%;
}

.preview-item {
	display: flex;
	align-items: center;
	gap: 8px;
}
</style>
