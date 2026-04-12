import { useState } from 'react'
import { createProductRequest } from '../backend/services/products/productApiClient.js'

export function useCreateProduct() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    async function submitProduct(formData) {
        setIsSubmitting(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const created = await createProductRequest(formData)
            setSuccessMessage(`Producto "${created.name}" creado exitosamente.`)
            return created
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo crear el producto.')
            return null
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        isSubmitting,
        errorMessage,
        successMessage,
        submitProduct
    }
}
