import * as allure from 'allure-js-commons';

/**
 * Thin wrapper around `allure.step` so specs have a single import point for
 * step reporting. Screenshots are NOT taken per step: Playwright itself
 * captures one final full-page screenshot per test (screenshot mode "on" in
 * playwright.config.ts) and a video for failed tests, which both reports pick
 * up automatically.
 */
export async function step<T>(name: string, body: () => T | Promise<T>): Promise<T> {
  return await allure.step(name, body);
}
