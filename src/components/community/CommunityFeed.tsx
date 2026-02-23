import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Image,
  X,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar } from '../ui';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Post type with author info and like data
interface PostWithAuthor {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  group_id: string | null;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    avatar_position_x: number;
    avatar_position_y: number;
    role: string;
  };
  like_count: number;
  liked_by_me: boolean;
}

// Group categories for the story-style filter
const groupCategories = [
  { id: 'all', name: 'All', abbrev: 'ALL', color: 'from-brand-500 to-coral-500' },
  { id: 'lifeskills', name: 'Life Skills', abbrev: 'LS', color: 'from-teal-500 to-teal-600' },
  { id: 'education', name: 'Education', abbrev: 'ED', color: 'from-brand-400 to-brand-600' },
  { id: 'entrepreneur', name: 'Entrepreneur', abbrev: 'ENT', color: 'from-amber-500 to-orange-600' },
  { id: 'construction', name: 'Construction', abbrev: 'CON', color: 'from-slate-500 to-zinc-600' },
  { id: 'health', name: 'Health', abbrev: 'HTH', color: 'from-coral-400 to-coral-600' },
  { id: 'faith', name: 'Faith', abbrev: 'FTH', color: 'from-brand-500 to-brand-700' },
];

// Format time like "2h ago"
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}

function roleLabel(role: string): string {
  if (role === 'mentor') return 'Mentor';
  if (role === 'admin') return 'Admin';
  return 'Mentee';
}

export function CommunityFeed() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showCompose, setShowCompose] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null);
  const [checkInPrompt, setCheckInPrompt] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // 1. Fetch posts
    const { data: rawPosts, error } = await supabase
      .from('posts')
      .select('id, group_id, user_id, content, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !rawPosts || rawPosts.length === 0) {
      setLoading(false);
      return;
    }

    const postIds = rawPosts.map(p => p.id);
    const userIds = [...new Set(rawPosts.map(p => p.user_id))];

    // 2. Fetch profiles for all post authors (profiles.user_id = posts.user_id)
    const { data: authorProfiles } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, avatar_url, avatar_position_x, avatar_position_y, role')
      .in('user_id', userIds);

    const profileByUserId = new Map<string, {
      id: string;
      user_id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
      avatar_position_x: number;
      avatar_position_y: number;
      role: string;
    }>();
    (authorProfiles ?? []).forEach(p => profileByUserId.set(p.user_id, {
      ...p,
      avatar_position_x: p.avatar_position_x ?? 0,
      avatar_position_y: p.avatar_position_y ?? 0,
    }));

    // 3. Fetch all likes for these posts
    const { data: allLikes } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    // Count likes per post
    const likeCountMap = new Map<string, number>();
    const myLikedSet = new Set<string>();
    (allLikes ?? []).forEach(like => {
      likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) ?? 0) + 1);
      if (like.user_id === user.id) {
        myLikedSet.add(like.post_id);
      }
    });

    // 4. Assemble PostWithAuthor objects
    const assembled: PostWithAuthor[] = rawPosts
      .map(post => {
        const authorProfile = profileByUserId.get(post.user_id);
        if (!authorProfile) return null;
        return {
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          user_id: post.user_id,
          group_id: post.group_id ?? null,
          author: {
            id: authorProfile.id,
            first_name: authorProfile.first_name,
            last_name: authorProfile.last_name,
            avatar_url: authorProfile.avatar_url,
            avatar_position_x: authorProfile.avatar_position_x,
            avatar_position_y: authorProfile.avatar_position_y,
            role: roleLabel(authorProfile.role),
          },
          like_count: likeCountMap.get(post.id) ?? 0,
          liked_by_me: myLikedSet.has(post.id),
        };
      })
      .filter((p): p is PostWithAuthor => p !== null);

    setPosts(assembled);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter posts by selected category (group_id-based filtering is not available without group data;
  // category filtering is kept as UI state but since posts table has no category column,
  // all posts show under 'all'. The filter UI is preserved as-is.)
  const filteredPosts = posts;

  // Check if navigated from Daily Check-in or Create button
  useEffect(() => {
    const state = location.state as { checkInPrompt?: string; openCompose?: boolean } | null;
    if (state?.checkInPrompt) {
      setCheckInPrompt(state.checkInPrompt);
      setShowCompose(true);
      window.history.replaceState({}, document.title);
    } else if (state?.openCompose) {
      setShowCompose(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLike = useCallback(async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.liked_by_me) {
      // Unlike: DELETE from post_likes
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, liked_by_me: false, like_count: p.like_count - 1 }
            : p
        ));
      }
    } else {
      // Like: INSERT into post_likes
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, liked_by_me: true, like_count: p.like_count + 1 }
            : p
        ));
      }
    }
  }, [user, posts]);

  const handleDoubleTap = useCallback((postId: string, likedByMe: boolean) => {
    if (!likedByMe) handleLike(postId);
    setLikeAnimation(postId);
    setTimeout(() => setLikeAnimation(null), 1000);
  }, [handleLike]);

  const handleSave = (postId: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          if (newImages.length === files.length) {
            setSelectedImages(prev => [...prev, ...newImages].slice(0, 10));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!newPost.trim() && selectedImages.length === 0) return;
    if (!user || !profile) return;

    const { data: inserted, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: newPost.trim(),
        group_id: null,
      })
      .select('id, group_id, user_id, content, created_at')
      .single();

    if (!error && inserted) {
      const newPostObj: PostWithAuthor = {
        id: inserted.id,
        content: inserted.content,
        created_at: inserted.created_at,
        user_id: inserted.user_id,
        group_id: inserted.group_id ?? null,
        author: {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url ?? null,
          avatar_position_x: profile.avatar_position_x ?? 0,
          avatar_position_y: profile.avatar_position_y ?? 0,
          role: roleLabel(profile.role),
        },
        like_count: 0,
        liked_by_me: false,
      };
      setPosts(prev => [newPostObj, ...prev]);
    }

    setNewPost('');
    setSelectedImages([]);
    setCheckInPrompt(null);
    setShowCompose(false);
  };

  return (
    <AppShell>
      <Header
        showLogo
        showSearch
        showNotifications
        showProfile
        notificationCount={3}
      />

      <div className="bg-iron-50 min-h-screen pb-4">
        {/* Group Categories Section */}
        <div className="bg-white border-b border-iron-100">
          <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
            {groupCategories.map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${category.color} ring-2 ring-offset-2 ring-brand-400`
                      : 'bg-iron-100 hover:bg-iron-200'
                  }`}>
                    <span className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-iron-600'
                    }`}>
                      {category.abbrev}
                    </span>
                  </div>
                  <span className={`text-xs max-w-[56px] truncate ${
                    isSelected ? 'text-brand-500 font-medium' : 'text-iron-500'
                  }`}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-4 pt-4 px-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-iron-200" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-iron-200 rounded w-1/3" />
                    <div className="h-3 bg-iron-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="px-4 pb-3 space-y-2">
                  <div className="h-4 bg-iron-100 rounded w-full" />
                  <div className="h-4 bg-iron-100 rounded w-3/4" />
                </div>
                <div className="h-48 bg-iron-100" />
                <div className="px-4 py-3 flex gap-4">
                  <div className="h-6 w-12 bg-iron-100 rounded" />
                  <div className="h-6 w-12 bg-iron-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Feed */
          <div className="space-y-4 pt-4 px-4">
            {filteredPosts.map((post) => {
              const authorName = `${post.author.first_name} ${post.author.last_name}`;
              const isSaved = savedPosts.has(post.id);
              const showHeartAnimation = likeAnimation === post.id;

              return (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Post Header */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-[2px] rounded-full bg-gradient-to-tr from-brand-500 via-brand-400 to-coral-500">
                        <div className="bg-white p-[1px] rounded-full">
                          <Avatar
                            src={post.author.avatar_url}
                            name={authorName}
                            size="md"
                            style={{ objectPosition: `${50 + (post.author.avatar_position_x ?? 0)}% ${50 + (post.author.avatar_position_y ?? 0)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-iron-900">
                          {authorName}
                        </h4>
                        <p className="text-xs text-iron-500">
                          {post.author.role} • {formatTimeAgo(post.created_at)}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 -mr-2 text-iron-400 hover:text-iron-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Text */}
                  <div
                    className="px-4 pb-3"
                    onDoubleClick={() => handleDoubleTap(post.id, post.liked_by_me)}
                  >
                    <p className="text-iron-800 text-[15px] leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-iron-50 transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              post.liked_by_me
                                ? 'text-coral-500 fill-coral-500'
                                : 'text-iron-600'
                            }`}
                          />
                          <span className="text-sm text-iron-600">{post.like_count}</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-iron-50 transition-colors">
                          <MessageCircle className="w-5 h-5 text-iron-600" />
                          <span className="text-sm text-iron-600">0</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-iron-50 transition-colors">
                          <Send className="w-5 h-5 text-iron-600" />
                          <span className="text-sm text-iron-600">Share</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleSave(post.id)}
                        className="p-1.5 rounded-lg hover:bg-iron-50 transition-colors"
                      >
                        <Bookmark
                          className={`w-5 h-5 ${
                            isSaved
                              ? 'text-iron-900 fill-iron-900'
                              : 'text-iron-600'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Heart animation overlay (shown on double-tap, no image to tap so kept hidden) */}
                  {showHeartAnimation && (
                    <div className="flex items-center justify-center py-2 pointer-events-none">
                      <Heart className="w-12 h-12 text-coral-500 fill-coral-500 animate-ping" />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col mb-16">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-iron-100 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCompose(false);
                  setSelectedImages([]);
                  setNewPost('');
                  setCheckInPrompt(null);
                }}
                className="text-iron-600 font-medium"
              >
                Cancel
              </button>
              <h3 className="font-semibold text-iron-900">
                {checkInPrompt ? 'Daily Check-in' : 'New Post'}
              </h3>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() && selectedImages.length === 0}
                className={`font-semibold ${
                  newPost.trim() || selectedImages.length > 0
                    ? 'text-brand-500'
                    : 'text-brand-300'
                }`}
              >
                Share
              </button>
            </div>

            {/* Daily Check-in Prompt */}
            {checkInPrompt && (
              <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-teal-50 border-b border-brand-100">
                <p className="text-sm font-medium text-brand-600">Today's Prompt:</p>
                <p className="text-brand-800 font-semibold">{checkInPrompt}</p>
              </div>
            )}

            {/* Compose Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex gap-3">
                  <Avatar
                    src={profile?.avatar_url ?? undefined}
                    name={`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()}
                    size="md"
                    className="flex-shrink-0"
                    style={{ objectPosition: `${50 + (profile?.avatar_position_x ?? 0)}% ${50 + (profile?.avatar_position_y ?? 0)}%` }}
                  />
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={checkInPrompt ? "Share your response..." : "What's on your mind?"}
                    className="flex-1 text-[16px] placeholder:text-iron-400 border-0 focus:ring-0 resize-none min-h-[100px]"
                    autoFocus
                  />
                </div>

                {/* Selected Images Preview */}
                {selectedImages.length > 0 && (
                  <div className="mt-4">
                    <div className={`grid gap-2 ${
                      selectedImages.length === 1 ? 'grid-cols-1' :
                      selectedImages.length === 2 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-iron-100">
                          <img
                            src={image}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="flex items-center gap-4 px-4 py-3 border-t border-iron-100 flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-brand-500 hover:text-brand-600 transition-colors"
              >
                <Image className="w-6 h-6" />
                <span className="text-sm font-medium">Add Photos</span>
              </button>
              {selectedImages.length > 0 && (
                <span className="text-sm text-iron-400">
                  {selectedImages.length}/10 photos
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
