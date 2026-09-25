
function alerta(icon, title, text) {
    Swal.fire({
        icon: icon, //success, error, warning, info, question
        title: title,
        text: text,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
    });
    return;
}

function alerta_center(icon, title, text) {
    Swal.fire({
        icon: icon, //success, error, warning, info, question
        title: title,
        text: text,
        toast: false,
        position: 'center',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
    });
    return;
}

function alerta_center_sin_timer(icon, title, text) {
    Swal.fire({
        icon: icon, //success, error, warning, info, question
        title: title,
        html: text, // usa html en vez de text
        toast: false,
        position: 'center',
        showConfirmButton: true,
    });
    return;
}

function info_alert(icon, header, text) {
    Swal.fire({
        icon: icon, //success, error, warning, info, question
        title: header,
        html: text,
        showConfirmButton: false,
    });
    return;
}

function ok_alert(icon, header, text) {
    Swal.fire({
        icon: icon, //success, error, warning, info, question
        title: header,
        html: text,
        showConfirmButton: true,
    });
    return;
}

function api_result_alert(icon,title,content) {
    Swal.fire({
        icon: icon,
        title: title,
        html: content,
        toast: false,
        position: 'center',
        showConfirmButton: false,
        timerProgressBar: true,
        showConfirmButton: true
    });
    return;
}

function commmitChanges(title,text,confirm_function,decline_function = null) {
    
    Swal.fire({
        icon: "question",
        title: title,
        text:text,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Confirmar",
        denyButtonText: `Cancelar`
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            confirm_function();

        } else if (result.isDenied) {
           
            if (decline_function) {
                decline_function();
            } else {
                console.log("No se realizó ninguna acción.");
            }
        }
    });
}



///auxiliares no swals
function api_result_alert_m(icon, title, contentpc,contentmobile) {
    // Configura el contenido del modal
    //document.getElementById('modalIcon').innerHTML = getIconHtml(icon);
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('pc_sf').innerHTML = contentpc;
    document.getElementById('mb_sf').innerHTML = contentmobile;

    // Muestra el modal
    $('#customModal').modal("show")

}

// Función para cerrar el modal
function closeModal() {
    $('#customModal').modal("hide")
}
