import { useState } from "react";
// Importar las fotos de las bases de datos y asignarle los id's

export function photo_amount(total_photos, displaying_amount){
    const carousel = document.querySelector('.carousel');
    for (let i = 0; i < total_photos; i++){
        const new_photo = document.createElement('img');
        if (i < displaying_amount){
            new_photo.className('shirt h-40 w-40 m-10');
        }
        new_photo.className('shirt hidden h-40 w-40 m-10');
        // new_photo.src();
        // new_photo.alt();
        carousel.append(new_photo);
    }
}

function cicle_carousel(){
    
}