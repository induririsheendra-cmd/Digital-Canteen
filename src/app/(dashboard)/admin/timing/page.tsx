import AdminTimingClient from './AdminTimingClient';

export const metadata = {
    title: 'Meal Timings - CMS',
};

export default function AdminTimingPage() {
    return (
        <div className="page-container">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient">Meal Timings Controls</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Restrict when users can order specific categories.</p>
            </div>
            <AdminTimingClient />
        </div>
    );
}
