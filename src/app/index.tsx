import Main from '../pages/main';
import Header from '../widgets/header';
import styles from './styles.module.css';

function App() {
    return (
        <main className={styles.main}>
            <Header />

            <Main />
        </main>
    );
}

export default App;
