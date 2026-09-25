function evaluateSession(){
    $.ajaxSetup({
        error: function (xhr) {
            if (xhr.status === 401 || xhr.status === 403) { //Unauthorized or Forbidden
                // Si recibimos un 401 (sesión expirada o no autenticado), redirigir al login
                DestroySession();
                window.location.href = '/Auth/Login';
            } else {
                console.error("Error en la petición AJAX:", xhr.status, xhr.responseText);
            }
        }
    });
}
function DestroySession() {
    ////destruyo la sesion
    console.log("Destruyendo la sesion...")
}


evaluateSession();