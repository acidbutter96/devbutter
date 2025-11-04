"use client";

import Footer from '@/components/Footer';
import styles from './styles.module.scss';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Input from '@/components/Input';

export const GetInTouch = (): React.JSX.Element => {
    const [bgCounter, setBgCounter] = useState<number>(1);
    const [isSent, setIsSent] = useState<boolean>(false);
    const SENT_KEY = 'contact_form_sent_at';
    const ONE_HOUR_MS = 1000 * 60 * 60;
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (bgCounter == 4) {
                setBgCounter(1);
                console.log("dfemonionadnoiasd")
            } else {
                setBgCounter(bgCounter + 1);
            }
        }, 50);

        return () => clearTimeout(timeout);
    }, [bgCounter])

    // check session storage on mount to see if form was sent within last hour
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(SENT_KEY);
            if (stored) {
                const ts = Number(stored);
                if (!Number.isNaN(ts)) {
                    const diff = Date.now() - ts;
                    if (diff < ONE_HOUR_MS) {
                        setIsSent(true);
                        // schedule flip back when the hour passes
                        const remaining = ONE_HOUR_MS - diff;
                        const t = setTimeout(() => {
                            sessionStorage.removeItem(SENT_KEY);
                            setIsSent(false);
                        }, remaining);
                        return () => clearTimeout(t);
                    } else {
                        sessionStorage.removeItem(SENT_KEY);
                    }
                } else {
                    sessionStorage.removeItem(SENT_KEY);
                }
            }
        } catch (e) {
            // sessionStorage may not be available in some environments; fail silently
            console.warn('Could not access sessionStorage', e);
        }
    }, [])

    return (
        <div id="getInTouch" className={styles.container}>
            <div className={styles.row}>
                <div id="title" className={styles.firstRow}>
                    <h2>get in touch</h2>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.secondRow}>
                    <div className={styles.contactFormColumn}>
                        {isSent ? (
                            <div className={styles.successView}>
                                <div className={styles.imageContainer}>
                                    <Image
                                        src="/static/images/aliens/analytical_alien.svg"
                                        alt="success"
                                        width={160}
                                        height={106}
                                    />
                                </div>
                                <div className={styles.sentTextColumn}>
                                    <div className={styles.titleRow}>
                                        <h3 className={styles.greenText}>
                                            Message sent!
                                        </h3>
                                    </div>
                                    <div className={styles.textRow}>
                                        <p>Your message was successfully delivered. Thank you — we'll get back to you soon.</p>
                                        <p>You can send another message in up to 1 hour.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form action="" method="post" onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget as HTMLFormElement;
                                const fd = new FormData(form);

                                const payload = {
                                    name: String(fd.get("name") ?? ""),
                                    email: String(fd.get("email") ?? ""),
                                    message: String(fd.get("message") ?? ""),
                                    telephone: String(fd.get("telephone") ?? ""),
                                    subject: String(fd.get("subject") ?? ""),
                                };

                                // client-side validation
                                const newErrors: Record<string, string> = {};
                                if (!payload.subject.trim()) newErrors.subject = 'Please enter a subject.';
                                if (!payload.email.trim() || !/^\S+@\S+\.\S+$/.test(payload.email)) newErrors.email = 'Please enter a valid email.';
                                if (!payload.message.trim()) newErrors.message = 'Please enter a message.';
                                if (payload.telephone && !/^[0-9+\-()\s]+$/.test(payload.telephone)) newErrors.telephone = 'Please enter a valid phone number.';

                                if (Object.keys(newErrors).length > 0) {
                                    setErrors(newErrors);
                                    // focus first invalid field
                                    const firstKey = Object.keys(newErrors)[0];
                                    const el = form.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
                                    if (el && typeof el.focus === 'function') el.focus();
                                    return;
                                }
                                setErrors({});

                                try {
                                    const res = await fetch('/api/formSubmit', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(payload),
                                    });

                                    if (!res.ok) {
                                        console.error('Form submit error', await res.json());
                                        alert('Erro ao enviar formulário.');
                                        return;
                                    }

                                    // mark as sent in sessionStorage and show success view for 1 hour
                                    try {
                                        sessionStorage.setItem(SENT_KEY, String(Date.now()));
                                    } catch (e) {
                                        console.warn('Could not write sessionStorage', e);
                                    }
                                    setIsSent(true);
                                    form.reset();

                                    // schedule clearing after one hour
                                    setTimeout(() => {
                                        try { sessionStorage.removeItem(SENT_KEY); } catch (e) {}
                                        setIsSent(false);
                                    }, ONE_HOUR_MS);
                                } catch (err) {
                                    console.error(err);
                                    alert('Erro ao enviar formulário.');
                                }
                            }}>
                                <div className={styles.row}>
                                    <div className={`${styles.fieldWrapper} ${errors.subject ? styles.hasError : ''}`}>
                                        <Input name={"subject"} type={"text"} placeholder={"subject"} onChange={() => { if (errors.subject) setErrors(prev => { const c = {...prev}; delete c.subject; return c }) }} />
                                        {errors.subject && <div className={styles.errorText}>{errors.subject}</div>}
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={`${styles.fieldWrapper} ${errors.name ? styles.hasError : ''}`}>
                                        <Input name={"name"} type={"text"} placeholder={"name"} onChange={() => { if (errors.name) setErrors(prev => { const c = {...prev}; delete c.name; return c }) }} />
                                        {errors.name && <div className={styles.errorText}>{errors.name}</div>}
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.halfRow}>
                                        <div className={`${styles.fieldWrapper} ${errors.telephone ? styles.hasError : ''}`}>
                                            <Input name={"telephone"} type={"number"} placeholder={"telephone"} onChange={() => { if (errors.telephone) setErrors(prev => { const c = {...prev}; delete c.telephone; return c }) }} />
                                            {errors.telephone && <div className={styles.errorText}>{errors.telephone}</div>}
                                        </div>
                                    </div>
                                    <div className={styles.halfRow}>
                                        <div className={`${styles.fieldWrapper} ${errors.email ? styles.hasError : ''}`}>
                                            <Input name={"email"} type={"email"} placeholder={"email"} onChange={() => { if (errors.email) setErrors(prev => { const c = {...prev}; delete c.email; return c }) }} />
                                            {errors.email && <div className={styles.errorText}>{errors.email}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.subjectContainer}>
                                        <div className={`${styles.fieldWrapper} ${errors.message ? styles.hasError : ''}`}>
                                            <Input name={"message"} type={"textarea"} placeholder={"message"} onChange={() => { if (errors.message) setErrors(prev => { const c = {...prev}; delete c.message; return c }) }} />
                                            {errors.message && <div className={styles.errorText}>{errors.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.buttonContainer}>
                                    <button type="submit" className={styles.submitButton}>
                                        <span className={styles.buttonIcon} aria-hidden>
                                            {/* simple inline envelope icon */}
                                            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 2H19V14H1V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M1 2L10 9L19 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                        <span className={styles.buttonText}>Send</span>
                                    </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                    <div className={styles.textColumn}>
                        <div className={styles.titleRow}>
                            <h3>
                                Shoot your idea — <span className={styles.pinkText}>we&apos;ll code the magic!</span>
                            </h3>
                        </div>
                        <div className={styles.textRow}>
                            <p>
                                Use the form beside to share your idea with us! 🤓
                            </p>
                            <p>
                                We specialize in turning ideas into reality — straight from your mind to the web.
                            </p>
                            <p>
                                So, what are you thinking of? Tell us!
                            </p>
                        </div>
                        <div className={styles.socialMediaRow}>
                            <div className={styles.socialMediaIcon}>
                                <Image src="/static/images/icons/github.svg" alt="" width={30} height={30} />
                            </div>
                            <div className={styles.socialMediaIcon}>
                                <Image src="/static/images/icons/linkedin.svg" alt="" width={30} height={30} />
                            </div>
                            <div className={styles.socialMediaIcon}>
                                <Image src="/static/images/icons/instagram.svg" alt="" width={30} height={30} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <div className={`${styles.backgroundImage}`}>
                <Image src={`/static/images/vectorField${bgCounter}.svg`} alt="" width={0} height={0} />
            </div>
            {/* <div className={`${styles.backgroundImage} ${styles.hidden}`}>
                <Image src="/static/images/vectorField2.svg" alt="" width={0} height={0} />
            </div>
            <div className={`${styles.backgroundImage} ${styles.hidden}`}>
                <Image src="/static/images/vectorField3.svg" alt="" width={0} height={0}/>
            </div>
            <div className={`${styles.backgroundImage} ${styles.hidden}`}>
                <Image src="/static/images/vectorField4.svg" alt="" width={0} height={0}/>
            </div> */}
        </div>
    )
}