"use client"

import styles from './styles.module.scss';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const ComingSoonComponent = (): React.JSX.Element => {
    const imageDim = [880, 540]
    const [multiple, setMultiple] = useState<number>(1.9);
    const [screenWidth, setScreenWidth] = useState<number | null>(null)
    const [currentWelcome, setCurrentWelcome] = useState<string>("coming soon")

    const welcomeArray: string[] = [
        "coming soon",
        "próximamente",
        "bientôt disponible",
        "bald verfügbar",
        "presto disponibile",
        "em breve",
        "binnenkort beschikbaar",
        "скоро",
        "即将推出",
        "即將推出",
        "近日公開",
        "곧 출시될 예정입니다",
        "قريبًا",
        "çok yakında",
        "जल्द ही आ रहा है",
        "শীঘ্রই আসছে",
        "جلد آ رہا ہے",
        "ਜਲਦ ਆ ਰਿਹਾ ਹੈ",
        "kuja hivi karibuni"
    ]

    useEffect(() => {
        const updateScreenWidth = () => {
            setScreenWidth(window.innerWidth)
        };
        window.addEventListener('resize', updateScreenWidth);
        updateScreenWidth();
        return () => {
            window.removeEventListener('resize', updateScreenWidth);
        };
    }, []);

    useEffect(() => {
        if (screenWidth && screenWidth <= 414) {
            setMultiple(1)
        } else {
            setMultiple(1.9)
        }
    }, [screenWidth])

    useEffect(() => {
        const timeout = setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * welcomeArray.length);
            setCurrentWelcome(welcomeArray[randomIndex]);
        }, 4000);

        return () => clearTimeout(timeout);
    }, [welcomeArray]);

    return (
        <div id="devbutter" className={styles.container}>
            <div id="row1" className={styles.row}>
                <div id="text-container" className={styles.firstColumn}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.title}>
                            DevButter!
                        </h1>
                        <p className={styles.text}>
                            {currentWelcome}
                        </p>
                    </div>
                </div>
                <div id="image-container" className={styles.secondColumn}>
                    <div className={styles.secondColumn}>
                        <div className={styles.imageContainer}>
                            <Image src="/manholdingcomputer.svg" alt="" width={imageDim[0] * multiple} height={imageDim[1] * multiple} layout="responsive" />
                            {/* <Image src="/person.svg" alt="" width={imageDim[0] * multiple} height={imageDim[1] * multiple} layout="responsive" /> */}
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