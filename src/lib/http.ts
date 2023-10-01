import { logInfo } from './logs';
import { retry } from './utils';

type Request = {
  data: unknown;
  gzip?: boolean;
  headers?: Headers;
};

type Headers = Record<string, string>;

export async function postJSON(url: string, request: Request) {
  if (url.startsWith('/')) {
    url = `https://kakebo.aurelienribon.repl.co${url}`;

    if (!import.meta.env.PROD) {
      url += url.includes('?') ? '&dev=1' : '?dev=1';
    }
  }

  const headers = { 'Content-Type': 'application/json', ...request.headers } as Headers;
  let body = JSON.stringify(request.data) as any;

  if (request.gzip) {
    headers['Content-Encoding'] = 'gzip';
    body = await compressData(body);
  }

  logInfo(`Fetching ${url}`);

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
