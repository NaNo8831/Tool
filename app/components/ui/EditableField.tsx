'use client';

import { useState, KeyboardEvent } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  editorClassName?: string;
  actionClassName?: string;
  onEditingChange?: (isEditing: boolean) => void;
}

export function EditableField({
  value,
  onSave,
  placeholder = 'Click to edit',
  multiline = false,
  className = '',
  editorClassName = '',
  actionClassName = '',
  onEditingChange
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const startEditing = () => {
    setIsEditing(true);
    onEditingChange?.(true);
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
    onEditingChange?.(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onEditingChange?.(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!multiline && event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }
    if (multiline && (event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full min-h-[120px] px-3 py-3 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 ${editorClassName}`}
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 ${editorClassName}`}
            placeholder={placeholder}
          />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={`px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 ${actionClassName}`}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={`px-3 py-1 bg-slate-500 text-white rounded text-sm hover:bg-slate-600 ${actionClassName}`}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={startEditing}
      className={`cursor-pointer hover:bg-yellow-50 p-2 rounded transition-colors ${className}`}
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </div>
  );
}