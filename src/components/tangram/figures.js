const PIECE_KEYS = [
    'largeTriangleA',
    'largeTriangleB',
    'mediumTriangle',
    'smallTriangleA',
    'smallTriangleB',
    'square',
    'parallelogram',
]

const PIECE_PALETTE = [
    '#0f766e',
    '#f97316',
    '#ef4444',
    '#f59e0b',
    '#22c55e',
    '#3b82f6',
    '#a855f7',
]

const BASE_SHAPES = {
    largeTriangle: centerPoints([
        [0, 0],
        [2, 0],
        [0, 2],
    ]),
    mediumTriangle: centerPoints([
        [0, 0],
        [Math.SQRT2, 0],
        [0, Math.SQRT2],
    ]),
    smallTriangle: centerPoints([
        [0, 0],
        [1, 0],
        [0, 1],
    ]),
    square: centerPoints([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
    ]),
    parallelogram: centerPoints([
        [0, 0],
        [0, 1],
        [1, 2],
        [1, 1],
    ]),
}

function centerPoints(points) {
    const xs = points.map(([x]) => x)
    const ys = points.map(([, y]) => y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    return points.map(([x, y]) => [x - centerX, y - centerY])
}

function pose(px, py, rz) {
    return {
        x: px,
        y: py,
        rotation: rz,
    }
}

function buildFigure(posesByKey) {
    return PIECE_KEYS.map((key) => ({
        key,
        ...posesByKey[key],
    }))
}

const FIGURE_21 = buildFigure({
    largeTriangleA: pose(-1.62, -0.38, Math.PI),
    largeTriangleB: pose(2.367, -0.38, Math.PI * 3 / 2),
    mediumTriangle: pose(1.374, -0.38, -0.785),
    smallTriangleA: pose(-0.12, 0.125, -1.567),
    smallTriangleB: pose(0.885, 0.125, -1.567),
    square: pose(0.379, -1.1, Math.PI * 0.25),
    parallelogram: pose(-0.12, -0.38, 0),
})

const FIGURE_96 = buildFigure({
    largeTriangleA: pose(-1.26, -0.28, Math.PI),
    largeTriangleB: pose(1.76, 0.726, Math.PI * 2),
    mediumTriangle: pose(0.735, -1.284, -Math.PI * 0.75),
    smallTriangleA: pose(0.265, 0.225, -1.567),
    smallTriangleB: pose(-0.76, 1.232, Math.PI * 1),
    square: pose(0.265, 1.232, 0),
    parallelogram: pose(0.256, -0.28, 0),
})

const FIGURE_159 = buildFigure({
    largeTriangleA: pose(-0.9234, -1.328, Math.PI * 0.25),
    largeTriangleB: pose(0.49, -2.764, Math.PI * 1.25),
    mediumTriangle: pose(-0.5, 0.68, Math.PI * 0.75),
    smallTriangleA: pose(0, 1.176, Math.PI * 1),
    smallTriangleB: pose(0, -0.823, Math.PI * 0.5),
    square: pose(0, 2.2, Math.PI),
    parallelogram: pose(0, -0.33, 0),
})

export function createTangramPieces() {
    return PIECE_KEYS.map((key, index) => {
        const baseShape = key.includes('Triangle')
            ? (key.includes('medium') ? BASE_SHAPES.mediumTriangle : BASE_SHAPES.smallTriangle)
            : (key === 'square' ? BASE_SHAPES.square : BASE_SHAPES.parallelogram)

        const shape = key.startsWith('large')
            ? BASE_SHAPES.largeTriangle
            : baseShape

        return {
            key,
            points: shape,
            fill: PIECE_PALETTE[index],
        }
    })
}

export function createTangramFigureCycle() {
    return [FIGURE_21, FIGURE_96, FIGURE_159]
}

function shortestAngleDelta(from, to) {
    let delta = to - from
    while (delta > Math.PI) delta -= Math.PI * 2
    while (delta < -Math.PI) delta += Math.PI * 2
    return delta
}

function blendPose(fromPose, toPose, alpha) {
    return {
        x: fromPose.x + (toPose.x - fromPose.x) * alpha,
        y: fromPose.y + (toPose.y - fromPose.y) * alpha,
        rotation: fromPose.rotation + shortestAngleDelta(fromPose.rotation, toPose.rotation) * alpha,
    }
}

export function getTangramFrame(
    elapsedTime,
    {
        holdDuration = 2,
        morphDuration = 1,
    } = {},
) {
    const figures = createTangramFigureCycle()
    if (!Array.isArray(figures) || figures.length === 0) {
        return []
    }

    const segmentDuration = holdDuration + morphDuration
    const safeElapsedTime = Number.isFinite(elapsedTime) ? Math.max(0, elapsedTime) : 0
    const segment = Math.floor(safeElapsedTime / segmentDuration) % figures.length
    const nextSegment = (segment + 1) % figures.length
    const segmentTime = safeElapsedTime % segmentDuration
    const isMorphing = segmentTime >= holdDuration

    const currentFigure = figures[segment]
    const nextFigure = figures[nextSegment]

    if (!Array.isArray(currentFigure) || !Array.isArray(nextFigure)) {
        return []
    }

    const morphAlpha = isMorphing
        ? smoothstep((segmentTime - holdDuration) / morphDuration)
        : 0

    return PIECE_KEYS.map((key) => {
        const fromPose = currentFigure.find((piece) => piece && piece.key === key)
        const toPose = nextFigure.find((piece) => piece && piece.key === key)

        if (!fromPose || !toPose) {
            return null
        }

        return {
            key,
            ...blendPose(fromPose, toPose, morphAlpha),
        }
    }).filter(Boolean)
}

function smoothstep(value) {
    const t = Math.min(Math.max(value, 0), 1)
    return t * t * (3 - 2 * t)
}

export function pointsToString(points) {
    return points.map(([x, y]) => `${x},${y}`).join(' ')
}

export function getFigureBounds() {
    return {
        minX: -2.8,
        minY: -2.8,
        width: 5.6,
        height: 5.6,
    }
}
