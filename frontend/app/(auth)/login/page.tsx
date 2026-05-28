"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((s: any) => s.login);
  const isLoading = useAuthStore((s: any) => s.isLoading);
  const error = useAuthStore((s: any) => s.error);
  const clearError = useAuthStore((s: any) => s.clearError);
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#EAEDF2] shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-8 md:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
      {/* Decorative top border line with brand color gradient */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-dark via-brand-orange to-brand-dark" />

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-dark to-[#3A3A3D] flex items-center justify-center shadow-lg shadow-brand-dark/10 mb-4 relative group">
          <div className="absolute inset-0 rounded-2xl bg-brand-orange opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <svg className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight font-sans">Welcome Back</h1>
        <p className="text-sm font-semibold text-brand-text-muted mt-1">Sign in to manage your VedaAI assessments</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm mb-6 flex items-start gap-2 animate-fadeIn">
          <ShieldCheck className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        {/* Email input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-brand-dark font-sans">Email Address</label>
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-brand-text-muted group-focus-within:text-brand-orange transition-colors duration-200">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              required
              type="email"
              placeholder="you@example.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full rounded-2xl border border-brand-border bg-white p-3.5 pl-12 text-sm font-medium transition-all duration-200 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 focus:outline-none placeholder:text-gray-400 text-brand-dark" 
            />
          </div>
        </div>

        {/* Password input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-brand-dark font-sans">Password</label>
            <a className="text-xs text-brand-text-muted hover:text-brand-orange hover:underline font-medium cursor-pointer transition-colors duration-150">
              Forgot password?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-3.5 text-brand-text-muted group-focus-within:text-brand-orange transition-colors duration-200">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              required
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full rounded-2xl border border-brand-border bg-white p-3.5 pl-12 pr-12 text-sm font-medium transition-all duration-200 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 focus:outline-none placeholder:text-gray-400 text-brand-dark" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(s => !s)} 
              className="absolute right-4 top-3.5 text-brand-text-muted hover:text-brand-orange transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-2 rounded-full bg-brand-dark hover:bg-brand-orange active:scale-[0.98] text-white py-3.5 px-4 font-semibold text-sm transition-all duration-200 shadow-md shadow-brand-dark/10 hover:shadow-brand-orange/20 cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
              <span>Sign In</span>
            </>
          )}
        </button>

        {/* Footer Navigation */}
        <p className="text-center text-sm text-brand-text-muted mt-6">
          Don't have an account?{' '}
          <a href="/register" className="text-brand-dark hover:text-brand-orange font-bold transition-colors duration-200 underline decoration-2 decoration-brand-orange/30 hover:decoration-brand-orange">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
