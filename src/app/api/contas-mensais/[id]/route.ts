import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildVencimentoDate } from '@/lib/utils'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Extract propagation flag (not a DB field)
  const { propagar_recorrente, mes_competencia, ano_competencia, ...updateFields } = body

  // Update this month's instance
  const { data, error } = await supabase
    .from('contas_mensais')
    .update(updateFields)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, responsavel:responsaveis(id, nome)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If this is a recurring bill and propagation is enabled
  if (propagar_recorrente && data.conta_recorrente_id && mes_competencia && ano_competencia) {
    const diaVencimento = new Date(updateFields.data_vencimento).getDate()

    // Update the recurring template
    await supabase
      .from('contas_recorrentes')
      .update({
        descricao: updateFields.descricao,
        responsavel_id: updateFields.responsavel_id,
        valor: updateFields.valor,
        dia_vencimento: diaVencimento,
      })
      .eq('id', data.conta_recorrente_id)
      .eq('user_id', user.id)

    // Get all future unpaid instances of this recurring bill (from next month onward)
    const { data: futuras } = await supabase
      .from('contas_mensais')
      .select('id, mes_competencia, ano_competencia')
      .eq('conta_recorrente_id', data.conta_recorrente_id)
      .eq('user_id', user.id)
      .neq('id', id)
      .neq('status', 'pago')

    if (futuras?.length) {
      // Filter to only future months (>= current month)
      const currentYearMonth = ano_competencia * 100 + mes_competencia
      const toUpdate = futuras.filter((f: { mes_competencia: number; ano_competencia: number }) =>
        f.ano_competencia * 100 + f.mes_competencia >= currentYearMonth
      )

      // Update each future instance with new values, recalculating due date per month
      for (const f of toUpdate) {
        const novaDataVencimento = buildVencimentoDate(diaVencimento, f.mes_competencia, f.ano_competencia)
        await supabase
          .from('contas_mensais')
          .update({
            descricao: updateFields.descricao,
            responsavel_id: updateFields.responsavel_id,
            valor: updateFields.valor,
            data_vencimento: novaDataVencimento,
          })
          .eq('id', f.id)
          .eq('user_id', user.id)
      }
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase
    .from('contas_mensais')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
