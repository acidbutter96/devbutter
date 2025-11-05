"use client"

import styles from './styles.module.scss';
import React from 'react';
import Image from 'next/image';

export const Header = ({ hiddenMenu = false }: { hiddenMenu?: boolean }): React.JSX.Element => {
    const handleScroll = React.useCallback((sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    return (
        <header className={styles.headerContainer}>
            <nav className={styles.navbarContainer}>
                <div id="logo-container" className={styles.logoContainer}>
                    <div className={styles.imgContainer}>
                        <Image src="/devbutter.svg" alt="" width={70} height={70} />
                    </div>
                </div>
                <div id="buttons-container" className={styles.buttonsContainer}>
                    {hiddenMenu ? null : (
                        <>
                            <button type="button" onClick={() => handleScroll('devbutter')}>
                                Home
                            </button>
                            <button type="button" onClick={() => handleScroll('projects')}>
                                Projects
                            </button>
                            <button type="button" onClick={() => handleScroll('experience')}>
                                Experience
                            </button>
                            <button type="button" onClick={() => handleScroll('getInTouch')}>
                                Contacts
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
