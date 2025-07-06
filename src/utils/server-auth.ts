import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Server-side cookie helper
export function getServerCookie(name: string): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(name)?.value;
}

// Helper function to check if token is valid (basic check)
function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  try {
    // Basic JWT token validation (check if it's not expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

// Server-side auth check with token validation
export function checkServerAuth(): { isAuthenticated: boolean; token?: string } {
  const token = getServerCookie('auth-token');
  const isValid = token ? isTokenValid(token) : false;
  
  return {
    isAuthenticated: isValid,
    token: isValid ? token : undefined,
  };
}

// Server-side redirect if not authenticated
export function requireServerAuth() {
  const { isAuthenticated } = checkServerAuth();
  
  if (!isAuthenticated) {
    redirect('/auth/login');
  }
}

// Server-side redirect if authenticated (for login page)
export function redirectIfAuthenticated() {
  const { isAuthenticated } = checkServerAuth();
  
  if (isAuthenticated) {
    redirect('/dashboard');
  }
} 