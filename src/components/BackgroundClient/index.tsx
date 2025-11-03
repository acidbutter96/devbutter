"use client";
import React from 'react';
import Background from '@devbutter/paint-background';
import styles from './styles.module.scss';

// Render the background inside a fixed, bottom-anchored container so
// it stays behind page content. We disable pointer events so it doesn't
// intercept clicks and set aria-hidden since it's decorative.
export default function BackgroundClient() {
    return (
        <div aria-hidden="true" className={styles.container}>
            <Background colors={["#141628", "#1B1E32", "#F64C6F", "#04D361"]} />
        </div>
    );
}
