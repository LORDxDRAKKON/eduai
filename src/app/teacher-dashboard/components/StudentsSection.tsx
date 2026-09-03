'use client';

import React, { useState } from 'react';

interface Submission {
  id: string;
  studentName: string;
  studentInitial: string;
  assignmentTitle: string;
  subject: string;
  submittedAt: string;
  status: 'pending' | 'graded' | 'late';
  score: number | null;
  maxScore: number;
  feedback: string;
  content: string;
}

interface Student {
  id: string;
  name: string;
  initial: string;
  grade: string;
  email: string;
  completionRate: number;
  avgScore: number;
  timeSpent: number;
  streak: number;
  topicsCompleted: number;
  topicsTotal: number;
  trend: 'up' | 'down' | 'stable';
  topicMastery: { topic: string; mastery: number; color: string }[];
  performanceTrend: number[];
  submissions: Submission[];
}

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Arjun Sharma',
    initial: 'A',
    grade: 'Grade 8',
    email: 'arjun@school.edu',
    completionRate: 82,
    avgScore: 76,
    timeSpent: 14.5,
    streak: 7,
    topicsCompleted: 18,
    topicsTotal: 22,
    trend: 'up',
    topicMastery: [
      { topic: 'Algebra', mastery: 88, color: 'bg-blue-500' },
      { topic: 'Geometry', mastery: 72, color: 'bg-emerald-500' },
      { topic: 'Fractions', mastery: 65, color: 'bg-orange-500' },
      { topic: 'Statistics', mastery: 90, color: 'bg-purple-500' },
    ],
    performanceTrend: [60, 65, 70, 68, 74, 76, 80],
    submissions: [
      { id: 's1', studentName: 'Arjun Sharma', studentInitial: 'A', assignmentTitle: 'Algebra Worksheet #3', subject: 'Mathematics', submittedAt: '2 hours ago', status: 'pending', score: null, maxScore: 100, feedback: '', content: 'Solved all 10 problems. Used substitution method for equations 4-7. Question 9 might have an error in my working.' },
      { id: 's2', studentName: 'Arjun Sharma', studentInitial: 'A', assignmentTitle: 'Geometry Quiz', subject: 'Mathematics', submittedAt: '2 days ago', status: 'graded', score: 78, maxScore: 100, feedback: 'Good work on triangles! Review circle theorems.', content: 'Completed all sections. Struggled with the arc length problems.' },
    ],
  },
  {
    id: '2',
    name: 'Priya Patel',
    initial: 'P',
    grade: 'Grade 11 - Science',
    email: 'priya@school.edu',
    completionRate: 95,
    avgScore: 91,
    timeSpent: 22.3,
    streak: 14,
    topicsCompleted: 21,
    topicsTotal: 22,
    trend: 'up',
    topicMastery: [
      { topic: 'Physics', mastery: 95, color: 'bg-blue-500' },
      { topic: 'Chemistry', mastery: 88, color: 'bg-emerald-500' },
      { topic: 'Mathematics', mastery: 92, color: 'bg-orange-500' },
      { topic: 'Biology', mastery: 87, color: 'bg-purple-500' },
    ],
    performanceTrend: [80, 84, 86, 88, 90, 91, 93],
    submissions: [
      { id: 's3', studentName: 'Priya Patel', studentInitial: 'P', assignmentTitle: 'Statistics Project', subject: 'Mathematics', submittedAt: '1 day ago', status: 'pending', score: null, maxScore: 50, feedback: '', content: 'Collected data from 30 students, created bar charts and pie charts. Calculated mean, median, mode. Included analysis section with conclusions.' },
    ],
  },
  {
    id: '3',
    name: 'Rahul Verma',
    initial: 'R',
    grade: 'Grade 5',
    email: 'rahul@school.edu',
    completionRate: 58,
    avgScore: 62,
    timeSpent: 8.1,
    streak: 2,
    topicsCompleted: 13,
    topicsTotal: 22,
    trend: 'down',
    topicMastery: [
      { topic: 'Mathematics', mastery: 55, color: 'bg-blue-500' },
      { topic: 'Science', mastery: 70, color: 'bg-emerald-500' },
      { topic: 'English', mastery: 48, color: 'bg-orange-500' },
      { topic: 'Hindi', mastery: 60, color: 'bg-purple-500' },
    ],
    performanceTrend: [70, 68, 65, 63, 60, 62, 58],
    submissions: [
      { id: 's4', studentName: 'Rahul Verma', studentInitial: 'R', assignmentTitle: 'Fractions Practice', subject: 'Mathematics', submittedAt: '3 days ago', status: 'late', score: null, maxScore: 40, feedback: '', content: 'Completed 6 out of 10 problems. Had difficulty with mixed fractions.' },
    ],
  },
  {
    id: '4',
    name: 'Sneha Iyer',
    initial: 'S',
    grade: 'Grade 12 - Commerce',
    email: 'sneha@school.edu',
    completionRate: 74,
    avgScore: 83,
    timeSpent: 17.8,
    streak: 5,
    topicsCompleted: 16,
    topicsTotal: 22,
    trend: 'stable',
    topicMastery: [
      { topic: 'Accountancy', mastery: 80, color: 'bg-blue-500' },
      { topic: 'Business Studies', mastery: 85, color: 'bg-emerald-500' },
      { topic: 'Economics', mastery: 78, color: 'bg-orange-500' },
      { topic: 'Mathematics', mastery: 82, color: 'bg-purple-500' },
    ],
    performanceTrend: [78, 80, 82, 81, 83, 82, 84],
    submissions: [],
  },
];

type SubView = 'list' | 'journey' | 'grading';

export default function StudentsSection() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [subView, setSubView] = useState<SubView>('list');
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const allSubmissions = students.flatMap(s => s.submissions);
  const pendingSubmissions = allSubmissions.filter(s => s.status === 'pending' || s.status === 'late');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openGrading = (submission: Submission) => {
    setGradingSubmission(submission);
    setScoreInput(submission.score !== null ? String(submission.score) : '');
    setFeedbackInput(submission.feedback);
    setSubView('grading');
  };

  const saveGrade = () => {
    if (!gradingSubmission) return;
    const score = parseInt(scoreInput);
    if (isNaN(score)) return;
    setStudents(prev => prev.map(student => ({
      ...student,
      submissions: student.submissions.map(sub =>
        sub.id === gradingSubmission.id
          ? { ...sub, score, feedback: feedbackInput, status: 'graded' as const }
          : sub
      ),
    })));
    setSubView('list');
    setGradingSubmission(null);
  };

  const openJourney = (student: Student) => {
    setSelectedStudent(student);
    setSubView('journey');
  };

  if (subView === 'grading' && gradingSubmission) {
    return <GradingView submission={gradingSubmission} scoreInput={scoreInput} feedbackInput={feedbackInput} onScoreChange={setScoreInput} onFeedbackChange={setFeedbackInput} onSave={saveGrade} onBack={() => setSubView('list')} />;
  }

  if (subView === 'journey' && selectedStudent) {
    return <LearningJourneyView student={selectedStudent} onBack={() => setSubView('list')} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-800 text-foreground mb-1">My Students</h2>
          <p className="text-sm text-muted-foreground">Manage students, grade submissions, and track learning journeys</p>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
          />
        </div>
      </div>

      {/* Pending Submissions Banner */}
      {pendingSubmissions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <InboxIcon className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-700 text-amber-900">{pendingSubmissions.length} submission{pendingSubmissions.length > 1 ? 's' : ''} awaiting review</p>
              <p className="text-xs text-amber-700">Students are waiting for feedback</p>
            </div>
          </div>
          <button
            onClick={() => openGrading(pendingSubmissions[0])}
            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-600 rounded-lg hover:bg-amber-600 transition-colors shrink-0"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Submissions Queue */}
      {allSubmissions.length > 0 && (
        <div>
          <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">Recent Submissions</h3>
          <div className="space-y-2">
            {allSubmissions.slice(0, 5).map(sub => (
              <div key={sub.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-700 text-sm shrink-0">
                  {sub.studentInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-600 text-foreground">{sub.studentName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-600 ${
                      sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' :
                      sub.status === 'late'? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {sub.status === 'graded' ? `Graded ${sub.score}/${sub.maxScore}` : sub.status === 'late' ? 'Late' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub.assignmentTitle} · {sub.submittedAt}</p>
                </div>
                <button
                  onClick={() => openGrading(sub)}
                  className={`px-3 py-1.5 text-xs font-600 rounded-lg transition-colors shrink-0 ${
                    sub.status === 'graded' ?'bg-muted text-muted-foreground hover:bg-muted/80' :'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {sub.status === 'graded' ? 'Edit Grade' : 'Grade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Roster */}
      <div>
        <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">Student Roster ({filteredStudents.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map(student => (
            <StudentCard key={student.id} student={student} onViewJourney={() => openJourney(student)} onGradeSubmission={sub => openGrading(sub)} />
          ))}
        </div>
        {filteredStudents.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No students match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentCard({ student, onViewJourney, onGradeSubmission }: { student: Student; onViewJourney: () => void; onGradeSubmission: (s: Submission) => void }) {
  const pendingCount = student.submissions.filter(s => s.status === 'pending' || s.status === 'late').length;
  const trendColor = student.trend === 'up' ? 'text-emerald-600' : student.trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
  const trendIcon = student.trend === 'up' ? '↑' : student.trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-700 shrink-0">
          {student.initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-700 text-foreground">{student.name}</p>
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-600">{pendingCount} pending</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{student.grade} · {student.email}</p>
        </div>
        <span className={`text-sm font-700 ${trendColor}`}>{trendIcon}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <p className="text-base font-800 text-foreground">{student.completionRate}%</p>
          <p className="text-xs text-muted-foreground">Completion</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <p className="text-base font-800 text-foreground">{student.avgScore}</p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <p className="text-base font-800 text-foreground">{student.streak}d</p>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Topics: {student.topicsCompleted}/{student.topicsTotal}</span>
          <span>{student.timeSpent}h spent</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(student.topicsCompleted / student.topicsTotal) * 100}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onViewJourney}
          className="flex-1 py-2 text-xs font-600 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
        >
          Learning Journey
        </button>
        {pendingCount > 0 && (
          <button
            onClick={() => onGradeSubmission(student.submissions.find(s => s.status === 'pending' || s.status === 'late')!)}
            className="flex-1 py-2 text-xs font-600 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors"
          >
            Grade ({pendingCount})
          </button>
        )}
      </div>
    </div>
  );
}

function GradingView({ submission, scoreInput, feedbackInput, onScoreChange, onFeedbackChange, onSave, onBack }: {
  submission: Submission;
  scoreInput: string;
  feedbackInput: string;
  onScoreChange: (v: string) => void;
  onFeedbackChange: (v: string) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  const score = parseInt(scoreInput);
  const percentage = !isNaN(score) ? Math.round((score / submission.maxScore) * 100) : null;
  const grade = percentage !== null ? (percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F') : null;

  const quickFeedback = [
    'Great work! Keep it up.',
    'Good effort. Review the highlighted areas.',
    'Needs improvement. Please revisit the topic.',
    'Excellent understanding of the concept!',
    'Please redo and resubmit.',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <BackIcon />
        </button>
        <div>
          <h2 className="text-xl font-800 text-foreground">Grade Submission</h2>
          <p className="text-sm text-muted-foreground">{submission.studentName} · {submission.assignmentTitle}</p>
        </div>
        <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-600 ${
          submission.status === 'late' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {submission.status === 'late' ? 'Late Submission' : 'Pending Review'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Submission Content */}
        <div className="md:col-span-3 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-700 text-xs">
              {submission.studentInitial}
            </div>
            <div>
              <p className="text-xs font-600 text-foreground">{submission.studentName}</p>
              <p className="text-xs text-muted-foreground">Submitted {submission.submittedAt}</p>
            </div>
          </div>
          <h4 className="text-sm font-700 text-foreground mb-2">{submission.assignmentTitle}</h4>
          <div className="bg-muted/40 rounded-xl p-4 text-sm text-foreground leading-relaxed min-h-[120px]">
            {submission.content}
          </div>
        </div>

        {/* Grading Panel */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">Score Entry</p>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                min={0}
                max={submission.maxScore}
                value={scoreInput}
                onChange={e => onScoreChange(e.target.value)}
                placeholder="0"
                className="w-20 text-2xl font-800 text-foreground text-center bg-muted/40 border border-border rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-lg text-muted-foreground font-600">/ {submission.maxScore}</span>
              {grade && (
                <span className={`ml-auto text-2xl font-800 ${
                  grade === 'A' ? 'text-emerald-600' : grade === 'B' ? 'text-blue-600' : grade === 'C' ? 'text-amber-600' : 'text-red-500'
                }`}>{grade}</span>
              )}
            </div>
            {percentage !== null && (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">Feedback Comments</p>
            <textarea
              value={feedbackInput}
              onChange={e => onFeedbackChange(e.target.value)}
              placeholder="Write your feedback here..."
              rows={4}
              className="w-full text-sm bg-muted/40 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickFeedback.map((fb, i) => (
                <button
                  key={i}
                  onClick={() => onFeedbackChange(fb)}
                  className="text-xs px-2 py-1 bg-muted rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {fb.length > 22 ? fb.slice(0, 22) + '…' : fb}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onSave}
            disabled={!scoreInput || isNaN(parseInt(scoreInput))}
            className="w-full py-3 bg-primary text-white text-sm font-700 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Grade &amp; Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

function LearningJourneyView({ student, onBack }: { student: Student; onBack: () => void }) {
  const maxTrend = Math.max(...student.performanceTrend);
  const minTrend = Math.min(...student.performanceTrend);
  const range = maxTrend - minTrend || 1;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <BackIcon />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-700">
            {student.initial}
          </div>
          <div>
            <h2 className="text-xl font-800 text-foreground">{student.name}</h2>
            <p className="text-sm text-muted-foreground">{student.grade} · Learning Journey</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Completion Rate', value: `${student.completionRate}%`, icon: '📊', color: 'bg-blue-50 border-blue-100' },
          { label: 'Avg Score', value: `${student.avgScore}/100`, icon: '🏆', color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Time Spent', value: `${student.timeSpent}h`, icon: '⏱️', color: 'bg-orange-50 border-orange-100' },
          { label: 'Day Streak', value: `${student.streak} days`, icon: '🔥', color: 'bg-red-50 border-red-100' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
            <p className="text-xl mb-1">{stat.icon}</p>
            <p className="text-xl font-800 text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Performance Trend Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-700 text-foreground mb-4">Performance Trend (7 Days)</h3>
          <div className="flex items-end gap-2 h-32">
            {student.performanceTrend.map((score, i) => {
              const height = ((score - minTrend) / range) * 80 + 20;
              const isLast = i === student.performanceTrend.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground font-600">{score}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${isLast ? 'bg-primary' : 'bg-primary/30'}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{days[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${
              student.trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
              student.trend === 'down'? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
            }`}>
              {student.trend === 'up' ? '↑ Improving' : student.trend === 'down' ? '↓ Declining' : '→ Stable'}
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-700 text-foreground mb-4">Topic Mastery</h3>
          <div className="space-y-3">
            {student.topicMastery.map(topic => (
              <div key={topic.topic}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-600 text-foreground">{topic.topic}</span>
                  <span className="text-muted-foreground font-600">{topic.mastery}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${topic.color}`}
                    style={{ width: `${topic.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topics Progress */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-700 text-foreground">Topics Progress</h3>
          <span className="text-xs text-muted-foreground">{student.topicsCompleted} of {student.topicsTotal} completed</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
            style={{ width: `${(student.topicsCompleted / student.topicsTotal) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round((student.topicsCompleted / student.topicsTotal) * 100)}% complete</span>
          <span>{student.topicsTotal - student.topicsCompleted} remaining</span>
        </div>
      </div>

      {/* Submission History */}
      {student.submissions.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-700 text-foreground mb-4">Submission History</h3>
          <div className="space-y-3">
            {student.submissions.map(sub => (
              <div key={sub.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <div className={`w-2 h-2 rounded-full shrink-0 ${sub.status === 'graded' ? 'bg-emerald-500' : sub.status === 'late' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-foreground truncate">{sub.assignmentTitle}</p>
                  <p className="text-xs text-muted-foreground">{sub.submittedAt}</p>
                </div>
                <div className="text-right shrink-0">
                  {sub.status === 'graded' ? (
                    <p className="text-sm font-700 text-foreground">{sub.score}/{sub.maxScore}</p>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-600 ${sub.status === 'late' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {sub.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className = '' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
}
function InboxIcon({ className = '' }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
}
function BackIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}
