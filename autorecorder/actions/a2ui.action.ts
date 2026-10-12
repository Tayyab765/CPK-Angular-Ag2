/**
 * A2UI — enabled on the runtime, inert in the browser, and the recording says so.
 *
 * https://docs.copilotkit.ai/angular/ag2/guides/a2ui
 *
 * `a2ui: {}` in frontend/server.ts turns the middleware on and `/info` duly
 * reports `a2uiEnabled: true`, but supplying `a2ui.catalog` is what actually
 * registers the `render_a2ui` renderer — and the guide's catalog snippet is not
 * self-contained (it references `dynamicString`, `beautifulCatalog`,
 * `declarativeCatalog`, `fixedCatalog` and `productCatalog`, none of which the
 * guide defines). So the agent answers in prose and no declarative UI appears.
 *
 * The prompt is still sent: "asked for a card, got a paragraph" is the finding,
 * and it is only demonstrable by asking. The Notepad note then records what is
 * missing, while the prose answer is still on screen behind it.
 */
import { type Page } from 'playwright';

import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { beat, humanGlide } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';

import {
  CATALOG_CODE_NOTE,
  returnToDemo,
  showReconstructedCatalogCode,
} from './catalog-code';
import { closeNotepadNote, openNotepadWindow, typeInNotepad } from './notepad';

/** Anything the A2UI renderer would have mounted. */
const A2UI_SURFACE =
  'copilot-a2ui, [class*="a2ui"], .a2ui-row, .a2ui-flight-card';

async function writeCatalogCodeNote(page: Page): Promise<void> {
  await openNotepadWindow(page, 'a2ui-catalogs.txt', {
    top: '150px',
    right: '48px',
    width: '560px',
    height: '380px',
  });
  await typeInNotepad(page, CATALOG_CODE_NOTE, 1600, 260);
  await beat(3500);
  await closeNotepadNote(page);
}

export const runA2uiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  if (await showReconstructedCatalogCode(page, config, writeCatalogCodeNote)) {
    await returnToDemo(page, config);
  }

  console.log(`   🎨 Asking for declarative UI: ${config.prompt}`);
  const msgCount = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  const rendered = await page.locator(A2UI_SURFACE).count().catch(() => 0);
  if (rendered > 0) {
    console.log(`   ✅ ${rendered} A2UI element(s) rendered — a catalog is registered after all.`);
  } else {
    console.log(`   · No A2UI elements rendered, as expected without a catalog.`);
    ctx.warn(
      'A2UI is enabled on CopilotRuntime (a2uiEnabled: true), but no A2UI surface rendered because ' +
        'the guide catalog snippets reference undefined identifiers (dynamicString, productCatalog, ' +
        'beautifulCatalog, declarativeCatalog, fixedCatalog) and never show how to construct a Catalog.',
    );
  }

  await openNotepadWindow(page, 'a2ui-notes.txt', {
    right: '32px',
    top: '95px',
    width: '680px',
    height: '560px',
  });

  await typeInNotepad(
    page,
    rendered > 0
      ? [
          'a2ui — rendering',
          '',
          'declarative UI mounted; this note is stale, update pages.config.ts',
          'and drop the finding from the README known issues.',
        ]
      : [
          '',
          'a2ui is enabled but not actually working',
          '',
          'the runtime says a2ui is enabled',
          'but the agent still only responds with normal text',
          '',
          'the problem is that the required catalog is missing',
          'and the guide examples are incomplete and reference undefined pieces',
          '',
          'need: one complete catalog example that shows everything needed',
          'to make a component render end to end',
        ],
    1550,
    260,
  );

  console.log(`   📖 Holding on the note...`);
  await humanGlide(page, 1550, 360, 20);
  await beat(5000);
  await closeNotepadNote(page);
  await beat(1200);
};

