export type RichTextColumns = 1 | 2 | 3;

export interface RichTextInline {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface RichTextParagraphBlock {
  type: 'paragraph';
  children: RichTextInline[];
}

export interface RichTextListItem {
  children: RichTextInline[];
  nestedBlocks?: RichTextListBlock[];
  /** @deprecated Migrated from PR #25 flat list levels into nestedBlocks. */
  level?: number;
}

export interface RichTextListBlock {
  type: 'bulletList' | 'numberedList';
  items: RichTextListItem[];
}

export type RichTextBlock = RichTextParagraphBlock | RichTextListBlock;

export interface RichTextDocument {
  version: 1;
  columns: RichTextColumns;
  blocks: RichTextBlock[];
  columnBlocks?: RichTextBlock[][];
}

export type RichTextValue = string | RichTextDocument;
