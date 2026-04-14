import React from 'react'
import Card from "./card.jsx"

const CardContainers = ({ items = [], className = '' }) => {

    return (
        <section className={`flex flex-wrap gap-4 place-content-around my-12 p-4 ${className}`.trim()}>
            {
                items.map(product => {
                    return (
                        <Card key={product.id}
                            {...product}
                        />
                    )
                })
            }
        </section>
    )
}

export default CardContainers