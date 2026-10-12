/**
 * Frontend tools and generative UI — two halves work, the third is the finding.
 *
 * https://docs.copilotkit.ai/angular/ag2/guides/frontend-tools-generative-ui
 *
 * Turn 1 calls `getWeather` (`get_weather` on AG2), rendered by `app-weather-card`.
 * Turn 2 calls `change_background`, which runs in the browser and repaints the page.
 * Turn 3 calls `show_incident` (`registerComponent`), which surfaces 4 defects in
 * the published guide against @copilotkit/angular 0.5.x:
 *   1. No handler means core returns an empty tool result, giving the model an
 *      unrequested second turn (often a false apology). `followUp: false` suppresses
 *      it, which the guide omits.
 *   2. The snippet guards on `status === "in-progress"`, whereas the live streaming
 *      status is `"executing"`, so the card paints empty while arguments stream.
 *   3. Status never reaches `"complete"`, so gating on `"complete"` hangs forever.
 *   4. No CSS and Angular's `preserveWhitespaces: false` collapses `</strong><span>`
 *      into `INC-4711sev1`.
 */
import { type Page } from 'playwright';

import { SELECTORS } from '../config/selectors.config';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { beat, humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { closeNotepadNote, openNotepadWindow, typeInNotepad } from './notepad';

/**
 * ToolsChatComponent mounts `<copilot-sidebar />`. If the sidebar starts closed
 * behind its launcher button, open it before attempting to type into the composer.
 */
async function ensureSidebarOpen(page: Page): Promise<void> {
  const input = page.locator(SELECTORS.chatInput).first();
  if (await input.isVisible().catch(() => false)) return;

  const launcher = page
    .locator(
      'copilot-sidebar button[aria-label*="Open" i], ' +
        'copilot-sidebar button[aria-label*="chat" i], ' +
        'copilot-sidebar button',
    )
    .first();
  const box = await launcher.boundingBox().catch(() => null);
  if (box) {
    console.log(`   📂 Opening <copilot-sidebar /> launcher...`);
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
    await sleep(250);
    await humanClick(page);
    await input.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    await beat(600);
  }
}

async function readCardHeading(page: Page): Promise<string | null> {
  return page
    .evaluate(() => {
      const card = document.querySelector('app-weather-card');
      if (!card) return null;
      const strong = card.querySelector('strong');
      return (strong?.textContent ?? '').trim();
    })
    .catch(() => null);
}

async function readIncidentCard(
  page: Page,
): Promise<{ id: string; severity: string } | null> {
  return page
    .evaluate(() => {
      const card = document.querySelector('app-incident-card');
      if (!card) return null;
      return {
        id: (card.querySelector('strong')?.textContent ?? '').trim(),
        severity: (card.querySelector('span')?.textContent ?? '').trim(),
      };
    })
    .catch(() => null);
}

export const runToolsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  const [weatherPrompt, backgroundPrompt, incidentPrompt] = promptsFor(config);
  const wait = config.waitAfterPromptMs ?? 4000;

  await ensureSidebarOpen(page);

  // ── Turn 1: Server-side tool, rendered by an Angular component ────────────
  console.log(`   🌤️ Server tool: ${weatherPrompt}`);
  const firstCount = await sendPrompt(page, weatherPrompt);

  const weatherCard = page.locator('app-weather-card').first();
  await weatherCard.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {
    ctx.warn(
      'app-weather-card did not mount on getWeather -- Note: AG2 backend registers `get_weather` ' +
        '(snake_case) while the frontend tool renderer registers `getWeather` (camelCase).',
    );
  });

  await waitForAgentResponseCompletion(page, wait, firstCount);

  const heading = await readCardHeading(page);
  if (heading === null) {
    // Already logged warning above when the card did not mount.
  } else if (heading.length === 0) {
    ctx.warn('Weather card heading rendered empty -- the argument names in the renderer do not match the tool call.');
  } else {
    console.log(`   ✅ Card heading reads "${heading}".`);
  }

  const cardBox = await weatherCard.boundingBox().catch(() => null);
  if (cardBox) {
    console.log(`   🎯 Resting on the card.`);
    await humanGlide(page, cardBox.x + 60, cardBox.y + 18, 22);
    await beat(2400);
    await humanGlide(page, cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2, 18);
    await beat(1400);
  }

  // ── Turn 2: Browser-side tool, whose output is the page repainting ────────
  if (backgroundPrompt) {
    console.log(`   🎨 Frontend tool: ${backgroundPrompt}`);
    const secondCount = await sendPrompt(page, backgroundPrompt);
    await waitForAgentResponseCompletion(page, 3000, secondCount);

    console.log(`   ✨ Showing the repainted background.`);
    await humanGlide(page, 500, 350, 25);
    await beat(1000);
    await humanGlide(page, 700, 520, 25);
    await beat(1800);
  }

  // ── Turn 3: Display-only registration (`registerComponent`) findings ──────
  if (!incidentPrompt) return;

  console.log(`   🪪 Display-only tool: ${incidentPrompt}`);
  const thirdCount = await sendPrompt(page, incidentPrompt);

  const incidentCard = page.locator('app-incident-card').first();
  await incidentCard.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {
    ctx.fail('app-incident-card never rendered -- registerComponent did not fire.');
  });

  const atMount = await readIncidentCard(page);
  console.log(
    `   🔎 At mount: id="${atMount?.id ?? '(no card)'}" severity="${atMount?.severity ?? ''}"`,
  );

  await waitForAgentResponseCompletion(page, wait, thirdCount);

  const settled = await readIncidentCard(page);
  if (settled && settled.id) {
    console.log(`   ✅ Card settled: ${settled.id} / ${settled.severity}.`);
    ctx.warn(
      'registerComponent (`show_incident`) mounted `INC-4711sev1` with 4 doc defects: ' +
        '(1) missing `followUp: false` triggers an extra unrequested model turn/apology on empty tool result, ' +
        '(2) `status === "in-progress"` guard never matches `"executing"`, ' +
        '(3) status never reaches `"complete"`, ' +
        '(4) missing CSS + whitespace stripping concatenates `id` and `severity`.',
    );
  } else {
    ctx.warn('Incident card mounted but never filled in -- id and severity stayed empty after the reply settled.');
  }

  const incidentBox = await incidentCard.boundingBox().catch(() => null);
  if (incidentBox) {
    console.log(`   🎯 Resting on the incident card.`);
    await humanGlide(page, incidentBox.x + 60, incidentBox.y + 18, 22);
    await beat(2200);
    console.log(`   👇 Travelling to the follow-up message beneath it.`);
    await humanGlide(page, incidentBox.x + 80, incidentBox.y + incidentBox.height + 70, 20);
    await beat(2400);
  }

  console.log(`   📝 Writing the four findings up while they are on screen...`);
  await openNotepadWindow(page, 'registercomponent-findings.txt', {
    left: '28px',
    right: 'auto',
    transform: 'none',
    top: '95px',
    width: '640px',
    height: '430px',
  });
  await typeInNotepad(
    page,
    [
      '1. the card is right; the apology under it is not.',
      '   no handler means no result, and the model reads',
      '   that as failure. followUp: false fixes it - and',
      '   the guide never mentions followUp.',
    ],
    340,
    260,
  );
  await beat(2800);

  await typeInNotepad(
    page,
    [
      '',
      '2. guards on "in-progress"; real status is',
      '   "executing", so the card paints empty.',
      '3. "complete" never arrives - gating on it hangs.',
    ],
    340,
    340,
  );
  await beat(3000);

  await typeInNotepad(
    page,
    [
      '',
      '4. no css; angular strips the tag gap, so it',
      '   renders INC-4711sev1, not a card.',
      'also: no imports, no injection context, preamble.',
    ],
    340,
    420,
  );
  await beat(3800);
  await closeNotepadNote(page);
  await beat(1000);
};
