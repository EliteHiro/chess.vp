import React, { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Billboard, Environment, ContactShadows, Stars, Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { getPieceSymbol } from '../hooks/useChessGame'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

const SQUARE_SIZE = 1.2
const BOARD_OFFSET = (8 * SQUARE_SIZE) / 2 - (SQUARE_SIZE / 2)

function BoardSquare({ position, isLight, squareId, onClick, moveType, isSelected, isLastMove, isCheck }) {
  const [hovered, setHovered] = useState(false)
  
  // Luxury purple theme — matches website palette
  const baseColor = isLight ? '#e8deff' : '#2d0e6e' // Pearl lavender vs Deep royal violet
  let color = baseColor
  
  if (isSelected) color = '#c9960c'       // Antique gold selection
  if (isLastMove) color = isLight ? '#d4c4ff' : '#4a1a9e'
  if (isCheck) color = '#8b0000'          // Deep crimson
  if (hovered && !isSelected) color = isLight ? '#f0e8ff' : '#3d12a0'

  return (
    <group position={position}>
      <mesh 
        onClick={(e) => {
          e.stopPropagation()
          onClick(squareId)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <boxGeometry args={[SQUARE_SIZE, 0.2, SQUARE_SIZE]} />
        <meshStandardMaterial 
          color={color} 
          roughness={isLight ? 0.12 : 0.08}
          metalness={isLight ? 0.1 : 0.25}
        />
      </mesh>
      
      {moveType === 'move' && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color="#c9960c" transparent opacity={0.75} />
        </mesh>
      )}
      
      {moveType === 'capture' && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[SQUARE_SIZE/2 - 0.15, SQUARE_SIZE/2 - 0.05, 32]} />
          <meshBasicMaterial color="#8b0000" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  )
}

function Piece3D({ piece, position, squareId, onClick }) {
  const isWhite = piece.color === 'w'
  // White: luminous pearl with lavender tint | Black: deep obsidian violet
  const color = isWhite ? '#f0ecff' : '#150830'
  
  const renderPieceModel = () => {
    const type = piece.type.toLowerCase()
    const materialProps = {
      color: color,
      roughness: isWhite ? 0.12 : 0.08,
      metalness: isWhite ? 0.15 : 0.35,
      emissive: isWhite ? '#9f7aea' : '#4c1d95',
      emissiveIntensity: isWhite ? 0.04 : 0.1
    }

    // Professional Staunton-style multi-layered base
    const PieceBase = () => (
      <group>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 0.06, 64]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.25, 0.35, 0.08, 64]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.04, 64]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    )

    // Decorative collar for major pieces
    const Collar = ({ y }) => (
      <mesh position={[0, y, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 64]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    )

    switch (type) {
      case 'p': // Pawn: Spherical head with collar
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.12, 0.25, 0.4, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <Collar y={0.45} />
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.22, 32, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'r': // Rook: Castle tower with vertical grooves logic
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.22, 0.28, 0.5, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <Collar y={0.6} />
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.3, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Top crenellations using a torus or cylinders */}
            <mesh position={[0, 0.95, 0]}>
              <torusGeometry args={[0.22, 0.06, 16, 6]} rotation={[Math.PI/2, 0, Math.PI/6]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'n': // Knight: Aggressive Spartan-crested horse head
        return (
          <group rotation={[0, isWhite ? Math.PI : 0, 0]}>
            <PieceBase />
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.18, 0.28, 0.4, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <Collar y={0.5} />
            {/* Horse Mane/Crest */}
            <mesh position={[0, 0.8, -0.05]} rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.1, 0.6, 0.4]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Horse Head Main Body */}
            <mesh position={[0, 0.75, 0.15]} rotation={[-0.5, 0, 0]}>
              <boxGeometry args={[0.28, 0.4, 0.45]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Muzzle */}
            <mesh position={[0, 0.9, 0.4]} rotation={[-0.9, 0, 0]}>
              <boxGeometry args={[0.22, 0.2, 0.35]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'b': // Bishop: Miter with diagonal slit look
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.12, 0.25, 0.6, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <Collar y={0.7} />
            <mesh position={[0, 0.95, 0]} rotation={[0.2, 0, 0.1]}>
              <sphereGeometry args={[0.2, 32, 32]} scale={[0.85, 1.4, 0.85]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Slit indicator */}
            <mesh position={[0, 1.0, 0.1]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.02, 0.3, 0.1]} />
              <meshStandardMaterial color={isWhite ? "#eee" : "#1a0a3e"} />
            </mesh>
            <mesh position={[0, 1.25, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'q': // Queen: Coronet with central bead
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.15, 0.28, 0.9, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <Collar y={0.95} />
            <mesh position={[0, 1.15, 0]}>
              <cylinderGeometry args={[0.35, 0.2, 0.3, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Coronet points using a torus or spheres */}
            <mesh position={[0, 1.3, 0]}>
              <torusGeometry args={[0.22, 0.05, 12, 12]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0, 1.4, 0]}>
              <sphereGeometry args={[0.12, 32, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'k': // King: Tallest with Cross-Pattée
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.18, 0.3, 1.1, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <Collar y={1.1} />
            <mesh position={[0, 1.25, 0]}>
              <cylinderGeometry args={[0.4, 0.25, 0.2, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Cross Topper */}
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.12, 0.4, 0.12]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0, 1.55, 0]}>
              <boxGeometry args={[0.35, 0.12, 0.12]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      default:
        return null
    }
  }

  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick(squareId)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        document.body.style.cursor = 'default'
      }}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {renderPieceModel()}
      </Float>
    </group>
  )
}

export default function ChessBoard({
  board,
  turn,
  selectedSquare,
  lastMove,
  kingInCheckSquare,
  getValidMoves,
  onSquareClick,
  isGameOver,
}) {
  
  const validMoveSquares = useMemo(() => {
    if (!selectedSquare) return new Map()
    const moves = getValidMoves(selectedSquare)
    const map = new Map()
    for (const move of moves) {
      map.set(move.to, move.captured ? 'capture' : 'move')
    }
    return map
  }, [selectedSquare, getValidMoves])

   return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      minHeight: '500px', 
      display: 'flex', 
      position: 'relative',
      background: 'linear-gradient(180deg, #1a1035, #0f0a20)'
    }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 6, 8], fov: 45 }}
      >
        {/* Magical Pixar Atmosphere */}
        <color attach="background" args={['#0f0a20']} />
        <fog attach="fog" args={['#1a1035', 8, 25]} />
        
        {/* Magical Sparkle Particles */}
        <group>
          {[...Array(80)].map((_, i) => (
            <Float key={i} speed={1.5 + Math.random()} rotationIntensity={0.5} floatIntensity={2}>
              <mesh position={[
                (Math.random() - 0.5) * 20,
                Math.random() * 8 + 1,
                (Math.random() - 0.5) * 20
              ]}>
                <sphereGeometry args={[0.03 + Math.random() * 0.02, 8, 8]} />
                <meshBasicMaterial color={['#ffb347', '#a78bfa', '#f472b6', '#60a5fa', '#2dd4bf'][i % 5]} />
              </mesh>
            </Float>
          ))}
        </group>

        {/* Purple-gold luxury lighting — matches website theme */}
        <ambientLight intensity={0.35} color="#c4b5fd" />
        <pointLight position={[8, 14, 8]}  color="#ffb347" intensity={2.0} distance={35} decay={2} />
        <pointLight position={[-8, 10, -8]} color="#a78bfa" intensity={1.4} distance={30} decay={2} />
        <pointLight position={[0, 6, 10]}  color="#f472b6" intensity={0.5} distance={20} decay={2} />
        
        <directionalLight 
          castShadow 
          position={[5, 15, 5]} 
          intensity={1.0} 
          shadow-mapSize={[2048, 2048]}
          color="#e0d0ff"
        />

        <group position={[0, 0, 0]}>
          {RANKS.map((rank, rowIndex) =>
            FILES.map((file, colIndex) => {
              const squareId = `${file}${rank}`
              const isLight = (rowIndex + colIndex) % 2 === 0
              const piece = board[rowIndex][colIndex]
              
              const x = colIndex * SQUARE_SIZE - BOARD_OFFSET
              const z = rowIndex * SQUARE_SIZE - BOARD_OFFSET
              
              return (
                <React.Fragment key={squareId}>
                  <BoardSquare
                    position={[x, 0, z]}
                    isLight={isLight}
                    squareId={squareId}
                    onClick={onSquareClick}
                    moveType={validMoveSquares.get(squareId)}
                    isSelected={selectedSquare === squareId}
                    isLastMove={lastMove && (lastMove.from === squareId || lastMove.to === squareId)}
                    isCheck={kingInCheckSquare === squareId}
                  />
                  {piece && (
                    <Piece3D 
                      piece={piece} 
                      position={[x, 0.1, z]} 
                      squareId={squareId}
                      onClick={onSquareClick}
                    />
                  )}
                </React.Fragment>
              )
            })
          )}
          
          {/* Luxury purple board frame with gold border */}
          <mesh position={[0, -0.28, 0]} receiveShadow>
            <boxGeometry args={[SQUARE_SIZE * 8.8, 0.28, SQUARE_SIZE * 8.8]} />
            <meshStandardMaterial color="#1a0a40" roughness={0.15} metalness={0.2} />
          </mesh>
          {/* Gold inlay border */}
          <mesh position={[0, -0.14, 0]}>
            <boxGeometry args={[SQUARE_SIZE * 9.0, 0.05, SQUARE_SIZE * 9.0]} />
            <meshStandardMaterial color="#b8860b" roughness={0.1} metalness={0.8}
              emissive="#7a5500" emissiveIntensity={0.4} />
          </mesh>
          {/* Deep violet platform base */}
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[SQUARE_SIZE * 9.4, 0.25, SQUARE_SIZE * 9.4]} />
            <meshStandardMaterial color="#0f0520" roughness={0.2} metalness={0.1} />
          </mesh>
        </group>

        <ContactShadows position={[0, -0.55, 0]} opacity={0.6} scale={20} blur={3} far={4} color="#1a1035" />

        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={6}
          maxDistance={15}
        />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.4} mipmapBlur intensity={0.25} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
