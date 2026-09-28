"use client";

import { useEffect, useState } from "react";

type Family = {
  name: string;
  members: number;
  collected: number;
  paid: number;
  pending: number;
  unpaid: number;
  expected: number;
  percent: number;
};

const familyIcons = [
  "🌟",
  "💛",
  "🕊️",
  "🌿",
  "💎",
  "🤝",
  "❤️",
  "🔥",
  "🙏",
  "✨",
];

export default function FamilyStandingPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFamilyStanding() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/family-standing?year=${year}&t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Failed to load family standing"
          );
        }

        setFamilies(data.families || []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load family standing"
        );
      } finally {
        setLoading(false);
      }
    }

    loadFamilyStanding();
  }, [year]);

  /* =========================
     DYNAMIC COMMUNITY TOTALS
  ========================= */

  const totalMembers = families.reduce(
    (sum, family) => sum + family.members,
    0
  );

  const totalCollected = families.reduce(
    (sum, family) => sum + family.collected,
    0
  );

  const totalPaid = families.reduce(
    (sum, family) => sum + family.paid,
    0
  );

  const totalPending = families.reduce(
    (sum, family) => sum + family.pending,
    0
  );

  const totalExpected = families.reduce(
    (sum, family) => sum + family.expected,
    0
  );

  const overallPercentage =
    totalExpected > 0
      ? Math.min(
          100,
          (totalCollected / totalExpected) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-amber-300 to-orange-300">

        {/* Decorative shapes */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/20" />

        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10" />

        <div className="absolute right-10 top-24 text-5xl opacity-20">
          ✨
        </div>

        <div className="absolute bottom-10 left-10 text-4xl opacity-20">
          ❤️
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center md:py-20">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
            <span className="text-4xl">
              🤝
            </span>
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-yellow-900/70">
            WE CAN COMMUNITY
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-6xl">
            Together We Can
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-gray-800/80 md:text-lg">
            Every family matters. Every member counts.
            Together, our contributions create a stronger
            community.
          </p>

          {/* Year */}
          <div className="mt-8 flex justify-center">

            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
              className="rounded-full border-2 border-white bg-white px-6 py-3 font-bold text-gray-800 shadow-lg outline-none"
            >
              {Array.from(
                { length: 5 },
                (_, index) =>
                  new Date().getFullYear() - index
              ).map((itemYear) => (
                <option
                  key={itemYear}
                  value={itemYear}
                >
                  {itemYear} Family Standing
                </option>
              ))}
            </select>

          </div>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-5 pb-12">

        {/* ERROR */}

        {error && (
          <div className="-mt-8 relative z-10 mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <p className="font-bold">
              Unable to load Family Standing
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="-mt-16 relative z-10 rounded-3xl bg-white p-16 text-center shadow-xl">

            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-yellow-500" />

            <p className="font-semibold text-gray-600">
              Updating Family Standing...
            </p>

          </div>
        ) : (
          <>
            {/* =================================================
                COMMUNITY SUMMARY
            ================================================== */}

            <section className="-mt-16 relative z-10">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* MEMBERS */}

                <div className="rounded-3xl bg-white p-6 shadow-xl transition hover:-translate-y-1">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Total Members
                      </p>

                      <p className="mt-2 text-4xl font-black text-gray-900">
                        {totalMembers}
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                      👥
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    Registered community members
                  </p>

                </div>

                {/* MONEY */}

                <div className="rounded-3xl bg-white p-6 shadow-xl transition hover:-translate-y-1">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Total Collected
                      </p>

                      <p className="mt-2 text-2xl font-black text-gray-900">
                        {totalCollected.toLocaleString()}
                        <span className="ml-1 text-sm">
                          RWF
                        </span>
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                      💰
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    Community contributions
                  </p>

                </div>

                {/* PAID */}

                <div className="rounded-3xl bg-white p-6 shadow-xl transition hover:-translate-y-1">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Paid Contributions
                      </p>

                      <p className="mt-2 text-4xl font-black text-green-600">
                        {totalPaid}
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                      ✅
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    Completed contributions
                  </p>

                </div>

                {/* PENDING */}

                <div className="rounded-3xl bg-white p-6 shadow-xl transition hover:-translate-y-1">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Pending
                      </p>

                      <p className="mt-2 text-4xl font-black text-yellow-600">
                        {totalPending}
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-2xl">
                      ⏳
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    Contributions awaiting payment
                  </p>

                </div>

              </div>
            </section>

            {/* =================================================
                COMMUNITY PROGRESS
            ================================================== */}

            <section className="mt-10 overflow-hidden rounded-3xl bg-gray-900 p-7 text-white shadow-xl md:p-9">

              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                <div>

                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      🌍
                    </span>

                    <p className="text-sm font-black uppercase tracking-wider text-yellow-400">
                      Community Progress
                    </p>
                  </div>

                  <h2 className="mt-2 text-2xl font-black md:text-3xl">
                    Our {year} Journey
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                    Every family and every contribution helps
                    move our community forward.
                  </p>

                </div>

                <div className="text-left md:text-right">

                  <p className="text-4xl font-black text-yellow-400">
                    {overallPercentage.toFixed(2)}%
                  </p>

                  <p className="text-sm text-gray-400">
                    overall contribution
                  </p>

                </div>

              </div>

              <div className="mt-7 h-4 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 transition-all duration-700"
                  style={{
                    width: `${overallPercentage}%`,
                  }}
                />

              </div>

            </section>

            {/* =================================================
                FAMILY LEADERBOARD
            ================================================== */}

            <section className="mt-14">

              <div className="mb-8 text-center">

                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-yellow-700">
                  🏆 Family Standing
                </span>

                <h2 className="mt-4 text-3xl font-black text-gray-900 md:text-4xl">
                  Our Families
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-gray-500">
                  Every family has a place in the journey.
                  Watch the community grow together.
                </p>

              </div>

              {/* ALL FAMILIES */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {families.map((family, index) => {

                  const rank = index + 1;

                  const icon =
                    familyIcons[index % familyIcons.length];

                  const isFirst = rank === 1;
                  const isSecond = rank === 2;
                  const isThird = rank === 3;

                  return (
                    <div
                      key={family.name}
                      className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        isFirst
                          ? "border-2 border-yellow-300 md:col-span-2"
                          : "border border-gray-100"
                      }`}
                    >

                      {/* TOP DECORATION */}

                      {isFirst && (
                        <div className="absolute right-0 top-0 rounded-bl-2xl bg-yellow-400 px-4 py-2 text-xs font-black text-gray-900">
                          🏆 LEADING FAMILY
                        </div>
                      )}

                      <div className="flex gap-5">

                        {/* RANK / ICON */}

                        <div className="flex shrink-0 flex-col items-center">

                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                              isFirst
                                ? "bg-yellow-100"
                                : isSecond
                                ? "bg-gray-100"
                                : isThird
                                ? "bg-orange-100"
                                : "bg-slate-50"
                            }`}
                          >
                            {isFirst
                              ? "🥇"
                              : isSecond
                              ? "🥈"
                              : isThird
                              ? "🥉"
                              : icon}
                          </div>

                          <span className="mt-2 text-xs font-black text-gray-400">
                            #{rank}
                          </span>

                        </div>

                        {/* FAMILY CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                Family
                              </p>

                              <h3 className="mt-1 text-xl font-black text-gray-900">
                                {family.name}
                              </h3>

                            </div>

                            <div className="sm:text-right">

                              <p className="text-xs font-semibold text-gray-400">
                                Contribution
                              </p>

                              <p className="text-2xl font-black text-gray-900">
                                {family.percent.toFixed(2)}%
                              </p>

                            </div>

                          </div>

                          {/* PROGRESS */}

                          <div className="mt-5">

                            <div className="mb-2 flex justify-between text-xs font-semibold text-gray-400">

                              <span>
                                Progress
                              </span>

                              <span>
                                {family.percent.toFixed(2)}%
                              </span>

                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  isFirst
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                    : "bg-gradient-to-r from-amber-300 to-yellow-400"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    family.percent
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                          {/* STATS */}

                          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs text-gray-400">
                                👥 Members
                              </p>

                              <p className="mt-1 font-black text-gray-900">
                                {family.members}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs text-gray-400">
                                💰 Collected
                              </p>

                              <p className="mt-1 font-black text-gray-900">
                                {family.collected.toLocaleString()} RWF
                              </p>
                            </div>

                            <div className="rounded-xl bg-green-50 p-3">
                              <p className="text-xs text-gray-400">
                                ✅ Paid
                              </p>

                              <p className="mt-1 font-black text-green-600">
                                {family.paid}
                              </p>
                            </div>

                            <div className="rounded-xl bg-yellow-50 p-3">
                              <p className="text-xs text-gray-400">
                                ⏳ Pending
                              </p>

                              <p className="mt-1 font-black text-yellow-600">
                                {family.pending}
                              </p>
                            </div>

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>

              {/* NO FAMILIES */}

              {families.length === 0 && (
                <div className="rounded-3xl bg-white p-12 text-center shadow-sm">

                  <div className="text-5xl">
                    🤝
                  </div>

                  <h3 className="mt-4 text-xl font-black text-gray-900">
                    No family data yet
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Family information will appear here as
                    members register.
                  </p>

                </div>
              )}

            </section>

            {/* =================================================
                COMMUNITY MESSAGE
            ================================================== */}

            <section className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-300 to-orange-300 p-8 text-center shadow-lg md:p-12">

              <div className="mx-auto max-w-2xl">

                <div className="text-4xl">
                  ❤️
                </div>

                <h2 className="mt-4 text-3xl font-black text-gray-900">
                  Every Family Counts
                </h2>

                <p className="mt-4 text-base font-medium leading-7 text-gray-800/80 md:text-lg">
                  No contribution is too small.
                  No family is forgotten.
                  Together, we can make a difference.
                </p>

                <div className="mt-6 flex justify-center gap-3 text-2xl">
                  🤝 ❤️ 🙏
                </div>

              </div>

            </section>

            {/* =================================================
                FOOTER
            ================================================== */}

            <footer className="py-12 text-center">

              <p className="text-xl font-black text-yellow-600">
                🙏 God is Good
              </p>

              <p className="mt-3 text-sm text-gray-400">
                Family Standing • {year}
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-500">
                We Can Community
              </p>

            </footer>

          </>
        )}

      </div>
    </main>
  );
}
