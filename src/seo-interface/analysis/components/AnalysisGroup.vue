<script setup lang="ts">
import type { GroupedRuleResults } from '../../../shared/analysis';
import { computed } from 'vue';
import {
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AccordionTrigger,
} from 'reka-ui';

const props = defineProps<{
	group: GroupedRuleResults;
}>();

const statusIcon = computed(() => {
	if (props.group.failCount === 0) return 'check_circle';
	return 'warning';
});

const statusClass = computed(() => {
	if (props.group.failCount === 0) return 'good';
	return 'warning';
});

const statusText = computed(() => {
	if (props.group.failCount === 0) return 'Tất cả đều tốt';
	return `${props.group.failCount} cần cải thiện`;
});

const groupColorClass = computed(() => {
	switch (props.group.group) {
		case 'basic': return 'group-basic';
		case 'additional': return 'group-additional';
		case 'title-readability': return 'group-title';
		case 'content-readability': return 'group-content';
		default: return '';
	}
});
</script>

<template>
	<AccordionItem :value="group.group" class="group-item">
		<AccordionHeader class="group-header">
			<AccordionTrigger class="group-trigger">
				<div class="group-title" :class="groupColorClass">
					<span class="group-name">{{ group.groupName }} ({{ group.results.length }})</span>
					<span class="group-status" :class="statusClass">
						<v-icon :name="statusIcon" small />
						{{ statusText }}
					</span>
				</div>
				<v-icon name="chevron_right" class="trigger-icon" />
			</AccordionTrigger>
		</AccordionHeader>
		<AccordionContent class="group-content">
			<div class="rule-list">
				<div
					v-for="result in group.results"
					:key="result.id"
					class="rule-item"
					:class="result.status"
				>
					<v-icon
						:name="result.status === 'pass' ? 'check_circle' : 'cancel'"
						:class="result.status"
						small
					/>
					<span class="rule-message">{{ result.message }}</span>
				</div>
			</div>
		</AccordionContent>
	</AccordionItem>
</template>

<style lang="scss" scoped>
.group-item {
	border: 1px solid var(--theme--border-color);
	border-radius: var(--theme--border-radius);
	overflow: hidden;
	transition: border-color 0.15s ease-in-out;

	&:focus-within {
		border-color: var(--theme--primary);
	}
}

.group-header {
	margin: 0;
}

.group-trigger {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 10px 12px;
	background-color: var(--theme--background-subdued);
	border: none;
	font-size: inherit;
	font-family: inherit;
	text-align: left;
	cursor: pointer;
	user-select: none;
	transition: background-color 0.15s ease-in-out;

	&:hover {
		background-color: var(--theme--background-normal);
	}

	&[data-state='open'] {
		border-bottom: 1px solid var(--theme--border-color);

		> .trigger-icon {
			transform: rotate(90deg);
		}
	}
}

.trigger-icon {
	color: var(--theme--foreground-subdued);
	transition: transform 0.2s ease-in-out;
}

.group-title {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.group-name {
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 6px;

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
		padding: 8px 12px 12px 12px;
		animation: slideDown 150ms ease-out;
	}

	&[data-state='closed'] {
		padding-top: 0;
		padding-bottom: 0;
		padding-left: 12px;
		padding-right: 12px;
		animation: slideUp 150ms ease-out forwards;
	}
}

.rule-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
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

.rule-message {
	color: var(--theme--foreground);
	line-height: 1.4;
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
