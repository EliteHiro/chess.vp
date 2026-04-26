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
  
  // Bright, toy-like colors for the board squares
  const baseColor = isLight ? '#fdfcf0' : '#3b82f6'
  let color = baseColor
  
  if (isSelected) color = '#f59e0b' 
  if (isLastMove) color = '#93c5fd'
  if (isCheck) color = '#ef4444'
  if (hovered && !isSelected) color = isLight ? '#fff' : '#60a5fa'

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
          roughness={0.1} 
          metalness={0.1}
        />
      </mesh>
      
      {moveType === 'move' && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
        </mesh>
      )}
      
      {moveType === 'capture' && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[SQUARE_SIZE/2 - 0.15, SQUARE_SIZE/2 - 0.05, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

function Piece3D({ piece, position, squareId, onClick }) {
  const isWhite = piece.color === 'w'
  const color = isWhite ? '#ffffff' : '#3b82f6' 
  
  const renderPieceModel = () => {
    const type = piece.type.toLowerCase()
    const materialProps = {
      color: color,
      roughness: 0.05,
      metalness: 0.4,
      emissive: color,
      emissiveIntensity: 0.1,
      envMapIntensity: 1.5
    }

    // High-quality beveled base
    const PieceBase = () => (
      <group>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.35, 0.38, 0.05, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.28, 0.35, 0.08, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    )

    // Neck ring detail for a premium look
    const NeckRing = ({ y }) => (
      <mesh position={[0, y, 0]}>
        <torusGeometry args={[0.18, 0.03, 16, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    )

    switch (type) {
      case 'p': // Pawn
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.12, 0.28, 0.4, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <NeckRing y={0.45} />
            <mesh position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.22, 32, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'r': // Rook
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.22, 0.28, 0.5, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <NeckRing y={0.55} />
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.25, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Top indent */}
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.05, 32]} />
              <meshStandardMaterial color="#000" />
            </mesh>
          </group>
        )
      case 'n': // Knight (Character-style)
        return (
          <group rotation={[0, isWhite ? Math.PI : 0, 0]}>
            <PieceBase />
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.18, 0.28, 0.4, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <NeckRing y={0.45} />
            {/* Horse body */}
            <mesh position={[0, 0.65, 0.1]} rotation={[-0.4, 0, 0]}>
              <boxGeometry args={[0.28, 0.5, 0.4]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Muzzle */}
            <mesh position={[0, 0.85, 0.3]} rotation={[-0.8, 0, 0]}>
              <boxGeometry args={[0.22, 0.25, 0.45]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Ears */}
            <mesh position={[0.1, 1.0, 0.1]}>
              <boxGeometry args={[0.05, 0.15, 0.05]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[-0.1, 1.0, 0.1]}>
              <boxGeometry args={[0.05, 0.15, 0.05]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'b': // Bishop
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.12, 0.25, 0.6, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <NeckRing y={0.65} />
            <mesh position={[0, 0.85, 0]} rotation={[0, 0, 0.2]}>
              <sphereGeometry args={[0.2, 32, 32]} scale={[0.85, 1.3, 0.85]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'q': // Queen
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.15, 0.28, 0.9, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <NeckRing y={0.9} />
            <mesh position={[0, 1.05, 0]}>
              <cylinderGeometry args={[0.35, 0.18, 0.25, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <sphereGeometry args={[0.12, 32, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      case 'k': // King
        return (
          <group>
            <PieceBase />
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.18, 0.3, 1.0, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <NeckRing y={1.0} />
            <mesh position={[0, 1.15, 0]}>
              <cylinderGeometry args={[0.4, 0.22, 0.2, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Ornate Cross */}
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[0.1, 0.4, 0.1]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0, 1.45, 0]}>
              <boxGeometry args={[0.3, 0.1, 0.1]} />
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
    <div style={{ width: '100%', height: '100%', minHeight: '500px', display: 'flex', position: 'relative' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 6, 8], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        {/* Deep Magical Galaxy Background */}
        <color attach="background" args={['#0a0520']} />
        <fog attach="fog" args={['#0a0520', 10, 25]} />
        
        {/* Twinkling Galaxy Stars */}
        <Stars radius={100} depth={50} count={8000} factor={7} saturation={1} fade speed={3} />
        
        {/* Galactic Center / Wormhole Glow */}
        <pointLight position={[0, 0, -20]} color="#06b6d4" intensity={5} />
        <pointLight position={[10, 5, -5]} color="#ec4899" intensity={2} /> 
        <pointLight position={[-10, 5, 5]} color="#a855f7" intensity={2} /> 

        <ambientLight intensity={0.5} />
        <directionalLight 
          castShadow 
          position={[5, 10, 5]} 
          intensity={1.5} 
        />
        
        <Environment preset="night" />

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
          
          {/* Whimsical Board Base */}
          <mesh position={[0, -0.3, 0]} receiveShadow>
            <boxGeometry args={[SQUARE_SIZE * 8.4, 0.3, SQUARE_SIZE * 8.4]} />
            <meshStandardMaterial color="#fff" roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[SQUARE_SIZE * 9, 0.2, SQUARE_SIZE * 9]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.1} />
          </mesh>
        </group>

        <ContactShadows position={[0, -0.55, 0]} opacity={0.6} scale={20} blur={2} far={4} color="#000" />

        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={6}
          maxDistance={15}
        />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.2} mipmapBlur intensity={1.2} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
