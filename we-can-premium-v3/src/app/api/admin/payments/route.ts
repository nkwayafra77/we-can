import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdmin } from '@/lib/adminAuth';

export async function PATCH(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in again.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const paymentId = body.payment_id;
    const action = body.action;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required.' },
        { status: 400 }
      );
    }

    if (action !== 'confirm' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action.' },
        { status: 400 }
      );
    }

    const { data: payment, error: findError } =
      await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

    if (findError || !payment) {
      return NextResponse.json(
        { error: 'Payment was not found.' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        {
          error: 'This payment is no longer pending.',
        },
        { status: 400 }
      );
    }

    if (action === 'confirm') {
      const { data, error } =
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString(),
            payment_method: 'mtn_momo',
            notes: 'Payment confirmed by admin',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId)
          .select()
          .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed successfully.',
        payment: data,
      });
    }

    const { data, error } =
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'unpaid',
          payment_date: null,
          notes: 'Payment rejected by admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment rejected successfully.',
      payment: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Server error while processing payment.',
      },
      { status: 500 }
    );
  }
}
