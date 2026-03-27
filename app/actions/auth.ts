"use server";

import { getAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signInWithEmail(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const auth = getAuth();
  if (!auth) return { error: "Sign-in is not configured." };

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!email || !password) return { error: "Email and password are required." };

  const { error } = await auth.signIn.email({ email, password });
  if (error) return { error: error.message ?? "Could not sign in." };
  redirect("/");
}

export async function signUpWithEmail(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const auth = getAuth();
  if (!auth) return { error: "Sign-up is not configured." };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  const { error } = await auth.signUp.email({ name, email, password });
  if (error) return { error: error.message ?? "Could not create account." };
  redirect("/");
}

export async function signOut() {
  const auth = getAuth();
  if (auth) await auth.signOut();
  redirect("/auth/sign-in");
}
