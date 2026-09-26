import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  let q = supabaseAdmin
    .from('payments')
    .select('*,member:members(name,family,phone)')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (p.get('member_id')) {
    q = q.eq('member_id', p.get('member_id')!);
  }

  if (p.get('year')) {
    q = q.eq('year', Number(p.get('year')));
  }

  const { data, error } = await q;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    data: data || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const memberId = body.member_id;
    const year = Number(body.year);
    const months = body.months;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(months) ||
      months.length === 0
    ) {
      return NextResponse.json(
        { error: 'Please select at least one month' },
        { status: 400 }
      );
    }

    const validMonths = months
      .map(Number)
      .filter(
        (month: number) =>
          Number.isInteger(month) &&
          month >= 1 &&
          month <= 12
      );

    if (validMonths.length !== months.length) {
      return NextResponse.json(
        { error: 'Invalid month selected' },
        { status: 400 }
      );
    }

    const { data: member, error: memberError } =
      await supabaseAdmin
        .from('members')
        .select('id,name')
        .eq('id', memberId)
        .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const uniqueMonths = [...new Set(validMonths)];

    const { data: existing, error: existingError } =
      await supabaseAdmin
        .from('payments')
        .select('month,status')
        .eq('member_id', memberId)
        .eq('year', year)
        .in('month', uniqueMonths);

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 400 }
      );
    }

    const alreadyPaid: number[] = [];
    const alreadyPending: number[] = [];
    const availableMonths: number[] = [];

    for (const month of uniqueMonths) {
      const record = (existing || []).find(
        (payment) => payment.month === month
      );

      if (record?.status === 'paid') {
        alreadyPaid.push(month);
      } else if (record?.status === 'pending') {
        alreadyPending.push(month);
      } else {
        availableMonths.push(month);
      }
    }

    if (availableMonths.length === 0) {
      return NextResponse.json(
        {
          error:
            'All selected months are already paid or pending.',
          alreadyPaid,
          alreadyPending,
        },
        { status: 400 }
      );
    }

    const records = availableMonths.map((month) => ({
      member_id: memberId,
      month,
      year,
      amount: 1000,
      status: 'pending',
      payment_method: 'mtn_momo',
    }));

    const { data: created, error: insertError } =
      await supabaseAdmin
        .from('payments')
        .insert(records)
        .select();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Payment request submitted successfully.',
      created: created || [],
      alreadyPaid,
      alreadyPending,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Something went wrong',
      },
      { status: 500 }
    );
  }
}
