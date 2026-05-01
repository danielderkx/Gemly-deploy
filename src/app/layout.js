export const metadata = {
  title: 'Gemly — Scan & Find',
  description: 'Scan any item and find it cheaper, second-hand or new.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#F5F1EB', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', boxSizing: 'border-box' }}>
        {children}
      </body>
    </html>
  )
}
