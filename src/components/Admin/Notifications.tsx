"use client";

import React, { useState } from "react";
import styles from "@/app/admin/styles.module.scss";

interface Message {
  key: string;
  name?: string | null;
  message?: string | null;
  createdAt: string;
  email: string;
  subject?: string | null;
  telephone?: string | null;
  read?: boolean;
  // optional fields from the admin flattened message shape
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

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem" }}>
                  Showing {Math.min(flattenedMessages.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(flattenedMessages.length, currentPage * ITEMS_PER_PAGE)} of {flattenedMessages.length}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={() => setCurrentPage(p => Math.max(1, (p as number) - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem" }}>Page {currentPage} / {totalPages}</span>
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
            <>
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
                {/* Conversation history: the Notifications component receives conversation via prop in admin page */}
                {/* placeholder: original message body shown below */}

                {selectedMessage.message ? (
                  selectedMessage.message.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                    <p key={`${selectedMessage.key}-paragraph-${paragraphIndex}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>No message content provided.</p>
                )}
              </div>

              {/* conversation provided by parent will be rendered below the original message, if present */}
              {selectedConversation && Array.isArray(selectedConversation) && selectedConversation.length > 0 ? (
                <div style={{ marginTop: 12 }}>
                  <h5 style={{ margin: '0 0 8px 0' }}>Conversation</h5>
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
                      <div key={`conv-${idx}`} style={{ borderLeft: '2px solid rgba(255,255,255,0.06)', paddingLeft: 12, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <strong style={{ fontSize: 14 }}>{who}</strong>
                          <time style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{time}</time>
                        </div>
                        <div style={{ marginTop: 6 }}>{entry.message ? entry.message.split(/\n{2,}/).map((p: string, i: number) => <p key={`e-${idx}-p-${i}`} style={{ margin: '6px 0' }}>{p}</p>) : <p style={{ margin: 0 }}>—</p>}</div>

                        {/* send status as a small toggle button which reveals a formatted JSON log panel */}
                        {entry.sendStatus ? (
                          <div style={{ marginTop: 8 }}>
                            <button
                              type="button"
                              className={styles.ghostButton}
                              onClick={() => setOpenLogKey(prev => (prev === logKey ? null : logKey))}
                              aria-expanded={openLogKey === logKey}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12 }}
                            >
                              <span style={{ fontWeight: 700, color: entry.sendStatus === 'error' ? 'var(--pink-50)' : 'var(--green-50)' }}>{entry.sendStatus}</span>
                              {prettyLog ? <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>{openLogKey === logKey ? 'Hide log' : 'View log'}</span> : null}
                            </button>

                            {openLogKey === logKey && prettyLog ? (
                              <pre
                                style={{
                                  background: '#000',
                                  color: '#fff',
                                  padding: 12,
                                  borderRadius: 6,
                                  marginTop: 8,
                                  maxHeight: 120,
                                  overflow: 'auto',
                                  borderLeft: `4px solid ${entry.sendStatus === 'error' ? 'var(--pink-50)' : 'var(--green-50)'}`,
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
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

              {/* Reply UI */}
              {sendReply ? (
                <div style={{ marginTop: 12 }}>
                  <label htmlFor="admin-reply" style={{ display: 'block', marginBottom: 6, color: 'rgba(255,255,255,0.8)' }}>Write reply</label>
                  <textarea
                    id="admin-reply"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={6}
                    style={{ width: '100%', padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid rgba(255,255,255,0.06)' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
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
                          // noop, parent handles errors
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
            </>
          ) : (
            <div className={styles.status}>Select a message to preview.</div>
          )}
        </div>
      </div>
    </section>
  );
}
