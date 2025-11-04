"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import { emailTemplates, type EmailSampleData } from "@/utils/emailTemplates";

type EmailTemplateConfig = (typeof emailTemplates)[number];

type PanelSectionId = "overview" | "projects" | "form-submissions" | "emails" | "email-mock-data";

interface PanelSectionCopy {
  title: string;
  description: string;
}

interface PanelSectionConfig {
  id: PanelSectionId;
  label: string;
  copy: PanelSectionCopy;
}

const PANEL_SECTIONS: PanelSectionConfig[] = [
  {
    id: "overview",
    label: "Overview",
    copy: {
      title: "Admin dashboard",
      description: "Keep projects and internal content organized.",
    },
  },
  {
    id: "form-submissions",
    label: "Notifications",
    copy: {
      title: "Notifications",
      description: "Track and review incoming form submissions.",
    },
  },
  {
    id: "projects",
    label: "Projects",
    copy: {
      title: "Projects",
      description: "Manage what is published on the site and keep experiments in order.",
    },
  },
  {
    id: "emails",
    label: "Email templates",
    copy: {
      title: "Email templates",
      description: "Preview automated emails with mock data before going live.",
    },
  },
  {
    id: "email-mock-data",
    label: "Mock data",
    copy: {
      title: "Template mock data",
      description: "See which fields feed each email layout at a glance.",
    },
  },
];

const PANEL_SECTION_LOOKUP: Record<PanelSectionId, PanelSectionConfig> = PANEL_SECTIONS.reduce<Record<PanelSectionId, PanelSectionConfig>>((acc, section) => {
  acc[section.id] = section;
  return acc;
}, {} as Record<PanelSectionId, PanelSectionConfig>);

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

interface Project {
  _id?: string;
  title: string;
  description?: string;
  link?: string;
  repo?: string;
  createdAt?: string;
}

const AUTH_KEY = "devbutter_admin_auth";

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface SubmissionMessage {
  messageId: string | null;
  createdAt: string;
  message: string | null;
  subject: string | null;
  telephone: string | null;
  name: string | null;
  read: boolean;
}

interface FormSubmission {
  _id: string;
  email: string;
  createdAt: string | null;
  updatedAt: string | null;
  messages: SubmissionMessage[];
}

interface FlattenedSubmissionMessage extends SubmissionMessage {
  key: string;
  submissionId: string;
  fallbackCreatedAt: string;
  email: string;
}

export default function AdminPage(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<PanelSectionId>("overview");
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [selectedMessageKey, setSelectedMessageKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [repo, setRepo] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const observerSuppressRef = useRef(false);
  const observerSuppressTimeoutRef = useRef<number | null>(null);

  const templatesAvailable = emailTemplates.length > 0;
  const [activeTemplateId, setActiveTemplateId] = useState(() => (templatesAvailable ? emailTemplates[0].id : ""));
  const activeTemplate = React.useMemo<EmailTemplateConfig | undefined>(() => {
    if (!templatesAvailable) return undefined;
    return emailTemplates.find((template: EmailTemplateConfig) => template.id === activeTemplateId) ?? emailTemplates[0];
  }, [activeTemplateId, templatesAvailable]);
  const previewHtml = React.useMemo(() => {
    if (!activeTemplate) return "";
    return activeTemplate.buildHtml(activeTemplate.previewData);
  }, [activeTemplate]);

  const flattenedMessages = React.useMemo<FlattenedSubmissionMessage[]>(() => {
    const items: FlattenedSubmissionMessage[] = [];
    formSubmissions.forEach(submission => {
      const messages = Array.isArray(submission.messages) ? submission.messages : [];
      messages.forEach((message, index) => {
        const keyBase = message.messageId ?? `legacy-${submission._id}-${message.createdAt ?? index}`;
        items.push({
          ...message,
          key: keyBase,
          submissionId: submission._id,
          fallbackCreatedAt: message.createdAt,
          email: submission.email,
        });
      });
    });

    return items.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return bTime - aTime;
    });
  }, [formSubmissions]);

  const totalPages = Math.max(1, Math.ceil(flattenedMessages.length / ITEMS_PER_PAGE));

  // Reset to first page when the message list changes (new data) so users see
  // the most recent items by default.
  useEffect(() => {
    setCurrentPage(1);
  }, [flattenedMessages.length]);

  const paginatedMessages = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return flattenedMessages.slice(start, start + ITEMS_PER_PAGE);
  }, [flattenedMessages, currentPage]);

  const unreadCount = React.useMemo(() => flattenedMessages.reduce((acc, message) => (message.read ? acc : acc + 1), 0), [flattenedMessages]);

  const selectedMessage = React.useMemo(() => {
    if (!selectedMessageKey) return null;
    return flattenedMessages.find(message => message.key === selectedMessageKey) ?? null;
  }, [flattenedMessages, selectedMessageKey]);

  const panelSections = PANEL_SECTIONS;
  const navCopy = PANEL_SECTION_LOOKUP[activeSectionId]?.copy ?? PANEL_SECTION_LOOKUP["overview"].copy;

  useEffect(() => {
    // restore credentials from sessionStorage
    try {
      const saved = sessionStorage.getItem(AUTH_KEY);
      if (saved) {
        const { email: e, password: p } = JSON.parse(saved);
        setEmail(e);
        setPassword(p);
        // attempt to validate
        validateAuth(e, p);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!authed) {
      setActiveSectionId("overview");
    }
  }, [authed]);

  useEffect(() => {
    return () => {
      if (observerSuppressTimeoutRef.current != null) {
        window.clearTimeout(observerSuppressTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (flattenedMessages.length === 0) {
      if (selectedMessageKey) {
        setSelectedMessageKey(null);
      }
      return;
    }

    if (!selectedMessageKey) {
      return;
    }

    const currentExists = flattenedMessages.some(message => message.key === selectedMessageKey);
    if (!currentExists) {
      setSelectedMessageKey(null);
    }
  }, [flattenedMessages, selectedMessageKey]);

  function basicHeader(e: string, p: string) {
    return "Basic " + btoa(`${e}:${p}`);
  }

  async function validateAuth(e: string, p: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin`, {
        method: "GET",
        headers: {
          Authorization: basicHeader(e, p),
        },
      });
      if (res.status === 200) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
        setAuthed(true);
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ email: e, password: p }));
        void fetchFormSubmissions(e, p);
      } else if (res.status === 401) {
        setAuthed(false);
        setError("Invalid credentials");
      } else {
        const txt = await res.text();
        setError(`Error: ${res.status} ${txt}`);
      }
    } catch (err) {
      setError("Unable to reach the API");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    await validateAuth(email, password);
  }

  async function fetchProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin`, {
        method: "GET",
        headers: { Authorization: basicHeader(email, password) },
      });
      if (res.ok) setProjects(await res.json());
      else setError(`Error: ${res.status}`);
    } catch (e) {
      setError("Unable to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFormSubmissions(overrideEmail?: string, overridePassword?: string) {
    const authEmail = overrideEmail ?? email;
    const authPassword = overridePassword ?? password;
    if (!authEmail || !authPassword) return;

    setSubmissionsLoading(true);
    setSubmissionsError(null);

    try {
      const res = await fetch(`/api/admin/formSubmissions`, {
        method: "GET",
        headers: { Authorization: basicHeader(authEmail, authPassword) },
      });

      if (res.status === 401) {
        setAuthed(false);
        setError("Not authorized");
        setFormSubmissions([]);
        setSelectedMessageKey(null);
        return;
      }

      if (!res.ok) {
        setSubmissionsError(`Error: ${res.status}`);
        return;
      }

      const data: unknown = await res.json();
      if (!Array.isArray(data)) {
        setSubmissionsError("Unexpected response while loading submissions");
        setFormSubmissions([]);
        return;
      }

      setFormSubmissions(data as FormSubmission[]);
    } catch (err) {
      setSubmissionsError("Unable to load form submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  }

  async function onAddProject(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { title, description, link, repo };
      const res = await fetch(`/api/admin`, {
        method: "POST",
        headers: {
          Authorization: basicHeader(email, password),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 201) {
        const created = await res.json();
        setProjects(prev => [created, ...prev]);
        setTitle("");
        setDescription("");
        setLink("");
        setRepo("");
      } else if (res.status === 401) {
        setAuthed(false);
        setError("Not authorized");
      } else {
        const txt = await res.text();
        setError(`Error: ${res.status} ${txt}`);
      }
    } catch (err) {
      setError("Unable to create project");
    } finally {
      setLoading(false);
    }
  }

  async function markMessageAsRead(message: FlattenedSubmissionMessage) {
    if (message.read) return;

    setSubmissionsError(null);

    setFormSubmissions(prev =>
      prev.map(submission => {
        if (submission._id !== message.submissionId) {
          return submission;
        }

        return {
          ...submission,
          messages: submission.messages.map(entry => {
            const matchById = message.messageId && entry.messageId === message.messageId;
            const matchByCreatedAt = !message.messageId && entry.createdAt === message.fallbackCreatedAt;
            if (matchById || matchByCreatedAt) {
              return { ...entry, read: true };
            }
            return entry;
          }),
        };
      })
    );

    const authEmail = email;
    const authPassword = password;
    if (!authEmail || !authPassword) return;

    const payload: Record<string, unknown> = {
      submissionId: message.submissionId,
    };

    if (message.messageId) {
      payload.messageId = message.messageId;
    } else if (message.fallbackCreatedAt) {
      payload.createdAt = message.fallbackCreatedAt;
    }

    try {
      const res = await fetch(`/api/admin/formSubmissions`, {
        method: "PATCH",
        headers: {
          Authorization: basicHeader(authEmail, authPassword),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setAuthed(false);
        setError("Not authorized");
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }
    } catch (err) {
      setSubmissionsError("Unable to update message status");
      void fetchFormSubmissions();
    }
  }

  function handleSelectMessage(message: FlattenedSubmissionMessage) {
    setSelectedMessageKey(prev => (prev === message.key ? prev : message.key));
    if (!message.read) {
      void markMessageAsRead(message);
    }
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setEmail("");
    setPassword("");
    setProjects([]);
    setFormSubmissions([]);
    setSelectedMessageKey(null);
    setSubmissionsError(null);
    setSubmissionsLoading(false);
  }

  function scrollToSection(sectionId: PanelSectionId) {
    if (!PANEL_SECTION_LOOKUP[sectionId]) return;

    const el = document.getElementById(sectionId);
    if (!el) return;

    observerSuppressRef.current = true;
    if (observerSuppressTimeoutRef.current != null) {
      window.clearTimeout(observerSuppressTimeoutRef.current);
    }

    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
    const offset = navHeight + 24;
    const targetY = el.getBoundingClientRect().top + window.scrollY - offset;

    setActiveSectionId(prev => (prev === sectionId ? prev : sectionId));
    window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });

    observerSuppressTimeoutRef.current = window.setTimeout(() => {
      observerSuppressRef.current = false;
    }, 600);
  }

  useEffect(() => {
    const panelEl = panelRef.current;

    if (!authed || !panelEl) {
      if (panelEl) {
        panelEl.style.removeProperty("--admin-nav-height");
      }
      return;
    }

    const navEl = navRef.current;
    if (!navEl) return;

    const updateHeight = () => {
      const { height } = navEl.getBoundingClientRect();
      panelEl.style.setProperty("--admin-nav-height", `${height}px`);
    };

    updateHeight();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => updateHeight());
      resizeObserver.observe(navEl);
      return () => resizeObserver.disconnect();
    }

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [authed, loading, projects.length, error]);

  useEffect(() => {
    if (!authed) return;

    const observer = new IntersectionObserver(
      entries => {
        if (observerSuppressRef.current) {
          return;
        }

        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);

        const primary = visible[0] ?? entries.slice().sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (primary?.target?.id) {
          const nextId = primary.target.id as PanelSectionId;
          setActiveSectionId(prev => (prev === nextId ? prev : nextId));
        }
      },
      {
        rootMargin: "0px 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    const sectionIds = panelSections.map(section => section.id);
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [authed, panelSections]);

  return (
      <div className={styles.page}>
        <div className={styles.wrapper}>
          {!authed ? (
            <div className={styles.loginLayout}>
              <section className={`${styles.card} ${styles.loginCard}`}>
                <h2>Restricted access</h2>
                <form onSubmit={onLogin} className={styles.form}>
                  <label className={styles.field}>
                    <span>Email</span>
                    <input className={styles.input} value={email} onChange={e => setEmail(e.target.value)} type="email" required />
                  </label>
                  <label className={styles.field}>
                    <span>Password</span>
                    <input className={styles.input} value={password} onChange={e => setPassword(e.target.value)} type="password" required />
                  </label>
                  <div className={styles.formActions}>
                    <button className={styles.primaryButton} type="submit" disabled={loading}>Sign in</button>
                  </div>
                  {error && <div className={styles.error} role="alert">{error}</div>}
                </form>
              </section>

              <figure className={styles.loginIllustration}>
                <Image
                  src="/static/images/aliens/juggler_alien.svg"
                  alt="Juggler alien illustration"
                  width={420}
                  height={420}
                  priority
                />
              </figure>
            </div>
          ) : (
            <div ref={panelRef} className={styles.panel}>
              <div ref={navRef} className={styles.adminNav}>
                <div className={styles.adminNavContent}>
                  <div className={styles.adminNavCopy}>
                    <h2>{navCopy.title}</h2>
                    <p>{navCopy.description}</p>
                  </div>
                  <div className={styles.sectionActions}>
                    <button className={styles.secondaryButton} type="button" onClick={fetchProjects} disabled={loading}>Refresh projects</button>
                    <button className={styles.ghostButton} type="button" onClick={logout}>Logout</button>
                  </div>
                </div>

                <nav className={styles.panelNav} aria-label="Panel shortcuts">
                  {panelSections.map(section => (
                    <button
                      key={section.id}
                      type="button"
                      className={`${styles.panelNavButton} ${section.id === activeSectionId ? styles.panelNavButtonActiveSection : ""}`}
                      aria-pressed={section.id === activeSectionId}
                      onClick={() => scrollToSection(section.id)}
                    >
                      <span>{section.label}</span>
                      {section.id === "form-submissions" && unreadCount > 0 ? (
                        <span className={styles.panelNavButtonBadge} aria-label={`${unreadCount} unread notifications`}>
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </nav>
              </div>

              <div className={styles.panelSections}>
                <span id="overview" className={styles.sectionSentinel} aria-hidden="true" />

                <section
                  className={`${styles.section} ${styles.sectionNotifications}`}
                  id="form-submissions"
                  aria-label={PANEL_SECTION_LOOKUP["form-submissions"].copy.title}
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

                          {/* Pagination controls */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem" }}>
                              Showing {Math.min(flattenedMessages.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(flattenedMessages.length, currentPage * ITEMS_PER_PAGE)} of {flattenedMessages.length}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <button
                                type="button"
                                className={styles.ghostButton}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                              >
                                Prev
                              </button>
                              <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem" }}>Page {currentPage} / {totalPages}</span>
                              <button
                                type="button"
                                className={styles.ghostButton}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

                <section className={styles.section} id="projects" aria-label={PANEL_SECTION_LOOKUP["projects"].copy.title}>
                  <div className={styles.sectionGrid}>
                  <div className={`${styles.card} ${styles.cardForm}`}>
                    <div className={styles.sectionSubheading}>
                      <h4>New project</h4>
                      <p>Fill in the fields and ship instantly.</p>
                    </div>
                    <form onSubmit={onAddProject} className={styles.form}>
                      <label className={styles.field}>
                        <span>Title</span>
                        <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} required />
                      </label>
                      <label className={styles.field}>
                        <span>Description</span>
                        <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} />
                      </label>
                      <label className={styles.field}>
                        <span>Link</span>
                        <input className={styles.input} value={link} onChange={e => setLink(e.target.value)} />
                      </label>
                      <label className={styles.field}>
                        <span>Repo</span>
                        <input className={styles.input} value={repo} onChange={e => setRepo(e.target.value)} />
                      </label>
                      <div className={styles.formActions}>
                        <button className={styles.primaryButton} type="submit" disabled={loading}>Add</button>
                      </div>
                    </form>
                    {error && <div className={styles.error} role="alert">{error}</div>}
                  </div>

                  <div className={`${styles.card} ${styles.cardList}`}>
                    <div className={styles.sectionSubheading}>
                      <h4>Published projects</h4>
                      <p>Quickly review what is live across the portfolio.</p>
                    </div>
                    {loading && <div className={styles.status}>Loading...</div>}
                    {!loading && projects.length === 0 && <div className={styles.status}>No projects found.</div>}
                    <ul className={styles.projectList}>
                      {projects.map((p, idx) => {
                        const displayDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : null;
                        return (
                          <li className={styles.projectItem} key={p._id ?? idx}>
                            <div className={styles.projectHeader}>
                              <strong>{p.title}</strong>
                              {displayDate && <span className={styles.projectMeta}>{displayDate}</span>}
                            </div>
                            {p.description && <p className={styles.projectDescription}>{p.description}</p>}
                            <div className={styles.projectLinks}>
                              {p.link && <a href={p.link} target="_blank" rel="noreferrer">View project</a>}
                              {p.repo && <a href={p.repo} target="_blank" rel="noreferrer">Repository</a>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  </div>
                </section>

                <section className={`${styles.section} ${styles.sectionWide}`} id="emails" aria-label={PANEL_SECTION_LOOKUP["emails"].copy.title}>
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

                <section className={`${styles.section} ${styles.sectionMockTemplates}`} id="email-mock-data" aria-label={PANEL_SECTION_LOOKUP["email-mock-data"].copy.title}>
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
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
