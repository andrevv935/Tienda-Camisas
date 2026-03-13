import sql from '../../database/db.js'

export async function listFonts() {
    return sql`
        SELECT
            id,
            family_name,
            file_url,
            is_active_title,
            is_active_subtitle,
            is_active_paragraph,
            title_size_px,
            subtitle_size_px,
            paragraph_size_px
        FROM fonts
        WHERE is_visible = TRUE
        ORDER BY created_at DESC
    `
}

export async function createFont({ familyName, fileUrl = null }) {
    const [created] = await sql`
        INSERT INTO fonts (family_name, file_url)
        VALUES (${familyName}, ${fileUrl})
        RETURNING
            id,
            family_name,
            file_url,
            is_active_title,
            is_active_subtitle,
            is_active_paragraph,
            title_size_px,
            subtitle_size_px,
            paragraph_size_px
    `

    return created
}

export async function updateFont({ id, familyName, fileUrl, titleSizePx, subtitleSizePx, paragraphSizePx }) {
    const nextFamilyName = familyName ?? null
    const nextFileUrl = fileUrl ?? null
    const nextTitleSizePx = titleSizePx ?? null
    const nextSubtitleSizePx = subtitleSizePx ?? null
    const nextParagraphSizePx = paragraphSizePx ?? null

    const [updated] = await sql`
        UPDATE fonts
        SET
            family_name = COALESCE(${nextFamilyName}, family_name),
            file_url = COALESCE(${nextFileUrl}, file_url),
            title_size_px = COALESCE(${nextTitleSizePx}, title_size_px),
            subtitle_size_px = COALESCE(${nextSubtitleSizePx}, subtitle_size_px),
            paragraph_size_px = COALESCE(${nextParagraphSizePx}, paragraph_size_px),
            updated_at = NOW()
        WHERE id = ${id} AND is_visible = TRUE
        RETURNING
            id,
            family_name,
            file_url,
            is_active_title,
            is_active_subtitle,
            is_active_paragraph,
            title_size_px,
            subtitle_size_px,
            paragraph_size_px
    `

    return updated || null
}

export async function setFontActiveSection({ id, section }) {
    const sectionColumnMap = {
        title: 'is_active_title',
        subtitle: 'is_active_subtitle',
        paragraph: 'is_active_paragraph'
    }

    const targetColumn = sectionColumnMap[section]
    if (!targetColumn) {
        throw new Error('Invalid font section')
    }

    await sql.begin(async (tx) => {
        await tx.unsafe(`UPDATE fonts SET ${targetColumn} = FALSE, updated_at = NOW() WHERE is_visible = TRUE`)
        await tx.unsafe(`UPDATE fonts SET ${targetColumn} = TRUE, updated_at = NOW() WHERE id = $1 AND is_visible = TRUE`, [id])
    })

    const [updated] = await sql`
        SELECT
            id,
            family_name,
            file_url,
            is_active_title,
            is_active_subtitle,
            is_active_paragraph,
            title_size_px,
            subtitle_size_px,
            paragraph_size_px
        FROM fonts
        WHERE id = ${id} AND is_visible = TRUE
    `

    return updated || null
}

export async function hideFont(id) {
    const [updated] = await sql`
        UPDATE fonts
        SET
            is_visible = FALSE,
            is_active_title = FALSE,
            is_active_subtitle = FALSE,
            is_active_paragraph = FALSE,
            updated_at = NOW()
        WHERE id = ${id} AND is_visible = TRUE
        RETURNING id
    `

    return Boolean(updated)
}
