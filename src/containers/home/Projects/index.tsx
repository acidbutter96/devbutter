import Image from 'next/image';
import styles from './styles.module.scss';
import projectContainer from './projectContainer';

export const Projects = (): React.JSX.Element => {
    return (
        <div id="projects" className={styles.container}>
            <div className={styles.row}>
                <div id="title" className={styles.firstRow}>
                    <h2>projects</h2>
                </div>
            </div>
            <div id="grind-container" className={styles.secondRow}>
                <div id="grid" className={`${styles.grid} `}>
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8].map((el) => projectContainer({
                            projectData: {id: el,
                                imgSrc: `/project.svg`,
                                name: `project ${el}`,
                                stacks: ['React', 'Next.js', 'Typescript'],
                                url: `/project${el}`}
                        }))
                    }
                </div>
                <div id="void" className={styles.void}></div>
            </div>
            <div id="load-button" className={styles.loadBtnContainer}>
                <div id="btn-container">
                    <button id="load-more">
                        load more
                    </button>
                </div>
            </div>
        </div>
    )
}