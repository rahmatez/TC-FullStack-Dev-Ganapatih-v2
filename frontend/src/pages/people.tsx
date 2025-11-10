import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import { usersAPI, followAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Toast from '@/components/Toast';

interface User {
  id: number;
  username: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isSelf?: boolean;
}

interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info';
}

function People() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const fetchUsers = async (pageNum = 1, searchTerm = '') => {
    try {
      const response = await usersAPI.getAll(pageNum, 10, searchTerm);
      const { users: newUsers, totalPages } = response.data;
      
      if (pageNum === 1) {
        setUsers(newUsers);
      } else {
        setUsers((prev) => [...prev, ...newUsers]);
      }
      
      setHasMore(pageNum < totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search);
  }, [search]);

  const handleFollow = async (userId: number) => {
    try {
      await followAPI.follow(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing: true, followersCount: u.followersCount + 1 } : u))
      );
      const username = users.find(u => u.id === userId)?.username;
      setToast({ message: `You are now following ${username}`, type: 'success' });
    } catch (error) {
      console.error('Failed to follow user:', error);
      setToast({ message: 'Failed to follow user', type: 'error' });
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await followAPI.unfollow(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing: false, followersCount: u.followersCount - 1 } : u))
      );
      const username = users.find(u => u.id === userId)?.username;
      setToast({ message: `Unfollowed ${username}`, type: 'info' });
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      setToast({ message: 'Failed to unfollow user', type: 'error' });
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, search);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-9 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-80"></div>
          </div>

          {/* Search bar skeleton */}
          <div className="mb-6">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* User cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover People</h1>
          <p className="text-gray-600">Find and connect with other users</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users by username..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">No users found</p>
            <p className="text-sm text-gray-400">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((otherUser) => (
              <div 
                key={otherUser.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-sm">
                    {otherUser.username.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {otherUser.username}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{otherUser.postsCount} posts</span>
                      <span>·</span>
                      <span>{otherUser.followersCount} followers</span>
                      <span>·</span>
                      <span>{otherUser.followingCount} following</span>
                    </div>
                  </div>
                  
                  {/* Follow Button */}
                  {!otherUser.isSelf && (
                    <div className="flex-shrink-0">
                      {otherUser.isFollowing ? (
                        <button
                          onClick={() => handleUnfollow(otherUser.id)}
                          className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
                        >
                          Following
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(otherUser.id)}
                          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Self Badge */}
                  {otherUser.isSelf && (
                    <div className="flex-shrink-0">
                      <span className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                        You
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
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
                    'Load More Users'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
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

export default withAuth(People);
