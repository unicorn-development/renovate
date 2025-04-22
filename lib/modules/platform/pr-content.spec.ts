import * as _template from '../../util/template';
import { getOnboardingPrContent, getUpdatePrContent } from './pr-content';
import { platform } from '~test/util';

vi.mock('../../util/template');
const template = vi.mocked(_template);

describe('modules/platform/pr-content', () => {
  describe('getUpdatePrContent', () => {
    it('returns changelog as comment if body is larger than maxBodyLength()', () => {
      platform.massageMarkdown.mockImplementationOnce((x) => x);
      platform.massageMarkdown.mockImplementationOnce((_) => 'header');
      template.compile.mockImplementation((x) => x);
      platform.maxBodyLength.mockReturnValue('header'.length);

      const content = {
        header: 'header',
        changelogs: 'changelogs',
      };

      const prBodyTemplate = '{{{header}}}{{{changelogs}}}';

      expect(
        getUpdatePrContent(content, prBodyTemplate, {
          debugData: {
            updatedInVer: '1.2.3',
            createdInVer: '1.2.3',
            targetBranch: 'base',
          },
        }),
      ).toEqual({
        body: 'header',
        comments: [{ topic: 'Release Notes', content: 'changelogs' }],
        topicsToDelete: ['Updates'],
      });
    });

    it('returns changelog & update table as comments if body is larger than maxBodyLength()', () => {
      platform.massageMarkdown.mockImplementationOnce((x) => x);
      platform.massageMarkdown.mockImplementationOnce(
        (_) => 'headerupdateTable',
      );
      platform.massageMarkdown.mockImplementationOnce((_) => 'header');
      template.compile.mockImplementation((x) => x);
      platform.maxBodyLength.mockReturnValue('header'.length);

      const content = {
        header: 'header',
        changelogs: 'changelogs',
        table: 'updatetable',
      };

      const prBodyTemplate = '{{{header}}}{{{changelogs}}}{{{table}}}';

      expect(
        getUpdatePrContent(content, prBodyTemplate, {
          debugData: {
            updatedInVer: '1.2.3',
            createdInVer: '1.2.3',
            targetBranch: 'base',
          },
        }),
      ).toEqual({
        body: 'header',
        comments: [
          { topic: 'Release Notes', content: 'changelogs' },
          { topic: 'Updates', content: 'updatetable' },
        ],
        topicsToDelete: [],
      });
    });

    it('returns changelog & update table as comments & truncate body if body is still larger than maxBodyLength()', () => {
      platform.massageMarkdown.mockImplementationOnce((x) => x);
      platform.massageMarkdown.mockImplementationOnce(
        (_) => 'headerupdateTable',
      );
      platform.massageMarkdown.mockImplementationOnce((_) => 'header');
      template.compile.mockImplementation((x) => x);
      platform.maxBodyLength.mockReturnValue('head'.length);

      const content = {
        header: 'header',
        changelogs: 'changelogs',
        table: 'updatetable',
      };

      const prBodyTemplate = '{{{header}}}{{{changelogs}}}{{{table}}}';

      expect(
        getUpdatePrContent(content, prBodyTemplate, {
          debugData: {
            updatedInVer: '1.2.3',
            createdInVer: '1.2.3',
            targetBranch: 'base',
          },
        }),
      ).toEqual({
        body: 'head',
        comments: [
          { topic: 'Release Notes', content: 'changelogs' },
          { topic: 'Updates', content: 'updatetable' },
        ],
        topicsToDelete: [],
      });
    });
  });

  describe('getOnboardingPrContent', () => {
    it('returns PR List as comment if body is larger than maxBodyLength()', () => {
      platform.massageMarkdown.mockImplementationOnce((x) => x);
      platform.massageMarkdown.mockImplementationOnce((_) => 'header');
      template.compile.mockImplementation((x) => x);
      platform.maxBodyLength.mockReturnValue('header'.length);

      const prBodyTemplate = '{{{header}}}{{PRLIST}}';

      const content = {
        packageFiles: 'packageFilesContent', //todo \n mit ins template
        config: 'configDesc, //todo \n mit ins template',
        warnings:
          'getWarnings(config) + getDepWarningsOnboardingPR(packageFiles!, config)',
        errors: 'getErrors(config)',
        baseBranch: 'getBaseBranchDesc(config)',
        prList: 'getExpectedPrList(config, branches)',
        prHeader: 'prHeader',
        prFooter: 'prFooter',
        onboardingConfigHashComment: '',
      };

      expect(getOnboardingPrContent(content, prBodyTemplate, {})).toEqual({
        body: 'header',
        comments: [
          {
            content: 'getExpectedPrList(config, branches)',
            topic: 'PR List',
          },
        ],
        topicsToDelete: ['Package Files'],
      });
    });

    it('returns PR List & Package Files as comments if body is larger than maxBodyLength()', () => {
      platform.massageMarkdown.mockImplementationOnce((x) => x);
      platform.massageMarkdown.mockImplementationOnce(
        (_) => 'headerPackage Files',
      );
      platform.massageMarkdown.mockImplementationOnce((_) => 'header');
      template.compile.mockImplementation((x) => x);
      platform.maxBodyLength.mockReturnValue('header'.length);

      const prBodyTemplate = '{{{header}}}{{PRLIST}}{{PACKAGE FILES}}';

      const content = {
        packageFiles: 'packageFilesContent', //todo \n mit ins template
        config: 'configDesc, //todo \n mit ins template',
        warnings:
          'getWarnings(config) + getDepWarningsOnboardingPR(packageFiles!, config)',
        errors: 'getErrors(config)',
        baseBranch: 'getBaseBranchDesc(config)',
        prList: 'getExpectedPrList(config, branches)',
        prHeader: 'prHeader',
        prFooter: 'prFooter',
        onboardingConfigHashComment: '',
      };

      expect(getOnboardingPrContent(content, prBodyTemplate, {})).toEqual({
        body: 'header',
        comments: [
          {
            content: 'getExpectedPrList(config, branches)',
            topic: 'PR List',
          },
          {
            content: 'packageFilesContent',
            topic: 'Package Files',
          },
        ],
        topicsToDelete: [],
      });
    });

    it('returns PR List & Package Files as comments & truncates body if body is still larger than maxBodyLength()', () => {
      platform.massageMarkdown.mockImplementationOnce((x) => x);
      platform.massageMarkdown.mockImplementationOnce(
        (_) => 'headerPackage Files',
      );
      platform.massageMarkdown.mockImplementationOnce((_) => 'header');
      template.compile.mockImplementation((x) => x);
      platform.maxBodyLength.mockReturnValue('head'.length);

      const prBodyTemplate = '{{{header}}}{{PRLIST}}{{PACKAGE FILES}}';

      const content = {
        packageFiles: 'packageFilesContent', //todo \n mit ins template
        config: 'configDesc, //todo \n mit ins template',
        warnings:
          'getWarnings(config) + getDepWarningsOnboardingPR(packageFiles!, config)',
        errors: 'getErrors(config)',
        baseBranch: 'getBaseBranchDesc(config)',
        prList: 'getExpectedPrList(config, branches)',
        prHeader: 'prHeader',
        prFooter: 'prFooter',
        onboardingConfigHashComment: '',
      };

      expect(getOnboardingPrContent(content, prBodyTemplate, {})).toEqual({
        body: 'head',
        comments: [
          {
            content: 'getExpectedPrList(config, branches)',
            topic: 'PR List',
          },
          {
            content: 'packageFilesContent',
            topic: 'Package Files',
          },
        ],
        topicsToDelete: [],
      });
    });
  });
});
