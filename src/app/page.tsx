import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LandingPage from './LandingPage';

export default async function RootPage() {
  const session = await auth();

  if (!session) {
    // Show landing page for unauthenticated visitors
    return <LandingPage />;
  }

  // Redirect authenticated users to their dashboard
  if ((session?.user as any)?.role === 'ADMIN') {
    redirect('/admin');
  }

  redirect('/home');
}
