/**
 * Shared state — recorded with error/finding verification and on-screen Notepad notes.
 *
 * https://docs.copilotkit.ai/angular/ag2/guides/shared-state
 *
 * In CPK-Angular-Ag2, the frontend mounts `WorkspaceComponent` (`injectAgentStore`,
 * `agent.setState`) and `AccountContextComponent` (`connectAgentContext`).
 * However, as documented in README.md Known Issues:
 *   "Shared state is not wired on the backend. This AG2 agent holds no state, so
 *    `/shared-state`'s `injectAgentStore` sees an empty state and nothing updates."
 *
 * This action exercises the UI controls ("Mark high priority", "Mark low priority",
 * "Use London time"), asks the agent for priority and timezone, inspects the
 * reply, records a warning via `ctx.warn` when state/context is not reflected,
 * and types a clear error-reporting note in Notepad with the UI panel visible behind it.
 */
import { type Page } from 'playwright';

import { SELECTORS } from '../config/selectors.config';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { beat, humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { closeNotepadNote, openNotepadWindow, typeInNotepad } from './notepad';

async function clickControl(
  ctx: ActionContext,
  page: Page,
  selector: string,
  label: string,
): Promise<void> {
  const button = page.locator(selector).first();
  const box = await button.boundingBox().catch(() => null);
  if (!box) {
    ctx.warn(`"${label}" button not found on /shared-state/demo.`);
    return;
  }
  await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
  await sleep(350);
  await humanClick(page);
  await beat(900);
}

export const runSharedStateAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  const [
    highPrompt = 'What is the current workspace priority and my account timezone?',
    lowPrompt,
    tzPrompt,
  ] = promptsFor(config);
  const wait = config.waitAfterPromptMs ?? 4000;

  // ── Step 1: Write state ("Mark high priority") and context ("Use London time") ──
  console.log(`   🔄 Clicking "Mark high priority" on app-workspace...`);
  await clickControl(
    ctx,
    page,
    'app-workspace button:has-text("Mark high priority")',
    'Mark high priority',
  );

  console.log(`   🌍 Clicking "Use London time" on app-account-context...`);
  await clickControl(
    ctx,
    page,
    'app-account-context button:has-text("Use London time")',
    'Use London time',
  );

  console.log(`   💬 Turn 1: ${highPrompt}`);
  const count1 = await sendPrompt(page, highPrompt);
  await waitForAgentResponseCompletion(page, wait, count1);

  if (lowPrompt) {
    console.log(`   🔄 Clicking "Mark low priority"...`);
    await clickControl(
      ctx,
      page,
      'app-workspace button:has-text("Mark low priority")',
      'Mark low priority',
    );
    console.log(`   💬 Turn 2: ${lowPrompt}`);
    const count2 = await sendPrompt(page, lowPrompt);
    await waitForAgentResponseCompletion(page, wait, count2);
  }

  if (tzPrompt) {
    console.log(`   💬 Turn 3: ${tzPrompt}`);
    const count3 = await sendPrompt(page, tzPrompt);
    await waitForAgentResponseCompletion(page, wait, count3);
  }

  const answer = (
    await page
      .locator(SELECTORS.assistantMessage)
      .last()
      .innerText()
      .catch(() => '')
  ).toLowerCase();

  const sawState = /\b(high|low)\b/.test(answer);
  const sawContext = /\bada\b/.test(answer) || /\blondon\b/.test(answer);
  console.log(
    `   · Answer carries state: ${sawState ? 'yes' : 'NO'}, context: ${sawContext ? 'yes' : 'NO'}`,
  );

  const workspace = page.locator('app-workspace').first();
  const wsBox = await workspace.boundingBox().catch(() => null);
  if (wsBox) {
    console.log(`   🎯 Resting on the shared-state workspace panel.`);
    await humanGlide(page, wsBox.x + wsBox.width / 2, wsBox.y + wsBox.height / 2, 22);
    await beat(2000);
  }

  if (!sawState || !sawContext) {
    ctx.warn(
      `Shared state / context gap on AG2: answer reflected state=${sawState}, context=${sawContext}. ` +
        `The AG2 backend holds no session state, and the Angular shared-state guide provides only frontend ` +
        `snippets (injectAgentStore / connectAgentContext) without backend state wiring.`,
    );

    console.log(`   📝 Writing shared-state error report in Notepad...`);
    await openNotepadWindow(page, 'shared-state-notes.txt', {
      right: '32px',
      top: '105px',
      width: '680px',
      height: '330px',
    });
    await typeInNotepad(
      page,
      [
        'shared-state — frontend writes state, AG2 backend holds none',
        '',
        '- UI panel updates to "Priority: high" and "Timezone: Europe/London"',
        '- agent.setState({ priority: "high" }) and connectAgentContext run in browser',
        '- AG2 WeatherAgent has no backend state store wired, and the guide',
        '  only documents Angular frontend calls without AG2 backend state setup',
      ],
      1550,
      250,
    );
    await beat(4200);
    await closeNotepadNote(page);
    await beat(1000);
  }
};
