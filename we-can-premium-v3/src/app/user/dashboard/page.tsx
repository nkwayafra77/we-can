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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('wecan_member');

    if (saved) {
      try {
        setMember(JSON.parse(saved));
      } catch {
        setMember(null);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!member) return;

    loadPayments();
  }, [member, year]);

  async function loadPayments() {
    try {
      const response = await fetch(
        '/api/payments?member_id=' +
          member.id +
          '&year=' +
          year
      );

      const data = await response.json();

      setPayments(data.data || []);
    } catch {
      setPayments([]);
    }
  }

  function toggleMonth(month: number) {
    setMessage('');
    setError('');

    setSelected((current) => {
      if (current.includes(month)) {
        return current.filter((m) => m !== month);
      }

      return [...current, month].sort((a, b) => a - b);
    });
  }

  async function submitPayment() {
    if (selected.length === 0) {
      setError('Please select at least one month.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: member.id,
          year: year,
          months: selected,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Payment request failed.');
        return;
      }

      setMessage(
        'Payment request submitted successfully. It is now pending admin confirmation.'
      );

      setSelected([]);

      await loadPayments();
    } catch {
      setError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const total = selected.length * 1000;

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f5f7fb',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h2>Loading...</h2>
      </main>
    );
  }

  if (!member) {
    return (
      <main
        style={{
          minHeight: '100vh',
          padding: '40px 20px',
          background: '#f5f7fb',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 600,
            margin: '80px auto',
            background: '#ffffff',
            padding: 30,
            borderRadius: 16,
            textAlign: 'center',
            boxShadow:
              '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <h1>WE CAN</h1>

          <p>
            Member information was not found.
          </p>

          <p>
            Please return to the member login page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {/* HEADER */}

        <header
          style={{
            background: '#111827',
            color: '#ffffff',
            padding: '24px',
            borderRadius: 16,
            marginBottom: 20,
          }}
        >
          <h1 style={{ margin: 0 }}>
            WE CAN Member Dashboard
          </h1>

          <p style={{ marginBottom: 0 }}>
            Welcome, <strong>{member.name}</strong>
          </p>

          <p style={{ marginBottom: 0 }}>
            Family: <strong>{member.family}</strong>
          </p>
        </header>

        {/* PAYMENT SECTION */}

        <section
          style={{
            background: '#ffffff',
            padding: 24,
            borderRadius: 16,
            marginBottom: 20,
            boxShadow:
              '0 3px 15px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 15,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <h2 style={{ margin: 0 }}>
              Make Contribution
            </h2>

            <select
              value={year}
              onChange={(e) => {
                setYear(Number(e.target.value));
                setSelected([]);
                setMessage('');
                setError('');
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border:
                  '1px solid #d1d5db',
                fontSize: 16,
              }}
            >
              {Array.from(
                { length: 10 },
                (_, i) => {
                  const y =
                    new Date().getFullYear() - i;

                  return (
                    <option
                      key={y}
                      value={y}
                    >
                      {y}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          {/* MOMO DETAILS */}

          <div
            style={{
              background: '#fff7ed',
              border:
                '1px solid #fed7aa',
              padding: 18,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              MTN MoMo Payment
            </h3>

            <p>
              <strong>Recipient:</strong>{' '}
              Serge
            </p>

            <p>
              <strong>
                MTN MoMo Number:
              </strong>{' '}
              0794077626
            </p>

            <p>
              <strong>MoMo Code:</strong>{' '}
              1303352
            </p>

            <p
              style={{
                marginBottom: 0,
              }}
            >
              Send{' '}
              <strong>
                1,000 RWF per month
              </strong>
              .
            </p>
          </div>

          {/* MONTHS */}

          <h3>Select Month(s)</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            {MONTHS.map(
              (month, index) => {
                const monthNumber =
                  index + 1;

                const payment =
                  payments.find(
                    (p) =>
                      p.month ===
                      monthNumber
                  );

                const isSelected =
                  selected.includes(
                    monthNumber
                  );

                const isPaid =
                  payment?.status ===
                  'paid';

                const isPending =
                  payment?.status ===
                  'pending';

                return (
                  <button
                    key={month}
                    type="button"
                    disabled={
                      isPaid ||
                      isPending ||
                      submitting
                    }
                    onClick={() =>
                      toggleMonth(
                        monthNumber
                      )
                    }
                    style={{
                      padding:
                        '16px 10px',
                      borderRadius: 10,
                      border:
                        isSelected
                          ? '2px solid #2563eb'
                          : '1px solid #d1d5db',
                      cursor:
                        isPaid ||
                        isPending ||
                        submitting
                          ? 'not-allowed'
                          : 'pointer',
                      background:
                        isPaid
                          ? '#dcfce7'
                          : isPending
                          ? '#fef3c7'
                          : isSelected
                          ? '#dbeafe'
                          : '#ffffff',
                      color:
                        '#111827',
                      fontWeight: 600,
                    }}
                  >
                    {month}

                    <div
                      style={{
                        fontSize: 12,
                        marginTop: 6,
                      }}
                    >
                      {isPaid
                        ? 'PAID'
                        : isPending
                        ? 'PENDING'
                        : '1,000 RWF'}
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* MESSAGE */}

          {message && (
            <div
              style={{
                marginTop: 20,
                padding: 15,
                borderRadius: 10,
                background:
                  '#dcfce7',
                color: '#166534',
                fontWeight: 600,
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: 20,
                padding: 15,
                borderRadius: 10,
                background:
                  '#fee2e2',
                color: '#991b1b',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {/* TOTAL */}

          <div
            style={{
              marginTop: 25,
              padding: 20,
              background: '#f3f4f6',
              borderRadius: 12,
            }}
          >
            <p>
              Selected months:{' '}
              <strong>
                {selected.length}
              </strong>
            </p>

            <p
              style={{
                fontSize: 22,
              }}
            >
              Total:{' '}
              <strong>
                {total.toLocaleString()}{' '}
                RWF
              </strong>
            </p>

            <button
              type="button"
              disabled={
                selected.length === 0 ||
                submitting
              }
              onClick={submitPayment}
              style={{
                width: '100%',
                padding: 15,
                border: 'none',
                borderRadius: 10,
                background:
                  selected.length === 0 ||
                  submitting
                    ? '#9ca3af'
                    : '#16a34a',
                color: '#ffffff',
                fontSize: 17,
                fontWeight: 700,
                cursor:
                  selected.length === 0 ||
                  submitting
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {submitting
                ? 'SUBMITTING...'
                : 'I HAVE PAID'}
            </button>
          </div>
        </section>

        {/* PAYMENT HISTORY */}

        <section
          style={{
            background: '#ffffff',
            padding: 24,
            borderRadius: 16,
            marginBottom: 20,
            boxShadow:
              '0 3px 15px rgba(0,0,0,0.06)',
          }}
        >
          <h2>
            Payment History — {year}
          </h2>

          {payments.length === 0 ? (
            <p>
              No payment records for{' '}
              {year}.
            </p>
          ) : (
            <div
              style={{
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse:
                    'collapse',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: 12,
                        textAlign:
                          'left',
                      }}
                    >
                      Month
                    </th>

                    <th
                      style={{
                        padding: 12,
                        textAlign:
                          'left',
                      }}
                    >
                      Amount
                    </th>

                    <th
                      style={{
                        padding: 12,
                        textAlign:
                          'left',
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map(
                    (payment) => (
                      <tr
                        key={
                          payment.id
                        }
                      >
                        <td
                          style={{
                            padding: 12,
                          }}
                        >
                          {
                            MONTHS[
                              payment
                                .month -
                                1
                            ]
                          }
                        </td>

                        <td
                          style={{
                            padding: 12,
                          }}
                        >
                          {Number(
                            payment.amount
                          ).toLocaleString()}{' '}
                          RWF
                        </td>

                        <td
                          style={{
                            padding: 12,
                            fontWeight:
                              700,
                          }}
                        >
                          {payment.status.toUpperCase()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer
          style={{
            textAlign: 'center',
            padding: 25,
            color: '#6b7280',
          }}
        >
          ✨ God is Good ✨
        </footer>
      </div>
    </main>
  );
}
