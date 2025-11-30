import React from "react";
import { ProjectContainerInterface } from "../interfaces";
import styles from "../styles.module.scss";

interface ProjectCardProps {
    projectData: ProjectContainerInterface;
    onSelect: (project: ProjectContainerInterface) => void;
}

const ProjectCard = ({ projectData, onSelect }: ProjectCardProps): React.JSX.Element => {
    const normalizedDescription = projectData.description?.trim() ?? "";
    const descriptionPreview = normalizedDescription.slice(0, 110);
    const isTruncated = normalizedDescription.length > descriptionPreview.length;

    return (
        <button
            type="button"
            className={styles.projectCard}
            onClick={() => onSelect(projectData)}
            aria-label={`Ver detalhes do projeto ${projectData.title}`}
        >
            <div className={styles.projectThumb}>
                {projectData.link ? (
                    <iframe
                        title={`Preview do projeto ${projectData.title}`}
                        src={projectData.link}
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className={styles.projectThumbPlaceholder}>
                        Preview indisponível
                    </div>
                )}
            </div>
            <div className={styles.projectInfo}>
                <h3>{projectData.title}</h3>
                {descriptionPreview ? (
                    <p>{descriptionPreview}{isTruncated ? "…" : ""}</p>
                ) : (
                    <p className={styles.projectInfoMuted}>Sem descrição</p>
                )}
            </div>
        </button>
    );
};

export default ProjectCard;