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

  /*
   * EVERYTHING BELOW IS CALCULATED FROM THE DATABASE.
   * Nothing is specific to Tigers or any other family.
   */

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

  const topThree = families.slice(0, 3);
  const remainingFamilies = families.slice(3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-yellow-50">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-300">

        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-6xl px-5 py-14 text-center md:py-20">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <span className="text-3xl">🤝</span>
          </div>

          <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-yellow-900/70">
            We Can Community
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-6xl">
            Together We Make a Difference
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium text-gray-800/80 md:text-lg">
            Every family matters. Every member counts.
            Every contribution brings us closer together.
          </p>

          {/* Year selector */}
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
                  {itemYear} Family Challenge
                </option>
              ))}
            </select>
          </div>

        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* ERROR */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">
              Unable to load family standing
            </p>
            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-yellow-500" />

            <p className="font-semibold text-gray-600">
              Updating community standing...
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                COMMUNITY TOTALS
            ================================================== */}
            <section className="-mt-20 relative z-10">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* MEMBERS */}
                <div className="rounded-3xl bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Community Members
                      </p>

                      <p className="mt-2 text-4xl font-black text-gray-900">
                        {totalMembers}
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                      👥
                    </div>

                  </div>
                </div>

                {/* COLLECTED */}
                <div className="rounded-3xl bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Community Impact
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
                </div>

                {/* PAID */}
                <div className="rounded-3xl bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Contributions Made
                      </p>

                      <p className="mt-2 text-4xl font-black text-green-600">
                        {totalPaid}
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                      ❤️
                    </div>

                  </div>
                </div>

                {/* PENDING */}
                <div className="rounded-3xl bg-white p-6 shadow-xl">
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
                </div>

              </div>
            </section>

            {/* =================================================
                OVERALL COMMUNITY PROGRESS
            ================================================== */}
            <section className="mt-10 rounded-3xl bg-gray-900 p-7 text-white shadow-xl md:p-9">

              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-yellow-400">
                    Community Progress
                  </p>

                  <h2 className="mt-2 text-2xl font-black md:text-3xl">
                    {year} Contribution Journey
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Together, every contribution moves the
                    community forward.
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-4xl font-black text-yellow-400">
                    {overallPercentage.toFixed(2)}%
                  </p>

                  <p className="text-sm text-gray-400">
                    overall progress
                  </p>
                </div>

              </div>

              <div className="mt-7 h-4 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-700"
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
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-600">
                  Family Challenge
                </p>

                <h2 className="mt-2 text-3xl font-black text-gray-900 md:text-4xl">
                  Family Leaderboard
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-gray-500">
                  See how every family is contributing to
                  the community.
                </p>
              </div>

              {/* TOP 3 */}
              {topThree.length > 0 && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                  {topThree.map((family, index) => {
                    const rank = index + 1;

                    return (
                      <div
                        key={family.name}
                        className={`relative overflow-hidden rounded-3xl bg-white p-7 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                          rank === 1
                            ? "border-2 border-yellow-300 md:-translate-y-5"
                            : "border border-gray-100"
                        }`}
                      >

                        {/* Badge */}
                        <div className="flex items-center justify-between">

                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-black ${
                              rank === 1
                                ? "bg-yellow-100 text-yellow-700"
                                : rank === 2
                                ? "bg-gray-100 text-gray-600"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            #{rank}
                          </div>

                          {rank === 1 && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
                              🏆 LEADING
                            </span>
                          )}

                        </div>

                        <h3 className="mt-6 text-2xl font-black text-gray-900">
                          {family.name}
                        </h3>

                        <div className="mt-5 flex items-end justify-between">

                          <div>
                            <p className="text-sm text-gray-500">
                              Contribution
                            </p>

                            <p className="mt-1 text-4xl font-black text-gray-900">
                              {family.percent.toFixed(2)}%
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Members
                            </p>

                            <p className="mt-1 text-2xl font-black text-gray-900">
                              {family.members}
                            </p>
                          </div>

                        </div>

                        {/* Progress */}
                        <div className="mt-6">

                          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-700"
                              style={{
                                width: `${Math.min(
                                  100,
                                  family.percent
                                )}%`,
                              }}
                            />
                          </div>

                        </div>

                        {/* Details */}
                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">

                          <div>
                            <p className="text-xs text-gray-400">
                              Collected
                            </p>

                            <p className="mt-1 font-bold text-gray-900">
                              {family.collected.toLocaleString()} RWF
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">
                              Paid
                            </p>

                            <p className="mt-1 font-bold text-green-600">
                              {family.paid}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">
                              Pending
                            </p>

                            <p className="mt-1 font-bold text-yellow-600">
                              {family.pending}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">
                              Expected
                            </p>

                            <p className="mt-1 font-bold text-gray-900">
                              {family.expected.toLocaleString()} RWF
                            </p>
                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

              {/* =================================================
                  OTHER FAMILIES
              ================================================== */}
              {remainingFamilies.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">

                  {remainingFamilies.map(
                    (family, index) => (
                      <div
                        key={family.name}
                        className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >

                        <div className="flex items-center gap-4">

                          {/* Rank */}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 font-black text-gray-500">
                            #{index + 4}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-3">

                              <h3 className="truncate font-extrabold text-gray-900">
                                {family.name}
                              </h3>

                              <span className="shrink-0 text-sm font-black text-gray-700">
                                {family.percent.toFixed(2)}%
                              </span>

                            </div>

                            {/* Progress */}
                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">

                              <div
                                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-700"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    family.percent
                                  )}%`,
                                }}
                              />

                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">

                              <span>
                                👥 {family.members} members
                              </span>

                              <span>
                                💰{" "}
                                {family.collected.toLocaleString()} RWF
                              </span>

                              <span className="text-green-600">
                                ✓ {family.paid} paid
                              </span>

                              <span className="text-yellow-600">
                                ⏳ {family.pending} pending
                              </span>

                            </div>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

            {/* =================================================
                COMMUNITY MESSAGE
            ================================================== */}
            <section className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-300 p-8 text-center shadow-lg md:p-12">

              <div className="mx-auto max-w-2xl">

                <div className="text-4xl">
                  ❤️
                </div>

                <h2 className="mt-4 text-3xl font-black text-gray-900">
                  Every Family Counts
                </h2>

                <p className="mt-4 text-base font-medium leading-7 text-gray-800/80 md:text-lg">
                  Every member, every contribution, and every
                  act of generosity helps build a stronger
                  community.
                </p>

                <p className="mt-5 text-lg font-black text-gray-900">
                  Together, We Can.
                </p>

              </div>

            </section>

            {/* FOOTER */}
            <div className="py-10 text-center">

              <p className="text-sm text-gray-400">
                Family Standing • {year}
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-500">
                We Can Community
              </p>

            </div>

          </>
        )}

      </div>
    </main>
  );
}
