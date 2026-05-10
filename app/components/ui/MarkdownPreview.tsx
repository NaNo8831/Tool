import type { ReactNode } from 'react';

interface MarkdownPreviewProps {
  value: string;
}

const inlineMarkdownPattern = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

const renderInlineMarkdown = (text: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const matchResult of text.matchAll(inlineMarkdownPattern)) {
    const match = matchResult[0];
    const offset = matchResult.index ?? 0;

    if (offset > lastIndex) {
      nodes.push(text.slice(lastIndex, offset));
    }

    const key = `${offset}-${match}`;

    if (match.startsWith('**') && match.endsWith('**')) {
      nodes.push(<strong key={key}>{match.slice(2, -2)}</strong>);
    } else if (match.startsWith('`') && match.endsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-slate-200 px-1 py-0.5 text-[0.92em] text-slate-900">
          {match.slice(1, -1)}
        </code>
      );
    } else if (match.startsWith('[')) {
      const linkMatch = match.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(match);
      }
    } else if (match.startsWith('*') && match.endsWith('*')) {
      nodes.push(<em key={key}>{match.slice(1, -1)}</em>);
    } else {
      nodes.push(match);
    }

    lastIndex = offset + match.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

export function MarkdownPreview({ value }: MarkdownPreviewProps) {
  const lines = value.split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const HeadingTag = `h${headingMatch[1].length + 3}` as 'h4' | 'h5' | 'h6';
      blocks.push(
        <HeadingTag key={`heading-${index}`} className="mt-3 first:mt-0 font-semibold text-slate-950">
          {renderInlineMarkdown(headingMatch[2])}
        </HeadingTag>
      );
      index += 1;
      continue;
    }

    const unorderedItems: ReactNode[] = [];
    while (index < lines.length) {
      const listMatch = lines[index].trim().match(/^[-*]\s+(.+)$/);
      if (!listMatch) break;
      unorderedItems.push(<li key={`ul-${index}`}>{renderInlineMarkdown(listMatch[1])}</li>);
      index += 1;
    }

    if (unorderedItems.length > 0) {
      blocks.push(
        <ul key={`ul-${index}`} className="list-disc space-y-1 pl-5">
          {unorderedItems}
        </ul>
      );
      continue;
    }

    const orderedItems: ReactNode[] = [];
    while (index < lines.length) {
      const listMatch = lines[index].trim().match(/^\d+[.)]\s+(.+)$/);
      if (!listMatch) break;
      orderedItems.push(<li key={`ol-${index}`}>{renderInlineMarkdown(listMatch[1])}</li>);
      index += 1;
    }

    if (orderedItems.length > 0) {
      blocks.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-1 pl-5">
          {orderedItems}
        </ol>
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const currentLine = lines[index].trim();
      if (
        !currentLine
        || /^#{1,3}\s+/.test(currentLine)
        || /^[-*]\s+/.test(currentLine)
        || /^\d+[.)]\s+/.test(currentLine)
      ) {
        break;
      }
      paragraphLines.push(currentLine);
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${index}`} className="whitespace-pre-line leading-relaxed">
        {renderInlineMarkdown(paragraphLines.join('\n'))}
      </p>
    );
  }

  return <div className="space-y-3 text-sm text-slate-700">{blocks}</div>;
}
