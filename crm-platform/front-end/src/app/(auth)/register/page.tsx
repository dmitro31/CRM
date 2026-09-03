import { RegisterForm } from '@/features/auth/register'
import { AuthLayout } from '@/widgets/auth/auth-layout'

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}