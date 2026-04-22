import './globals.css';

export const metadata = {
  title: 'Netsentinel Ultra Core',
  description: 'Enterprise-style self-hosted gateway dashboard starter'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
