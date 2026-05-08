'use client';

import { useState } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export function EditableField({
  value,
  onSave,
  placeholder = 'Click to edit',
  multiline = false,
  className = ''
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder={placeholder}
          />
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-yellow-50 p-2 rounded transition-colors ${className}`}
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </div>
  );
}