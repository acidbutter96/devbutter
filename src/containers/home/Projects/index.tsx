import Image from 'next/image';
import styles from './styles.module.scss';

export const Projects = (): React.JSX.Element => {
    return (
        <div id="projects" className={styles.container}>
            <div className={styles.row}>
                <div id="title" className={styles.firstRow}>
                    <h2>projects</h2>
                </div>
            </div>
            <div id="grind-container" className={styles.secondRow}>
                <div id={`grid`} className={styles.grid}>
                    {[0, 1, 2].map((el) => 
                        (<div key={el} className={styles.projectContainer}>
                            <div className={styles.upperRow}>
                                <Image src="/project.svg" width={10} height={10} alt={"project image"} />
                            </div>
                            <div className={styles.underRow}>
                                <div className={styles.titleContainer}>
                                    <h3>project 1</h3>
                                </div>
                                <div className={styles.skillImageContainer}>
                                    <Image src="/project.svg" width={100} height={100} alt={"project image"} />
                                    <Image src="/project.svg" width={100} height={100} alt={"project image"} />
                                </div>
                            </div>
                        </div>)
                        )}
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