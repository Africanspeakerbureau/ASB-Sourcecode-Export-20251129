import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import ModalPortal from './ModalPortal.jsx';

export default function AdminLoginModal({ open, onClose, onSubmit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const lastFocused = useRef(null);
  const hasFocusedOnce = useRef(false);

  // focus the username field once when dialog opens
  useEffect(() => {
    if (!open) {
      hasFocusedOnce.current = false;
      return;
    }
    if (!hasFocusedOnce.current) {
      const id = requestAnimationFrame(() => {
        const first = modalRef.current?.querySelector('input[name="username"]');
        first?.focus();
      });
      hasFocusedOnce.current = true;
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // keep focus inside dialog
  const onFocusIn = useCallback(
    (e) => {
      if (!open || !modalRef.current) return;
      const target = e.target;
      if (!modalRef.current.contains(target)) {
        (lastFocused.current || modalRef.current.querySelector('input'))?.focus();
      }
    },
    [open]
  );
  useEffect(() => {
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, [onFocusIn]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onSubmit(username, password);
    if (!ok) {
      setError('Invalid credentials. Please try again.');
    } else {
      setError('');
      setUsername('');
      setPassword('');
    }
  };

  return (
    <ModalPortal onClose={onClose}>
      <div ref={modalRef}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Access the African Speaker Bureau admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={(e) => (lastFocused.current = e.currentTarget)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => (lastFocused.current = e.currentTarget)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModalPortal>
  );
}
