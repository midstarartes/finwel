import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { format, addMonths, parseISO } from 'date-fns'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('contas_parceladas')
    .select('*, responsavel:responsaveis(id, nome)')
    .eq('user_id', user.id)
    .order('primeira_vencimento')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { descricao, responsavel_id, valor_parcela, total_parcelas, primeira_vencimento, observacao } = body

  // Create the parcelada record
  const { data: parcelada, error: errParc } = await supabase
    .from('contas_parceladas')
    .insert({ descricao, responsavel_id, valor_parcela, total_parcelas, primeira_vencimento, observacao, user_id: user.id })
    .select('*, responsavel:responsaveis(id, nome)')
    .single()

  if (errParc) return NextResponse.json({ error: errParc.message }, { status: 500 })

  // Generate monthly installment bills
  const firstDate = parseISO(primeira_vencimento)
  const parcelas = Array.from({ length: total_parcelas }, (_, i) => {
    const date = addMonths(firstDate, i)
    return {
      user_id: user.id,
      descricao: `${descricao} — Parcela ${i + 1}/${total_parcelas}`,
      responsavel_id,
      valor: valor_parcela,
      data_vencimento: format(date, 'yyyy-MM-dd'),
      status: 'aberto',
      conta_parcelada_id: parcelada.id,
      numero_parcela: i + 1,
      total_parcelas,
      mes_competencia: date.getMonth() + 1,
      ano_competencia: date.getFullYear(),
    }
  })

  await supabase.from('contas_mensais').insert(parcelas)

  return NextResponse.json(parcelada)
}
