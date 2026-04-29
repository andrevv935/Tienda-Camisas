import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createTangramPieces, getTangramFrame, getFigureBounds, pointsToString } from './figures.js'

const EXTRUDE_DEPTH = 0.18

function createShapeFromPoints(points) {
	const shape = new THREE.Shape()
	if (!points || points.length === 0) return shape
	shape.moveTo(points[0][0], points[0][1])
	for (let i = 1; i < points.length; i += 1) {
		shape.lineTo(points[i][0], points[i][1])
	}
	shape.closePath()
	return shape
}

export default function TangramCanvas({ className = '', clearColor = '#ffffff' }) {
	const containerRef = useRef(null)
	const rafRef = useRef(null)
	const meshesRef = useRef(new Map())

	const pieces = useMemo(() => createTangramPieces(), [])

	useEffect(() => {
		if (typeof window === 'undefined') return
		const container = containerRef.current
		if (!container) return

		const width = container.clientWidth || 360
		const height = container.clientHeight || 360

		let renderer = null
		let svgEl = null
		try {
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
			renderer.setPixelRatio(window.devicePixelRatio || 1)
			renderer.setSize(width, height)
			renderer.setClearColor(new THREE.Color(clearColor), 0)
			container.appendChild(renderer.domElement)
		} catch (e) {
			// WebGL unavailable — fallback to lightweight SVG rendering
			const bounds = getFigureBounds()
			svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
			svgEl.setAttribute('width', width)
			svgEl.setAttribute('height', height)
			svgEl.setAttribute('viewBox', `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`)
			svgEl.style.display = 'block'
			container.appendChild(svgEl)
		}

		const scene = new THREE.Scene()

		const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100)
		camera.position.set(0, 0, 6)

		let group = null
		if (renderer) {
			const ambient = new THREE.AmbientLight(0xffffff, 0.6)
			scene.add(ambient)

			const dir = new THREE.DirectionalLight(0xffffff, 0.8)
			dir.position.set(2, 4, 5)
			scene.add(dir)

			group = new THREE.Group()
			scene.add(group)

			// Corregir orientación global: rotar 180° en Z para que las piezas no queden boca abajo
			group.rotation.z = Math.PI
		} else {
			// prepare SVG groups
			svgEl.innerHTML = ''
		}

		// create meshes from pieces preserving measures
		// We'll apply palette colors dynamically after creating meshes so
		// theme changes can update fills without recreating geometry.
		pieces.forEach((p) => {
			if (renderer && group) {
				const shape = createShapeFromPoints(p.points)
				const geom = new THREE.ExtrudeGeometry(shape, { depth: EXTRUDE_DEPTH, bevelEnabled: false, curveSegments: 8 })
				geom.computeBoundingBox()

				// center geometry so mesh.position corresponds to tangram pose
				const bb = geom.boundingBox
				const center = new THREE.Vector3()
				bb.getCenter(center)
				geom.translate(-center.x, -center.y, -EXTRUDE_DEPTH * 0.5)

				const material = new THREE.MeshStandardMaterial({ color: p.fill, metalness: 0.2, roughness: 0.5, side: THREE.DoubleSide })
				const mesh = new THREE.Mesh(geom, material)
				mesh.castShadow = true
				mesh.receiveShadow = true
				mesh.userData.key = p.key
				mesh.position.z = 0
				group.add(mesh)
				meshesRef.current.set(p.key, mesh)
			} else if (svgEl) {
				const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
				poly.setAttribute('points', pointsToString(p.points))
				poly.setAttribute('fill', p.fill)
				poly.setAttribute('data-key', p.key)
				svgEl.appendChild(poly)
			}
		})


		// Apply palette/colors dynamically and on theme refresh.
		function readPaletteColorsFromCSS() {
			try {
				const root = window.getComputedStyle(document.documentElement)
				const vars = [
					'--color-primary-light',
					'--color-secondary-light',
					'--color-accent-light',
					'--color-bg-light',
					'--color-text-light',
				]

				const paletteColors = vars.map((v) => root.getPropertyValue(v).trim()).filter(Boolean)
				return paletteColors.length > 0 ? paletteColors : null
			} catch (e) {
				return null
			}
		}

		let applyAttempts = 0
		function applyPaletteOnce() {
			const palette = readPaletteColorsFromCSS()
			applyAttempts += 1

			if (!palette && applyAttempts < 5) {
				// retry shortly in case bootstrap hasn't set variables yet
				setTimeout(applyPaletteOnce, 100)
				return
			}

			if (!palette) return

			// assign colors deterministically by piece index
			pieces.forEach((p, i) => {
				const color = palette[i % palette.length] || p.fill
				const mesh = meshesRef.current.get(p.key)
				if (mesh && mesh.material) {
					mesh.material.color.set(color)
					mesh.material.needsUpdate = true
				}

				if (svgEl) {
					const el = svgEl.querySelector(`[data-key="${p.key}"]`)
					if (el) el.setAttribute('fill', color)
				}
			})
		}

		applyPaletteOnce()
		// Prefer to listen to 'theme:applied' which fires after CSS vars are set.
		window.addEventListener('theme:applied', applyPaletteOnce)

		let start = performance.now()

		function onFrame(now) {
			const elapsed = (now - start) / 1000
			const poses = getTangramFrame(elapsed)
			poses.forEach((pose) => {
				const mesh = meshesRef.current.get(pose.key)
				if (mesh) {
					mesh.position.x = pose.x
					mesh.position.y = pose.y
					mesh.rotation.z = pose.rotation
				}
				if (svgEl) {
					const el = svgEl.querySelector(`[data-key="${pose.key}"]`)
					if (el) {
						const deg = (pose.rotation || 0) * 180 / Math.PI
						el.setAttribute('transform', `translate(${pose.x} ${pose.y}) rotate(${deg})`)
					}
				}
			})

			if (renderer && group) {
				group.rotation.y = Math.sin(elapsed * 0.6) * 0.35
				camera.lookAt(group.position)
				renderer.render(scene, camera)
			}

			rafRef.current = requestAnimationFrame(onFrame)
		}

		rafRef.current = requestAnimationFrame(onFrame)

		function handleResize() {
			const w = container.clientWidth || 360
			const h = container.clientHeight || 360
			camera.aspect = w / h
			camera.updateProjectionMatrix()
			if (renderer) renderer.setSize(w, h)
			if (svgEl) {
				svgEl.setAttribute('width', w)
				svgEl.setAttribute('height', h)
			}
		}

		const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null
		if (ro) ro.observe(container)
		window.addEventListener('resize', handleResize)

		// cleanup for palette listener
		const removeThemeListener = () => window.removeEventListener('theme:applied', applyPaletteOnce)

		handleResize()

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
			if (ro) ro.disconnect()
			window.removeEventListener('resize', handleResize)
			if (renderer) {
				renderer.dispose()
			}
			// dispose geometries and materials
			meshesRef.current.forEach((m) => {
				if (m.geometry) m.geometry.dispose()
				if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose())
				else if (m.material) m.material.dispose()
			})
			if (renderer?.domElement && renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
			if (svgEl && svgEl.parentNode === container) container.removeChild(svgEl)
			meshesRef.current.clear()
			removeThemeListener()
		}
	}, [pieces, clearColor])

	return (
		<div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />
	)
}
