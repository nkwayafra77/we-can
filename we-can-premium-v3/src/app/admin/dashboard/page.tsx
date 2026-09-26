```tsx
'use client';

import { useEffect, useState } from 'react';
import YearSelector from '@/components/YearSelector';

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

export default function Admin() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/admin/dashboard?year=' + year)
      .then(r => r.json())
      .then(setData);
  };

  useEffect(() => {
    load();
  }, [year]);

  const init = async () => {
    setMsg('Initializing year...');

    const r = await fetch('/api/admin/initialize-year', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year }),
    });

    const j = await r.json();

    setMsg(r.ok ? j.message : j.error);
    load();
  };

  if (!data) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>Loading dashboard...</div>
      </main>
    );
  }

  const pending = data.transactions?.filter(
    (x: any) => x.status === 'pending'
  ) || [];

  return (
    <main style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>WE CAN</div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>
            Community contribution management
          </p>
        </div>

        <div style={styles.yearBox}>
          <span style={styles.yearLabel}>YEAR</span>
          <YearSelector year={year} onChange={setYear} />
        </div>
      </header>

      {/* YEAR INFORMATION */}
      <section style={styles.infoCard}>
        <div>
          <strong>📅 {year} Contributions</strong>
          <p style={styles.infoText}>
            Historical records remain available when a new year begins.
          </p>
        </div>

        <button style={styles.initButton} onClick={init}>
          Initialize {year}
        </button>
      </section>

      {msg && (
        <div style={styles.message}>
          {msg}
        </div>
      )}

      {/* SUMMARY */}
      <section style={styles.summaryGrid}>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>👥</div>
          <div>
            <span style={styles.summaryLabel}>Members</span>
            <strong style={styles.summaryValue}>{data.members}</strong>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💰</div>
          <div>
            <span style={styles.summaryLabel}>Collected</span>
            <strong style={styles.summaryValue}>
              {Number(data.collected).toLocaleString()} RWF
            </strong>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🎯</div>
          <div>
            <span style={styles.summaryLabel}>Expected</span>
            <strong style={styles.summaryValue}>
              {Number(data.expected).toLocaleString()} RWF
            </strong>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📊</div>
          <div>
            <span style={styles.summaryLabel}>Completion</span>
            <strong style={styles.summaryValue}>
              {data.percent}%
            </strong>
          </div>
        </div>

      </section>

      {/* PENDING PAYMENTS */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>🟡 Payment Requests</h2>
            <p style={styles.sectionSubtitle}>
              Payments waiting for admin confirmation
            </p>
          </div>

          <span style={styles.pendingBadge}>
            {pending.length} Pending
          </span>
        </div>

        {pending.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>✓</div>
            <strong>No pending payments</strong>
            <p>New payment requests will appear here.</p>
          </div>
        ) : (
          <div style={styles.pendingList}>
            {pending.map((x: any) => (
              <div key={x.id} style={styles.pendingCard}>

                <div>
                  <strong style={styles.memberName}>
                    {x.member?.name || 'Unknown Member'}
                  </strong>

                  <div style={styles.memberDetails}>
                    {x.member?.family || 'Unknown Family'}
                  </div>

                  <div style={styles.paymentDetails}>
                    Month {x.month} ·{' '}
                    {Number(x.amount).toLocaleString()} RWF
                  </div>
                </div>

                <div style={styles.pendingStatus}>
                  PENDING
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAMILY STANDING */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>🏆 Family Standing</h2>
            <p style={styles.sectionSubtitle}>
              Contribution progress for {year}
            </p>
          </div>
        </div>

        <div style={styles.familyGrid}>

          {data.families.map((family: any) => {

            const percent = Math.round(Number(family.percent) || 0);

            return (
              <div key={family.name} style={styles.familyCard}>

                <div style={styles.familyTop}>
                  <div style={styles.familyName}>
                    <span style={styles.familyIcon}>
                      {familyIcons[family.name] || '👥'}
                    </span>

                    <div>
                      <strong>{family.name}</strong>
                      <small>Community Family</small>
                    </div>
                  </div>

                  <strong style={styles.percent}>
                    {percent}%
                  </strong>
                </div>

                {/* PROGRESS BAR */}
                <div style={styles.progressBackground}>
                  <div
                    style={{
                      ...styles.progress,
                      width: `${percent}%`,
                      background:
                        percent >= 80
                          ? '#16a34a'
                          : percent >= 40
                          ? '#eab308'
                          : '#ef4444',
                    }}
                  />
                </div>

                <div style={styles.familyStats}>

                  <div>
                    <span style={styles.statLabel}>Paid</span>
                    <strong style={{ color: '#16a34a' }}>
                      {family.paid}
                    </strong>
                  </div>

                  <div>
                    <span style={styles.statLabel}>Pending</span>
                    <strong style={{ color: '#ca8a04' }}>
                      {family.pending || 0}
                    </strong>
                  </div>

                  <div>
                    <span style={styles.statLabel}>Collected</span>
                    <strong>
                      {Number(family.collected).toLocaleString()}
                    </strong>
                  </div>

                </div>

                <div style={styles.collected}>
                  💰 {Number(family.collected).toLocaleString()} RWF collected
                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* ALL TRANSACTIONS */}
      <section style={styles.section}>

        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>📋 Payment Records</h2>
            <p style={styles.sectionSubtitle}>
              All payment records for {year}
            </p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
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
              {data.transactions.map((x: any) => (

                <tr key={x.id}>

                  <td style={styles.td}>
                    <strong>{x.member?.name || 'Unknown'}</strong>
                  </td>

                  <td style={styles.td}>
                    {x.member?.family || 'Unknown'}
                  </td>

                  <td style={styles.td}>
                    {x.month}
                  </td>

                  <td style={styles.td}>
                    {Number(x.amount).toLocaleString()} RWF
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.status,
                        background:
                          x.status === 'paid'
                            ? '#dcfce7'
                            : x.status === 'pending'
                            ? '#fef3c7'
                            : '#fee2e2',
                        color:
                          x.status === 'paid'
                            ? '#166534'
                            : x.status === 'pending'
                            ? '#92400e'
                            : '#991b1b',
                      }}
                    >
                      {x.status.toUpperCase()}
                    </span>
                  </td>

                </tr>

              ))}
            </tbody>
          </table>
        </div>

      </section>

      <footer style={styles.footer}>
        ✨ God is Good ✨
      </footer>

    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {

  page: {
    maxWidth: 1250,
    margin: '0 auto',
    padding: '24px 18px 50px',
    fontFamily: 'Arial, sans-serif',
  },

  loading: {
    padding: 40,
    textAlign: 'center',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    marginBottom: 22,
    flexWrap: 'wrap',
  },

  brand: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 3,
    opacity: 0.65,
  },

  title: {
    margin: '4px 0',
    fontSize: 32,
  },

  subtitle: {
    margin: 0,
    opacity: 0.65,
  },

  yearBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  yearLabel: {
    fontSize: 12,
    fontWeight: 700,
    opacity: 0.6,
  },

  infoCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    padding: 18,
    borderRadius: 16,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    marginBottom: 18,
    flexWrap: 'wrap',
  },

  infoText: {
    margin: '6px 0 0',
    opacity: 0.65,
    fontSize: 14,
  },

  initButton: {
    border: 0,
    borderRadius: 10,
    padding: '10px 16px',
    background: '#111827',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },

  message: {
    padding: 12,
    borderRadius: 10,
    background: '#ecfdf5',
    color: '#166534',
    marginBottom: 18,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
    gap: 14,
  },

  summaryCard: {
    padding: 20,
    borderRadius: 18,
    background: 'white',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: 15,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 23,
  },

  summaryLabel: {
    display: 'block',
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 21,
  },

  section: {
    marginTop: 22,
    padding: 20,
    borderRadius: 20,
    background: 'white',
    border: '1px solid #e5e7eb',
    boxShadow: '0 5px 20px rgba(0,0,0,0.04)',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    marginBottom: 18,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 21,
  },

  sectionSubtitle: {
    margin: '5px 0 0',
    opacity: 0.6,
    fontSize: 14,
  },

  pendingBadge: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '7px 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
  },

  empty: {
    textAlign: 'center',
    padding: 30,
    background: '#f8fafc',
    borderRadius: 14,
    color: '#64748b',
  },

  emptyIcon: {
    fontSize: 30,
    color: '#16a34a',
    marginBottom: 8,
  },

  pendingList: {
    display: 'grid',
    gap: 10,
  },

  pendingCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    padding: 16,
    borderRadius: 14,
    background: '#fffbeb',
    border: '1px solid #fde68a',
  },

  memberName: {
    display: 'block',
    fontSize: 16,
  },

  memberDetails: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.65,
  },

  paymentDetails: {
    marginTop: 7,
    fontWeight: 700,
  },

  pendingStatus: {
    background: '#f59e0b',
    color: 'white',
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 800,
  },

  familyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
    gap: 15,
  },

  familyCard: {
    padding: 18,
    borderRadius: 17,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },

  familyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  familyName: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  familyIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 21,
  },

  percent: {
    fontSize: 20,
  },

  progressBackground: {
    height: 9,
    borderRadius: 999,
    background: '#e2e8f0',
    overflow: 'hidden',
    margin: '17px 0',
  },

  progress: {
    height: '100%',
    borderRadius: 999,
    transition: 'width .4s ease',
  },

  familyStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 8,
  },

  statLabel: {
    display: 'block',
    fontSize: 11,
    opacity: 0.55,
    marginBottom: 3,
  },

  collected: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: '1px solid #e2e8f0',
    fontSize: 13,
    fontWeight: 700,
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 700,
  },

  th: {
    textAlign: 'left',
    padding: 12,
    borderBottom: '2px solid #e5e7eb',
    fontSize: 12,
    textTransform: 'uppercase',
    opacity: 0.6,
  },

  td: {
    padding: 13,
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
  },

  status: {
    padding: '5px 9px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  },

  footer: {
    textAlign: 'center',
    marginTop: 30,
    fontWeight: 700,
    opacity: 0.65,
  },
};
```

### Important

This redesign **will not yet show Confirm/Reject buttons**, because your current backend has no admin endpoint for confirming or rejecting a payment.

So **don't deploy and expect the complete payment system yet**.

Next we should do the important part:

**`/api/payments` → manual MoMo submission → Pending → Admin Confirm/Reject.**

After that, I'll modify the member dashboard so the member sees:

**January ☑ + February ☑ → 2,000 RWF → Serge / MoMo → I HAVE PAID.**
