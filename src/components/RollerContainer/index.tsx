

import Link from 'next/link';

import styles from './styles.module.scss';

export const RollerContainer = ({ children, isComingSoon = true }: Readonly<{
    children: React.ReactNode;
    isComingSoon: boolean;
}>): React.JSX.Element => {

    const isComingSoonStyle = isComingSoon ? styles.isComingSoon : "";
    return (
        <div className={`${styles.content} ${isComingSoonStyle}`}>
            {children}
        </div>
    )
}
