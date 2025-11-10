import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import FollowSuggestions from '@/components/FollowSuggestions';
import Toast from '@/components/Toast';
import { feedAPI } from '@/lib/api';

interface Post {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info';
}

function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async (pageNum = 1) => {
    try {
      setError(null);
      const response = await feedAPI.getFeed(pageNum, 10);
      const { posts: newPosts, totalPages } = response.data;
      
      if (pageNum === 1) {
        setPosts(newPosts || []);
      } else {
        setPosts((prev) => [...prev, ...(newPosts || [])]);
      }
      
      setHasMore(pageNum < totalPages);
    } catch (error: any) {
      console.error('Failed to fetch feed:', error);
      setError(error.response?.data?.message || 'Failed to load feed. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handlePostCreated = () => {
    setPage(1);
    fetchFeed(1);
    setToast({ message: 'Post created successfully!', type: 'success' });
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  const handlePostDeleted = () => {
    setPage(1);
    fetchFeed(1);
    setToast({ message: 'Post deleted successfully', type: 'info' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header skeleton */}
              <div className="animate-pulse">
                <div className="h-9 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-64"></div>
              </div>

              {/* CreatePost skeleton */}
              <div className="card p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>

              {/* Post skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
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

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="card p-5 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
            {/* Page Header */}
            <div className="px-2 md:px-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Your Feed</h1>
              <p className="text-sm md:text-base text-gray-600">Stay updated with posts from people you follow</p>
            </div>

            {/* Create Post */}
            <CreatePost onPostCreated={handlePostCreated} />
            
            {/* Error State */}
            {error && (
              <div className="card p-6 border-l-4 border-red-500 bg-red-50">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-1">Error loading feed</h3>
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={() => fetchFeed(1)}
                      className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Posts Section */}
            {!error && posts.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your feed is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Follow some users to see their posts here
                </p>
                <a 
                  href="/people" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Discover people
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="btn btn-secondary px-6"
                    >
                      {loadingMore ? (
                        <span className="flex items-center space-x-2">
                          <span className="spinner w-4 h-4"></span>
                          <span>Loading...</span>
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
          
          {/* Sidebar - Show on top for mobile, sticky on desktop */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <FollowSuggestions onFollowChange={() => fetchFeed(1)} />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default withAuth(Feed);
