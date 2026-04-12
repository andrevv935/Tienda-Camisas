import Text from './text.jsx'

function PageServices(){
    return(
        <>
        <div className='max-h-16 flex items-center justify-center h-screen'>
            <Text txt={'Servicios'}/>
        </div>
        <div className='flex justify-around items-center h-60 p-4'>
            <Text txt={'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque blanditiis iusto magni accusamus quos suscipit esse at, repellat autem voluptatibus?'} />
            <Text txt={'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque blanditiis iusto magni accusamus quos suscipit esse at, repellat autem voluptatibus?'} />
            <Text txt={'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque blanditiis iusto magni accusamus quos suscipit esse at, repellat autem voluptatibus?'} />
        </div>
        </>
    )
}

export default PageServices

