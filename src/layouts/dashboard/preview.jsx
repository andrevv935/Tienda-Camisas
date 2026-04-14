import Card from '../../components/products/card.jsx'
import ejemplo from '../../assets/shirts/camino.png'

export default function Preview(){
    return(
        <div className='preview mt-4 bg-secondary-light w-full h-164 flex flex-row items-center justify-center gap-20 md:w-200 md:ml-6 rounded'>
            <div className='flex flex-col gap-4 items-center justify-center'>
                <p className='title text-4xl'>Titulo</p>
                <p className='subtitle text-2xl'>Subtitulo</p>
                <p className='paragraph text-xl'>Parrafo</p>

                <button className='paragraph bg-accent-light py-2 px-4 rounded'>Aplicar cambios</button>
            </div>
            <div>
                <Card title="Vista previa de la fuente" description="Esta es una vista previa de la fuente seleccionada. Asegúrese de que la fuente se vea bien antes de aplicarla a su sitio web." img={ejemplo} />
            </div>
        </div>
    )
}