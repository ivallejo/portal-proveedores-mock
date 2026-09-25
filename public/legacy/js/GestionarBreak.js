$(document).ready(function () {
    console.log('inicializar datatable periodos');
    $('#tbRegistroBreak').DataTable({
        responsive: true, // Activa el modo responsivo
        paging: true,
        searching: true,
        ordering: true,
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
            searchPlaceholder: "Buscar"
        },
        "initComplete": function (settings, json) {
            // Cambiar el texto de "Buscar:" en el label
            $('.dataTables_filter label').contents().filter(function () {
                return this.nodeType === 3;  // Filtra los nodos de texto
            }).first().replaceWith('');  // Reemplaza con el nuevo texto
        },
    });

    $('#modalAgregarBreak').on('hidden.bs.modal', function () {
        // Limpiar selects y disparar change para que se ejecuten las cadenas dependientes
        $('#idAcademicYear').val('').trigger('change');
        $('#idCondicional').val('');

        // Limpiar inputs de texto
        $('#idMinutoProgramado').val('');
        $('#idDescuentoMinuto').val('');
    });

    $(document).on('change', '.cambiarEstadoRegistroBreak', function () {
        const id = $(this).data('id');
        const estado = $(this).is(':checked');

        $.ajax({
            url: $('#inputActualizarEstadoRegistroBreak').val(),
            type: 'POST',
            data: { idRegistroBreak: id, estado: estado },
            success: function (res) {
                if (res.success) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: res.mensaje,
                        showConfirmButton: false,
                        timer: 2000
                    });
                    // Refrescar solo texto del switch sin recargar toda la tabla
                    const span = $(`.cambiarEstadoRegistroBreak[data-id="${id}"]`).next('span');
                    span.text(estado ? 'Activo' : 'Inactivo')
                        .removeClass('text-success text-danger')
                        .addClass(estado ? 'text-success' : 'text-danger');
                } else {
                    Swal.fire("Error", res.mensaje, "error");
                }
            },
            error: function () {
                Swal.fire("Error", "No se pudo actualizar el estado", "error");
            }
        });
    });


});

// Cargar AÑOS al iniciar
$.get($('#inputObtenerAniosSesiones').val(), function (res) {
    if (res.success) {
        let $anio = $('#idAcademicYear');
        $anio.empty().append('<option value="">-- Seleccionar --</option>');
        res.data.forEach(item => {
            $anio.append(`<option value="${item.sanio}">${item.sanio}</option>`);
        });
    } else {
        Swal.fire("Error", res.message, "error");
    }
});

// Cuando cambia el AÑO → cargar TÉRMINOS
$('#idAcademicYear').change(function () {
    let anio = $(this).val();

    $('#idAcademicTerm').empty().append('<option value="">-- Seleccionar --</option>');
    $('#idAcademicSession').empty().append('<option value="">-- Seleccionar --</option>');

    if (anio) {
        $.get($('#inputObtenerSemestresPorAnio').val(), { sanio: anio }, function (res) {
            if (res.success) {
                let $term = $('#idAcademicTerm');
                res.data.forEach(item => {
                    $term.append(`<option value="${item.ssemestre}">${item.ssemestre}</option>`);
                });
            } else {
                Swal.fire("Error", res.message, "error");
            }
        });
    }
});

// Cuando cambia el TÉRMINO → cargar SESIONES
$('#idAcademicTerm').change(function () {
    let anio = $('#idAcademicYear').val();
    let semestre = $(this).val();

    $('#idAcademicSession').empty().append('<option value="">-- Seleccionar --</option>');

    if (anio && semestre) {
        $.get($('#inputObtenerTurnosPorAnioYSemestre').val(), {
            sanio: anio,
            ssemestre: semestre
        }, function (res) {
            if (res.success) {
                let $turno = $('#idAcademicSession');
                res.data.forEach(item => {
                    $turno.append(`<option value="${item.sturno}">${item.sturno}</option>`);
                });
            } else {
                Swal.fire("Error", res.message, "error");
            }
        });
    }
});


function AgregarRegistroBreak() {
    $('#modalAgregarBreak').modal('hide');

    let academicYear = $('#idAcademicYear').val();
    let academicTerm = $('#idAcademicTerm').val();
    let academicSession = $('#idAcademicSession').val();
    let condicional = $('#idCondicional').val();
    let minutoProgramado = $('#idMinutoProgramado').val();
    let descuentoMinuto = $('#idDescuentoMinuto').val();

    let entidad = {
        academicYear,
        academicTerm,
        academicSession,
        condicional,
        minutoProgramado,
        descuentoMinuto
    };

    $.ajax({
        url: $('#inputRegistrarRegistroBreak').val(),
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(entidad),
        success: function (res) {
            if (res.success) {
                Swal.fire({
                    title: "Registro exitoso",
                    text: res.mensaje,
                    icon: "success",
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true);
                        });
                    }
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: res.mensaje,
                    icon: "error",
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true);
                        });
                    }
                });
            }
        },
        error: function (err) {
            Swal.fire("Error", err.statusText || "Ocurrió un error inesperado", "error");
        }
    });
}

function ActualizarRegistroBreak() {
    $('#modalActualizarBreak').modal('hide');

    let entidad = {
        idRegistroBreak: $('#idActualizarBreakId').val(),
        academicYear: $('#idActualizarAcademicYear').val(),
        academicTerm: $('#idActualizarAcademicTerm').val(),
        academicSession: $('#idActualizarAcademicSession').val(),
        condicional: $('#idActualizarCondicional').val(),
        minutoProgramado: $('#idActualizarMinutoProgramado').val(),
        descuentoMinuto: $('#idActualizarDescuentoMinuto').val(),
    };

    $.ajax({
        url: $('#inputActualizarBreak').val(),
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(entidad),
        success: function (res) {
            if (res.success) {
                Swal.fire({
                    title: "Actualización exitosa",
                    text: res.mensaje,
                    icon: "success",
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true);
                        });
                    }
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: res.mensaje,
                    icon: "error",
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true);
                        });
                    }
                });
            }
        },
        error: function (err) {
            Swal.fire("Error", err.statusText || "Ocurrió un error inesperado", "error");
        }
    });
}

async function EditarBreak(id) {
    try {
        const res = await $.get($('#inputListarBreak').val(), { id });

        if (!res.success) {
            Swal.fire("Error", res.mensaje, "error");
            return;
        }

        const data = res.data;

        // Asignar ID oculto
        $('#idActualizarBreakId').val(data.idRegistroBreak);
        await cargarAniosActualizarAsync();
        // Establecer año académico
        $('#idActualizarAcademicYear').val(data.academicYear);

        // Esperar carga de términos y luego setear
        await cargarTerminosActualizarAsync(data.academicYear);
        $('#idActualizarAcademicTerm').val(data.academicTerm);

        // Esperar carga de sesiones y luego setear
        await cargarSesionesActualizarAsync(data.academicYear, data.academicTerm);
        $('#idActualizarAcademicSession').val(data.academicSession);

        // Resto de campos
        $('#idActualizarCondicional').val(data.condicional);
        $('#idActualizarMinutoProgramado').val(data.minutoProgramado);
        $('#idActualizarDescuentoMinuto').val(data.descuentoMinuto);

        $('#modalActualizarBreak').modal('show');
    } catch (err) {
        Swal.fire("Error", err.statusText || "Error inesperado", "error");
    }
}

function cargarAniosActualizarAsync() {
    const url = $('#inputObtenerAniosSesiones').val();
    return new Promise((resolve, reject) => {
        $.get(url, function (res) {
            const $anio = $(`#idActualizarAcademicYear`);
            $anio.empty().append('<option value="">-- Seleccionar --</option>');

            if (res.success) {
                res.data.forEach(item => {
                    $anio.append(`<option value="${item.sanio}">${item.sanio}</option>`);
                });
                resolve();
            } else {
                reject(res.message);
            }
        });
    });
}


function cargarTerminosActualizarAsync(anio) {
    const url = $('#inputObtenerSemestresPorAnio').val();
    return new Promise((resolve, reject) => {
        $.get(url, { sanio: anio }, function (res) {
            const $term = $('#idActualizarAcademicTerm');
            $term.empty().append('<option value="">-- Seleccionar --</option>');

            if (res.success) {
                res.data.forEach(item => {
                    $term.append(`<option value="${item.ssemestre}">${item.ssemestre}</option>`);
                });
                resolve();
            } else {
                reject(res.message);
            }
        });
    });
}


function cargarSesionesActualizarAsync(anio, semestre) {
    const url = $('#inputObtenerTurnosPorAnioYSemestre').val();
    return new Promise((resolve, reject) => {
        $.get(url, { sanio: anio, ssemestre: semestre }, function (res) {
            const $session = $('#idActualizarAcademicSession');
            $session.empty().append('<option value="">-- Seleccionar --</option>');

            if (res.success) {
                res.data.forEach(item => {
                    $session.append(`<option value="${item.sturno}">${item.sturno}</option>`);
                });
                resolve();
            } else {
                reject(res.message);
            }
        });
    });
}
