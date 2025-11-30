"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";

interface Message {
    key: string;
    name?: string | null;
    message?: string | null;
    createdAt: string;
    email: string;
    subject?: string | null;
    telephone?: string | null;
    read?: boolean;
    submissionId?: string;
    messageId?: string | null;
}

interface Props {
    flattenedMessages: Message[];
    paginatedMessages: Message[];
    submissionsLoading: boolean;
    submissionsError: string | null;
    selectedMessageKey: string | null;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (n: number | ((p: number) => number)) => void;
    handleSelectMessage: (m: Message) => void;
    selectedMessage: Message | null;
    formatTimestamp: (v: string) => string;
    fetchFormSubmissions: () => void;
    selectedConversation?: any[];
    sendReply?: (submissionId: string, messageId: string | null, replyMessage: string) => Promise<void>;
}

export default function Notifications({ flattenedMessages, paginatedMessages, submissionsLoading, submissionsError, selectedMessageKey, currentPage, totalPages, setCurrentPage, handleSelectMessage, selectedMessage, formatTimestamp, fetchFormSubmissions, selectedConversation, sendReply }: Props) {
    const ITEMS_PER_PAGE = 3;
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [openLogKey, setOpenLogKey] = useState<string | null>(null);
    const [imapLoading, setImapLoading] = useState(false);
    const [imapResult, setImapResult] = useState<string | null>(null);

    return (
        <section
            className={`${styles.section} ${styles.sectionNotifications}`}
            id="form-submissions"
            aria-label="Form submissions"
        >
            <div className={styles.sectionHeader}>
                <div className={styles.sectionSubheading}>
                    <h4>Form submissions</h4>
                    <p>Review and respond to the most recent contact form entries.</p>
                </div>
                <div className={styles.sectionActions}>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => fetchFormSubmissions()}
                        disabled={submissionsLoading}
                    >
                        Refresh
                    </button>
                        <button
                        className={styles.ghostButton}
                        type="button"
                        onClick={async () => {
                            setImapLoading(true);
                            setImapResult(null);
                            try {
                                // try to read the admin token from sessionStorage so the admin UI
                                // can call this protected endpoint without exposing server secrets.
                                let headers: Record<string, string> = {};
                                try {
                                    const saved = sessionStorage.getItem('devbutter_admin_auth');
                                    if (saved) {
                                        const parsed = JSON.parse(saved);
                                        if (parsed && parsed.token) {
                                            headers['Authorization'] = `Bearer ${parsed.token}`;
                                        }
                                    }
                                } catch (e) {
                                    // ignore session read errors
                                }

                                const res = await fetch('/api/imap-check', { method: 'POST', headers });
                                const json = await res.json().catch(() => null);
                                if (!res.ok) {
                                    setImapResult(`Error ${res.status}: ${json ? JSON.stringify(json) : res.statusText}`);
                                } else {
                                    setImapResult(JSON.stringify(json));
                                }
                            } catch (err: any) {
                                setImapResult(String(err?.message ?? err));
                            } finally {
                                setImapLoading(false);
                                // refresh submissions after attempting IMAP check
                                try { await fetchFormSubmissions(); } catch (e) { /* ignore */ }
                            }
                        }}
                        disabled={imapLoading || submissionsLoading}
                    >
                        {imapLoading ? 'Running IMAP...' : 'Run IMAP check'}
                    </button>
                </div>
            </div>

            {submissionsError && <div className={styles.error} role="alert">{submissionsError}</div>}

            <div className={styles.notificationsLayout}>
                <div className={`${styles.card} ${styles.notificationList}`}>
                    <div className={styles.notificationListHeader}>
                        <h5>Inbox</h5>
                        <span className={styles.notificationListCount}>{flattenedMessages.length}</span>
                    </div>

                    {submissionsLoading ? (
                        <div className={styles.status}>Loading...</div>
                    ) : flattenedMessages.length === 0 ? (
                        <div className={styles.status}>No submissions yet.</div>
                    ) : (
                        <>
                            <ul className={styles.notificationItems}>
                                {paginatedMessages.map(item => {
                                    const isActive = item.key === selectedMessageKey;
                                    const displayName = item.name?.trim() || "Anonymous";
                                    const previewSource = item.message ? item.message.replace(/\s+/g, " ") : "No message provided";
                                    const preview = previewSource.length > 140 ? `${previewSource.slice(0, 140)}...` : previewSource;

                                    return (
                                        <li key={item.key}>
                                            <button
                                                type="button"
                                                className={`${styles.notificationItem} ${isActive ? styles.notificationItemActive : ""} ${item.read ? "" : styles.notificationItemUnread}`}
                                                onClick={() => handleSelectMessage(item)}
                                            >
                                                <div className={styles.notificationItemHeader}>
                                                    <span className={styles.notificationItemTitle}>{displayName}</span>
                                                    <div className={styles.notificationItemMeta}>
                                                        {!item.read && <span className={styles.notificationUnreadDot} aria-hidden="true" />}
                                                        <time dateTime={item.createdAt}>{formatTimestamp(item.createdAt)}</time>
                                                    </div>
                                                </div>
                                                <span className={styles.notificationItemEmail}>{item.email}</span>
                                                {item.subject && <span className={styles.notificationItemSubject}>{item.subject}</span>}
                                                <p className={styles.notificationItemPreview}>{preview}</p>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className={styles.paginationRow}>
                                <div className={styles.paginationInfo}>
                                    Showing {Math.min(flattenedMessages.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(flattenedMessages.length, currentPage * ITEMS_PER_PAGE)} of {flattenedMessages.length}
                                </div>
                                <div className={styles.paginationControls}>
                                    <button
                                        type="button"
                                        className={styles.ghostButton}
                                        onClick={() => setCurrentPage(p => Math.max(1, (p as number) - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Prev
                                    </button>
                                    <span className={styles.paginationInfo}>Page {currentPage} / {totalPages}</span>
                                    <button
                                        type="button"
                                        className={styles.ghostButton}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, (p as number) + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className={`${styles.card} ${styles.notificationDetail}`}>
                    {selectedMessage ? (
                        <div>
                            <div className={styles.notificationDetailContent}>
                                <header className={styles.notificationDetailHeader}>
                                    <div>
                                        <h4>{selectedMessage.subject || "No subject"}</h4>
                                        <time dateTime={selectedMessage.createdAt}>{formatTimestamp(selectedMessage.createdAt)}</time>
                                    </div>
                                    {!selectedMessage.read && <span className={styles.badge}>New</span>}
                                </header>

                                <dl className={styles.notificationDetailMeta}>
                                    <div>
                                        <dt>From</dt>
                                        <dd>{selectedMessage.name ? `${selectedMessage.name} - ${selectedMessage.email}` : selectedMessage.email}</dd>
                                    </div>
                                    {selectedMessage.telephone ? (
                                        <div>
                                            <dt>Phone</dt>
                                            <dd>{selectedMessage.telephone}</dd>
                                        </div>
                                    ) : null}
                                </dl>

                                <div className={styles.notificationDetailBody}>
                                    {selectedMessage.message ? (
                                        selectedMessage.message.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                                            <p key={`${selectedMessage.key}-paragraph-${paragraphIndex}`}>{paragraph}</p>
                                        ))
                                    ) : (
                                        <p>No message content provided.</p>
                                    )}
                                </div>

                                {selectedConversation && Array.isArray(selectedConversation) && selectedConversation.length > 0 ? (
                                    <div className={styles.conversation}>
                                        <h5 className={styles.conversationHeading}>Conversation</h5>
                                        {(selectedConversation as any[]).map((entry, idx) => {
                                            const isAdmin = Boolean(entry.fromAdmin);
                                            const who = isAdmin ? (entry.name || 'Admin') : (entry.name || 'User');
                                            const time = entry.createdAt ? formatTimestamp(entry.createdAt) : 'Unknown';
                                            const logKey = entry.messageId ? `msg-${String(entry.messageId)}` : `conv-${idx}`;
                                            const rawLog = entry.sendLog ?? null;
                                            let prettyLog: string | null = null;
                                            if (rawLog) {
                                                try {
                                                    const parsed = JSON.parse(String(rawLog));
                                                    prettyLog = JSON.stringify(parsed, null, 2);
                                                } catch (e) {
                                                    prettyLog = String(rawLog);
                                                }
                                            }

                                            return (
                                                <div key={`conv-${idx}`} className={styles.conversationEntry}>
                                                    <div className={styles.conversationEntryHeader}>
                                                        <strong className={styles.conversationWho}>{who}</strong>
                                                        <time className={styles.conversationTime}>{time}</time>
                                                    </div>
                                                    <div className={styles.conversationEntryMessage}>{entry.message ? entry.message.split(/\n{2,}/).map((p: string, i: number) => <p key={`e-${idx}-p-${i}`}>{p}</p>) : <p className={styles.emptyDash}>—</p>}</div>

                                                    {entry.sendStatus ? (
                                                        <div className={styles.sendStatusContainer}>
                                                            <button
                                                                type="button"
                                                                className={`${styles.ghostButton} ${styles.logButton}`}
                                                                onClick={() => setOpenLogKey(prev => (prev === logKey ? null : logKey))}
                                                                aria-expanded={openLogKey === logKey}
                                                            >
                                                                <span className={`${styles.sendStatusText} ${entry.sendStatus === 'error' ? styles.sendStatusError : styles.sendStatusSuccess}`}>{entry.sendStatus}</span>
                                                                {prettyLog ? <span className={styles.logToggleText}>{openLogKey === logKey ? 'Hide log' : 'View log'}</span> : null}
                                                            </button>

                                                            {openLogKey === logKey && prettyLog ? (
                                                                <pre className={`${styles.logPre} ${entry.sendStatus === 'error' ? styles.logPreError : styles.logPreSuccess}`}>
                                                                    {prettyLog}
                                                                </pre>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                            {sendReply ? (
                                    <div className={styles.replySection}>
                                        <label htmlFor="admin-reply" className={styles.replyLabel}>Write reply</label>
                                        <textarea
                                            id="admin-reply"
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            rows={6}
                                            className={styles.replyTextarea}
                                        />
                                        <div className={styles.replyActions}>
                                            <button
                                                type="button"
                                                className={styles.secondaryButton}
                                                onClick={async () => {
                                                    if (!replyText.trim()) return;
                                                    try {
                                                        setSending(true);
                                                        await sendReply!(selectedMessage?.submissionId ?? '', selectedMessage?.messageId ?? null, replyText.trim());
                                                        setReplyText('');
                                                    } catch (e) {
                                                    } finally {
                                                        setSending(false);
                                                    }
                                                }}
                                                disabled={sending}
                                            >
                                                {sending ? 'Sending...' : 'Send reply'}
                                            </button>
                                            <button type="button" className={styles.ghostButton} onClick={() => setReplyText('')} disabled={sending}>Cancel</button>
                                        </div>
                                    </div>
                                ) : null}
                        </div>
                    ) : (
                        <div className={styles.status}>Select a message to preview.</div>
                    )}
                </div>
            </div>
        </section>
    );
}
