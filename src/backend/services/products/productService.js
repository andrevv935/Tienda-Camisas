import sql from '../../database/db.js'

export async function createProduct({
    name,
    description,
    price,
    selectedColors,
    stock,
    imageUrl
}) {
    const [created] = await sql`
        INSERT INTO products (
            name,
            description,
            price,
            selected_colors,
            stock_xs,
            stock_s,
            stock_m,
            stock_l,
            stock_xl,
            stock_xxl,
            image_url
        )
        VALUES (
            ${name},
            ${description || null},
            ${price},
            ${sql.json(selectedColors)},
            ${stock.xs},
            ${stock.s},
            ${stock.m},
            ${stock.l},
            ${stock.xl},
            ${stock.xxl},
            ${imageUrl || null}
        )
        RETURNING
            id,
            name,
            description,
            price,
            selected_colors,
            stock_xs,
            stock_s,
            stock_m,
            stock_l,
            stock_xl,
            stock_xxl,
            image_url,
            created_at
    `

    return created
}

export async function listProducts() {
    return sql`
        SELECT
            id,
            name,
            description,
            price,
            selected_colors,
            stock_xs,
            stock_s,
            stock_m,
            stock_l,
            stock_xl,
            stock_xxl,
            image_url,
            created_at
        FROM products
        WHERE is_visible = TRUE
        ORDER BY created_at DESC
    `
}
