import Link from 'next/link';

import styles from './styles.module.scss';
import Image from 'next/image';

export const ComingSoonComponent = (): React.JSX.Element => {
    const imageDim = [880, 540]
    const multiple = 1.9

    return (
        <div id="devbutter" className={styles.container}>
            <div id="row1" className={styles.row}>
                <div id="text-container" className={styles.firstColumn}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.title}>
                            DevButter!
                        </h1>
                        <p className={styles.text}>
                            Coming Soon
                        </p>
                    </div>
                </div>
                <div id="image-container" className={styles.secondColumn}>
                    <div className={styles.secondColumn}>
                        <div className={styles.imageContainer}>
                            <Image src="/manholdingcomputer.svg" alt="" width={imageDim[0] * multiple} height={imageDim[1] * multiple} layout="responsive"/>
                        </div>
                    </div>
                </div>
            </div>
            <div id="background-spiral" className={styles.backgroundSpinner}>
                <Image src="/spiral.svg" alt="spinner" width={1200} height={1200} />
            </div>
        </div>
    )
}