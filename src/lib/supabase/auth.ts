import { supabase } from "./client";
import { getURL } from "./utils";

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${getURL()}/auth/callback`,
    }
  });
}

export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: `${getURL()}/auth/callback`,
    }
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
