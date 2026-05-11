"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import { PreferencesModal } from "@/app/components/dashboard/PreferencesModal";
import { MeetingSection } from "@/app/components/meeting/MeetingSection";
import { ObjectiveCard } from "@/app/components/objectives/ObjectiveCard";
import { TaskDetailsModal } from "@/app/components/objectives/TaskDetailsModal";
import { RichTextRenderer } from "@/app/components/ui/RichTextEditor";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useObjectives } from "@/app/hooks/useObjectives";
import {
  defaultDashboardTitle,
  defaultMeetingSectionOrder,
  defaultOrganizationInfo,
} from "@/app/lib/objectiveOptions";
import type {
  MeetingItem,
  MeetingRecord,
  MeetingSectionConfig,
  MeetingSectionKey,
} from "@/app/types/dashboard";
import type { RichTextValue } from "@/app/types/richText";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const strategicTopicsStorageKey = "leadership-strategic-topic-items";
type MeetingSpecificSectionKey = "agendaItems" | "decisionItems" | "cascadeItems";

const createBlankMeeting = (): MeetingRecord => ({
  id: Date.now(),
  date: getTodayDate(),
  agendaItems: [],
  topicItems: [],
  decisionItems: [],
  cascadeItems: [],
});

const readLegacyMeetingItems = (key: string): MeetingItem[] => {
  if (typeof window === "undefined") return [];

  const storedValue = window.localStorage.getItem(key);
  if (storedValue === null) return [];

  try {
    return JSON.parse(storedValue) as MeetingItem[];
  } catch {
    return [];
  }
};

const getInitialMeetings = (): MeetingRecord[] => [createBlankMeeting()];

const getLegacyMeeting = (): MeetingRecord => ({
  ...createBlankMeeting(),
  agendaItems: readLegacyMeetingItems("leadership-agenda-items"),
  topicItems: readLegacyMeetingItems("leadership-topic-items"),
  decisionItems: readLegacyMeetingItems("leadership-decision-items"),
  cascadeItems: readLegacyMeetingItems("leadership-cascade-items"),
});

const hasMeetingItems = (meeting: MeetingRecord) =>
  [meeting.agendaItems, meeting.decisionItems, meeting.cascadeItems].some(
    (items) => items.length > 0,
  );

const normalizeStrategicTopic = (
  item: MeetingItem,
  fallbackMeeting: Pick<MeetingRecord, "id" | "date">,
  fallbackMeetingIndex = 0,
): MeetingItem => ({
  ...item,
  capturedDate: item.capturedDate ?? fallbackMeeting.date,
  capturedMeetingId: item.capturedMeetingId ?? fallbackMeeting.id,
  capturedMeetingIndex: item.capturedMeetingIndex ?? fallbackMeetingIndex,
  completed: item.completed ?? false,
  completedDate: item.completedDate ?? "",
});

const dedupeMeetingItems = (
  items: MeetingItem[],
  fallbackMeeting: Pick<MeetingRecord, "id" | "date">,
): MeetingItem[] => {
  const seenItems = new Set<string>();

  return items.reduce<MeetingItem[]>((dedupedItems, item) => {
    const itemKey = item.text.trim().toLocaleLowerCase();
    if (!itemKey || seenItems.has(itemKey)) return dedupedItems;

    seenItems.add(itemKey);
    dedupedItems.push(normalizeStrategicTopic(item, fallbackMeeting));
    return dedupedItems;
  }, []);
};

const getLegacyStrategicTopics = (): MeetingItem[] => {
  const fallbackMeeting = createBlankMeeting();
  const legacyTopicItems = readLegacyMeetingItems("leadership-topic-items");

  if (typeof window === "undefined")
    return dedupeMeetingItems(legacyTopicItems, fallbackMeeting);

  const storedMeetingsValue = window.localStorage.getItem(
    "leadership-meetings",
  );
  if (storedMeetingsValue === null)
    return dedupeMeetingItems(legacyTopicItems, fallbackMeeting);

  try {
    const storedMeetings = JSON.parse(storedMeetingsValue) as MeetingRecord[];
    const meetingTopicItems = storedMeetings.flatMap((meeting, meetingIndex) =>
      (meeting.topicItems ?? []).map((item) =>
        normalizeStrategicTopic(item, meeting, meetingIndex),
      ),
    );

    return dedupeMeetingItems(
      [...legacyTopicItems, ...meetingTopicItems],
      storedMeetings[0] ?? fallbackMeeting,
    );
  } catch {
    return dedupeMeetingItems(legacyTopicItems, fallbackMeeting);
  }
};

export default function Home() {
  const initialMeetings = useMemo(() => getInitialMeetings(), []);
  const {
    objectives,
    taskInputs,
    selectedObjective,
    selectedTaskDetails,
    addObjective,
    deleteObjective,
    updateObjectiveTitle,
    updateObjectiveDescription,
    updateObjectiveColor,
    handleObjectiveDragStart,
    handleObjectiveDrop,
    addTask,
    deleteTask,
    updateTask,
    updateTaskStatus,
    updateTaskInput,
    openTaskDetails,
    closeTaskDetails,
  } = useObjectives();
  const [meetings, setMeetings] = useLocalStorage<MeetingRecord[]>(
    "leadership-meetings",
    initialMeetings,
  );
  const [activeMeetingId, setActiveMeetingId] = useLocalStorage<number>(
    "leadership-active-meeting-id",
    initialMeetings[0].id,
  );
  const [dashboardTitle, setDashboardTitle] = useLocalStorage(
    "leadership-dashboard-title",
    defaultDashboardTitle,
  );
  const [organizationInfo, setOrganizationInfo] = useLocalStorage(
    "leadership-organization-info",
    defaultOrganizationInfo,
  );
  const [meetingSectionOrder, setMeetingSectionOrder] = useLocalStorage<
    MeetingSectionKey[]
  >("leadership-meeting-section-order", defaultMeetingSectionOrder);
  const [strategicTopicItems, setStrategicTopicItems] = useLocalStorage<
    MeetingItem[]
  >(strategicTopicsStorageKey, []);
  const [newAgendaItem, setNewAgendaItem] = useState("");
  const [newTopicItem, setNewTopicItem] = useState("");
  const [newDecisionItem, setNewDecisionItem] = useState("");
  const [newCascadeItem, setNewCascadeItem] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);
  const [draggingMeetingSection, setDraggingMeetingSection] =
    useState<MeetingSectionKey | null>(null);
  const organizationInfoWithDefaults = {
    ...defaultOrganizationInfo,
    ...organizationInfo,
  };
  const storedActiveMeetingIndex = meetings.findIndex(
    (meeting) => meeting.id === activeMeetingId,
  );
  const activeMeetingIndex =
    storedActiveMeetingIndex === -1 ? 0 : storedActiveMeetingIndex;
  const activeMeeting = meetings[activeMeetingIndex] ?? initialMeetings[0];
  const visibleStrategicTopicItems = strategicTopicItems.filter((item) => {
    const capturedMeetingIndex =
      item.capturedMeetingIndex ??
      meetings.findIndex((meeting) => meeting.id === item.capturedMeetingId);
    const removedMeetingIndex =
      item.removedMeetingIndex ??
      meetings.findIndex((meeting) => meeting.id === item.removedMeetingId);
    const normalizedCapturedIndex =
      capturedMeetingIndex === -1 ? 0 : capturedMeetingIndex;

    if (activeMeetingIndex < normalizedCapturedIndex) return false;
    if (removedMeetingIndex === undefined || removedMeetingIndex === -1)
      return true;

    return activeMeetingIndex < removedMeetingIndex;
  });
  const canNavigateToPreviousMeeting = activeMeetingIndex > 0;
  const canNavigateToNextMeeting = activeMeetingIndex < meetings.length - 1;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (window.localStorage.getItem("leadership-meetings") !== null) return;

      const legacyMeeting = getLegacyMeeting();
      if (!hasMeetingItems(legacyMeeting)) return;

      setMeetings([legacyMeeting]);
      setActiveMeetingId(legacyMeeting.id);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [setActiveMeetingId, setMeetings]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (window.localStorage.getItem(strategicTopicsStorageKey) !== null)
        return;

      const legacyStrategicTopics = getLegacyStrategicTopics();
      if (legacyStrategicTopics.length === 0) return;

      setStrategicTopicItems(legacyStrategicTopics);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [setStrategicTopicItems]);

  useEffect(() => {
    if (strategicTopicItems.length === 0) return;

    const fallbackMeeting = meetings[0] ?? activeMeeting;
    const needsNormalization = strategicTopicItems.some(
      (item) =>
        item.capturedDate === undefined ||
        item.capturedMeetingId === undefined ||
        item.capturedMeetingIndex === undefined ||
        item.completed === undefined ||
        item.completedDate === undefined,
    );

    if (!needsNormalization) return;

    setStrategicTopicItems(
      strategicTopicItems.map((item) =>
        normalizeStrategicTopic(item, fallbackMeeting, 0),
      ),
    );
  }, [activeMeeting, meetings, setStrategicTopicItems, strategicTopicItems]);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleMeetingSectionDragStart = (id: MeetingSectionKey) => {
    setDraggingMeetingSection(id);
  };

  const handleMeetingSectionDrop = (id: MeetingSectionKey) => {
    if (draggingMeetingSection === null || draggingMeetingSection === id)
      return;
    const draggedIndex = meetingSectionOrder.indexOf(draggingMeetingSection);
    const droppedIndex = meetingSectionOrder.indexOf(id);
    if (draggedIndex === -1 || droppedIndex === -1) return;

    const reordered = [...meetingSectionOrder];
    reordered.splice(draggedIndex, 1);
    reordered.splice(droppedIndex, 0, draggingMeetingSection);
    setMeetingSectionOrder(reordered);
    setDraggingMeetingSection(null);
  };

  const updateActiveMeeting = (updates: Partial<Omit<MeetingRecord, "id">>) => {
    setMeetings((currentMeetings) =>
      currentMeetings.map((meeting) =>
        meeting.id === activeMeeting.id ? { ...meeting, ...updates } : meeting,
      ),
    );
  };

  const addMeetingItem = (
    value: string,
    setValue: (value: string) => void,
    sectionKey: MeetingSpecificSectionKey,
  ) => {
    if (!value.trim()) return;
    updateActiveMeeting({
      [sectionKey]: [
        ...activeMeeting[sectionKey],
        { id: Date.now(), text: value.trim() },
      ],
    });
    setValue("");
  };

  const updateMeetingItem = (
    sectionKey: MeetingSpecificSectionKey,
    itemId: number,
    value: string,
  ) => {
    updateActiveMeeting({
      [sectionKey]: activeMeeting[sectionKey].map((item) =>
        item.id === itemId ? { ...item, text: value } : item,
      ),
    });
  };

  const deleteMeetingItem = (
    sectionKey: MeetingSpecificSectionKey,
    itemId: number,
  ) => {
    updateActiveMeeting({
      [sectionKey]: activeMeeting[sectionKey].filter(
        (item) => item.id !== itemId,
      ),
    });
  };

  const addStrategicTopicItem = () => {
    if (!newTopicItem.trim()) return;

    setStrategicTopicItems([
      ...strategicTopicItems,
      {
        id: Date.now(),
        text: newTopicItem.trim(),
        capturedDate: activeMeeting.date,
        capturedMeetingId: activeMeeting.id,
        capturedMeetingIndex: activeMeetingIndex,
        completed: false,
        completedDate: "",
      },
    ]);
    setNewTopicItem("");
  };

  const updateStrategicTopicItem = (itemId: number, value: string) => {
    setStrategicTopicItems(
      strategicTopicItems.map((item) =>
        item.id === itemId ? { ...item, text: value } : item,
      ),
    );
  };

  const updateStrategicTopicCompleted = (
    itemId: number,
    completed: boolean,
  ) => {
    setStrategicTopicItems(
      strategicTopicItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed,
              completedDate: completed
                ? item.completedDate || activeMeeting.date
                : item.completedDate,
            }
          : item,
      ),
    );
  };

  const updateStrategicTopicCompletedDate = (
    itemId: number,
    completedDate: string,
  ) => {
    setStrategicTopicItems(
      strategicTopicItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completedDate,
              completed: completedDate ? true : item.completed,
            }
          : item,
      ),
    );
  };

  const deleteStrategicTopicItem = (itemId: number) => {
    setStrategicTopicItems(
      strategicTopicItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              removedMeetingId: activeMeeting.id,
              removedMeetingIndex: activeMeetingIndex,
              removedDate: activeMeeting.date,
            }
          : item,
      ),
    );
  };

  const createNewMeeting = () => {
    const newMeeting = createBlankMeeting();
    setMeetings([...meetings, newMeeting]);
    setActiveMeetingId(newMeeting.id);
    setNewAgendaItem("");
    setNewDecisionItem("");
    setNewCascadeItem("");
  };

  const deleteCurrentMeeting = () => {
    const isOnlyMeeting = meetings.length <= 1;
    const warningMessage = isOnlyMeeting
      ? "This is the only meeting. Deleting it will reset it to a blank meeting. Continue?"
      : "Delete this meeting? Agenda Items, Decisions / Actions, and Cascading Messages for this meeting will be removed. Strategic Topics remain available in meeting history where appropriate.";

    if (!window.confirm(warningMessage)) return;

    if (isOnlyMeeting) {
      const fallbackMeeting = createBlankMeeting();
      setMeetings([fallbackMeeting]);
      setActiveMeetingId(fallbackMeeting.id);
    } else {
      const remainingMeetings = meetings.filter(
        (meeting) => meeting.id !== activeMeeting.id,
      );
      const fallbackActiveMeeting =
        remainingMeetings[Math.max(activeMeetingIndex - 1, 0)] ??
        remainingMeetings[0];
      setMeetings(remainingMeetings);
      setActiveMeetingId(fallbackActiveMeeting.id);
    }

    setNewAgendaItem("");
    setNewDecisionItem("");
    setNewCascadeItem("");
  };

  const navigateMeeting = (direction: "previous" | "next") => {
    const nextIndex =
      direction === "previous"
        ? activeMeetingIndex - 1
        : activeMeetingIndex + 1;
    const nextMeeting = meetings[nextIndex];
    if (!nextMeeting) return;
    setActiveMeetingId(nextMeeting.id);
    setNewAgendaItem("");
    setNewDecisionItem("");
    setNewCascadeItem("");
  };

  const meetingSections: Record<MeetingSectionKey, MeetingSectionConfig> = {
    agenda: {
      id: "agenda",
      title: "Agenda Items",
      description: "List the meeting agenda items to cover.",
      items: activeMeeting.agendaItems,
      newItem: newAgendaItem,
      setNewItem: setNewAgendaItem,
      addItem: () =>
        addMeetingItem(newAgendaItem, setNewAgendaItem, "agendaItems"),
      updateItem: (itemId, value) =>
        updateMeetingItem("agendaItems", itemId, value),
      deleteItem: (itemId) => deleteMeetingItem("agendaItems", itemId),
      placeholder: "New agenda item",
      editPlaceholder: "Add agenda item",
    },
    topic: {
      id: "topic",
      title: "Strategic Topics",
      description: "Capture high-level topics that carry across meetings.",
      items: visibleStrategicTopicItems,
      newItem: newTopicItem,
      setNewItem: setNewTopicItem,
      addItem: addStrategicTopicItem,
      updateItem: updateStrategicTopicItem,
      deleteItem: deleteStrategicTopicItem,
      updateCompleted: updateStrategicTopicCompleted,
      updateCompletedDate: updateStrategicTopicCompletedDate,
      placeholder: "New strategic topic",
      editPlaceholder: "Add strategic topic",
    },
    decision: {
      id: "decision",
      title: "Decisions / Actions",
      description: "Document the decisions and next actions from the meeting.",
      items: activeMeeting.decisionItems,
      newItem: newDecisionItem,
      setNewItem: setNewDecisionItem,
      addItem: () =>
        addMeetingItem(newDecisionItem, setNewDecisionItem, "decisionItems"),
      updateItem: (itemId, value) =>
        updateMeetingItem("decisionItems", itemId, value),
      deleteItem: (itemId) => deleteMeetingItem("decisionItems", itemId),
      placeholder: "New decision or action",
      editPlaceholder: "Decision or action item",
    },
    cascade: {
      id: "cascade",
      title: "Cascading Messages",
      description: "Capture key messages to share across the team.",
      items: activeMeeting.cascadeItems,
      newItem: newCascadeItem,
      setNewItem: setNewCascadeItem,
      addItem: () =>
        addMeetingItem(newCascadeItem, setNewCascadeItem, "cascadeItems"),
      updateItem: (itemId, value) =>
        updateMeetingItem("cascadeItems", itemId, value),
      deleteItem: (itemId) => deleteMeetingItem("cascadeItems", itemId),
      placeholder: "New cascading message",
      editPlaceholder: "Cascading message",
    },
  };

  const renderMissionValue = (value: RichTextValue) => {
    if (typeof value !== "string") {
      return <RichTextRenderer value={value} className="text-slate-700" />;
    }

    const entries = value
      .split(/[\n•\u2022]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (entries.length > 1) {
      return (
        <ul className="list-disc list-inside space-y-1 text-slate-700">
          {entries.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }

    return <p className="text-slate-700 whitespace-pre-line">{value}</p>;
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-5xl font-bold text-slate-900">
              {dashboardTitle}
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Name your team or meeting from the settings menu.
            </p>
          </div>

          <button
            onClick={() => setShowPreferences(true)}
            className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700"
            aria-label="Open preferences"
          >
            <span className="text-2xl">⚙️</span>
          </button>
        </div>

        <div className="mb-10 space-y-5">
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow border-l-8 border-blue-500">
            <h2 className="font-bold text-2xl mb-4 text-black">
              Why Do We Exist?
            </h2>
            <div className="text-lg leading-relaxed">
              {renderMissionValue(organizationInfoWithDefaults.whyExist)}
            </div>
          </section>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-5 shadow">
              <h2 className="font-bold text-lg mb-3 text-black">
                How Do We Behave?
              </h2>
              {renderMissionValue(organizationInfoWithDefaults.howBehave)}
            </div>
            <div className="bg-white rounded-3xl p-5 shadow">
              <h2 className="font-bold text-lg mb-3 text-black">
                What Do We Do?
              </h2>
              {renderMissionValue(organizationInfoWithDefaults.whatDo)}
            </div>
            <div className="bg-white rounded-3xl p-5 shadow">
              <h2 className="font-bold text-lg mb-3 text-black">
                How Will We Succeed?
              </h2>
              {renderMissionValue(organizationInfoWithDefaults.howSucceed)}
            </div>
          </div>

          <section className="bg-amber-50 rounded-3xl p-6 md:p-8 shadow border border-amber-100">
            <h2 className="font-bold text-2xl mb-4 text-black">Top Priority</h2>
            <p className="text-3xl font-bold leading-snug text-slate-900 whitespace-pre-line">
              {organizationInfoWithDefaults.rallyCry || "Top Priority"}
            </p>
          </section>
        </div>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                SOP Workflow
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                From priority to repeatable operations
              </h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-500">
              Keep the operating rhythm lightweight: define the need, document the standard, assign ownership, and review it in meetings.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["1", "Identify", "Name the recurring work or gap tied to the top priority."],
              ["2", "Document", "Capture the simplest repeatable standard for the team."],
              ["3", "Assign", "Clarify the owner and where follow-up actions live."],
              ["4", "Review", "Inspect adoption and update the SOP when reality changes."],
            ].map(([step, title, description]) => (
              <div
                key={step}
                className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {step}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold text-slate-900">
            Defining Objectives
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addObjective}
              className="rounded-full border border-slate-300 px-4 py-2 bg-white text-slate-800 hover:bg-slate-50"
            >
              + Add Section
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              taskInput={taskInputs[objective.id]}
              onDragStart={handleObjectiveDragStart}
              onDragOver={handleDragOver}
              onDrop={handleObjectiveDrop}
              onUpdateTitle={updateObjectiveTitle}
              onUpdateDescription={updateObjectiveDescription}
              onUpdateColor={updateObjectiveColor}
              onDelete={deleteObjective}
              onTaskInputChange={updateTaskInput}
              onAddTask={addTask}
              onOpenTask={openTaskDetails}
              onTaskStatusChange={updateTaskStatus}
            />
          ))}
        </div>

        <div className="mt-10 mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Meeting Notes
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Use the arrows to review archived meetings, or start a new blank
                meeting to archive this one.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Current meeting date
                <input
                  type="date"
                  value={activeMeeting.date}
                  onChange={(e) =>
                    updateActiveMeeting({ date: e.target.value })
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateMeeting("previous")}
                  disabled={!canNavigateToPreviousMeeting}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="View previous meeting"
                >
                  ←
                </button>
                <span className="min-w-24 text-center text-sm font-medium text-slate-600">
                  {meetings.length === 0
                    ? "0 of 0"
                    : `${activeMeetingIndex + 1} of ${meetings.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => navigateMeeting("next")}
                  disabled={!canNavigateToNextMeeting}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="View next meeting"
                >
                  →
                </button>
              </div>

              <button
                type="button"
                onClick={createNewMeeting}
                className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                + New Blank Meeting
              </button>

              <button
                type="button"
                onClick={deleteCurrentMeeting}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100"
              >
                Delete Current Meeting
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {meetingSectionOrder.map((sectionKey) => (
            <MeetingSection
              key={sectionKey}
              section={meetingSections[sectionKey]}
              onDragStart={handleMeetingSectionDragStart}
              onDragOver={handleDragOver}
              onDrop={handleMeetingSectionDrop}
            />
          ))}
        </div>
      </div>

      {selectedObjective && selectedTaskDetails ? (
        <TaskDetailsModal
          task={selectedTaskDetails}
          objectiveTitle={selectedObjective.title}
          onClose={closeTaskDetails}
          onDelete={() =>
            deleteTask(selectedObjective.id, selectedTaskDetails.id)
          }
          onUpdate={(updates) =>
            updateTask(selectedObjective.id, selectedTaskDetails.id, updates)
          }
        />
      ) : null}

      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        organizationInfo={organizationInfoWithDefaults}
        onSave={setOrganizationInfo}
        dashboardTitle={dashboardTitle}
        onDashboardTitleChange={setDashboardTitle}
      />
    </main>
  );
}
