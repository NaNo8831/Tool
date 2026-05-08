'use client';

import { useState } from 'react';
import { objectivesData, Objective } from '@/data/objectives';
import { EditableField } from './components/EditableField';
import { PreferencesModal } from './components/PreferencesModal';

interface Task {
  id: number;
  title: string;
  status: 'planning' | 'in-progress' | 'waiting' | 'completed';
  assignedTo?: string;
}

interface MeetingNote {
  id: number;
  week: 'last' | 'current' | 'next';
  date: string;
  content: string;
  cascade: string;
}

interface OrganizationInfo {
  whyExist: string;
  howBehave: string;
  whatDo: string;
  howSucceed: string;
}

export default function Home() {
  const [objectives, setObjectives] = useState<Objective[]>(objectivesData);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [currentWeek, setCurrentWeek] = useState<'last' | 'current' | 'next'>('current');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteDate, setNewNoteDate] = useState('');
  const [newNoteCascade, setNewNoteCascade] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    whyExist: 'To help people encounter Jesus and grow in faith.',
    howBehave: 'Childlike Hearts • Loyal Servants • Hungry for More',
    whatDo: 'We disciple people, build community, and equip leaders.',
    howSucceed: 'Through intentional leadership and accountability.'
  });

  const updateObjectiveStatus = (id: number, newStatus: string) => {
    setObjectives(objectives.map(obj =>
      obj.id === id ? { ...obj, status: newStatus as any } : obj
    ));
  };

  const updateObjectiveTitle = (id: number, newTitle: string) => {
    setObjectives(objectives.map(obj =>
      obj.id === id ? { ...obj, title: newTitle } : obj
    ));
  };

  const updateObjectiveDescription = (id: number, newDescription: string) => {
    setObjectives(objectives.map(obj =>
      obj.id === id ? { ...obj, description: newDescription } : obj
    ));
  };

  const addTask = (objectiveId: number, taskTitle: string, assignedTo: string) => {
    if (!taskTitle || !assignedTo) return;
    const newTask: Task = {
      id: Date.now(),
      title: taskTitle,
      status: 'planning',
      assignedTo
    };
    setTasks([...tasks, newTask]);
  };

  const updateTaskStatus = (taskId: number, newStatus: 'planning' | 'in-progress' | 'waiting' | 'completed') => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const updateTaskTitle = (taskId: number, newTitle: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, title: newTitle } : task
    ));
  };

  const updateTaskAssignee = (taskId: number, newAssignee: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, assignedTo: newAssignee } : task
    ));
  };

  const addMeetingNote = () => {
    if (!newNoteContent || !newNoteDate || !newNoteCascade) return;
    const newNote: MeetingNote = {
      id: Date.now(),
      week: currentWeek,
      date: newNoteDate,
      content: newNoteContent,
      cascade: newNoteCascade
    };
    setMeetingNotes([...meetingNotes, newNote]);
    setNewNoteContent('');
    setNewNoteDate('');
    setNewNoteCascade('');
  };

  const updateMeetingNote = (noteId: number, field: 'content' | 'date' | 'cascade', value: string) => {
    setMeetingNotes(meetingNotes.map(note =>
      note.id === noteId ? { ...note, [field]: value } : note
    ));
  };

  const deleteMeetingNote = (noteId: number) => {
    setMeetingNotes(meetingNotes.filter(note => note.id !== noteId));
  };

  const getNotesForWeek = (week: 'last' | 'current' | 'next') => {
    return meetingNotes.filter(note => note.week === week);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-slate-800">
              Leadership Objectives Dashboard
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Strategic planning and accountability platform
            </p>
          </div>
          <button
            onClick={() => setShowPreferences(true)}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
          >
            ⚙️ Preferences
          </button>
        </div>

        {/* Mission Values Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3">Why Do We Exist?</h2>
            <p className="text-slate-600">
              {organizationInfo.whyExist}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3">How Do We Behave?</h2>
            <p className="text-slate-600">
              {organizationInfo.howBehave}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3">What Do We Do?</h2>
            <p className="text-slate-600">
              {organizationInfo.whatDo}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3">How Will We Succeed?</h2>
            <p className="text-slate-600">
              {organizationInfo.howSucceed}
            </p>
          </div>
        </div>

        {/* Objectives Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            Defining Objectives
          </h2>
        </div>

        <div className="space-y-6">
          {objectives.map((objective) => (
            <div
              key={objective.id}
              className={`border-l-8 rounded-3xl p-6 shadow bg-white border-blue-500`}
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex-1">
                  <EditableField
                    value={objective.title}
                    onSave={(value) => updateObjectiveTitle(objective.id, value)}
                    placeholder="Objective title"
                    className="text-2xl font-semibold text-slate-800 mb-2"
                  />
                  <EditableField
                    value={objective.description}
                    onSave={(value) => updateObjectiveDescription(objective.id, value)}
                    placeholder="Objective description"
                    multiline
                    className="text-slate-600"
                  />
                </div>

                <select
                  value={objective.status}
                  onChange={(e) => updateObjectiveStatus(objective.id, e.target.value)}
                  className="border rounded-xl px-4 py-2 bg-white cursor-pointer"
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="waiting">Waiting</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Kanban Board */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {(['planning', 'in-progress', 'waiting', 'completed'] as const).map((status) => (
                  <div key={status} className="bg-slate-100 rounded-2xl p-4 min-h-[200px]">
                    <h4 className="font-semibold mb-4 capitalize">{status.replace('-', ' ')}</h4>
                    <div className="space-y-2">
                      {tasks.filter(task => task.status === status).map(task => (
                        <div key={task.id} className="bg-white rounded-xl p-3 shadow-sm text-sm space-y-2">
                          <EditableField
                            value={task.title}
                            onSave={(value) => updateTaskTitle(task.id, value)}
                            placeholder="Task title"
                            className="font-semibold"
                          />
                          <EditableField
                            value={task.assignedTo || ''}
                            onSave={(value) => updateTaskAssignee(task.id, value)}
                            placeholder="Assigned to"
                            className="text-slate-500"
                          />
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                            className="w-full text-xs border rounded px-2 py-1"
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

              {/* Task Delegation Section */}
              <div className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
                <h4 className="font-semibold mb-3 text-amber-900">👥 Task Delegation</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id={`task-title-${objective.id}`}
                    placeholder="Task title"
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    id={`task-assignee-${objective.id}`}
                    placeholder="Assign to"
                    className="px-3 py-2 border rounded"
                  />
                  <button
                    onClick={() => {
                      const titleInput = document.getElementById(`task-title-${objective.id}`) as HTMLInputElement;
                      const assigneeInput = document.getElementById(`task-assignee-${objective.id}`) as HTMLInputElement;
                      addTask(objective.id, titleInput.value, assigneeInput.value);
                      titleInput.value = '';
                      assigneeInput.value = '';
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                  >
                    Delegate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Meeting Notes Slider */}
        <div className="mt-10 bg-white rounded-3xl p-6 shadow">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            📋 Meeting Notes & Cascading Communication
          </h2>

          {/* Week Navigation */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-slate-100 rounded-xl p-1">
              {(['last', 'current', 'next'] as const).map((week) => (
                <button
                  key={week}
                  onClick={() => setCurrentWeek(week)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentWeek === week
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {week === 'last' ? 'Last Week' : week === 'current' ? 'Current Week' : 'Next Week'}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Display */}
          <div className="space-y-4 mb-6">
            {getNotesForWeek(currentWeek).map((note) => (
              <div key={note.id} className="bg-blue-50 rounded-2xl p-4 border border-blue-200 space-y-2">
                <div className="flex justify-between items-start">
                  <EditableField
                    value={note.date}
                    onSave={(value) => updateMeetingNote(note.id, 'date', value)}
                    placeholder="Date"
                    className="font-semibold text-blue-900"
                  />
                  <button
                    onClick={() => deleteMeetingNote(note.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Cascade to:</label>
                  <EditableField
                    value={note.cascade}
                    onSave={(value) => updateMeetingNote(note.id, 'cascade', value)}
                    placeholder="Who to communicate this to"
                  />
                </div>
                <EditableField
                  value={note.content}
                  onSave={(value) => updateMeetingNote(note.id, 'content', value)}
                  placeholder="Meeting note"
                  multiline
                  className="bg-white p-3 rounded"
                />
              </div>
            ))}
          </div>

          {/* Add New Note */}
          <div className="bg-slate-50 rounded-2xl p-4 border">
            <h4 className="font-semibold mb-3">Add Meeting Note for {currentWeek === 'last' ? 'Last Week' : currentWeek === 'current' ? 'Current Week' : 'Next Week'}</h4>
            <div className="space-y-3">
              <input
                type="date"
                value={newNoteDate}
                onChange={(e) => setNewNoteDate(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Select date"
              />
              <input
                type="text"
                value={newNoteCascade}
                onChange={(e) => setNewNoteCascade(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Cascade to (who to communicate this to)"
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full px-3 py-2 border rounded h-24"
                placeholder="Meeting note content..."
              />
              <button
                onClick={addMeetingNote}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>

        <PreferencesModal
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
          organizationInfo={organizationInfo}
          onSave={setOrganizationInfo}
        />
    </main>
  );
}