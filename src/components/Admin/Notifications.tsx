"use client";

import React from "react";
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
}

export default function Notifications({ flattenedMessages, paginatedMessages, submissionsLoading, submissionsError, selectedMessageKey, currentPage, totalPages, setCurrentPage, handleSelectMessage, selectedMessage, formatTimestamp, fetchFormSubmissions }: Props) {
  const ITEMS_PER_PAGE = 3;

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
                {selectedMessage.message ? (
                  selectedMessage.message.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                    <p key={`${selectedMessage.key}-paragraph-${paragraphIndex}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>No message content provided.</p>
                )}
              </div>
            </>
          ) : (
            <div className={styles.status}>Select a message to preview.</div>
          )}
        </div>
      </div>
    </section>
  );
}
