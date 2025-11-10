import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/pages/login';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

describe('Login page', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isAuthenticated: false,
      loading: false,
    });
  });

  it('prevents submission when fields are empty', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Please fill in all fields')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('submits credentials and navigates to feed on success', async () => {
    const loginMock = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      login: loginMock,
      isAuthenticated: false,
      loading: false,
    });

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('alice', 'password123'));
    expect(pushMock).toHaveBeenCalledWith('/feed');
  });

  it('shows server error messages when login fails', async () => {
    const loginMock = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    (useAuth as jest.Mock).mockReturnValue({
      login: loginMock,
      isAuthenticated: false,
      loading: false,
    });

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
