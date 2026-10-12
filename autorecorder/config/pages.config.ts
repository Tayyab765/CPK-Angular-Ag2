/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 3 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One entry per doc page, in the order the doc nav lists them, plus the
 * compile-error findings clips.
 *
 * Everything here mirrors `frontend/src/app/lib/nav-config.ts`, the app's single
 * source of truth for route -> doc-page mapping. `docPath` is that file's
 * `docPath` minus its leading `/angular/ag2`. Four routes (threads, memory,
 * attachments, headless) repeat one `docPath` because the Angular docs cover all
 * four topics on a single page.
 */

import { definePages } from '../core/types';

export const PAGES = definePages([
  {
    id: 'quickstart',
    name: 'Quickstart',
    videoName: 'Quickstart',
    docPath: 'quickstart',
    route: 'quickstart',
    ideFile: 'frontend/VERSIONS.md',
    startLine: 6,
    endLine: 20,
    extraTabs: [
      {
        filePath: 'frontend/package.json',
        startLine: 19,
        endLine: 36,
      },
      {
        filePath: 'frontend/src/app/features/quickstart/quickstart-chat.ts',
        startLine: 8,
        endLine: 20,
      },
      { filePath: 'frontend/server.ts', startLine: 26, endLine: 45 },
      { filePath: 'backend/main.py', startLine: 39, endLine: 60 },
    ],
    prompt: 'What is the weather in Tokyo?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'chat-ui',
    name: 'Guides - Chat UI and customization',
    videoName: 'ChatUi',
    docPath: 'guides/chat-ui',
    route: 'chat-ui',
    ideFile: 'frontend/src/app/features/chat-ui/chat-ui-demo.component.ts',
    startLine: 28,
    endLine: 56,
    extraTabs: [
      {
        filePath: 'frontend/src/app/features/chat-ui/chat-ui-demo.component.ts',
        startLine: 57,
        endLine: 107,
      },
      {
        filePath:
          'frontend/src/app/features/chat-ui/custom-assistant-message.component.ts',
        startLine: 13,
        endLine: 25,
      },
    ],
    prompt: 'In two sentences, what does CopilotKit do?',
    prompts: [
      'In two sentences, what does CopilotKit do?',
      'Nice layout. What is different about how you are rendered here?',
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: 'frontend-tools-generative-ui',
    name: 'Guides - Frontend tools and generative UI',
    videoName: 'FrontendToolsGenerativeUi',
    docPath: 'guides/frontend-tools-generative-ui',
    route: 'frontend-tools-generative-ui',
    ideFile: 'frontend/src/app/features/tools/tools-chat.component.ts',
    startLine: 55,
    endLine: 78,
    extraTabs: [
      {
        filePath: 'frontend/src/app/features/tools/weather-card.component.ts',
        startLine: 10,
        endLine: 27,
      },
      {
        filePath: 'frontend/src/app/features/tools/incident-card.component.ts',
        startLine: 19,
        endLine: 35,
      },
      {
        filePath: 'frontend/src/app/app.config.ts',
        startLine: 19,
        endLine: 27,
      },
    ],
    prompt: 'Check the weather in Tokyo for me.',
    prompts: [
      'Check the weather in Tokyo for me.',
      'Could you change the background to violet?',
      'Pull up incident INC-4711 for me. It is a sev1.',
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: 'a2ui',
    name: 'Guides - Generative UI with A2UI',
    videoName: 'A2ui',
    docPath: 'guides/a2ui',
    route: 'a2ui',
    ideFile: 'frontend/src/app/features/a2ui/a2ui-chat.component.ts',
    startLine: 10,
    endLine: 22,
    extraTabs: [
      { filePath: 'frontend/server.ts', startLine: 19, endLine: 40 },
      { filePath: 'frontend/src/app/app.config.ts', startLine: 51, endLine: 64 },
    ],
    prompt: 'Render a flight status card for flight CPK-42 from SFO to JFK.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'voice-multimodal',
    name: 'Guides - Voice and multimodal input',
    videoName: 'VoiceMultimodal',
    docPath: 'guides/voice-multimodal',
    route: 'voice-multimodal',
    ideFile: 'frontend/src/app/features/media/voice-chat.component.ts',
    startLine: 10,
    endLine: 27,
    prompt: 'Have a look at the chart I attached. What is it titled, and what does Q4 come to?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'human-in-the-loop',
    name: 'Guides - Human-in-the-loop and interrupts',
    videoName: 'HumanInTheLoop',
    docPath: 'guides/human-in-the-loop',
    route: 'human-in-the-loop',
    ideFile: 'frontend/src/app/features/hitl/approval-tools.service.ts',
    startLine: 13,
    endLine: 26,
    extraTabs: [
      {
        filePath: 'frontend/src/app/features/hitl/approval-card.component.ts',
        startLine: 16,
        endLine: 39,
      },
      {
        filePath: 'frontend/src/app/features/hitl/interrupt-panel.component.ts',
        startLine: 14,
        endLine: 55,
      },
    ],
    prompt: 'Please delete my account. Check with me before you actually do it.',
    prompts: [
      'Please delete my account. Check with me before you actually do it.',
      'Yes, delete my account.',
      'Yes, go ahead.',
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: 'shared-state',
    name: 'Guides - Shared state and agent context',
    videoName: 'SharedState',
    docPath: 'guides/shared-state',
    route: 'shared-state',
    ideFile: 'frontend/src/app/features/shared-state/workspace.component.ts',
    startLine: 19,
    endLine: 48,
    extraTabs: [
      {
        filePath:
          'frontend/src/app/features/shared-state/account-context.component.ts',
        startLine: 9,
        endLine: 31,
      },
      {
        filePath: 'backend/main.py',
        startLine: 46,
        endLine: 60,
      },
    ],
    prompt: 'What is the current workspace priority and my account timezone?',
    prompts: [
      'What is the current workspace priority and my account timezone?',
      'And now? What is the workspace priority?',
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: 'threads',
    name: 'Threads',
    videoName: 'Threads',
    docPath: 'guides/threads-memory-attachments-headless',
    route: 'threads',
    ideFile: 'frontend/src/app/features/threads/thread-list.component.ts',
    startLine: 8,
    endLine: 40,
    extraTabs: [
      {
        filePath: 'frontend/src/app/features/threads/threads-demo.component.ts',
        startLine: 10,
        endLine: 35,
      },
      {
        filePath: 'frontend/src/app/features/threads/conversations.component.ts',
        startLine: 14,
        endLine: 23,
      },
    ],
    prompt: 'In one line, what are threads for?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'memory',
    name: 'Memory',
    videoName: 'Memory',
    docPath: 'guides/threads-memory-attachments-headless',
    route: 'memory',
    ideFile: 'frontend/src/app/features/memory/memory-list.component.ts',
    startLine: 9,
    endLine: 39,
    extraTabs: [
      {
        filePath: 'frontend/src/app/features/memory/memory-demo.component.ts',
        startLine: 10,
        endLine: 29,
      },
    ],
    prompt: 'Remember that I prefer temperatures in Celsius.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'attachments',
    name: 'Attachments',
    videoName: 'Attachments',
    docPath: 'guides/threads-memory-attachments-headless',
    route: 'attachments',
    ideFile: 'frontend/src/app/features/attachments/media-chat.component.ts',
    startLine: 9,
    endLine: 23,
    prompt: 'Have a look at the chart I attached. What is it titled, and what does Q4 come to?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'headless',
    name: 'Headless UI',
    videoName: 'HeadlessUi',
    docPath: 'guides/threads-memory-attachments-headless',
    route: 'headless',
    ideFile: 'frontend/src/app/features/headless/headless-chat.component.ts',
    startLine: 10,
    endLine: 60,
    prompt: 'Tell me a short joke about Angular developers.',
    waitAfterPromptMs: 4000,
  },
  // ── Compile-error findings clips ───────────────────────────────────────────
  {
    id: 'frontend-tools-compile',
    name: 'Compile Error - Frontend tools SandboxFunction (TS2322)',
    videoName: 'FrontendToolsCompileError',
    docPath: 'guides/frontend-tools-generative-ui',
    route: 'frontend-tools-generative-ui',
    ideFile: 'frontend/src/app/app.config.ts',
    startLine: 19,
    endLine: 27,
    extraTabs: [
      { filePath: 'frontend/src/app/app.config.ts', startLine: 51, endLine: 64 },
    ],
    prompt: 'No prompt: this take compiles the guide code (see actions/compile-demos.action.ts).',
  },
  {
    id: 'a2ui-compile',
    name: 'Compile Error - A2UI undefined names (TS2304)',
    videoName: 'A2uiUndefinedNames',
    docPath: 'guides/a2ui',
    route: 'a2ui',
    ideFile: 'frontend/src/app/app.config.ts',
    startLine: 51,
    endLine: 55,
    extraTabs: [
      { filePath: 'frontend/src/app/features/a2ui/a2ui-chat.component.ts', startLine: 1, endLine: 22 },
    ],
    prompt: 'No prompt: this take compiles the guide code (see actions/compile-demos.action.ts).',
  },
]);
