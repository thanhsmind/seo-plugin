<script setup lang="ts">
import AdvancedAnalysis from './AdvancedAnalysis.vue';

const props = defineProps<{
	focusKeyphrase: string;
	title: string;
	description: string;
	slugField: string | null | undefined;
	contentFields: string[] | string | undefined;
}>();
</script>

<template>
	<div class="seo-analysis-container field">
		<div v-if="!focusKeyphrase" class="empty-state">
			Enter a focus keyphrase to analyze your content.
		</div>

		<template v-else>
			<!-- Advanced SEO Analysis (14 Rules) -->
			<AdvancedAnalysis
				:focus-keyphrase="focusKeyphrase"
				:title="title"
				:description="description"
				:slug-field="slugField"
				:content-fields="contentFields"
			/>
		</template>
	</div>
</template>

<style lang="scss" scoped>
.empty-state {
	color: var(--theme--foreground-subdued);
	font-style: italic;
	padding: 12px 8px;
	border: 1px dashed var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	background-color: var(--theme--background-subdued);
	text-align: center;
	margin-top: 16px;
}
</style>
