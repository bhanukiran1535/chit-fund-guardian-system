import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

let csrfToken: string | null = null;

export async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/csrf-token`, { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
