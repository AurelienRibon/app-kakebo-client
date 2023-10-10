import { postJSON } from '../lib/http';

export async function askGPT(chat: string[]): Promise<string> {
  console.log('askGPT', chat);
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  const messages = generateMessages(chat);

  const json = await postJSON('https://api.openai.com/v1/chat/completions', {
    headers: { Authorization: `Bearer ${key}` },
    data: { model: 'gpt-4', messages, temperature: 0.2 },
  });

  const answer = json?.choices?.[0]?.message?.content;
  return answer ?? JSON.stringify(json, null, 2);
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function generateMessages(chat: string[]) {
  const messages = [{ role: 'system', content: chat[0] }];
  let role = 'user';

  for (const message of chat.slice(1)) {
    messages.push({ role, content: message });
    role = role === 'user' ? 'assistant' : 'user';
  }

  return messages;
}
