"use client";

import Footer from '@/components/Footer';
import styles from './styles.module.scss';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Input from '@/components/Input';

export const GetInTouch = (): React.JSX.Element => {
    const [bgCounter, setBgCounter] = useState<number>(1);

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
                        <form action="" method="post" onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget as HTMLFormElement;
                                const fd = new FormData(form);

                                const payload = {
                                    name: String(fd.get("name") ?? ""),
                                    email: String(fd.get("email") ?? ""),
                                    message: String(fd.get("message") ?? ""),
                                };

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

                                    alert('Formulário enviado com sucesso!');
                                    form.reset();
                                } catch (err) {
                                    console.error(err);
                                    alert('Erro ao enviar formulário.');
                                }
                            }}>
                            <div className={styles.row}>
                                <Input name={"subject"} type={"text"} placeholder={"subject"}/>
                            </div>
                            <div className={styles.row}>
                                <Input name={"name"} type={"text"} placeholder={"name"}/>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.halfRow}>
                                    <Input name={"telephone"} type={"number"} placeholder={"telephone"}/>
                                </div>
                                <div className={styles.halfRow}>
                                    <Input name={"email"} type={"email"} placeholder={"email"}/>
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.subjectContainer}>
                                    <Input name={"message"} type={"textarea"} placeholder={"message"} />
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
                    </div>
                    <div className={styles.textColumn}>
                        <div className={styles.titleRow}>
                            <h3>
                                Shoot your idea — <span className={styles.pinkText}>we’ll code the magic!</span>
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