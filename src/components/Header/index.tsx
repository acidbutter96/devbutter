import Link from 'next/link';

import styles from './styles.module.scss';
import React from 'react';
import Image from 'next/image';

export const Header = (): React.JSX.Element => {
    return (
        <header className={styles.headerContainer}>
            <nav className={styles.navbarContainer}>
                <div id="logo-container" className={styles.logoContainer}>
                    <Image src="/devbutter.svg" alt="" width={70} height={70}/>
                </div>
                <div id="buttons-container" className={styles.buttonsContainer}>
                    <button>
                        Home
                    </button>
                    <button>
                        Projects
                    </button>
                    <button>
                        Experience
                    </button>
                    <button>
                        Contacts
                    </button>
                </div>
            </nav>
        </header>
    )
}
