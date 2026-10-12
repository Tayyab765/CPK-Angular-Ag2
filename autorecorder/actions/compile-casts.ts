/**
 * The real commands whose output the compile-error clips replay.
 *
 * Captured by `npm run capture:casts` (scripts/capture-casts.ts) into
 * assets/casts/.
 */
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RECORDER = fileURLToPath(new URL('..', import.meta.url));
const REPO = join(RECORDER, '..');
const FRONTEND = join(REPO, 'frontend');

export interface CastSpec {
  file: string;
  command: string;
  cwd: string;
  stopWhen: RegExp;
  /** A capture that lacks this did not reproduce the finding. */
  expect: RegExp;
  /** Files the command compiled; a newer one makes the cast stale. */
  sources: string[];
}

const cast = (name: string) => join(RECORDER, 'assets', 'casts', `${name}.cast`);
const verbatim = (name: string) => join(RECORDER, 'assets', 'doc-verbatim', name);
const src = (p: string) => join(FRONTEND, ...p.split('/'));

export const CASTS = {
  frontendToolsDoc: {
    file: cast('frontend-tools-doc'),
    command: 'npx ng serve --configuration doc-frontend-tools --port 4211',
    cwd: FRONTEND,
    stopWhen: /Watch mode enabled/,
    expect: /TS2322: Type 'SandboxFunction<\{ filter: string; \}>' is not assignable/,
    sources: [verbatim('app.config.frontend-tools.ts'), src('angular.json')],
  },
  frontendToolsFixed: {
    file: cast('frontend-tools-fixed'),
    command: 'npx ng serve --configuration doc-frontend-tools-fixed --port 4211',
    cwd: FRONTEND,
    stopWhen: /Local:\s+http/,
    expect: /Application bundle generation complete/,
    sources: [verbatim('app.config.frontend-tools.fixed.ts'), src('angular.json')],
  },
  a2uiDoc: {
    file: cast('a2ui-doc'),
    command: 'npx ng serve --configuration doc-a2ui --port 4212',
    cwd: FRONTEND,
    stopWhen: /Watch mode enabled/,
    expect: /TS2304: Cannot find name 'dynamicString'/,
    sources: [verbatim('a2ui.ts'), src('angular.json')],
  },
} satisfies Record<string, CastSpec>;
