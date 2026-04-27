import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import GamePage from './components/GamePage'
import Footer from './components/Footer'
import Lobby from './components/Lobby'
import SecretWall from './components/SecretWall'

import WelcomeOverlay from './components/WelcomeOverlay'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={
          <>
            <WelcomeOverlay />
            <Header />
            <main>
              <HeroSection />
            </main>
            <Footer />
          </>
        } />
        <Route path="/local" element={<GamePage mode="local" />} />
        <Route path="/online/:matchId" element={<GamePage mode="online" />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/secret" element={<SecretWall />} />
      </Routes>
    </div>
  )
}

export default App
