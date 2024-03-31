"use client";

import styles from "./styles.module.scss";
import Image from "next/image";
import StackCarousel from "./StackCarousel";

export const Experience = (): React.JSX.Element => {
    return (
        <div id="projects" className={styles.container}>
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
                        It is a long established fact that a reader will be distracted by the readable content of a <span className={styles.pinkHighlight}>page</span> when looking at its layout. The point of using <span className={styles.greenHighlight}>Lorem Ipsum</span> is that it has a more-or-less normal distribution of letters, as <span className={styles.pinkHighlight}>opposed to using</span> &lsquo;Content here, content here&rsquo;, making it look like readable English. Many desktop <span className={styles.greenHighlight}></span> packages and web page editors now use Lorem Ipsum as their default model text, and a search for &lsquo;lorem ipsum&rsquo; will uncover <span className={styles.pinkHighlight}>many web sites</span> still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
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