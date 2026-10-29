import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/groups');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string; details?: { path: string; message: string }[] } } } };
      const details = axiosErr?.response?.data?.error?.details;
      if (details?.length) {
        setError(details.map((d) => `${d.path}: ${d.message}`).join('. '));
      } else {
        setError(axiosErr?.response?.data?.error?.message || 'Registration failed. Try a different email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Create Account</h2>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      <Button type="submit" loading={loading} className="w-full">Register</Button>
      <p className="text-sm text-center text-gray-600">
        Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
      </p>
    </form>
  );
}
