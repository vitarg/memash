import Main from './components/main/Main.tsx';

function App() {
    return (
        <main style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'min-content 1fr'
        }}>
            <header style={{ paddingLeft: 16 }}>
                <h1>Memash</h1>
            </header>

            <Main />
        </main>
    );
}

export default App;
