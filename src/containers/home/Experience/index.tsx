"use client";

import styles from "./styles.module.scss";
import Image from "next/image";
import StackCarousel from "./StackCarousel";

export const Experience = (): React.JSX.Element => {
    return (
        <div id="experience" className={styles.container}>
            <div id="title" className={styles.firstRow}>
                <h2>experience</h2>
            </div>
            <div className={styles.secondRow}>
                <div className={styles.personContainer}>
                    <div className={styles.imageCotnainer}>
                        <Image src={"./person.svg"} width={0} height={0} alt={"person"} />
                    </div>
                    <div className={styles.electricFieldContainer}>
                        <Image src={"./electricField.svg"} width={0} height={0} alt={"person"} />
                    </div>
                    <div id="midTriangle" className={styles.midTriangle}></div>
                    <div className={styles.void}>
                        <div className={styles.electroMagneticWavesContainer}>
                            <Image src={"./electroMagneticWaves.svg"} width={0} height={0} alt={"person"} />
                        </div>
                    </div>
                    <div className={styles.skillsCarousel}>
                    </div>
                </div>
                    <div className={styles.experienceTextContainer}>
                        <p>
                            I provide software development services across <span className={styles.pinkHighlight}>web</span>, <span className={styles.pinkHighlight}>backend</span>, <span className={styles.pinkHighlight}>data science</span>, <span className={styles.pinkHighlight}>AI</span> and <span className={styles.pinkHighlight}>mobile</span>. I build production APIs and backends with <span className={styles.greenHighlight}>FastAPI</span>, <span className={styles.greenHighlight}>Flask</span> and Node/Express, and implement web and mobile interfaces using <span className={styles.greenHighlight}>React</span> and <span className={styles.greenHighlight}>React Native</span>. I design, train and deploy <span className={styles.greenHighlight}>LLM</span>-based solutions and ML models, automate document processing with <span className={styles.pinkHighlight}>OCR</span> and <span className={styles.pinkHighlight}>Selenium</span>, and design data pipelines and orchestrate workflows with <span className={styles.greenHighlight}>Airflow</span>. I regularly use tools like <span className={styles.greenHighlight}>pandas</span>, <span className={styles.greenHighlight}>scikit-learn</span>, and <span className={styles.greenHighlight}>TensorFlow</span>.
                        </p>
                    </div>
            </div>
            <div className={styles.thirdRow}>
                <div className={styles.carouselContainer}>
                    <StackCarousel />
                </div>
            </div>

        </div>
    )
}