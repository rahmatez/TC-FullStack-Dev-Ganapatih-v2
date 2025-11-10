import { useState, useEffect } from 'react';
import { usersAPI, followAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  username: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isSelf?: boolean;
}

interface FollowSuggestionsProps {
  onFollowChange?: () => void;
}

const FollowSuggestions = ({ onFollowChange }: FollowSuggestionsProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll(1, 5);
      // Filter out current user
      const filteredUsers = response.data.users.filter((u: User) => u.id !== user?.id);
      setUsers(filteredUsers);
      
      // Track which users we're following
      const following = new Set<number>(
        filteredUsers.filter((u: User) => u.isFollowing).map((u: User) => u.id)
      );
      setFollowingIds(following);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleFollow = async (userId: number) => {
    try {
      await followAPI.follow(userId);
      setFollowingIds((prev) => new Set(prev).add(userId));
      if (onFollowChange) onFollowChange();
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await followAPI.unfollow(userId);
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      if (onFollowChange) onFollowChange();
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900">Suggested for You</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900">Suggested for You</h2>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">No suggestions available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">Suggested for You</h2>
      </div>
      <div className="space-y-4">
        {users.map((suggestedUser) => (
          <div 
            key={suggestedUser.id} 
            className="flex items-center gap-3 group"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {suggestedUser.username.charAt(0).toUpperCase()}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                {suggestedUser.username}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {suggestedUser.postsCount} posts · {suggestedUser.followersCount} followers
              </p>
            </div>
            
            {/* Follow Button */}
            {followingIds.has(suggestedUser.id) ? (
              <button
                onClick={() => handleUnfollow(suggestedUser.id)}
                className="min-h-[44px] px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 flex-shrink-0 touch-manipulation"
              >
                Following
              </button>
            ) : (
              <button
                onClick={() => handleFollow(suggestedUser.id)}
                className="min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 flex-shrink-0 touch-manipulation"
              >
                Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowSuggestions;
