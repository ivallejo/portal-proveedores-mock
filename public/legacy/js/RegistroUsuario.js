

function actualizarUsuarios(contador) {


    let Id = $(`input[name="ListMenuOptions[${contador}].Id"]`).val();
    let people_id = $(`input[name="ListMenuOptions[${contador}].people_id"]`).val();
    let roles = $(`select[name="ListMenuOptions[${contador}].roles"]`).val();
    let estado = $(`input[name="ListMenuOptions[${contador}].estado"]`).is(":checked") ? true : false;
    

    var formData = new FormData();
    formData.append('Id', Id);
    formData.append('people_id', people_id);
    formData.append('roles', roles);
    formData.append('estado', estado);

    console.log(roles);

    $.ajax({
        url: $('#inputActualizarRegistroUsuario').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success == true) {

                Swal.fire({
                    title: data1.mensaje,
                    text: "",
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.value) {
                        location.reload(true);

                    }
                });



            } else {

                

            }

        },
        error: function (error) {

        }
    });

}

function registrarUsuario() {

    let people_id = $('#usuarioAgregar').val();
    let rol = $('#RolAgregar').val();
   

    var formData = new FormData();
    formData.append('people_id', people_id);
    formData.append('rol', rol);
    

    $.ajax({
        url: $('#inputRegistrarUsuario').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success == true) {

                Swal.fire({
                    title: data1.mensaje,
                    text: "",
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.value) {
                        location.reload(true);

                    }
                });



            } else {



            }

        },
        error: function (error) {

        }
    });

}