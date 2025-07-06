import { redirect } from 'next/navigation';
import { checkServerAuth } from '@/utils/server-auth';

export default function HomePage() {
  // Server-side auth check
  const { isAuthenticated } = checkServerAuth();
  
  // Redirect based on authentication status
  if (isAuthenticated) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
}
