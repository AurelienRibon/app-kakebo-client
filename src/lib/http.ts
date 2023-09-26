import { logInfo } from './logs';
import { retry } from './utils';

export async function postJSON(url: string, content: unknown) {
  const body = await compressData(JSON.stringify(content));
  const headers = { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' };

  logInfo('Fetching remote...');

  const fn = () => fetch(url, { method: 'POST', headers, body });
  const res = await retry(fn);

  if (!res.ok) {
    logInfo(`Request failed with status ${res.status} (${res.statusText}).`);
    logInfo(await res.text());
    return;
  }

  logInfo('Fetch success!');
  const json = await res.json();
  return json;
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

async function compressData(content: string): Promise<Blob> {
  const bytes = new TextEncoder().encode(content);
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const chunks = [];
  const reader = cs.readable.getReader();

  let result;
  while (!(result = await reader.read()).done) {
    chunks.push(result.value);
  }

  return new Blob(chunks);
}
