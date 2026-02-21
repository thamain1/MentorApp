import { useState } from 'react';
import { Heart, Send, RefreshCw } from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar, Card, Button } from '../ui';
import { formatRelativeTime } from '../../lib/utils';
import { mockPosts, mockCurrentUser } from '../../data/mockData';

export function CommunityFeed() {
  const [posts, setPosts] = useState(mockPosts);
  const [newPost, setNewPost] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLike = (postId: string) => {
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
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    // In real app, this would post to Supabase
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
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <AppShell>
      <Header title="Community" showNotifications />

      <div className="p-4 space-y-4">
        {/* Create Post */}
        <Card className="p-4">
          <div className="flex gap-3">
            <Avatar
              src={mockCurrentUser.avatar_url}
              name={`${mockCurrentUser.first_name} ${mockCurrentUser.last_name}`}
              size="md"
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share a win or encouragement..."
                className="w-full px-3 py-2 bg-iron-50 rounded-xl border-0 focus:ring-2 focus:ring-flame-500 focus:bg-white resize-none text-sm"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={handlePost}
                  disabled={!newPost.trim()}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Refresh indicator */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 w-full py-2 text-sm text-iron-500 hover:text-iron-700"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </button>

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post) => {
            const authorName = `${post.author.first_name} ${post.author.last_name}`;

            return (
              <Card key={post.id} className="p-4">
                {/* Author info */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    src={post.author.avatar_url}
                    name={authorName}
                    size="md"
                  />
                  <div>
                    <h4 className="font-semibold text-iron-900">{authorName}</h4>
                    <p className="text-xs text-iron-500">
                      {formatRelativeTime(post.created_at)}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-iron-700 mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-iron-100">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.hasLiked
                        ? 'text-flame-600'
                        : 'text-iron-500 hover:text-flame-600'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`}
                    />
                    <span>{post.likes}</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
