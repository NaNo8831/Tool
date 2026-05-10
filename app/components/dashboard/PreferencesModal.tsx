'use client';

import { EditableField } from '@/app/components/ui/EditableField';
import type { OrganizationInfo } from '@/app/types/dashboard';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationInfo: OrganizationInfo;
  onSave: (info: OrganizationInfo) => void;
  dashboardTitle: string;
  onDashboardTitleChange: (value: string) => void;
}

export function PreferencesModal({
  isOpen,
  onClose,
  organizationInfo,
  onSave,
  dashboardTitle,
  onDashboardTitleChange
}: PreferencesModalProps) {
  if (!isOpen) return null;

  const handleSave = (field: keyof OrganizationInfo, value: string) => {
    onSave({ ...organizationInfo, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl p-8 md:p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Settings and Play Book Definitions</h2>
          <p className="mt-4 text-xl md:text-2xl leading-relaxed text-slate-600">
            Name your team or meeting here, then define the play book language everyone can align around.
          </p>
        </div>

        <div className="space-y-8 text-xl md:text-2xl">
          <div>
            <label className="block text-2xl md:text-3xl font-semibold mb-3 text-slate-900">Team or Meeting Name</label>
            <input
              type="text"
              value={dashboardTitle}
              onChange={(e) => onDashboardTitleChange(e.target.value)}
              className="w-full px-5 py-4 border border-slate-300 rounded-xl text-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Name your team or meeting"
            />
            <p className="text-lg md:text-xl text-slate-500 mt-3">
              This name appears in the dashboard header. Use it for your team, recurring meeting, or leadership group.
            </p>
          </div>

          <section className="rounded-3xl bg-blue-50 p-6 md:p-8 border border-blue-100">
            <label className="block text-3xl md:text-4xl font-bold mb-4 text-slate-900">Why Do We Exist?</label>
            <EditableField
              value={organizationInfo.whyExist}
              onSave={(value) => handleSave('whyExist', value)}
              placeholder="Enter your mission..."
              multiline
              className="bg-white/80 p-5 rounded-2xl leading-relaxed min-h-[120px]"
            />
          </section>

          <section className="rounded-3xl bg-amber-50 p-6 md:p-8 border border-amber-100">
            <label className="block text-3xl md:text-4xl font-bold mb-4 text-slate-900">Rally Cry</label>
            <EditableField
              value={organizationInfo.rallyCry}
              onSave={(value) => handleSave('rallyCry', value)}
              placeholder="Rally Cry"
              multiline
              className="bg-white/80 p-5 rounded-2xl leading-relaxed min-h-[100px] font-bold text-slate-900"
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <label className="block text-2xl md:text-3xl font-semibold mb-3 text-slate-900">How Do We Behave?</label>
              <EditableField
                value={organizationInfo.howBehave}
                onSave={(value) => handleSave('howBehave', value)}
                placeholder="Enter your values..."
                multiline
                className="bg-blue-50 p-4 rounded-xl leading-relaxed min-h-[120px]"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <label className="block text-2xl md:text-3xl font-semibold mb-3 text-slate-900">What Do We Do?</label>
              <EditableField
                value={organizationInfo.whatDo}
                onSave={(value) => handleSave('whatDo', value)}
                placeholder="Enter what you do..."
                multiline
                className="bg-blue-50 p-4 rounded-xl leading-relaxed min-h-[120px]"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <label className="block text-2xl md:text-3xl font-semibold mb-3 text-slate-900">How Will We Succeed?</label>
              <EditableField
                value={organizationInfo.howSucceed}
                onSave={(value) => handleSave('howSucceed', value)}
                placeholder="Enter success metrics..."
                multiline
                className="bg-blue-50 p-4 rounded-xl leading-relaxed min-h-[120px]"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 px-8 py-4 bg-blue-500 text-white rounded-xl text-xl font-semibold hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
