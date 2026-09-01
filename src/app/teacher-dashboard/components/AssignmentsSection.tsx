'use client';

import React, { useState } from 'react';

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  contentType: string;
  description: string;
  assignedTo: string[];
  dueDate: string;
  dueTime: string;
  status: 'draft' | 'scheduled' | 'active' | 'closed';
  totalPoints: number;
  rubric: RubricCriterion[];
  submissionsCount: number;
  totalStudents: number;
  createdAt: string;
}

const STUDENT_GROUPS = ['Grade 8 - Section A', 'Grade 8 - Section B', 'Grade 7 - Section A', 'Advanced Math Group', 'All Students'];

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    title: 'Algebra Fundamentals Worksheet',
    subject: 'Mathematics',
    contentType: 'Worksheet',
    description: 'Practice problems covering linear equations, substitution, and elimination methods.',
    assignedTo: ['Grade 8 - Section A'],
    dueDate: '2026-09-05',
    dueTime: '23:59',
    status: 'active',
    totalPoints: 100,
    rubric: [
      { id: 'r1', name: 'Accuracy', description: 'Correct answers with proper working shown', maxPoints: 60 },
      { id: 'r2', name: 'Method', description: 'Appropriate method used for each problem', maxPoints: 25 },
      { id: 'r3', name: 'Presentation', description: 'Clear, organized, and legible work', maxPoints: 15 },
    ],
    submissionsCount: 3,
    totalStudents: 4,
    createdAt: '2 days ago',
  },
  {
    id: 'a2',
    title: 'Statistics Data Project',
    subject: 'Mathematics',
    contentType: 'Project',
    description: 'Collect real-world data, create visualizations, and write a statistical analysis report.',
    assignedTo: ['Grade 8 - Section A', 'Grade 8 - Section B'],
    dueDate: '2026-09-10',
    dueTime: '17:00',
    status: 'scheduled',
    totalPoints: 50,
    rubric: [
      { id: 'r4', name: 'Data Collection', description: 'Adequate sample size and valid data sources', maxPoints: 15 },
      { id: 'r5', name: 'Visualization', description: 'Appropriate chart types, labeled correctly', maxPoints: 20 },
      { id: 'r6', name: 'Analysis', description: 'Correct calculations and meaningful conclusions', maxPoints: 15 },
    ],
    submissionsCount: 1,
    totalStudents: 8,
    createdAt: '1 day ago',
  },
];

type View = 'list' | 'create' | 'detail';

export default function AssignmentsSection() {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [view, setView] = useState<View>('list');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const handleCreate = (newAssignment: Assignment) => {
    setAssignments(prev => [newAssignment, ...prev]);
    setView('list');
  };

  if (view === 'create') {
    return <CreateAssignmentForm onSave={handleCreate} onCancel={() => setView('list')} />;
  }

  if (view === 'detail' && selectedAssignment) {
    return <AssignmentDetail assignment={selectedAssignment} onBack={() => setView('list')} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-800 text-foreground mb-1">Assignments</h2>
          <p className="text-sm text-muted-foreground">Create, schedule, and manage assignments with grading rubrics</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-600 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <PlusIcon />
          New Assignment
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', value: assignments.filter(a => a.status === 'active').length, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
          { label: 'Scheduled', value: assignments.filter(a => a.status === 'scheduled').length, color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Drafts', value: assignments.filter(a => a.status === 'draft').length, color: 'bg-muted border-border text-muted-foreground' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-4 text-center ${stat.color}`}>
            <p className="text-2xl font-800">{stat.value}</p>
            <p className="text-xs font-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Assignment list */}
      <div className="space-y-3">
        {assignments.map(assignment => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onClick={() => { setSelectedAssignment(assignment); setView('detail'); }}
          />
        ))}
        {assignments.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardIcon />
            </div>
            <h3 className="text-base font-700 text-foreground mb-2">No assignments yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">Create your first assignment and assign it to your student groups.</p>
            <button onClick={() => setView('create')} className="px-4 py-2 bg-primary text-white text-sm font-600 rounded-xl hover:bg-primary/90 transition-colors">
              Create Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentCard({ assignment, onClick }: { assignment: Assignment; onClick: () => void }) {
  const progress = assignment.totalStudents > 0 ? Math.round((assignment.submissionsCount / assignment.totalStudents) * 100) : 0;
  const statusConfig = {
    active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700' },
    scheduled: { label: 'Scheduled', cls: 'bg-blue-100 text-blue-700' },
    draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground' },
    closed: { label: 'Closed', cls: 'bg-red-100 text-red-700' },
  };
  const sc = statusConfig[assignment.status];

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-2xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ClipboardIcon className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-700 text-foreground">{assignment.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-600 ${sc.cls}`}>{sc.label}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{assignment.subject} · {assignment.contentType} · {assignment.totalPoints} pts</p>
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarIcon /> Due {assignment.dueDate}</span>
            <span className="flex items-center gap-1"><UsersIcon /> {assignment.assignedTo.join(', ')}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-700 text-foreground">{assignment.submissionsCount}/{assignment.totalStudents}</p>
          <p className="text-xs text-muted-foreground mb-1">submitted</p>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </button>
  );
}

function CreateAssignmentForm({ onSave, onCancel }: { onSave: (a: Assignment) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [contentType, setContentType] = useState('Worksheet');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'active'>('active');
  const [rubric, setRubric] = useState<RubricCriterion[]>([
    { id: 'rc1', name: 'Accuracy', description: 'Correct answers with working shown', maxPoints: 60 },
    { id: 'rc2', name: 'Method', description: 'Appropriate method used', maxPoints: 25 },
    { id: 'rc3', name: 'Presentation', description: 'Clear and organized work', maxPoints: 15 },
  ]);
  const [activeTab, setActiveTab] = useState<'details' | 'rubric'>('details');

  const totalPoints = rubric.reduce((sum, r) => sum + r.maxPoints, 0);

  const addRubricRow = () => {
    setRubric(prev => [...prev, { id: `rc${Date.now()}`, name: '', description: '', maxPoints: 10 }]);
  };

  const updateRubric = (id: string, field: keyof RubricCriterion, value: string | number) => {
    setRubric(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRubric = (id: string) => {
    setRubric(prev => prev.filter(r => r.id !== id));
  };

  const toggleGroup = (group: string) => {
    setAssignedTo(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

  const handleSave = () => {
    if (!title.trim() || assignedTo.length === 0 || !dueDate) return;
    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      title,
      subject,
      contentType,
      description,
      assignedTo,
      dueDate,
      dueTime,
      status,
      totalPoints,
      rubric,
      submissionsCount: 0,
      totalStudents: assignedTo.length * 4,
      createdAt: 'Just now',
    };
    onSave(newAssignment);
  };

  const isValid = title.trim() && assignedTo.length > 0 && dueDate;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <BackIcon />
        </button>
        <div>
          <h2 className="text-xl font-800 text-foreground">Create Assignment</h2>
          <p className="text-sm text-muted-foreground">Set up a lesson, add a rubric, and assign to student groups</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {(['details', 'rubric'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-600 rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'rubric' ? `Rubric (${totalPoints} pts)` : 'Details'}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="space-y-4">
          {/* Title */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-700 text-foreground">Lesson Details</h3>
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1.5 block">Assignment Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Algebra Worksheet #4"
                className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-600 text-muted-foreground mb-1.5 block">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-600 text-muted-foreground mb-1.5 block">Content Type</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value)}
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {['Worksheet', 'Quiz', 'Project', 'Essay', 'Lesson', 'Problem Set', 'Lab Report'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what students need to do..."
                rows={3}
                className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-700 text-foreground">Schedule &amp; Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-600 text-muted-foreground mb-1.5 block">Due Date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-600 text-muted-foreground mb-1.5 block">Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-600 text-muted-foreground mb-1.5 block">Publish Status</label>
              <div className="flex gap-2">
                {(['draft', 'scheduled', 'active'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 text-xs font-600 rounded-xl border transition-all capitalize ${
                      status === s
                        ? s === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : s === 'scheduled'? 'bg-blue-100 text-blue-700 border-blue-200' :'bg-muted text-foreground border-border' :'bg-card text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assign to groups */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-700 text-foreground">Assign to Student Groups *</h3>
            <div className="flex flex-wrap gap-2">
              {STUDENT_GROUPS.map(group => (
                <button
                  key={group}
                  onClick={() => toggleGroup(group)}
                  className={`px-3 py-1.5 text-xs font-600 rounded-xl border transition-all ${
                    assignedTo.includes(group)
                      ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
            {assignedTo.length === 0 && (
              <p className="text-xs text-amber-600">Select at least one group to assign this assignment.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rubric' && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-700 text-foreground">Grading Rubric</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Total: {totalPoints} points</p>
            </div>
            <button
              onClick={addRubricRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
            >
              <PlusIcon /> Add Criterion
            </button>
          </div>

          <div className="space-y-3">
            {rubric.map((criterion, idx) => (
              <div key={criterion.id} className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-700 text-muted-foreground w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={e => updateRubric(criterion.id, 'name', e.target.value)}
                    placeholder="Criterion name"
                    className="flex-1 text-sm font-600 bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={1}
                      value={criterion.maxPoints}
                      onChange={e => updateRubric(criterion.id, 'maxPoints', parseInt(e.target.value) || 0)}
                      className="w-16 text-sm font-700 text-center bg-card border border-border rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                  <button
                    onClick={() => removeRubric(criterion.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <input
                  type="text"
                  value={criterion.description}
                  onChange={e => updateRubric(criterion.id, 'description', e.target.value)}
                  placeholder="Describe what earns full marks..."
                  className="w-full text-xs bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 ml-5"
                />
              </div>
            ))}
          </div>

          {rubric.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No criteria yet. Add rubric criteria to define how this assignment will be graded.
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 text-sm font-600 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="flex-1 py-3 text-sm font-700 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'draft' ? 'Save as Draft' : status === 'scheduled' ? 'Schedule Assignment' : 'Publish Assignment'}
        </button>
      </div>
    </div>
  );
}

function AssignmentDetail({ assignment, onBack }: { assignment: Assignment; onBack: () => void }) {
  const progress = assignment.totalStudents > 0 ? Math.round((assignment.submissionsCount / assignment.totalStudents) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <BackIcon />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-800 text-foreground">{assignment.title}</h2>
          <p className="text-sm text-muted-foreground">{assignment.subject} · {assignment.contentType}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-600 capitalize ${
          assignment.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
          assignment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
          assignment.status === 'closed'? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
        }`}>{assignment.status}</span>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xl font-800 text-foreground">{assignment.submissionsCount}/{assignment.totalStudents}</p>
          <p className="text-xs text-muted-foreground">Submissions</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xl font-800 text-foreground">{assignment.totalPoints}</p>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xl font-800 text-foreground">{progress}%</p>
          <p className="text-xs text-muted-foreground">Completion</p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-700 text-foreground">Assignment Details</h3>
        {assignment.description && <p className="text-sm text-muted-foreground">{assignment.description}</p>}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Due Date</p>
            <p className="font-600 text-foreground">{assignment.dueDate} at {assignment.dueTime}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Assigned To</p>
            <p className="font-600 text-foreground">{assignment.assignedTo.join(', ')}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Submission progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Rubric */}
      {assignment.rubric.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-700 text-foreground">Grading Rubric</h3>
            <span className="text-xs text-muted-foreground">{assignment.totalPoints} total points</span>
          </div>
          <div className="space-y-2">
            {assignment.rubric.map((criterion, idx) => (
              <div key={criterion.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-700 text-foreground">{criterion.name}</p>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                </div>
                <span className="text-sm font-700 text-primary shrink-0">{criterion.maxPoints} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function PlusIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>; }
function BackIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>; }
function ClipboardIcon({ className = '' }: { className?: string }) { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>; }
function CalendarIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>; }
function UsersIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function TrashIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>; }
