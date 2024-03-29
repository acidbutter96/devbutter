"use client"

import Link from 'next/link';

import styles from './styles.module.scss';
import React from 'react';
import Image from 'next/image';
import scrollToAnchor from '@/utils/scrollToAnchor'

export const Header = ({ hiddenMenu = false }: { hiddenMenu?: boolean }): React.JSX.Element => {
    const userScrollToAnchor = scrollToAnchor(96)

    const makeActive = (link: string) => {
        userScrollToAnchor(link)
    }

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
                            <button onClick={()=>makeActive("#home")} onKeyDown={()=>makeActive("#home")}>
                                Home
                            </button>
                            <button onClick={()=>makeActive("#projects")} onKeyDown={()=>makeActive("#projects")}>
                                Projects
                            </button>
                            <button onClick={()=>makeActive("#experience")} onKeyDown={()=>makeActive("#experience")}>
                                Experience
                            </button>
                            <button onClick={()=>makeActive("#contacts")} onKeyDown={()=>makeActive("#contacts")}>
                                Contacts
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
