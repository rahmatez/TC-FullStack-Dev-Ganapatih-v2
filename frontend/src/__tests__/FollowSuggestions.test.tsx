import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FollowSuggestions from '@/components/FollowSuggestions';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  usersAPI: {
    getAll: jest.fn(),
  },
  followAPI: {
    follow: jest.fn(),
    unfollow: jest.fn(),
  },
}));

import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, followAPI } from '@/lib/api';

describe('FollowSuggestions component', () => {
  const mockUser = { id: 1, username: 'currentUser' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('fetches suggestions and filters out current user', async () => {
    (usersAPI.getAll as jest.Mock).mockResolvedValueOnce({
      data: {
        users: [
          { id: 1, username: 'currentUser', postsCount: 1, followersCount: 1, followingCount: 1 },
          { id: 2, username: 'alice', postsCount: 3, followersCount: 5, followingCount: 2 },
        ],
      },
    });

    render(<FollowSuggestions />);

    await waitFor(() => expect(usersAPI.getAll).toHaveBeenCalledTimes(1));

    expect(screen.queryByText('currentUser')).not.toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('calls follow API and updates button state', async () => {
    (usersAPI.getAll as jest.Mock).mockResolvedValueOnce({
      data: {
        users: [
          { id: 2, username: 'alice', postsCount: 3, followersCount: 5, followingCount: 2, isFollowing: false },
        ],
      },
    });

    const onFollowChange = jest.fn();
    const user = userEvent.setup();

    render(<FollowSuggestions onFollowChange={onFollowChange} />);

    const followButton = await screen.findByRole('button', { name: 'Follow' });
    await user.click(followButton);

    await waitFor(() => {
      expect(followAPI.follow).toHaveBeenCalledWith(2);
      expect(onFollowChange).toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: 'Following' })).toBeInTheDocument();
  });

  it('calls unfollow API and updates button state', async () => {
    (usersAPI.getAll as jest.Mock).mockResolvedValueOnce({
      data: {
        users: [
          { id: 2, username: 'alice', postsCount: 3, followersCount: 5, followingCount: 2, isFollowing: true },
        ],
      },
    });

    const onFollowChange = jest.fn();
    const user = userEvent.setup();

    render(<FollowSuggestions onFollowChange={onFollowChange} />);

    const followingButton = await screen.findByRole('button', { name: 'Following' });
    await user.click(followingButton);

    await waitFor(() => {
      expect(followAPI.unfollow).toHaveBeenCalledWith(2);
      expect(onFollowChange).toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });
});
