"use client";

import Footer from '@/components/Footer';
import styles from './styles.module.scss';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export const GetInTouch = (): React.JSX.Element => {
    const [bgCounter, setBgCounter ] = useState<number>(1);

    useEffect(()=>{
        const timeout = setTimeout(() => {
            if (bgCounter == 4) {
                setBgCounter(1);
                console.log("dfemonionadnoiasd")
            } else {
                setBgCounter(bgCounter + 1);
            }
        }, 50);

        return () => clearTimeout(timeout);
    },[bgCounter])

    return (
        <div id="getInTouch" className={styles.container}>
            <div className={styles.row}>
                <div id="title" className={styles.firstRow}>
                    <h2>get in touch</h2>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.contactFormColumn}>
                    <form action="" method="post">
                        <div className={styles.row}>
                            <input type="text" />
                        </div>
                        <div className={styles.row}>
                            <input type="text" />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.halfRow}>
                                <input type="text" />
                            </div>
                            <div className={styles.halfRow}>
                                <input type="text" />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.subjectContainer}>
                                <input type="text" />
                            </div>
                        </div>
                    </form>
                </div>
                <div className={styles.textColumn}>
                    <div className={styles.titleRow}>
                        <h3>Ready to <span className={styles.pinkText}>Hustle!</span></h3>
                    </div>
                    <div className={styles.textRow}>
                        <p>
                            Dolore et dolore ut id id sint deserunt cupidatat ullamco aute culpa aliquip exercitation dolore. Amet eu reprehenderit magna sunt irure cupidatat reprehenderit. Nisi et nulla consectetur proident dolore enim. Exercitation esse labore proident quis magna. Nostrud consectetur non eiusmod anim irure duis pariatur esse ipsum. Reprehenderit dolor ullamco pariatur tempor deserunt.
                        </p>
                        <p>
                            Occaecat magna reprehenderit ullamco commodo in sit cupidatat consectetur magna. Velit dolor velit sint ipsum Lorem exercitation in velit labore non fugiat. Ea cupidatat nisi irure in ea sit officia id voluptate tempor magna. Elit elit aute qui in ipsum nostrud voluptate ad Lorem irure reprehenderit. Amet non irure ut excepteur eiusmod elit Lorem veniam. Id adipisicing exercitation sit pariatur fugiat adipisicing veniam est.
                        </p>
                        <p>
                            Do minim do exercitation occaecat magna ipsum. Qui pariatur officia voluptate quis quis. Anim proident nisi ad cillum incididunt labore consequat do ullamco.
                        </p>
                    </div>
                    <div className={styles.socialMediaRow}>
                        <div className={styles.socialMediaIcon}>
                            <Image src="/static/images/icons/github.svg" alt="" width={30} height={30} />
                        </div>
                        <div className={styles.socialMediaIcon}>
                            <Image src="/static/images/icons/linkedin.svg" alt="" width={30} height={30} />
                        </div>
                        <div className={styles.socialMediaIcon}>
                            <Image src="/static/images/icons/instagram.svg" alt="" width={30} height={30} />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <div className={`${styles.backgroundImage}`}>
                <Image src={`/static/images/vectorField${bgCounter}.svg`} alt="" width={0} height={0}/>
            </div>
            {/* <div className={`${styles.backgroundImage} ${styles.hidden}`}>
                <Image src="/static/images/vectorField2.svg" alt="" width={0} height={0} />
            </div>
            <div className={`${styles.backgroundImage} ${styles.hidden}`}>
                <Image src="/static/images/vectorField3.svg" alt="" width={0} height={0}/>
            </div>
            <div className={`${styles.backgroundImage} ${styles.hidden}`}>
                <Image src="/static/images/vectorField4.svg" alt="" width={0} height={0}/>
            </div> */}
        </div>
    )
}