export type AnalysisStatus = 'good' | 'warning' | 'error' | 'neutral';

export interface AnalysisResultDetails {
	length?: number;
	hasKeyphrase?: boolean;
	minLength?: number;
	maxLength?: number;
	wordCount?: number;
	density?: number;
	occurrences?: number;
	optimal?: boolean;
	imageCount?: number;
	altTexts?: string[];
	subheadingCount?: number;
	subheadings?: string[];
	startsWithKeyphrase?: boolean;
	inFirst10?: boolean;
	internalLinks?: number;
	externalLinks?: number;
	hasTOC?: boolean;
	containsNumber?: boolean;
}

export interface AnalysisResult {
	id: string;
	title: string;
	status: AnalysisStatus;
	message: string;
	details?: AnalysisResultDetails;
}
