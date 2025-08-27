import './globals.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import AuthProvider from './components/AuthProvider'
import Layout from './components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sistema de Login Seguro',
  description: 'Implementación de un sistema de autenticación web seguro con protección contra ataques de SQL Injection',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider session={session}>
          {/* Layout con sidebar */}
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  )
} 