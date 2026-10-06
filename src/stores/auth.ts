import { defineStore } from 'pinia';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { normalizeRole, type AppRole } from '../utils/authRoles';
import {
  createSessionMetadata,
  getSessionExpiryReason,
  parseSessionMetadata,
  SESSION_METADATA_KEY,
  stringifySessionMetadata,
  touchSessionMetadata,
  type SessionExpiryReason,
  type SessionMetadata,
} from '../utils/sessionTimeout';

export interface UserProfile {
  id: string;
  full_name: string;
  role: AppRole | string;
  division?: string | null;
  team?: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

const friendlyAuthError = (message?: string) => {
  const text = message?.toLowerCase() ?? '';
  if (text.includes('invalid login') || text.includes('invalid credentials')) return 'Email atau password tidak sesuai.';
  if (text.includes('email not confirmed')) return 'Email belum dikonfirmasi. Silakan cek inbox email Anda.';
  if (text.includes('user already registered')) return 'Email ini sudah terdaftar. Silakan sign in.';
  if (text.includes('password')) return 'Password belum memenuhi ketentuan keamanan.';
  return 'Proses autentikasi belum berhasil. Silakan coba lagi.';
};

const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'] as const;
const activityWriteThrottleMs = 60 * 1000;
const sessionCheckIntervalMs = 30 * 1000;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    session: null as Session | null,
    profile: null as UserProfile | null,
    loading: false,
    initialized: false,
    sessionExpiredReason: null as SessionExpiryReason | null,
    sessionTimerId: null as number | null,
    sessionActivityBound: false,
    lastActivityWriteAt: 0,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.session?.user),
    displayName: (state) => state.profile?.full_name || state.user?.email || 'HCM User',
    displayRole: (state) => normalizeRole(state.profile?.role),
  },
  actions: {
    async initializeAuth() {
      if (this.initialized) return;
      this.loading = true;
      const { data } = await supabase.auth.getSession();
      this.session = data.session;
      this.user = data.session?.user ?? null;
      if (this.user) {
        await this.fetchProfile();
        this.startSessionTracking();
        await this.enforceSessionTimeout();
      }
      supabase.auth.onAuthStateChange(async (_event, session) => {
        this.session = session;
        this.user = session?.user ?? null;
        this.profile = null;
        if (this.user) {
          await this.fetchProfile();
          this.startSessionTracking();
          await this.enforceSessionTimeout();
        } else {
          this.stopSessionTracking();
        }
      });
      this.initialized = true;
      this.loading = false;
    },
    async fetchProfile() {
      if (!this.user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', this.user.id).maybeSingle();
      if (!error && data) {
        this.profile = {
          ...(data as UserProfile),
          role: normalizeRole((data as UserProfile).role),
        };
      } else if (!error) {
        this.profile = null;
      }
      return this.profile;
    },
    async signIn(email: string, password: string) {
      this.loading = true;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(friendlyAuthError(error.message));
        this.session = data.session;
        this.user = data.user;
        await this.fetchProfile();
        this.startSessionTracking(true);
        return data;
      } finally {
        this.loading = false;
      }
    },
    async signUp(fullName: string, email: string, password: string) {
      this.loading = true;
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/sign-in`,
          },
        });
        if (error) throw new Error(friendlyAuthError(error.message));
        return data;
      } finally {
        this.loading = false;
      }
    },
    async signOut() {
      this.loading = true;
      try {
        await supabase.auth.signOut();
        this.session = null;
        this.user = null;
        this.profile = null;
        this.stopSessionTracking();
      } finally {
        this.loading = false;
      }
    },
    async resetPassword(email: string) {
      this.loading = true;
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw new Error(friendlyAuthError(error.message));
      } finally {
        this.loading = false;
      }
    },
    async updatePassword(password: string) {
      this.loading = true;
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(friendlyAuthError(error.message));
      } finally {
        this.loading = false;
      }
    },
    getSessionStorage() {
      if (typeof window === 'undefined') return null;
      return window.localStorage;
    },
    readSessionMetadata(): SessionMetadata | null {
      return parseSessionMetadata(this.getSessionStorage()?.getItem(SESSION_METADATA_KEY) ?? null);
    },
    writeSessionMetadata(metadata: SessionMetadata) {
      this.getSessionStorage()?.setItem(SESSION_METADATA_KEY, stringifySessionMetadata(metadata));
    },
    clearSessionMetadata() {
      this.getSessionStorage()?.removeItem(SESSION_METADATA_KEY);
      this.lastActivityWriteAt = 0;
    },
    startSessionTracking(resetStartedAt = false) {
      if (typeof window === 'undefined') return;

      const now = Date.now();
      const existing = this.readSessionMetadata();
      const metadata = resetStartedAt || !existing ? createSessionMetadata(now) : existing;
      this.writeSessionMetadata(metadata);
      this.lastActivityWriteAt = metadata.lastActivityAt;

      if (!this.sessionActivityBound) {
        activityEvents.forEach((eventName) => {
          window.addEventListener(eventName, this.recordActivity, { passive: true });
        });
        document.addEventListener('visibilitychange', this.recordActivity, { passive: true });
        this.sessionActivityBound = true;
      }

      if (!this.sessionTimerId) {
        this.sessionTimerId = window.setInterval(() => {
          void this.enforceSessionTimeout({ redirect: true });
        }, sessionCheckIntervalMs);
      }
    },
    recordActivity() {
      if (!this.isAuthenticated) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

      const now = Date.now();
      if (now - this.lastActivityWriteAt < activityWriteThrottleMs) return;

      const metadata = this.readSessionMetadata() ?? createSessionMetadata(now);
      this.writeSessionMetadata(touchSessionMetadata(metadata, now));
      this.lastActivityWriteAt = now;
    },
    stopSessionTracking() {
      if (typeof window !== 'undefined' && this.sessionTimerId) {
        window.clearInterval(this.sessionTimerId);
      }
      this.sessionTimerId = null;
      this.clearSessionMetadata();
    },
    async enforceSessionTimeout(options: { redirect?: boolean } = {}) {
      if (!this.isAuthenticated) return null;
      const reason = getSessionExpiryReason(this.readSessionMetadata(), Date.now());
      if (!reason) return null;
      await this.expireSession(reason, Boolean(options.redirect));
      return reason;
    },
    async expireSession(reason: SessionExpiryReason, redirect = false) {
      this.sessionExpiredReason = reason;
      await supabase.auth.signOut();
      this.session = null;
      this.user = null;
      this.profile = null;
      this.stopSessionTracking();

      if (redirect && typeof window !== 'undefined') {
        const session = reason === 'idle' ? 'idle-timeout' : 'expired';
        const target = `/sign-in?session=${session}`;
        if (window.location.pathname !== '/sign-in') window.location.assign(target);
      }
    },
  },
});
