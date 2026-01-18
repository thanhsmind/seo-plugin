<script setup lang="ts">
import type { Ref } from 'vue';
import type { MultiKeywordAnalysisResult, RuleContext } from '../../../shared/analysis';
import { useDebounceFn } from '@vueuse/core';
import { get } from 'lodash-es';
import { computed, inject, ref, watch } from 'vue';
import { runMultiKeywordAnalysis } from '../../../shared/analysis';
import { normalizeContent } from '../../../shared/utils';
import KeywordAnalysis from './KeywordAnalysis.vue';

const props = defineProps<{
	focusKeyphrase: string;
	title: string;
	description: string;
	slugField: string | null | undefined;
	contentFields: string[] | string | undefined;
}>();

const values = inject('values') as Ref<Record<string, unknown>>;

const analysisResult = ref<MultiKeywordAnalysisResult>({
	keywords: [],
	overallScore: 0,
	primaryKeyword: '',
});

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

const baseContext = computed<Omit<RuleContext, 'focusKeyphrase'>>(() => ({
	title: props.title,
	metaDescription: props.description,
	slug: slugValue.value,
	content: contentString.value,
}));

const runAnalysis = useDebounceFn(() => {
	if (!props.focusKeyphrase) {
		analysisResult.value = {
			keywords: [],
			overallScore: 0,
			primaryKeyword: '',
		};
		return;
	}

	analysisResult.value = runMultiKeywordAnalysis(props.focusKeyphrase, baseContext.value);
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

const hasResults = computed(() => analysisResult.value.keywords.length > 0);
const hasMultipleKeywords = computed(() => analysisResult.value.keywords.length > 1);

const overallScoreColor = computed(() => {
	const score = analysisResult.value.overallScore;
	if (score >= 80) return 'success';
	if (score >= 50) return 'warning';
	return 'danger';
});
</script>

<template>
	<div class="advanced-analysis field">
		<div class="header">
			<label class="label field-label type-label">SEO Analysis</label>
		</div>

		<div v-if="!focusKeyphrase" class="empty-state">
			Nhập từ khóa chính để phân tích nội dung.
			<br>
			<small>Phân cách nhiều từ khóa bằng dấu phẩy để kiểm tra từng từ khóa riêng biệt.</small>
		</div>

		<template v-else-if="hasResults">
			<!-- Overall Score (only show if multiple keywords) -->
			<div v-if="hasMultipleKeywords" class="overall-score">
				<div class="overall-header">
					<span class="overall-label">Điểm tổng hợp</span>
					<span class="overall-value" :class="overallScoreColor">
						{{ analysisResult.overallScore }}/100
					</span>
				</div>
				<div class="overall-bar">
					<div
						class="overall-progress"
						:class="overallScoreColor"
						:style="{ width: `${analysisResult.overallScore}%` }"
					/>
				</div>
				<div class="overall-hint">
					Điểm từ khóa chính chiếm 70%, từ khóa phụ chiếm 30%
				</div>
			</div>

			<!-- Keywords Summary -->
			<div v-if="hasMultipleKeywords" class="keywords-summary">
				<div class="summary-label">Phân tích {{ analysisResult.keywords.length }} từ khóa:</div>
				<div class="summary-chips">
					<div
						v-for="kw in analysisResult.keywords"
						:key="kw.keyword"
						class="summary-chip"
						:class="{ primary: kw.isPrimary }"
					>
						<span class="chip-keyword">{{ kw.keyword }}</span>
						<span
							class="chip-score"
							:class="{
								success: kw.score >= 80,
								warning: kw.score >= 50 && kw.score < 80,
								danger: kw.score < 50,
							}"
						>
							{{ kw.score }}
						</span>
					</div>
				</div>
			</div>

			<!-- Individual Keyword Analysis -->
			<div class="keywords-analysis">
				<KeywordAnalysis
					v-for="kw in analysisResult.keywords"
					:key="kw.keyword"
					:result="kw"
				/>
			</div>
		</template>

		<div v-else class="no-results-state">
			Không có kết quả phân tích. Kiểm tra cấu hình và nội dung.
		</div>
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

	small {
		opacity: 0.8;
	}
}

.overall-score {
	margin-bottom: 16px;
	padding: 12px;
	background-color: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	border: 2px solid var(--theme--primary);
}

.overall-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.overall-label {
	font-weight: 600;
	color: var(--theme--foreground);
}

.overall-value {
	font-weight: 700;
	font-size: 1.2em;

	&.success {
		color: var(--theme--success);
	}

	&.warning {
		color: var(--theme--warning);
	}

	&.danger {
		color: var(--theme--danger);
	}
}

.overall-bar {
	height: 10px;
	background-color: var(--theme--background-normal);
	border-radius: 5px;
	overflow: hidden;
	margin-bottom: 8px;
}

.overall-progress {
	height: 100%;
	border-radius: 5px;
	transition: width 0.3s ease;

	&.success {
		background-color: var(--theme--success);
	}

	&.warning {
		background-color: var(--theme--warning);
	}

	&.danger {
		background-color: var(--theme--danger);
	}
}

.overall-hint {
	font-size: 0.8em;
	color: var(--theme--foreground-subdued);
	font-style: italic;
}

.keywords-summary {
	margin-bottom: 16px;
	padding: 12px;
	background-color: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	border: 1px solid var(--theme--border-color);
}

.summary-label {
	font-size: 0.85em;
	font-weight: 600;
	color: var(--theme--foreground-subdued);
	margin-bottom: 8px;
}

.summary-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.summary-chip {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 10px;
	background-color: var(--theme--background);
	border: 1px solid var(--theme--border-color);
	border-radius: 16px;
	font-size: 0.9em;

	&.primary {
		border-color: var(--theme--primary);
		border-width: 2px;
	}
}

.chip-keyword {
	color: var(--theme--foreground);
	max-width: 150px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.chip-score {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 28px;
	height: 22px;
	padding: 0 6px;
	border-radius: 11px;
	font-size: 0.85em;
	font-weight: 600;
	color: #fff;

	&.success {
		background-color: var(--theme--success);
	}

	&.warning {
		background-color: var(--theme--warning);
	}

	&.danger {
		background-color: var(--theme--danger);
	}
}

.keywords-analysis {
	display: flex;
	flex-direction: column;
}
</style>
