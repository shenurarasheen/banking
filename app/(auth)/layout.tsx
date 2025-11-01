export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
        Side bar for auth
        {children}
    </main>
  );
}