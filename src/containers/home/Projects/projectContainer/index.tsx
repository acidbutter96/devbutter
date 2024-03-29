import { ProjectContainerInterface } from '../interfaces';
import styles from '../styles.module.scss';
import Image from 'next/image';


const projectContainer = ({projectData} : { projectData: ProjectContainerInterface }):React.JSX.Element => {
    return <div key={projectData.id} className={styles.projectContainer}>
    <div className={styles.upperRow}>
        <Image src={projectData.imgSrc} width={10} height={10} alt={projectData.name} />
    </div>
    <div className={styles.underRow}>
        <div className={styles.titleContainer}>
            <h3>{projectData.name??"??"}</h3>
        </div>
        <div className={styles.skillImageContainer}>
            <Image src="/project.svg" width={100} height={100} alt={"project image"} />
            <Image src="/project.svg" width={100} height={100} alt={"project image"} />
        </div>
    </div>
</div>
}

export default projectContainer