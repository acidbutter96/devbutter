"use client";

import Footer from '@/components/Footer';
import styles from './styles.module.scss';
import Image from 'next/image';

export const GetInTouch = (): React.JSX.Element => {

    return (
        <div id="getInTouch" className={styles.container}>
            <div className={styles.row}>
                <div id="title" className={styles.firstRow}>
                    <h2>get in touch</h2>
                </div>
            </div>
            <div className={styles.row}>
                <form action="" method="post">
                    <div className={styles.contactFormColumn}>
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
                    </div>
                </form>
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
        </div>
    )
}