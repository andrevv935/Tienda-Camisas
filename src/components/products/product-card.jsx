import ShirtView from '../components/shirt'
import orangeShirt from '../assets/orange-shirt.png'
import Text from '../text'

function productCard(className=''){
    return (
        <div className={`product-div flex flex-col items-center bg-default-primary`}>
            <ShirtView className={``} src={orangeShirt} alt='shirt' />
            <div className='product-info flex flex-col items-center bg-slate-100 rounded'>
                <Text txt='Franela Naranja' />
                <Text txt='Franela de tela Naranja importada desde japon' />
                <div className='flex flex-row items-center my-4'>
                    <Text className='price' txt='$39.99' />
                    <button className={`bg-default-accent p-4 rounded`}>Add to cart</button>
                </div>
            </div>
        </div>
    )
}

export default productCard