export type RuleGroup = 'basic' | 'additional' | 'title-readability' | 'content-readability';

export type RuleStatus = 'pass' | 'fail' | 'warning' | 'neutral';

export interface RuleContext {
  title: string;
  metaDescription: string;
  focusKeyphrase: string;
  url?: string;
  content?: string;
  slug?: string;
}

export interface RuleResult {
  pass: boolean;
  data?: Record<string, unknown>;
}

export interface RuleMessages {
  pass: string | ((data: Record<string, unknown>) => string);
  fail: string | ((data: Record<string, unknown>) => string);
  warning?: string | ((data: Record<string, unknown>) => string);
}

export interface SeoRule {
  id: string;
  group: RuleGroup;
  name: string;
  description: string;
  check: (context: RuleContext) => RuleResult;
  messages: RuleMessages;
}

export interface AnalysisResult {
  ruleId: string;
  group: RuleGroup;
  name: string;
  status: RuleStatus;
  message: string;
  data?: Record<string, unknown>;
}
