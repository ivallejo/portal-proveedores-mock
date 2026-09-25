$(document).ready(function () {
    console.log('inicializar datatable periodos');
    $('#tbPeriodos').DataTable({
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
});
function AgregarGestionarPeriodos() {

        $('#modalAgregarGestionarPeriodos').modal('hide');

        let idPeriodo = $('#idPeriodo').val();
        let idMinutoTolerancia = $('#idMinutoTolerancia').val(); 
        let idMinLimAntesEntrada = $('#idMinLimAntesEntrada').val();
        let idMinLimAntesSalida = $('#idMinLimAntesSalida').val();
        let idMinLimDesSalida = $('#idMinLimDesSalida').val();
        let idFactorTurnoM = $('#idFactorTurnoM').val();
        let idFactorTurnoT = $('#idFactorTurnoT').val(); 
        let idFactorTurnoN = $('#idFactorTurnoN').val(); 

        let gestionarPeriodo = {
            sPeriodo: idPeriodo,
            nMinToleranciaTardanza: idMinutoTolerancia,
            nMinLimAntesEntrada: idMinLimAntesEntrada,
            nMinLimAntesSalida: idMinLimAntesSalida,
            nMinLimDesSalida: idMinLimDesSalida,
            nFactorTurnoM: idFactorTurnoM,
            nFactorTurnoT: idFactorTurnoT,
            nFactorTurnoN: idFactorTurnoN
        };

        $.ajax({
            url: $('#inputRegistrarPeriodo').val(),
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(gestionarPeriodo),
            success: function (data1) {

                if (data1.success) {

                    Swal.fire({
                        title: "Registro Exitoso",
                        text: data1.mensaje,
                        icon: "success",
                        showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                        allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                        allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                        footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                        didRender: function () {
                            // Agregar evento de clic al botón de recarga
                            document.getElementById('reloadButton').addEventListener('click', function () {
                                location.reload(true); // Recarga la página
                            });
                        }
                    });

                } else {

                    Swal.fire({
                        title: "Error",
                        text: data1.mensaje,
                        icon: "error",
                        showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                        allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                        allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                        footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                        didRender: function () {
                            // Agregar evento de clic al botón de recarga
                            document.getElementById('reloadButton').addEventListener('click', function () {
                                location.reload(true); // Recarga la página
                            });
                        }
                    });


                }


            },
            error: function (error) {

                Swal.fire({
                    title: "Error",
                    text: error,
                    icon: "error"
                });
            }

        });

}

function VisualizarGestionarPeriodos(periodo) {

    let idPeriodo = periodo;
 
    var formData = new FormData();
    formData.append('periodo', idPeriodo);

    $.ajax({
        url: $('#inputListarPeriodoSemestre').val(),
        type: "POST",
        contentType: "application/json",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                console.log(data1);

                $('#idActualizarPeriodo').val(data1.data.sPeriodo);
                $('#idActualizarMinutoTolerancia').val(data1.data.nMinToleranciaTardanza);
                $('#idActualizarMinLimAntesEntrada').val(data1.data.nMinLimAntesEntrada);
                $('#idActualizarMinLimAntesSalida').val(data1.data.nMinLimAntesSalida);
                $('#idActualizarMinLimDesSalida').val(data1.data.nMinLimDesSalida);
                $('#idActualizarFactorTurnoM').val(data1.data.nFactorTurnoM);
                $('#idActualizarFactorTurnoT').val(data1.data.nFactorTurnoT);
                $('#idActualizarFactorTurnoN').val(data1.data.nFactorTurnoN);

                $('#modalActualizarGestionarPeriodos').modal('show');

            } else {

                Swal.fire({
                    title: "Error",
                    text: data1.mensaje,
                    icon: "error",
                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        // Agregar evento de clic al botón de recarga
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true); // Recarga la página
                        });
                    }
                });


            }


        },
        error: function (error) {

            Swal.fire({
                title: "Error",
                text: error,
                icon: "error"
            });
        }

    });

}

function ActualizarGestionarPeriodos() {

    $('#modalActualizarGestionarPeriodos').modal('hide');

    let idPeriodo = $('#idActualizarPeriodo').val();
    let idMinutoTolerancia = $('#idActualizarMinutoTolerancia').val();
    let idMinLimAntesEntrada = $('#idActualizarMinLimAntesEntrada').val();
    let idMinLimAntesSalida = $('#idActualizarMinLimAntesSalida').val();
    let idMinLimDesSalida = $('#idActualizarMinLimDesSalida').val();
    let idFactorTurnoM = $('#idActualizarFactorTurnoM').val();
    let idFactorTurnoT = $('#idActualizarFactorTurnoT').val();
    let idFactorTurnoN = $('#idActualizarFactorTurnoN').val();

    let gestionarPeriodo = {
        sPeriodo: idPeriodo,
        nMinToleranciaTardanza: idMinutoTolerancia,
        nMinLimAntesEntrada: idMinLimAntesEntrada,
        nMinLimAntesSalida: idMinLimAntesSalida,
        nMinLimDesSalida: idMinLimDesSalida,
        nFactorTurnoM: idFactorTurnoM,
        nFactorTurnoT: idFactorTurnoT,
        nFactorTurnoN: idFactorTurnoN
    };

    $.ajax({
        url: $('#inputActualizarPeriodo').val(),
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(gestionarPeriodo),
        success: function (data1) {

            if (data1.success) {

                Swal.fire({
                    title: "Registro Exitoso",
                    text: data1.mensaje,
                    icon: "success",
                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        // Agregar evento de clic al botón de recarga
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true); // Recarga la página
                        });
                    }
                });

            } else {

                Swal.fire({
                    title: "Error",
                    text: data1.mensaje,
                    icon: "error",
                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        // Agregar evento de clic al botón de recarga
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true); // Recarga la página
                        });
                    }
                });


            }


        },
        error: function (error) {

            Swal.fire({
                title: "Error",
                text: error,
                icon: "error"
            });
        }

    });

}
