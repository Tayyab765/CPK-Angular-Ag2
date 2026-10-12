/**
 * Voice and multimodal input — the attachments half works, the transcription
 * half does not, and the clip shows both in that order.
 *
 * https://docs.copilotkit.ai/angular/ag2/guides/voice-multimodal
 */
import { type Page } from 'playwright';

import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { beat, humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';

import { attachFixtureOnCamera, renderRevenueFixture } from './attach-file';
import { closeNotepadNote, showNotepadNote } from './notepad';

async function armMicrophone(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as {
      __allowMic?: () => void;
      __micGate?: Promise<void>;
      __micArmed?: boolean;
      __micSynthetic?: boolean;
    };
    if (w.__micArmed) return;
    w.__micArmed = true;

    w.__micGate = new Promise<void>((resolve) => {
      w.__allowMic = resolve;
    });

    const md = navigator.mediaDevices;
    const original = md.getUserMedia.bind(md);
    md.getUserMedia = async (constraints: MediaStreamConstraints) => {
      await w.__micGate;
      try {
        return await original(constraints);
      } catch {
        w.__micSynthetic = true;
        const ctx = new AudioContext();
        const dest = ctx.createMediaStreamDestination();
        const osc = ctx.createOscillator();
        osc.frequency.value = 220;
        osc.connect(dest);
        osc.start();
        return dest.stream;
      }
    };
  });
}

async function showPermissionBubble(page: Page, origin: string): Promise<void> {
  await page.evaluate((host) => {
    const el = document.createElement('div');
    el.id = 'sim-permission-bubble';
    el.style.cssText =
      'position:fixed!important;top:12px!important;left:96px!important;width:400px!important;' +
      'background:#ffffff!important;color:#202124!important;border-radius:8px!important;' +
      'box-shadow:0 4px 24px rgba(0,0,0,0.35),0 0 0 1px rgba(0,0,0,0.08)!important;' +
      'z-index:2147483642!important;font-family:"Segoe UI",system-ui,sans-serif!important;' +
      'padding:16px 18px!important;opacity:0!important;transform:translateY(-8px)!important;' +
      'transition:opacity .18s ease,transform .18s ease!important;';
    el.innerHTML = [
      '<div style="display:flex;gap:12px;align-items:flex-start;">',
      '  <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368" style="margin-top:2px"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>',
      '  <div style="font-size:14px;line-height:1.45;">',
      '    <div style="font-weight:600;margin-bottom:2px;">' + host + ' wants to</div>',
      '    <div style="color:#3c4043;">Use your microphone</div>',
      '  </div>',
      '</div>',
      '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">',
      '  <button id="sim-permission-block" style="border:1px solid #dadce0;background:#fff;color:#1a73e8;border-radius:4px;padding:7px 14px;font-size:13px;font-weight:500;">Block</button>',
      '  <button id="sim-permission-allow" style="border:none;background:#1a73e8;color:#fff;border-radius:4px;padding:7px 16px;font-size:13px;font-weight:500;">Allow</button>',
      '</div>',
    ].join('');
    document.documentElement.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 30);
  }, origin);
  await sleep(500);
}

async function dismissPermissionBubble(page: Page): Promise<void> {
  await page.evaluate(() => {
    const el = document.getElementById('sim-permission-bubble');
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 220);
  });
  await sleep(300);
}

export const runVoiceAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx,
) => {
  // ── Half one: the attachment, which passes ────────────────────────────────
  const buffer = await renderRevenueFixture(page, rootPath);
  await attachFixtureOnCamera(page, buffer);

  const msgCount = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);
  await beat(1200);

  // ── Half two: the microphone, which records and then cannot transcribe ────
  const origin = new URL(page.url()).host;

  await armMicrophone(page);
  await page
    .context()
    .grantPermissions(['microphone'], { origin: new URL(page.url()).origin })
    .catch(() => console.warn(`   ⚠️ could not grant microphone permission.`));

  const micBtn = page
    .locator(
      'copilot-chat-start-transcribe-button button, button[aria-label*="Transcribe" i]',
    )
    .first();

  const micBox = await micBtn
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => micBtn.boundingBox())
    .catch(() => null);

  if (!micBox) {
    ctx.warn('Transcribe microphone control not found on /voice-multimodal/demo.');
  } else {
    console.log(`   🎙️ Clicking the microphone control...`);
    await humanGlide(page, micBox.x + micBox.width / 2, micBox.y + micBox.height / 2, 22);
    await sleep(400);
    await humanClick(page);

    await showPermissionBubble(page, origin);
    const allowBtn = page.locator('#sim-permission-allow');
    const allowBox = await allowBtn.boundingBox().catch(() => null);
    if (allowBox) {
      await humanGlide(page, allowBox.x + allowBox.width / 2, allowBox.y + allowBox.height / 2, 22);
      await sleep(500);
      await humanClick(page);
    }
    await page.evaluate(() => {
      (window as unknown as { __allowMic?: () => void }).__allowMic?.();
    });
    await dismissPermissionBubble(page);

    const finishBtn = page
      .locator('copilot-chat-finish-transcribe-button button, button[aria-label*="Finish" i]')
      .first();
    const cancelBtn = page
      .locator('copilot-chat-cancel-transcribe-button button, button[aria-label*="Cancel" i]')
      .first();

    const finishes = await finishBtn
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    const stopBtn = finishes ? finishBtn : cancelBtn;

    const recording =
      finishes ||
      (await cancelBtn
        .waitFor({ state: 'visible', timeout: 2000 })
        .then(() => true)
        .catch(() => false));

    const synthetic = await page
      .evaluate(() => (window as unknown as { __micSynthetic?: boolean }).__micSynthetic === true)
      .catch(() => false);

    console.log(
      recording
        ? `   🔴 Recording — stream is ${synthetic ? 'synthesized (no input device)' : 'from the real device'}.`
        : `   ⚠️ The composer never entered its recording state.`,
    );

    await humanGlide(page, micBox.x - 120, micBox.y + micBox.height / 2, 20);
    await beat(4000);

    if (recording) {
      const stopBox = await stopBtn.boundingBox().catch(() => null);
      if (stopBox) {
        console.log(`   ✔️ Finishing — this is the request that has no service behind it.`);
        await humanGlide(page, stopBox.x + stopBox.width / 2, stopBox.y + stopBox.height / 2, 20);
        await sleep(400);
        await humanClick(page);
        await beat(3000);
      }
    }

    ctx.warn(
      'Attachment succeeded, but voice transcription failed with 503 TRANSCRIPTION_SERVICE_NOT_CONFIGURED ' +
        'because CopilotRuntime has no `transcriptionService` configured (and the guide only documents ' +
        'frontend `AttachmentsConfig`).',
    );
  }

  await showNotepadNote(page, 'voice-notes.txt', [
    'The attachment worked — the agent read the chart it was sent.',
    '',
    'The microphone works too, but transcription has nothing behind it:',
    'no transcription service is configured on this runtime, so the',
    'request fails when recording stops. Expected, not a defect.',
    '',
    'The permission bubble and the Open dialog are drawn by the recorder;',
    'Chrome and Windows draw the real ones outside the video. The file and',
    'the reply are real.',
  ]);
  await closeNotepadNote(page);
  await beat(800);
};
