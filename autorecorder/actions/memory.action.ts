/**
 * Memory — the `isAvailable()` gate is the lesson, and here it is false.
 *
 * https://docs.copilotkit.ai/angular/ag2/guides/threads-memory-attachments-headless
 *
 * This runtime serves no memory routes, so the guide's fallback branch is what
 * renders ("Memory is not available for this runtime."). Resting on that panel
 * before prompting and writing a concise Notepad note makes the recording
 * legible: the chat answers, the memory list says it cannot, and both are on
 * screen in the same video.
 */
import { type Page } from 'playwright';

import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { beat, humanGlide } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { closeNotepadNote, openNotepadWindow, typeInNotepad } from './notepad';

export const runMemoryAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  const panel = page.locator('app-memory-list').first();
  const box = await panel.boundingBox().catch(() => null);
  if (box) {
    console.log(`   🧠 Resting on the injectMemories panel (isAvailable() gate)...`);
    await humanGlide(page, box.x + box.width / 2, box.y + 40, 22);
    await beat(1800);
  }

  const msgCount = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  const panelText = ((await panel.innerText().catch(() => '')) || '').trim();
  const unavailable = /not available for this runtime/i.test(panelText);
  if (unavailable) {
    ctx.warn(
      'injectMemories().isAvailable() is false ("Memory is not available for this runtime.") because ' +
        'CopilotRuntime requires CopilotKit Intelligence memory routes that the guide never documents.',
    );

    console.log(`   📝 Explaining the memory availability gate in Notepad...`);
    await openNotepadWindow(page, 'memory-notes.txt', {
      right: '32px',
      top: '110px',
      width: '640px',
      height: '320px',
    });
    await typeInNotepad(
      page,
      [
        'memory — isAvailable() is false on this runtime',
        '',
        '- MemoryListComponent mounts injectMemories({ agentId: "default" })',
        '- renders fallback: "Memory is not available for this runtime."',
        '- chat beside it works normally, but memory routes require',
        '  CopilotKit Intelligence on CopilotRuntime (undocumented in guide)',
      ],
      1550,
      250,
    );
    await beat(4200);
    await closeNotepadNote(page);
    await beat(1000);
  }
};

