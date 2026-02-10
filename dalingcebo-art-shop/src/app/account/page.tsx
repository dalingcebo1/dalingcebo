import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountContent from './AccountContent'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/')
  }

  return <AccountContent user={session.user} />
}
