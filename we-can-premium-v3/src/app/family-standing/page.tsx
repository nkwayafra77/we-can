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

  const totalMembers = families.reduce(
    (total, family) => total + family.members,
    0
  );

  const totalCollected = families.reduce(
    (total, family) => total + family.collected,
    0
  );

  const totalPaid = families.reduce(
    (total, family) => total + family.paid,
    0
  );

  const totalPending = families.reduce(
    (total, family) => total + family.pending,
    0
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Family Standing
            </h1>

            <p className="mt-1 text-gray-600">
              See how each family is progressing.
            </p>
          </div>

          {/* YEAR SELECTOR */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm"
          >
            {Array.from(
              { length: 5 },
              (_, index) =>
                new Date().getFullYear() - index
            ).map((itemYear) => (
              <option key={itemYear} value={itemYear}>
                {itemYear}
              </option>
            ))}
          </select>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Members
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalMembers}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Collected
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalCollected.toLocaleString()} RWF
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Paid Contributions
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalPaid}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Contributions
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalPending}
            </p>
          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">
              Loading family standing...
            </p>
          </div>
        )}

        {/* FAMILY CARDS */}
        {!loading && families.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {families.map((family, index) => (
              <div
                key={family.name}
                className="rounded-xl bg-white p-5 shadow-sm"
              >

                {/* RANK + FAMILY */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Rank #{index + 1}
                    </p>

                    {/* IMPORTANT:
                        Do NOT add "Family" here.
                        The API already returns "Tigers Family".
                    */}
                    <h2 className="mt-1 text-xl font-bold text-gray-900">
                      {family.name}
                    </h2>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {family.percent.toFixed(2)}%
                    </p>

                    <p className="text-xs text-gray-500">
                      Contribution
                    </p>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mb-5">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${Math.min(
                          100,
                          family.percent
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* FAMILY DETAILS */}
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-sm text-gray-500">
                      Members
                    </p>

                    <p className="font-semibold text-gray-900">
                      {family.members}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Collected
                    </p>

                    <p className="font-semibold text-gray-900">
                      {family.collected.toLocaleString()} RWF
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Paid
                    </p>

                    <p className="font-semibold text-green-600">
                      {family.paid}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Pending
                    </p>

                    <p className="font-semibold text-yellow-600">
                      {family.pending}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

        {/* NO DATA */}
        {!loading && families.length === 0 && !error && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">
              No family data available for {year}.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
