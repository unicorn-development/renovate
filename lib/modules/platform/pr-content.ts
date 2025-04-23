import type { RenovateConfig } from '../../config/types';
import { regEx } from '../../util/regex';
import { toBase64 } from '../../util/string';
import * as template from '../../util/template';
import { smartTruncate } from './utils/pr-body';
import { platform } from '.';
import type { PrContent, PrDebugData } from '.';

interface ContentConfig {
  rebasingNotice?: string;
  debugData: PrDebugData;
}

interface OnboardingPrContent {
  packageFiles: string;
  config: string;
  warnings: string;
  errors: string;
  baseBranch: string;
  prList: string;
  prHeader: string;
  prFooter: string;
  onboardingConfigHashComment: string;
}

export function getUpdatePrContent(
  content: Record<string, string>,
  prBodyTemplate: string | undefined,
  contentConfig: ContentConfig,
): PrContent {
  const result: PrContent = {
    body: createUpdatePrBody(content, prBodyTemplate, contentConfig),
    comments: [],
    topicsToDelete: ['Release Notes', 'Updates'],
  };
  if (result.body.length <= platform.maxBodyLength()) {
    return result;
  }

  if (content.changelogs) {
    result.comments.push({
      topic: 'Release Notes',
      content: content.changelogs,
    });
    content.changelogs = 'Please see comment below for changelogs';
    result.topicsToDelete = result.topicsToDelete.filter(
      (x) => x !== 'Release Notes',
    );

    result.body = createUpdatePrBody(content, prBodyTemplate, contentConfig);
    if (result.body.length <= platform.maxBodyLength()) {
      return result;
    }
  }

  if (content.table) {
    result.comments.push({ topic: 'Updates', content: content.table });
    content.table = 'Please see comment below for updates';
    result.topicsToDelete = result.topicsToDelete.filter(
      (x) => x !== 'Updates',
    );

    result.body = createUpdatePrBody(content, prBodyTemplate, contentConfig);
  }
  result.body = smartTruncate(result.body, platform.maxBodyLength());
  return result;
}

const rebasingRegex = regEx(/\*\*Rebasing\*\*: .*/);

function createUpdatePrBody(
  content: Record<string, unknown>,
  prBodyTemplate: string | undefined,
  prBodyConfig: ContentConfig,
): string {
  let prBody = '';
  if (prBodyTemplate) {
    prBody = template.compile(prBodyTemplate, content, false);
    prBody = prBody.trim();
    prBody = prBody.replace(regEx(/\n\n\n+/g), '\n\n');
    const prDebugData64 = toBase64(JSON.stringify(prBodyConfig.debugData));
    prBody += `\n<!--renovate-debug:${prDebugData64}-->\n`;
    prBody = platform.massageMarkdown(prBody);

    if (prBodyConfig?.rebasingNotice) {
      prBody = prBody.replace(
        rebasingRegex,
        `**Rebasing**: ${prBodyConfig.rebasingNotice}`,
      );
    }
  }
  return prBody;
}

export function getOnboardingPrContent(
  content: OnboardingPrContent,
  prTemplate: string,
  config: RenovateConfig,
): PrContent {
  const result: PrContent = {
    body: createOnbardingPrBody(prTemplate, content, config),
    comments: [],
    topicsToDelete: ['PR List', 'Package Files'], //todo calculate topicstodelete
  };
  if (result.body.length <= platform.maxBodyLength()) {
    return result;
  }

  if (content.prList) {
    result.comments.push({
      topic: 'PR List',
      content: content.prList,
    });
    content.prList = 'Please see comment below for what to expect';
    result.topicsToDelete = result.topicsToDelete.filter(
      (x) => x !== 'PR List',
    );

    result.body = createOnbardingPrBody(prTemplate, content, config);
    if (result.body.length <= platform.maxBodyLength()) {
      return result;
    }
  }

  if (content.packageFiles) {
    result.comments.push({
      topic: 'Package Files',
      content: content.packageFiles,
    });
    content.packageFiles =
      'Please see comment below for detected Package Files\n';
    result.topicsToDelete = result.topicsToDelete.filter(
      (x) => x !== 'Package Files',
    );

    result.body = createOnbardingPrBody(prTemplate, content, config);
    if (result.body.length <= platform.maxBodyLength()) {
      return result;
    }
  }

  result.body = smartTruncate(result.body, platform.maxBodyLength());
  return result;
}

function createOnbardingPrBody(
  bodyTemplate: string,
  content: OnboardingPrContent,
  config: RenovateConfig,
): string {
  let prBody = bodyTemplate.replace(
    '{{PACKAGE FILES}}\n',
    content.packageFiles,
  );
  prBody = prBody.replace('{{CONFIG}}\n', content.config);
  prBody = prBody.replace('{{WARNINGS}}\n', content.warnings);
  prBody = prBody.replace('{{ERRORS}}\n', content.errors);
  prBody = prBody.replace('{{BASEBRANCH}}\n', content.baseBranch);
  prBody = prBody.replace('{{PRLIST}}\n', content.prList);
  if (content.prHeader) {
    prBody = `${template.compile(content.prHeader, config)}\n\n${prBody}`;
  }
  if (content.prFooter) {
    prBody = `${prBody}\n---\n\n${template.compile(content.prFooter, config)}\n`;
  }
  prBody += content.onboardingConfigHashComment;
  prBody = platform.massageMarkdown(prBody);
  return prBody;
}
