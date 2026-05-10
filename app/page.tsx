'use client';

import { useState, type DragEvent } from 'react';
import { PreferencesModal } from '@/app/components/dashboard/PreferencesModal';
import { MeetingSection } from '@/app/components/meeting/MeetingSection';
import { ObjectiveCard } from '@/app/components/objectives/ObjectiveCard';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import {
  defaultDashboardTitle,
  defaultMeetingSectionOrder,
  defaultOrganizationInfo
} from '@/app/lib/objectiveOptions';
import type {
  MeetingItem,
  MeetingSectionConfig,
  MeetingSectionKey,
  TaskInput
} from '@/app/types/dashboard';
import type { Objective, Task } from '@/app/types/objective';
import { objectivesData } from '@/data/objectives';

export default function Home() {
  const [objectives, setObjectives] = useLocalStorage<Objective[]>('leadership-objectives', objectivesData);
  const [agendaItems, setAgendaItems] = useLocalStorage<MeetingItem[]>('leadership-agenda-items', []);
  const [topicItems, setTopicItems] = useLocalStorage<MeetingItem[]>('leadership-topic-items', []);
  const [decisionItems, setDecisionItems] = useLocalStorage<MeetingItem[]>('leadership-decision-items', []);
  const [cascadeItems, setCascadeItems] = useLocalStorage<MeetingItem[]>('leadership-cascade-items', []);
  const [dashboardTitle, setDashboardTitle] = useLocalStorage('leadership-dashboard-title', defaultDashboardTitle);
  const [organizationInfo, setOrganizationInfo] = useLocalStorage('leadership-organization-info', defaultOrganizationInfo);
  const [meetingSectionOrder, setMeetingSectionOrder] = useLocalStorage<MeetingSectionKey[]>(
    'leadership-meeting-section-order',
    defaultMeetingSectionOrder
  );
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [newTopicItem, setNewTopicItem] = useState('');
  const [newDecisionItem, setNewDecisionItem] = useState('');
  const [newCascadeItem, setNewCascadeItem] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [taskInputs, setTaskInputs] = useState<Record<number, TaskInput>>({});
  const [draggingObjectiveId, setDraggingObjectiveId] = useState<number | null>(null);
  const [draggingMeetingSection, setDraggingMeetingSection] = useState<MeetingSectionKey | null>(null);
  const organizationInfoWithDefaults = { ...defaultOrganizationInfo, ...organizationInfo };

  const updateObjectiveTitle = (id: number, newTitle: string) => {
    setObjectives(objectives.map((obj) =>
      obj.id === id ? { ...obj, title: newTitle } : obj
    ));
  };

  const updateObjectiveDescription = (id: number, newDescription: string) => {
    setObjectives(objectives.map((obj) =>
      obj.id === id ? { ...obj, description: newDescription } : obj
    ));
  };

  const updateObjectiveColor = (id: number, color: Objective['color']) => {
    setObjectives(objectives.map((obj) =>
      obj.id === id ? { ...obj, color } : obj
    ));
  };

  const handleDragStart = (id: number) => {
    setDraggingObjectiveId(id);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (id: number) => {
    if (draggingObjectiveId === null || draggingObjectiveId === id) return;
    const draggedIndex = objectives.findIndex((obj) => obj.id === draggingObjectiveId);
    const droppedIndex = objectives.findIndex((obj) => obj.id === id);
    if (draggedIndex === -1 || droppedIndex === -1) return;

    const reordered = [...objectives];
    const [dragged] = reordered.splice(draggedIndex, 1);
    reordered.splice(droppedIndex, 0, dragged);
    setObjectives(reordered);
    setDraggingObjectiveId(null);
  };

  const handleMeetingSectionDragStart = (id: MeetingSectionKey) => {
    setDraggingMeetingSection(id);
  };

  const handleMeetingSectionDrop = (id: MeetingSectionKey) => {
    if (draggingMeetingSection === null || draggingMeetingSection === id) return;
    const draggedIndex = meetingSectionOrder.indexOf(draggingMeetingSection);
    const droppedIndex = meetingSectionOrder.indexOf(id);
    if (draggedIndex === -1 || droppedIndex === -1) return;

    const reordered = [...meetingSectionOrder];
    reordered.splice(draggedIndex, 1);
    reordered.splice(droppedIndex, 0, draggingMeetingSection);
    setMeetingSectionOrder(reordered);
    setDraggingMeetingSection(null);
  };

  const addObjective = () => {
    const nextId = Date.now();
    setObjectives([
      ...objectives,
      {
        id: nextId,
        title: 'New Objective',
        description: 'Enter a detailed objective summary here.',
        status: 'planning',
        priority: 'medium',
        dueDate: '',
        color: 'green',
        tasks: []
      }
    ]);
  };

  const deleteObjective = (id: number) => {
    if (objectives.length <= 1) return;
    if (!window.confirm('Delete this objective section? This cannot be undone.')) return;
    setObjectives(objectives.filter((obj) => obj.id !== id));
  };

  const addTask = (objectiveId: number, taskTitle: string, assignedTo: string) => {
    const title = taskTitle.trim();
    const assignee = assignedTo.trim();
    if (!title) return;
    if (!assignee) {
      const confirmBlank = window.confirm('You are leaving Assign to blank. Do you want to continue?');
      if (!confirmBlank) return;
    }

    const newTask: Task = {
      id: Date.now(),
      title,
      status: 'planning',
      assignedTo: assignee || ''
    };

    setObjectives(objectives.map((obj) =>
      obj.id === objectiveId ? { ...obj, tasks: [...obj.tasks, newTask] } : obj
    ));
    setTaskInputs({
      ...taskInputs,
      [objectiveId]: { title: '', assignedTo: '' }
    });
  };

  const updateTaskStatus = (objectiveId: number, taskId: number, newStatus: Task['status']) => {
    setObjectives(objectives.map((obj) =>
      obj.id === objectiveId
        ? {
            ...obj,
            tasks: obj.tasks.map((task) =>
              task.id === taskId ? { ...task, status: newStatus } : task
            )
          }
        : obj
    ));
  };

  const updateTaskTitle = (objectiveId: number, taskId: number, newTitle: string) => {
    setObjectives(objectives.map((obj) =>
      obj.id === objectiveId
        ? {
            ...obj,
            tasks: obj.tasks.map((task) =>
              task.id === taskId ? { ...task, title: newTitle } : task
            )
          }
        : obj
    ));
  };

  const updateTaskAssignee = (objectiveId: number, taskId: number, newAssignee: string) => {
    setObjectives(objectives.map((obj) =>
      obj.id === objectiveId
        ? {
            ...obj,
            tasks: obj.tasks.map((task) =>
              task.id === taskId ? { ...task, assignedTo: newAssignee } : task
            )
          }
        : obj
    ));
  };

  const deleteTask = (objectiveId: number, taskId: number) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setObjectives(objectives.map((obj) =>
      obj.id === objectiveId
        ? { ...obj, tasks: obj.tasks.filter((task) => task.id !== taskId) }
        : obj
    ));
  };

  const updateTaskInput = (objectiveId: number, input: TaskInput) => {
    setTaskInputs({
      ...taskInputs,
      [objectiveId]: input
    });
  };

  const addMeetingItem = (
    value: string,
    setValue: (value: string) => void,
    items: MeetingItem[],
    setItems: (items: MeetingItem[]) => void
  ) => {
    if (!value.trim()) return;
    setItems([...items, { id: Date.now(), text: value.trim() }]);
    setValue('');
  };

  const updateMeetingItem = (items: MeetingItem[], setItems: (items: MeetingItem[]) => void, itemId: number, value: string) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, text: value } : item)));
  };

  const deleteMeetingItem = (items: MeetingItem[], setItems: (items: MeetingItem[]) => void, itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const meetingSections: Record<MeetingSectionKey, MeetingSectionConfig> = {
    agenda: {
      id: 'agenda',
      title: 'Agenda Items',
      description: 'List the meeting agenda items to cover.',
      items: agendaItems,
      newItem: newAgendaItem,
      setNewItem: setNewAgendaItem,
      addItem: () => addMeetingItem(newAgendaItem, setNewAgendaItem, agendaItems, setAgendaItems),
      updateItem: (itemId, value) => updateMeetingItem(agendaItems, setAgendaItems, itemId, value),
      deleteItem: (itemId) => deleteMeetingItem(agendaItems, setAgendaItems, itemId),
      placeholder: 'New agenda item',
      editPlaceholder: 'Add agenda item'
    },
    topic: {
      id: 'topic',
      title: 'Potential Strategic Topics',
      description: 'Capture high-level topics for the meeting.',
      items: topicItems,
      newItem: newTopicItem,
      setNewItem: setNewTopicItem,
      addItem: () => addMeetingItem(newTopicItem, setNewTopicItem, topicItems, setTopicItems),
      updateItem: (itemId, value) => updateMeetingItem(topicItems, setTopicItems, itemId, value),
      deleteItem: (itemId) => deleteMeetingItem(topicItems, setTopicItems, itemId),
      placeholder: 'New strategic topic',
      editPlaceholder: 'Add strategic topic'
    },
    decision: {
      id: 'decision',
      title: 'Decisions / Actions',
      description: 'Document the decisions and next actions from the meeting.',
      items: decisionItems,
      newItem: newDecisionItem,
      setNewItem: setNewDecisionItem,
      addItem: () => addMeetingItem(newDecisionItem, setNewDecisionItem, decisionItems, setDecisionItems),
      updateItem: (itemId, value) => updateMeetingItem(decisionItems, setDecisionItems, itemId, value),
      deleteItem: (itemId) => deleteMeetingItem(decisionItems, setDecisionItems, itemId),
      placeholder: 'New decision or action',
      editPlaceholder: 'Decision or action item'
    },
    cascade: {
      id: 'cascade',
      title: 'Cascading Messages',
      description: 'Capture key messages to share across the team.',
      items: cascadeItems,
      newItem: newCascadeItem,
      setNewItem: setNewCascadeItem,
      addItem: () => addMeetingItem(newCascadeItem, setNewCascadeItem, cascadeItems, setCascadeItems),
      updateItem: (itemId, value) => updateMeetingItem(cascadeItems, setCascadeItems, itemId, value),
      deleteItem: (itemId) => deleteMeetingItem(cascadeItems, setCascadeItems, itemId),
      placeholder: 'New cascading message',
      editPlaceholder: 'Cascading message'
    }
  };

  const renderMissionValue = (value = '') => {
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
            <p className="text-lg font-semibold uppercase tracking-[0.2em] text-blue-700">Meeting Tool by LyArk</p>
            <h1 className="text-5xl font-bold text-slate-900 mt-3">{dashboardTitle}</h1>
            <p className="text-slate-700 mt-3 text-lg">
              Use Settings to name your team or meeting and define the play book language below.
            </p>
          </div>

          <button
            onClick={() => setShowPreferences(true)}
            className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700"
            aria-label="Open settings and play book definitions"
          >
            <span className="text-2xl">⚙️</span>
          </button>
        </div>

        <div className="space-y-4 mb-10">
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow border-l-8 border-blue-500">
            <h2 className="font-bold text-2xl mb-4 text-black">Why Do We Exist?</h2>
            <div className="text-lg leading-relaxed">
              {renderMissionValue(organizationInfoWithDefaults.whyExist)}
            </div>
          </section>

          <section className="bg-amber-50 rounded-3xl p-6 md:p-8 shadow border-l-8 border-amber-400">
            <h2 className="font-bold text-2xl mb-4 text-black">Rally Cry</h2>
            <div className="text-xl font-bold leading-relaxed text-slate-900">
              <p className="text-slate-900 whitespace-pre-line">{organizationInfoWithDefaults.rallyCry || 'Rally Cry'}</p>
            </div>
          </section>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow">
              <h2 className="font-bold text-lg mb-3 text-black">How Do We Behave?</h2>
              {renderMissionValue(organizationInfoWithDefaults.howBehave)}
            </div>
            <div className="bg-white rounded-3xl p-5 shadow">
              <h2 className="font-bold text-lg mb-3 text-black">What Do We Do?</h2>
              {renderMissionValue(organizationInfoWithDefaults.whatDo)}
            </div>
            <div className="bg-white rounded-3xl p-5 shadow">
              <h2 className="font-bold text-lg mb-3 text-black">How Will We Succeed?</h2>
              {renderMissionValue(organizationInfoWithDefaults.howSucceed)}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Defining Objectives</h2>
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
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onUpdateTitle={updateObjectiveTitle}
              onUpdateDescription={updateObjectiveDescription}
              onUpdateColor={updateObjectiveColor}
              onDelete={deleteObjective}
              onTaskInputChange={updateTaskInput}
              onAddTask={addTask}
              onUpdateTaskStatus={updateTaskStatus}
              onUpdateTaskTitle={updateTaskTitle}
              onUpdateTaskAssignee={updateTaskAssignee}
              onDeleteTask={deleteTask}
            />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-10">
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
