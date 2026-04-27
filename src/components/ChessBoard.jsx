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
  
  // BH6 — exact colors from movie images
  const baseColor = isLight ? '#e8f4fd' : '#1e2d52' // Baymax soft white vs Hiro navy
  let color = baseColor
  
  if (isSelected) color = '#e63329'   // Baymax armor red
  if (isLastMove) color = isLight ? '#c8dff0' : '#2d4a7a'
  if (isCheck) color = '#7c5fa0'      // Purple armor accent
  if (hovered && !isSelected) color = isLight ? '#ffffff' : '#2d4a6b'

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
          roughness={isLight ? 0.08 : 0.18}
          metalness={isLight ? 0.04 : 0.2}
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
          <meshBasicMaterial color="#7c5fa0" transparent opacity={0.75} />
        </mesh>
      )}
    </group>
  )
}

function Piece3D({ piece, position, squareId, onClick }) {
  const isWhite = piece.color === 'w'
  // White: Baymax body white | Black: Hiro navy + purple armor tint
  const color = isWhite ? '#f0f8ff' : '#1e2d52'
  
  const renderPieceModel = () => {
    const type = piece.type.toLowerCase()
    const materialProps = {
      color: color,
      roughness: isWhite ? 0.15 : 0.2,
      metalness: isWhite ? 0.05 : 0.25,
      emissive: isWhite ? '#c8e8f8' : '#7c5fa0',
      emissiveIntensity: isWhite ? 0.06 : 0.18
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
      background: 'linear-gradient(180deg, #1a4a7a, #3a7ab8)'
    }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 6, 8], fov: 45 }}
      >
        {/* BH6 — sky blue atmosphere */}
        <color attach="background" args={['#1a4a7a']} />
        <fog attach="fog" args={['#3a7ab8', 12, 28]} />
        
        {/* Magical Sparkle Particles */}
        <group>
          {[...Array(60)].map((_, i) => (
            <Float key={i} speed={1.2 + Math.random()} rotationIntensity={0.2} floatIntensity={1.5}>
              <mesh position={[
                (Math.random() - 0.5) * 22,
                Math.random() * 8 + 1,
                (Math.random() - 0.5) * 22
              ]}>
                <sphereGeometry args={[0.03 + Math.random() * 0.04, 12, 12]} />
                <meshBasicMaterial color={['#ffffff', '#e8f4fd', '#e63329', '#7c5fa0', '#b8d8ec'][i % 5]} />
              </mesh>
            </Float>
          ))}
        </group>

        {/* BH6 sky lighting */}
        <ambientLight intensity={0.7} color="#b8d8ec" />
        <pointLight position={[8, 14, 8]}  color="#ffffff" intensity={2.5} distance={35} decay={2} />
        <pointLight position={[-8, 10, -8]} color="#7ab8d8" intensity={1.2} distance={28} decay={2} />
        <pointLight position={[0, 6, 10]}  color="#e63329" intensity={0.5} distance={18} decay={2} />
        <pointLight position={[0, 12, 0]}  color="#f0f8ff" intensity={2.0} distance={22} decay={2} />
        
        <directionalLight 
          castShadow 
          position={[5, 15, 5]} 
          intensity={1.4} 
          shadow-mapSize={[2048, 2048]}
          color="#e8f4fd"
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
          
          {/* BH6 Board frame — dark navy + Baymax-red accent */}
          <mesh position={[0, -0.28, 0]} receiveShadow>
            <boxGeometry args={[SQUARE_SIZE * 8.8, 0.28, SQUARE_SIZE * 8.8]} />
            <meshStandardMaterial color="#1e2d52" roughness={0.25} metalness={0.15} />
          </mesh>
          {/* Red armor trim */}
          <mesh position={[0, -0.14, 0]}>
            <boxGeometry args={[SQUARE_SIZE * 9.0, 0.05, SQUARE_SIZE * 9.0]} />
            <meshStandardMaterial color="#e63329" roughness={0.15} metalness={0.3}
              emissive="#e63329" emissiveIntensity={0.4} />
          </mesh>
          {/* Deep navy base */}
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[SQUARE_SIZE * 9.4, 0.25, SQUARE_SIZE * 9.4]} />
            <meshStandardMaterial color="#0f1a30" roughness={0.3} metalness={0.1} />
          </mesh>
        </group>

        <ContactShadows position={[0, -0.55, 0]} opacity={0.6} scale={20} blur={3} far={4} color="#1a4a7a" />

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
