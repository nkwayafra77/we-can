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

const MONTH_PRICE = 1000;

export default function Dashboard() {
  const [member, setMember] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wecan_member');

    if (saved) {
      setMember(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!member) return;

    loadPayments();
  }, [member, year]);

  async function loadPayments() {
    try {
      const response = await fetch(
        `/api/payments?member_id=${member.id}&year=${year}`
      );

      const result = await response.json();

      setPayments(result.data || []);
    } catch {
      setPayments([]);
    }
  }

  function toggleMonth(month: number) {
    const alreadySelected = selectedMonths.includes(month);

    if (alreadySelected) {
      setSelectedMonths(
        selectedMonths.filter((m) => m !== month)
      );
    } else {
      setSelectedMonths(
        [...selectedMonths, month].sort((a, b) => a - b)
      );
    }

    setMessage('');
  }

  function isPaid(month: number) {
    return payments.some(
      (payment) =>
        payment.month === month &&
        payment.year === year &&
        payment.status === 'paid'
    );
  }

  function isPending(month: number) {
    return payments.some(
      (payment) =>
        payment.month === month &&
        payment.year === year &&
        payment.status === 'pending'
    );
  }

  const totalAmount =
    selectedMonths.length * MONTH_PRICE;

  async function submitPayment() {
    if (selectedMonths.length === 0) {
      setMessage('Please select at least one month.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: member.id,
          year,
          months: selectedMonths,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error || 'Unable to submit payment.'
        );
        setLoading(false);
        return;
      }

      setMessage(
        'Payment submitted successfully. It is now pending confirmation.'
      );

      setSelectedMonths([]);

      await loadPayments();
    } catch {
      setMessage(
        'Unable to submit payment. Please try again.'
      );
    }

    setLoading(false);
  }

  const years = Array.from(
    { length: 7 },
    (_, index) =>
      new Date().getFullYear() - index
  );

  if (!member) {
    return (
      <main style={styles.page}>
        <div style={styles.centerCard}>
          <h2>Please login first.</h2>
          <p>
            Your member information could not be found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>
            <h1 style={styles.title}>
              Hello, {member.name} 👋
            </h1>

            <p style={styles.subtitle}>
              WE CAN Community Contribution
            </p>
          </div>

          <select
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setSelectedMonths([]);
              setMessage('');
            }}
            style={styles.yearSelect}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

        </header>

        {/* PAYMENT INFORMATION */}

        <section style={styles.paymentCard}>

          <div style={styles.paymentIcon}>
            📱
          </div>

          <div style={styles.paymentInfo}>
            <h2 style={styles.paymentTitle}>
              MTN MoMo Payment
            </h2>

            <p style={styles.paymentText}>
              Send your contribution to:
            </p>

            <div style={styles.recipient}>
              <strong>Recipient: Serge</strong>
            </div>

            <div style={styles.number}>
              MTN MoMo: <strong>0794077626</strong>
            </div>

            <div style={styles.code}>
              MoMo Code: <strong>1303352</strong>
            </div>
          </div>

        </section>

        {/* MONTH SELECTION */}

        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            Select Months
          </h2>

          <p style={styles.description}>
            Each month costs exactly{' '}
            <strong>1,000 RWF</strong>.
          </p>

          <div style={styles.monthGrid}>

            {MONTHS.map((month, index) => {
              const monthNumber = index + 1;

              const paid = isPaid(monthNumber);
              const pending = isPending(monthNumber);
              const selected =
                selectedMonths.includes(monthNumber);

              return (
                <button
                  key={month}
                  type="button"
                  disabled={paid || pending}
                  onClick={() =>
                    toggleMonth(monthNumber)
                  }
                  style={{
                    ...styles.monthButton,
                    ...(paid
                      ? styles.paidMonth
                      : pending
                      ? styles.pendingMonth
                      : selected
                      ? styles.selectedMonth
                      : {}),
                  }}
                >

                  <span>
                    {selected && !paid && !pending
                      ? '✓ '
                      : ''}
                    {month}
                  </span>

                  <span style={styles.monthStatus}>
                    {paid
                      ? 'PAID'
                      : pending
                      ? 'PENDING'
                      : '1,000 RWF'}
                  </span>

                </button>
              );
            })}

          </div>

        </section>

        {/* TOTAL */}

        <section style={styles.totalCard}>

          <div>
            <p style={styles.totalLabel}>
              SELECTED MONTHS
            </p>

            <h2 style={styles.totalMonths}>
              {selectedMonths.length}
            </h2>
          </div>

          <div style={styles.totalRight}>
            <p style={styles.totalLabel}>
              TOTAL TO PAY
            </p>

            <h2 style={styles.totalAmount}>
              {totalAmount.toLocaleString()} RWF
            </h2>
          </div>

        </section>

        {/* BUTTON */}

        <button
          type="button"
          onClick={submitPayment}
          disabled={
            loading ||
            selectedMonths.length === 0
          }
          style={{
            ...styles.payButton,
            ...(selectedMonths.length === 0
              ? styles.disabledButton
              : {}),
          }}
        >
          {loading
            ? 'Submitting...'
            : 'I HAVE PAID'}
        </button>

        {/* MESSAGE */}

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        {/* PAYMENT HISTORY */}

        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            Payment History — {year}
          </h2>

          {payments.length === 0 ? (

            <div style={styles.empty}>
              No payments recorded for {year}.
            </div>

          ) : (

            <div style={styles.history}>

              {payments
                .sort(
                  (a, b) => a.month - b.month
                )
                .map((payment) => (

                  <div
                    key={payment.id}
                    style={styles.historyRow}
                  >

                    <div>
                      <strong>
                        {MONTHS[payment.month - 1]}
                      </strong>

                      <small>
                        {payment.year}
                      </small>
                    </div>

                    <div style={styles.historyAmount}>
                      {Number(
                        payment.amount
                      ).toLocaleString()} RWF
                    </div>

                    <div
                      style={{
                        ...styles.status,
                        ...(payment.status ===
                        'paid'
                          ? styles.statusPaid
                          : payment.status ===
                            'pending'
                          ? styles.statusPending
                          : styles.statusUnpaid),
                      }}
                    >
                      {String(
                        payment.status
                      ).toUpperCase()}
                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

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
    fontFamily:
      'Arial, Helvetica, sans-serif',
  },

  container: {
    maxWidth: '950px',
    margin: '0 auto',
  },

  header: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    boxShadow:
      '0 6px 24px rgba(0,0,0,0.05)',
  },

  title: {
    margin: 0,
    color: '#111827',
    fontSize: '26px',
  },

  subtitle: {
    margin: '5px 0 0',
    color: '#6b7280',
  },

  yearSelect: {
    padding: '11px 15px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontWeight: 700,
  },

  paymentCard: {
    background: '#111827',
    color: '#ffffff',
    borderRadius: '20px',
    padding: '25px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    marginBottom: '20px',
  },

  paymentIcon: {
    fontSize: '40px',
  },

  paymentInfo: {
    flex: 1,
  },

  paymentTitle: {
    margin: 0,
    fontSize: '21px',
  },

  paymentText: {
    margin: '7px 0 15px',
    color: '#d1d5db',
  },

  recipient: {
    marginBottom: '8px',
  },

  number: {
    marginBottom: '8px',
  },

  code: {
    color: '#fde68a',
    fontWeight: 700,
  },

  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow:
      '0 6px 24px rgba(0,0,0,0.05)',
  },

  sectionTitle: {
    margin: 0,
    color: '#111827',
    fontSize: '21px',
  },

  description: {
    color: '#6b7280',
    marginBottom: '20px',
  },

  monthGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(190px,1fr))',
    gap: '12px',
  },

  monthButton: {
    border: '2px solid #e5e7eb',
    background: '#ffffff',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#111827',
  },

  selectedMonth: {
    borderColor: '#16a34a',
    background: '#dcfce7',
  },

  paidMonth: {
    borderColor: '#16a34a',
    background: '#dcfce7',
    color: '#166534',
    cursor: 'not-allowed',
  },

  pendingMonth: {
    borderColor: '#f59e0b',
    background: '#fef3c7',
    color: '#92400e',
    cursor: 'not-allowed',
  },

  monthStatus: {
    fontSize: '11px',
  },

  totalCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '22px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    boxShadow:
      '0 6px 24px rgba(0,0,0,0.05)',
  },

  totalLabel: {
    margin: 0,
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: 800,
  },

  totalMonths: {
    margin: '5px 0 0',
    fontSize: '25px',
  },

  totalRight: {
    textAlign: 'right',
  },

  totalAmount: {
    margin: '5px 0 0',
    fontSize: '25px',
    color: '#16a34a',
  },

  payButton: {
    width: '100%',
    padding: '17px',
    border: 'none',
    borderRadius: '14px',
    background: '#16a34a',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: 800,
    cursor: 'pointer',
    marginBottom: '15px',
  },

  disabledButton: {
    background: '#9ca3af',
    cursor: 'not-allowed',
  },

  message: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
  },

  history: {
    marginTop: '18px',
  },

  historyRow: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr auto',
    gap: '15px',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom:
      '1px solid #f0f0f0',
  },

  historyAmount: {
    fontWeight: 700,
  },

  status: {
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

  empty: {
    padding: '30px 0',
    color: '#6b7280',
    textAlign: 'center',
  },

  centerCard: {
    maxWidth: '500px',
    margin: '100px auto',
    padding: '40px',
    background: '#ffffff',
    borderRadius: '20px',
    textAlign: 'center',
  },

  footer: {
    textAlign: 'center',
    padding: '30px',
    color: '#6b7280',
  },
};
```
