```tsx
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

export default function Dashboard() {
  const [member, setMember] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selected, setSelected] = useState<number[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('wecan_member');

    if (saved) {
      setMember(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!member) return;

    fetch(
      '/api/payments?member_id=' +
        member.id +
        '&year=' +
        year
    )
      .then((r) => r.json())
      .then((j) => setPayments(j.data || []))
      .catch(() => setPayments([]));
  }, [member, year]);

  function toggleMonth(month: number) {
    if (selected.includes(month)) {
      setSelected(
        selected.filter((m) => m !== month)
      );
    } else {
      setSelected(
        [...selected, month].sort(
          (a, b) => a - b
        )
      );
    }
  }

  function status(month: number) {
    const payment = payments.find(
      (p) =>
        p.month === month &&
        p.year === year
    );

    return payment?.status || 'unpaid';
  }

  const total = selected.length * 1000;

  const years = Array.from(
    { length: 7 },
    (_, i) =>
      new Date().getFullYear() - i
  );

  if (!member) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h2>Please login first.</h2>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <h1>Hello, {member.name} 👋</h1>
            <p>WE CAN Community Contribution</p>
          </div>

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

        <div style={styles.paymentBox}>
          <h2>📱 MTN MoMo Payment</h2>

          <p>Send your contribution to:</p>

          <p>
            <strong>Recipient:</strong> Serge
          </p>

          <p>
            <strong>MTN MoMo:</strong> 0794077626
          </p>

          <p>
            <strong>MoMo Code:</strong> 1303352
          </p>
        </div>

        <div style={styles.card}>
          <h2>Select Months</h2>

          <p>
            Each month costs exactly{' '}
            <strong>1,000 RWF</strong>.
          </p>

          <div style={styles.months}>
            {MONTHS.map((month, index) => {
              const number = index + 1;
              const currentStatus =
                status(number);

              const isSelected =
                selected.includes(number);

              return (
                <button
                  key={month}
                  type="button"
                  disabled={
                    currentStatus === 'paid' ||
                    currentStatus === 'pending'
                  }
                  onClick={() =>
                    toggleMonth(number)
                  }
                  style={{
                    ...styles.month,
                    ...(isSelected
                      ? styles.selected
                      : {}),
                  }}
                >
                  {month}

                  <small>
                    {currentStatus === 'paid'
                      ? 'PAID'
                      : currentStatus ===
                        'pending'
                      ? 'PENDING'
                      : '1,000 RWF'}
                  </small>
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.total}>
          <div>
            <small>SELECTED MONTHS</small>
            <h2>{selected.length}</h2>
          </div>

          <div style={styles.totalRight}>
            <small>TOTAL</small>
            <h2>
              {total.toLocaleString()} RWF
            </h2>
          </div>
        </div>

        <button
          type="button"
          disabled={selected.length === 0}
          style={styles.payButton}
        >
          I HAVE PAID
        </button>

        <div style={styles.card}>
          <h2>
            Payment History — {year}
          </h2>

          {payments.length === 0 ? (
            <p>No payments recorded yet.</p>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                style={styles.history}
              >
                <strong>
                  {MONTHS[payment.month - 1]}
                </strong>

                <span>
                  {Number(
                    payment.amount
                  ).toLocaleString()}{' '}
                  RWF
                </span>

                <strong>
                  {String(
                    payment.status
                  ).toUpperCase()}
                </strong>
              </div>
            ))
          )}
        </div>

        <footer style={styles.footer}>
          ✨ God is Good ✨
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
    fontFamily: 'Arial',
  },

  container: {
    maxWidth: '950px',
    margin: '0 auto',
  },

  header: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '18px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  select: {
    padding: '10px',
    borderRadius: '8px',
  },

  paymentBox: {
    background: '#111827',
    color: '#ffffff',
    padding: '25px',
    borderRadius: '18px',
    marginBottom: '20px',
  },

  card: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '18px',
    marginBottom: '20px',
  },

  months: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(180px,1fr))',
    gap: '10px',
  },

  month: {
    padding: '15px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    background: '#ffffff',
    cursor: 'pointer',
    fontWeight: 700,
    display: 'flex',
    justifyContent: 'space-between',
  },

  selected: {
    background: '#dcfce7',
    borderColor: '#16a34a',
  },

  total: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '18px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
  },

  totalRight: {
    textAlign: 'right',
  },

  payButton: {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    background: '#16a34a',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '16px',
    marginBottom: '20px',
  },

  history: {
    padding: '14px 0',
    borderBottom: '1px solid #eeeeee',
    display: 'flex',
    justifyContent: 'space-between',
  },

  footer: {
    textAlign: 'center',
    padding: '30px',
    color: '#6b7280',
  },
};
```
