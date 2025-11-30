"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import ProjectCard from './projectContainer';
import { ProjectContainerInterface } from './interfaces';
import ProjectModal from './projectModal';

export const Projects = (): React.JSX.Element => {
    const [rotateBackward, setRotateBackward] = useState<boolean>(false);
    const [projects, setProjects] = useState<ProjectContainerInterface[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('loading');
    const [activeProject, setActiveProject] = useState<ProjectContainerInterface | null>(null);

    const changeSpin = () => {
        setRotateBackward(!rotateBackward);
    };

    useEffect(() => {
        let aborted = false;

        async function loadProjects() {
            setStatus('loading');
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) throw new Error(`Failed with status ${res.status}`);
                const data: any[] = await res.json();
                if (aborted) return;
                const normalized: ProjectContainerInterface[] = Array.isArray(data)
                    ? data.map((item, index) => ({
                        id: typeof item._id === 'string' ? item._id : `${item.title ?? 'project'}-${index}`,
                        title: item.title ?? 'Projeto sem título',
                        description: item.description ?? '',
                        link: item.link ?? '',
                        repo: item.repo ?? '',
                        createdAt: item.createdAt,
                    }))
                    : [];

                setProjects(normalized);
                setStatus('success');
            } catch (err) {
                console.error('Unable to load projects', err);
                if (!aborted) {
                    setProjects([]);
                    setStatus('error');
                }
            }
        }

        void loadProjects();

        return () => {
            aborted = true;
        };
    }, []);

    const handleSelectProject = (project: ProjectContainerInterface) => {
        setActiveProject(project);
    };

    const closeModal = () => setActiveProject(null);

    return (
        <div id="projects" className={styles.container}>
            <div className={styles.row}>
                <div id="title" className={styles.firstRow}>
                    <h2>projects</h2>
                </div>
            </div>
            <div id="grind-container" className={styles.secondRow}>
                <div id="grid" className={`${styles.grid} `}>
                    {status === 'loading' && <div className={styles.projectStatus}>Carregando projetos…</div>}
                    {status === 'error' && <div className={styles.projectStatus}>Não foi possível carregar os projetos.</div>}
                    {status === 'success' && projects.length === 0 && <div className={styles.projectStatus}>Novos projetos em breve.</div>}
                    {projects.map(project => (
                        <ProjectCard key={project.id} projectData={project} onSelect={handleSelectProject} />
                    ))}
                </div>
                <div id="void" className={styles.void}>
                    <div id="load-button" className={styles.loadBtnContainer}>
                        <div id="btn-container" className={styles.btnContainer}>
                            <button id="load-more">
                                <Image src={"./swipearrow.svg"} alt={"Load more"} width={0} height={0} />
                            </button>
                        </div>
                    </div>
                    <div onClick={changeSpin} id="spunspinner" className={styles.spinner}>
                        <div id="spiralContainer"
                        className={
                            `${styles.spiralContainer} ${rotateBackward? styles.rotateBackward : styles.rotateFoward}`
                        }>
                            <Image onClick={changeSpin} src="./spiral.svg" alt="spinner" width={0} height={0} />
                        </div>
                    </div>
                </div>
            </div>
            {activeProject && <ProjectModal project={activeProject} onClose={closeModal} />}
        </div>
    )
}