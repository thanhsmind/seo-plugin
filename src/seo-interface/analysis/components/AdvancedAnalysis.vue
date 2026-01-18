<script setup lang="ts">
import type { Ref } from 'vue';
import type { GroupedRuleResults, RuleAnalysisResult, RuleContext, RuleGroup } from '../../../shared/analysis';
import { useDebounceFn } from '@vueuse/core';
import { get } from 'lodash-es';
import { AccordionRoot } from 'reka-ui';
import { computed, inject, ref, watch } from 'vue';
import { calculateScore, groupRuleResults, runAllRules } from '../../../shared/analysis';
import { parseKeywords } from '../../../shared/analysis/utils';
import { normalizeContent } from '../../../shared/utils';
import AnalysisGroup from './AnalysisGroup.vue';
import AnalysisScore from './AnalysisScore.vue';

const props = defineProps<{
	focusKeyphrase: string;
	title: string;
	description: string;
	slugField: string | null | undefined;
	contentFields: string[] | string | undefined;
}>();

const values = inject('values') as Ref<Record<string, unknown>>;

const analysisResults = ref<RuleAnalysisResult[]>([]);
const groupedResults = ref<GroupedRuleResults[]>([]);
const score = ref(0);

const contentData = computed(() => {
	if (!props.contentFields || !values) {
		return {};
	}

	const fieldsToExtract = Array.isArray(props.contentFields) ? props.contentFields : [props.contentFields];

	return fieldsToExtract.reduce((acc, fieldName) => {
		const content = get(values.value, fieldName);

		if (content !== undefined && content !== null) {
			acc[fieldName] = content;
		}

		return acc;
	}, {} as Record<string, unknown>);
});

const contentString = computed(() => {
	let combined = '';
	if (!props.contentFields || !contentData.value) return combined;

	const fieldsToProcess = Array.isArray(props.contentFields) ? props.contentFields : [props.contentFields];

	for (const fieldName of fieldsToProcess) {
		const content = contentData.value[fieldName];

		if (content) {
			if (typeof content === 'string') {
				combined += ` ${content}`;
			}
			else {
				try {
					combined += ` ${JSON.stringify(content)}`;
				}
				catch {
					console.warn(`[SEO Plugin] Could not stringify content for field: ${fieldName}`);
				}
			}
		}
	}

	return combined.trim();
});

const slugValue = computed(() => {
	if (!props.slugField || !values.value) return '';
	return String(values.value[props.slugField as keyof typeof values.value] || '');
});

const parsedKeywords = computed(() => parseKeywords(props.focusKeyphrase));
const primaryKeyword = computed(() => parsedKeywords.value.primary);
const secondaryKeywords = computed(() => parsedKeywords.value.secondary);

const ruleContext = computed<RuleContext>(() => ({
	title: props.title,
	metaDescription: props.description,
	focusKeyphrase: primaryKeyword.value,
	slug: slugValue.value,
	content: normalizeContent(contentString.value),
}));

const runAnalysis = useDebounceFn(() => {
	if (!props.focusKeyphrase) {
		analysisResults.value = [];
		groupedResults.value = [];
		score.value = 0;
		return;
	}

	const results = runAllRules(ruleContext.value);
	analysisResults.value = results;
	groupedResults.value = groupRuleResults(results);
	score.value = calculateScore(results);
}, 500);

watch(
	[
		() => props.focusKeyphrase,
		() => props.title,
		() => props.description,
		() => slugValue.value,
		() => contentData.value,
	],
	() => {
		runAnalysis();
	},
	{ deep: true, immediate: true },
);

const openGroups = ref<RuleGroup[]>(['basic', 'additional']);

const availableGroups = computed(() => groupedResults.value.map(g => g.group));

function expandAll() {
	openGroups.value = availableGroups.value;
}

function collapseAll() {
	openGroups.value = [];
}

const canExpandAll = computed(() => openGroups.value.length < availableGroups.value.length);
const canCollapseAll = computed(() => openGroups.value.length > 0);

const hasResults = computed(() => groupedResults.value.length > 0);

const secondaryKeywordStats = computed(() => {
	if (secondaryKeywords.value.length === 0 || !contentString.value) return [];

	const content = normalizeContent(contentString.value).toLowerCase();

	return secondaryKeywords.value.map(keyword => {
		const normalizedKeyword = keyword.toLowerCase();
		let count = 0;
		let pos = 0;

		while ((pos = content.indexOf(normalizedKeyword, pos)) !== -1) {
			count++;
			pos += normalizedKeyword.length;
		}

		return { keyword, count };
	});
});
</script>

<template>
	<div class="advanced-analysis field">
		<div class="header">
			<label class="label field-label type-label">SEO Analysis</label>
			<div class="action-bar">
				<v-button
					v-tooltip="'Collapse all'"
					:disabled="!canCollapseAll"
					icon
					small
					secondary
					title="Collapse all"
					@click="collapseAll"
				>
					<v-icon name="unfold_less" />
				</v-button>
				<v-button
					v-tooltip="'Expand all'"
					:disabled="!canExpandAll"
					icon
					small
					secondary
					title="Expand all"
					@click="expandAll"
				>
					<v-icon name="unfold_more" />
				</v-button>
			</div>
		</div>

		<div v-if="!focusKeyphrase" class="empty-state">
			Nhập từ khóa chính để phân tích nội dung.
		</div>

		<template v-else>
			<AnalysisScore v-if="hasResults" :score="score" />

			<!-- Secondary Keywords Stats -->
			<div v-if="secondaryKeywordStats.length > 0" class="secondary-keywords">
				<label class="secondary-label">Từ khóa phụ</label>
				<div class="keyword-chips">
					<div v-for="stat in secondaryKeywordStats" :key="stat.keyword" class="keyword-chip">
						<span class="keyword-name">{{ stat.keyword }}</span>
						<span class="keyword-count" :class="{ zero: stat.count === 0 }">{{ stat.count }}</span>
					</div>
				</div>
			</div>

			<AccordionRoot
				v-if="hasResults"
				v-model="openGroups"
				type="multiple"
				collapsible
				class="groups-accordion"
				:unmount-on-hide="false"
			>
				<AnalysisGroup
					v-for="group in groupedResults"
					:key="group.group"
					:group="group"
				/>
			</AccordionRoot>

			<div v-else class="no-results-state">
				Không có kết quả phân tích. Kiểm tra cấu hình và nội dung.
			</div>
		</template>
	</div>
</template>

<style lang="scss" scoped>
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.label {
	margin-bottom: 0.5rem;
}

.type-label {
	margin-bottom: 1rem;
}

.empty-state,
.no-results-state {
	color: var(--theme--foreground-subdued);
	font-style: italic;
	padding: 12px 8px;
	border: 1px dashed var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	background-color: var(--theme--background-subdued);
	text-align: center;
	margin-top: 16px;
}

.action-bar {
	margin-bottom: 16px;
	margin-top: -4px;
	display: flex;
	gap: 8px;
	justify-content: flex-end;
}

.groups-accordion {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.secondary-keywords {
	margin-bottom: 16px;
	padding: 12px;
	background-color: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	border: 1px solid var(--theme--border-color);
}

.secondary-label {
	display: block;
	font-size: 0.85em;
	font-weight: 600;
	color: var(--theme--foreground-subdued);
	margin-bottom: 8px;
}

.keyword-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.keyword-chip {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 8px;
	background-color: var(--theme--background);
	border: 1px solid var(--theme--border-color);
	border-radius: 12px;
	font-size: 0.9em;
}

.keyword-name {
	color: var(--theme--foreground);
}

.keyword-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	background-color: var(--theme--primary);
	color: var(--theme--primary-background-color);
	border-radius: 10px;
	font-size: 0.8em;
	font-weight: 600;

	&.zero {
		background-color: var(--theme--danger);
	}
}
</style>
