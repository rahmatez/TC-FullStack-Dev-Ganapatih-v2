import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, postsAPI } from '@/lib/api';

interface UserProfile {
  id: number;
  username: string;
  createdAt: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface Post {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getMe();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchPosts = async (pageNum = 1) => {
    try {
      const response = await postsAPI.getMyPosts(pageNum, 10);
      const { posts: newPosts, totalPages } = response.data;
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      
      setHasMore(pageNum < totalPages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPosts(1);
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handlePostDeleted = () => {
    setPage(1);
    fetchPosts(1);
    fetchProfile(); // Refresh profile to update posts count
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6 animate-pulse" data-testid="skeleton-profile">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar skeleton */}
              <div className="w-24 h-24 rounded-full bg-gray-200"></div>
              
              {/* Profile info skeleton */}
              <div className="flex-1 text-center sm:text-left w-full">
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto sm:mx-0 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto sm:mx-0 mb-4"></div>
                
                {/* Stats skeleton */}
                <div className="flex items-center justify-center sm:justify-start gap-6 mt-6">
                  <div className="text-center sm:text-left">
                    <div className="h-8 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center sm:text-left">
                    <div className="h-8 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center sm:text-left">
                    <div className="h-8 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts section title skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>

          {/* Post skeletons */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        {profile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.username}</h1>
                <p className="text-sm text-gray-500 mb-4">
                  Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                
                {/* Stats */}
                <div className="flex items-center justify-center sm:justify-start gap-6 mt-6">
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold text-gray-900">{profile.postsCount}</div>
                    <div className="text-sm text-gray-500">Posts</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold text-gray-900">{profile.followersCount}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold text-gray-900">{profile.followingCount}</div>
                    <div className="text-sm text-gray-500">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('all')}
              type="button"
              aria-pressed={activeTab === 'all'}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              type="button"
              aria-pressed={activeTab === 'recent'}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'recent'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recent
            </button>
          </div>
        </div>
        
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4" data-testid="empty-state-icon">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">No posts yet</p>
            <p className="text-sm text-gray-400">Share your first post to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts
              .filter((post) => {
                if (activeTab === 'recent') {
                  const threeDaysAgo = new Date();
                  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                  return new Date(post.createdAt) > threeDaysAgo;
                }
                return true;
              })
              .map((post) => (
                <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
              ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : (
                    'Load More Posts'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(Profile);
