import React from "react";
import Image from "next/image";
import { ProjectContainerInterface } from "../interfaces";
import styles from "../styles.module.scss";

interface ProjectCardProps {
    projectData: ProjectContainerInterface;
    onSelect: (project: ProjectContainerInterface) => void;
}

const ProjectCard = ({ projectData, onSelect }: ProjectCardProps): React.JSX.Element => {
    const stackIcons = inferProjectStacks(projectData);

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
                <h3 className={styles.projectTitle}>{projectData.title}</h3>
                {stackIcons.length ? (
                    <div className={styles.stackList} aria-label="Stacks do projeto">
                        {stackIcons.map((stack) => (
                            <span key={stack.name} className={styles.stackIcon} title={stack.label}>
                                <Image
                                    src={stack.icon}
                                    alt={stack.label}
                                    fill
                                    sizes="24px"
                                />
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className={styles.projectInfoMuted}>Site ao vivo</p>
                )}
            </div>
        </button>
    );
};

export default ProjectCard;

const STACK_LIBRARY = {
    react: { name: "react", label: "React", icon: "/static/images/stacks/react.svg" },
    nextjs: { name: "nextjs", label: "Next.js", icon: "/static/images/stacks/nextjs.svg" },
    node: { name: "node", label: "Node.js", icon: "/static/images/stacks/node.svg" },
    python: { name: "python", label: "Python", icon: "/static/images/stacks/python.svg" },
    tensorflow: { name: "tensorflow", label: "TensorFlow", icon: "/static/images/stacks/tensorflow.svg" },
    django: { name: "django", label: "Django", icon: "/static/images/stacks/django.svg" },
    fastapi: { name: "fastapi", label: "FastAPI", icon: "/static/images/stacks/fastapi.svg" },
    mongodb: { name: "mongodb", label: "MongoDB", icon: "/static/images/stacks/mongodb.svg" },
} as const;

function inferProjectStacks(project: ProjectContainerInterface) {
    const source = [project.title, project.description, project.link, project.repo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const matches = [
        source.includes("react") ? STACK_LIBRARY.react : null,
        source.includes("next") || source.includes("vercel") ? STACK_LIBRARY.nextjs : null,
        source.includes("node") ? STACK_LIBRARY.node : null,
        source.includes("python") ? STACK_LIBRARY.python : null,
        source.includes("tensorflow") ? STACK_LIBRARY.tensorflow : null,
        source.includes("django") ? STACK_LIBRARY.django : null,
        source.includes("fastapi") ? STACK_LIBRARY.fastapi : null,
        source.includes("mongo") ? STACK_LIBRARY.mongodb : null,
    ].filter(Boolean);

    if (!matches.length && project.link) {
        if (project.link.includes("vercel.app")) {
            return [STACK_LIBRARY.react, STACK_LIBRARY.nextjs];
        }

        return [STACK_LIBRARY.react, STACK_LIBRARY.nextjs, STACK_LIBRARY.node];
    }

    return matches.slice(0, 3);
}
