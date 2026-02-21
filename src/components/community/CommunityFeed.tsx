import { useState, useCallback, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Plus,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar } from '../ui';
import { mockPosts, mockCurrentUser, mockMentorProfile, mockMentees } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

// Extended post type with images and category
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
  };
  likes: number;
  hasLiked: boolean;
  images?: string[];
}

// Group categories for stories section
const groupCategories = [
  { id: 'all', abbr: 'ALL', name: 'All Posts', color: 'from-iron-400 to-iron-600', hasNew: false },
  { id: 'education', abbr: 'ED', name: 'Education', color: 'from-blue-400 to-blue-600', hasNew: true },
  { id: 'lifeskills', abbr: 'LS', name: 'Life Skills', color: 'from-teal-400 to-teal-600', hasNew: true },
  { id: 'entrepreneur', abbr: 'EN', name: 'Entrepreneur', color: 'from-amber-400 to-amber-600', hasNew: true },
  { id: 'construction', abbr: 'CO', name: 'Construction', color: 'from-orange-400 to-orange-600', hasNew: false },
  { id: 'health', abbr: 'HE', name: 'Health', color: 'from-green-400 to-green-600', hasNew: true },
  { id: 'faith', abbr: 'FA', name: 'Faith', color: 'from-purple-400 to-purple-600', hasNew: true },
  { id: 'finance', abbr: '$', name: 'Finance', color: 'from-emerald-400 to-emerald-600', hasNew: false },
  { id: 'mentors', abbr: 'MT', name: 'Mentors', color: 'from-flame-400 to-flame-600', hasNew: true },
];

// Add some posts with images and categories
const postsWithImages: PostWithImages[] = [
  {
    id: 'post-img-1',
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
    },
    likes: 47,
    hasLiked: true,
    images: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640&q=80',
    ],
  },
  {
    id: 'post-img-2',
    group_id: null,
    category: 'education',
    user_id: mockMentees[2].user_id,
    content: 'Just finished my college application essays! Couldn\'t have done it without my mentor\'s guidance. Next stop: university! 🎓📚',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    author: {
      id: mockMentees[2].id,
      first_name: mockMentees[2].first_name,
      last_name: mockMentees[2].last_name,
      avatar_url: mockMentees[2].avatar_url,
    },
    likes: 89,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=640&q=80',
    ],
  },
  {
    id: 'post-img-3',
    group_id: null,
    category: 'lifeskills',
    user_id: mockCurrentUser.user_id,
    content: 'Volunteered at the community center today with my mentor. Making a difference feels amazing!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    author: {
      id: mockCurrentUser.id,
      first_name: mockCurrentUser.first_name,
      last_name: mockCurrentUser.last_name,
      avatar_url: mockCurrentUser.avatar_url,
    },
    likes: 34,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=640&q=80',
    ],
  },
  {
    id: 'post-health-1',
    group_id: null,
    category: 'health',
    user_id: mockMentorProfile.user_id,
    content: 'Morning workout complete! Remember kings, taking care of your body is taking care of your mind. Who else got their workout in today?',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    author: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    likes: 62,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80',
    ],
  },
  {
    id: 'post-entrepreneur-1',
    group_id: null,
    category: 'entrepreneur',
    user_id: mockMentees[1].user_id,
    content: 'Started my first small business this week - a lawn care service! My mentor helped me write a business plan and set my prices. First client already booked!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    author: {
      id: mockMentees[1].id,
      first_name: mockMentees[1].first_name,
      last_name: mockMentees[1].last_name,
      avatar_url: mockMentees[1].avatar_url,
    },
    likes: 103,
    hasLiked: true,
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=640&q=80',
    ],
  },
  {
    id: 'post-construction-1',
    group_id: null,
    category: 'construction',
    user_id: mockMentorProfile.user_id,
    content: 'Took the young men to a job site today. Nothing like hands-on experience to see what a career in the trades looks like. Several expressed interest in apprenticeships!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    author: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    likes: 78,
    hasLiked: false,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&q=80',
    ],
  },
  {
    id: 'post-faith-1',
    group_id: null,
    category: 'faith',
    user_id: mockCurrentUser.user_id,
    content: 'As iron sharpens iron, so one person sharpens another. Grateful for this community and the men who pour into us daily. 🙏',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    author: {
      id: mockCurrentUser.id,
      first_name: mockCurrentUser.first_name,
      last_name: mockCurrentUser.last_name,
      avatar_url: mockCurrentUser.avatar_url,
    },
    likes: 156,
    hasLiked: true,
  },
  {
    id: 'post-finance-1',
    group_id: null,
    category: 'finance',
    user_id: mockMentees[2].user_id,
    content: 'Opened my first savings account today! My mentor taught me about budgeting and the importance of paying yourself first. Small steps lead to big changes.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    author: {
      id: mockMentees[2].id,
      first_name: mockMentees[2].first_name,
      last_name: mockMentees[2].last_name,
      avatar_url: mockMentees[2].avatar_url,
    },
    likes: 94,
    hasLiked: false,
  },
  {
    id: 'post-lifeskills-2',
    group_id: null,
    category: 'lifeskills',
    user_id: mockMentorProfile.user_id,
    content: 'Today\'s session: Interview skills! Practiced handshakes, eye contact, and answering tough questions. These young men are going to crush their future interviews.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    author: {
      id: mockMentorProfile.id,
      first_name: mockMentorProfile.first_name,
      last_name: mockMentorProfile.last_name,
      avatar_url: mockMentorProfile.avatar_url,
    },
    likes: 88,
    hasLiked: true,
    images: [
      'https://images.unsplash.com/photo-1560439514-4e9645039924?w=640&q=80',
    ],
  },
  // Convert existing posts with random categories
  ...mockPosts.map((post, index) => ({
    ...post,
    category: ['education', 'lifeskills', 'faith', 'mentors'][index % 4],
    images: undefined
  })),
];

// Format time like Instagram (2h, 1d, 3w)
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
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithImages[]>(postsWithImages);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showCompose, setShowCompose] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [postCategory, setPostCategory] = useState<string>('lifeskills');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter posts based on selected category
  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  // Get category info by id
  const getCategoryInfo = (categoryId: string) => {
    return groupCategories.find(g => g.id === categoryId) || groupCategories[0];
  };

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
            setSelectedImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10 images
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
      category: postCategory,
      user_id: mockCurrentUser.user_id,
      content: newPost,
      created_at: new Date().toISOString(),
      author: {
        id: mockCurrentUser.id,
        first_name: mockCurrentUser.first_name,
        last_name: mockCurrentUser.last_name,
        avatar_url: mockCurrentUser.avatar_url,
      },
      likes: 0,
      hasLiked: false,
      images: selectedImages.length > 0 ? selectedImages : undefined,
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
    setSelectedImages([]);
    setPostCategory('lifeskills');
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
      <Header title="Community" showNotifications />

      <div className="bg-white">
        {/* Groups Section */}
        <div className="border-b border-iron-100">
          <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
            {groupCategories.map((group) => {
              const isSelected = selectedCategory === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedCategory(group.id)}
                  onDoubleClick={() => group.id !== 'all' && navigate(`/groups?filter=${group.id}`)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                >
                  <div className={`relative p-[3px] rounded-full transition-all ${
                    isSelected
                      ? 'bg-gradient-to-tr from-amber-500 via-flame-500 to-pink-500 scale-105'
                      : group.hasNew
                        ? 'bg-gradient-to-tr from-amber-500 via-flame-500 to-pink-500'
                        : 'bg-iron-200'
                  }`}>
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${group.color} flex items-center justify-center border-2 border-white shadow-sm ${
                      isSelected ? 'shadow-md' : ''
                    }`}>
                      <span className="text-white font-bold text-sm">{group.abbr}</span>
                    </div>
                    {group.hasNew && !isSelected && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-flame-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <span className={`text-xs max-w-[64px] truncate font-medium ${
                    isSelected ? 'text-flame-600' : 'text-iron-600'
                  }`}>
                    {group.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed */}
        <div className="divide-y divide-iron-100">
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-iron-500 font-medium">No posts in this category yet</p>
              <p className="text-iron-400 text-sm mt-1">Be the first to share something!</p>
            </div>
          ) : filteredPosts.map((post) => {
            const authorName = `${post.author.first_name} ${post.author.last_name}`;
            const isSaved = savedPosts.has(post.id);
            const showHeartAnimation = likeAnimation === post.id;
            const hasImages = post.images && post.images.length > 0;
            const currentImageIndex = imageIndexes[post.id] || 0;
            const categoryInfo = getCategoryInfo(post.category);

            return (
              <article key={post.id} className="bg-white">
                {/* Post Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-flame-500 to-pink-500">
                      <div className="bg-white p-[1px] rounded-full">
                        <Avatar
                          src={post.author.avatar_url}
                          name={authorName}
                          size="sm"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-iron-900">
                          {authorName.toLowerCase().replace(' ', '_')}
                        </h4>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-br ${categoryInfo.color} text-white`}>
                          {categoryInfo.abbr}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 -mr-2 text-iron-600 hover:text-iron-900">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Image(s) */}
                {hasImages && (
                  <div
                    className="relative aspect-square bg-iron-100 cursor-pointer select-none"
                    onDoubleClick={() => handleDoubleTap(post.id, post.hasLiked)}
                  >
                    <img
                      src={post.images![currentImageIndex]}
                      alt="Post image"
                      className="w-full h-full object-cover"
                    />

                    {/* Image Navigation */}
                    {post.images!.length > 1 && (
                      <>
                        {/* Prev Button */}
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

                        {/* Next Button */}
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

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {post.images!.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                idx === currentImageIndex
                                  ? 'bg-blue-500'
                                  : 'bg-white/60'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Image Counter */}
                        <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 rounded-full">
                          <span className="text-xs text-white font-medium">
                            {currentImageIndex + 1}/{post.images!.length}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Heart animation on double tap */}
                    {showHeartAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg animate-ping" />
                      </div>
                    )}
                  </div>
                )}

                {/* Text-only Post Content */}
                {!hasImages && (
                  <div
                    className="relative px-4 py-4 min-h-[100px] flex items-center cursor-pointer select-none"
                    onDoubleClick={() => handleDoubleTap(post.id, post.hasLiked)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-iron-50 to-white" />
                    <p className="relative text-iron-800 text-[15px] leading-relaxed whitespace-pre-wrap z-10">
                      {post.content}
                    </p>
                    {showHeartAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg animate-ping" />
                      </div>
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="p-2 -ml-2 transition-transform active:scale-125"
                      >
                        <Heart
                          className={`w-6 h-6 transition-colors ${
                            post.hasLiked
                              ? 'text-red-500 fill-red-500'
                              : 'text-iron-900 hover:text-iron-600'
                          }`}
                        />
                      </button>
                      <button className="p-2 text-iron-900 hover:text-iron-600">
                        <MessageCircle className="w-6 h-6" />
                      </button>
                      <button className="p-2 text-iron-900 hover:text-iron-600">
                        <Send className="w-6 h-6" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleSave(post.id)}
                      className="p-2 -mr-2"
                    >
                      <Bookmark
                        className={`w-6 h-6 transition-colors ${
                          isSaved
                            ? 'text-iron-900 fill-iron-900'
                            : 'text-iron-900 hover:text-iron-600'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Likes */}
                  <div className="mt-1">
                    <p className="font-semibold text-sm text-iron-900">
                      {post.likes.toLocaleString()} likes
                    </p>
                  </div>

                  {/* Caption */}
                  {(hasImages || post.content) && (
                    <div className="mt-1">
                      <p className="text-sm">
                        <span className="font-semibold text-iron-900">
                          {authorName.toLowerCase().replace(' ', '_')}
                        </span>{' '}
                        <span className="text-iron-700">{post.content}</span>
                      </p>
                    </div>
                  )}

                  {/* View comments link */}
                  <button className="mt-1 text-sm text-iron-500">
                    View all comments
                  </button>

                  {/* Time */}
                  <p className="mt-1 text-xs text-iron-400 uppercase">
                    {formatTimeAgo(post.created_at)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Floating Create Post Button */}
      <button
        onClick={() => setShowCompose(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-tr from-amber-500 via-flame-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

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
                }}
                className="text-iron-600 font-medium"
              >
                Cancel
              </button>
              <h3 className="font-semibold text-iron-900">New Post</h3>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() && selectedImages.length === 0}
                className={`font-semibold ${
                  newPost.trim() || selectedImages.length > 0
                    ? 'text-blue-500'
                    : 'text-blue-300'
                }`}
              >
                Share
              </button>
            </div>

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
                    placeholder="Share a win, encouragement, or update..."
                    className="flex-1 text-[16px] placeholder:text-iron-400 border-0 focus:ring-0 resize-none min-h-[80px]"
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

            {/* Category Selector */}
            <div className="px-4 py-3 border-t border-iron-100">
              <p className="text-xs text-iron-500 font-medium mb-2">Post to category:</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {groupCategories.filter(g => g.id !== 'all').map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setPostCategory(category.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      postCategory === category.id
                        ? `bg-gradient-to-br ${category.color} text-white shadow-sm`
                        : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
                    }`}
                  >
                    <span className="font-bold">{category.abbr}</span>
                    <span className="hidden sm:inline">{category.name}</span>
                  </button>
                ))}
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
                className="flex items-center gap-2 text-iron-600 hover:text-iron-900 transition-colors"
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
