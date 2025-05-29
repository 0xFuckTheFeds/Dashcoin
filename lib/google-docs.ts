import { google, docs_v1 } from 'googleapis';
import type { JWT } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];

let cachedAuth: JWT | null = null;

function getCredentials(): any {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY env var not set');
  }
  try {
    return JSON.parse(key);
  } catch {
    // handle case where key is base64 encoded
    const json = Buffer.from(key, 'base64').toString('utf8');
    return JSON.parse(json);
  }
}

async function authorize(): Promise<JWT> {
  if (cachedAuth) return cachedAuth;
  const creds = getCredentials();
  const client = new google.auth.JWT(
    creds.client_email,
    undefined,
    creds.private_key,
    SCOPES,
  );
  await client.authorize();
  cachedAuth = client;
  return client;
}

export async function fetchDocument(docId: string): Promise<docs_v1.Schema$Document> {
  const auth = await authorize();
  const docs = google.docs({ version: 'v1', auth });
  const res = await docs.documents.get({ documentId: docId });
  return res.data;
}

export async function getDocumentHtml(docId: string): Promise<{ html: string; title: string }> {
  const doc = await fetchDocument(docId);
  const html = convertElementsToHtml(doc.body?.content || [], doc);
  return { html, title: doc.title || '' };
}

function renderText(textRun: docs_v1.Schema$TextRun): string {
  let text = textRun.content || '';
  if (text === '\n') return '';
  const style = textRun.textStyle || {};
  if (style.link?.url) {
    text = `<a href="${style.link.url}">${text}</a>`;
  }
  if (style.bold) text = `<strong>${text}</strong>`;
  if (style.italic) text = `<em>${text}</em>`;
  if (style.underline) text = `<u>${text}</u>`;
  return text;
}

function convertElementsToHtml(
  elements: docs_v1.Schema$StructuralElement[],
  doc: docs_v1.Schema$Document,
): string {
  let html = '';
  const listStack: { id: string; tag: string; level: number }[] = [];
  const lists = doc.lists || {};

  function closeLists(toLevel: number) {
    while (listStack.length > toLevel) {
      const item = listStack.pop();
      if (item) html += `</${item.tag}>`;
    }
  }

  for (const el of elements) {
    if (!el.paragraph) continue;
    const para = el.paragraph;
    const bullet = para.bullet;
    const named = para.paragraphStyle?.namedStyleType;
    const textRuns = (para.elements || [])
      .map(e => e.textRun ? renderText(e.textRun) : '')
      .join('');

    if (bullet && bullet.listId && lists[bullet.listId]) {
      const level = bullet.nestingLevel || 0;
      const listDef = lists[bullet.listId];
      const glyph = listDef.listProperties?.nestingLevels?.[level]?.glyphType;
      const tag = glyph ? 'ol' : 'ul';
      if (listStack.length <= level || listStack[level]?.id !== bullet.listId) {
        closeLists(level);
        listStack.push({ id: bullet.listId, tag, level });
        html += `<${tag}>`;
      }
      html += `<li>${textRuns}</li>`;
    } else {
      closeLists(0);
      if (named === 'HEADING_1') html += `<h1>${textRuns}</h1>`;
      else if (named === 'HEADING_2') html += `<h2>${textRuns}</h2>`;
      else if (named === 'HEADING_3') html += `<h3>${textRuns}</h3>`;
      else html += `<p>${textRuns}</p>`;
    }
  }
  closeLists(0);
  return html;
}

export async function getDocumentsList(): Promise<{ id: string; title: string }[]> {
  // For now, return hardcoded doc. Extend with Drive listing later.
  const { title } = await getDocumentHtml('1LKIPzUhd9AydifOgzOWjAR9t7xADVAvP');
  return [{ id: '1LKIPzUhd9AydifOgzOWjAR9t7xADVAvP', title }];
}

