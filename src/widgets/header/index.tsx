import { useEffect, useState } from 'react';
import styles from './styles.module.css';

type ThemeMode = 'light' | 'dark';

function Header() {
    const [theme, setTheme] = useState<ThemeMode>('light');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
        if (storedTheme) {
            setTheme(storedTheme);
            return;
        }
        const prefersDark = window.matchMedia?.(
            '(prefers-color-scheme: dark)',
        ).matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <span className={styles.logoMark} aria-hidden="true" />
                <div>
                    <h1 className={styles.title}>Memash</h1>
                </div>
            </div>
            <button
                type="button"
                className={styles.themeToggle}
                onClick={handleToggleTheme}
                aria-label="Toggle theme"
            >
                <span className={styles.themeIcon} aria-hidden="true">
                    {theme === 'dark' ? '🌙' : '☀️'}
                </span>
                <span
                    className={`${styles.themeDot} ${
                        theme === 'dark' ? styles.themeDotDark : ''
                    }`}
                    aria-hidden="true"
                />
            </button>
        </header>
    );
}

export default Header;
