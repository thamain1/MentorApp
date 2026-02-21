import { useState, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar } from '../ui';
import { mockPosts, mockCurrentUser, mockMentorProfile, mockMentees } from '../../data/mockData';

// Stories data
const mockStories = [
  { id: 'create', user: mockCurrentUser, hasStory: false, isOwn: true },
  { id: 'story-1', user: mockMentorProfile, hasStory: true, isOwn: false },
  { id: 'story-2', user: mockMentees[1], hasStory: true, isOwn: false },
  { id: 'story-3', user: mockMentees[2], hasStory: true, isOwn: false },
  { id: 'story-4', user: { ...mockMentorProfile, id: 'mentor-x', first_name: 'Coach', last_name: 'Mike' }, hasStory: false, isOwn: false },
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
  const [posts, setPosts] = useState(mockPosts);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showCompose, setShowCompose] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null);

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
    // Show heart animation
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

  const handlePost = () => {
    if (!newPost.trim()) return;
    const newPostObj = {
      id: `post-new-${Date.now()}`,
      group_id: null,
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
    };
    setPosts([newPostObj, ...posts]);
    setNewPost('');
    setShowCompose(false);
  };

  return (
    <AppShell>
      <Header title="Community" showNotifications />

      <div className="bg-white">
        {/* Stories Section */}
        <div className="border-b border-iron-100">
          <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
            {mockStories.map((story) => {
              const name = `${story.user.first_name} ${story.user.last_name}`;
              const displayName = story.isOwn ? 'Your story' : story.user.first_name;

              return (
                <button key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`relative p-[3px] rounded-full ${
                    story.hasStory
                      ? 'bg-gradient-to-tr from-amber-500 via-flame-500 to-pink-500'
                      : 'bg-iron-200'
                  }`}>
                    <div className="bg-white p-[2px] rounded-full">
                      <Avatar
                        src={story.user.avatar_url}
                        name={name}
                        size="lg"
                      />
                    </div>
                    {story.isOwn && (
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-iron-600 max-w-[64px] truncate">
                    {displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed */}
        <div className="divide-y divide-iron-100">
          {posts.map((post) => {
            const authorName = `${post.author.first_name} ${post.author.last_name}`;
            const isSaved = savedPosts.has(post.id);
            const showHeartAnimation = likeAnimation === post.id;

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
                      <h4 className="font-semibold text-sm text-iron-900">
                        {authorName.toLowerCase().replace(' ', '_')}
                      </h4>
                    </div>
                  </div>
                  <button className="p-2 -mr-2 text-iron-600 hover:text-iron-900">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content - Tap to like */}
                <div
                  className="relative px-4 py-2 min-h-[120px] flex items-center cursor-pointer select-none"
                  onDoubleClick={() => handleDoubleTap(post.id, post.hasLiked)}
                >
                  {/* Gradient background for visual interest */}
                  <div className="absolute inset-0 bg-gradient-to-br from-iron-50 to-white" />

                  <p className="relative text-iron-800 text-[15px] leading-relaxed whitespace-pre-wrap z-10">
                    {post.content}
                  </p>

                  {/* Heart animation on double tap */}
                  {showHeartAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg animate-ping" />
                    </div>
                  )}
                </div>

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
                  <div className="mt-1">
                    <p className="text-sm">
                      <span className="font-semibold text-iron-900">
                        {authorName.toLowerCase().replace(' ', '_')}
                      </span>{' '}
                      <span className="text-iron-700">
                        {post.content.length > 100
                          ? `${post.content.slice(0, 100)}...`
                          : ''}
                      </span>
                    </p>
                  </div>

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
          <div className="w-full max-w-md bg-white rounded-t-2xl safe-bottom animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-iron-100">
              <button
                onClick={() => setShowCompose(false)}
                className="text-iron-600 font-medium"
              >
                Cancel
              </button>
              <h3 className="font-semibold text-iron-900">New Post</h3>
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className={`font-semibold ${
                  newPost.trim()
                    ? 'text-blue-500'
                    : 'text-blue-300'
                }`}
              >
                Share
              </button>
            </div>

            {/* Compose Area */}
            <div className="p-4">
              <div className="flex gap-3">
                <Avatar
                  src={mockCurrentUser.avatar_url}
                  name={`${mockCurrentUser.first_name} ${mockCurrentUser.last_name}`}
                  size="md"
                />
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share a win, encouragement, or update..."
                  className="flex-1 text-[16px] placeholder:text-iron-400 border-0 focus:ring-0 resize-none min-h-[120px]"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
