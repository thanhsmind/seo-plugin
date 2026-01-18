import type { SeoAnalysisRule } from '../types';

// Basic SEO Rules
import {
	contentLengthRule,
	keywordInDescriptionRule,
	keywordInFirst10PercentRule,
	keywordInTitleRule,
	keywordInUrlRule,
} from './basic';

// Additional Rules
import {
	keywordDensityRule,
	keywordInImageAltRule,
	keywordInSubheadingsRule,
	urlLengthRule,
} from './additional';

// Title Readability Rules
import { numberInTitleRule } from './title-readability';

// Content Readability Rules
import {
	hasMediaRule,
	sentenceLengthRule,
	shortParagraphsRule,
	tableOfContentsRule,
} from './content-readability';

export const basicRules: SeoAnalysisRule[] = [
	keywordInTitleRule,
	keywordInDescriptionRule,
	keywordInUrlRule,
	keywordInFirst10PercentRule,
	contentLengthRule,
];

export const additionalRules: SeoAnalysisRule[] = [
	keywordInSubheadingsRule,
	keywordInImageAltRule,
	keywordDensityRule,
	urlLengthRule,
];

export const titleReadabilityRules: SeoAnalysisRule[] = [
	numberInTitleRule,
];

export const contentReadabilityRules: SeoAnalysisRule[] = [
	tableOfContentsRule,
	shortParagraphsRule,
	hasMediaRule,
	sentenceLengthRule,
];

export const allRules: SeoAnalysisRule[] = [
	...basicRules,
	...additionalRules,
	...titleReadabilityRules,
	...contentReadabilityRules,
];

export {
	// Basic
	keywordInTitleRule,
	keywordInDescriptionRule,
	keywordInUrlRule,
	keywordInFirst10PercentRule,
	contentLengthRule,
	// Additional
	keywordInSubheadingsRule,
	keywordInImageAltRule,
	keywordDensityRule,
	urlLengthRule,
	// Title Readability
	numberInTitleRule,
	// Content Readability
	tableOfContentsRule,
	shortParagraphsRule,
	hasMediaRule,
	sentenceLengthRule,
};
