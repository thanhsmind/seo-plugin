<script setup lang="ts">
import type { Ref } from 'vue';
import type { AnalysisResult, AnalysisStatus, RuleGroup } from '../../analysis/types';
import type { RuleStatus, AnalysisResult as EngineAnalysisResult } from '../../../shared/engine/analysis';
import { useDebounceFn } from '@vueuse/core';

import { get } from 'lodash-es';
import {
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AccordionRoot,
	AccordionTrigger,
} from 'reka-ui';
import { computed, inject, ref, watch } from 'vue';
import { runAnalysis } from '../../../shared/engine/analysis';
import { t } from '../../locales';
import AnalysisResultComponent from './AnalysisResult.vue';
import AnalysisScore from './AnalysisScore.vue';

type SectionId = 'basic' | 'additional' | 'title-readability' | 'content-readability';

interface GroupConfig {
	id: SectionId;
	title: string;
	icon: string;
}

const GROUP_CONFIGS: GroupConfig[] = [
	{ id: 'basic', title: 'SEO Cơ bản', icon: 'search' },
	{ id: 'additional', title: 'Bổ sung', icon: 'add_circle' },
	{ id: 'title-readability', title: 'Khả năng đọc tiêu đề', icon: 'title' },
	{ id: 'content-readability', title: 'Khả năng đọc nội dung', icon: 'article' },
];

const props = defineProps<{
	focusKeyphrase: string;
	title: string;
	description: string;
	slugField: string | null | undefined;
	contentFields: string[] | string | undefined;
}>();

const values = inject('values') as Ref<Record<string, any>>;

const analysisResults = ref<AnalysisResult[]>([]);

function mapRuleStatusToAnalysisStatus(status: RuleStatus): AnalysisStatus {
	switch (status) {
		case 'pass':
			return 'good';
		case 'fail':
			return 'error';
		case 'warning':
			return 'warning';
		case 'neutral':
			return 'neutral';
		default:
			return 'neutral';
	}
}

function mapEngineResultToAnalysisResult(result: EngineAnalysisResult): AnalysisResult {
	return {
		id: result.ruleId,
		title: result.name,
		status: mapRuleStatusToAnalysisStatus(result.status),
		message: result.message,
		group: result.group as RuleGroup,
		details: result.data,
	};
}

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

const slugValue = computed(() => values.value[props.slugField as keyof typeof values.value] || '');

const performAnalysis = useDebounceFn(() => {
	if (!props.focusKeyphrase) {
		analysisResults.value = [];
		return;
	}

	const context = {
		focusKeyphrase: props.focusKeyphrase,
		title: props.title,
		metaDescription: props.description,
		slug: slugValue.value,
		content: contentString.value,
	};

	const engineResults = runAnalysis(context);
	analysisResults.value = engineResults.map(mapEngineResultToAnalysisResult);
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
		performAnalysis();
	},
	{ deep: true, immediate: true },
);

const allAnalyses = computed(() => analysisResults.value);

const seoScore = computed(() => {
	if (allAnalyses.value.length === 0) return 0;
	const passedCount = allAnalyses.value.filter((r) => r.status === 'good').length;
	return Math.round((passedCount / allAnalyses.value.length) * 100);
});

function getResultsByGroup(group: RuleGroup) {
	return allAnalyses.value.filter((item) => item.group === group);
}

function getPassedCountByGroup(group: RuleGroup) {
	return getResultsByGroup(group).filter((item) => item.status === 'good').length;
}

function getTotalCountByGroup(group: RuleGroup) {
	return getResultsByGroup(group).length;
}

const openSectionIds = ref<SectionId[]>(['basic', 'additional']);

const sections = computed(() =>
	GROUP_CONFIGS.map((config) => ({
		...config,
		results: getResultsByGroup(config.id),
		passedCount: getPassedCountByGroup(config.id),
		totalCount: getTotalCountByGroup(config.id),
	})),
);

const availableSectionIds = computed(() => sections.value.filter((s) => s.results.length > 0).map((s) => s.id));

function expandAllSections() {
	openSectionIds.value = availableSectionIds.value;
}

function collapseAllSections() {
	openSectionIds.value = [];
}

const hasOnlyNeutralResults = computed(() => {
	return allAnalyses.value.length > 0 && allAnalyses.value.every((r) => r.status === 'neutral');
});

const canCollapseAll = computed(() => openSectionIds.value.length > 0);
const canExpandAll = computed(() => openSectionIds.value.length < availableSectionIds.value.length);

function getSectionStatusClass(section: { passedCount: number; totalCount: number }) {
	if (section.totalCount === 0) return 'neutral';
	if (section.passedCount === section.totalCount) return 'good';
	if (section.passedCount === 0) return 'problems';
	return 'improvements';
}

function getSectionIconClass(section: { passedCount: number; totalCount: number }) {
	if (section.totalCount === 0) return 'neutral';
	if (section.passedCount === section.totalCount) return 'good';
	if (section.passedCount === 0) return 'error';
	return 'warning';
}
</script>

<template>
	<div class="seo-analysis-container field">
		<div class="header">
			<label class="label field-label type-label">{{ t('analysis.title') }}</label>
			<div class="action-bar">
				<v-button
					v-tooltip="t('analysis.collapseAll')"
					:disabled="!canCollapseAll"
					icon
					small
					secondary
					:title="t('analysis.collapseAll')"
					@click="collapseAllSections"
				>
					<v-icon name="unfold_less" />
				</v-button>

				<v-button
					v-tooltip="t('analysis.expandAll')"
					:disabled="!canExpandAll"
					icon
					small
					secondary
					:title="t('analysis.expandAll')"
					@click="expandAllSections"
				>
					<v-icon name="unfold_more" />
				</v-button>
			</div>
		</div>

		<div v-if="!focusKeyphrase" class="empty-state">
			{{ t('analysis.emptyState') }}
		</div>

		<template v-else>
			<AnalysisScore :score="seoScore" />

			<AccordionRoot
				v-model="openSectionIds"
				type="multiple"
				collapsible
				class="analysis-accordion"
				:unmount-on-hide="false"
			>
				<template v-for="section in sections" :key="section.id">
					<AccordionItem
						v-if="section.results.length > 0"
						:value="section.id"
						class="accordion-item"
					>
						<AccordionHeader class="accordion-header">
							<AccordionTrigger class="accordion-trigger">
								<div class="section-title" :class="getSectionStatusClass(section)">
									<v-icon :name="section.icon" :class="getSectionIconClass(section)" />
									{{ section.title }} ({{ section.passedCount }}/{{ section.totalCount }})
								</div>
								<v-icon name="chevron_right" class="section-icon" />
							</AccordionTrigger>
						</AccordionHeader>
						<AccordionContent class="accordion-content">
							<AnalysisResultComponent
								v-for="result in section.results"
								:key="result.id"
								:result="result"
							/>
						</AccordionContent>
					</AccordionItem>
				</template>
			</AccordionRoot>

			<div v-if="hasOnlyNeutralResults" class="all-neutral-state">
				{{ t('analysis.allNeutral') }}
			</div>
			<div v-else-if="allAnalyses.length === 0 && focusKeyphrase" class="no-results-state">
				{{ t('analysis.noResults') }}
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
.all-neutral-state,
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

.analysis-accordion {
	display: flex;
	flex-direction: column;
	gap: 16px;

	.accordion-item {
		border: 1px solid var(--theme--border-color);
		border-radius: var(--theme--border-radius);
		overflow: hidden;
		transition: border-color 0.15s ease-in-out;

		&:focus-within {
			border-color: var(--theme--primary);
		}

		.accordion-header {
			margin: 0;

			.accordion-trigger {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				padding: 8px;
				background-color: var(--theme--background-subdued);
				border: none;
				font-size: inherit;
				font-family: inherit;
				text-align: left;
				cursor: pointer;
				user-select: none;
				transition: background-color 0.15s ease-in-out;

				.section-title {
					display: flex;
					align-items: center;
					font-weight: bold;

					&.problems {
						color: var(--theme--danger);
					}
					&.improvements {
						color: var(--theme--warning);
					}
					&.good {
						color: var(--theme--success);
					}
					&.neutral {
						color: var(--theme--foreground-subdued);
					}

					> .v-icon {
						margin-right: 8px;

						&.error {
							--v-icon-color: var(--theme--danger);
						}
						&.warning {
							--v-icon-color: var(--theme--warning);
						}
						&.good {
							--v-icon-color: var(--theme--success);
						}
						&.neutral {
							--v-icon-color: var(--theme--foreground-subdued);
						}
					}
				}

				.section-icon {
					margin-left: 8px;
					color: var(--theme--foreground-subdued);
					transition: transform 0.2s ease-in-out;
				}

				&[data-state='open'] {
					border-bottom: 1px solid var(--theme--border-color);

					> .section-icon {
						transform: rotate(90deg);
					}
				}

				&:hover {
					background-color: var(--theme--background-normal);
				}
			}
		}

		.accordion-content {
			overflow: hidden;
			background-color: var(--theme--background);

			&[data-state='open'] {
				padding: 8px 8px 16px 8px;
				animation: slideDown 150ms ease-out;
				height: auto;
			}
			&[data-state='closed'] {
				padding-top: 0;
				padding-bottom: 0;
				padding-left: 8px;
				padding-right: 8px;
				animation: slideUp 150ms ease-out forwards;
			}
		}
	}
}

@keyframes slideDown {
	from {
		height: 0;
	}
	to {
		height: var(--reka-accordion-content-height);
	}
}

@keyframes slideUp {
	from {
		height: var(--reka-accordion-content-height);
	}
	to {
		height: 0;
	}
}
</style>
