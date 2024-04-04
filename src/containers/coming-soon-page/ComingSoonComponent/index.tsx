"use client"

import { useNextApi } from '@/contexts/api';
import styles from './styles.module.scss';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IFileNames } from '@/services/filesService/interfaces';

export const ComingSoonComponent = (): React.JSX.Element => {
    const directory: string = "./public/static/images/aliens/"
    const { getFileNames } = useNextApi()

    const [currentWelcome, setCurrentWelcome] = useState<string>("vem aí")
    const [aliens, setAliens] = useState<IFileNames[]>([])
    const [alienIndex, setAlienIndex] = useState<number>(0)

    useEffect(() => {
        setAliens([
            {
                "title": "Alien_having_a_big_idea",
                "link": "/",
                "src": "/static/images/aliens/alien_having_a_big_idea.svg"
            },
            {
                "title": "Alien_using_computer",
                "link": "/",
                "src": "/static/images/aliens/alien_using_computer.svg"
            },
            {
                "title": "Aliens_planning",
                "link": "/",
                "src": "/static/images/aliens/aliens_planning.svg"
            },
            {
                "title": "Analytical_alien",
                "link": "/",
                "src": "/static/images/aliens/analytical_alien.svg"
            },
            {
                "title": "Juggler_alien",
                "link": "/",
                "src": "/static/images/aliens/juggler_alien.svg"
            }
        ])
    }, [])

    useEffect(() => {
        setAlienIndex(Math.round(Math.random() * aliens.length))
    }, [aliens])

    console.log(aliens[alienIndex])

    const welcomeArray: string[] = [
        "vem aí",
        "coming soon",
        "próximamente",
        "bientôt disponible",
        "bald verfügbar",
        "presto disponibile",
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
        const timeout = setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * welcomeArray.length)
            setCurrentWelcome(welcomeArray[randomIndex])
        }, 2000)

        return () => clearTimeout(timeout)
    }, [welcomeArray])

    return (
        <div id="devbutter" className={styles.container}>
            <div id="row1" className={styles.row}>
                <div className={styles.firstRow}>
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
                        <div className={styles.imageContainer}>
                            <Image
                                src={aliens[alienIndex]?.src}
                                alt={aliens[alienIndex]?.title}
                                width={100}
                                height={100}
                            />
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