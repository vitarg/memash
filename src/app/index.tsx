import Main from '../pages/main';
import Header from '../widgets/header';

function App() {
    return (
        <main
            style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gridTemplateRows: 'min-content 1fr',
            }}
        >
            <Header />

            <Main />
        </main>
    );
}

export default App;
