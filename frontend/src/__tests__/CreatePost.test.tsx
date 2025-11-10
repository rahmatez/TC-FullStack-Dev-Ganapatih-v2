import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePost from '@/components/CreatePost';

jest.mock('@/lib/api', () => ({
  postsAPI: {
    create: jest.fn(),
  },
}));

import { postsAPI } from '@/lib/api';

describe('CreatePost component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows and updates the character counter as the user types', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);

    expect(screen.getByText('Max 200 characters')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await user.type(textarea, 'Hello world');

    expect(screen.getByText('189')).toBeInTheDocument();
  });

  it('displays validation error when submitting empty content', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);

    const submitButton = screen.getByRole('button', { name: /publish post/i });
    const form = submitButton.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(await screen.findByText('Content is required')).toBeInTheDocument();
    expect((postsAPI.create as jest.Mock).mock.calls.length).toBe(0);
  });

  it('shows an error when content exceeds 200 characters', async () => {
    const user = userEvent.setup();
    render(<CreatePost />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await user.type(textarea, 'a'.repeat(201));
    const submitButton = screen.getByRole('button', { name: /publish post/i });
    const form = submitButton.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(await screen.findByText('Content must not exceed 200 characters')).toBeInTheDocument();
    expect((postsAPI.create as jest.Mock).mock.calls.length).toBe(0);
  });

  it('submits valid content and triggers callbacks', async () => {
    const user = userEvent.setup();
    const onPostCreated = jest.fn();
    (postsAPI.create as jest.Mock).mockResolvedValueOnce({});

    render(<CreatePost onPostCreated={onPostCreated} />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await user.type(textarea, 'New post content');
    await user.click(screen.getByRole('button', { name: /publish post/i }));

    await waitFor(() => {
      expect(postsAPI.create).toHaveBeenCalledWith('New post content');
    });

    expect(onPostCreated).toHaveBeenCalled();
    expect(textarea).toHaveValue('');
  });
});
