import type { SeoAnalysisRule } from '../types';

// Basic SEO Rules
import {
	contentLengthRule,
	descriptionLengthRule,
	keywordInDescriptionRule,
	keywordInEndRule,
	keywordInFirst10PercentRule,
	keywordInTitleRule,
	keywordInUrlRule,
	titleLengthRule,
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
	descriptiveAnchorTextRule,
	hasMediaRule,
	questionInHeadingsRule,
	sentenceLengthRule,
	shortParagraphsRule,
	tableOfContentsRule,
	transitionWordsRule,
} from './content-readability';

export const basicRules: SeoAnalysisRule[] = [
	keywordInTitleRule,
	titleLengthRule,
	keywordInDescriptionRule,
	descriptionLengthRule,
	keywordInUrlRule,
	keywordInFirst10PercentRule,
	keywordInEndRule,
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
	transitionWordsRule,
	questionInHeadingsRule,
	descriptiveAnchorTextRule,
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
	titleLengthRule,
	keywordInDescriptionRule,
	descriptionLengthRule,
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
	transitionWordsRule,
	questionInHeadingsRule,
	descriptiveAnchorTextRule,
};
