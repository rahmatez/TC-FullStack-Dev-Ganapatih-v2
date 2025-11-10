import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedPage from '@/pages/feed';

jest.mock('@/components/withAuth', () => (Component: any) => Component);

jest.mock('@/components/CreatePost', () => ({ onPostCreated }: { onPostCreated?: () => void }) => (
  <button data-testid="mock-create-post" onClick={() => onPostCreated?.()}>
    Mock Create Post
  </button>
));

jest.mock('@/components/FollowSuggestions', () => ({ onFollowChange }: { onFollowChange?: () => void }) => (
  <button data-testid="mock-follow-suggestions" onClick={() => onFollowChange?.()}>
    Mock Follow Suggestions
  </button>
));

jest.mock('@/components/PostCard', () => ({ post }: { post: { id: number; content: string } }) => (
  <div data-testid={`post-${post.id}`}>{post.content}</div>
));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  feedAPI: {
    getFeed: jest.fn(),
  },
}));

import { useAuth } from '@/contexts/AuthContext';
import { feedAPI } from '@/lib/api';

describe('Feed page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'alice' },
      isAuthenticated: true,
      loading: false,
    });
  });

  it('shows empty state when no posts are returned', async () => {
    (feedAPI.getFeed as jest.Mock).mockResolvedValueOnce({
      data: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        posts: [],
        message: 'You are not following anyone yet.',
      },
    });

    render(<FeedPage />);

    expect(await screen.findByText('Your feed is empty')).toBeInTheDocument();
  });

  it('loads posts and appends more results when "Load More" is clicked', async () => {
    (feedAPI.getFeed as jest.Mock).mockImplementation((page: number) => {
      if (page === 1) {
        return Promise.resolve({
          data: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 2,
            posts: [
              { id: 1, userId: 2, username: 'bob', content: 'First post', createdAt: '2025-11-10T10:00:00Z' },
            ],
          },
        });
      }

      return Promise.resolve({
        data: {
          page: 2,
          limit: 10,
          total: 2,
          totalPages: 2,
          posts: [
            { id: 2, userId: 3, username: 'charlie', content: 'Second post', createdAt: '2025-11-10T09:00:00Z' },
          ],
        },
      });
    });

    const user = userEvent.setup();
    render(<FeedPage />);

    expect(await screen.findByTestId('post-1')).toHaveTextContent('First post');

    await user.click(screen.getByRole('button', { name: /load more posts/i }));

    await waitFor(() => {
      expect(feedAPI.getFeed).toHaveBeenCalledWith(2, 10);
      expect(screen.getByTestId('post-2')).toHaveTextContent('Second post');
    });
  });

  it('refreshes the feed after a new post is created', async () => {
    (feedAPI.getFeed as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          posts: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          posts: [
            { id: 3, userId: 2, username: 'bob', content: 'Brand new post', createdAt: '2025-11-10T12:00:00Z' },
          ],
        },
      });

    const user = userEvent.setup();
    render(<FeedPage />);

    expect(await screen.findByText('Your feed is empty')).toBeInTheDocument();

    await user.click(screen.getByTestId('mock-create-post'));

    await waitFor(() => {
      expect(feedAPI.getFeed).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('post-3')).toHaveTextContent('Brand new post');
    });
  });
});
