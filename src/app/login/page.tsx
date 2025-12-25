'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase/client'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Get user role from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (userError) {
          throw userError
        }

        toast.success('تم تسجيل الدخول بنجاح')
        
        // Redirect based on role
        switch (userData.role) {
          case 'Admin':
            router.push('/admin')
            break
          case 'Provider':
            router.push('/provider')
            break
          case 'Requester':
          default:
            router.push('/')
            break
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div