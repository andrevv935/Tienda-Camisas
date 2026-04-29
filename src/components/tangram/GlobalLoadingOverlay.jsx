import React from 'react'
import TangramCanvas from './TangramCanvas.jsx'
import { useLoadingScreen } from '../../hook/loadingScreen/loadingScreen.jsx'

export default function GlobalLoadingOverlay() {
  const { isGlobalLoadingVisible, isInitialScreenLoading } = useLoadingScreen()

  if (!isGlobalLoadingVisible) return null

  const isFullscreen = isInitialScreenLoading

  return (
    <div aria-hidden={!isGlobalLoadingVisible} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={isFullscreen ? { pointerEvents: 'auto', width: '100vw', height: '100vh', overflow: 'hidden', background: '#ffffff' } : { pointerEvents: 'auto', width: 360, height: 360, borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.35)', background: '#ffffff' }}>
        <TangramCanvas clearColor='#ffffff' />
      </div>
    </div>
  )
}
