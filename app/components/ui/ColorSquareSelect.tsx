'use client';

import { objectiveColorOptions } from '@/app/lib/objectiveOptions';
import type { ObjectiveColor } from '@/app/types/objective';

interface ColorSquareSelectProps {
  value: ObjectiveColor;
  onChange: (color: ObjectiveColor) => void;
  ariaLabel: string;
}

export function ColorSquareSelect({ value, onChange, ariaLabel }: ColorSquareSelectProps) {
  const selectedOption = objectiveColorOptions.find((option) => option.value === value) ?? objectiveColorOptions[0];

  return (
    <label
      className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center"
      onMouseDown={(event) => event.stopPropagation()}
      onDragStart={(event) => event.stopPropagation()}
    >
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={selectedOption.value}
        onChange={(event) => onChange(event.target.value as ObjectiveColor)}
        className={`h-7 w-7 cursor-pointer appearance-none rounded-lg border-2 border-white text-transparent shadow-sm outline outline-1 outline-slate-300 transition hover:scale-105 focus:ring-2 focus:ring-blue-300 ${selectedOption.swatchClass}`}
        aria-label={ariaLabel}
      >
        {objectiveColorOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
