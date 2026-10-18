export async function getHealth(signal: AbortSignal): Promise<unknown> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/health`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const result: unknown = await response.json();
  return result;
}
