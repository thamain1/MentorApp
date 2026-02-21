import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar } from '../ui';
import { mockCurrentUser, mockMentorProfile, mockMentees } from '../../data/mockData';
import { useLocation } from 'react-router-dom';

// Extended post type with images, category, role, and comments
interface PostWithImages {
  id: string;
  group_id: string | null;
  category: string;
  user_id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    role?: string;
  };
  likes: number;
  comments: number;
  hasLiked: boolean;
  images?: string[];
  topComment?: {
    author: string;
    text: string;
  };
}

// Group categories for the story-style filter
const groupCategories = [
  { id: 'all', name: 'All', abbrev: 'ALL', color: 'from-violet-500 to-purple-600' },
  { id: 'lifeskills', name: 'Life Skills', abbrev: 'LS', color: 'from-emerald-500 to-teal-600' },
  { id: 'education', name: 'Education', abbrev: 'ED', color: 'from-blue-500 to-indigo-600' },
  { id: 'entrepreneur', name: 'Entrepreneur', abbrev: 'ENT', color: 'from-amber-500 to-orange-600' },
  { id: 'construction', name: 'Construction', abbrev: 'CON', color: 'from-slate-500 to-zinc-600' },
  { id: 'health', name: 'Health', abbrev: 'HTH', color: 'from-rose-500 to-pink-600' },
  { id: 'faith', name: 'Faith', abbrev: 'FTH', color: 'from-purple-500 to-violet-600' },
];

// Posts with the new format
const postsWithImages: PostWithImages[] = [
  {
    id: 'post-1',
    group_id: null,
    category: 'education',
    user_id: mockMentorProfile.user_id,
    content: 'Just completed my first hackathon! Here are 5 tips for young developers looking to participate in their first coding competition 🚀',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    author: {
      id: mockMentorProfile.id,
      first_name: 'Alex',
      last_name: 'Martinez',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      role: 'Software Engineer',
    },
    likes: 124,
    comments: 18,
    hasLiked: true,
    images: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80',
    ],
    topComment: {
      author: 'jessica_codes',
      text: 'This is so inspiring! Thanks for sharing 🙌',
    },
  },
  {
    id: 'post-2',
    group_id: null,
    category: 'mentors',
    user_id: mockMentorProfile.user_id,
    content: 'Great turnout at today\'s group mentoring session! These young men are putting in the work. Proud of each and every one of them. 💪',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    author: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
      role: 'Lead Mentor',
    },
    likes: 89,
    comments: 12,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640&q=80',
    ],
    topComment: {
      author: 'marcus_j',
      text: 'Best session yet! Learned so much 📚',
    },
  },
  {
    id: 'post-3',
    group_id: null,
    category: 'entrepreneur',
    user_id: mockMentees[1].user_id,
    content: 'Started my first small business this week - a lawn care service! My mentor helped me write a business plan and set my prices. First client already booked! 🌱',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    author: {
      id: mockMentees[1].id,
      first_name: mockMentees[1].first_name,
      last_name: mockMentees[1].last_name,
      avatar_url: mockMentees[1].avatar_url,
      role: 'Aspiring Entrepreneur',
    },
    likes: 156,
    comments: 24,
    hasLiked: true,
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=640&q=80',
    ],
    topComment: {
      author: 'coach_williams',
      text: 'So proud of you! This is what it\'s all about 🙏',
    },
  },
  {
    id: 'post-4',
    group_id: null,
    category: 'faith',
    user_id: mockCurrentUser.user_id,
    content: 'As iron sharpens iron, so one person sharpens another. Grateful for this community and the men who pour into us daily. 🙏',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    author: {
      id: mockCurrentUser.id,
      first_name: mockCurrentUser.first_name,
      last_name: mockCurrentUser.last_name,
      avatar_url: mockCurrentUser.avatar_url,
      role: 'Mentee',
    },
    likes: 203,
    comments: 31,
    hasLiked: true,
    topComment: {
      author: 'david_w',
      text: 'Amen! This community changed my life 💯',
    },
  },
  {
    id: 'post-5',
    group_id: null,
    category: 'health',
    user_id: mockMentorProfile.user_id,
    content: 'Morning workout complete! Remember kings, taking care of your body is taking care of your mind. Who else got their workout in today? 💪',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    author: {
      id: mockMentorProfile.id,
      first_name: 'Coach',
      last_name: 'Mike',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
      role: 'Fitness Coach',
    },
    likes: 78,
    comments: 15,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80',
    ],
    topComment: {
      author: 'young_king_23',
      text: 'Just finished mine! 5am gang 🔥',
    },
  },
  {
    id: 'post-6',
    group_id: null,
    category: 'lifeskills',
    user_id: mockMentees[0].user_id,
    content: 'Finally learned how to cook a proper meal for my family tonight! My mentor taught me that taking care of others starts with small acts of service. Thanks for pushing me to learn these skills. 🍳',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    author: {
      id: mockMentees[0].id,
      first_name: mockMentees[0].first_name,
      last_name: mockMentees[0].last_name,
      avatar_url: mockMentees[0].avatar_url,
      role: 'Mentee',
    },
    likes: 92,
    comments: 8,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&q=80',
    ],
    topComment: {
      author: 'mentor_james',
      text: 'So proud of you! This is what growth looks like 👏',
    },
  },
  {
    id: 'post-7',
    group_id: null,
    category: 'construction',
    user_id: mockMentorProfile.user_id,
    content: 'Big day on the job site! These young men are learning valuable trade skills that will serve them for life. Hard work pays off. 🔨',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    author: {
      id: mockMentorProfile.id,
      first_name: 'Steve',
      last_name: 'Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      role: 'Trades Mentor',
    },
    likes: 145,
    comments: 22,
    hasLiked: true,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&q=80',
    ],
    topComment: {
      author: 'apprentice_mike',
      text: 'Learning so much every day on this crew! 💪',
    },
  },
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


export function CommunityFeed() {
  const location = useLocation();
  const [posts, setPosts] = useState<PostWithImages[]>(postsWithImages);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showCompose, setShowCompose] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  const [checkInPrompt, setCheckInPrompt] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter posts by selected category
  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

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

  const handleLike = useCallback((postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hasLiked: !post.hasLiked,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  }, [posts]);

  const handleDoubleTap = useCallback((postId: string, hasLiked: boolean) => {
    if (!hasLiked) {
      handleLike(postId);
    }
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

  const handlePost = () => {
    if (!newPost.trim() && selectedImages.length === 0) return;

    const newPostObj: PostWithImages = {
      id: `post-new-${Date.now()}`,
      group_id: null,
      category: 'mentors',
      user_id: mockCurrentUser.user_id,
      content: newPost,
      created_at: new Date().toISOString(),
      author: {
        id: mockCurrentUser.id,
        first_name: mockCurrentUser.first_name,
        last_name: mockCurrentUser.last_name,
        avatar_url: mockCurrentUser.avatar_url,
        role: 'Mentee',
      },
      likes: 0,
      comments: 0,
      hasLiked: false,
      images: selectedImages.length > 0 ? selectedImages : undefined,
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
    setSelectedImages([]);
    setCheckInPrompt(null);
    setShowCompose(false);
  };

  const navigateImage = (postId: string, direction: 'prev' | 'next', totalImages: number) => {
    setImageIndexes(prev => {
      const current = prev[postId] || 0;
      let newIndex = direction === 'next' ? current + 1 : current - 1;
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= totalImages) newIndex = totalImages - 1;
      return { ...prev, [postId]: newIndex };
    });
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
                      ? `bg-gradient-to-br ${category.color} ring-2 ring-offset-2 ring-violet-400`
                      : 'bg-iron-100 hover:bg-iron-200'
                  }`}>
                    <span className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-iron-600'
                    }`}>
                      {category.abbrev}
                    </span>
                  </div>
                  <span className={`text-xs max-w-[56px] truncate ${
                    isSelected ? 'text-violet-600 font-medium' : 'text-iron-500'
                  }`}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4 pt-4 px-4">
          {filteredPosts.map((post) => {
            const authorName = `${post.author.first_name} ${post.author.last_name}`;
            const isSaved = savedPosts.has(post.id);
            const showHeartAnimation = likeAnimation === post.id;
            const hasImages = post.images && post.images.length > 0;
            const currentImageIndex = imageIndexes[post.id] || 0;

            return (
              <article key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Post Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-purple-500 via-violet-500 to-pink-500">
                      <div className="bg-white p-[1px] rounded-full">
                        <Avatar
                          src={post.author.avatar_url}
                          name={authorName}
                          size="md"
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

                {/* Post Text - Above Image */}
                <div className="px-4 pb-3">
                  <p className="text-iron-800 text-[15px] leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Post Image(s) */}
                {hasImages && (
                  <div
                    className="relative bg-iron-100 cursor-pointer select-none"
                    onDoubleClick={() => handleDoubleTap(post.id, post.hasLiked)}
                  >
                    <img
                      src={post.images![currentImageIndex]}
                      alt="Post image"
                      className="w-full object-cover"
                      style={{ maxHeight: '400px' }}
                    />

                    {/* Image Navigation */}
                    {post.images!.length > 1 && (
                      <>
                        {currentImageIndex > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateImage(post.id, 'prev', post.images!.length);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <ChevronLeft className="w-5 h-5 text-iron-700" />
                          </button>
                        )}
                        {currentImageIndex < post.images!.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateImage(post.id, 'next', post.images!.length);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <ChevronRight className="w-5 h-5 text-iron-700" />
                          </button>
                        )}
                      </>
                    )}

                    {/* Heart animation */}
                    {showHeartAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg animate-ping" />
                      </div>
                    )}
                  </div>
                )}

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
                            post.hasLiked
                              ? 'text-red-500 fill-red-500'
                              : 'text-iron-600'
                          }`}
                        />
                        <span className="text-sm text-iron-600">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-iron-50 transition-colors">
                        <MessageCircle className="w-5 h-5 text-iron-600" />
                        <span className="text-sm text-iron-600">{post.comments}</span>
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

                  {/* Comment Preview */}
                  {post.topComment && (
                    <div className="mt-3 pt-3 border-t border-iron-100">
                      <p className="text-sm">
                        <span className="font-semibold text-iron-900">{post.topComment.author}</span>{' '}
                        <span className="text-iron-600">{post.topComment.text}</span>
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-2xl safe-bottom animate-slide-up max-h-[90vh] flex flex-col">
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
                    ? 'text-violet-600'
                    : 'text-violet-300'
                }`}
              >
                Share
              </button>
            </div>

            {/* Daily Check-in Prompt */}
            {checkInPrompt && (
              <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
                <p className="text-sm font-medium text-violet-700">Today's Prompt:</p>
                <p className="text-violet-900 font-semibold">{checkInPrompt}</p>
              </div>
            )}

            {/* Compose Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex gap-3">
                  <Avatar
                    src={mockCurrentUser.avatar_url}
                    name={`${mockCurrentUser.first_name} ${mockCurrentUser.last_name}`}
                    size="md"
                    className="flex-shrink-0"
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
                className="flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
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
