import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  fallbackUrl?: string
}

export default function AuthGuard({ children, allowedRoles, fallbackUrl = '/login' }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, profile, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackUrl)
      return
    }

    if (!isLoading && isAuthenticated && allowedRoles && profile) {
      if (!allowedRoles.includes(profile.role)) {
        // Redirect to appropriate dashboard based on role
        if (profile.role === 'Admin') {
          router.push('/admin')
        } else if (profile.role === 'Provider') {
          router.push('/provider')
        } else {
          router.push('/profile')
        }
      }
    }
  }, [isAuthenticated, profile, isLoading, router, allowedRoles, fallbackUrl])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null
  }

  return <>{children}</>
}