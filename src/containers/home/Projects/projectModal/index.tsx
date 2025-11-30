"use client";

import React, { useEffect } from "react";
import styles from "../styles.module.scss";
import { ProjectContainerInterface } from "../interfaces";

interface ProjectModalProps {
    project: ProjectContainerInterface;
    onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps): React.JSX.Element => {
    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const openProjectLink = () => {
        if (!project.link) return;
        window.open(project.link, "_blank", "noopener,noreferrer");
    };

    const handlePreviewKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!project.link) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProjectLink();
        }
    };

    const previewClassName = project.link
        ? styles.projectModalPreview
        : `${styles.projectModalPreview} ${styles.projectModalPreviewDisabled}`;

    return (
        <div className={styles.projectModalOverlay} role="dialog" aria-modal="true" aria-label={`Detalhes do projeto ${project.title}`} onClick={onClose}>
            <div className={styles.projectModal} onClick={event => event.stopPropagation()}>
                <div className={styles.projectModalHeader}>
                    <h3>{project.title}</h3>
                    <button type="button" aria-label="Fechar" onClick={onClose}>
                        ✕
                    </button>
                </div>
                {project.description ? (
                    <p className={styles.projectModalDescription}>{project.description}</p>
                ) : (
                    <p className={styles.projectModalDescriptionMuted}>Sem descrição disponível.</p>
                )}
                <div
                    className={previewClassName}
                    role={project.link ? "button" : undefined}
                    tabIndex={project.link ? 0 : -1}
                    onClick={project.link ? openProjectLink : undefined}
                    onKeyDown={project.link ? handlePreviewKeyDown : undefined}
                    aria-label={project.link ? `Abrir ${project.title} em nova aba` : undefined}
                >
                    {project.link ? (
                        <iframe
                            title={`Prévia do projeto ${project.title}`}
                            src={project.link}
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className={styles.projectThumbPlaceholder}>Link indisponível</div>
                    )}
                    {project.link && <span className={styles.projectModalPreviewHint}>Clique para abrir em uma nova aba ↗</span>}
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;
