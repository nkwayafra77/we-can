'use client';

import { useEffect, useState } from 'react';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const FAMILY_ICONS: Record<string, string> = {
  'Gentle Giants Family': '🦍',
  'Kind Souls Family': '💙',
  'Little Lights Family': '💡',
  'Golden Hearts Family': '💛',
  'Faith Walkers Family': '🙏',
  'Warriors Family': '⚔️',
  'Victorious Family': '🏆',
  'Tigers Family': '🐯',
  'Anointed Family': '✨',
  'Solidarity Family': '🤝',
};

export default function AdminDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        '/api/admin/dashboard?year=' + year
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Unable to load dashboard');
        setLoading(false);
        return;
      }

      setData(result);
    } catch (err) {
      setError('Unable to connect to the server');
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, [year]);

  const money = (value: number) =>
    Number(value || 0).toLocaleString() + ' RWF';

  const years = Array.from(
    { length: 7 },
    (_, i) => new Date().getFullYear() - i
  );

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.centerCard}>
          <div style={styles.bigIcon}>⏳</div>
          <h2>Loading WE CAN Dashboard...</h2>
          <p>Please wait.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.page}>
        <div style={styles.centerCard}>
          <div style={styles.bigIcon}>⚠️</div>
          <h2>Dashboard Error</h2>
          <p>{error}</p>
          <button
            style={styles.button}
            onClick={loadDashboard}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const families = data?.families || [];
  const transactions = data?.transactions || [];

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logo}>WE</div>

            <div>
              <h1 style={styles.title}>WE CAN</h1>
              <p style={styles.subtitle}>
                Admin Dashboard
              </p>
            </div>
          </div>

          <div>
            <div style={styles.yearLabel}>YEAR</div>

            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
              style={styles.select}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section style={styles.summaryGrid}>

          <div style={styles.card}>
            <div style={styles.cardIcon}>👥</div>
            <div>
              <div style={styles.label}>MEMBERS</div>
              <div style={styles.value}>
                {data?.members || 0}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>💰</div>
            <div>
              <div style={styles.label}>COLLECTED</div>
              <div style={styles.value}>
                {money(data?.collected)}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>🎯</div>
            <div>
              <div style={styles.label}>EXPECTED</div>
              <div style={styles.value}>
                {money(data?.expected)}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>📊</div>
            <div>
              <div style={styles.label}>COMPLETION</div>
              <div style={styles.value}>
                {data?.percent || 0}%
              </div>
            </div>
          </div>

        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.sectionTitle}>
                Family Standing
              </h2>

              <p style={styles.sectionSubtitle}>
                Contribution progress for {year}
              </p>
            </div>
          </div>

          <div style={styles.familyGrid}>

            {families.map((family: any) => {

              const percent = Number(
                family.percent || 0
              );

              let progressColor = '#dc2626';

              if (percent >= 80) {
                progressColor = '#16a34a';
              } else if (percent >= 50) {
                progressColor = '#f59e0b';
              }

              return (
                <div
                  key={family.name}
                  style={styles.familyCard}
                >

                  <div style={styles.familyHeader}>

                    <div style={styles.familyIcon}>
                      {FAMILY_ICONS[family.name] || '👥'}
                    </div>

                    <div style={styles.familyInfo}>
                      <h3 style={styles.familyName}>
                        {family.name}
                      </h3>

                      <p style={styles.familySmall}>
                        {Math.round(percent)}% complete
                      </p>
                    </div>

                    <div
                      style={{
                        ...styles.percentCircle,
                        borderColor: progressColor,
                      }}
                    >
                      {Math.round(percent)}%
                    </div>

                  </div>

                  <div style={styles.progressBackground}>
                    <div
                      style={{
                        ...styles.progress,
                        width:
                          Math.min(percent, 100) + '%',
                        background:
                          progressColor,
                      }}
                    />
                  </div>

                  <div style={styles.stats}>

                    <div>
                      <span style={styles.statLabel}>
                        Paid
                      </span>

                      <strong style={styles.statValue}>
                        {family.paid || 0}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.statLabel}>
                        Pending
                      </span>

                      <strong style={styles.statValue}>
                        {family.pending || 0}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.statLabel}>
                        Collected
                      </span>

                      <strong style={styles.statValue}>
                        {money(family.collected)}
                      </strong>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        </section>

        <section style={styles.section}>

          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.sectionTitle}>
                Payment Records
              </h2>

              <p style={styles.sectionSubtitle}>
                Payment activity for {year}
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (

            <div style={styles.emptyCard}>
              <div style={styles.bigIcon}>💳</div>

              <h3>No payment records yet</h3>

              <p>
                Payment requests will appear here when
                members submit them.
              </p>
            </div>

          ) : (

            <div style={styles.tableCard}>
              <div style={styles.tableScroll}>

                <table style={styles.table}>

                  <thead>
                    <tr>
                      <th style={styles.th}>Member</th>
                      <th style={styles.th}>Family</th>
                      <th style={styles.th}>Month</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {transactions.map((payment: any) => (

                      <tr key={payment.id}>

                        <td style={styles.td}>
                          <strong>
                            {payment.member?.name ||
                              'Unknown'}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {payment.member?.family || '—'}
                        </td>

                        <td style={styles.td}>
                          {MONTHS[payment.month - 1] ||
                            '—'}
                        </td>

                        <td style={styles.td}>
                          {money(payment.amount)}
                        </td>

                        <td style={styles.td}>

                          <span
                            style={{
                              ...styles.status,
                              ...(payment.status === 'paid'
                                ? styles.paid
                                : payment.status ===
                                  'pending'
                                ? styles.pending
                                : styles.unpaid),
                            }}
                          >
                            {String(
                              payment.status || 'unpaid'
                            ).toUpperCase()}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            </div>

          )}

        </section>

        <footer style={styles.footer}>
          <div>✨ God is Good ✨</div>
          <small>
            WE CAN Community Contribution System
          </small>
        </footer>

      </div>
    </main>
  );
}

const styles: any = {

  page: {
    minHeight: '100vh',
    background: '#f4f7fb',
    padding: '24px',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },

  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },

  header: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
    marginBottom: '24px',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  logo: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#111827',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
  },

  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 800,
    color: '#111827',
  },

  subtitle: {
    margin: '4px 0 0',
    color: '#6b7280',
  },

  yearLabel: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#6b7280',
    marginBottom: '5px',
  },

  select: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontWeight: 700,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(220px,1fr))',
    gap: '16px',
    marginBottom: '30px',
  },

  card: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
  },

  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },

  label: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#6b7280',
  },

  value: {
    marginTop: '5px',
    fontSize: '21px',
    fontWeight: 800,
    color: '#111827',
  },

  section: {
    marginBottom: '30px',
  },

  sectionHeading: {
    marginBottom: '16px',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#111827',
  },

  sectionSubtitle: {
    margin: '5px 0 0',
    color: '#6b7280',
  },

  familyGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(300px,1fr))',
    gap: '18px',
  },

  familyCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
  },

  familyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  familyIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '23px',
  },

  familyInfo: {
    flex: 1,
  },

  familyName: {
    margin: 0,
    fontSize: '15px',
    color: '#111827',
  },

  familySmall: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#6b7280',
  },

  percentCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '4px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '12px',
  },

  progressBackground: {
    height: '9px',
    background: '#e5e7eb',
    borderRadius: '20px',
    overflow: 'hidden',
    marginTop: '18px',
  },

  progress: {
    height: '100%',
    borderRadius: '20px',
  },

  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginTop: '18px',
  },

  statLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#6b7280',
  },

  statValue: {
    display: 'block',
    marginTop: '4px',
    fontSize: '13px',
    color: '#111827',
  },

  tableCard: {
    background: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
  },

  tableScroll: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },

  th: {
    textAlign: 'left',
    padding: '15px 18px',
    background: '#f9fafb',
    color: '#6b7280',
    fontSize: '11px',
  },

  td: {
    padding: '16px 18px',
    borderTop: '1px solid #f0f0f0',
    fontSize: '13px',
    color: '#374151',
  },

  status: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 800,
  },

  paid: {
    background: '#dcfce7',
    color: '#166534',
  },

  pending: {
    background: '#fef3c7',
    color: '#92400e',
  },

  unpaid: {
    background: '#fee2e2',
    color: '#991b1b',
  },

  emptyCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '50px',
    textAlign: 'center',
  },

  centerCard: {
    maxWidth: '500px',
    margin: '100px auto',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '50px',
    textAlign: 'center',
  },

  bigIcon: {
    fontSize: '40px',
    marginBottom: '15px',
  },

  button: {
    marginTop: '15px',
    padding: '12px 20px',
    border: 0,
    borderRadius: '10px',
    background: '#111827',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
  },

  footer: {
    textAlign: 'center',
    padding: '30px 10px',
    color: '#6b7280',
  },
};
