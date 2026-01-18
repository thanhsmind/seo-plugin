<script setup lang="ts">
import type { SeoFieldStatus } from '../../../shared/types/seo';
import type { AnalysisResult, AnalysisResultDetails } from '../types';
import { computed } from 'vue';
import ProgressBar from '../../../shared/components/ProgressBar.vue';

const props = defineProps<{
	result: AnalysisResult;
}>();

type DetailComponentType = 'length' | 'content' | 'image' | 'subheadings';

interface DetailComponent {
	type: DetailComponentType;
	data: AnalysisResultDetails;
}

// Determine which details sub-component to show based on result ID and details
const detailComponent = computed((): DetailComponent | null => {
	const details = props.result.details;
	if (!details) return null;

	if ((props.result.id === 'title' || props.result.id === 'description') && typeof details.length === 'number' && typeof details.maxLength === 'number') {
		return { type: 'length', data: details };
	}

	if (props.result.id === 'content' && typeof details.wordCount === 'number') {
		return { type: 'content', data: details };
	}

	if (props.result.id === 'image_alt' && typeof details.imageCount === 'number') {
		return { type: 'image', data: details };
	}

	if (props.result.id === 'subheadings' && typeof details.subheadingCount === 'number') {
		return { type: 'subheadings', data: details };
	}

	return null;
});

const lengthMeterProgress = computed(() => {
	const value = detailComponent.value;
	if (!value || value.type !== 'length' || value.data.length === 0 || !value.data.maxLength) return 0;
	const { length, maxLength } = value.data;
	return Math.min(100, (length ?? 0 / maxLength) * 100);
});

const lengthMeterStatus = computed((): SeoFieldStatus => {
	const value = detailComponent.value;
	if (!value || value.type !== 'length' || value.data.length === 0 || !value.data.minLength || !value.data.maxLength) return 'missing';
	const { length, minLength, maxLength } = value.data;
	if (length && length < minLength) return 'too-short';
	if (length && length > maxLength) return 'too-long';
	return 'ideal';
});

const densityMeterProgress = computed(() => {
	const value = detailComponent.value;
	if (!value || value.type !== 'content' || typeof value.data.density !== 'number') return 0;
	return Math.min(100, value.data.density * 50);
});

const densityMeterStatus = computed((): SeoFieldStatus => {
	const value = detailComponent.value;
	if (!value || value.type !== 'content' || typeof value.data.density !== 'number') return 'missing';
	return value.data.optimal ? 'ideal' : 'too-short';
});
</script>

<template>
	<div
		class="analysis-result"
		:class="result.status"
	>
		<div class="analysis-dot" :class="result.status" />
		<div class="analysis-text">
			<p class="analysis-title">
				<span class="analysis-title-text">
					{{ result.title }}
				</span>
				<span class="analysis-title-subtext">
					{{ result.message }}
				</span>
			</p>

			<div v-if="detailComponent" class="analysis-details">
				<!-- Title & Description details -->
				<div v-if="detailComponent.type === 'length'">
					Độ dài: {{ detailComponent.data.length }} ký tự
					<ProgressBar
						:progress="lengthMeterProgress"
						:status="lengthMeterStatus"
						class="analysis-meter"
					/>
				</div>

				<!-- Content details -->
				<div v-else-if="detailComponent.type === 'content'">
					Số từ: {{ detailComponent.data.wordCount }}
					<template v-if="detailComponent.data.occurrences && detailComponent.data.occurrences > 0 && typeof detailComponent.data.density === 'number'">
						<br>Số lần xuất hiện: {{ detailComponent.data.occurrences }} lần
						<br>Mật độ: {{ detailComponent.data.density.toFixed(1) }}%
						<ProgressBar
							:progress="densityMeterProgress"
							:status="densityMeterStatus"
							class="analysis-meter"
						/>
					</template>
				</div>

				<!-- Image alt text details -->
				<div v-else-if="detailComponent.type === 'image'">
					Tìm thấy {{ detailComponent.data.imageCount }} ảnh{{ result.status === 'good' ? ' với thẻ alt phù hợp' : '' }}
					<ul v-if="detailComponent.data.altTexts && detailComponent.data.altTexts.length > 0">
						<li v-for="(alt, index) in detailComponent.data.altTexts" :key="index">
							"{{ alt }}"
						</li>
					</ul>
				</div>

				<!-- Subheadings details -->
				<div v-else-if="detailComponent.type === 'subheadings'">
					Tìm thấy {{ detailComponent.data.subheadingCount }} tiêu đề phụ
					<ul v-if="detailComponent.data.subheadings && detailComponent.data.subheadings.length > 0">
						<li v-for="(heading, index) in detailComponent.data.subheadings" :key="index">
							"{{ heading }}"
						</li>
					</ul>
				</div>
			</div>

			<!-- Highlights / Evidence -->
			<div v-if="result.details?.highlights?.length" class="analysis-highlights">
				<p class="highlights-label">Dẫn chứng cụ thể:</p>
				<ul>
					<li v-for="(item, index) in result.details.highlights" :key="index">
						<v-icon name="error_outline" x-small class="highlight-icon" />
						<span class="highlight-text">{{ item }}</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.analysis-result {
	display: flex;
	align-items: start;
	gap: 12px;
	padding: 8px;
	border-bottom: 1px dashed var(--theme--border-color);

	.analysis-dot {
		margin-top: 0.5rem;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--theme--foreground-subdued);

		&.good {
			background-color: var(--theme--success);
		}
		&.warning {
			background-color: var(--theme--warning);
		}
		&.error {
			background-color: var(--theme--danger);
		}
	}

	.v-icon {
		margin-top: 0.25rem;
		flex-shrink: 0;
	}
}

.analysis-result:last-child {
	border-bottom: none;
	padding-bottom: 0;
}

.analysis-text {
	flex: 1;
	flex-direction: column;
	min-width: 0;
}

.analysis-title {
	margin: 0 0 4px 0;
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 0.5rem;
}

.analysis-title-text {
	line-height: 1.5;
	font-size: 1rem;
	font-weight: bold;
	color: var(--theme--foreground);
	flex-shrink: 0;
	white-space: nowrap;
}

.analysis-title-subtext {
	line-height: 1.5;
	font-size: 0.9rem;
	font-weight: 400;
	color: var(--theme--foreground-subdued);
}

.analysis-details {
	font-size: 0.85em;
	color: var(--theme--foreground-subdued);
	margin-top: 4px;

	ul {
		margin: 4px 0 0 1rem;
		padding: 0;
		list-style: disc;
	}
	li {
		margin-bottom: 2px;
	}

	.analysis-meter {
		display: inline-block;
		width: 100px;
		margin: 4px 0 0 8px;
		vertical-align: middle;
	}
}

.analysis-highlights {
	margin-top: 8px;
	padding: 8px;
	background-color: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	border-left: 3px solid var(--theme--danger);

	.highlights-label {
		font-size: 0.8rem;
		font-weight: bold;
		margin-bottom: 4px;
		color: var(--theme--foreground);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		font-size: 0.8rem;
		color: var(--theme--foreground-subdued);
		display: flex;
		gap: 4px;
		align-items: center;
		margin-bottom: 2px;
		font-style: italic;
	}

	.highlight-icon {
		color: var(--theme--danger);
		flex-shrink: 0;
	}

	.highlight-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>
