'use client';

import { useState } from 'react';
import { objectivesData, Objective } from '@/data/objectives';

interface Task {
  id: number;
  title: string;
  status: 'planning' | 'in-progress' | 'waiting' | 'completed';
  assignedTo?: string;
}

interface MeetingNote {
  id: number;
  week: 'last' | 'current' | 'next';
  date: string; // Manual date entry
  content: string;
  cascade: string; // who to communicate this to
}

export default function Home() {
  const [objectives, setObjectives] = useState<Objective[]>(objectivesData);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [currentWeek, setCurrentWeek] = useState<'last' | 'current' | 'next'>('current');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteDate, setNewNoteDate] = useState('');
  const [newNoteCascade, setNewNoteCascade] = useState('');

  const updateObjectiveStatus = (id: number, newStatus: string) => {
    setObjectives(objectives.map(obj =>
      obj.id === id ? { ...obj, status: newStatus as any } : obj
    ));
  };

  const addTask = (objectiveId: number, taskTitle: string, assignedTo: string) => {
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

  const getNotesForWeek = (week: 'last' | 'current' | 'next') => {
    return meetingNotes.filter(note => note.week === week);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-slate-800">
            Leadership Objectives Dashboard
          </h1>
          <p className="text-slate-600 mt-3 text-lg">
            Strategic planning and accountability platform
          </p>
        </div>

        {/* Mission Values Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3">Why Do We Exist?</h2>
            <p className="text-slate-600">
              To help people encounter Jesus and grow in faith.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3">How Do We Behave?</h2>
            <p className="text-slate-600">
              Childlike Hearts • Loyal Servants • Hungry for More
            </p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3">What Do We Do?</h2>
            <p className="text-slate-600">
              We disciple people, build community, and equip leaders.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="font-bold text-lg mb-3">How Will We Succeed?</h2>
            <p className="text-slate-600">
              Through intentional leadership and accountability.
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
                <div>
                  <h3 className="text-2xl font-semibold text-slate-800">
                    {objective.title}
                  </h3>
                  <p className="text-slate-600 mt-2">
                    {objective.description}
                  </p>
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
                {['planning', 'in-progress', 'waiting', 'completed'].map((status) => (
                  <div key={status} className="bg-slate-100 rounded-2xl p-4 min-h-[200px]">
                    <h4 className="font-semibold mb-4 capitalize">{status.replace('-', ' ')}</h4>
                    <div className="space-y-2">
                      {tasks.filter(task => task.status === status).map(task => (
                        <div key={task.id} className="bg-white rounded-xl p-3 shadow-sm text-sm">
                          <p>{task.title}</p>
                          <p className="text-slate-500">Assigned: {task.assignedTo}</p>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                            className="mt-2 text-xs border rounded px-2 py-1"
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
                    placeholder="Task title"
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Assign to"
                    className="px-3 py-2 border rounded"
                  />
                  <button
                    onClick={() => addTask(objective.id, 'New Task', 'Assignee')}
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
              <div key={note.id} className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-blue-900">{note.date}</span>
                  <span className="text-sm text-slate-600">Cascade to: {note.cascade}</span>
                </div>
                <p className="text-slate-700">{note.content}</p>
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
    </main>
  );
}