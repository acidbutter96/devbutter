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

    // collapsed: used on small screens to hide the top nav while the user scrolls
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const scrollTimeout = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        const mq = window.matchMedia('(max-width: 430px)');

        const onScroll = () => {
            // only apply collapse behavior on small screens
            if (!mq.matches) return;

            if (window.scrollY < 10) {
                // at top — make visible
                setIsCollapsed(false);
                return;
            }

            // user has scrolled — collapse the header
            setIsCollapsed(true);

            // if user stops scrolling for 700ms, show header again
            if (scrollTimeout.current) {
                window.clearTimeout(scrollTimeout.current);
            }
            // store timeout id
            scrollTimeout.current = window.setTimeout(() => {
                setIsCollapsed(false);
            }, 700);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
        };
    }, []);

    return (
        <header className={styles.headerContainer}>
            <nav className={`${styles.navbarContainer} ${isCollapsed ? styles.collapsed : ''}`}>
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
