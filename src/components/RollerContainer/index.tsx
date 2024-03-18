import Link from 'next/link';

import styles from './styles.module.scss';

export const RollerContainer = ({ children }: Readonly<{
    children: React.ReactNode;
}>): React.JSX.Element => (
    <main className={styles.main}>
        {children}
    </main>
)
