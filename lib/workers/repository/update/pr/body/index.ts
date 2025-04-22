import type { RenovateConfig } from '../../../../../config/types';
import type { PrContent, PrDebugData } from '../../../../../modules/platform';
import { getUpdatePrContent } from '../../../../../modules/platform/pr-content';
import { detectPlatform } from '../../../../../util/common';
import { joinUrlParts } from '../../../../../util/url';
import type { BranchConfig } from '../../../../types';
import { getDepWarningsPR, getWarnings } from '../../../errors-warnings';
import { getChangelogs } from './changelogs';
import { getPrConfigDescription } from './config-description';
import { getControls } from './controls';
import { getPrFooter } from './footer';
import { getPrHeader } from './header';
import { getPrExtraNotes, getPrNotes } from './notes';
import { getPrUpdatesTable } from './updates-table';

function massageUpdateMetadata(config: BranchConfig): void {
  config.upgrades.forEach((upgrade) => {
    const {
      homepage,
      sourceUrl,
      sourceDirectory,
      changelogUrl,
      dependencyUrl,
    } = upgrade;
    // TODO: types (#22198)
    let depNameLinked = upgrade.depName!;
    const primaryLink = homepage ?? sourceUrl ?? dependencyUrl;
    if (primaryLink) {
      depNameLinked = `[${depNameLinked}](${primaryLink})`;
    }

    let sourceRootPath = 'tree';
    if (sourceUrl) {
      const sourcePlatform = detectPlatform(sourceUrl);
      if (sourcePlatform === 'bitbucket') {
        sourceRootPath = 'src';
      }
    }

    const otherLinks = [];
    if (sourceUrl && (!!sourceDirectory || homepage)) {
      otherLinks.push(
        `[source](${
          sourceDirectory
            ? joinUrlParts(sourceUrl, sourceRootPath, 'HEAD', sourceDirectory)
            : sourceUrl
        })`,
      );
    }
    if (changelogUrl) {
      otherLinks.push(`[changelog](${changelogUrl})`);
    }
    if (otherLinks.length) {
      depNameLinked += ` (${otherLinks.join(', ')})`;
    }
    upgrade.depNameLinked = depNameLinked;
    const references: string[] = [];
    if (homepage) {
      references.push(`[homepage](${homepage})`);
    }
    if (sourceUrl) {
      let fullUrl = sourceUrl;
      if (sourceDirectory) {
        fullUrl = joinUrlParts(
          sourceUrl,
          sourceRootPath,
          'HEAD',
          sourceDirectory,
        );
      }
      references.push(`[source](${fullUrl})`);
    }
    if (changelogUrl) {
      references.push(`[changelog](${changelogUrl})`);
    }
    upgrade.references = references.join(', ');
  });
}

interface PrBodyConfig {
  appendExtra?: string | null | undefined;
  rebasingNotice?: string;
  debugData: PrDebugData;
}

export function getPrBody(
  branchConfig: BranchConfig,
  prBodyConfig: PrBodyConfig,
  config: RenovateConfig,
): PrContent {
  massageUpdateMetadata(branchConfig);
  let warnings = '';
  warnings += getWarnings(branchConfig);
  if (branchConfig.packageFiles) {
    warnings += getDepWarningsPR(
      branchConfig.packageFiles,
      config,
      branchConfig.dependencyDashboard,
    );
  }
  const content = {
    header: getPrHeader(branchConfig),
    table: getPrUpdatesTable(branchConfig),
    warnings,
    notes: getPrNotes(branchConfig) + getPrExtraNotes(branchConfig),
    changelogs: getChangelogs(branchConfig),
    configDescription: getPrConfigDescription(branchConfig),
    controls: getControls(),
    footer: getPrFooter(branchConfig),
  };

  return getUpdatePrContent(content, branchConfig.prBodyTemplate, prBodyConfig);
}
