```tsx
'use client';

import { useEffect, useState, type CSSProperties } from 'react';

type Family = {
  name: string;
  collected: number;
  paid: number;
  pending?: number;
  percent: number;
};

type Payment = {
  id: string;
  member_id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  payment_method?: string;
  payment_date?: string;
  notes?: string;
  member?: {
    name: string;
    family: string;
    phone: string;
  };
};

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

const familyIcons: Record<string, string> = {
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
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/dashboard?year=${year}`);
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || 'Unable to load dashboard');
        setData(null);
      } else {
        setData(result);
        setMessage('');
      }
    } catch {
      setMessage('Unable to connect to the server');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, [year]);

  const formatMoney = (value: number) =>
    Number(value || 0).toLocaleString() + ' RWF';

  const years = Array.from(
    { length: 7 },
    (_, index) => new Date().getFullYear() - index
  );

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>⏳</div>
          <h2>Loading WE CAN Dashboard...</h2>
          <p>Please wait a moment.</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={styles.page}>
        <div style={styles.errorCard}>
          <h2>Dashboard Error</h2>
          <p>{message || 'Something went wrong.'}</p>
          <button style={styles.button} onClick={loadDashboard}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const families: Family[] = data.families || [];
  const payments: Payment[] = data.transactions || [];

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <div style={styles.logoRow}>
              <div style={styles.logo}>WE</div>
              <div>
                <h1 style={styles.title}>WE CAN</h1>
                <p style={styles.subtitle}>Admin Dashboard</p>
              </div>
            </div>
          </div>

          <div style={styles.yearBox}>
            <label style={styles.yearLabel}>YEAR</label>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={styles.yearSelect}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* MESSAGE */}
        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section style={styles.summaryGrid}>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>👥</div>
            <div>
              <p style={styles.summaryLabel}>MEMBERS</p>
              <h2 style={styles.summaryValue}>
                {data.members || 0}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>💰</div>
            <div>
              <p style={styles.summaryLabel}>COLLECTED</p>
              <h2 style={styles.summaryValue}>
                {formatMoney(data.collected)}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>🎯</div>
            <div>
              <p style={styles.summaryLabel}>EXPECTED</p>
              <h2 style={styles.summaryValue}>
                {formatMoney(data.expected)}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>📊</div>
            <div>
              <p style={styles.summaryLabel}>COMPLETION</p>
              <h2 style={styles.summaryValue}>
                {data.percent || 0}%
              </h2>
            </div>
          </div>

        </section>

        {/* FAMILY STANDING */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Family Standing</h2>
              <p style={styles.sectionSubtitle}>
                Contribution progress for {year}
              </p>
            </div>
          </div>

          <div style={styles.familyGrid}>

            {families.map((family) => {
              const percent = Number(family.percent || 0);

              const progressColor =
                percent >= 80
                  ? '#16a34a'
                  : percent >= 50
                    ? '#f59e0b'
                    : '#dc2626';

              return (
                <div key={family.name} style={styles.familyCard}>

                  <div style={styles.familyTop}>
                    <div style={styles.familyIcon}>
                      {familyIcons[family.name] || '👥'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={styles.familyName}>
                        {family.name}
                      </h3>

                      <p style={styles.familyPercent}>
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

                  {/* PROGRESS BAR */}
                  <div style={styles.progressBackground}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(percent, 100)}%`,
                        background: progressColor,
                      }}
                    />
                  </div>

                  <div style={styles.familyStats}>

                    <div>
                      <span style={styles.statLabel}>Paid</span>
                      <strong style={styles.statValue}>
                        {family.paid || 0}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.statLabel}>Pending</span>
                      <strong style={styles.statValue}>
                        {family.pending || 0}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.statLabel}>Collected</span>
                      <strong style={styles.statValue}>
                        {formatMoney(family.collected)}
                      </strong>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        </section>

        {/* PAYMENT REQUESTS */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Payment Requests
              </h2>

              <p style={styles.sectionSubtitle}>
                Review member payment activity
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>💳</div>
              <h3>No payment records yet</h3>
              <p>
                Payment requests will appear here when members submit
                their payments.
              </p>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Member</th>
                      <th style={styles.th}>Family</th>
                      <th style={styles.th}>Month</th>
                      <th style={styles.th}>Year</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => {

                      const status = payment.status;

                      const statusStyle =
                        status === 'paid'
                          ? styles.statusPaid
                          : status === 'pending'
                            ? styles.statusPending
                            : styles.statusUnpaid;

                      return (
                        <tr key={payment.id}>

                          <td style={styles.td}>
                            <strong>
                              {payment.member?.name || 'Unknown'}
                            </strong>
                          </td>

                          <td style={styles.td}>
                            {payment.member?.family || '—'}
                          </td>

                          <td style={styles.td}>
                            {MONTHS[payment.month - 1] || '—'}
                          </td>

                          <td style={styles.td}>
                            {payment.year}
                          </td>

                          <td style={styles.td}>
                            {formatMoney(payment.amount)}
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.status,
                                ...statusStyle,
                              }}
                            >
                              {status.toUpperCase()}
                            </span>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <p>✨ God is Good ✨</p>
          <span>WE CAN Community Contribution System</span>
        </footer>

      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {

  page: {
    minHeight: '100vh',
    background: '#f4f7fb',
    padding: '24px',
    fontFamily:
      'Arial, Helvetica, sans-serif',
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
    boxShadow:
      '0 8px 30px rgba(0,0,0,0.06)',
    marginBottom: '24px',
  },

  logoRow: {
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
    fontSize: '18px',
  },

  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 800,
    color: '#111827',
  },

  subtitle: {
    margin: '3px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },

  yearBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },

  yearLabel: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#6b7280',
  },

  yearSelect: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  message: {
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    color: '#9a3412',
    padding: '14px 18px',
    borderRadius: '12px',
    marginBottom: '20px',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '30px',
  },

  summaryCard: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow:
      '0 6px 24px rgba(0,0,0,0.05)',
  },

  summaryIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '23px',
  },

  summaryLabel: {
    margin: 0,
    fontSize: '11px',
    fontWeight: 800,
    color: '#6b7280',
    letterSpacing: '0.5px',
  },

  summaryValue: {
    margin: '5px 0 0',
    fontSize: '22px',
    fontWeight: 800,
    color: '#111827',
  },

  section: {
    marginBottom: '30px',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 800,
    color: '#111827',
  },

  sectionSubtitle: {
    margin: '5px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },

  familyGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '18px',
  },

  familyCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow:
      '0 6px 24px rgba(0,0,0,0.05)',
  },

  familyTop: {
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

  familyName: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 800,
    color: '#111827',
  },

  familyPercent: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#6b7280',
  },

  percentCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: '4px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
    color: '#111827',
    flexShrink: 0,
  },

  progressBackground: {
    height: '9px',
    background: '#e5e7eb',
    borderRadius: '20px',
    overflow: 'hidden',
    marginTop: '18px',
  },

  progressFill: {
    height: '100%',
    borderRadius: '20px',
    transition: 'width 0.3s ease',
  },

  familyStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginTop: '18px',
  },

  statLabel: {
    display: 'block',
    color: '#6b7280',
    fontSize: '11px',
    marginBottom: '4px',
  },

  statValue: {
    display: 'block',
    color: '#111827',
    fontSize: '13px',
  },

  tableCard: {
    background: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow:
      '0 6px 24px rgba(0,0,0,0.05)',
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px',
  },

  th: {
    textAlign: 'left',
    padding: '15px 18px',
    background: '#f9fafb',
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
  },

  td: {
    padding: '16px 18px',
    borderTop: '1px solid #f0f0f0',
    color: '#374151',
    fontSize: '13px',
  },

  status: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 800,
  },

  statusPaid: {
    background: '#dcfce7',
    color: '#166534',
  },

  statusPending: {
    background: '#fef3c7',
    color: '#92400e',
  },

  statusUnpaid: {
    background: '#fee2e2',
    color: '#991b1b',
  },

  emptyCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '50px 20px',
    textAlign: 'center',
    boxShadow:
      '0 6px 24px rgba(0,0,0,0.05)',
  },

  emptyIcon: {
    fontSize: '42px',
    marginBottom: '10px',
  },

  loadingCard: {
    maxWidth: '500px',
    margin: '100px auto',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '50px',
    textAlign: 'center',
    boxShadow:
      '0 8px 30px rgba(0,0,0,0.06)',
  },

  loadingIcon: {
    fontSize: '40px',
    marginBottom: '15px',
  },

  errorCard: {
    maxWidth: '500px',
    margin: '100px auto',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    boxShadow:
      '0 8px 30px rgba(0,0,0,0.06)',
  },

  button: {
    marginTop: '15px',
    padding: '12px 20px',
    border: 'none',
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
```
