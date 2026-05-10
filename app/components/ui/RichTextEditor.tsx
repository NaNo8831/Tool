"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  RichTextBlock,
  RichTextColumns,
  RichTextDocument,
  RichTextInline,
  RichTextValue,
} from "@/app/types/richText";

interface RichTextEditorProps {
  value: RichTextValue;
  onChange: (value: RichTextDocument) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  minHeightClassName?: string;
  ariaLabel?: string;
}

interface RichTextRendererProps {
  value: RichTextValue;
  placeholder?: string;
  className?: string;
}

const emptyDocument = (columns: RichTextColumns = 1): RichTextDocument => ({
  version: 1,
  columns,
  blocks: [{ type: "paragraph", children: [{ text: "" }] }],
});

const isRichTextDocument = (value: RichTextValue): value is RichTextDocument =>
  typeof value === "object" &&
  value !== null &&
  value.version === 1 &&
  Array.isArray(value.blocks);

const toColumns = (columns: unknown): RichTextColumns =>
  columns === 2 || columns === 3 ? columns : 1;

const compactInlines = (inlines: RichTextInline[]): RichTextInline[] => {
  const compacted = inlines.filter((inline) => inline.text.length > 0);
  return compacted.length > 0 ? compacted : [{ text: "" }];
};

const normalizeInlines = (inlines: unknown): RichTextInline[] => {
  if (!Array.isArray(inlines)) return [{ text: "" }];

  return compactInlines(
    inlines.map((inline) => {
      if (typeof inline === "string") return { text: inline };
      if (typeof inline !== "object" || inline === null) return { text: "" };

      const candidate = inline as Partial<RichTextInline>;
      return {
        text: candidate.text ?? "",
        ...(candidate.bold ? { bold: true } : {}),
        ...(candidate.italic ? { italic: true } : {}),
        ...(candidate.underline ? { underline: true } : {}),
      };
    }),
  );
};

export const normalizeRichTextValue = (
  value: RichTextValue,
): RichTextDocument => {
  if (!isRichTextDocument(value)) {
    const lines = value.split("\n");
    return {
      ...emptyDocument(),
      blocks: lines.map((line) => ({
        type: "paragraph",
        children: [{ text: line }],
      })),
    };
  }

  const blocks = value.blocks.map((block) => {
    if (block.type !== "paragraph") {
      const items = Array.isArray(block.items)
        ? block.items.map((item) => normalizeInlines(item))
        : [[{ text: "" }]];

      return {
        type: block.type,
        items: items.length > 0 ? items : [[{ text: "" }]],
      };
    }

    return {
      type: "paragraph" as const,
      children: normalizeInlines(block.children),
    };
  });

  return {
    version: 1,
    columns: toColumns(value.columns),
    blocks: blocks.length > 0 ? blocks : emptyDocument(value.columns).blocks,
  };
};

const getPlainText = (documentValue: RichTextDocument) =>
  documentValue.blocks
    .map((block) => {
      if (block.type === "paragraph")
        return block.children.map((child) => child.text).join("");
      return block.items
        .map((item) => item.map((child) => child.text).join(""))
        .join("\n");
    })
    .join("\n")
    .trim();

const readInlineChildren = (
  node: Node,
  marks: Omit<RichTextInline, "text"> = {},
): RichTextInline[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ? [{ text: node.textContent, ...marks }] : [];
  }

  if (!(node instanceof HTMLElement)) return [];

  const tagName = node.tagName.toLowerCase();
  const nextMarks = {
    ...marks,
    ...(["b", "strong"].includes(tagName) ? { bold: true } : {}),
    ...(["i", "em"].includes(tagName) ? { italic: true } : {}),
    ...(["u"].includes(tagName) ? { underline: true } : {}),
  };

  if (tagName === "br") return [{ text: "\n", ...nextMarks }];

  return Array.from(node.childNodes).flatMap((child) =>
    readInlineChildren(child, nextMarks),
  );
};

const readBlockInlines = (node: Node): RichTextInline[] =>
  compactInlines(
    readInlineChildren(node).map((inline) => ({
      ...inline,
      text: inline.text.replace(/\n+/g, " "),
    })),
  );

const serializeEditorContent = (
  editor: HTMLElement,
  columns: RichTextColumns,
): RichTextDocument => {
  const blocks: RichTextBlock[] = [];

  Array.from(editor.childNodes).forEach((node) => {
    if (
      node instanceof HTMLElement &&
      ["ul", "ol"].includes(node.tagName.toLowerCase())
    ) {
      const items = Array.from(node.children)
        .filter((child) => child.tagName.toLowerCase() === "li")
        .map((child) => readBlockInlines(child));

      blocks.push({
        type:
          node.tagName.toLowerCase() === "ul" ? "bulletList" : "numberedList",
        items: items.length > 0 ? items : [[{ text: "" }]],
      });
      return;
    }

    const children = readBlockInlines(node);
    blocks.push({ type: "paragraph", children });
  });

  return {
    version: 1,
    columns,
    blocks: blocks.length > 0 ? blocks : emptyDocument(columns).blocks,
  };
};

const renderInline = (inline: RichTextInline, index: number) => {
  let content = <>{inline.text}</>;
  if (inline.underline) content = <u>{content}</u>;
  if (inline.italic) content = <em>{content}</em>;
  if (inline.bold) content = <strong>{content}</strong>;
  return <span key={index}>{content}</span>;
};

const renderBlocks = (documentValue: RichTextDocument) =>
  documentValue.blocks.map((block, blockIndex) => {
    if (block.type === "bulletList") {
      return (
        <ul key={blockIndex}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{item.map(renderInline)}</li>
          ))}
        </ul>
      );
    }

    if (block.type === "numberedList") {
      return (
        <ol key={blockIndex}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{item.map(renderInline)}</li>
          ))}
        </ol>
      );
    }

    if (block.type === "paragraph") {
      return <p key={blockIndex}>{block.children.map(renderInline)}</p>;
    }

    return null;
  });

export function RichTextRenderer({
  value,
  placeholder,
  className = "",
}: RichTextRendererProps) {
  const documentValue = normalizeRichTextValue(value);
  const hasContent = getPlainText(documentValue).length > 0;

  if (!hasContent && placeholder) {
    return (
      <p className={`text-slate-400 italic ${className}`}>{placeholder}</p>
    );
  }

  return (
    <div
      className={`rich-text-content rich-text-columns-${documentValue.columns} ${className}`}
    >
      {renderBlocks(documentValue)}
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Add details...",
  className = "",
  editorClassName = "",
  minHeightClassName = "min-h-[140px]",
  ariaLabel = "Rich text editor",
}: RichTextEditorProps) {
  const initialDocument = useMemo(() => normalizeRichTextValue(value), [value]);
  const [documentValue, setDocumentValue] = useState(initialDocument);
  const [hasContent, setHasContent] = useState(getPlainText(initialDocument).length > 0);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastPublishedRef = useRef(JSON.stringify(initialDocument));

  useEffect(() => {
    const normalized = normalizeRichTextValue(value);
    const serialized = JSON.stringify(normalized);
    if (serialized === lastPublishedRef.current) return;

    setDocumentValue(normalized);
    setHasContent(getPlainText(normalized).length > 0);
    lastPublishedRef.current = serialized;
  }, [value]);

  const publishCurrentContent = (nextColumns = documentValue.columns) => {
    if (!editorRef.current) return;

    const nextDocument = serializeEditorContent(editorRef.current, nextColumns);
    setHasContent(getPlainText(nextDocument).length > 0);
    lastPublishedRef.current = JSON.stringify(nextDocument);
    onChange(nextDocument);
  };

  const applyCommand = (
    command:
      | "bold"
      | "italic"
      | "underline"
      | "insertUnorderedList"
      | "insertOrderedList",
  ) => {
    editorRef.current?.focus();
    document.execCommand(command);
    publishCurrentContent();
  };

  const updateColumns = (columns: RichTextColumns) => {
    const nextDocument = editorRef.current
      ? serializeEditorContent(editorRef.current, columns)
      : { ...documentValue, columns };

    setDocumentValue(nextDocument);
    setHasContent(getPlainText(nextDocument).length > 0);
    lastPublishedRef.current = JSON.stringify(nextDocument);
    onChange(nextDocument);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-3 py-2 text-sm text-slate-700">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("bold")}
          className="rich-text-toolbar-button font-bold"
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("italic")}
          className="rich-text-toolbar-button italic"
          aria-label="Italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("underline")}
          className="rich-text-toolbar-button underline"
          aria-label="Underline"
        >
          U
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("insertUnorderedList")}
          className="rich-text-toolbar-button"
          aria-label="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("insertOrderedList")}
          className="rich-text-toolbar-button"
          aria-label="Numbered list"
        >
          1. List
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <div
          className="flex items-center gap-1 text-xs font-medium text-slate-500"
          aria-label="Columns"
        >
          <span className="px-1">Columns</span>
          {[1, 2, 3].map((columns) => (
            <button
              key={columns}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => updateColumns(columns as RichTextColumns)}
              className={`rich-text-toolbar-button ${documentValue.columns === columns ? "bg-slate-200 text-slate-950" : ""}`}
              aria-pressed={documentValue.columns === columns}
            >
              {columns}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {!hasContent ? (
          <div className="pointer-events-none absolute left-4 top-3 text-slate-400">
            {placeholder}
          </div>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label={ariaLabel}
          aria-multiline="true"
          onInput={() => publishCurrentContent()}
          onBlur={() => publishCurrentContent()}
          className={`rich-text-editor rich-text-content rich-text-columns-${documentValue.columns} ${minHeightClassName} px-4 py-3 text-slate-900 outline-none ${editorClassName}`}
        >
          {renderBlocks(documentValue)}
        </div>
      </div>
    </div>
  );
}
