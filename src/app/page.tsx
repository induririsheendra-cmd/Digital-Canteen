import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Redirect based on role if needed, otherwise default to /home
  if ((session?.user as any)?.role === 'ADMIN') {
    redirect('/admin/dashboard');
  }

  redirect('/home');
}
