import { Heading } from '../components/_elements/heading';

interface Span {
  start: number;
  end: number;
  type: string;
  data?: Record<string, string>;
}

export interface RichTextContent {
  spans: Span[];
  text: string;
  type: string;
  url?: string;
  alt?: string;
}

export const PrismicRichToHtml = (content: RichTextContent) => {
  const { spans, type, url, alt } = content;
  let { text } = content;

  const mergeOverlappingSpans = (spans: Span[]) => {
    const mergedSpans = [];

    spans.sort((a, b) => a.start - b.start || a.end - b.end);

    for (const span of spans) {
      const lastSpan = mergedSpans[mergedSpans.length - 1];

      if (lastSpan && span.start <= lastSpan.end) {
        lastSpan.end = Math.max(lastSpan.end, span.end);
        lastSpan.types.push(span.type);
        if (span.type === 'hyperlink') {
          lastSpan.data = span.data;
        }
      } else {
        mergedSpans.push({
          ...span,
          types: [span.type],
        });
      }
    }

    return mergedSpans;
  };

  const applySpans = (text: string, spans: Span[]) => {
    const mergedSpans = mergeOverlappingSpans(spans);
    let result = '';
    let pointer = 0;

    for (const span of mergedSpans) {
      result += text.slice(pointer, span.start);

      let spanContent = text.slice(span.start, span.end);
      for (const type of span.types) {
        switch (type) {
          case 'em':
            spanContent = `<em>${spanContent}</em>`;
            break;
          case 'strong':
            spanContent = `<strong>${spanContent}</strong>`;
            break;
          case 'hyperlink':
            spanContent = `<a class="font-bold text-purple-700 underline hover:text-purple-600 hover:no-underline" href="${
              span.data?.url ?? ''
            }">${spanContent}</a>`;
            break;
        }
      }

      result += spanContent;
      pointer = span.end;
    }
    // Append any remaining content after the last span
    result += text.slice(pointer);

    result = decodeUTF8(result);

    return result;
  };

  if (spans.length > 0) {
    const sortedSpans = [...spans].sort((a, b) => b.start - a.start);
    text = applySpans(text, sortedSpans);
  }

  const html = { __html: text };

  switch (type) {
    case 'paragraph':
      return <p dangerouslySetInnerHTML={html} className="mb-4 md:mb-6" />;
    case 'heading1':
      return (
        <Heading as="h1">
          <span dangerouslySetInnerHTML={html} />
        </Heading>
      );
    case 'heading2':
      return (
        <Heading as="h2">
          <span dangerouslySetInnerHTML={html} />
        </Heading>
      );
    case 'heading3':
      return (
        <Heading as="h3">
          <span dangerouslySetInnerHTML={html} />
        </Heading>
      );
    case 'heading4':
      return (
        <Heading as="h4">
          <span dangerouslySetInnerHTML={html} />
        </Heading>
      );
    case 'list-item':
      return <li dangerouslySetInnerHTML={html} />;
    case 'o-list-item':
      return <li dangerouslySetInnerHTML={html} />;
    case 'image':
      return (
        <div className="flex flex-col gap-2">
          <img alt={alt} className="mx-auto w-full max-w-[600px]" src={url} />
          <p>{alt}</p>
        </div>
      );
    default:
      return <p dangerouslySetInnerHTML={html} className="mb-4 md:mb-6" />;
  }
};

export function decodeUTF8(str: string) {
  return str
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/ /g, ' ') // eslint-disable-line -- the whole point is to fix the irregular whitespace
    .replace(/ /g, ' ') // eslint-disable-line -- the whole point is to fix the irregular whitespace
    .replace(/…/g, '...')
    .replace(/«/g, '<<')
    .replace(/»/g, '>>')
    .replace(/•/g, '*')
    .replace(/©/g, '(c)')
    .replace(/®/g, '(r)')
    .replace(/™/g, '(tm)')
    .replace(/°/g, ' deg ');
}
