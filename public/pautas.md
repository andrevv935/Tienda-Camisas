# Sistema de servicio web de una tienda de ropa

# 1. Idea principal
Una tienda de franelas web

# 2. Requisitos de la primera evaluacion
**Vistas principales**
- `Vista de administrador`
- `Vista de usuario`

**Vistas secundarias**
- `Vista de login`
- `Vista de registro`
*PUEDE HACERSE AMBAS FUNCIONES EN UNA SOLA VISTA, NO NECESARIAMENTE DEBEN SER 2 DIFERENTES*

**Funciones de la vista de administrador**
- `Cambiar Estilo de tipografia (letra)`: Poder importar diferentes tipos de letra (Times New Roman, Arial, etc...) para poder utilizarlos en la pagina. *Opcional*: Poder seleccionar 2 tipos de letras, uno para los titulos y otro para los demas textos de la pagina, o elegir uno general para todo el sistema.
- `Cambiar Tamaño de tipografia`: Cambiar el tamaño de las letras de los titulos, parrafos o botones, de manera independiente.
- `Cambiar color general de la pagina`: Seleccion de 5 colores diferentes para definir el color de los elementos de la pagina. Debe tener la opcion de crear una paleta de color nueva y de borrar o editar una paleta de color ya existente.
- `Seleccion de paletas`: Se deben elegir 3 paletas. La primera para el diseño habitual de la pagina, la segunda para el modo oscuro y la tercera para el modo daltonico.
- `Mostrar vistas previas del cambio realizado a la tipografia y a la paleta de colores`: Colocar ejemplos de etiquetas para mostrar como se verian los cambios en la pagina principal (La vista del usuario).

**Funciones de la vista de usuario**
- `Header`
- `Banner`
- `Carrusel`
- `Servicios`
- `Footer`
*LOS CAMBIOS REALIZADOS POR EL ADMINISTRADOR DEBEN VERSE REFLEJADOS EN LA VISTA DEL USUARIO*

# 3. Arquitectura
**Frontend** `React` con estilos de `TailwindCSS`
**Backend** `Django` para conectar la base de datos
**Base de datos** `SQL`

# 4. Recordatorios
*Acomodar la logica del componente shirt, product-layout y carousel*