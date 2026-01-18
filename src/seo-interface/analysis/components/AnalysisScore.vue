<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	score: number;
}>();

const scoreColor = computed(() => {
	if (props.score >= 80) return 'success';
	if (props.score >= 50) return 'warning';
	return 'danger';
});

const progressStyle = computed(() => ({
	width: `${props.score}%`,
}));
</script>

<template>
	<div class="seo-score">
		<div class="score-header">
			<span class="score-label">SEO Score</span>
			<span class="score-value" :class="scoreColor">{{ score }}/100</span>
		</div>
		<div class="score-bar">
			<div class="score-progress" :class="scoreColor" :style="progressStyle" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.seo-score {
	margin-bottom: 16px;
	padding: 12px;
	background-color: var(--theme--background-subdued);
	border-radius: var(--theme--border-radius);
	border: 1px solid var(--theme--border-color);
}

.score-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.score-label {
	font-weight: 600;
	color: var(--theme--foreground);
}

.score-value {
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
	height: 8px;
	background-color: var(--theme--background-normal);
	border-radius: 4px;
	overflow: hidden;
}

.score-progress {
	height: 100%;
	border-radius: 4px;
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
</style>
