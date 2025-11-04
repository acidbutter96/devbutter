"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import { emailTemplates, type EmailSampleData } from "@/utils/emailTemplates";
import Login from "@/components/Admin/Login";
import Nav from "@/components/Admin/Nav";
import Notifications from "@/components/Admin/Notifications";
import ProjectsPanel from "@/components/Admin/ProjectsPanel";
import EmailsPanel from "@/components/Admin/EmailsPanel";

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
  const [token, setToken] = useState<string | null>(null);
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
    // restore token from sessionStorage
    try {
      const saved = sessionStorage.getItem(AUTH_KEY);
      if (saved) {
        const { token: t } = JSON.parse(saved);
        if (t) {
          setToken(t);
          // attempt to validate
          validateAuthToken(t);
        }
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

  function bearerHeader(t: string | null) {
    return t ? `Bearer ${t}` : "";
  }

  async function validateAuthToken(t: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin`, {
        method: "GET",
        headers: {
          Authorization: bearerHeader(t),
        },
      });
      if (res.status === 200) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
        setAuthed(true);
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ token: t }));
        void fetchFormSubmissions(undefined, undefined, t);
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
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        if (res.status === 401) setError('Invalid credentials');
        else setError(`Error: ${res.status}`);
        setAuthed(false);
        return;
      }
      const data = await res.json();
      const t = data?.token;
      if (!t) {
        setError('No token received');
        return;
      }
      setToken(t);
      sessionStorage.setItem(AUTH_KEY, JSON.stringify({ token: t }));
      setAuthed(true);
      void fetchFormSubmissions(undefined, undefined, t);
      void fetchProjects();
    } catch (err) {
      setError('Unable to reach the API');
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin`, {
          method: "GET",
          headers: { Authorization: bearerHeader(token) },
        });
      if (res.ok) setProjects(await res.json());
      else setError(`Error: ${res.status}`);
    } catch (e) {
      setError("Unable to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFormSubmissions(overrideEmail?: string, overridePassword?: string, overrideToken?: string) {
    const t = overrideToken ?? token;
    if (!t) return;

    setSubmissionsLoading(true);
    setSubmissionsError(null);

    try {
      const res = await fetch(`/api/admin/formSubmissions`, {
        method: "GET",
        headers: { Authorization: bearerHeader(t) },
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
            Authorization: bearerHeader(token),
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

  const t = token;
  if (!t) return;

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
          Authorization: bearerHeader(t),
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
    // call logout endpoint to remove server-side session, then clear client state
    try {
      void fetch('/api/admin/logout', { method: 'POST', headers: { Authorization: bearerHeader(token) } });
    } catch (e) {
      // ignore
    }
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setEmail("");
    setPassword("");
    setToken(null);
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
            <Login email={email} password={password} setEmail={setEmail} setPassword={setPassword} loading={loading} error={error} onLogin={onLogin} />
          ) : (
            <div ref={panelRef} className={styles.panel}>
              <Nav
                ref={navRef}
                panelSections={panelSections.map(s => ({ id: s.id, label: s.label }))}
                activeSectionId={activeSectionId}
                navCopy={navCopy}
                unreadCount={unreadCount}
                onScrollToSection={(id: string) => scrollToSection(id as PanelSectionId)}
                refreshProjects={fetchProjects}
                logout={logout}
              />

              <div className={styles.panelSections}>
                <span id="overview" className={styles.sectionSentinel} aria-hidden="true" />

                <Notifications
                  flattenedMessages={flattenedMessages}
                  paginatedMessages={paginatedMessages}
                  submissionsLoading={submissionsLoading}
                  submissionsError={submissionsError}
                  selectedMessageKey={selectedMessageKey}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  handleSelectMessage={(m: any) => handleSelectMessage(m as FlattenedSubmissionMessage)}
                  selectedMessage={selectedMessage}
                  formatTimestamp={formatTimestamp}
                  fetchFormSubmissions={() => void fetchFormSubmissions()}
                />

                <ProjectsPanel
                  projects={projects}
                  loading={loading}
                  title={title}
                  description={description}
                  link={link}
                  repo={repo}
                  setTitle={setTitle}
                  setDescription={setDescription}
                  setLink={setLink}
                  setRepo={setRepo}
                  onAddProject={onAddProject}
                  error={error}
                />

                <EmailsPanel templatesAvailable={templatesAvailable} activeTemplateId={activeTemplateId} setActiveTemplateId={setActiveTemplateId} activeTemplate={activeTemplate} previewHtml={previewHtml} />
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
