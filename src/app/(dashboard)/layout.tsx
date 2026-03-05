import UserSidebar from '@/components/Sidebar/UserSidebar';
import AdminSidebar from '@/components/Sidebar/AdminSidebar';
import OrderNotifier from '@/components/Header/OrderNotifier';
import NotificationBell from '@/components/Header/NotificationBell';
import CartBadge from '@/components/Header/CartBadge';
import { CartProvider } from '@/context/CartContext';
import styles from './layout.module.css';
import { auth } from '@/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === 'ADMIN';

    return (
        <CartProvider>
            <div className={styles.layout}>
                {isAdmin ? <AdminSidebar /> : <UserSidebar />}

                {/* Global Toast Notifier for Customers */}
                {!isAdmin && <OrderNotifier />}

                <main className={styles.main}>
                    <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 1000, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {!isAdmin && <CartBadge />}
                        <NotificationBell />
                    </div>
                    {children}
                </main>
            </div>
        </CartProvider>
    );
}
