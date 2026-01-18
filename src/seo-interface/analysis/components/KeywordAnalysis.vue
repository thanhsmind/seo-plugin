<script setup lang="ts">
import type { KeywordAnalysisResult, RuleGroup } from '../../../shared/analysis';
import { computed, ref } from 'vue';
import {
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AccordionRoot,
	AccordionTrigger,
} from 'reka-ui';

const props = defineProps<{
	result: KeywordAnalysisResult;
	isExpanded?: boolean;
}>();

const openGroups = ref<RuleGroup[]>(props.result.isPrimary ? ['basic', 'additional'] : []);

const scoreColor = computed(() => {
	if (props.result.score >= 80) return 'success';
	if (props.result.score >= 50) return 'warning';
	return 'danger';
});

const badgeClass = computed(() => props.result.isPrimary ? 'primary-badge' : 'secondary-badge');

function getGroupColorClass(group: string) {
	switch (group) {
		case 'basic': return 'group-basic';
		case 'additional': return 'group-additional';
		case 'title-readability': return 'group-title';
		case 'content-readability': return 'group-content';
		default: return '';
	}
}

function getStatusIcon(status: string) {
	return status === 'pass' ? 'check_circle' : 'cancel';
}

function getStatusClass(failCount: number) {
	return failCount === 0 ? 'good' : 'warning';
}

function getStatusText(passCount: number, failCount: number) {
	if (failCount === 0) return 'Tất cả đều tốt';
	return `${failCount} cần cải thiện`;
}
</script>

<template>
	<div class="keyword-analysis" :class="{ primary: result.isPrimary }">
		<div class="keyword-header">
			<div class="keyword-info">
				<span class="keyword-badge" :class="badgeClass">
					{{ result.isPrimary ? 'Chính' : 'Phụ' }}
				</span>
				<span class="keyword-name">"{{ result.keyword }}"</span>
			</div>
			<div class="keyword-score" :class="scoreColor">
				{{ result.score }}/100
			</div>
		</div>

		<div class="score-bar">
			<div
				class="score-progress"
				:class="scoreColor"
				:style="{ width: `${result.score}%` }"
			/>
		</div>

		<AccordionRoot
			v-if="result.groupedResults.length > 0"
			v-model="openGroups"
			type="multiple"
			collapsible
			class="groups-accordion"
			:unmount-on-hide="false"
		>
			<AccordionItem
				v-for="group in result.groupedResults"
				:key="group.group"
				:value="group.group"
				class="group-item"
			>
				<AccordionHeader class="group-header">
					<AccordionTrigger class="group-trigger">
						<div class="group-title" :class="getGroupColorClass(group.group)">
							<span class="group-name">{{ group.groupName }} ({{ group.results.length }})</span>
							<span class="group-status" :class="getStatusClass(group.failCount)">
								<v-icon :name="group.failCount === 0 ? 'check_circle' : 'warning'" small />
								{{ getStatusText(group.passCount, group.failCount) }}
							</span>
						</div>
						<v-icon name="chevron_right" class="trigger-icon" />
					</AccordionTrigger>
				</AccordionHeader>
				<AccordionContent class="group-content">
					<div class="rule-list">
						<div
							v-for="ruleResult in group.results"
							:key="ruleResult.id"
							class="rule-item"
							:class="ruleResult.status"
						>
							<v-icon
								:name="getStatusIcon(ruleResult.status)"
								:class="ruleResult.status"
								small
							/>
							<div class="rule-info">
								<span class="rule-name">{{ ruleResult.name }}</span>
								<span class="rule-message">{{ ruleResult.message }}</span>
							</div>
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</AccordionRoot>

		<div v-else class="no-results">
			Không có kết quả phân tích cho từ khóa này.
		</div>
	</div>
</template>

<style lang="scss" scoped>
.keyword-analysis {
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	padding: 12px;
	margin-bottom: 16px;
	background-color: var(--theme--background);

	&.primary {
		border-color: var(--theme--primary);
		border-width: 2px;
	}
}

.keyword-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.keyword-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.keyword-badge {
	padding: 2px 8px;
	border-radius: 12px;
	font-size: 0.75em;
	font-weight: 600;
	text-transform: uppercase;

	&.primary-badge {
		background-color: var(--theme--primary);
		color: var(--theme--primary-background-color, #fff);
	}

	&.secondary-badge {
		background-color: var(--theme--background-accent);
		color: var(--theme--foreground-subdued);
	}
}

.keyword-name {
	font-weight: 600;
	color: var(--theme--foreground);
}

.keyword-score {
	font-weight: 700;
	font-size: 1.1em;

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

.score-bar {
	height: 6px;
	background-color: var(--theme--background-normal);
	border-radius: 3px;
	overflow: hidden;
	margin-bottom: 12px;
}

.score-progress {
	height: 100%;
	border-radius: 3px;
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

.groups-accordion {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.group-item {
	border: 1px solid var(--theme--border-color-subdued);
	border-radius: var(--theme--border-radius);
	overflow: hidden;
}

.group-header {
	margin: 0;
}

.group-trigger {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 8px 10px;
	background-color: var(--theme--background-subdued);
	border: none;
	font-size: 0.9em;
	font-family: inherit;
	text-align: left;
	cursor: pointer;
	user-select: none;
	transition: background-color 0.15s ease-in-out;

	&:hover {
		background-color: var(--theme--background-normal);
	}

	&[data-state='open'] {
		border-bottom: 1px solid var(--theme--border-color-subdued);

		> .trigger-icon {
			transform: rotate(90deg);
		}
	}
}

.trigger-icon {
	color: var(--theme--foreground-subdued);
	transition: transform 0.2s ease-in-out;
	flex-shrink: 0;
}

.group-title {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.group-name {
	font-weight: 600;

	.group-basic & {
		color: var(--theme--primary);
	}

	.group-additional & {
		color: var(--theme--warning);
	}

	.group-title & {
		color: #3b82f6;
	}

	.group-content & {
		color: #8b5cf6;
	}
}

.group-status {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 0.85em;
	font-weight: normal;

	&.good {
		color: var(--theme--success);
	}

	&.warning {
		color: var(--theme--warning);
	}
}

.group-content {
	overflow: hidden;
	background-color: var(--theme--background);

	&[data-state='open'] {
		padding: 8px 10px;
		animation: slideDown 150ms ease-out;
	}

	&[data-state='closed'] {
		padding: 0 10px;
		animation: slideUp 150ms ease-out forwards;
	}
}

.rule-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.rule-item {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 6px 0;
	border-bottom: 1px solid var(--theme--border-color-subdued);

	&:last-child {
		border-bottom: none;
	}

	.v-icon {
		flex-shrink: 0;
		margin-top: 2px;

		&.pass {
			--v-icon-color: var(--theme--success);
		}

		&.fail {
			--v-icon-color: var(--theme--danger);
		}
	}
}

.rule-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.rule-name {
	font-weight: 500;
	font-size: 0.9em;
	color: var(--theme--foreground);
}

.rule-message {
	font-size: 0.85em;
	color: var(--theme--foreground-subdued);
	line-height: 1.4;
}

.no-results {
	color: var(--theme--foreground-subdued);
	font-style: italic;
	text-align: center;
	padding: 12px;
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
