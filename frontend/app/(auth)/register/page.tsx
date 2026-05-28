"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const register = useAuthStore((s: any) => s.register);
  const isLoading = useAuthStore((s: any) => s.isLoading);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return alert('Passwords do not match');
    try {
      await register(name, email, password);
      router.push('/');
    } catch (e) {
      // handled in store
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAEDF2] shadow-sm p-8">
      <h1 className="text-2xl font-extrabold mb-2">Create Account</h1>
      <p className="text-xs font-semibold text-gray-500 mb-6">Create your VedaAI account</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-2xl border border-[#E9ECEF] p-3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-2xl border border-[#E9ECEF] p-3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-2xl border border-[#E9ECEF] p-3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1 w-full rounded-2xl border border-[#E9ECEF] p-3" />
        </div>

        <button type="submit" className="w-full rounded-full bg-brand-dark hover:bg-brand-orange text-white py-3">
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray-500">Already have an account? <a href="/login" className="text-brand-dark font-semibold">Sign in</a></p>
      </form>
    </div>
  );
}
