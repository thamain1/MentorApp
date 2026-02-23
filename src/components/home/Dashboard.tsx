import { useState, useEffect, useRef } from 'react';
import {
  Calendar, MessageCircle, Target, TrendingUp,
  ChevronRight, Sparkles, Clock, Users, Shield, Edit3, Check,
  Camera, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, UserPlus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../layout';
import { Card, Avatar, Badge, Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const AFFIRMATION_STORAGE_KEY = 'isi-daily-affirmation';

// Default affirmation sub-messages by role (shown below the permanent "I AM")
const defaultAffirmations: Record<string, string> = {
  mentee: "A KING!",
  mentor: "BUILDING\nKINGS!",
  admin: "LEADING\nWITH\nPURPOSE!",
};

// Mentee profile images
const menteeImages = [
  '/images/mentees/gettyimages-1158014305-612x612.jpg',
  '/images/mentees/gettyimages-1178688517-612x612.jpg',
  '/images/mentees/gettyimages-1363289825-612x612.jpg',
  '/images/mentees/gettyimages-1430123251-612x612.jpg',
  '/images/mentees/gettyimages-2035617814-612x612.jpg',
  '/images/mentees/gettyimages-972902010-612x612.jpg',
];

// Mentor profile images for bubbles
const mentorImages = [
  '/images/mentors/gettyimages-1146909737-612x612.jpg',
  '/images/mentors/gettyimages-1455343282-612x612.jpg',
  '/images/mentors/gettyimages-1463782257-612x612.jpg',
  '/images/mentors/gettyimages-1916997109-612x612.jpg',
  '/images/mentors/gettyimages-2203419531-612x612.jpg',
  '/images/mentors/gettyimages-2206642276-612x612.jpg',
];

// Mock connections for the floating bubbles (using mentor images)
const getConnectionsForRole = (role: string) => {
  if (role === 'mentee') {
    return [
      { id: '1', name: 'David Williams', image: mentorImages[0] },
      { id: '2', name: 'James Thompson', image: mentorImages[1] },
      { id: '3', name: 'Michael Chen', image: mentorImages[2] },
    ];
  } else if (role === 'mentor') {
    return [
      { id: '1', name: 'Marcus Johnson', image: mentorImages[3] },
      { id: '2', name: 'Tyler Brown', image: mentorImages[4] },
      { id: '3', name: 'Jordan Davis', image: mentorImages[5] },
    ];
  } else {
    return [
      { id: '1', name: 'David Williams', image: mentorImages[0] },
      { id: '2', name: 'Marcus Johnson', image: mentorImages[1] },
      { id: '3', name: 'James Thompson', image: mentorImages[2] },
    ];
  }
};

// Get default profile image based on role
const getDefaultProfileImage = (role: string) => {
  if (role === 'mentee') {
    return menteeImages[0];
  } else if (role === 'mentor') {
    return mentorImages[0];
  } else {
    return mentorImages[1];
  }
};

// Image position type
interface ImagePosition {
  x: number; // -100 to 100 (percentage offset)
  y: number; // -100 to 100 (percentage offset)
}

// Profile image settings type
interface ProfileImageSettings {
  image: string;
  position: ImagePosition;
}

// Get all available images for selection
const getAllAvailableImages = () => [...menteeImages, ...mentorImages];

// Daily prompts
const dailyPrompts = [
  "What's one thing you're grateful for today?",
  "What's a challenge you're facing that you'd like prayer or support for?",
  "Share a win from this week, no matter how small!",
  "What's one goal you're working toward right now?",
  "Who is someone that has positively impacted your life? Why?",
  "What's a skill you'd like to develop this year?",
  "What does being a man of integrity mean to you?",
  "Share something new you learned recently.",
  "What's one way you can serve someone else today?",
  "What advice would you give to your younger self?",
];

const getDailyPrompt = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dailyPrompts[dayOfYear % dailyPrompts.length];
};

const dailyPrompt = getDailyPrompt();

// Types for Supabase data
interface MenteeProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  match_id: string;
}

interface UpcomingSession {
  id: string;
  scheduled_at: string;
  match_id: string;
}

interface AdminStats {
  totalMentors: number;
  totalMentees: number;
  activeMatches: number;
  pendingMatches: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [checkedIn, setCheckedIn] = useState(false);
  const { profile, user, refreshProfile } = useAuth();
  const role = profile?.role ?? 'mentee';
  const firstName = profile?.first_name ?? 'Friend';
  const lastName = profile?.last_name ?? '';
  const connections = getConnectionsForRole(role);
  const fullName = `${firstName} ${lastName}`.trim();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Supabase data state
  const [menteesForMentor, setMenteesForMentor] = useState<MenteeProfile[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [upcomingSession, setUpcomingSession] = useState<UpcomingSession | null>(null);
  const [activeGoalsCount, setActiveGoalsCount] = useState<number>(0);
  const [completedGoalsCount, setCompletedGoalsCount] = useState<number>(0);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalMentors: 0,
    totalMentees: 0,
    activeMatches: 0,
    pendingMatches: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const fetchDashboardData = async () => {
      setDataLoading(true);
      try {
        if (role === 'admin') {
          // Fetch admin stats
          const [mentorsRes, menteesRes, activeMatchesRes, pendingMatchesRes] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentor'),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentee'),
            supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          ]);

          setAdminStats({
            totalMentors: mentorsRes.count ?? 0,
            totalMentees: menteesRes.count ?? 0,
            activeMatches: activeMatchesRes.count ?? 0,
            pendingMatches: pendingMatchesRes.count ?? 0,
          });
        } else if (role === 'mentor') {
          // Fetch active matches where this user is the mentor
          const { data: matchesData } = await supabase
            .from('matches')
            .select('id, mentee_id')
            .eq('mentor_id', profile.id)
            .eq('status', 'active');

          if (matchesData && matchesData.length > 0) {
            setActiveMatchId(matchesData[0].id);

            // Fetch mentee profiles for all active matches
            const menteeProfileIds = matchesData.map((m) => m.mentee_id);
            const { data: menteeProfilesData } = await supabase
              .from('profiles')
              .select('id, user_id, first_name, last_name, avatar_url')
              .in('id', menteeProfileIds);

            // Map match_id onto each mentee profile
            const menteesWithMatchId: MenteeProfile[] = (menteeProfilesData ?? []).map((p) => {
              const match = matchesData.find((m) => m.mentee_id === p.id);
              return { ...p, match_id: match?.id ?? '' };
            });
            setMenteesForMentor(menteesWithMatchId);

            // Fetch upcoming session from mentor's matches
            const matchIds = matchesData.map((m) => m.id);
            const { data: sessionsData } = await supabase
              .from('sessions')
              .select('id, scheduled_at, match_id')
              .in('match_id', matchIds)
              .eq('status', 'scheduled')
              .gte('scheduled_at', new Date().toISOString())
              .order('scheduled_at')
              .limit(1);

            if (sessionsData && sessionsData.length > 0) {
              setUpcomingSession(sessionsData[0] as UpcomingSession);
            }
          }

          // Goals
          const [activeGoals, completedGoals] = await Promise.all([
            supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
            supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
          ]);
          setActiveGoalsCount(activeGoals.count ?? 0);
          setCompletedGoalsCount(completedGoals.count ?? 0);
        } else {
          // Mentee: fetch active match where this user is the mentee
          const { data: matchesData } = await supabase
            .from('matches')
            .select('id, mentor_id')
            .eq('mentee_id', profile.id)
            .eq('status', 'active')
            .limit(1);

          if (matchesData && matchesData.length > 0) {
            setActiveMatchId(matchesData[0].id);

            // Fetch upcoming session
            const { data: sessionsData } = await supabase
              .from('sessions')
              .select('id, scheduled_at, match_id')
              .eq('match_id', matchesData[0].id)
              .eq('status', 'scheduled')
              .gte('scheduled_at', new Date().toISOString())
              .order('scheduled_at')
              .limit(1);

            if (sessionsData && sessionsData.length > 0) {
              setUpcomingSession(sessionsData[0] as UpcomingSession);
            }
          }

          // Goals
          const [activeGoals, completedGoals] = await Promise.all([
            supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
            supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
          ]);
          setActiveGoalsCount(activeGoals.count ?? 0);
          setCompletedGoalsCount(completedGoals.count ?? 0);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile, role]);

  const currentSettings: ProfileImageSettings = {
    image: profile?.avatar_url ?? getDefaultProfileImage(role),
    position: {
      x: (profile as any)?.avatar_position_x ?? 0,
      y: (profile as any)?.avatar_position_y ?? 0,
    },
  };

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [tempImageSettings, setTempImageSettings] = useState<ProfileImageSettings>(currentSettings);

  useEffect(() => {
    setTempImageSettings({
      image: profile?.avatar_url ?? getDefaultProfileImage(role),
      position: {
        x: (profile as any)?.avatar_position_x ?? 0,
        y: (profile as any)?.avatar_position_y ?? 0,
      },
    });
  }, [profile, role]);

  const displayImage = currentSettings.image;
  const displayPosition = getObjectPosition(currentSettings.position);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      await refreshProfile();
    } finally {
      setUploading(false);
    }
  };

  const handleSaveImageSettings = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_url: tempImageSettings.image,
        avatar_position_x: tempImageSettings.position.x,
        avatar_position_y: tempImageSettings.position.y,
      } as any)
      .eq('user_id', user.id);
    if (!error) {
      await refreshProfile();
    }
    setIsEditingImage(false);
  };

  const handleCancelImageEdit = () => {
    setTempImageSettings(currentSettings);
    setIsEditingImage(false);
  };

  const adjustPosition = (axis: 'x' | 'y', delta: number) => {
    setTempImageSettings(prev => ({
      ...prev,
      position: {
        ...prev.position,
        [axis]: Math.max(-50, Math.min(50, prev.position[axis] + delta)),
      },
    }));
  };

  const resetPosition = () => {
    setTempImageSettings(prev => ({ ...prev, position: { x: 0, y: 0 } }));
  };

  const selectImage = (image: string) => {
    setTempImageSettings(prev => ({ ...prev, image, position: { x: 0, y: 0 } }));
  };

  function getObjectPosition(pos: ImagePosition) {
    return `${50 + pos.x}% ${50 + pos.y}%`;
  }

  // Affirmation state
  const [affirmation, setAffirmation] = useState(() => {
    const stored = localStorage.getItem(AFFIRMATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed[role] || defaultAffirmations[role];
      } catch {
        return defaultAffirmations[role];
      }
    }
    return defaultAffirmations[role];
  });
  const [isEditingAffirmation, setIsEditingAffirmation] = useState(false);
  const [editText, setEditText] = useState(affirmation);

  // Update affirmation when role changes
  useEffect(() => {
    const stored = localStorage.getItem(AFFIRMATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAffirmation(parsed[role] || defaultAffirmations[role]);
        setEditText(parsed[role] || defaultAffirmations[role]);
      } catch {
        setAffirmation(defaultAffirmations[role]);
        setEditText(defaultAffirmations[role]);
      }
    } else {
      setAffirmation(defaultAffirmations[role]);
      setEditText(defaultAffirmations[role]);
    }
  }, [role]);

  const handleSaveAffirmation = () => {
    const stored = localStorage.getItem(AFFIRMATION_STORAGE_KEY);
    let data: Record<string, string> = {};
    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch {
        data = {};
      }
    }
    data[role] = editText;
    localStorage.setItem(AFFIRMATION_STORAGE_KEY, JSON.stringify(data));
    setAffirmation(editText);
    setIsEditingAffirmation(false);
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    navigate('/community', { state: { checkInPrompt: dailyPrompt } });
  };

  // Format scheduled_at for display
  const formatSessionTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-iron-50">
      {/* Hero Section with Profile Image and Affirmation */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#562F65', minHeight: 'clamp(22rem, 70vw, 36rem)' }}>
        {/* Header overlay - topmost */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <Header
            showNotifications
            className="bg-transparent border-none text-white"
          />
        </div>

        {/* Layer 1: "I AM" - pure background, centered vertically in hero */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ paddingBottom: '1.5rem' }}>
          <h1
            className="leading-none w-full text-center select-none"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(7rem, 35vw, 18rem)',
              color: 'transparent',
              WebkitTextStroke: '3px #35d6f5',
              textShadow: 'none',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              opacity: 0.9,
            }}
          >
            I AM
          </h1>
        </div>

        {/* Layer 2: Sub-message overlay - bottom left, above "I AM" */}
        <div className="absolute bottom-10 left-4 z-20" style={{ maxWidth: '52%' }}>
          <div className="space-y-0 leading-snug">
            {affirmation.split('\n').map((line: string, index: number) => {
              const len = line.length;
              const fontSize = len <= 10
                ? 'clamp(1.4rem, 5.5vw, 2rem)'
                : len <= 20
                ? 'clamp(1.1rem, 4.5vw, 1.6rem)'
                : len <= 35
                ? 'clamp(0.9rem, 3.8vw, 1.3rem)'
                : 'clamp(0.75rem, 3vw, 1rem)';
              return (
                <h2
                  key={index}
                  className="font-bold text-white leading-[1.1] tracking-wide uppercase"
                  style={{
                    fontSize,
                    textShadow: '1px 1px 6px rgba(0,0,0,0.7)',
                  }}
                >
                  {line}
                </h2>
              );
            })}
          </div>
          <button
            onClick={() => {
              setEditText(affirmation);
              setIsEditingAffirmation(true);
            }}
            className="mt-2 flex items-center gap-1 text-iron-400 hover:text-blue-400 text-xs transition-colors relative z-[60]"
          >
            <Edit3 className="w-3 h-3" />
            Edit message
          </button>
        </div>

        {/* Layer 3: Floating connection bubbles */}
        <div
          className="absolute w-12 h-12 rounded-full border-2 border-teal-400 overflow-hidden shadow-lg z-20"
          style={{ top: '28%', right: '48%' }}
        >
          <img
            src={connections[0]?.image}
            alt={connections[0]?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute w-10 h-10 rounded-full border-2 border-brand-400 overflow-hidden shadow-lg z-20"
          style={{ top: '55%', right: '58%' }}
        >
          <img
            src={connections[1]?.image}
            alt={connections[1]?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute w-11 h-11 rounded-full border-2 border-flame-400 overflow-hidden shadow-lg z-20"
          style={{ top: '18%', right: '12%' }}
        >
          <img
            src={connections[2]?.image}
            alt={connections[2]?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Layer 4: Main profile image - anchored to bottom right, always fully visible */}
        <div className="absolute right-4 bottom-0 z-30">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-t from-blue-500/30 to-transparent rounded-full blur-xl" />
            <div
              className="relative rounded-t-full overflow-hidden border-4 border-blue-400/50"
              style={{ width: 'clamp(9rem, 38vw, 14rem)', height: 'clamp(12rem, 50vw, 18rem)' }}
            >
              <img
                src={displayImage}
                alt={fullName}
                className="w-full h-full object-cover"
                style={{ objectPosition: displayPosition }}
              />
            </div>
          </div>
        </div>

        {/* Bottom curve transition */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-iron-50 rounded-t-3xl z-40" />

        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />

        {/* Camera button - ON TOP of white curve */}
        <button
          onClick={() => {
            setTempImageSettings(currentSettings);
            setIsEditingImage(true);
          }}
          disabled={uploading}
          className="absolute bottom-3 right-6 w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-blue-600 transition-colors z-50 disabled:opacity-60"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Affirmation Edit Modal */}
        {isEditingAffirmation && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsEditingAffirmation(false)}
            />
            <div className="relative bg-iron-900 rounded-t-2xl w-full max-w-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Edit Affirmation</h3>
                <button
                  onClick={() => setIsEditingAffirmation(false)}
                  className="p-2 text-iron-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-iron-400 mb-3">
                This message appears below "I AM" on your dashboard.
              </p>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value.toUpperCase())}
                className="w-full bg-iron-800 text-white text-xl font-black leading-tight p-3 rounded-lg border border-iron-700 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                placeholder="YOUR MESSAGE"
                maxLength={50}
                autoFocus
              />
              <p className="text-xs text-iron-500 mt-1 mb-4">{editText.length}/50</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditingAffirmation(false)}
                  className="flex-1 py-3 px-4 bg-iron-800 text-white rounded-xl font-medium hover:bg-iron-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAffirmation}
                  className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Image Editor Modal */}
        {isEditingImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={handleCancelImageEdit}
            />

            {/* Modal */}
            <div className="relative bg-iron-900 rounded-2xl w-full max-w-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-iron-800">
                <h3 className="text-lg font-bold text-white">Edit Profile Image</h3>
                <div className="flex items-center gap-2">
                  {user && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-iron-700 hover:bg-iron-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Upload
                    </button>
                  )}
                  <button
                    onClick={handleCancelImageEdit}
                    className="p-2 text-iron-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4">
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-40 rounded-t-full overflow-hidden border-4 border-brand-400/50">
                    <img
                      src={tempImageSettings.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: getObjectPosition(tempImageSettings.position) }}
                    />
                  </div>
                </div>

                {/* Position Controls */}
                <div className="mb-4">
                  <p className="text-sm text-iron-400 mb-2 text-center">Adjust Position</p>
                  <div className="flex justify-center items-center gap-2">
                    <div className="grid grid-cols-3 gap-1">
                      <div />
                      <button
                        onClick={() => adjustPosition('y', -10)}
                        className="w-10 h-10 bg-iron-800 hover:bg-iron-700 rounded-lg flex items-center justify-center text-white transition-colors"
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <div />
                      <button
                        onClick={() => adjustPosition('x', -10)}
                        className="w-10 h-10 bg-iron-800 hover:bg-iron-700 rounded-lg flex items-center justify-center text-white transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={resetPosition}
                        className="w-10 h-10 bg-iron-800 hover:bg-iron-700 rounded-lg flex items-center justify-center text-white transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => adjustPosition('x', 10)}
                        className="w-10 h-10 bg-iron-800 hover:bg-iron-700 rounded-lg flex items-center justify-center text-white transition-colors"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                      <div />
                      <button
                        onClick={() => adjustPosition('y', 10)}
                        className="w-10 h-10 bg-iron-800 hover:bg-iron-700 rounded-lg flex items-center justify-center text-white transition-colors"
                      >
                        <ArrowDown className="w-5 h-5" />
                      </button>
                      <div />
                    </div>
                  </div>
                </div>

                {/* Image Selection */}
                <div className="mb-4">
                  <p className="text-sm text-iron-400 mb-2">Select Image</p>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                    {getAllAvailableImages().map((img, index) => (
                      <button
                        key={index}
                        onClick={() => selectImage(img)}
                        className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          tempImageSettings.image === img
                            ? 'border-brand-500'
                            : 'border-iron-700 hover:border-iron-500'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Option ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {tempImageSettings.image === img && (
                          <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-4 border-t border-iron-800">
                <button
                  onClick={handleCancelImageEdit}
                  className="flex-1 py-2 px-4 bg-iron-800 text-white rounded-lg font-medium hover:bg-iron-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveImageSettings}
                  className="flex-1 py-2 px-4 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-2">
        {/* Greeting */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-iron-900">
            Hey, {firstName}!
          </h2>
          <p className="text-iron-500 text-sm">Let's make today count.</p>
        </div>

        {/* Daily Check-in */}
        {!checkedIn && (
          <Card className="mb-4 bg-gradient-to-br from-brand-500 to-coral-500 border-none text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Daily Check-in</h3>
                <p className="text-sm text-white/80 mb-3">{dailyPrompt}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-brand-600 hover:bg-white/90"
                  onClick={handleCheckIn}
                >
                  Check In
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Role-specific Content */}
        {role === 'mentee' && !dataLoading && !activeMatchId && (
          <Card className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-iron-900">Find a Mentor</h3>
                <p className="text-sm text-iron-500">You haven't been matched yet</p>
              </div>
            </div>
            <Link to="/mentors">
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Browse Mentors
              </Button>
            </Link>
          </Card>
        )}

        {role === 'mentor' && (
          <Card className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-iron-900">Your Mentees</h3>
              {!dataLoading && (
                <Badge variant="success">{menteesForMentor.length} Active</Badge>
              )}
            </div>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-iron-100 animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-iron-100 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-iron-100 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {menteesForMentor.slice(0, 2).map((mentee) => (
                  <div key={mentee.id} className="flex items-center gap-3">
                    <Avatar
                      src={mentee.avatar_url ?? undefined}
                      name={`${mentee.first_name ?? ''} ${mentee.last_name ?? ''}`.trim()}
                      size="md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-iron-900">
                        {mentee.first_name} {mentee.last_name}
                      </h4>
                    </div>
                    <Link to={`/messages/${mentee.match_id}`}>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {menteesForMentor.length === 0 && (
                  <p className="text-sm text-iron-500">No active mentees yet.</p>
                )}
              </div>
            )}
            <Link to="/sessions" className="block mt-4">
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                View All Sessions
              </Button>
            </Link>
          </Card>
        )}

        {role === 'admin' && (
          <Card className="mb-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-900">Admin Dashboard</h3>
              <Badge className="bg-purple-500 text-white">Admin</Badge>
            </div>
            {dataLoading ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-3 text-center">
                    <div className="h-8 bg-iron-100 rounded animate-pulse mx-auto w-1/2 mb-1" />
                    <div className="h-3 bg-iron-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{adminStats.pendingMatches}</p>
                  <p className="text-xs text-iron-500">Pending Matches</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{adminStats.activeMatches}</p>
                  <p className="text-xs text-iron-500">Active Matches</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{adminStats.totalMentors}</p>
                  <p className="text-xs text-iron-500">Mentors</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-teal-600">{adminStats.totalMentees}</p>
                  <p className="text-xs text-iron-500">Mentees</p>
                </div>
              </div>
            )}
            <Link to="/admin">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Shield className="w-4 h-4 mr-2" />
                Open Admin Panel
              </Button>
            </Link>
          </Card>
        )}

        {/* Upcoming Session */}
        {role !== 'admin' && (
          upcomingSession ? (
            <Link to={`/sessions/${upcomingSession.match_id}`}>
              <Card className="mb-4 hover:border-brand-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-iron-900">Upcoming Session</h4>
                    <p className="text-sm text-iron-500">{formatSessionTime(upcomingSession.scheduled_at)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-iron-400" />
                </div>
              </Card>
            </Link>
          ) : (
            <Link to="/sessions">
              <Card className="mb-4 hover:border-brand-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-iron-900">Sessions</h4>
                    <p className="text-sm text-iron-500">View and schedule sessions</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-iron-400" />
                </div>
              </Card>
            </Link>
          )
        )}

        {/* Goals Progress */}
        {role !== 'admin' && (
          <Card className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-iron-900">Your Goals</h3>
              <Link to="/goals" className="text-sm text-brand-500 font-medium">
                View All
              </Link>
            </div>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-3 bg-iron-100 rounded animate-pulse w-3/4 mb-2" />
                    <div className="h-2 bg-iron-100 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activeGoalsCount > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-iron-700">Active Goals</span>
                      <span className="text-xs text-iron-500">{activeGoalsCount} active</span>
                    </div>
                    <div className="h-2 bg-iron-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{
                          width: activeGoalsCount + completedGoalsCount > 0
                            ? `${Math.round((completedGoalsCount / (activeGoalsCount + completedGoalsCount)) * 100)}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <p className="text-xs text-iron-400 mt-1">
                      {completedGoalsCount} of {activeGoalsCount + completedGoalsCount} completed
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-iron-500">No goals yet. Add your first goal!</p>
                )}
              </div>
            )}
            <Link to="/goals">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                <Target className="w-4 h-4 mr-2" />
                Add New Goal
              </Button>
            </Link>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/sessions">
            <Card className="hover:border-brand-200 transition-colors">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-brand-600" />
              </div>
              <h4 className="font-medium text-iron-900 text-sm">Sessions</h4>
              <p className="text-xs text-iron-500">View all sessions</p>
            </Card>
          </Link>
          <Link to="/training">
            <Card className="hover:border-teal-200 transition-colors">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <h4 className="font-medium text-iron-900 text-sm">Training</h4>
              <p className="text-xs text-iron-500">Continue learning</p>
            </Card>
          </Link>
          <Link to="/community">
            <Card className="hover:border-brand-200 transition-colors">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-brand-600" />
              </div>
              <h4 className="font-medium text-iron-900 text-sm">Community</h4>
              <p className="text-xs text-iron-500">Join the conversation</p>
            </Card>
          </Link>
          <Link to="/goals">
            <Card className="hover:border-coral-200 transition-colors">
              <div className="w-10 h-10 bg-coral-100 rounded-xl flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-coral-600" />
              </div>
              <h4 className="font-medium text-iron-900 text-sm">Goals</h4>
              <p className="text-xs text-iron-500">Track your progress</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
