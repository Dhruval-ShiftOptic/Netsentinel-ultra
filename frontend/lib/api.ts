"use client";
const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('ns_token') || '';
}
export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ns_token', token);
}
export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ns_token');
}
export async function api(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { ...options, headers, cache: 'no-store' });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      clearToken();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}
export const apiBase = base;
