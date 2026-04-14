import Text from './text.jsx'

function PageServices() {
    return (
        <>
            <div className='py-12 flex items-center justify-center w-full'>
                <Text txt={'Servicios'} />
            </div>
            <div className='flex flex-col md:flex-row justify-around items-center min-h-[15rem] py-10 px-4 gap-8'>
                <Text txt={'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque blanditiis iusto magni accusamus quos suscipit esse at, repellat autem voluptatibus?'} />
                <Text txt={'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque blanditiis iusto magni accusamus quos suscipit esse at, repellat autem voluptatibus?'} />
                <Text txt={'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque blanditiis iusto magni accusamus quos suscipit esse at, repellat autem voluptatibus?'} />
            </div>
        </>
    )
}

export default PageServices

