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

    if (
      !Number.isInteger(year) ||
      year < 2020 ||
      year > 2100
    ) {
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
        {
          error:
            'Please select at least one month.',
        },
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
        { error: 'Invalid month selected.' },
        { status: 400 }
      );
    }

    const uniqueMonths = Array.from(
      new Set(validMonths)
    );

    const { data: member, error: memberError } =
      await supabaseAdmin
        .from('members')
        .select('id,name')
        .eq('id', memberId)
        .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found.' },
        { status: 404 }
      );
    }

    /*
      Check existing records first.
      This prevents the duplicate-key error.
    */
    const {
      data: existingPayments,
      error: existingError,
    } = await supabaseAdmin
      .from('payments')
      .select('month,status')
      .eq('member_id', memberId)
      .eq('year', year)
      .in('month', uniqueMonths);

    if (existingError) {
      return NextResponse.json(
        {
          error: existingError.message,
        },
        { status: 400 }
      );
    }

    const alreadyPaid: number[] = [];
    const alreadyPending: number[] = [];
    const availableMonths: number[] = [];

    for (const month of uniqueMonths) {
      const existing = (
        existingPayments || []
      ).find(
        (payment) =>
          Number(payment.month) === month
      );

      if (!existing) {
        availableMonths.push(month);
      } else if (
        existing.status === 'paid'
      ) {
        alreadyPaid.push(month);
      } else if (
        existing.status === 'pending'
      ) {
        alreadyPending.push(month);
      } else {
        /*
          If the existing record is unpaid,
          we can safely change it to pending.
        */
        availableMonths.push(month);
      }
    }

    /*
      If every selected month already has
      a paid or pending record, don't insert
      duplicates.
    */
    if (availableMonths.length === 0) {
      let message =
        'No new payment request was created.';

      if (alreadyPaid.length > 0) {
        message +=
          ' Some selected months are already paid.';
      }

      if (alreadyPending.length > 0) {
        message +=
          ' Some selected months are already pending.';
      }

      return NextResponse.json(
        {
          success: false,
          message,
          alreadyPaid,
          alreadyPending,
        },
        { status: 200 }
      );
    }

    /*
      Find existing unpaid records.
      We update those instead of inserting
      another record.
    */
    const existingUnpaid =
      (existingPayments || []).filter(
        (payment) =>
          payment.status === 'unpaid' &&
          availableMonths.includes(
            Number(payment.month)
          )
      );

    const existingUnpaidMonths =
      existingUnpaid.map((payment) =>
        Number(payment.month)
      );

    const newMonths =
      availableMonths.filter(
        (month) =>
          !existingUnpaidMonths.includes(
            month
          )
      );

    /*
      Change existing unpaid records
      to pending.
    */
    for (const month of existingUnpaidMonths) {
      const { error: updateError } =
        await supabaseAdmin
          .from('payments')
          .update({
            amount: 1000,
            status: 'pending',
            payment_method: 'mtn_momo',
            updated_at:
              new Date().toISOString(),
          })
          .eq('member_id', memberId)
          .eq('month', month)
          .eq('year', year);

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 400 }
        );
      }
    }

    /*
      Create records only for months
      that don't exist yet.
    */
    if (newMonths.length > 0) {
      const records = newMonths.map(
        (month) => ({
          member_id: memberId,
          month,
          year,
          amount: 1000,
          status: 'pending',
          payment_method: 'mtn_momo',
        })
      );

      const {
        error: insertError,
      } = await supabaseAdmin
        .from('payments')
        .insert(records);

      if (insertError) {
        return NextResponse.json(
          {
            error:
              insertError.message,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        'Payment request submitted successfully. Your payment is now pending admin confirmation.',
      submittedMonths:
        availableMonths,
      alreadyPaid,
      alreadyPending,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Something went wrong.',
      },
      { status: 500 }
    );
  }
}
