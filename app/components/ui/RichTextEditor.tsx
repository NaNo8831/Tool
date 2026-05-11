"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type {
  RichTextBlock,
  RichTextColumns,
  RichTextDocument,
  RichTextInline,
  RichTextListItem,
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
  editingMode?: "manual" | "always";
  onEditingChange?: (isEditing: boolean) => void;
}

interface RichTextRendererProps {
  value: RichTextValue;
  placeholder?: string;
  className?: string;
}

type FormattingState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bulletList: boolean;
  numberedList: boolean;
};

const emptyBlocks = (): RichTextBlock[] => [
  { type: "paragraph", children: [{ text: "" }] },
];

const emptyFormattingState: FormattingState = {
  bold: false,
  italic: false,
  underline: false,
  bulletList: false,
  numberedList: false,
};

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

const normalizeBlocks = (blocks: unknown): RichTextBlock[] => {
  if (!Array.isArray(blocks)) return emptyBlocks();

  const normalized = blocks.map((block): RichTextBlock => {
    if (typeof block !== "object" || block === null) {
      return { type: "paragraph", children: [{ text: "" }] };
    }

    const candidate = block as Partial<RichTextBlock>;

    if (candidate.type === "bulletList" || candidate.type === "numberedList") {
      const items = Array.isArray(candidate.items)
        ? candidate.items.map((item) => {
            if (Array.isArray(item)) {
              return { children: normalizeInlines(item), level: 0 };
            }

            if (typeof item !== "object" || item === null) {
              return { children: [{ text: "" }], level: 0 };
            }

            const listItem = item as Partial<RichTextListItem>;
            const rawLevel = Number(listItem.level ?? 0);

            return {
              children: normalizeInlines(listItem.children),
              level: Number.isFinite(rawLevel)
                ? Math.max(0, Math.floor(rawLevel))
                : 0,
            };
          })
        : [{ children: [{ text: "" }], level: 0 }];

      return {
        type: candidate.type,
        items:
          items.length > 0 ? items : [{ children: [{ text: "" }], level: 0 }],
      };
    }

    return {
      type: "paragraph",
      children: normalizeInlines(
        "children" in candidate ? candidate.children : undefined,
      ),
    };
  });

  return normalized.length > 0 ? normalized : emptyBlocks();
};

const flattenColumnBlocks = (columnBlocks: RichTextBlock[][]) =>
  columnBlocks.flatMap((blocks) => blocks);

const normalizeColumnBlocks = (
  blocks: RichTextBlock[],
  columnBlocks: unknown,
): RichTextBlock[][] => {
  if (!Array.isArray(columnBlocks)) return [blocks];

  const normalized = columnBlocks.map((column) => normalizeBlocks(column));
  return normalized.length > 0 ? normalized : [blocks];
};

const normalizeColumnCount = (
  columnBlocks: RichTextBlock[][],
  columns: RichTextColumns,
): RichTextBlock[][] => {
  const nextColumnBlocks = columnBlocks.slice(0, columns);

  while (nextColumnBlocks.length < columns) {
    nextColumnBlocks.push(emptyBlocks());
  }

  if (columnBlocks.length > columns) {
    nextColumnBlocks[columns - 1] = [
      ...nextColumnBlocks[columns - 1],
      ...columnBlocks.slice(columns).flatMap((blocks) => blocks),
    ];
  }

  return nextColumnBlocks;
};

export const normalizeRichTextValue = (
  value: RichTextValue,
): RichTextDocument => {
  if (!isRichTextDocument(value)) {
    const blocks = value.split("\n").map((line) => ({
      type: "paragraph" as const,
      children: [{ text: line }],
    }));

    return {
      version: 1,
      columns: 1,
      blocks,
      columnBlocks: [blocks],
    };
  }

  const columns = toColumns(value.columns);
  const blocks = normalizeBlocks(value.blocks);
  const columnBlocks = normalizeColumnCount(
    normalizeColumnBlocks(blocks, value.columnBlocks),
    columns,
  );

  return {
    version: 1,
    columns,
    blocks: flattenColumnBlocks(columnBlocks),
    columnBlocks,
  };
};

const getBlocksPlainText = (blocks: RichTextBlock[]) =>
  blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return block.children.map((child) => child.text).join("");
      }

      return block.items
        .map((item) => item.children.map((child) => child.text).join(""))
        .join("\n");
    })
    .join("\n");

const getPlainText = (documentValue: RichTextDocument) =>
  (documentValue.columnBlocks ?? [documentValue.blocks])
    .map((blocks) => getBlocksPlainText(blocks))
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

const getDirectListItemInlines = (listItem: HTMLElement): RichTextInline[] => {
  const clone = listItem.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll("ul, ol")
    .forEach((nestedList) => nestedList.remove());
  return readBlockInlines(clone);
};

const readListItems = (list: HTMLElement, level = 0): RichTextListItem[] =>
  Array.from(list.children)
    .filter((child): child is HTMLElement =>
      child instanceof HTMLElement && child.tagName.toLowerCase() === "li",
    )
    .flatMap((listItem) => {
      const nestedItems = Array.from(listItem.children)
        .filter((child): child is HTMLElement =>
          child instanceof HTMLElement &&
            ["ul", "ol"].includes(child.tagName.toLowerCase()),
        )
        .flatMap((nestedList) => readListItems(nestedList, level + 1));

      return [
        { children: getDirectListItemInlines(listItem), level },
        ...nestedItems,
      ];
    });

const serializeColumnContent = (editor: HTMLElement): RichTextBlock[] => {
  const blocks: RichTextBlock[] = [];

  Array.from(editor.childNodes).forEach((node) => {
    if (node instanceof HTMLBRElement) {
      blocks.push({ type: "paragraph", children: [{ text: "" }] });
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text.length > 0) {
        blocks.push({ type: "paragraph", children: [{ text }] });
      }
      return;
    }

    if (!(node instanceof HTMLElement)) return;

    const tagName = node.tagName.toLowerCase();
    if (["ul", "ol"].includes(tagName)) {
      const items = readListItems(node);

      blocks.push({
        type: tagName === "ul" ? "bulletList" : "numberedList",
        items:
          items.length > 0 ? items : [{ children: [{ text: "" }], level: 0 }],
      });
      return;
    }

    const listChild = Array.from(node.children).find((child) =>
      ["ul", "ol"].includes(child.tagName.toLowerCase()),
    );

    if (listChild instanceof HTMLElement) {
      const listTagName = listChild.tagName.toLowerCase();
      const items = readListItems(listChild);

      blocks.push({
        type: listTagName === "ul" ? "bulletList" : "numberedList",
        items:
          items.length > 0 ? items : [{ children: [{ text: "" }], level: 0 }],
      });
      return;
    }

    blocks.push({ type: "paragraph", children: readBlockInlines(node) });
  });

  return blocks.length > 0 ? blocks : emptyBlocks();
};

const createInlineNodes = (inline: RichTextInline): Node[] => {
  const textNode = document.createTextNode(inline.text);
  let current: Node = textNode;

  if (inline.underline) {
    const underline = document.createElement("u");
    underline.append(current);
    current = underline;
  }

  if (inline.italic) {
    const italic = document.createElement("em");
    italic.append(current);
    current = italic;
  }

  if (inline.bold) {
    const bold = document.createElement("strong");
    bold.append(current);
    current = bold;
  }

  return [current];
};

const appendInlines = (element: HTMLElement, inlines: RichTextInline[]) => {
  const inlineNodes = compactInlines(inlines).flatMap(createInlineNodes);
  if (inlineNodes.every((node) => node.textContent === "")) {
    element.append(document.createElement("br"));
    return;
  }

  element.append(...inlineNodes);
};

const appendListItems = (
  list: HTMLOListElement | HTMLUListElement,
  items: RichTextListItem[],
) => {
  const listByLevel = new Map<number, HTMLOListElement | HTMLUListElement>([
    [0, list],
  ]);
  const lastListItemByLevel = new Map<number, HTMLLIElement>();

  items.forEach((item) => {
    const level = Math.max(0, item.level ?? 0);
    let parentList = listByLevel.get(level);

    if (!parentList) {
      const parentItem = lastListItemByLevel.get(level - 1);
      if (!parentItem) {
        parentList = list;
      } else {
        parentList = document.createElement(list.tagName.toLowerCase()) as
          | HTMLOListElement
          | HTMLUListElement;
        parentItem.append(parentList);
        listByLevel.set(level, parentList);
      }
    }

    const listItem = document.createElement("li");
    appendInlines(listItem, item.children);
    parentList.append(listItem);
    lastListItemByLevel.set(level, listItem);

    Array.from(listByLevel.keys())
      .filter((storedLevel) => storedLevel > level)
      .forEach((storedLevel) => {
        listByLevel.delete(storedLevel);
        lastListItemByLevel.delete(storedLevel);
      });
  });
};

const createBlockNode = (block: RichTextBlock): HTMLElement => {
  if (block.type !== "paragraph") {
    const list = document.createElement(
      block.type === "bulletList" ? "ul" : "ol",
    );
    appendListItems(list, block.items);
    return list;
  }

  const paragraph = document.createElement("p");
  appendInlines(paragraph, block.children);
  return paragraph;
};

const setEditorBlocks = (editor: HTMLElement, blocks: RichTextBlock[]) => {
  editor.replaceChildren(...blocks.map(createBlockNode));
};

const renderInline = (inline: RichTextInline, index: number) => {
  let content = <>{inline.text}</>;
  if (inline.underline) content = <u>{content}</u>;
  if (inline.italic) content = <em>{content}</em>;
  if (inline.bold) content = <strong>{content}</strong>;
  return <span key={index}>{content}</span>;
};

const renderListItems = (
  items: RichTextListItem[],
  listType: "bulletList" | "numberedList",
  level = 0,
  startIndex = 0,
): { nodes: ReactNode[]; nextIndex: number } => {
  const nodes: ReactNode[] = [];
  let index = startIndex;

  while (index < items.length) {
    const item = items[index];
    const itemLevel = item.level ?? 0;

    if (itemLevel < level) break;
    if (itemLevel > level) {
      index += 1;
      continue;
    }

    index += 1;
    const nested = renderListItems(items, listType, level + 1, index);
    index = nested.nextIndex;
    const NestedList = listType === "bulletList" ? "ul" : "ol";

    nodes.push(
      <li key={`${level}-${index}-${nodes.length}`}>
        {item.children.map(renderInline)}
        {nested.nodes.length > 0 ? (
          <NestedList>{nested.nodes}</NestedList>
        ) : null}
      </li>,
    );
  }

  return { nodes, nextIndex: index };
};

const renderBlocks = (blocks: RichTextBlock[]) =>
  blocks.map((block, blockIndex) => {
    if (block.type === "bulletList") {
      return (
        <ul key={blockIndex}>{renderListItems(block.items, block.type).nodes}</ul>
      );
    }

    if (block.type === "numberedList") {
      return (
        <ol key={blockIndex}>{renderListItems(block.items, block.type).nodes}</ol>
      );
    }

    if (block.type === "paragraph") {
      return <p key={blockIndex}>{block.children.map(renderInline)}</p>;
    }

    return null;
  });

const serializeEditors = (
  editors: Array<HTMLDivElement | null>,
  columns: RichTextColumns,
): RichTextDocument => {
  const columnBlocks = editors
    .slice(0, columns)
    .map((editor) => (editor ? serializeColumnContent(editor) : emptyBlocks()));
  const normalizedColumnBlocks = normalizeColumnCount(columnBlocks, columns);

  return {
    version: 1,
    columns,
    blocks: flattenColumnBlocks(normalizedColumnBlocks),
    columnBlocks: normalizedColumnBlocks,
  };
};

const queryCommandState = (command: string) => {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
};

const isSelectionInsideListItem = () => {
  const selection = document.getSelection();
  const anchorNode = selection?.anchorNode;
  if (!anchorNode) return false;

  const element =
    anchorNode instanceof HTMLElement ? anchorNode : anchorNode.parentElement;

  return Boolean(element?.closest("li"));
};

export function RichTextRenderer({
  value,
  placeholder,
  className = "",
}: RichTextRendererProps) {
  const documentValue = normalizeRichTextValue(value);
  const hasContent = getPlainText(documentValue).length > 0;
  const columnBlocks = documentValue.columnBlocks ?? [documentValue.blocks];

  if (!hasContent && placeholder) {
    return (
      <p className={`text-slate-400 italic ${className}`}>{placeholder}</p>
    );
  }

  return (
    <div
      className={`rich-text-renderer rich-text-column-grid rich-text-column-grid-${documentValue.columns} ${className}`}
    >
      {columnBlocks.slice(0, documentValue.columns).map((blocks, index) => (
        <div key={index} className="rich-text-content rich-text-column-pane">
          {renderBlocks(blocks)}
        </div>
      ))}
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
  editingMode = "manual",
  onEditingChange,
}: RichTextEditorProps) {
  const documentValue = useMemo(() => normalizeRichTextValue(value), [value]);
  const isAlwaysEditing = editingMode === "always";
  const [draftDocument, setDraftDocument] = useState(documentValue);
  const [isEditing, setIsEditing] = useState(isAlwaysEditing);
  const [hasDraftContent, setHasDraftContent] = useState(
    getPlainText(documentValue).length > 0,
  );
  const [formattingState, setFormattingState] = useState(emptyFormattingState);
  const editorRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeEditorIndexRef = useRef(0);

  const updateFormattingState = useCallback(() => {
    if (!isEditing) return;

    setFormattingState({
      bold: queryCommandState("bold"),
      italic: queryCommandState("italic"),
      underline: queryCommandState("underline"),
      bulletList: queryCommandState("insertUnorderedList"),
      numberedList: queryCommandState("insertOrderedList"),
    });
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    const columnBlocks = draftDocument.columnBlocks ?? [draftDocument.blocks];

    editorRefs.current.forEach((editor, index) => {
      if (!editor || index >= draftDocument.columns) return;
      setEditorBlocks(editor, columnBlocks[index] ?? emptyBlocks());
    });
  }, [draftDocument, isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    document.addEventListener("selectionchange", updateFormattingState);
    return () =>
      document.removeEventListener("selectionchange", updateFormattingState);
  }, [isEditing, updateFormattingState]);

  useEffect(() => () => onEditingChange?.(false), [onEditingChange]);

  const readCurrentDraft = (nextColumns = draftDocument.columns) =>
    serializeEditors(editorRefs.current, nextColumns);

  const updateDraftDocument = (nextDocument: RichTextDocument) => {
    setDraftDocument(nextDocument);
    setHasDraftContent(getPlainText(nextDocument).length > 0);
    if (isAlwaysEditing) {
      onChange(nextDocument);
    }
  };

  const publishCurrentDraft = () => {
    const nextDocument = readCurrentDraft();
    setHasDraftContent(getPlainText(nextDocument).length > 0);
    if (isAlwaysEditing) {
      onChange(nextDocument);
    }
  };

  const refreshDraftContentState = () => {
    publishCurrentDraft();
  };

  const startEditing = () => {
    const normalized = documentValue;
    setDraftDocument(normalized);
    setHasDraftContent(getPlainText(normalized).length > 0);
    setFormattingState(emptyFormattingState);
    setIsEditing(true);
    onEditingChange?.(true);
  };

  const saveEditing = () => {
    const nextDocument = readCurrentDraft();
    updateDraftDocument(nextDocument);
    setIsEditing(false);
    setFormattingState(emptyFormattingState);
    onEditingChange?.(false);
    onChange(nextDocument);
  };

  const cancelEditing = () => {
    setDraftDocument(documentValue);
    setHasDraftContent(getPlainText(documentValue).length > 0);
    setIsEditing(false);
    setFormattingState(emptyFormattingState);
    onEditingChange?.(false);
  };

  const focusActiveEditor = () => {
    const activeEditor =
      editorRefs.current[activeEditorIndexRef.current] ?? editorRefs.current[0];
    activeEditor?.focus();
  };

  const applyCommand = (
    command:
      | "bold"
      | "italic"
      | "underline"
      | "insertUnorderedList"
      | "insertOrderedList",
  ) => {
    focusActiveEditor();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command);
    publishCurrentDraft();
    updateFormattingState();
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !isSelectionInsideListItem()) return;

    event.preventDefault();
    document.execCommand(event.shiftKey ? "outdent" : "indent");
    publishCurrentDraft();
    updateFormattingState();
  };

  const updateColumns = (columns: RichTextColumns) => {
    const currentDocument = readCurrentDraft(draftDocument.columns);
    const currentColumnBlocks = currentDocument.columnBlocks ?? [
      currentDocument.blocks,
    ];
    const nextColumnBlocks = normalizeColumnCount(currentColumnBlocks, columns);
    const nextDocument: RichTextDocument = {
      version: 1,
      columns,
      blocks: flattenColumnBlocks(nextColumnBlocks),
      columnBlocks: nextColumnBlocks,
    };

    activeEditorIndexRef.current = Math.min(
      activeEditorIndexRef.current,
      columns - 1,
    );
    updateDraftDocument(nextDocument);
  };

  const toolbarButtonClass = (active: boolean, extraClassName = "") =>
    `rich-text-toolbar-button ${active ? "rich-text-toolbar-button-active" : ""} ${extraClassName}`;

  if (!isEditing && !isAlwaysEditing) {
    return (
      <div
        className={`rounded-2xl border border-slate-200 bg-white/80 ${className}`}
      >
        <div className="flex items-start justify-between gap-3 p-3">
          <RichTextRenderer
            value={documentValue}
            placeholder={placeholder}
            className="flex-1 text-slate-700"
          />
          <button
            type="button"
            onClick={startEditing}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            aria-label={`Edit ${ariaLabel}`}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 13.5V16h2.5L14.1 8.4l-2.5-2.5L4 13.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m12.4 5.1 1-1a1.4 1.4 0 0 1 2 0l.5.5a1.4 1.4 0 0 1 0 2l-1 1"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAlwaysEditing ? (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/20"
          aria-hidden="true"
        />
      ) : null}
      <div
        className={`relative z-[70] rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 ${className}`}
        role={!isAlwaysEditing ? "dialog" : undefined}
        aria-modal={!isAlwaysEditing ? "true" : undefined}
        aria-label={!isAlwaysEditing ? `Editing ${ariaLabel}` : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        onDragStart={(event) => event.stopPropagation()}
      >
        <div className="relative">
          {!hasDraftContent ? (
            <div className="pointer-events-none absolute left-4 top-3 text-slate-400">
              {placeholder}
            </div>
          ) : null}
          <div
            className={`rich-text-column-grid rich-text-column-grid-${draftDocument.columns}`}
          >
          {Array.from({ length: draftDocument.columns }, (_, index) => (
            <div
              key={index}
              ref={(node) => {
                editorRefs.current[index] = node;
              }}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label={
                draftDocument.columns === 1
                  ? ariaLabel
                  : `${ariaLabel} column ${index + 1}`
              }
              aria-multiline="true"
              data-placeholder={placeholder}
              onFocus={() => {
                activeEditorIndexRef.current = index;
                updateFormattingState();
              }}
              onKeyDown={handleEditorKeyDown}
              onKeyUp={updateFormattingState}
              onMouseUp={updateFormattingState}
              onInput={refreshDraftContentState}
              className={`rich-text-editor rich-text-content rich-text-column-pane ${minHeightClassName} px-4 py-3 text-slate-900 outline-none ${editorClassName}`}
            />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-t border-slate-200 px-3 py-2 text-sm text-slate-700">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("bold")}
          className={toolbarButtonClass(formattingState.bold, "font-bold")}
          aria-label="Bold"
          aria-pressed={formattingState.bold}
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("italic")}
          className={toolbarButtonClass(formattingState.italic, "italic")}
          aria-label="Italic"
          aria-pressed={formattingState.italic}
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("underline")}
          className={toolbarButtonClass(formattingState.underline, "underline")}
          aria-label="Underline"
          aria-pressed={formattingState.underline}
        >
          U
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("insertUnorderedList")}
          className={toolbarButtonClass(formattingState.bulletList)}
          aria-label="Bullet dots"
          aria-pressed={formattingState.bulletList}
        >
          •••
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("insertOrderedList")}
          className={toolbarButtonClass(formattingState.numberedList)}
          aria-label="Numbers"
          aria-pressed={formattingState.numberedList}
        >
          1.2.
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
              className={toolbarButtonClass(draftDocument.columns === columns)}
              aria-pressed={draftDocument.columns === columns}
            >
              {columns}
            </button>
          ))}
        </div>
      </div>

        {!isAlwaysEditing ? (
          <div className="flex justify-end gap-2 border-t border-slate-200 px-3 py-2">
          <button
            type="button"
            onClick={saveEditing}
            className="rounded-lg bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            className="rounded-lg bg-slate-500 px-3 py-1 text-sm font-medium text-white hover:bg-slate-600"
          >
            Cancel
          </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
