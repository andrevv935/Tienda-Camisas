import sql from '../../database/db.js'

export async function listPalettes() {
    return sql`
        SELECT id, name, colors, is_default_active, is_dark_active, is_colorblind_active
        FROM palettes
        WHERE is_visible = TRUE
        ORDER BY created_at DESC
    `
}

export async function createPalette({ name, colors }) {
    const [created] = await sql`
        INSERT INTO palettes (name, colors)
        VALUES (${name}, ${sql.json(colors)})
        RETURNING id, name, colors, is_default_active, is_dark_active, is_colorblind_active
    `

    return created
}

export async function updatePalette({ id, name, colors }) {
    const nextName = name ?? null
    const nextColors = colors ? sql.json(colors) : null

    const [updated] = await sql`
        UPDATE palettes
        SET
            name = COALESCE(${nextName}, name),
            colors = COALESCE(${nextColors}, colors),
            updated_at = NOW()
        WHERE id = ${id} AND is_visible = TRUE
        RETURNING id, name, colors, is_default_active, is_dark_active, is_colorblind_active
    `

    return updated || null
}

export async function setPaletteMode({ id, mode }) {
    const modeColumnMap = {
        default: 'is_default_active',
        dark: 'is_dark_active',
        colorblind: 'is_colorblind_active'
    }

    const targetColumn = modeColumnMap[mode]
    if (!targetColumn) {
        throw new Error('Invalid palette mode')
    }

    await sql.begin(async (tx) => {
        await tx.unsafe(`UPDATE palettes SET ${targetColumn} = FALSE, updated_at = NOW() WHERE is_visible = TRUE`)
        await tx.unsafe(`UPDATE palettes SET ${targetColumn} = TRUE, updated_at = NOW() WHERE id = $1 AND is_visible = TRUE`, [id])
    })

    const [updated] = await sql`
        SELECT id, name, colors, is_default_active, is_dark_active, is_colorblind_active
        FROM palettes
        WHERE id = ${id} AND is_visible = TRUE
    `

    return updated || null
}

export async function hidePalette(id) {
    const [updated] = await sql`
        UPDATE palettes
        SET
            is_visible = FALSE,
            is_default_active = FALSE,
            is_dark_active = FALSE,
            is_colorblind_active = FALSE,
            updated_at = NOW()
        WHERE id = ${id} AND is_visible = TRUE
        RETURNING id
    `

    return Boolean(updated)
}
