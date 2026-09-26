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

type Payment = {
  id: string;
  member_id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  payment_method?: string;
  payment_date?: string | null;
  created_at?: string;
  member?: {
    name: string;
    family: string;
    phone: string;
  } | null;
};

type Family = {
  name: string;
  members: number;
  collected: number;
  paid: number;
  pending: number;
  percent: number;
};

export default function AdminDashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const years = Array.from(
    { length: 11 },
    (_, i) => new Date().getFullYear() - i
  );

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/admin/dashboard?year=${year}`,
        {
          cache: 'no-store',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || 'Failed to load dashboard.'
        );
        return;
      }

      setData(result);
    } catch {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [year]);

  async function handlePayment(
    paymentId: string,
    action: 'confirm' | 'reject'
  ) {
    const question =
      action === 'confirm'
        ? 'Confirm this payment? Make sure you have received the money on Serge MTN MoMo.'
        : 'Reject this payment?';

    if (!window.confirm(question)) {
      return;
    }

    setActionLoading(paymentId);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        '/api/admin/payments',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_id: paymentId,
            action,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || 'Payment action failed.'
        );
        return;
      }

      setMessage(
        result.message ||
          'Payment updated successfully.'
      );

      await loadDashboard();
    } catch {
      setError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setActionLoading('');
    }
  }

  const transactions: Payment[] =
    data?.transactions || [];

  const pendingPayments = transactions.filter(
    (payment) => payment.status === 'pending'
  );

  const paidPayments = transactions.filter(
    (payment) => payment.status === 'paid'
  );

  const families: Family[] =
    data?.families || [];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: '#111827',
            color: 'white',
            padding: '25px',
            borderRadius: '18px',
            marginBottom: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '28px',
              }}
            >
              WE CAN Admin Dashboard
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#d1d5db',
              }}
            >
              Manage members and confirm payments
            </p>
          </div>

          <select
            value={year}
            onChange={(e) =>
              setYear(Number(e.target.value))
            }
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* MESSAGES */}
        {message && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontWeight: 'bold',
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontWeight: 'bold',
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '15px',
              textAlign: 'center',
            }}
          >
            Loading dashboard...
          </div>
        )}

        {!loading && data && (
          <>
            {/* SUMMARY CARDS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '18px',
                marginBottom: '25px',
              }}
            >
              <SummaryCard
                title="Members"
                value={data.members}
                icon="👥"
              />

              <SummaryCard
                title="Collected"
                value={`${Number(
                  data.collected || 0
                ).toLocaleString()} RWF`}
                icon="💰"
              />

              <SummaryCard
                title="Expected"
                value={`${Number(
                  data.expected || 0
                ).toLocaleString()} RWF`}
                icon="🎯"
              />

              <SummaryCard
                title="Pending"
                value={data.pendingCount}
                icon="⏳"
              />

              <SummaryCard
                title="Paid Records"
                value={paidPayments.length}
                icon="✅"
              />
            </div>

            {/* PENDING PAYMENTS */}
            <section
              style={{
                background: 'white',
                borderRadius: '18px',
                padding: '25px',
                marginBottom: '25px',
                boxShadow:
                  '0 4px 15px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '23px',
                    }}
                  >
                    ⏳ Pending Payments
                  </h2>

                  <p
                    style={{
                      color: '#6b7280',
                      marginTop: '7px',
                    }}
                  >
                    Check Serge&apos;s MTN MoMo before
                    confirming.
                  </p>
                </div>

                <div
                  style={{
                    background:
                      pendingPayments.length > 0
                        ? '#fef3c7'
                        : '#dcfce7',
                    color:
                      pendingPayments.length > 0
                        ? '#92400e'
                        : '#166534',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {pendingPayments.length} Pending
                </div>
              </div>

              {pendingPayments.length === 0 ? (
                <div
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    color: '#6b7280',
                  }}
                >
                  No pending payments for {year}.
                </div>
              ) : (
                <div
                  style={{
                    overflowX: 'auto',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      minWidth: '850px',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: '#f3f4f6',
                        }}
                      >
                        <th style={thStyle}>
                          Member
                        </th>

                        <th style={thStyle}>
                          Phone
                        </th>

                        <th style={thStyle}>
                          Family
                        </th>

                        <th style={thStyle}>
                          Month
                        </th>

                        <th style={thStyle}>
                          Amount
                        </th>

                        <th style={thStyle}>
                          Status
                        </th>

                        <th style={thStyle}>
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pendingPayments.map(
                        (payment) => (
                          <tr key={payment.id}>
                            <td style={tdStyle}>
                              <strong>
                                {payment.member?.name ||
                                  'Unknown'}
                              </strong>
                            </td>

                            <td style={tdStyle}>
                              {payment.member?.phone ||
                                '-'}
                            </td>

                            <td style={tdStyle}>
                              {payment.member?.family ||
                                '-'}
                            </td>

                            <td style={tdStyle}>
                              {MONTHS[
                                payment.month - 1
                              ] || payment.month}
                            </td>

                            <td style={tdStyle}>
                              <strong>
                                {Number(
                                  payment.amount || 0
                                ).toLocaleString()}{' '}
                                RWF
                              </strong>
                            </td>

                            <td style={tdStyle}>
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  padding: '6px 10px',
                                  borderRadius: '20px',
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                }}
                              >
                                PENDING
                              </span>
                            </td>

                            <td style={tdStyle}>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '8px',
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handlePayment(
                                      payment.id,
                                      'confirm'
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    payment.id
                                  }
                                  style={{
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {actionLoading ===
                                  payment.id
                                    ? '...'
                                    : '✓ Confirm'}
                                </button>

                                <button
                                  onClick={() =>
                                    handlePayment(
                                      payment.id,
                                      'reject'
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    payment.id
                                  }
                                  style={{
                                    background: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {actionLoading ===
                                  payment.id
                                    ? '...'
                                    : '✕ Reject'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* FAMILY STANDING */}
            <section
              style={{
                background:
                  'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                borderRadius: '24px',
                padding: '28px',
                marginBottom: '25px',
                color: 'white',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.12)',
              }}
            >
              {/* FAMILY STANDING HEADER */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginBottom: '25px',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '26px',
                      fontWeight: '800',
                    }}
                  >
                    🏆 Family Standing
                  </h2>

                  <p
                    style={{
                      margin: '7px 0 0',
                      color: '#d1d5db',
                      fontSize: '14px',
                    }}
                  >
                    Family contribution progress for{' '}
                    {year}
                  </p>
                </div>

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.10)',
                    border:
                      '1px solid rgba(255,255,255,0.15)',
                    padding: '10px 16px',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: '700',
                  }}
                >
                  📅 {year}
                </div>
              </div>

              {families.length === 0 ? (
                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '30px',
                    textAlign: 'center',
                    color: '#d1d5db',
                  }}
                >
                  No family data available.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '18px',
                  }}
                >
                  {[...families]
                    .sort(
                      (a, b) =>
                        Number(b.percent || 0) -
                        Number(a.percent || 0)
                    )
                    .map((family, index) => {
                      const position = index + 1;

                      const progress = Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            family.percent || 0
                          )
                        )
                      );

                      const rankIcon =
                        position === 1
                          ? '🥇'
                          : position === 2
                          ? '🥈'
                          : position === 3
                          ? '🥉'
                          : '🏅';

                      const rankBackground =
                        position === 1
                          ? '#fbbf24'
                          : position === 2
                          ? '#d1d5db'
                          : position === 3
                          ? '#cd7c32'
                          : 'rgba(255,255,255,0.12)';

                      return (
                        <div
                          key={family.name}
                          style={{
                            position: 'relative',
                            overflow: 'hidden',
                            background:
                              'rgba(255,255,255,0.08)',
                            border:
                              position <= 3
                                ? '1px solid rgba(255,255,255,0.25)'
                                : '1px solid rgba(255,255,255,0.10)',
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow:
                              position === 1
                                ? '0 8px 25px rgba(251,191,36,0.15)'
                                : 'none',
                          }}
                        >
                          {/* RANK */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '15px',
                              right: '15px',
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              background:
                                rankBackground,
                              color:
                                position <= 3
                                  ? '#111827'
                                  : 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent:
                                'center',
                              fontSize: '22px',
                              fontWeight: '800',
                            }}
                          >
                            {rankIcon}
                          </div>

                          {/* FAMILY NAME */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              paddingRight: '60px',
                            }}
                          >
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background:
                                  'rgba(255,255,255,0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent:
                                  'center',
                                fontSize: '23px',
                                flexShrink: 0,
                              }}
                            >
                              👨‍👩‍👧‍👦
                            </div>

                            <div>
                              <div
                                style={{
                                  fontSize: '17px',
                                  fontWeight: '800',
                                  lineHeight: '1.3',
                                }}
                              >
                                {family.name}
                              </div>

                              <div
                                style={{
                                  fontSize: '12px',
                                  color: '#9ca3af',
                                  marginTop: '4px',
                                }}
                              >
                                Rank #{position}
                              </div>
                            </div>
                          </div>

                          {/* CONTRIBUTION PROGRESS */}
                          <div
                            style={{
                              marginTop: '22px',
                              background:
                                'rgba(255,255,255,0.07)',
                              borderRadius: '15px',
                              padding: '15px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent:
                                  'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span
                                style={{
                                  color: '#d1d5db',
                                  fontSize: '13px',
                                }}
                              >
                                Contribution
                              </span>

                              <strong
                                style={{
                                  fontSize: '21px',
                                }}
                              >
                                {progress}%
                              </strong>
                            </div>

                            <div
                              style={{
                                height: '10px',
                                background:
                                  'rgba(255,255,255,0.12)',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                marginTop: '12px',
                              }}
                            >
                              <div
                                style={{
                                  width: `${progress}%`,
                                  height: '100%',
                                  borderRadius: '20px',
                                  background:
                                    position === 1
                                      ? '#fbbf24'
                                      : '#22c55e',
                                  transition:
                                    'width 0.5s ease',
                                }}
                              />
                            </div>
                          </div>

                          {/* STATISTICS */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(3, 1fr)',
                              gap: '8px',
                              marginTop: '15px',
                            }}
                          >
                            {/* MEMBERS */}
                            <div
                              style={{
                                background:
                                  'rgba(255,255,255,0.06)',
                                borderRadius: '12px',
                                padding: '12px 6px',
                                textAlign: 'center',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '18px',
                                }}
                              >
                                👥
                              </div>

                              <div
                                style={{
                                  fontWeight: '800',
                                  marginTop: '4px',
                                }}
                              >
                                {family.members}
                              </div>

                              <div
                                style={{
                                  color: '#9ca3af',
                                  fontSize: '10px',
                                }}
                              >
                                Members
                              </div>
                            </div>

                            {/* COLLECTED */}
                            <div
                              style={{
                                background:
                                  'rgba(255,255,255,0.06)',
                                borderRadius: '12px',
                                padding: '12px 6px',
                                textAlign: 'center',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '18px',
                                }}
                              >
                                💰
                              </div>

                              <div
                                style={{
                                  fontWeight: '800',
                                  marginTop: '4px',
                                  fontSize: '12px',
                                }}
                              >
                                {Number(
                                  family.collected || 0
                                ).toLocaleString()}
                              </div>

                              <div
                                style={{
                                  color: '#9ca3af',
                                  fontSize: '10px',
                                }}
                              >
                                RWF
                              </div>
                            </div>

                            {/* PENDING */}
                            <div
                              style={{
                                background:
                                  'rgba(255,255,255,0.06)',
                                borderRadius: '12px',
                                padding: '12px 6px',
                                textAlign: 'center',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '18px',
                                }}
                              >
                                ⏳
                              </div>

                              <div
                                style={{
                                  fontWeight: '800',
                                  marginTop: '4px',
                                }}
                              >
                                {family.pending}
                              </div>

                              <div
                                style={{
                                  color: '#9ca3af',
                                  fontSize: '10px',
                                }}
                              >
                                Pending
                              </div>
                            </div>
                          </div>

                          {/* PAID CONTRIBUTIONS */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent:
                                'space-between',
                              alignItems: 'center',
                              marginTop: '16px',
                              paddingTop: '14px',
                              borderTop:
                                '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '12px',
                                color: '#9ca3af',
                              }}
                            >
                              Paid contributions
                            </span>

                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: '800',
                              }}
                            >
                              {family.paid}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>

            {/* ALL PAYMENT RECORDS */}
            <section
              style={{
                background: 'white',
                borderRadius: '18px',
                padding: '25px',
                marginBottom: '25px',
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                }}
              >
                📋 All Payment Records
              </h2>

              <div
                style={{
                  overflowX: 'auto',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '800px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: '#f3f4f6',
                      }}
                    >
                      <th style={thStyle}>
                        Member
                      </th>

                      <th style={thStyle}>
                        Family
                      </th>

                      <th style={thStyle}>
                        Month
                      </th>

                      <th style={thStyle}>
                        Amount
                      </th>

                      <th style={thStyle}>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map(
                      (payment) => (
                        <tr key={payment.id}>
                          <td style={tdStyle}>
                            {payment.member?.name ||
                              'Unknown'}
                          </td>

                          <td style={tdStyle}>
                            {payment.member?.family ||
                              '-'}
                          </td>

                          <td style={tdStyle}>
                            {MONTHS[
                              payment.month - 1
                            ] || payment.month}
                          </td>

                          <td style={tdStyle}>
                            {Number(
                              payment.amount || 0
                            ).toLocaleString()}{' '}
                            RWF
                          </td>

                          <td style={tdStyle}>
                            <StatusBadge
                              status={
                                payment.status
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* FOOTER */}
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#6b7280',
              }}
            >
              ✨ God is Good ✨
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '22px',
        boxShadow:
          '0 4px 15px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          fontSize: '30px',
          marginBottom: '10px',
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: '#6b7280',
          fontSize: '14px',
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '5px',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  let background = '#e5e7eb';
  let color = '#374151';

  if (status === 'paid') {
    background = '#dcfce7';
    color = '#166534';
  }

  if (status === 'pending') {
    background = '#fef3c7';
    color = '#92400e';
  }

  if (status === 'unpaid') {
    background = '#fee2e2';
    color = '#991b1b';
  }

  return (
    <span
      style={{
        background,
        color,
        padding: '6px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  padding: '13px',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '13px',
};

const tdStyle: React.CSSProperties = {
  padding: '13px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '14px',
};
