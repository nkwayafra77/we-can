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
  'Kind Souls Family': '❤️',
  'Little Lights Family': '💡',
  'Golden Hearts Family': '💛',
  'Faith Walkers Family': '🙏',
  'Warriors Family': '⚔️',
  'Victorious Family': '🏆',
  'Tigers Family': '🐅',
  'Anointed Family': '✨',
  'Solidarity Family': '🤝',
};

export default function AdminDashboard() {
  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        '/api/admin/dashboard?year=' +
          year,
        {
          cache: 'no-store',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            'Unable to load dashboard.'
        );
        return;
      }

      setData(result);
    } catch {
      setError(
        'Unable to connect to the server.'
      );
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
        ? 'Confirm that you received this payment?'
        : 'Reject this payment request?';

    if (!window.confirm(question)) {
      return;
    }

    setActionId(paymentId);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        '/api/admin/payments',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
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
          result.error ||
            'Payment action failed.'
        );
        return;
      }

      setMessage(
        action === 'confirm'
          ? 'Payment confirmed successfully.'
          : 'Payment rejected successfully.'
      );

      await loadDashboard();
    } catch {
      setError(
        'Unable to process the payment.'
      );
    } finally {
      setActionId('');
    }
  }

  const pendingPayments =
    (data?.transactions || []).filter(
      (payment: any) =>
        payment.status === 'pending'
    );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        fontFamily:
          'Arial, Helvetica, sans-serif',
        color: '#111827',
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: '#111827',
          color: '#ffffff',
          padding: '24px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
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
            Manage contributions and payment
            confirmations
          </p>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 20,
        }}
      >
        {/* YEAR */}

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 15,
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0 }}>
            Dashboard — {year}
          </h2>

          <select
            value={year}
            onChange={(e) =>
              setYear(
                Number(e.target.value)
              )
            }
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border:
                '1px solid #d1d5db',
              background: '#ffffff',
              fontSize: 16,
            }}
          >
            {Array.from(
              { length: 10 },
              (_, i) => {
                const y =
                  new Date().getFullYear() -
                  i;

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

        {message && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: 15,
              borderRadius: 10,
              marginBottom: 20,
              fontWeight: 600,
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
              padding: 15,
              borderRadius: 10,
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              background: '#ffffff',
              padding: 40,
              borderRadius: 16,
              textAlign: 'center',
            }}
          >
            <h2>Loading dashboard...</h2>
          </div>
        ) : (
          <>
            {/* SUMMARY */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 15,
                marginBottom: 25,
              }}
            >
              <SummaryCard
                title="Members"
                value={data?.members || 0}
                icon="👥"
              />

              <SummaryCard
                title="Collected"
                value={`${Number(
                  data?.collected || 0
                ).toLocaleString()} RWF`}
                icon="💰"
              />

              <SummaryCard
                title="Expected"
                value={`${Number(
                  data?.expected || 0
                ).toLocaleString()} RWF`}
                icon="🎯"
              />

              <SummaryCard
                title="Pending"
                value={
                  data?.pendingCount || 0
                }
                icon="⏳"
              />

              <SummaryCard
                title="Completion"
                value={`${data?.percent || 0}%`}
                icon="📊"
              />
            </div>

            {/* PENDING PAYMENTS */}

            <section
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 20,
                marginBottom: 25,
                boxShadow:
                  '0 3px 15px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginBottom: 15,
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    ⏳ Pending Payment
                    Requests
                  </h2>

                  <p
                    style={{
                      color: '#6b7280',
                      marginBottom: 0,
                    }}
                  >
                    Check your MTN MoMo
                    account before
                    confirming.
                  </p>
                </div>

                <div
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding:
                      '8px 14px',
                    borderRadius: 20,
                    fontWeight: 700,
                  }}
                >
                  {pendingPayments.length}{' '}
                  Pending
                </div>
              </div>

              {pendingPayments.length ===
              0 ? (
                <div
                  style={{
                    background: '#f9fafb',
                    padding: 25,
                    borderRadius: 12,
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
                  No pending payment
                  requests for {year}.
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
                      borderCollapse:
                        'collapse',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background:
                            '#f9fafb',
                        }}
                      >
                        <th
                          style={th}
                        >
                          Member
                        </th>

                        <th
                          style={th}
                        >
                          Family
                        </th>

                        <th
                          style={th}
                        >
                          Month
                        </th>

                        <th
                          style={th}
                        >
                          Amount
                        </th>

                        <th
                          style={th}
                        >
                          Status
                        </th>

                        <th
                          style={th}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pendingPayments.map(
                        (payment: any) => (
                          <tr
                            key={
                              payment.id
                            }
                            style={{
                              borderTop:
                                '1px solid #e5e7eb',
                            }}
                          >
                            <td
                              style={td}
                            >
                              <strong>
                                {
                                  payment
                                    .member
                                    ?.name
                                }
                              </strong>
                              <br />
                              <small
                                style={{
                                  color:
                                    '#6b7280',
                                }}
                              >
                                {
                                  payment
                                    .member
                                    ?.phone
                                }
                              </small>
                            </td>

                            <td
                              style={td}
                            >
                              {
                                payment
                                  .member
                                  ?.family
                              }
                            </td>

                            <td
                              style={td}
                            >
                              {
                                MONTHS[
                                  Number(
                                    payment.month
                                  ) - 1
                                ]
                              }
                            </td>

                            <td
                              style={td}
                            >
                              <strong>
                                {Number(
                                  payment.amount
                                ).toLocaleString()}{' '}
                                RWF
                              </strong>
                            </td>

                            <td
                              style={td}
                            >
                              <span
                                style={{
                                  background:
                                    '#fef3c7',
                                  color:
                                    '#92400e',
                                  padding:
                                    '6px 10px',
                                  borderRadius:
                                    20,
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                PENDING
                              </span>
                            </td>

                            <td
                              style={td}
                            >
                              <div
                                style={{
                                  display:
                                    'flex',
                                  gap: 8,
                                  flexWrap:
                                    'wrap',
                                }}
                              >
                                <button
                                  type="button"
                                  disabled={
                                    actionId ===
                                    payment.id
                                  }
                                  onClick={() =>
                                    handlePayment(
                                      payment.id,
                                      'confirm'
                                    )
                                  }
                                  style={{
                                    background:
                                      '#16a34a',
                                    color:
                                      '#ffffff',
                                    border:
                                      'none',
                                    borderRadius:
                                      8,
                                    padding:
                                      '9px 12px',
                                    fontWeight:
                                      700,
                                    cursor:
                                      actionId ===
                                      payment.id
                                        ? 'not-allowed'
                                        : 'pointer',
                                  }}
                                >
                                  {actionId ===
                                  payment.id
                                    ? '...'
                                    : '✓ Confirm'}
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    actionId ===
                                    payment.id
                                  }
                                  onClick={() =>
                                    handlePayment(
                                      payment.id,
                                      'reject'
                                    )
                                  }
                                  style={{
                                    background:
                                      '#dc2626',
                                    color:
                                      '#ffffff',
                                    border:
                                      'none',
                                    borderRadius:
                                      8,
                                    padding:
                                      '9px 12px',
                                    fontWeight:
                                      700,
                                    cursor:
                                      actionId ===
                                      payment.id
                                        ? 'not-allowed'
                                        : 'pointer',
                                  }}
                                >
                                  {actionId ===
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
                background: '#ffffff',
                borderRadius: 16,
                padding: 20,
                marginBottom: 25,
                boxShadow:
                  '0 3px 15px rgba(0,0,0,0.06)',
              }}
            >
              <h2>
                🏆 Family Standing
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 15,
                }}
              >
                {(data?.families || []).map(
                  (family: any) => (
                    <div
                      key={family.name}
                      style={{
                        border:
                          '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          marginBottom:
                            10,
                        }}
                      >
                        <strong>
                          {FAMILY_ICONS[
                            family.name
                          ] || '👥'}{' '}
                          {family.name}
                        </strong>

                        <strong>
                          {family.percent}%
                        </strong>
                      </div>

                      <div
                        style={{
                          height: 10,
                          background:
                            '#e5e7eb',
                          borderRadius: 10,
                          overflow:
                            'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${family.percent}%`,
                            height:
                              '100%',
                            background:
                              '#16a34a',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          marginTop: 12,
                          fontSize: 13,
                          color:
                            '#6b7280',
                        }}
                      >
                        <span>
                          Paid:{' '}
                          {family.paid}
                        </span>

                        <span>
                          Pending:{' '}
                          {family.pending}
                        </span>

                        <span>
                          {Number(
                            family.collected ||
                              0
                          ).toLocaleString()}{' '}
                          RWF
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* ALL TRANSACTIONS */}

            <section
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 20,
                marginBottom: 25,
                boxShadow:
                  '0 3px 15px rgba(0,0,0,0.06)',
              }}
            >
              <h2>
                📋 Payment Records
              </h2>

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
                    <tr
                      style={{
                        background:
                          '#f9fafb',
                      }}
                    >
                      <th style={th}>
                        Member
                      </th>
                      <th style={th}>
                        Family
                      </th>
                      <th style={th}>
                        Month
                      </th>
                      <th style={th}>
                        Amount
                      </th>
                      <th style={th}>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {(data?.transactions ||
                      []).map(
                      (payment: any) => (
                        <tr
                          key={
                            payment.id
                          }
                          style={{
                            borderTop:
                              '1px solid #e5e7eb',
                          }}
                        >
                          <td style={td}>
                            {
                              payment
                                .member
                                ?.name
                            }
                          </td>

                          <td style={td}>
                            {
                              payment
                                .member
                                ?.family
                            }
                          </td>

                          <td style={td}>
                            {
                              MONTHS[
                                Number(
                                  payment.month
                                ) - 1
                              ]
                            }
                          </td>

                          <td style={td}>
                            {Number(
                              payment.amount
                            ).toLocaleString()}{' '}
                            RWF
                          </td>

                          <td style={td}>
                            <Status
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
          </>
        )}

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

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: 20,
        boxShadow:
          '0 3px 15px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          fontSize: 28,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: '#6b7280',
          fontSize: 14,
          marginBottom: 5,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Status({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    {
      background: string;
      color: string;
    }
  > = {
    paid: {
      background: '#dcfce7',
      color: '#166534',
    },
    pending: {
      background: '#fef3c7',
      color: '#92400e',
    },
    unpaid: {
      background: '#f3f4f6',
      color: '#4b5563',
    },
  };

  const style =
    styles[status] || styles.unpaid;

  return (
    <span
      style={{
        background: style.background,
        color: style.color,
        padding: '6px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {status.toUpperCase()}
    </span>
  );
}

const th: any = {
  padding: 12,
  textAlign: 'left',
  fontSize: 13,
  color: '#4b5563',
};

const td: any = {
  padding: 12,
  fontSize: 14,
};
