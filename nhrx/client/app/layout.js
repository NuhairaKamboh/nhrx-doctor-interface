import './globals.css';

export const metadata = {
  title: 'NHRX — Doctor Portal',
  description: 'National Health Record Exchange: secure cross-hospital patient records.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
