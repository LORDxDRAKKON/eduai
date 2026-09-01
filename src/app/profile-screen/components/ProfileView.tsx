'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface HistoryItem {
  id: string;
  title: string;
  topic: string;
  type: string;
  grade: string;
  subject: string;
  savedAt: string;
}

interface ProfileData {
  name: string;
  email: string;
  grade: string;
  language: string;
  defaultSubject: string;
  notifications: boolean;
  darkMode: boolean;
}

interface ProfileViewProps {
  onBack: () => void;
  history: HistoryItem[];
}

const GRADES = [
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6',
  'Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12',
];

const SUBJECTS_MAP: Record<string, string[]> = {
  'Grade 1': ['English','Mathematics','Environmental Studies','Hindi'],
  'Grade 2': ['English','Mathematics','Environmental Studies','Hindi'],
  'Grade 3': ['English','Mathematics','Environmental Studies','Hindi','Science'],
  'Grade 4': ['English','Mathematics','Science','Social Studies','Hindi'],
  'Grade 5': ['English','Mathematics','Science','Social Studies','Hindi'],
  'Grade 6': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 7': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 8': ['English','Mathematics','Science','Social Studies','Hindi','Sanskrit'],
  'Grade 9': ['English','Mathematics','Physics','Chemistry','Biology','History','Geography','Economics','Hindi'],
  'Grade 10': ['English','Mathematics','Physics','Chemistry','Biology','History','Geography','Economics','Hindi'],
  'Grade 11': ['Physics','Chemistry','Mathematics','Biology','Computer Science','English'],
  'Grade 12': ['Physics','Chemistry','Mathematics','Biology','Computer Science','English'],
};

const LANGUAGES = [
  'English','Hindi','Spanish','French','German','Portuguese','Arabic',
  'Chinese (Simplified)','Japanese','Korean','Tamil','Telugu','Bengali','Marathi',
];

const CONTENT_TYPES = ['Explanation','Story','Worksheet','Sum / Problem','Video Lesson'];

export default function ProfileView({ onBack, history }: ProfileViewProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    grade: 'Grade 9',
    language: 'English',
    defaultSubject: 'Mathematics',
    notifications: true,
    darkMode: false,
  });
  const [xp, setXp] = useState(0);
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'defaults'>('account');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [defaultContentType, setDefaultContentType] = useState('Explanation');

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.log('Profile load error:', error.message);
      }

      if (data) {
        setProfile({
          name: data.full_name || user.user_metadata?.full_name || '',
          email: data.email || user.email || '',
          grade: data.grade || 'Grade 9',
          language: data.language || 'English',
          defaultSubject: data.default_subject || 'Mathematics',
          notifications: data.notifications ?? true,
          darkMode: data.dark_mode ?? false,
        });
        setDefaultContentType(data.default_content_type || 'Explanation');
      } else {
        // Fallback to auth user metadata
        setProfile(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        }));
      }
    } catch (err) {
      console.log('Profile fetch failed:', err);
    } finally {
      setLoadingProfile(false);
    }
    setXp(parseInt(localStorage.getItem('eduai-xp') || '0'));
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const subjects = SUBJECTS_MAP[profile.grade] || SUBJECTS_MAP['Grade 9'];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: profile.email || user.email || '',
          full_name: profile.name,
          grade: profile.grade,
          language: profile.language,
          default_subject: profile.defaultSubject,
          default_content_type: defaultContentType,
          notifications: profile.notifications,
          dark_mode: profile.darkMode,
        }, { onConflict: 'id' });

      if (error) {
        console.log('Profile save error:', error.message);
      }

      // Also sync to localStorage for other parts of the app
      localStorage.setItem('eduai-settings', JSON.stringify({
        name: profile.name,
        grade: profile.grade,
        language: profile.language,
        notifications: profile.notifications,
        darkMode: profile.darkMode,
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.log('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNameSave = async () => {
    setProfile(prev => ({ ...prev, name: editName || prev.name, email: editEmail }));
    setIsEditing(false);
  };

  const startEdit = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setIsEditing(true);
  };

  const lessonCount = history.length;
  const subjectSet = new Set(history.map(h => h.subject).filter(Boolean));
  const streakDays = Math.min(lessonCount, 7);

  if (loadingProfile) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">My Profile</h2>
            <p className="text-xs text-muted-foreground">Manage your account &amp; preferences</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">{user ? 'Synced' : 'Local'}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Avatar & Stats */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {(profile.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{profile.name || 'Student'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{profile.grade} · {profile.language}</p>
            {profile.email && <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <StatBadge value={lessonCount} label="Lessons" color="bg-primary/10 text-primary" />
              <StatBadge value={xp} label="XP Earned" color="bg-amber-100 text-amber-700" />
              <StatBadge value={subjectSet.size} label="Subjects" color="bg-emerald-100 text-emerald-700" />
              <StatBadge value={`${streakDays}d`} label="Streak" color="bg-orange-100 text-orange-700" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
          {(['account', 'preferences', 'defaults'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'account' ? '👤 Account' : tab === 'preferences' ? '🌐 Language' : '📚 Defaults'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <SectionCard title="Account Details" icon="👤">
              {isEditing ? (
                <div className="space-y-4">
                  <ProfileField
                    label="Display Name"
                    value={editName}
                    onChange={setEditName}
                    placeholder="Enter your name"
                  />
                  <ProfileField
                    label="Email Address"
                    value={editEmail}
                    onChange={setEditEmail}
                    placeholder="Enter your email"
                    type="email"
                  />
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleNameSave}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow label="Display Name" value={profile.name || 'Not set'} />
                  <InfoRow label="Email" value={profile.email || user?.email || 'Not set'} />
                  <InfoRow label="Account Type" value={user ? 'Supabase Account' : 'Guest'} />
                  <button
                    onClick={startEdit}
                    className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                    Edit Profile
                  </button>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Learning Activity" icon="📊">
              <div className="grid grid-cols-2 gap-3">
                {history.slice(0, 4).map(h => (
                  <div key={h.id} className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">{h.type?.slice(0, 3)}</span>
                    <span className="text-xs text-foreground truncate">{h.title || h.topic}</span>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-muted-foreground text-sm">
                    No lessons yet. Start learning to see your activity!
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <SectionCard title="Language Preferences" icon="🌐">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Interface &amp; Content Language
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setProfile(prev => ({ ...prev, language: lang }))}
                        className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                          profile.language === lang
                            ? 'border-primary bg-primary/10 text-primary' :'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary font-medium">
                  ✨ AI-generated content will be delivered in <strong>{profile.language}</strong>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Notification Preferences" icon="🔔">
              <div className="space-y-3">
                <ToggleRow
                  label="Daily Challenge Reminders"
                  description="Get notified about your daily challenges"
                  checked={profile.notifications}
                  onChange={v => setProfile(prev => ({ ...prev, notifications: v }))}
                />
                <ToggleRow
                  label="Learning Streak Alerts"
                  description="Stay on track with streak notifications"
                  checked={profile.notifications}
                  onChange={v => setProfile(prev => ({ ...prev, notifications: v }))}
                />
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'defaults' && (
          <div className="space-y-4">
            <SectionCard title="Grade Configuration" icon="🎓">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Default Grade Level
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {GRADES.map(grade => (
                    <button
                      key={grade}
                      onClick={() => {
                        const newSubjects = SUBJECTS_MAP[grade] || [];
                        setProfile(prev => ({
                          ...prev,
                          grade,
                          defaultSubject: newSubjects[0] || prev.defaultSubject,
                        }));
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                        profile.grade === grade
                          ? 'border-primary bg-primary/10 text-primary' :'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {grade.replace('Grade ', 'G')}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Selected: <span className="font-semibold text-foreground">{profile.grade}</span>
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Subject Defaults" icon="📖">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Default Subject for {profile.grade}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(subject => (
                      <button
                        key={subject}
                        onClick={() => setProfile(prev => ({ ...prev, defaultSubject: subject }))}
                        className={`py-2 px-4 rounded-full border text-sm font-medium transition-all ${
                          profile.defaultSubject === subject
                            ? 'border-primary bg-primary text-white' :'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Default Content Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setDefaultContentType(type)}
                        className={`py-2 px-4 rounded-full border text-sm font-medium transition-all ${
                          defaultContentType === type
                            ? 'border-primary bg-primary text-white' :'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-emerald-500 text-white' :'bg-primary text-white hover:bg-primary/90 disabled:opacity-70'
            }`}
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : saved ? (
              '✓ Preferences Saved!'
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadge({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${color}`}>
      <span className="font-bold text-lg leading-none">{value}</span>
      <span className="text-xs mt-0.5 opacity-80">{label}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm text-foreground font-semibold">{value}</span>
    </div>
  );
}

function ProfileField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
