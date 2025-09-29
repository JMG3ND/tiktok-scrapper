import puppeteer from 'puppeteer';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (): Promise<Record<'titulos', string>[]> => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  let [page] = await browser.pages();
  if (!page) {
    page = await browser.newPage();
  }

  await page.goto('https://www.tiktok.com/search?q=panama%20viral&t=1759100034907', { waitUntil: 'networkidle2' });

  await page.evaluate(async () => {
    const scrollDuration = 20_000;
    const win = globalThis as typeof globalThis & {
      innerHeight: number;
      scrollBy: (x: number, y: number) => void;
    };
    const scrollStep = win.innerHeight / 2;
    const scrollDelay = 250;

    const end = Date.now() + scrollDuration;
    while (Date.now() < end) {
      win.scrollBy(0, scrollStep);
      await new Promise(resolve => setTimeout(resolve, scrollDelay));
    }
  });

  const html = await page.content();
  await writeFile(join(process.cwd(), 'tiktok-page.html'), html, 'utf8');

  await browser.close();

  const descriptions: Record<'titulos', string>[] = [];
  const titleRegex = /<span data-e2e="new-desc-span" style="font-weight: 400;">\s*([^<]*?)\s*<\/span>/g;

  let match: RegExpExecArray | null;
  while ((match = titleRegex.exec(html)) !== null) {
    descriptions.push({titulos: match[1].trim()});
  }

  const response = descriptions.filter(v => v.titulos)

  return response;
});