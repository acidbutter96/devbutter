import styles from './styles.module.scss';
import Image from 'next/image';

export const DevButter = (): React.JSX.Element => {
    const imageDim = [880, 540]
    const multiple = 1.9;
    return (
        <div id="devbutter" className={styles.container}>
            <div id="row1" className={styles.row}>
                <div id="text-container" className={styles.firstColumn}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.title}>
                            DevButter!
                        </h1>
                        <p className={styles.text}>
                            Fullstack Development <br />
                            and Data Analytics.
                        </p>
                    </div>
                </div>
                <div id="image-container" className={styles.secondColumn}>
                    <div className={styles.secondColumn}>
                        <div className={styles.imageContainer}>
                            <Image src="/static/images/manholdingcomputer.svg" alt="" width={10} height={10} />
                        </div>
                    </div>
                </div>
            </div>
            <div id="row2" className={styles.row}>
                <div id="swipeup" className={styles.swipeupContainer}>
                    {/* anchor link to the Projects section */}
                    <a href="#projects" className={styles.swipeupLink}>
                        <div className={styles.swipeupButton}>
                            <div id="arrow" className={styles.swipeupButtonCentered}>
                                {/* inline SVG so we can style fill via currentColor and animate on hover */}
                                <svg className={styles.swipeupArrow} width="23" height="14" viewBox="0 0 23 14" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M2.89375 13.8938L11.5 5.30625L20.1063 13.8938L22.75 11.25L11.5 0L0.25 11.25L2.89375 13.8938Z" fill="currentColor" />
                                </svg>
                            </div>
                            <div id="text" className={styles.swipeupButtonCentered}>
                                swipe up
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}