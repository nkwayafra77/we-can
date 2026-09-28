import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { FAMILIES } from "@/lib/config";

export const dynamic = "force-dynamic";

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
      console.error("MEMBERS ERROR:", membersError);

      return NextResponse.json(
        {
          error: "Failed to load members",
          details: membersError.message,
        },
        { status: 500 }
      );
    }

    const { data: payments, error: paymentsError } =
      await supabaseAdmin
        .from("payments")
        .select(
          "id, member_id, amount, status, month, year"
        )
        .eq("year", year);

    if (paymentsError) {
      console.error("PAYMENTS ERROR:", paymentsError);

      return NextResponse.json(
        {
          error: "Failed to load payments",
          details: paymentsError.message,
        },
        { status: 500 }
      );
    }

    const allMembers = members || [];
    const allPayments = payments || [];

    console.log("YEAR:", year);
    console.log("MEMBERS:", allMembers);
    console.log("PAYMENTS:", allPayments);

    const families = FAMILIES.map((familyName) => {
      const familyMembers = allMembers.filter(
        (member) => {
          const databaseFamily =
            String(member.family || "")
              .trim()
              .replace(/ Family$/i, "");

          const expectedFamily =
            String(familyName || "")
              .trim()
              .replace(/ Family$/i, "");

          return (
            databaseFamily.toLowerCase() ===
            expectedFamily.toLowerCase()
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
            String(payment.status).toLowerCase() ===
            "paid"
        );

      const pendingPayments =
        familyPayments.filter(
          (payment) =>
            String(payment.status).toLowerCase() ===
            "pending"
        );

      const collected =
        paidPayments.reduce(
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
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "FAMILY STANDING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load family standing",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
