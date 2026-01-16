import type { RuleContext, AnalysisResult, SeoRule, RuleStatus, RuleMessages } from './types';
import { basicRules } from './rules/basic';
import { additionalRules } from './rules/additional';
import { titleReadabilityRules } from './rules/title-readability';
import { contentReadabilityRules } from './rules/content-readability';

export const allRules: SeoRule[] = [
  ...basicRules,
  ...additionalRules,
  ...titleReadabilityRules,
  ...contentReadabilityRules,
];

function determineStatus(pass: boolean, data?: Record<string, unknown>): RuleStatus {
  // Check for neutral status (informational only)
  if (data?.neutral) {
    return 'neutral';
  }
  // Check for warning status
  if (pass && data?.status === 'warning') {
    return 'warning';
  }
  return pass ? 'pass' : 'fail';
}

function getMessage(
  messages: RuleMessages,
  status: RuleStatus,
  data?: Record<string, unknown>
): string {
  let msg: string | ((data: Record<string, unknown>) => string) | undefined;

  if (status === 'warning' && messages.warning) {
    msg = messages.warning;
  } else if (status === 'neutral') {
    msg = messages.pass; // Neutral uses pass message
  } else {
    msg = status === 'pass' ? messages.pass : messages.fail;
  }

  return typeof msg === 'function' ? msg(data || {}) : msg;
}

export function runAnalysis(context: RuleContext): AnalysisResult[] {
  return allRules.map(rule => {
    const result = rule.check(context);
    const status = determineStatus(result.pass, result.data);

    return {
      ruleId: rule.id,
      group: rule.group,
      name: rule.name,
      status,
      message: getMessage(rule.messages, status, result.data),
      data: result.data,
    };
  });
}

export * from './types';
