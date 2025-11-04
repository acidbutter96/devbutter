"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import { emailTemplates, type EmailSampleData } from "@/utils/emailTemplates";

type EmailTemplateConfig = (typeof emailTemplates)[number];

type PanelSectionId = "overview" | "projects" | "emails" | "email-mock-data";

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

export default function AdminPage(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<PanelSectionId>("overview");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [repo, setRepo] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

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

  function scrollToSection(sectionId: PanelSectionId) {
  if (!PANEL_SECTION_LOOKUP[sectionId]) return;

  const el = document.getElementById(sectionId);
  if (!el) return;

    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
    const offset = navHeight + 24;
    const targetY = el.getBoundingClientRect().top + window.scrollY - offset;

    setActiveSectionId(prev => (prev === sectionId ? prev : sectionId));
    window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
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
                      className={styles.panelNavButton}
                      onClick={() => scrollToSection(section.id)}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className={styles.panelSections}>
                <span id="overview" className={styles.sectionSentinel} aria-hidden="true" />

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
