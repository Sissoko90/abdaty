'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, LifeBuoy } from 'lucide-react';

/** Bloc de code sur fond encre, avec langage et bouton de copie. */
function CodeBlock({ code, language }: { code: string; language: string }) {
  const t = useTranslations('docs.ui');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : rien à faire */
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
        <span className="text-xs font-medium text-gray-400">{language}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-ochre" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t('copied') : t('copy')}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const H2 = 'mb-4 font-display text-3xl font-bold text-ink dark:text-white';
const LEAD = 'mb-6 text-lg leading-8 text-gray-600 dark:text-gray-300';
const SECTION = 'scroll-mt-28 border-b border-gray-200 pb-12 dark:border-white/10 [&:not(:first-child)]:pt-12 last:border-0';

export function DocsContent() {
  const t = useTranslations('docs.content');

  return (
    <div className="max-w-3xl">
      <section id="introduction" className={SECTION}>
        <h2 className={H2}>{t('introduction.title')}</h2>
        <p className={LEAD}>{t('introduction.description')}</p>

        <div className="flex items-start gap-4 rounded-2xl border border-ochre/40 bg-ochre/10 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ochre text-ink">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div>
            <h3 className="mb-1 font-semibold text-ink dark:text-white">{t('introduction.note.title')}</h3>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{t('introduction.note.text')}</p>
          </div>
        </div>
      </section>

      <section id="installation" className={SECTION}>
        <h2 className={H2}>{t('installation.title')}</h2>
        <p className={LEAD}>{t('installation.description')}</p>
        <CodeBlock language="bash" code={`npm install abdaty-sdk\n# or\nyarn add abdaty-sdk`} />
      </section>

      <section id="quickstart" className={SECTION}>
        <h2 className={H2}>{t('quickstart.title')}</h2>
        <p className={LEAD}>{t('quickstart.description')}</p>
        <CodeBlock
          language="javascript"
          code={`import { AbdatyClient } from 'abdaty-sdk';

const client = new AbdatyClient({
  apiKey: 'your-api-key'
});

// Send SMS
await client.sms.send({
  to: '+223XXXXXXXX',
  message: 'Hello from Abdaty!'
});`}
        />
      </section>

      <section id="authentication" className={SECTION}>
        <h2 className={H2}>{t('authentication.title')}</h2>
        <p className={LEAD}>{t('authentication.description')}</p>
      </section>
    </div>
  );
}
