import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Delete all non-paid monthly bills for this parcelada
  await supabase
    .from('contas_mensais')
    .delete()
    .eq('conta_parcelada_id', id)
    .eq('user_id', user.id)
    .neq('status', 'pago')

  const { error } = await supabase
    .from('contas_parceladas')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
