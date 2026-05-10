'use client';

import type { DragEvent } from 'react';
import { EditableField } from '@/app/components/ui/EditableField';
import type { MeetingSectionConfig, MeetingSectionKey } from '@/app/types/dashboard';

interface MeetingSectionProps {
  section: MeetingSectionConfig;
  onDragStart: (id: MeetingSectionKey) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (id: MeetingSectionKey) => void;
}

export function MeetingSection({ section, onDragStart, onDragOver, onDrop }: MeetingSectionProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(section.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(section.id)}
      className="relative rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm cursor-grab"
    >
      <div className="absolute right-5 top-5 text-slate-400 text-lg" aria-hidden="true">≡</div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
        <p className="text-sm text-slate-500">{section.description}</p>
      </div>
      <div className="space-y-3">
        {section.items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex-1">
              <EditableField
                value={item.text}
                onSave={(value) => section.updateItem(item.id, value)}
                placeholder={section.editPlaceholder}
                className="text-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={() => section.deleteItem(item.id)}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove ${section.title}`}
            >
              ×
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            value={section.newItem}
            onChange={(e) => section.setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                section.addItem();
              }
            }}
            className="flex-1 border border-slate-300 rounded px-3 py-2 text-slate-900"
            placeholder={section.placeholder}
          />
          <button
            type="button"
            onClick={section.addItem}
            className="bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
