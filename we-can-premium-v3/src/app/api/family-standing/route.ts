import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FAMILIES } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const year = Number(
      req.nextUrl.searchParams.get("year") ||
        new Date().getFullYear()
    );

    const { data: members, error: membersError } =
      await supabaseAdmin
        .from("members")
        .select("id, name, family");

    if (membersError) {
      return NextResponse.json(
        {
          error: membersError.message,
        },
        { status: 500 }
      );
    }

    const { data: payments, error: paymentsError } =
      await supabaseAdmin
        .from("payments")
        .select("*")
        .eq("year", year);

    if (paymentsError) {
      return NextResponse.json(
        {
          error: paymentsError.message,
        },
        { status: 500 }
      );
    }

    const allMembers = members || [];
    const allPayments = payments || [];

    const families = FAMILIES.map((familyName) => {
      const familyMembers = allMembers.filter(
        (member) => {
          const memberFamily = String(
            member.family || ""
          )
            .trim()
            .toLowerCase();

          const configFamily = String(
            familyName || ""
          )
            .trim()
            .toLowerCase();

          return (
            memberFamily === configFamily ||
            memberFamily ===
              `${configFamily} family` ||
            `${memberFamily} family` ===
              configFamily
          );
        }
      );

      const memberIds = new Set(
        familyMembers.map(
          (member) => member.id
        )
      );

      const familyPayments = allPayments.filter(
        (payment) =>
          memberIds.has(payment.member_id)
      );

      const paidPayments =
        familyPayments.filter(
          (payment) =>
            String(payment.status)
              .trim()
              .toLowerCase() === "paid"
        );

      const pendingPayments =
        familyPayments.filter(
          (payment) =>
            String(payment.status)
              .trim()
              .toLowerCase() === "pending"
        );

      const collected =
        paidPayments.reduce(
          (total, payment) =>
            total +
            Number(payment.amount || 0),
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

    families.sort((a, b) => {
      if (b.percent !== a.percent) {
        return b.percent - a.percent;
      }

      if (b.collected !== a.collected) {
        return b.collected - a.collected;
      }

      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(
      {
        year,
        families,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Family standing error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
