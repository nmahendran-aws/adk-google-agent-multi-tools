import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Zoo Agent',
    description: 'Your AI Zoo Tour Guide',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
