import React from 'react'
import Card from "./card"
import shirtCorazon from "../assets/shirts/corazon.png"
import shirtLuna from '../assets/shirts/ad-astra-per-aspera.png'
import shirtKintsugi from '../assets/shirts/kintsugi.png'

const CardContainers = () => {

    const products = [
            {
                id: 1,
                title: 'Fuí, soy, seré',
                description: 'Para los que quieren una vida de disciplina, metas y exito',
                img: shirtCorazon
            },
            {
                id: 2,
                title: 'Ad astra per aspera',
                description: 'Para los que siguen en pie a pesar de las dificultades',
                img: shirtLuna
            },
            {
                id: 3,
                title: 'Kintsugi',
                description: 'Tus errores del pasado formaron a la persona que eres hoy, lo que aprendes de esos errores te hacen hermoso',
                img: shirtKintsugi
            }
        ]

  return (
    <section className="flex flex-wrap gap-4 place-content-around mt-8">
        {
            products.map(product =>{
                return(
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