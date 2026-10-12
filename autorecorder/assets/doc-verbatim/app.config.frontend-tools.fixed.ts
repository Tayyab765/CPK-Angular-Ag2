import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideCopilotKit,
  type SandboxFunction,
} from '@copilotkit/angular';
import { z } from 'zod';

import { routes } from '../app/app.routes';

/**
 * THE FIX, not doc code: the guide's function with the generic dropped and the
 * cast moved inside the handler.
 */
const setDashboardFilter: SandboxFunction = {
  name: 'setDashboardFilter',
  description: 'Set the active dashboard filter',
  parameters: z.object({ filter: z.string() }),
  handler: async (args) => {
    const { filter } = args as { filter: string };
    sessionStorage.setItem('dashboard-filter', filter);
    return { applied: filter };
  },
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideClientHydration(),
    provideCopilotKit({
      runtimeUrl: 'http://localhost:8200/api/copilotkit',
      a2ui: {
        recovery: { showAfterMs: 2_000, showAfterAttempts: 2 },
      },
      openGenerativeUI: {
        sandboxFunctions: [setDashboardFilter],
      },
    }),
  ],
};

