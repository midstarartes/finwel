import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildVencimentoDate } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const mes = parseInt(searchParams.get('mes') || '0')
  const ano = parseInt(searchParams.get('ano') || '0')

  if (!mes || !ano) return NextResponse.json({ error: 'mes and ano required' }, { status: 400 })

  // Generate monthly bills from recurring if not yet created
  await generateMonthlyBills(supabase, user.id, mes, ano)

  // Update overdue status
  await updateOverdueStatus(supabase, user.id, mes, ano)

  const { data, error } = await supabase
    .from('contas_mensais')
    .select('*, responsavel:responsaveis(id, nome)')
    .eq('user_id', user.id)
    .eq('mes_competencia', mes)
    .eq('ano_competencia', ano)
    .order('data_vencimento', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('contas_mensais')
    .insert({ ...body, user_id: user.id })
    .select('*, responsavel:responsaveis(id, nome)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

async function generateMonthlyBills(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, mes: number, ano: number) {
  // Check if already generated
  const { data: existing } = await supabase
    .from('contas_mensais')
    .select('conta_recorrente_id')
    .eq('user_id', userId)
    .eq('mes_competencia', mes)
    .eq('ano_competencia', ano)
    .not('conta_recorrente_id', 'is', null)

  const existingIds = new Set((existing ?? []).map((r: { conta_recorrente_id: string | null }) => r.conta_recorrente_id))

  // Get active recurring bills
  const { data: recorrentes } = await supabase
    .from('contas_recorrentes')
    .select('*')
    .eq('user_id', userId)
    .eq('ativo', true)

  if (!recorrentes?.length) return

  const toInsert = recorrentes
    .filter((r: { id: string }) => !existingIds.has(r.id))
    .map((r: { id: string; descricao: string; responsavel_id: string | null; responsaveis_texto?: string; valor: number; dia_vencimento: number }) => ({
      user_id: userId,
      descricao: r.descricao,
      responsavel_id: r.responsavel_id,
      responsaveis_texto: r.responsaveis_texto || '',
      valor: r.valor,
      data_vencimento: buildVencimentoDate(r.dia_vencimento, mes, ano),
      status: 'aberto',
      conta_recorrente_id: r.id,
      mes_competencia: mes,
      ano_competencia: ano,
    }))

  if (toInsert.length) {
    await supabase.from('contas_mensais').insert(toInsert)
  }
}

async function updateOverdueStatus(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, mes: number, ano: number) {
  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('contas_mensais')
    .update({ status: 'atrasado' })
    .eq('user_id', userId)
    .eq('mes_competencia', mes)
    .eq('ano_competencia', ano)
    .eq('status', 'aberto')
    .is('data_pagamento', null)
    .lt('data_vencimento', today)
}
