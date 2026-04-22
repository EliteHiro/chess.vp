import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import HowToPlay from './components/HowToPlay'
import GamePage from './components/GamePage'
import Footer from './components/Footer'
import Lobby from './components/Lobby'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <main>
              <HeroSection />
              <FeaturesSection />
              <HowToPlay />
            </main>
            <Footer />
          </>
        } />
        <Route path="/local" element={<GamePage mode="local" />} />
        <Route path="/online/:matchId" element={<GamePage mode="online" />} />
        <Route path="/lobby" element={<Lobby />} />
      </Routes>
    </div>
  )
}

export default App
