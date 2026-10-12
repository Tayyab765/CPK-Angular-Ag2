/**
 * Threads — recorded as an error/finding video because `frontend/server.ts` has
 * no CopilotKit Intelligence licence configured on `CopilotRuntime`.
 *
 * https://docs.copilotkit.ai/angular/ag2/guides/threads-memory-attachments-headless
 *
 * Thread endpoints come from the CopilotKit Intelligence Platform. Without an
 * Intelligence configuration on `CopilotRuntime`, `ThreadListComponent`
 * (`injectThreads`) cannot resolve threads and `CopilotThreadsDrawer` renders
 * its locked state — while `<copilot-chat />` beside it answers normally.
 */
import { type Page } from 'playwright';

import { AgentSilentError, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { beat, humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { closeNotepadNote, openNotepadWindow, typeInNotepad } from './notepad';

async function clickIfPresent(page: Page, selector: string, label: string): Promise<boolean> {
  const el = page.locator(selector).first();
  const box = await el
    .waitFor({ state: 'visible', timeout: 3500 })
    .then(() => el.boundingBox())
    .catch(() => null);

  if (!box) {
    console.log(`   · ${label} not present.`);
    return false;
  }

  await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 22);
  await sleep(250);
  await humanClick(page);
  await beat(900);
  return true;
}

export const runThreadsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  const list = page.locator('app-thread-list').first();
  await list.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await sleep(600);

  console.log(`   📝 Stating the threads issue before demonstrating it...`);
  await openNotepadWindow(page, 'threads-issue.txt', {
    right: '28px',
    top: '95px',
    width: '650px',
    height: '520px',
  });
  await typeInNotepad(
    page,
    [
      'threads — licensed feature, unlicensed runtime',
      '',
      'mounted ThreadListComponent (injectThreads) and CopilotThreadsDrawer:',
      '- headless list has no thread store and errors / lists nothing',
      '- drawer renders its locked state and opens no thread list',
    ],
    1550,
    270,
  );
  await beat(1500);

  // ── Drive the hand-built injectThreads list ───────────────────────────────
  console.log(`   🧵 Driving the hand-built injectThreads list...`);
  await clickIfPresent(
    page,
    'app-thread-list button:has-text("New conversation")',
    'New conversation',
  );
  await clickIfPresent(page, 'app-thread-list button:has-text("Retry")', 'Retry');

  // ── Inspect CopilotThreadsDrawer ──────────────────────────────────────────
  const drawer = page.locator('copilot-threads-drawer').first();
  const drawerBox = await drawer.boundingBox().catch(() => null);
  if (drawerBox) {
    console.log(`   🧵 Focusing CopilotThreadsDrawer...`);
    await humanGlide(page, drawerBox.x + 30, drawerBox.y + 30, 22);
    await sleep(350);
    await humanClick(page);
    await beat(1000);
  }

  // ── Send a message in the chat beside the drawer ──────────────────────────
  console.log(`   💬 Sending a message in the chat beside the drawer...`);
  const msgCount = await sendPrompt(page, config.prompt, {
    inputSelector: 'app-conversations textarea',
    submitSelector: 'app-conversations copilot-chat-send-button button',
  });
  try {
    await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);
  } catch (e) {
    if (!(e instanceof AgentSilentError)) throw e;
    ctx.warn(`Chat on /threads/demo did not answer within timeout: ${e.message}`);
  }

  ctx.warn(
    'Threads requires CopilotKit Intelligence configured on CopilotRuntime. Without an Intelligence key ' +
      'in frontend/server.ts, injectThreads fails/lists nothing and CopilotThreadsDrawer stays locked, ' +
      'which the guide does not document.',
  );

  console.log(`   📝 Elaborating now that the contrast is on screen...`);
  await typeInNotepad(
    page,
    [
      '',
      '- the agent chat answers fine; only thread persistence is missing',
      '- CopilotRuntime in frontend/server.ts has no Intelligence key,',
      '  so thread create/list/mutate endpoints are unavailable',
      '- the guide never documents this Intelligence requirement',
    ],
    1550,
    380,
  );
  await beat(4500);
  await closeNotepadNote(page);
  await beat(1000);
};
