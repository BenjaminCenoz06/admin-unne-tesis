import { NextResponse } from 'next/server';
import { requireStaff, logAudit } from '@/lib/auth';
import { getEntity } from '@/lib/entities';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Evita que Excel interprete una celda como fórmula (inyección CSV).
const cell = (v: unknown) => {
  let s = v == null ? '' : Array.isArray(v) ? v.join('; ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(_req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const e = getEntity(entity);
  if (!e) return new NextResponse('No encontrado', { status: 404 });
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase.from(e.table).select('*').order(e.order.column, { ascending: e.order.ascending }).limit(5000);
  if (error) return new NextResponse('No se pudo exportar', { status: 500 });

  const rows = (data ?? []) as Record<string, unknown>[];
  const cols = rows[0] ? Object.keys(rows[0]) : e.fields.map((f) => f.name);
  const csv = '﻿' + [cols.map(cell).join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n');
  await logAudit('export', e.table, null, { rows: rows.length });
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${e.key}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
