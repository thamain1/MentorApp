import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Image,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  Share2,
  Flag,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Avatar } from '../ui';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    avatar_position_x: number;
    avatar_position_y: number;
    role: string;
  };
}

interface PostWithAuthor {
  id: string;
  title: string | null;
  content: string;
  image_urls: string[];
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
  comment_count: number;
}

interface SelectedImage {
  file: File;
  preview: string;
}

const groupCategories = [
  { id: 'all', name: 'All', abbrev: 'ALL', color: 'from-brand-500 to-coral-500' },
  { id: 'lifeskills', name: 'Life Skills', abbrev: 'LS', color: 'from-teal-500 to-teal-600' },
  { id: 'education', name: 'Education', abbrev: 'ED', color: 'from-brand-400 to-brand-600' },
  { id: 'entrepreneur', name: 'Entrepreneur', abbrev: 'ENT', color: 'from-amber-500 to-orange-600' },
  { id: 'construction', name: 'Construction', abbrev: 'CON', color: 'from-slate-500 to-zinc-600' },
  { id: 'health', name: 'Health', abbrev: 'HTH', color: 'from-coral-400 to-coral-600' },
  { id: 'faith', name: 'Faith', abbrev: 'FTH', color: 'from-brand-500 to-brand-700' },
];

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
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null);
  const [checkInPrompt, setCheckInPrompt] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const commentInputsRef = useRef<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    type RawPost = { id: string; group_id: string | null; user_id: string; title: string | null; content: string; image_urls: string[]; created_at: string };
    const { data: rawPostsUntyped, error } = await supabase
      .from('posts')
      .select('id, group_id, user_id, title, content, image_urls, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    const rawPosts = rawPostsUntyped as unknown as RawPost[] | null;

    if (error || !rawPosts || rawPosts.length === 0) {
      setLoading(false);
      return;
    }

    const postIds = rawPosts.map(p => p.id);
    const userIds = [...new Set(rawPosts.map(p => p.user_id))];

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

    const { data: allLikes } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    const likeCountMap = new Map<string, number>();
    const myLikedSet = new Set<string>();
    (allLikes ?? []).forEach(like => {
      likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) ?? 0) + 1);
      if (like.user_id === user.id) {
        myLikedSet.add(like.post_id);
      }
    });

    const { data: allComments } = await (supabase
      .from('post_comments')
      .select('post_id')
      .in('post_id', postIds) as unknown as Promise<{ data: { post_id: string }[] | null }>);

    const commentCountMap = new Map<string, number>();
    (allComments ?? []).forEach(c => {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) ?? 0) + 1);
    });

    const assembled: PostWithAuthor[] = rawPosts
      .map(post => {
        const authorProfile = profileByUserId.get(post.user_id);
        if (!authorProfile) return null;
        return {
          id: post.id,
          title: (post as { title?: string | null }).title ?? null,
          content: post.content,
          image_urls: (post as { image_urls?: string[] }).image_urls ?? [],
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
          comment_count: commentCountMap.get(post.id) ?? 0,
        };
      })
      .filter((p): p is PostWithAuthor => p !== null);

    setPosts(assembled);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts;

  useEffect(() => {
    const state = location.state as { checkInPrompt?: string; openCompose?: boolean } | null;
    if (state?.checkInPrompt) {
      setCheckInPrompt(state.checkInPrompt);
      setNewPost('');
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

  const fetchComments = useCallback(async (postId: string) => {
    setCommentLoading(prev => ({ ...prev, [postId]: true }));

    type RawComment = { id: string; post_id: string; user_id: string; content: string; created_at: string };
    const { data: rawComments } = await (supabase
      .from('post_comments')
      .select('id, post_id, user_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true }) as unknown as Promise<{ data: RawComment[] | null }>);

    if (!rawComments || rawComments.length === 0) {
      setComments(prev => ({ ...prev, [postId]: [] }));
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
      return;
    }

    const userIds = [...new Set(rawComments.map(c => c.user_id))];
    const { data: authorProfiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url, avatar_position_x, avatar_position_y, role')
      .in('user_id', userIds);

    const profileByUserId = new Map<string, {
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

    const assembled: PostComment[] = rawComments
      .map(c => {
        const author = profileByUserId.get(c.user_id);
        if (!author) return null;
        return {
          id: c.id,
          post_id: c.post_id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          author: {
            first_name: author.first_name,
            last_name: author.last_name,
            avatar_url: author.avatar_url,
            avatar_position_x: author.avatar_position_x,
            avatar_position_y: author.avatar_position_y,
            role: roleLabel(author.role),
          },
        };
      })
      .filter((c): c is PostComment => c !== null);

    setComments(prev => ({ ...prev, [postId]: assembled }));
    setCommentLoading(prev => ({ ...prev, [postId]: false }));
  }, []);

  const toggleComments = useCallback((postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        if (!comments[postId]) {
          fetchComments(postId);
        }
      }
      return next;
    });
  }, [comments, fetchComments]);

  const handleSubmitComment = useCallback(async (postId: string) => {
    const content = (commentInputsRef.current[postId] ?? '').trim();
    if (!content || !user || !profile) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    type InsertedComment = { id: string; post_id: string; user_id: string; content: string; created_at: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data: inserted, error } = await db
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select('id, post_id, user_id, content, created_at')
      .single() as { data: InsertedComment | null; error: unknown };

    if (!error && inserted) {
      const newComment: PostComment = {
        id: inserted.id,
        post_id: inserted.post_id,
        user_id: inserted.user_id,
        content: inserted.content,
        created_at: inserted.created_at,
        author: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url ?? null,
          avatar_position_x: profile.avatar_position_x ?? 0,
          avatar_position_y: profile.avatar_position_y ?? 0,
          role: roleLabel(profile.role),
        },
      };
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), newComment],
      }));
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
      ));
      commentInputsRef.current = { ...commentInputsRef.current, [postId]: '' };
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    }

    setSubmittingComment(prev => ({ ...prev, [postId]: false }));
  }, [user, profile]);

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
    setDeletingPostId(null);
    setPostMenuId(null);
  };

  const handleEditPost = async () => {
    if (!editingPost || !editContent.trim()) return;
    const { error } = await supabase
      .from('posts')
      .update({ content: editContent.trim() } as never)
      .eq('id', editingPost.id);
    if (!error) {
      setPosts(prev => prev.map(p =>
        p.id === editingPost.id ? { ...p, content: editContent.trim() } : p
      ));
    }
    setEditingPost(null);
    setEditContent('');
  };

  const handleSharePost = async (post: PostWithAuthor) => {
    const title = post.title || 'Iron Sharpens Iron';
    const text = post.title ? `${post.title}\n\n${post.content}` : post.content;
    const url = window.location.href;
    setPostMenuId(null);
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert('Post copied to clipboard!');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Post copied to clipboard!');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    const newImages: SelectedImage[] = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedImages(prev => [...prev, ...newImages].slice(0, 10));
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePost = async () => {
    if (!newPost.trim() && selectedImages.length === 0) return;
    if (!user || !profile) return;

    const uploadedUrls: string[] = [];
    for (const img of selectedImages) {
      const ext = img.file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, img.file, { contentType: img.file.type });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    type InsertedPost = { id: string; group_id: string | null; user_id: string; title: string | null; content: string; image_urls: string[]; created_at: string };
    const { data: insertedRaw, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: checkInPrompt || null,
        content: newPost.trim(),
        group_id: null,
        image_urls: uploadedUrls,
      } as never)
      .select('id, group_id, user_id, title, content, image_urls, created_at')
      .single();
    const inserted = insertedRaw as unknown as InsertedPost | null;

    if (!error && inserted) {
      const newPostObj: PostWithAuthor = {
        id: inserted.id,
        title: inserted.title ?? null,
        content: inserted.content,
        image_urls: inserted.image_urls ?? [],
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
        comment_count: 0,
      };
      setPosts(prev => [newPostObj, ...prev]);
    }

    selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
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
          <div className="space-y-4 pt-4 px-4">
            {filteredPosts.map((post) => {
              const authorName = `${post.author.first_name} ${post.author.last_name}`;
              const isSaved = savedPosts.has(post.id);
              const showHeartAnimation = likeAnimation === post.id;
              const isCommentsExpanded = expandedComments.has(post.id);
              const postComments = comments[post.id] ?? [];
              const isLoadingComments = commentLoading[post.id] ?? false;

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
                    <button
                      onClick={() => setPostMenuId(postMenuId === post.id ? null : post.id)}
                      className="p-2 -mr-2 text-iron-400 hover:text-iron-600 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Text */}
                  <div
                    className="px-4 pb-3"
                    onDoubleClick={() => handleDoubleTap(post.id, post.liked_by_me)}
                  >
                    {post.title && (
                      <p className="font-semibold text-iron-900 text-[15px] leading-snug mb-1">
                        {post.title}
                      </p>
                    )}
                    <p className="text-iron-800 text-[15px] leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {post.image_urls.length > 0 && (
                    <div className={`grid gap-0.5 ${
                      post.image_urls.length === 1 ? 'grid-cols-1' :
                      post.image_urls.length === 2 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
                      {post.image_urls.map((url, i) => (
                        <div
                          key={i}
                          className={`overflow-hidden bg-iron-100 ${
                            post.image_urls.length === 1 ? 'aspect-[4/3]' : 'aspect-square'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Post image ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
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
                              post.liked_by_me
                                ? 'text-coral-500 fill-coral-500'
                                : 'text-iron-600'
                            }`}
                          />
                          <span className="text-sm text-iron-600">{post.like_count}</span>
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-iron-50 transition-colors"
                        >
                          <MessageCircle className={`w-5 h-5 ${isCommentsExpanded ? 'text-brand-500' : 'text-iron-600'}`} />
                          <span className={`text-sm ${isCommentsExpanded ? 'text-brand-500' : 'text-iron-600'}`}>
                            {post.comment_count}
                          </span>
                          {isCommentsExpanded
                            ? <ChevronUp className="w-3.5 h-3.5 text-iron-400" />
                            : <ChevronDown className="w-3.5 h-3.5 text-iron-400" />
                          }
                        </button>
                        <button
                          onClick={() => handleSharePost(post)}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-iron-50 transition-colors"
                        >
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

                  {/* Comments Section */}
                  {isCommentsExpanded && (
                    <div className="border-t border-iron-100">
                      {isLoadingComments ? (
                        <div className="px-4 py-3 space-y-3">
                          {[1, 2].map(i => (
                            <div key={i} className="flex gap-2 animate-pulse">
                              <div className="w-7 h-7 rounded-full bg-iron-200 flex-shrink-0" />
                              <div className="flex-1 space-y-1">
                                <div className="h-3 bg-iron-200 rounded w-1/4" />
                                <div className="h-3 bg-iron-100 rounded w-3/4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 pt-3 pb-1 space-y-3 max-h-64 overflow-y-auto">
                          {postComments.length === 0 ? (
                            <p className="text-sm text-iron-400 text-center py-2">No comments yet. Be the first!</p>
                          ) : (
                            postComments.map(comment => (
                              <div key={comment.id} className="flex gap-2 items-start">
                                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5 bg-iron-200">
                                  {comment.author.avatar_url ? (
                                    <img
                                      src={comment.author.avatar_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      style={{ objectPosition: `${50 + comment.author.avatar_position_x}% ${50 + comment.author.avatar_position_y}%` }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 text-[10px] font-semibold">
                                      {comment.author.first_name?.[0] ?? '?'}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-iron-50 rounded-2xl px-3 py-2">
                                    <span className="text-xs font-semibold text-iron-900 mr-1">
                                      {comment.author.first_name} {comment.author.last_name}
                                    </span>
                                    <span className="text-sm text-iron-700">{comment.content}</span>
                                  </div>
                                  <p className="text-xs text-iron-400 mt-0.5 pl-3">{formatTimeAgo(comment.created_at)}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2 px-4 py-3 border-t border-iron-50" onClick={e => e.stopPropagation()}>
                        <div className="flex-1 flex items-center gap-2 bg-iron-50 rounded-full px-3 py-1.5">
                          <input
                            type="text"
                            value={commentInputs[post.id] ?? ''}
                            onChange={e => {
                              commentInputsRef.current = { ...commentInputsRef.current, [post.id]: e.target.value };
                              setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }));
                            }}
                            onKeyDown={e => {
                              e.stopPropagation();
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment(post.id);
                              }
                            }}
                            onClick={e => e.stopPropagation()}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent text-[16px] text-iron-800 placeholder:text-iron-400 outline-none"
                          />
                          <button
                            onClick={() => handleSubmitComment(post.id)}
                            disabled={!(commentInputs[post.id] ?? '').trim() || submittingComment[post.id]}
                            className={`flex-shrink-0 transition-colors ${
                              (commentInputs[post.id] ?? '').trim()
                                ? 'text-brand-500 hover:text-brand-600'
                                : 'text-iron-300'
                            }`}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

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

      {/* Post Action Bottom Sheet */}
      {postMenuId && (() => {
        const post = posts.find(p => p.id === postMenuId);
        if (!post) return null;
        const isOwner = post.user_id === user?.id;
        return (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setPostMenuId(null)}>
            <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-iron-200 rounded-full mx-auto mt-3 mb-2" />
              <div className="px-4 pb-4 space-y-1">
                <button
                  onClick={() => handleSharePost(post)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-iron-50 text-left transition-colors"
                >
                  <Share2 className="w-5 h-5 text-iron-500" />
                  <span className="text-iron-800 font-medium">Share post</span>
                </button>
                {isOwner && (
                  <>
                    <button
                      onClick={() => { setEditingPost(post); setEditContent(post.content); setPostMenuId(null); }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-iron-50 text-left transition-colors"
                    >
                      <Pencil className="w-5 h-5 text-iron-500" />
                      <span className="text-iron-800 font-medium">Edit post</span>
                    </button>
                    <button
                      onClick={() => { setDeletingPostId(post.id); setPostMenuId(null); }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-50 text-left transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <span className="text-red-600 font-medium">Delete post</span>
                    </button>
                  </>
                )}
                {!isOwner && (
                  <button
                    onClick={() => { setReportingPostId(post.id); setPostMenuId(null); }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-50 text-left transition-colors"
                  >
                    <Flag className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-medium">Report post</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-iron-900 mb-2">Delete this post?</h3>
            <p className="text-iron-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPostId(null)}
                className="flex-1 py-2.5 rounded-xl border border-iron-200 text-iron-700 font-medium hover:bg-iron-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deletingPostId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-2xl max-h-[70vh] flex flex-col mb-16">
            <div className="flex items-center justify-between px-4 py-3 border-b border-iron-100 flex-shrink-0">
              <button
                onClick={() => { setEditingPost(null); setEditContent(''); }}
                className="text-iron-600 font-medium"
              >
                Cancel
              </button>
              <h3 className="font-semibold text-iron-900">Edit Post</h3>
              <button
                onClick={handleEditPost}
                disabled={!editContent.trim()}
                className={`font-semibold transition-colors ${editContent.trim() ? 'text-brand-500' : 'text-brand-300'}`}
              >
                Save
              </button>
            </div>
            {editingPost.title && (
              <div className="px-4 py-3 bg-iron-50 border-b border-iron-100 flex-shrink-0">
                <p className="text-sm font-semibold text-iron-700">{editingPost.title}</p>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full text-[16px] text-iron-800 placeholder:text-iron-400 border-0 focus:ring-0 resize-none min-h-[120px] outline-none"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Report Confirmation */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-iron-900 mb-2">Report this post?</h3>
            <p className="text-iron-500 text-sm mb-6">An admin will review this post for community guideline violations.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setReportingPostId(null)}
                className="flex-1 py-2.5 rounded-xl border border-iron-200 text-iron-700 font-medium hover:bg-iron-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setReportingPostId(null)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col mb-16">
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

            {checkInPrompt && (
              <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-teal-50 border-b border-brand-100">
                <p className="text-sm font-medium text-brand-600">Today's Prompt:</p>
                <p className="text-brand-800 font-semibold">{checkInPrompt}</p>
              </div>
            )}

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

                {selectedImages.length > 0 && (
                  <div className="mt-4">
                    <div className={`grid gap-2 ${
                      selectedImages.length === 1 ? 'grid-cols-1' :
                      selectedImages.length === 2 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
                      {selectedImages.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-iron-100">
                          <img
                            src={img.preview}
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
