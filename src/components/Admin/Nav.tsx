"use client";

import React from "react";
import styles from "@/app/admin/styles.module.scss";

interface Section {
  id: string;
  label: string;
}

interface Props {
  panelSections: Section[];
  activeSectionId: string;
  navCopy: { title: string; description: string };
  unreadCount: number;
  onScrollToSection: (id: string) => void;
  refreshProjects: () => void;
  logout: () => void;
}

const Nav = ({ panelSections, activeSectionId, navCopy, unreadCount, onScrollToSection, refreshProjects, logout }: Props, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className={styles.adminNav}>
      <div className={styles.adminNavContent}>
        <div className={styles.adminNavCopy}>
          <h2>{navCopy.title}</h2>
          <p>{navCopy.description}</p>
        </div>
        <div className={styles.sectionActions}>
          <button className={styles.secondaryButton} type="button" onClick={refreshProjects}>Refresh projects</button>
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
            onClick={() => onScrollToSection(section.id)}
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
  );
};

export default React.forwardRef<HTMLDivElement, Props>(Nav);
