"use client";

import React from "react";
import styles from "@/app/admin/styles.module.scss";
import { emailTemplates, type EmailSampleData } from "@/utils/emailTemplates";

type EmailTemplateConfig = (typeof emailTemplates)[number];

interface Props {
  templatesAvailable: boolean;
  activeTemplateId: string;
  setActiveTemplateId: (id: string) => void;
  activeTemplate?: EmailTemplateConfig;
  previewHtml: string;
}

const emailFieldLabels: Record<keyof EmailSampleData, string> = {
  userName: "User name",
  userEmail: "User email",
  adminName: "Admin contact",
  adminEmail: "Admin email",
  submittedAt: "Submitted at",
  formSource: "Form source",
  message: "Message",
  phoneNumber: "Phone number",
  company: "Company",
  projectName: "Project",
  replyMessage: "Reply",
  replySentAt: "Replied at",
};

export default function EmailsPanel({ templatesAvailable, activeTemplateId, setActiveTemplateId, activeTemplate, previewHtml }: Props) {
  return (
    <>
      <section className={`${styles.section} ${styles.sectionWide}`} id="emails" aria-label="Email templates">
        <div className={`${styles.card} ${styles.templates}`}>
          {templatesAvailable ? (
            <>
              <div className={styles.tabList} role="tablist" aria-label="Email templates">
                {emailTemplates.map((template: EmailTemplateConfig) => {
                  const isActive = template.id === activeTemplate?.id;
                  return (
                    <button
                      type="button"
                      key={template.id}
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
                      onClick={() => setActiveTemplateId(template.id)}
                    >
                      <span>{template.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeTemplate ? (
                <div className={styles.previewLayout}>
                  <div className={styles.previewMeta}>
                    <span className={styles.badge}>Subject</span>
                    <h4>{activeTemplate.subject}</h4>
                    <p>{activeTemplate.description}</p>
                    <dl className={styles.metaGrid}>
                      <div>
                        <dt>From</dt>
                        <dd>{activeTemplate.previewRecipients.from}</dd>
                      </div>
                      <div>
                        <dt>To</dt>
                        <dd>{activeTemplate.previewRecipients.to}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className={styles.previewFrame}>
                    <iframe
                      title={activeTemplate.label}
                      srcDoc={previewHtml}
                      className={styles.previewIframe}
                      sandbox="allow-same-origin"
                      loading="lazy"
                      aria-label={`Preview of template ${activeTemplate.label}`}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.status}>Select a template to preview.</div>
              )}
            </>
          ) : (
            <div className={styles.status}>No templates defined yet.</div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionMockTemplates}`} id="email-mock-data" aria-label="Template mock data">
        <div className={styles.mockGrid}>
          {emailTemplates.map(template => (
            <article key={template.id} className={`${styles.card} ${styles.mockCard}`}>
              <header className={styles.mockHeader}>
                <div>
                  <span className={styles.mockBadge}>ID: {template.id}</span>
                  <h4>{template.label}</h4>
                </div>
                <p className={styles.mockSubject}>{template.subject}</p>
              </header>

              <dl className={styles.mockRecipients}>
                <div>
                  <dt>From</dt>
                  <dd>{template.previewRecipients.from}</dd>
                </div>
                <div>
                  <dt>To</dt>
                  <dd>{template.previewRecipients.to}</dd>
                </div>
                <div>
                  <dt>Preheader</dt>
                  <dd>{template.preheader}</dd>
                </div>
              </dl>

              <ul className={styles.mockList}>
                {Object.entries(template.previewData).map(([key, value]) => {
                  if (value == null || value === "") return null;
                  const label = emailFieldLabels[key as keyof EmailSampleData] ?? key;
                  const stringValue = String(value);
                  const paragraphs = stringValue.split(/\n{2,}/);
                  const isLong = stringValue.length > 140 || paragraphs.length > 1;
                  return (
                    <li key={key} className={styles.mockField}>
                      <span className={styles.mockFieldLabel}>{label}</span>
                      <span className={`${styles.mockFieldValue} ${isLong ? styles.mockFieldValueBlock : ""}`}>
                        {isLong ? paragraphs.map((paragraph, idx) => (
                          <span key={`${key}-${idx}`}>{paragraph}</span>
                        )) : stringValue}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
