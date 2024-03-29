"use client";

import styles from './styles.module.scss';
import projectContainer from './projectContainer';
import Image from 'next/image';
import { useState } from 'react';

export const Projects = (): React.JSX.Element => {
    const [rotateBackward, setRotateBackward] = useState<boolean>(false);

    const changeSpin = () => {
        console.log(rotateBackward);
        setRotateBackward(!rotateBackward);
        console.log(rotateBackward);
    }

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
                        [1, 2, 3, 4, 5, 6,].map((el) => projectContainer({
                            projectData: {
                                id: el,
                                imgSrc: `/project.svg`,
                                name: `project ${el}`,
                                stacks: ['React', 'Next.js', 'Typescript'],
                                url: `/project${el}`
                            }
                        }))
                    }
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
            
        </div>
    )
}