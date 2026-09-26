"use client";

import { useEffect, useMemo, useState } from "react";

const FAMILIES = [
  "Gentle Giants Family",
  "Kind Souls Family",
  "Little Lights Family",
  "Golden Hearts Family",
  "Faith Walkers Family",
  "Warriors Family",
  "Victorious Family",
  "Tigers Family",
  "Anointed Family",
  "Solidarity Family",
];

type Family = {
  family: string;
  members: number;
  paid: number;
  pending: number;
  collected: number;
  percentage: number;
};

export default function FamilyStandingPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const years = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    async function loadStanding() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/admin/dashboard?year=${year}`);

        if (!res.ok) {
          throw new Error("Unable to load family standing");
        }

        const data = await res.json();

        const apiFamilies = Array.isArray(data.families)
          ? data.families
          : [];

        const formatted: Family[] = FAMILIES.map((familyName) => {
          const found = apiFamilies.find(
            (item: any) =>
              item.family === familyName ||
              item.name === familyName
          );

          return {
            family: familyName,
            members: Number(found?.members ?? 0),
            paid: Number(found?.paid ?? found?.paidCount ?? 0),
            pending: Number(
              found?.pending ?? found?.pendingCount ?? 0
            ),
            collected: Number(found?.collected ?? 0),
            percentage: Number(
              found?.percentage ?? found?.percent ?? 0
            ),
          };
        });

        setFamilies(formatted);
      } catch (err) {
        console.error(err);
        setError("Unable to load family standing.");
      } finally {
        setLoading(false);
      }
    }

    loadStanding();
  }, [year]);

  const sortedFamilies = useMemo(() => {
    return [...families].sort(
      (a, b) => b.percentage - a.percentage
    );
  }, [families]);

  const totalCollected = families.reduce(
    (sum, family) => sum + family.collected,
    0
  );

  const totalMembers = families.reduce(
    (sum, family) => sum + family.members,
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

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🏅";
  };

  const getRankClass = (index: number) => {
    if (index === 0) return "first";
    if (index === 1) return "second";
    if (index === 2) return "third";
    return "";
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-RW").format(amount);
  };

  return (
    <main className="page">
      <div className="backgroundGlow glowOne" />
      <div className="backgroundGlow glowTwo" />

      <section className="container">
        {/* HEADER */}
        <header className="header">
          <a href="/" className="backButton">
            ← Back Home
          </a>

          <div className="hero">
            <div className="trophy">🏆</div>

            <p className="eyebrow">WE CAN COMMUNITY</p>

            <h1>Family Standing</h1>

            <p className="subtitle">
              Community Contribution Progress
            </p>

            <p className="description">
              See how our families are progressing together through
              monthly contributions.
            </p>
          </div>

          {/* YEAR */}
          <div className="yearBox">
            <label htmlFor="year">Contribution Year</label>

            <select
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* OVERVIEW */}
        <section className="overview">
          <div className="overviewCard">
            <div className="overviewIcon">👥</div>
            <div>
              <span>Total Members</span>
              <strong>{totalMembers}</strong>
            </div>
          </div>

          <div className="overviewCard">
            <div className="overviewIcon">💰</div>
            <div>
              <span>Total Collected</span>
              <strong>
                {formatMoney(totalCollected)}{" "}
                <small>RWF</small>
              </strong>
            </div>
          </div>

          <div className="overviewCard">
            <div className="overviewIcon">✅</div>
            <div>
              <span>Paid</span>
              <strong>{totalPaid}</strong>
            </div>
          </div>

          <div className="overviewCard">
            <div className="overviewIcon">⏳</div>
            <div>
              <span>Pending</span>
              <strong>{totalPending}</strong>
            </div>
          </div>
        </section>

        {/* SECTION TITLE */}
        <div className="sectionHeading">
          <div>
            <p className="smallLabel">COMMUNITY RANKING</p>
            <h2>Our Families</h2>
          </div>

          <span className="yearBadge">{year}</span>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Loading family standing...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="errorBox">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* FAMILY CARDS */}
        {!loading && !error && (
          <section className="families">
            {sortedFamilies.map((family, index) => {
              const percentage = Math.min(
                100,
                Math.max(0, family.percentage)
              );

              return (
                <article
                  key={family.family}
                  className={`familyCard ${getRankClass(index)}`}
                >
                  {/* TOP AREA */}
                  <div className="cardTop">
                    <div className="rankCircle">
                      {getMedal(index)}
                    </div>

                    <div className="familyInfo">
                      <p className="rankText">
                        {index === 0
                          ? "1ST PLACE"
                          : index === 1
                          ? "2ND PLACE"
                          : index === 2
                          ? "3RD PLACE"
                          : `#${index + 1}`}
                      </p>

                      <h3>{family.family}</h3>
                    </div>

                    <div className="percentage">
                      <strong>
                        {Math.round(percentage)}%
                      </strong>
                      <span>contribution</span>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="progressSection">
                    <div className="progressLabels">
                      <span>Contribution progress</span>
                      <strong>
                        {Math.round(percentage)}%
                      </strong>
                    </div>

                    <div className="progressTrack">
                      <div
                        className="progressFill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="stats">
                    <div className="stat">
                      <span className="statIcon">👥</span>
                      <div>
                        <small>Members</small>
                        <strong>{family.members}</strong>
                      </div>
                    </div>

                    <div className="stat">
                      <span className="statIcon">💰</span>
                      <div>
                        <small>Collected</small>
                        <strong>
                          {formatMoney(family.collected)}
                        </strong>
                        <em>RWF</em>
                      </div>
                    </div>

                    <div className="stat">
                      <span className="statIcon">✅</span>
                      <div>
                        <small>Paid</small>
                        <strong>{family.paid}</strong>
                      </div>
                    </div>

                    <div className="stat">
                      <span className="statIcon">⏳</span>
                      <div>
                        <small>Pending</small>
                        <strong>{family.pending}</strong>
                      </div>
                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div className="cardFooter">
                    <span>
                      {percentage >= 100
                        ? "🎉 Contribution goal reached"
                        : percentage > 0
                        ? "💪 Keep moving forward together"
                        : "🌱 Ready to get started"}
                    </span>

                    <span className="familyNumber">
                      Family {index + 1}
                    </span>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          sortedFamilies.length === 0 && (
            <div className="empty">
              <div>🏆</div>
              <h3>No family data yet</h3>
              <p>
                Family contribution information will appear here.
              </p>
            </div>
          )}

        {/* FOOTER */}
        <footer>
          <div className="footerLogo">WE CAN</div>

          <p>
            Together we contribute. Together we grow.
          </p>

          <div className="god">
            ✨ God is Good ✨
          </div>
        </footer>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at top left,
              rgba(99, 102, 241, 0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(16, 185, 129, 0.1),
              transparent 30%
            ),
            #f7f9fc;
          color: #172033;
          padding: 28px 18px 60px;
        }

        .backgroundGlow {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.18;
          pointer-events: none;
        }

        .glowOne {
          top: -200px;
          left: -180px;
          background: #6366f1;
        }

        .glowTwo {
          bottom: -220px;
          right: -180px;
          background: #10b981;
        }

        .container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .header {
          text-align: center;
          margin-bottom: 38px;
        }

        .backButton {
          display: inline-flex;
          align-items: center;
          padding: 10px 17px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #e5e9f2;
          color: #475569;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition: 0.2s ease;
          margin-bottom: 30px;
        }

        .backButton:hover {
          transform: translateY(-2px);
          background: white;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
        }

        .hero {
          max-width: 700px;
          margin: 0 auto;
        }

        .trophy {
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          border-radius: 24px;
          font-size: 38px;
          background: linear-gradient(
            135deg,
            #fff7d6,
            #fff
          );
          border: 1px solid #f2df9b;
          box-shadow:
            0 16px 35px rgba(180, 140, 20, 0.12);
        }

        .eyebrow,
        .smallLabel {
          margin: 0 0 8px;
          color: #6366f1;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        h1 {
          margin: 0;
          font-size: clamp(38px, 6vw, 66px);
          line-height: 1;
          letter-spacing: -0.055em;
          font-weight: 900;
          color: #101828;
        }

        .subtitle {
          margin: 15px 0 7px;
          font-size: clamp(18px, 3vw, 24px);
          font-weight: 800;
          color: #344054;
        }

        .description {
          max-width: 560px;
          margin: 0 auto;
          color: #667085;
          font-size: 15px;
          line-height: 1.6;
        }

        .yearBox {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 25px;
          padding: 8px 10px 8px 16px;
          border-radius: 16px;
          background: white;
          border: 1px solid #e4e8f0;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
        }

        .yearBox label {
          font-size: 13px;
          font-weight: 800;
          color: #667085;
        }

        .yearBox select {
          border: 0;
          outline: 0;
          background: #f1f3f9;
          border-radius: 11px;
          padding: 9px 13px;
          font-weight: 900;
          color: #111827;
          cursor: pointer;
        }

        .overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 45px;
        }

        .overviewCard {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid #e7eaf0;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.045);
        }

        .overviewIcon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #f1f3ff;
          font-size: 21px;
        }

        .overviewCard span {
          display: block;
          color: #667085;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .overviewCard strong {
          font-size: 19px;
          color: #101828;
        }

        .overviewCard small {
          font-size: 10px;
          color: #667085;
        }

        .sectionHeading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 20px;
        }

        .sectionHeading h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.035em;
          color: #101828;
        }

        .yearBadge {
          padding: 9px 15px;
          border-radius: 999px;
          background: #111827;
          color: white;
          font-size: 13px;
          font-weight: 900;
        }

        .families {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .familyCard {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e7eaf0;
          border-radius: 26px;
          padding: 22px;
          box-shadow: 0 14px 38px rgba(15, 23, 42, 0.055);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .familyCard::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 4px;
          background: #e6e9ef;
        }

        .familyCard.first::before {
          background: linear-gradient(
            90deg,
            #f6c453,
            #ffe7a3
          );
        }

        .familyCard.second::before {
          background: linear-gradient(
            90deg,
            #9ca3af,
            #e5e7eb
          );
        }

        .familyCard.third::before {
          background: linear-gradient(
            90deg,
            #cd7f32,
            #f2c49a
          );
        }

        .familyCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.09);
        }

        .cardTop {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .rankCircle {
          flex-shrink: 0;
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: #f6f7fb;
          font-size: 28px;
        }

        .first .rankCircle {
          background: #fff8dc;
        }

        .second .rankCircle {
          background: #f1f3f5;
        }

        .third .rankCircle {
          background: #fff0e5;
        }

        .familyInfo {
          min-width: 0;
          flex: 1;
        }

        .rankText {
          margin: 0 0 3px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          color: #98a2b3;
        }

        .familyInfo h3 {
          margin: 0;
          font-size: 18px;
          color: #172033;
          line-height: 1.2;
        }

        .percentage {
          text-align: right;
        }

        .percentage strong {
          display: block;
          font-size: 28px;
          letter-spacing: -0.04em;
          color: #111827;
        }

        .percentage span {
          display: block;
          color: #98a2b3;
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 800;
        }

        .progressSection {
          margin-top: 22px;
        }

        .progressLabels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 11px;
          color: #667085;
          font-weight: 700;
        }

        .progressLabels strong {
          color: #344054;
        }

        .progressTrack {
          height: 10px;
          width: 100%;
          background: #edf0f5;
          border-radius: 999px;
          overflow: hidden;
        }

        .progressFill {
          height: 100%;
          min-width: 0;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #6366f1,
            #8b5cf6
          );
          transition: width 0.7s ease;
        }

        .first .progressFill {
          background: linear-gradient(
            90deg,
            #eab308,
            #facc15
          );
        }

        .second .progressFill {
          background: linear-gradient(
            90deg,
            #64748b,
            #94a3b8
          );
        }

        .third .progressFill {
          background: linear-gradient(
            90deg,
            #c2410c,
            #ea580c
          );
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 20px;
        }

        .stat {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 8px;
          border-radius: 13px;
          background: #f8f9fb;
        }

        .statIcon {
          font-size: 14px;
        }

        .stat small {
          display: block;
          color: #98a2b3;
          font-size: 9px;
          font-weight: 700;
        }

        .stat strong {
          display: inline-block;
          margin-top: 1px;
          color: #344054;
          font-size: 13px;
        }

        .stat em {
          font-style: normal;
          color: #98a2b3;
          font-size: 8px;
          margin-left: 2px;
        }

        .cardFooter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid #eef0f4;
          color: #667085;
          font-size: 10px;
          font-weight: 700;
        }

        .familyNumber {
          color: #98a2b3;
          white-space: nowrap;
        }

        .loading {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #667085;
        }

        .spinner {
          width: 38px;
          height: 38px;
          border: 4px solid #e5e7eb;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .errorBox,
        .empty {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 1px solid #e7eaf0;
          border-radius: 25px;
        }

        .errorBox {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #b42318;
        }

        .empty div {
          font-size: 42px;
        }

        .empty h3 {
          margin: 12px 0 5px;
        }

        .empty p {
          color: #667085;
          margin: 0;
        }

        footer {
          text-align: center;
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid #e4e7ec;
        }

        .footerLogo {
          font-size: 19px;
          font-weight: 950;
          letter-spacing: 0.12em;
          color: #111827;
        }

        footer p {
          margin: 8px 0;
          color: #667085;
          font-size: 13px;
        }

        .god {
          margin-top: 15px;
          color: #667085;
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 850px) {
          .overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .families {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 18px 12px 40px;
          }

          .overview {
            gap: 9px;
          }

          .overviewCard {
            padding: 13px;
          }

          .overviewIcon {
            width: 38px;
            height: 38px;
            font-size: 17px;
          }

          .overviewCard strong {
            font-size: 15px;
          }

          .familyCard {
            padding: 17px;
            border-radius: 21px;
          }

          .cardTop {
            gap: 9px;
          }

          .rankCircle {
            width: 48px;
            height: 48px;
            font-size: 22px;
            border-radius: 14px;
          }

          .familyInfo h3 {
            font-size: 15px;
          }

          .percentage strong {
            font-size: 22px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat {
            padding: 10px;
          }

          .sectionHeading h2 {
            font-size: 25px;
          }

          .yearBox {
            width: fit-content;
          }
        }
      `}</style>
    </main>
  );
}
