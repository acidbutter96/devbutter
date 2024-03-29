import styles from './styles.module.scss';
import Image from 'next/image';

export const ContactUS = (): React.JSX.Element => {
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
                            <Image src="/manholdingcomputer.svg" alt="" width={imageDim[0] * multiple} height={imageDim[1] * multiple} />
                        </div>
                    </div>
                </div>
            </div>
            <div id="row2" className={styles.row}>
                <div id="swipeup" className={styles.swipeupContainer}>
                    <div className={styles.swipeupButton}>
                        <div id="arrow" className={styles.swipeUpButtonCentered}>
                            <Image src="/swipearrow.svg" alt="up arrow" width={30} height={30}/>
                        </div>
                        <div id="text" className={styles.swipeUpButtonCentered}>
                            swipe up
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}