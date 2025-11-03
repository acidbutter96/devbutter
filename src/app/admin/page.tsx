"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";

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

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1>Admin area</h1>
          <p>Manage portfolio entries and form submissions in one place.</p>
        </header>

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
            <div className={styles.panelHeader}>
              <div>
                <h2>Admin dashboard</h2>
                <p>Keep projects and internal content organized.</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.secondaryButton} onClick={fetchProjects} disabled={loading}>Refresh projects</button>
                <button className={styles.ghostButton} onClick={logout}>Logout</button>
              </div>
            </div>

            <div className={styles.panelGrid}>
              <section className={`${styles.card} ${styles.addProject}`}>
                <div className={styles.sectionHeading}>
                  <h3>Add project</h3>
                  <p>Fill in the fields below to publish a new item.</p>
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
              </section>

              <section className={`${styles.card} ${styles.list}`}>
                <div className={styles.sectionHeading}>
                  <h3>Published projects</h3>
                  <p>Quickly review the content that is already live.</p>
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
              </section>

              <section className={`${styles.card} ${styles.templates}`}>
                <div className={styles.sectionHeading}>
                  <h3>Email templates</h3>
                  <p>Reserved area for previewing and editing template content.</p>
                </div>
                <div className={styles.placeholder}>
                  <span>Coming soon</span>
                  <p>Once the templates are ready, they will show up here for editing.</p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
