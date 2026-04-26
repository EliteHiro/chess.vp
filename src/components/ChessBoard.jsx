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
  const symbol = getPieceSymbol(piece)
  if (!symbol) return null

  const isWhite = piece.color === 'w'
  // Vibrant Disney colors
  const color = isWhite ? '#ffffff' : '#4f46e5' // Pure white and Royal Blue

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Billboard>
          <Text
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
            fontSize={SQUARE_SIZE * 0.9}
            anchorX="center"
            anchorY="middle"
            position={[0, 0.5, 0]}
          >
            {symbol}
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.2}
              roughness={0.3}
            />
          </Text>
        </Billboard>
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
        {/* Night Sky Background with Moon Glow */}
        <color attach="background" args={['#020410']} />
        <fog attach="fog" args={['#020410', 10, 25]} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1.5} />
        
        {/* Moon Glow */}
        <pointLight position={[0, 10, -10]} color="#fff" intensity={2} />
        <pointLight position={[-10, 5, 5]} color="#3b82f6" intensity={1} /> 

        <ambientLight intensity={0.4} />
        <directionalLight 
          castShadow 
          position={[5, 10, 5]} 
          intensity={1} 
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
