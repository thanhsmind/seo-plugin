<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	score: number;
}>();

const scoreColor = computed(() => {
	if (props.score <= 40) return 'error';
	if (props.score <= 70) return 'warning';
	return 'success';
});

const circumference = 2 * Math.PI * 45;

const strokeDashoffset = computed(() => {
	return circumference - (props.score / 100) * circumference;
});
</script>

<template>
	<div class="score-container" :class="scoreColor">
		<svg class="score-circle" viewBox="0 0 100 100">
			<circle
				class="score-bg"
				cx="50"
				cy="50"
				r="45"
				fill="none"
				stroke-width="8"
			/>
			<circle
				class="score-progress"
				cx="50"
				cy="50"
				r="45"
				fill="none"
				stroke-width="8"
				:stroke-dasharray="circumference"
				:stroke-dashoffset="strokeDashoffset"
				stroke-linecap="round"
			/>
		</svg>
		<div class="score-value">
			<span class="score-number">{{ Math.round(score) }}</span>
			<span class="score-label">Điểm SEO</span>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.score-container {
	position: relative;
	width: 100px;
	height: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 16px;

	&.error {
		--score-color: var(--theme--danger);
	}
	&.warning {
		--score-color: var(--theme--warning);
	}
	&.success {
		--score-color: var(--theme--success);
	}
}

.score-circle {
	position: absolute;
	width: 100%;
	height: 100%;
	transform: rotate(-90deg);
}

.score-bg {
	stroke: var(--theme--border-color);
}

.score-progress {
	stroke: var(--score-color);
	transition: stroke-dashoffset 0.5s ease-in-out;
}

.score-value {
	display: flex;
	flex-direction: column;
	align-items: center;
	z-index: 1;
}

.score-number {
	font-size: 24px;
	font-weight: bold;
	color: var(--score-color);
	line-height: 1;
}

.score-label {
	font-size: 10px;
	color: var(--theme--foreground-subdued);
	margin-top: 2px;
}
</style>
