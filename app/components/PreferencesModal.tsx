'use client';

import { useState } from 'react';
import { EditableField } from './EditableField';

interface OrganizationInfo {
  whyExist: string;
  howBehave: string;
  whatDo: string;
  howSucceed: string;
}

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationInfo: OrganizationInfo;
  onSave: (info: OrganizationInfo) => void;
}

export function PreferencesModal({
  isOpen,
  onClose,
  organizationInfo,
  onSave
}: PreferencesModalProps) {
  const [info, setInfo] = useState(organizationInfo);

  if (!isOpen) return null;

  const handleSave = (field: keyof OrganizationInfo, value: string) => {
    const updated = { ...info, [field]: value };
    setInfo(updated);
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6">Organization Preferences</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-2">Why Do We Exist?</label>
            <EditableField
              value={info.whyExist}
              onSave={(value) => handleSave('whyExist', value)}
              placeholder="Enter your mission..."
              multiline
              className="bg-blue-50 p-3 rounded"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">How Do We Behave?</label>
            <EditableField
              value={info.howBehave}
              onSave={(value) => handleSave('howBehave', value)}
              placeholder="Enter your values..."
              multiline
              className="bg-blue-50 p-3 rounded"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">What Do We Do?</label>
            <EditableField
              value={info.whatDo}
              onSave={(value) => handleSave('whatDo', value)}
              placeholder="Enter what you do..."
              multiline
              className="bg-blue-50 p-3 rounded"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">How Will We Succeed?</label>
            <EditableField
              value={info.howSucceed}
              onSave={(value) => handleSave('howSucceed', value)}
              placeholder="Enter success metrics..."
              multiline
              className="bg-blue-50 p-3 rounded"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}