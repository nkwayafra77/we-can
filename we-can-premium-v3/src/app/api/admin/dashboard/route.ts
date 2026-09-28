import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdmin } from '@/lib/adminAuth';
import { FAMILIES } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
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

    // Get ALL registered members
    const { data: members, error: membersError } =
      await supabaseAdmin
        .from('members')
        .select('id,name,family,phone')
        .order('created_at', { ascending: true });

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

    /*
      Match family names the same way as
      the public Family Standing page.
    */
    const normalizeFamily = (value: string) =>
      String(value || '')
        .trim()
        .toLowerCase();

    const sameFamily = (
      memberFamily: string,
      configFamily: string
    ) => {
      const member = normalizeFamily(memberFamily);
      const config = normalizeFamily(configFamily);

      return (
        member === config ||
        member === `${config} family` ||
        `${member} family` === config
      );
    };

    const families = FAMILIES.map((familyName) => {
      const familyMembers = allMembers.filter(
        (member) =>
          sameFamily(member.family, familyName)
      );

      const memberIds = new Set(
        familyMembers.map((member) => member.id)
      );

      const familyPayments = allPayments.filter(
        (payment) =>
          memberIds.has(payment.member_id)
      );

      const paidPayments = familyPayments.filter(
        (payment) =>
          String(payment.status || '')
            .trim()
            .toLowerCase() === 'paid'
      );

      const pendingPayments = familyPayments.filter(
        (payment) =>
          String(payment.status || '')
            .trim()
            .toLowerCase() === 'pending'
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
        name: familyName,
        members: familyMembers.length,
        collected,
        paid: paidPayments.length,
        pending: pendingPayments.length,
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

    // Overall totals
    const paidPayments = allPayments.filter(
      (payment) =>
        String(payment.status || '')
          .trim()
          .toLowerCase() === 'paid'
    );

    const pendingPayments = allPayments.filter(
      (payment) =>
        String(payment.status || '')
          .trim()
          .toLowerCase() === 'pending'
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

        // IMPORTANT:
        // This is the real number of registered
        // members returned from Supabase.
        members: allMembers.length,

        collected,
        expected,
        percent,
        pendingCount: pendingPayments.length,

        families,

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
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error(
      'Admin dashboard error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown server error',
      },
      { status: 500 }
    );
  }
}
