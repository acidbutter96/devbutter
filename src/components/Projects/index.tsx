import styles from './styles.module.scss';

export const Projects = (): React.JSX.Element => {
    return (
    <div className={styles.mainContainer}>
        <div id="title">
            <h1>projects</h1>
        </div>
        <div id="project-grid">
            
        </div>
        <div id="load-button">
            <div id="btn-container">
                <button id="load-more">

                </button>
            </div>
        </div>
    </div>
    )
}