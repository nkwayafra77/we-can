import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdmin } from '@/lib/adminAuth';
import { FAMILIES } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const year = Number(
    req.nextUrl.searchParams.get('year') ||
      new Date().getFullYear()
  );

  // Get all registered members
  const { data: members, error: membersError } =
    await supabaseAdmin
      .from('members')
      .select('id,name,family,phone');

  if (membersError) {
    console.error('Members error:', membersError);

    return NextResponse.json(
      {
        error: 'Failed to load members',
        details: membersError.message,
      },
      { status: 500 }
    );
  }

  // Get payments for selected year
  const { data: payments, error: paymentsError } =
    await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('year', year)
      .order('month', { ascending: false });

  if (paymentsError) {
    console.error('Payments error:', paymentsError);

    return NextResponse.json(
      {
        error: 'Failed to load payments',
        details: paymentsError.message,
      },
      { status: 500 }
    );
  }

  const allMembers = members || [];
  const allPayments = payments || [];

  // FAMILY STANDING
  const families = FAMILIES.map((name) => {
    // Members registered in this family
    const familyMembers = allMembers.filter(
      (member) => member.family === name
    );

    const memberIds = new Set(
      familyMembers.map((member) => member.id)
    );

    // All payments belonging to this family
    const familyPayments = allPayments.filter(
      (payment) => memberIds.has(payment.member_id)
    );

    const paidPayments = familyPayments.filter(
      (payment) => payment.status === 'paid'
    );

    const pendingPayments = familyPayments.filter(
      (payment) => payment.status === 'pending'
    );

    const collected = paidPayments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

    const expected =
      familyMembers.length * 12 * 1000;

    const percent =
      expected > 0
        ? Math.min(
            100,
            (collected / expected) * 100
          )
        : 0;

    return {
      name,

      // IMPORTANT: number of registered members
      members: familyMembers.length,

      collected,

      // Number of paid payment records
      paid: paidPayments.length,

      // Number of pending payment records
      pending: pendingPayments.length,

      // Number of unpaid records
      unpaid: Math.max(
        0,
        familyMembers.length * 12 -
          paidPayments.length -
          pendingPayments.length
      ),

      expected,

      percent,
    };
  });

  // GENERAL DASHBOARD TOTALS
  const paidPayments = allPayments.filter(
    (payment) => payment.status === 'paid'
  );

  const pendingPayments = allPayments.filter(
    (payment) => payment.status === 'pending'
  );

  const collected = paidPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  const expected =
    allMembers.length * 12 * 1000;

  const percent =
    expected > 0
      ? Math.round(
          (collected / expected) * 100
        )
      : 0;

  return NextResponse.json(
    {
      year,

      // General totals
      members: allMembers.length,
      collected,
      expected,
      percent,

      pendingCount: pendingPayments.length,

      // Family-by-family standing
      families,

      // Payment records
      transactions: allPayments.map(
        (payment) => ({
          ...payment,

          member:
            allMembers.find(
              (member) =>
                member.id === payment.member_id
            ) || null,
        })
      ),
    },
    {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate',
      },
    }
  );
}
