import React, { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Billboard, Environment, ContactShadows, Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { getPieceSymbol } from '../hooks/useChessGame'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

const SQUARE_SIZE = 1.2
const BOARD_OFFSET = (8 * SQUARE_SIZE) / 2 - (SQUARE_SIZE / 2)

function BoardSquare({ position, isLight, squareId, onClick, moveType, isSelected, isLastMove, isCheck }) {
  const [hovered, setHovered] = useState(false)
  
  const baseColor = isLight ? '#1a1d24' : '#0d0f14'
  let color = baseColor
  
  if (isSelected) color = '#4a3f1d' 
  if (isLastMove) color = '#2c2919'
  if (isCheck) color = '#4a1d1d'
  if (hovered && !isSelected) color = isLight ? '#2a2f3d' : '#1e222d'

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
          roughness={0.2} 
          metalness={0.8}
        />
      </mesh>
      
      {/* Valid Move Indicator (Dot) */}
      {moveType === 'move' && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color={[1.5, 1.2, 0.2]} toneMapped={false} transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* Capture Indicator (Ring) */}
      {moveType === 'capture' && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[SQUARE_SIZE/2 - 0.15, SQUARE_SIZE/2 - 0.05, 32]} />
          <meshBasicMaterial color={[2, 0.2, 0.2]} toneMapped={false} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

function Piece3D({ piece, position, squareId, onClick }) {
  const symbol = getPieceSymbol(piece)
  if (!symbol) return null

  const isWhite = piece.color === 'w'
  // Glowing colors for Bloom
  const color = isWhite ? [2, 2, 2] : [0.2, 0.8, 2.0] // White pieces glow white, Black pieces glow neon blue

  return (
    <group position={position}>
      <Float speed={2.5} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.05, 0.1]}>
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
            fontSize={SQUARE_SIZE * 0.8}
            anchorX="center"
            anchorY="bottom"
            position={[0, 0, 0]}
          >
            {symbol}
            <meshBasicMaterial color={color} toneMapped={false} />
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
        <color attach="background" args={['#07080f']} />
        <fog attach="fog" args={['#07080f', 10, 20]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          castShadow 
          position={[5, 10, 5]} 
          intensity={1.5} 
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, -5]} color="#06b6d4" intensity={2} />
        
        {/* Environment for metallic reflections */}
        <Environment preset="city" />

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
          
          {/* Board Base / Frame */}
          <mesh position={[0, -0.3, 0]} receiveShadow>
            <boxGeometry args={[SQUARE_SIZE * 8.4, 0.2, SQUARE_SIZE * 8.4]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[SQUARE_SIZE * 8.6, 0.1, SQUARE_SIZE * 8.6]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} emissive="#4a3f1d" />
          </mesh>
        </group>

        {/* Fancy Shadows */}
        <ContactShadows position={[0, -0.45, 0]} opacity={0.8} scale={15} blur={2} far={4} color="#000000" />

        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={6}
          maxDistance={15}
        />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
