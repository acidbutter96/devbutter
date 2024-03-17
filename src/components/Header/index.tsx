import Link from 'next/link';

import styles from './styles.module.scss';

export function Header() {
    return (
        <header className={styles.headerContainer}>
            <nav className={styles.navbarContainer}>
                <div id="logo-container" className={styles.logoContainer}>
                    <img src="/devbutter.svg" alt="" />
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