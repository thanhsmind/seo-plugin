import type { SeoAnalysisRule } from '../types';

// Basic SEO Rules (Direct Imports)
import { contentLengthRule } from './basic/content-length';
import { descriptionLengthRule } from './basic/description-length';
import { keywordInDescriptionRule } from './basic/keyword-in-description';
import { keywordInEndRule } from './basic/keyword-in-end';
import { keywordInFirst10PercentRule } from './basic/keyword-in-first-10-percent';
import { keywordInTitleRule } from './basic/keyword-in-title';
import { keywordInUrlRule } from './basic/keyword-in-url';
import { titleLengthRule } from './basic/title-length';

// Additional Rules (Direct Imports)
import { keywordDensityRule } from './additional/keyword-density';
import { keywordInImageAltRule } from './additional/keyword-in-image-alt';
import { keywordInSubheadingsRule } from './additional/keyword-in-subheadings';
import { urlLengthRule } from './additional/url-length';

// Title Readability Rules (Direct Imports)
import { numberInTitleRule } from './title-readability/number-in-title';

// Content Readability Rules (Direct Imports)
import { descriptiveAnchorTextRule } from './content-readability/descriptive-anchor-text';
import { hasMediaRule } from './content-readability/has-media';
import { questionInHeadingsRule } from './content-readability/question-in-headings';
import { sentenceLengthRule } from './content-readability/sentence-length';
import { shortParagraphsRule } from './content-readability/short-paragraphs';
import { tableOfContentsRule } from './content-readability/table-of-contents';
import { transitionWordsRule } from './content-readability/transition-words';

const debugRule: SeoAnalysisRule = {
	id: 'debug-rule',
	group: 'basic',
	name: 'DEBUG: Tổng số quy tắc',
	description: 'Để kiểm tra xem engine có nhận đủ quy tắc không',
	check: () => ({ status: 'pass', value: { count: 21 } }),
	messages: { pass: (v) => `Đã nạp ${v?.count} quy tắc.`, fail: '', skip: '' }
};

export const basicRules: SeoAnalysisRule[] = [
	debugRule,
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
	contentLengthRule,
	descriptionLengthRule,
	keywordInDescriptionRule,
	keywordInEndRule,
	keywordInFirst10PercentRule,
	keywordInTitleRule,
	keywordInUrlRule,
	titleLengthRule,
	keywordDensityRule,
	keywordInImageAltRule,
	keywordInSubheadingsRule,
	urlLengthRule,
	numberInTitleRule,
	descriptiveAnchorTextRule,
	hasMediaRule,
	questionInHeadingsRule,
	sentenceLengthRule,
	shortParagraphsRule,
	tableOfContentsRule,
	transitionWordsRule,
};
