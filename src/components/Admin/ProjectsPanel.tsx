"use client";

import React from "react";
import styles from "@/app/admin/styles.module.scss";

interface Project {
  _id?: string;
  title: string;
  description?: string;
  link?: string;
  repo?: string;
  createdAt?: string;
}

interface Props {
  projects: Project[];
  loading: boolean;
  title: string;
  description: string;
  link: string;
  repo: string;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setLink: (v: string) => void;
  setRepo: (v: string) => void;
  onAddProject: (e: React.FormEvent) => void;
  error: string | null;
}

export default function ProjectsPanel({ projects, loading, title, description, link, repo, setTitle, setDescription, setLink, setRepo, onAddProject, error }: Props) {
  return (
    <section className={styles.section} id="projects" aria-label="Projects">
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
  );
}
