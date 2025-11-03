"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import { emailTemplates, type EmailSampleData } from "@/utils/emailTemplates";

type EmailTemplateConfig = (typeof emailTemplates)[number];

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

export default function AdminPage(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [repo, setRepo] = useState("");

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

  const panelSections = React.useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "projects", label: "Projects" },
      { id: "emails", label: "Email templates" },
      { id: "email-mock-data", label: "Mock data" },
    ],
    []
  );

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

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setEmail("");
    setPassword("");
    setProjects([]);
  }

  function scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
            <div className={styles.panel}>
              <nav className={styles.panelNav} aria-label="Panel shortcuts">
                {panelSections.map(section => (
                  <button
                    key={section.id}
                    type="button"
                    className={styles.panelNavButton}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>

              <section className={styles.section} id="overview">
                <div className={styles.sectionHeader}>
                  <div>
                    <h2>Admin dashboard</h2>
                    <p>Keep projects and internal content organized.</p>
                  </div>
                  <div className={styles.sectionActions}>
                    <button className={styles.homeButton} type="button" onClick={scrollToTop} aria-label="Back to top">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.homeButtonIcon} focusable="false">
                        <path d="M12 5l-6 6 1.4 1.4L11 9.8V19h2V9.8l3.6 3.6L18 11z" fill="currentColor" />
                      </svg>
                    </button>
                    <button className={styles.secondaryButton} onClick={fetchProjects} disabled={loading}>Refresh projects</button>
                    <button className={styles.ghostButton} onClick={logout}>Logout</button>
                  </div>
                </div>
              </section>

              <section className={styles.section} id="projects">
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionHeadingCopy}>
                    <h3>Projects</h3>
                    <p>Manage what is published on the site and keep experiments in order.</p>
                  </div>
                  <button
                    className={`${styles.homeButton} ${styles.sectionHomeButton}`}
                    type="button"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.homeButtonIcon} focusable="false">
                      <path d="M12 5l-6 6 1.4 1.4L11 9.8V19h2V9.8l3.6 3.6L18 11z" fill="currentColor" />
                    </svg>
                  </button>
                </div>

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

              <section className={`${styles.section} ${styles.sectionWide}`} id="emails">
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionHeadingCopy}>
                    <h3>Email templates</h3>
                    <p>Preview automated emails with mock data before going live.</p>
                  </div>
                  <button
                    className={`${styles.homeButton} ${styles.sectionHomeButton}`}
                    type="button"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.homeButtonIcon} focusable="false">
                      <path d="M12 5l-6 6 1.4 1.4L11 9.8V19h2V9.8l3.6 3.6L18 11z" fill="currentColor" />
                    </svg>
                  </button>
                </div>

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

              <section className={`${styles.section} ${styles.sectionMockTemplates}`} id="email-mock-data">
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionHeadingCopy}>
                    <h3>Template mock data</h3>
                    <p>See which fields feed each email layout at a glance.</p>
                  </div>
                  <button
                    className={`${styles.homeButton} ${styles.sectionHomeButton}`}
                    type="button"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.homeButtonIcon} focusable="false">
                      <path d="M12 5l-6 6 1.4 1.4L11 9.8V19h2V9.8l3.6 3.6L18 11z" fill="currentColor" />
                    </svg>
                  </button>
                </div>

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
          )}
        </div>
      </div>
  );
}
