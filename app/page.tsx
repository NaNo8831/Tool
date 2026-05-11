"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { BackupRestoreModal } from "@/app/components/dashboard/BackupRestoreModal";
import { MeetingSetupModal } from "@/app/components/dashboard/MeetingSetupModal";
import { PlaybookDefinitionsModal } from "@/app/components/dashboard/PlaybookDefinitionsModal";
import { MeetingSection } from "@/app/components/meeting/MeetingSection";
import { ObjectiveCard } from "@/app/components/objectives/ObjectiveCard";
import { TaskDetailsModal } from "@/app/components/objectives/TaskDetailsModal";
import { ColorSquareSelect } from "@/app/components/ui/ColorSquareSelect";
import {
  RichTextEditor,
  RichTextRenderer,
} from "@/app/components/ui/RichTextEditor";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useObjectives } from "@/app/hooks/useObjectives";
import {
  defaultDashboardTitle,
  defaultMeetingSectionOrder,
  defaultObjectiveColor,
  defaultOrganizationInfo,
  defaultStandardOperatingObjectives,
  objectiveColorClasses,
} from "@/app/lib/objectiveOptions";
import {
  collectWorkspaceStorage,
  createWorkspaceBackup,
  restoreWorkspaceBackup,
  validateWorkspaceBackup,
  type WorkspaceBackupFeedback,
} from "@/app/lib/workspaceBackup";
import type {
  MeetingItem,
  MeetingRecord,
  MeetingSectionConfig,
  MeetingSectionKey,
  StandardOperatingObjective,
} from "@/app/types/dashboard";
import type { ObjectiveColor } from "@/app/types/objective";
import type { RichTextValue } from "@/app/types/richText";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const strategicTopicsStorageKey = "leadership-strategic-topic-items";
const meetingSetupCompletedStorageKey = "leadership-meeting-setup-completed";
type MeetingSpecificSectionKey =
  | "agendaItems"
  | "decisionItems"
  | "cascadeItems";

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
    hasLoadedObjectives,
  } = useObjectives();
  const [meetings, setMeetings, hasLoadedMeetings] = useLocalStorage<
    MeetingRecord[]
  >("leadership-meetings", initialMeetings);
  const [activeMeetingId, setActiveMeetingId, hasLoadedActiveMeetingId] =
    useLocalStorage<number>(
      "leadership-active-meeting-id",
      initialMeetings[0].id,
    );
  const [dashboardTitle, setDashboardTitle, hasLoadedDashboardTitle] =
    useLocalStorage("leadership-dashboard-title", defaultDashboardTitle);
  const [organizationInfo, setOrganizationInfo, hasLoadedOrganizationInfo] =
    useLocalStorage("leadership-organization-info", defaultOrganizationInfo);
  const [
    hasCompletedMeetingSetup,
    setHasCompletedMeetingSetup,
    hasLoadedMeetingSetup,
  ] = useLocalStorage(meetingSetupCompletedStorageKey, false);
  const [
    meetingSectionOrder,
    setMeetingSectionOrder,
    hasLoadedMeetingSectionOrder,
  ] = useLocalStorage<MeetingSectionKey[]>(
    "leadership-meeting-section-order",
    defaultMeetingSectionOrder,
  );
  const [
    strategicTopicItems,
    setStrategicTopicItems,
    hasLoadedStrategicTopicItems,
  ] = useLocalStorage<MeetingItem[]>(strategicTopicsStorageKey, []);
  const [
    standardOperatingObjectives,
    setStandardOperatingObjectives,
    hasLoadedStandardOperatingObjectives,
  ] = useLocalStorage<StandardOperatingObjective[]>(
    "leadership-standard-operating-objectives",
    defaultStandardOperatingObjectives,
  );
  const [selectedStandardObjectiveId, setSelectedStandardObjectiveId] =
    useState<number | null>(null);
  const [standardObjectiveDraft, setStandardObjectiveDraft] = useState({
    title: "",
    description: "" as RichTextValue,
    color: defaultObjectiveColor as ObjectiveColor,
  });
  const [newAgendaItem, setNewAgendaItem] = useState("");
  const [newTopicItem, setNewTopicItem] = useState("");
  const [newDecisionItem, setNewDecisionItem] = useState("");
  const [newCascadeItem, setNewCascadeItem] = useState("");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const [showMeetingSetup, setShowMeetingSetup] = useState(false);
  const [showPlaybookDefinitions, setShowPlaybookDefinitions] = useState(false);
  const [showBackupRestore, setShowBackupRestore] = useState(false);
  const [backupFeedback, setBackupFeedback] =
    useState<WorkspaceBackupFeedback | null>(null);
  const [draggingMeetingSection, setDraggingMeetingSection] =
    useState<MeetingSectionKey | null>(null);
  const [draggingStandardObjectiveId, setDraggingStandardObjectiveId] =
    useState<number | null>(null);
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
  const hasLoadedDashboardStorage =
    hasLoadedObjectives &&
    hasLoadedMeetings &&
    hasLoadedActiveMeetingId &&
    hasLoadedDashboardTitle &&
    hasLoadedOrganizationInfo &&
    hasLoadedMeetingSetup &&
    hasLoadedMeetingSectionOrder &&
    hasLoadedStrategicTopicItems &&
    hasLoadedStandardOperatingObjectives;

  useEffect(() => {
    if (!hasLoadedMeetingSetup || hasCompletedMeetingSetup) return;

    const timeoutId = window.setTimeout(() => setShowMeetingSetup(true), 0);

    return () => window.clearTimeout(timeoutId);
  }, [hasCompletedMeetingSetup, hasLoadedMeetingSetup]);

  useEffect(() => {
    if (!showSettingsMenu) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const menuElement = settingsMenuRef.current;
      if (!menuElement || !(event.target instanceof Node)) return;
      if (menuElement.contains(event.target)) return;

      setShowSettingsMenu(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [showSettingsMenu]);

  useEffect(() => {
    if (!hasLoadedMeetings) return;

    const timeoutId = window.setTimeout(() => {
      if (window.localStorage.getItem("leadership-meetings") !== null) return;

      const legacyMeeting = getLegacyMeeting();
      if (!hasMeetingItems(legacyMeeting)) return;

      setMeetings([legacyMeeting]);
      setActiveMeetingId(legacyMeeting.id);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hasLoadedMeetings, setActiveMeetingId, setMeetings]);

  useEffect(() => {
    if (!hasLoadedStrategicTopicItems) return;

    const timeoutId = window.setTimeout(() => {
      if (window.localStorage.getItem(strategicTopicsStorageKey) !== null)
        return;

      const legacyStrategicTopics = getLegacyStrategicTopics();
      if (legacyStrategicTopics.length === 0) return;

      setStrategicTopicItems(legacyStrategicTopics);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hasLoadedStrategicTopicItems, setStrategicTopicItems]);

  useEffect(() => {
    if (!hasLoadedStrategicTopicItems || strategicTopicItems.length === 0)
      return;

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
  }, [
    activeMeeting,
    hasLoadedStrategicTopicItems,
    meetings,
    setStrategicTopicItems,
    strategicTopicItems,
  ]);

  useEffect(() => {
    if (!hasLoadedStandardOperatingObjectives) return;

    const needsColorDefaults = standardOperatingObjectives.some(
      (item) => item.color === undefined,
    );

    if (!needsColorDefaults) return;

    setStandardOperatingObjectives(
      standardOperatingObjectives.map((item) => ({
        ...item,
        color: item.color ?? defaultObjectiveColor,
      })),
    );
  }, [
    hasLoadedStandardOperatingObjectives,
    setStandardOperatingObjectives,
    standardOperatingObjectives,
  ]);

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

  const getStandardObjectiveColor = (item: StandardOperatingObjective) =>
    item.color ?? defaultObjectiveColor;

  const openStandardObjectiveEditor = (item: StandardOperatingObjective) => {
    setSelectedStandardObjectiveId(item.id);
    setStandardObjectiveDraft({
      title: item.title,
      description: item.description,
      color: getStandardObjectiveColor(item),
    });
  };

  const closeStandardObjectiveEditor = () => {
    setSelectedStandardObjectiveId(null);
    setStandardObjectiveDraft({
      title: "",
      description: "",
      color: defaultObjectiveColor,
    });
  };

  const addStandardObjective = () => {
    const newStandardObjective: StandardOperatingObjective = {
      id: Date.now(),
      title: "New Standard Objective",
      description: "",
      color: defaultObjectiveColor,
    };

    setStandardOperatingObjectives([
      ...standardOperatingObjectives,
      newStandardObjective,
    ]);
    openStandardObjectiveEditor(newStandardObjective);
  };

  const saveStandardObjective = () => {
    if (selectedStandardObjectiveId === null) return;

    const nextTitle = standardObjectiveDraft.title.trim();
    setStandardOperatingObjectives(
      standardOperatingObjectives.map((item) =>
        item.id === selectedStandardObjectiveId
          ? {
              ...item,
              title: nextTitle || "New Standard Objective",
              description: standardObjectiveDraft.description,
              color: standardObjectiveDraft.color,
            }
          : item,
      ),
    );
    closeStandardObjectiveEditor();
  };

  const deleteStandardObjective = () => {
    if (selectedStandardObjectiveId === null) return;
    if (!window.confirm("Delete this standard operating objective?")) return;

    setStandardOperatingObjectives(
      standardOperatingObjectives.filter(
        (item) => item.id !== selectedStandardObjectiveId,
      ),
    );
    closeStandardObjectiveEditor();
  };

  const updateStandardObjectiveColor = (
    itemId: number,
    color: ObjectiveColor,
  ) => {
    setStandardOperatingObjectives(
      standardOperatingObjectives.map((item) =>
        item.id === itemId ? { ...item, color } : item,
      ),
    );
  };

  const handleStandardObjectiveDragStart = (
    event: DragEvent<HTMLDivElement>,
    itemId: number,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-standard-operating-objective-id",
      String(itemId),
    );
    setDraggingStandardObjectiveId(itemId);
  };

  const handleStandardObjectiveDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    if (
      !event.dataTransfer.types.includes(
        "application/x-standard-operating-objective-id",
      )
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
  };

  const handleStandardObjectiveDrop = (
    event: DragEvent<HTMLDivElement>,
    targetItemId: number,
  ) => {
    const draggedItemIdValue = event.dataTransfer.getData(
      "application/x-standard-operating-objective-id",
    );
    if (!draggedItemIdValue) return;

    event.preventDefault();
    event.stopPropagation();

    const draggedItemId = Number(draggedItemIdValue);
    if (!Number.isFinite(draggedItemId) || draggedItemId === targetItemId) {
      setDraggingStandardObjectiveId(null);
      return;
    }

    const draggedIndex = standardOperatingObjectives.findIndex(
      (item) => item.id === draggedItemId,
    );
    const targetIndex = standardOperatingObjectives.findIndex(
      (item) => item.id === targetItemId,
    );
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggingStandardObjectiveId(null);
      return;
    }

    const reordered = [...standardOperatingObjectives];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);
    setStandardOperatingObjectives(reordered);
    setDraggingStandardObjectiveId(null);
  };

  const handleStandardObjectiveDragEnd = () => {
    setDraggingStandardObjectiveId(null);
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

  const getCurrentWorkspaceStorage = () =>
    collectWorkspaceStorage({
      "leadership-objectives": objectives,
      "leadership-meetings": meetings,
      "leadership-active-meeting-id": activeMeeting.id,
      "leadership-dashboard-title": dashboardTitle,
      "leadership-organization-info": organizationInfo,
      [meetingSetupCompletedStorageKey]: hasCompletedMeetingSetup,
      "leadership-meeting-section-order": meetingSectionOrder,
      [strategicTopicsStorageKey]: strategicTopicItems,
      "leadership-standard-operating-objectives": standardOperatingObjectives,
    });

  const handleExportWorkspaceBackup = () => {
    try {
      const backup = createWorkspaceBackup(getCurrentWorkspaceStorage());
      const backupJson = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupJson], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      const dateStamp = new Date().toISOString().slice(0, 10);

      downloadLink.href = downloadUrl;
      downloadLink.download = `meeting-tool-workspace-backup-${dateStamp}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);

      setBackupFeedback({
        type: "success",
        message: "Workspace backup exported successfully.",
      });
    } catch (error) {
      setBackupFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to export workspace backup.",
      });
    }
  };

  const handleImportWorkspaceBackup = async (file: File) => {
    try {
      const fileText = await file.text();
      const parsedBackup = JSON.parse(fileText) as unknown;
      const backup = validateWorkspaceBackup(parsedBackup);
      const shouldReplace = window.confirm(
        "Importing this backup will replace the current Meeting Tool data stored in this browser. Continue?",
      );

      if (!shouldReplace) {
        setBackupFeedback({
          type: "error",
          message: "Import canceled. Current workspace data was not changed.",
        });
        return;
      }

      restoreWorkspaceBackup(backup);
      setBackupFeedback({
        type: "success",
        message: "Workspace backup imported successfully. Reloading…",
      });
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setBackupFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to import workspace backup.",
      });
    }
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

  if (!hasLoadedDashboardStorage) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto flex min-h-[60vh] max-w-[1600px] items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center text-slate-600 shadow-sm">
            Loading saved dashboard…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-5xl font-bold text-slate-900">
              {dashboardTitle}
            </h1>
          </div>

          <div ref={settingsMenuRef} className="relative self-start">
            <button
              type="button"
              onClick={() => setShowSettingsMenu((isOpen) => !isOpen)}
              className="flex h-14 items-center gap-2 rounded-full bg-blue-600 px-5 font-semibold text-white shadow-lg hover:bg-blue-700"
              aria-expanded={showSettingsMenu}
              aria-haspopup="menu"
              aria-label="Open dashboard menu"
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                ☰
              </span>
              Menu
            </button>

            {showSettingsMenu ? (
              <div
                className="absolute right-0 z-40 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
                role="menu"
                aria-label="Dashboard menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMeetingSetup(true);
                    setShowSettingsMenu(false);
                  }}
                  className="block w-full px-5 py-3 text-left text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                  role="menuitem"
                >
                  Meeting Setup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPlaybookDefinitions(true);
                    setShowSettingsMenu(false);
                  }}
                  className="block w-full px-5 py-3 text-left text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                  role="menuitem"
                >
                  Playbook Definitions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBackupRestore(true);
                    setShowSettingsMenu(false);
                  }}
                  className="block w-full px-5 py-3 text-left text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                  role="menuitem"
                >
                  Backup / Restore
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mb-10 space-y-5">
          <section className="bg-white rounded-3xl p-6 text-center shadow md:p-8">
            <h2 className="mb-4 text-2xl font-bold text-black">
              Why Do We Exist?
            </h2>
            <div className="mx-auto max-w-4xl text-lg leading-relaxed">
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

          <section className="mx-auto max-w-4xl rounded-3xl border border-blue-100 bg-blue-50/80 p-6 text-center shadow md:p-8">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-600">
              Top Priority
            </p>
            <p className="text-3xl font-bold leading-snug text-slate-900 whitespace-pre-line">
              {organizationInfoWithDefaults.rallyCry || "Top Priority"}
            </p>
          </section>
        </div>

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

        <div className="grid gap-6 xl:grid-cols-2">
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

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Standard Operating Objectives
            </p>
            <button
              type="button"
              onClick={addStandardObjective}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold leading-none text-white shadow-sm hover:bg-blue-700"
              aria-label="Add standard operating objective"
            >
              +
            </button>
          </div>

          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
            {standardOperatingObjectives.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(event) =>
                  handleStandardObjectiveDragStart(event, item.id)
                }
                onDragOver={handleStandardObjectiveDragOver}
                onDrop={(event) => handleStandardObjectiveDrop(event, item.id)}
                onDragEnd={handleStandardObjectiveDragEnd}
                className={`flex min-w-0 cursor-grab items-center gap-3 rounded-2xl border border-l-8 border-blue-100 bg-blue-50/70 p-3 text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-100/80 active:cursor-grabbing ${objectiveColorClasses[getStandardObjectiveColor(item)]} ${draggingStandardObjectiveId === item.id ? "opacity-60 ring-2 ring-blue-200" : ""}`}
                aria-label={`Drag ${item.title || "standard operating objective"} to reorder standard operating objectives`}
              >
                <span
                  className="shrink-0 select-none text-lg leading-none text-slate-400"
                  aria-hidden="true"
                >
                  ⋮⋮
                </span>
                <button
                  type="button"
                  onClick={() => openStandardObjectiveEditor(item)}
                  className="min-w-0 flex-1 rounded-lg text-left text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <span className="block truncate">{item.title}</span>
                </button>
                <ColorSquareSelect
                  value={getStandardObjectiveColor(item)}
                  onChange={(color) =>
                    updateStandardObjectiveColor(item.id, color)
                  }
                  ariaLabel="Standard operating objective color"
                />
              </div>
            ))}
          </div>
        </section>

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

      {selectedStandardObjectiveId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Standard Operating Objective
                </p>
                <h2 className="mt-1 text-3xl font-bold text-slate-950">
                  Edit Objective
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ColorSquareSelect
                  value={standardObjectiveDraft.color}
                  onChange={(color) =>
                    setStandardObjectiveDraft((draft) => ({
                      ...draft,
                      color,
                    }))
                  }
                  ariaLabel="Standard operating objective modal color"
                />
                <button
                  type="button"
                  onClick={closeStandardObjectiveEditor}
                  className="rounded-full px-3 py-1 text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close standard operating objective editor"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-lg font-semibold text-slate-900">
                  Title
                </span>
                <input
                  type="text"
                  value={standardObjectiveDraft.title}
                  onChange={(event) =>
                    setStandardObjectiveDraft((draft) => ({
                      ...draft,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="New Standard Objective"
                />
              </label>

              <div>
                <span className="mb-2 block text-lg font-semibold text-slate-900">
                  Description
                </span>
                <RichTextEditor
                  key={selectedStandardObjectiveId}
                  value={standardObjectiveDraft.description}
                  onChange={(description) =>
                    setStandardObjectiveDraft((draft) => ({
                      ...draft,
                      description,
                    }))
                  }
                  placeholder="Add standard operating objective details..."
                  className="bg-blue-50/50"
                  editorClassName="text-base leading-relaxed"
                  minHeightClassName="min-h-[180px]"
                  ariaLabel="Standard operating objective description"
                  editingMode="always"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={deleteStandardObjective}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-2 font-semibold text-red-700 hover:bg-red-100"
              >
                Delete
              </button>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeStandardObjectiveEditor}
                  className="rounded-xl bg-slate-500 px-5 py-2 font-semibold text-white hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveStandardObjective}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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

      <MeetingSetupModal
        isOpen={showMeetingSetup}
        onClose={() => setShowMeetingSetup(false)}
        organizationInfo={organizationInfoWithDefaults}
        onSave={setOrganizationInfo}
        dashboardTitle={dashboardTitle}
        onDashboardTitleChange={setDashboardTitle}
        onComplete={() => setHasCompletedMeetingSetup(true)}
        requireCompletion={!hasCompletedMeetingSetup}
      />

      <PlaybookDefinitionsModal
        isOpen={showPlaybookDefinitions}
        onClose={() => setShowPlaybookDefinitions(false)}
        organizationInfo={organizationInfoWithDefaults}
        onSave={setOrganizationInfo}
        dashboardTitle={dashboardTitle}
        onDashboardTitleChange={setDashboardTitle}
      />

      <BackupRestoreModal
        isOpen={showBackupRestore}
        onClose={() => setShowBackupRestore(false)}
        onExportWorkspaceBackup={handleExportWorkspaceBackup}
        onImportWorkspaceBackup={handleImportWorkspaceBackup}
        backupFeedback={backupFeedback}
      />
    </main>
  );
}
