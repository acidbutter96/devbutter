"use client";

import React from "react";
import styles from "../components/Admin/ImapMessages/styles.module.scss";

export interface ImapRecord {
    _id: string;
    raw?: string | null;
    parsed?: any | null;
    matchedSubmissionId?: string | null;
    matchedReplyMessageId?: string | null;
    appended?: boolean;
    skipped?: boolean;
    appendedToSubmissionId?: string | null;
    processedAt?: string;
    attributes?: any;
    error?: string | null;
}

interface ContextValue {
    openModal: (data: ImapRecord) => void;
    closeModal: () => void;
    modalData: ImapRecord | null;
}

const ImapModalContext = React.createContext<ContextValue | null>(null);

export function ImapModalProvider({ children }: { children: React.ReactNode }) {
    const [modalData, setModalData] = React.useState<ImapRecord | null>(null);

    React.useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setModalData(null);
        }
        if (modalData) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [modalData]);

    function openModal(data: ImapRecord) {
        setModalData(data);
    }

    function closeModal() {
        setModalData(null);
    }

    return (
        <ImapModalContext.Provider value={{ openModal, closeModal, modalData }}>
            {children}

            {modalData ? (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h4 style={{ margin: 0 }}>{modalData.parsed?.subject ?? "IMAP message"}</h4>
                            <button type="button" aria-label="Close" className={styles.modalClose} onClick={closeModal}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.75)" }}>
                                From: {modalData.parsed?.from?.[0]?.address ?? modalData.parsed?.from ?? "Unknown"} • Processed: {modalData.processedAt ? new Date(modalData.processedAt).toLocaleString() : 'Unknown'}
                            </div>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, maxHeight: 'calc(92vh - 160px)', overflow: 'auto' }}>{JSON.stringify(modalData, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            ) : null}
        </ImapModalContext.Provider>
    );
}

export function useImapModal() {
    const ctx = React.useContext(ImapModalContext);
    if (!ctx) throw new Error("useImapModal must be used within ImapModalProvider");
    return ctx;
}

export default ImapModalContext;
