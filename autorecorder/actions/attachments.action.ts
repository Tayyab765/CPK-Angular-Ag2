/**
 * Attachments — pick a real file, send it, and make the agent prove it read it.
 *
 * https://docs.copilotkit.ai/angular/ag2/guides/threads-memory-attachments-headless
 */
import { type Page } from 'playwright';

import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';

import { attachFixtureOnCamera, renderRevenueFixture } from './attach-file';

export const runAttachmentsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
) => {
  const buffer = await renderRevenueFixture(page, rootPath);
  await attachFixtureOnCamera(page, buffer);

  // The composer moves down once the queue appears, so the prompt is typed
  // after the attachment, never before.
  const msgCount = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);
};

