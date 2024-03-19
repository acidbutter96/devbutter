import Link from 'next/link';

import styles from './styles.module.scss';

export const RollerContainer = ({ children, haveMargin = true }: Readonly<{
    children: React.ReactNode;
    haveMargin: boolean;
}>): React.JSX.Element => (
    <main className={`${styles.main} ${haveMargin ? styles.haveMargin : ''}`}>
        {children}
    </main>
)
