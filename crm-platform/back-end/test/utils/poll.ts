export async function pollUntil<T>(
  check: () => Promise<T | null>,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 10000;
  const intervalMs = options.intervalMs ?? 200;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await check();

    if (result) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`pollUntil timed out after ${timeoutMs}ms`);
}
