"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const login = useAuthStore((s: any) => s.login);
  const isLoading = useAuthStore((s: any) => s.isLoading);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/');
    } catch (e) {
      // handled in store
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAEDF2] shadow-sm p-8">
      <h1 className="text-2xl font-extrabold mb-2">Welcome Back</h1>
      <p className="text-xs font-semibold text-gray-500 mb-6">Sign in to your VedaAI account</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-2xl border border-[#E9ECEF] p-3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-2xl border border-[#E9ECEF] p-3 pr-12" />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-3 text-sm text-gray-500">{show ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <a className="text-sm text-gray-500">Forgot password?</a>
        </div>

        <button type="submit" className="w-full rounded-full bg-brand-dark hover:bg-brand-orange text-white py-3">
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-gray-500">Don't have an account? <a href="/register" className="text-brand-dark font-semibold">Register</a></p>
      </form>
    </div>
  );
}
