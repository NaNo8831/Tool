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

export interface RichTextListBlock {
  type: 'bulletList' | 'numberedList';
  items: RichTextInline[][];
}

export type RichTextBlock = RichTextParagraphBlock | RichTextListBlock;

export interface RichTextDocument {
  version: 1;
  columns: RichTextColumns;
  blocks: RichTextBlock[];
}

export type RichTextValue = string | RichTextDocument;
