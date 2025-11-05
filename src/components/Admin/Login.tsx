"use client";

import React from "react";
import styles from "@/app/admin/styles.module.scss";

interface Props {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  loading: boolean;
  error: string | null;
  onLogin: (e: React.FormEvent) => void;
}

export default function Login({ email, password, setEmail, setPassword, loading, error, onLogin }: Props) {
  return (
    <div className={styles.loginLayout}>
      <section className={`${styles.card} ${styles.loginCard}`}>
        <h2>Restricted access</h2>
        <form onSubmit={onLogin} className={styles.form}>
          <label className={styles.field}>
            <span>Email</span>
            <input className={styles.input} value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input className={styles.input} value={password} onChange={e => setPassword(e.target.value)} type="password" required />
          </label>
          <div className={styles.formActions}>
            <button className={styles.primaryButton} type="submit" disabled={loading}>Sign in</button>
          </div>
          {error && <div className={styles.error} role="alert">{error}</div>}
        </form>
      </section>

      <figure className={styles.loginIllustration}>
        <img src="/static/images/aliens/juggler_alien.svg" alt="Juggler alien illustration" width={420} height={420} />
      </figure>
    </div>
  );
}
