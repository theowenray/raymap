import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, beforeEach, afterEach, expect, vi, type SpyInstance } from 'vitest';
import * as Router from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';

const navigateMock = vi.fn();
let navigateSpy: SpyInstance | null = null;

describe('Login page', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    navigateSpy = vi.spyOn(Router, 'useNavigate').mockReturnValue(navigateMock);
  });

  afterEach(() => {
    navigateSpy?.mockRestore();
    vi.clearAllMocks();
    // @ts-expect-error - cleanup testing fetch stub
    delete global.fetch;
  });

  it('redirects to the map after successful login', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { username: 'planner' } })
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <Router.MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router.MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'planner' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'raymap' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/map', { replace: true });
    });
  });

  it('shows an error message when the login fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <Router.MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router.MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'creds' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });
  });
});
