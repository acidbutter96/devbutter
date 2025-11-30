"use client";

import React from "react";
import styles from "./styles.module.scss";
import { useImapModal, ImapRecord } from "@/contexts/ImapModalContext";

// ImapRecord type is imported from context for consistency

export default function ImapMessagesPanel(): React.JSX.Element {
    const [items, setItems] = React.useState<ImapRecord[]>([]);
    const [page, setPage] = React.useState(1);
    const [limit] = React.useState(25);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const { openModal } = useImapModal();

    React.useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const headers: Record<string, string> = {};
                try {
                    const saved = sessionStorage.getItem('devbutter_admin_auth');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (parsed && parsed.token) headers['Authorization'] = `Bearer ${parsed.token}`;
                    }
                } catch (e) { /* ignore */ }

                const res = await fetch(`/api/admin/imapMessages?page=${page}&limit=${limit}`, { headers });
                if (!res.ok) {
                    const json = await res.json().catch(() => null);
                    throw new Error(json?.error ?? `HTTP ${res.status}`);
                }
                const json = await res.json();
                if (!mounted) return;
                setItems(Array.isArray(json.items) ? json.items : []);
                setTotal(Number(json.total ?? 0));
            } catch (err: any) {
                if (!mounted) return;
                setError(String(err?.message ?? err));
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, [page, limit]);

    return (
        <section className={`${styles.section} ${styles.sectionWide}`} id="imap-messages" aria-label="IMAP messages">
            <div className={`${styles.card} ${styles.templates}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4>IMAP messages</h4>
                        <p>Raw IMAP imports and processing logs.</p>
                    </div>
                    <div>
                        <span style={{ fontSize: 13 }}>{loading ? 'Loading...' : `Showing ${items.length} of ${total}`}</span>
                    </div>
                </div>

                {error ? <div style={{ color: 'var(--danger)', marginTop: 12 }}>{error}</div> : null}

                <div style={{ marginTop: 12 }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>When</th>
                                <th>From / Subject</th>
                                <th>Matched</th>
                                <th>State</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(it => (
                                <tr key={String(it._id)}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{it.processedAt ? new Date(it.processedAt).toLocaleString() : 'Unknown'}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{it.parsed?.from?.[0]?.address ?? it.parsed?.from ?? 'Unknown'}</div>
                                        <div style={{ fontSize: 13, opacity: 0.9 }}>{it.parsed?.subject ?? '-'}</div>
                                    </td>
                                    <td>{it.matchedSubmissionId ? String(it.matchedSubmissionId) : '-'}</td>
                                    <td>
                                        {it.skipped ? <span style={{ color: '#999' }}>skipped</span> : null}
                                        {it.appended ? <span style={{ color: '#2d9a3a' }}> appended</span> : null}
                                        {it.error ? <span style={{ color: '#d9534f' }}> error</span> : null}
                                    </td>
                                    <td>
                                        <button type="button" onClick={() => openModal(it as ImapRecord)} className={styles.ghostButton}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Modal handled by ImapModalProvider at the admin page level */}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div />
                    <div>
                        <button type="button" className={styles.ghostButton} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                        <span style={{ margin: '0 8px' }}>Page {page} / {Math.max(1, Math.ceil(total / limit))}</span>
                        <button type="button" className={styles.ghostButton} onClick={() => setPage(p => p + 1)} disabled={page * limit >= total}>Next</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
