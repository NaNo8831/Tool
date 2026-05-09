'use client';

import { DragEvent, useState, type Dispatch, type SetStateAction } from 'react';
import { objectivesData, Objective } from '@/data/objectives';
import { EditableField } from './components/EditableField';
import { PreferencesModal } from './components/PreferencesModal';

type Task = Objective['tasks'][number];

type MeetingSectionKey = 'agenda' | 'topic' | 'decision' | 'cascade';

interface OrganizationInfo {
  whyExist: string;
  howBehave: string;
  whatDo: string;
  howSucceed: string;
}

const statusOptions = ['planning', 'in-progress', 'waiting', 'completed'] as const;
const colorClasses: Record<Objective['color'], string> = {
  'dark-green': 'border-emerald-700',
  green: 'border-emerald-500',
  yellow: 'border-yellow-400',
  orange: 'border-orange-500',
  red: 'border-red-500'
};

export default function Home() {
  const [objectives, setObjectives] = useState<Objective[]>(objectivesData);
  const [agendaItems, setAgendaItems] = useState<{ id: number; text: string }[]>([]);
  const [topicItems, setTopicItems] = useState<{ id: number; text: string }[]>([]);
  const [decisionItems, setDecisionItems] = useState<{ id: number; text: string }[]>([]);
  const [cascadeItems, setCascadeItems] = useState<{ id: number; text: string }[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [newTopicItem, setNewTopicItem] = useState('');
  const [newDecisionItem, setNewDecisionItem] = useState('');
  const [newCascadeItem, setNewCascadeItem] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState('Leadership Objectives Dashboard');
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    whyExist: 'To help people encounter Jesus and grow in faith.',
    howBehave: 'Childlike Hearts • Loyal Servants • Hungry for More',
    whatDo: 'We disciple people, build community, and equip leaders.',
    howSucceed: 'Through intentional leadership and accountability.'
  });
  const [taskInputs, setTaskInputs] = useState<Record<number, { title: string; assignedTo: string }>>({});
  const [draggingObjectiveId, setDraggingObjectiveId] = useState<number | null>(null);
  const [meetingSectionOrder, setMeetingSectionOrder] = useState<MeetingSectionKey[]>(['agenda', 'topic', 'decision', 'cascade']);
  const [draggingMeetingSection, setDraggingMeetingSection] = useState<MeetingSectionKey | null>(null);

  const updateObjectiveStatus = (id: number, newStatus: string) => {
    setObjectives(objectives.map((obj) =>
      obj.id === id ? { ...obj, status: newStatus as Objective['status'] } : obj
    ));
  };

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

  const addAgendaItem = () => {
    if (!newAgendaItem.trim()) return;
    setAgendaItems([...agendaItems, { id: Date.now(), text: newAgendaItem.trim() }]);
    setNewAgendaItem('');
  };

  const addTopicItem = () => {
    if (!newTopicItem.trim()) return;
    setTopicItems([...topicItems, { id: Date.now(), text: newTopicItem.trim() }]);
    setNewTopicItem('');
  };

  const addDecisionItem = () => {
    if (!newDecisionItem.trim()) return;
    setDecisionItems([...decisionItems, { id: Date.now(), text: newDecisionItem.trim() }]);
    setNewDecisionItem('');
  };

  const addCascadeItem = () => {
    if (!newCascadeItem.trim()) return;
    setCascadeItems([...cascadeItems, { id: Date.now(), text: newCascadeItem.trim() }]);
    setNewCascadeItem('');
  };

  const updateAgendaItem = (itemId: number, value: string) => {
    setAgendaItems(agendaItems.map((item) => (item.id === itemId ? { ...item, text: value } : item)));
  };

  const updateTopicItem = (itemId: number, value: string) => {
    setTopicItems(topicItems.map((item) => (item.id === itemId ? { ...item, text: value } : item)));
  };

  const updateDecisionItem = (itemId: number, value: string) => {
    setDecisionItems(decisionItems.map((item) => (item.id === itemId ? { ...item, text: value } : item)));
  };

  const updateCascadeItem = (itemId: number, value: string) => {
    setCascadeItems(cascadeItems.map((item) => (item.id === itemId ? { ...item, text: value } : item)));
  };

  const deleteAgendaItem = (itemId: number) => {
    setAgendaItems(agendaItems.filter((item) => item.id !== itemId));
  };

  const deleteTopicItem = (itemId: number) => {
    setTopicItems(topicItems.filter((item) => item.id !== itemId));
  };

  const deleteDecisionItem = (itemId: number) => {
    setDecisionItems(decisionItems.filter((item) => item.id !== itemId));
  };

  const deleteCascadeItem = (itemId: number) => {
    setCascadeItems(cascadeItems.filter((item) => item.id !== itemId));
  };

  const meetingSections: Record<MeetingSectionKey, {
    id: MeetingSectionKey;
    title: string;
    description: string;
    items: { id: number; text: string }[];
    newItem: string;
    setNewItem: Dispatch<SetStateAction<string>>;
    addItem: () => void;
    updateItem: (itemId: number, value: string) => void;
    deleteItem: (itemId: number) => void;
    placeholder: string;
    editPlaceholder: string;
  }> = {
    agenda: {
      id: 'agenda',
      title: 'Agenda Items',
      description: 'List the meeting agenda items to cover.',
      items: agendaItems,
      newItem: newAgendaItem,
      setNewItem: setNewAgendaItem,
      addItem: addAgendaItem,
      updateItem: updateAgendaItem,
      deleteItem: deleteAgendaItem,
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
      addItem: addTopicItem,
      updateItem: updateTopicItem,
      deleteItem: deleteTopicItem,
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
      addItem: addDecisionItem,
      updateItem: updateDecisionItem,
      deleteItem: deleteDecisionItem,
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
      addItem: addCascadeItem,
      updateItem: updateCascadeItem,
      deleteItem: deleteCascadeItem,
      placeholder: 'New cascading message',
      editPlaceholder: 'Cascading message'
    }
  };

  const renderMissionValue = (value: string) => {
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
            <h1 className="text-5xl font-bold text-slate-900">{dashboardTitle}</h1>
            <p className="text-slate-700 mt-3 text-lg">Strategic planning and accountability platform</p>
          </div>

          <button
            onClick={() => setShowPreferences(true)}
            className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700"
            aria-label="Open preferences"
          >
            <span className="text-2xl">⚙️</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3 text-black">Why Do We Exist?</h2>
            {renderMissionValue(organizationInfo.whyExist)}
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3 text-black">How Do We Behave?</h2>
            {renderMissionValue(organizationInfo.howBehave)}
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3 text-black">What Do We Do?</h2>
            {renderMissionValue(organizationInfo.whatDo)}
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3 text-black">How Will We Succeed?</h2>
            {renderMissionValue(organizationInfo.howSucceed)}
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
            <div
              key={objective.id}
              draggable
              onDragStart={() => handleDragStart(objective.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(objective.id)}
              className={`relative rounded-3xl p-6 shadow bg-white/80 backdrop-blur-sm border-t-[18px] ${colorClasses[objective.color]} cursor-grab transition hover:shadow-xl`}
            >
              <div className="pr-14 mb-5">
                <EditableField
                  value={objective.title}
                  onSave={(value) => updateObjectiveTitle(objective.id, value)}
                  placeholder="Objective title"
                  className="text-2xl font-semibold text-slate-900 mb-3"
                />
                <EditableField
                  value={objective.description}
                  onSave={(value) => updateObjectiveDescription(objective.id, value)}
                  placeholder="Objective description"
                  multiline
                  className="text-slate-700"
                />
              </div>

              <button
                type="button"
                onClick={() => deleteObjective(objective.id)}
                className="absolute right-5 top-5 w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200"
                aria-label="Delete objective"
              >
                ×
              </button>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={objective.color}
                    onChange={(e) => updateObjectiveColor(objective.id, e.target.value as Objective['color'])}
                    className="border rounded-xl px-3 py-2 bg-white text-slate-900"
                  >
                    <option value="dark-green">Dark Green</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="orange">Orange</option>
                    <option value="red">Red</option>
                  </select>
                </div>
                <div className="text-sm text-slate-500">Drag the section to reorder</div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {statusOptions.map((status) => (
                  <div key={status} className="bg-slate-100 rounded-2xl p-4 min-h-[180px]">
                    <h4 className="font-semibold mb-4 capitalize text-slate-800">{status.replace('-', ' ')}</h4>
                    <div className="space-y-3">
                      {objective.tasks.filter((task) => task.status === status).map((task) => (
                        <div key={task.id} className="bg-white rounded-xl p-3 shadow-sm text-slate-800">
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <EditableField
                              value={task.title}
                              onSave={(value) => updateTaskTitle(objective.id, task.id, value)}
                              placeholder="Task title"
                              className="font-semibold text-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => deleteTask(objective.id, task.id)}
                              className="text-red-500 text-xs hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                          <EditableField
                            value={task.assignedTo || ''}
                            onSave={(value) => updateTaskAssignee(objective.id, task.id, value)}
                            placeholder="Assign to (optional)"
                            className="text-slate-600"
                          />
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(objective.id, task.id, e.target.value as Task['status'])}
                            className="w-full mt-3 text-xs border rounded px-2 py-2"
                          >
                            <option value="planning">Planning</option>
                            <option value="in-progress">In Progress</option>
                            <option value="waiting">Waiting</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">Add Task</h4>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
                  <input
                    value={taskInputs[objective.id]?.title || ''}
                    onChange={(e) =>
                      setTaskInputs({
                        ...taskInputs,
                        [objective.id]: {
                          title: e.target.value,
                          assignedTo: taskInputs[objective.id]?.assignedTo || ''
                        }
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTask(objective.id, taskInputs[objective.id]?.title || '', taskInputs[objective.id]?.assignedTo || '');
                      }
                    }}
                    placeholder="Task title"
                    className="px-3 py-3 border border-slate-300 rounded text-slate-900"
                  />
                  <input
                    value={taskInputs[objective.id]?.assignedTo || ''}
                    onChange={(e) =>
                      setTaskInputs({
                        ...taskInputs,
                        [objective.id]: {
                          title: taskInputs[objective.id]?.title || '',
                          assignedTo: e.target.value
                        }
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTask(objective.id, taskInputs[objective.id]?.title || '', taskInputs[objective.id]?.assignedTo || '');
                      }
                    }}
                    placeholder="Assign to (optional)"
                    className="px-3 py-3 border border-slate-300 rounded text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => addTask(objective.id, taskInputs[objective.id]?.title || '', taskInputs[objective.id]?.assignedTo || '')}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-10">
          {meetingSectionOrder.map((sectionKey) => {
            const section = meetingSections[sectionKey];
            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleMeetingSectionDragStart(section.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleMeetingSectionDrop(section.id)}
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
          })}
        </div>
      </div>

      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        organizationInfo={organizationInfo}
        onSave={setOrganizationInfo}
        dashboardTitle={dashboardTitle}
        onDashboardTitleChange={setDashboardTitle}
      />
    </main>
  );
}
