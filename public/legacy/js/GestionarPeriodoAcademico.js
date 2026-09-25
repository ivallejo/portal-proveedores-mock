$(document).ready(function () {
    console.log('inicializar datatable periodos');
    $('#tbPeriodoAcademico').DataTable({
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

    $('#modalAgregarPeriodoAcademico').on('hidden.bs.modal', function () {
        // Limpiar todos los selects del modal
        $('#idOrganizacion').val('');
        limpiarSelects();
        $('#grupoSesionAnterior').hide();
        $('#grupoSesionActual').hide();
    });


    $('#grupoSesionAnterior').hide();
    $('#grupoSesionActual').hide();

    // === INTEGRACIÓN DE SELECTS CON DATOS Y PERIODO ANTERIOR ===
    $('#idOrganizacion').on('change', function () {
        limpiarSelects();
        const org = $(this).val();

        // Mostrar u ocultar los campos de Sesión según sea ESC
        const mostrarSesion = org === 'ESC';
        $('#grupoSesionAnterior').toggle(mostrarSesion);
        $('#grupoSesionActual').toggle(mostrarSesion);

        if (!mostrarSesion) {
            $('#idPreviousAcademicSession').val('');
            $('#idAcademicSession').val('');
        }

        if (!org) return;

        $.get($('#inputObtenerDatosPeriodo').val(), { sidprograma: org })
            .done(res => {
                if (res.success) llenarSelect('#idAcademicYear', res.data);
            });
    });

    $('#idAcademicYear').on('change', function () {
        limpiarSelects(['#idAcademicTerm', '#idAcademicSession']);
        const org = $('#idOrganizacion').val();
        const anio = $(this).val();
        if (!org || !anio) return;

        $.get($('#inputObtenerDatosPeriodo').val(), { sidprograma: org, sanio: anio })
            .done(res => {
                if (res.success) llenarSelect('#idAcademicTerm', res.data);
            });
    });

    $('#idAcademicTerm').on('change', function () {
        limpiarSelects(['#idAcademicSession']);
        const org = $('#idOrganizacion').val();
        const anio = $('#idAcademicYear').val();
        const semestre = $(this).val();
        if (!org || !anio || !semestre) return;

        $.get($('#inputObtenerDatosPeriodo').val(), { sidprograma: org, sanio: anio, ssemestre: semestre })
            .done(res => {
                if (res.success) llenarSelect('#idAcademicSession', res.data);
            });

        // Solo si NO es ESC, consultar periodo anterior directamente al elegir semestre
        if (org !== 'ESC') {
            obtenerPeriodoAnterior(org, anio, semestre, '');
        }
    });

    $('#idAcademicSession').on('change', function () {
        const org = $('#idOrganizacion').val();
        const anio = $('#idAcademicYear').val();
        const semestre = $('#idAcademicTerm').val();
        const turno = $(this).val();
        if (org === 'ESC' && anio && semestre && turno) {
            obtenerPeriodoAnterior(org, anio, semestre, turno);
        }
    });

    // Cuando cambia el año académico en editar
    $('#idAcademicYearEdit').on('change', function () {
        limpiarSelects(['#idAcademicTermEdit', '#idAcademicSessionEdit']);
        const org = $('#idOrganizacionEdit').val();
        const anio = $(this).val();
        if (!org || !anio) return;

        $.get($('#inputObtenerDatosPeriodo').val(), { sidprograma: org, sanio: anio })
            .done(res => {
                if (res.success) llenarSelect('#idAcademicTermEdit', res.data);
            });
    });

    // Cuando cambia el término académico en editar
    $('#idAcademicTermEdit').on('change', function () {
        limpiarSelects(['#idAcademicSessionEdit']);
        const org = $('#idOrganizacionEdit').val();
        const anio = $('#idAcademicYearEdit').val();
        const semestre = $(this).val();
        if (!org || !anio || !semestre) return;

        $.get($('#inputObtenerDatosPeriodo').val(), { sidprograma: org, sanio: anio, ssemestre: semestre })
            .done(res => {
                if (res.success) llenarSelect('#idAcademicSessionEdit', res.data);
            });

        // Si NO es ESC, obtener automáticamente el periodo anterior
        if (org !== 'ESC') {
            obtenerPeriodoAnterior(org, anio, semestre, '', 'Edit');
        }
    });


    $('#idAcademicSessionEdit').on('change', function () {
        const org = $('#idOrganizacionEdit').val();
        const anio = $('#idAcademicYearEdit').val();
        const semestre = $('#idAcademicTermEdit').val();
        const turno = $(this).val();

        if (org === 'ESC' && anio && semestre && turno) {
            obtenerPeriodoAnterior(org, anio, semestre, turno, "Edit");
        }
    });

    function obtenerPeriodoAnterior(org, anio, semestre, turno, prefijo = "") {
        $("#global-loader").css("display", "revert");

        $.get($('#inputObtenerPeriodoAnterior').val(), {
            sidprograma: org,
            sanio: anio,
            ssemestre: semestre,
            sturno: turno
        }).done(res => {
            if (!res.success || res.data.length === 0) {
                $(`#idPreviousAcademicYear${prefijo}`).html('<option value="">-- Seleccionar --</option>');
                $(`#idPreviousAcademicTerm${prefijo}`).html('<option value="">-- Seleccionar --</option>');
                $(`#idPreviousAcademicSession${prefijo}`).html('<option value="">-- Seleccionar --</option>');
                return;
            }

            const anterior = res.data;

            $(`#idPreviousAcademicYear${prefijo}`).html(`<option value="${anterior[0].anteriorSanio}">${anterior[0].anteriorSanio}</option>`);
            $(`#idPreviousAcademicTerm${prefijo}`).html(`<option value="${anterior[0].anteriorSemestre}">${anterior[0].anteriorSemestre}</option>`);

            const sessionSelect = $(`#idPreviousAcademicSession${prefijo}`);
            sessionSelect.empty().append('<option value="">-- Seleccionar --</option>');
            anterior.forEach(item => {
                sessionSelect.append(`<option value="${item.anteriorTurno}">${item.anteriorTurno}</option>`);
            });

            if (anterior.length === 1) {
                sessionSelect.val(anterior[0].anteriorTurno);
            }
        }).always(() => {
            $("#global-loader").css("display", "none");
        });
    }

});


function AgregarPeriodoAcademico() {
    const data = {
        Organizacion: $('#idOrganizacion').val(),
        AcademicYear: $('#idAcademicYear').val(),
        AcademicTerm: $('#idAcademicTerm').val(),
        AcademicSession: $('#idAcademicSession').val(),
        PreviousAcademicYear: $('#idPreviousAcademicYear').val(),
        PreviousAcademicTerm: $('#idPreviousAcademicTerm').val(),
        PreviousAcademicSession: $('#idPreviousAcademicSession').val(),
    };

    // Validación básica
    if (!data.Organizacion || !data.AcademicYear || !data.AcademicTerm) {
        Swal.fire("Advertencia", "Complete los campos obligatorios del periodo actual.", "warning");
        return;
    }
    if (!data.PreviousAcademicYear || !data.PreviousAcademicTerm) {
        Swal.fire("Advertencia", "Complete los campos del periodo anterior.", "warning");
        return;
    }

    // Validar sesión solo si la organización es ESC
    if (data.Organizacion === "ESC") {
        if (!data.AcademicSession || !data.PreviousAcademicSession) {
            Swal.fire("Advertencia", "Debe completar las sesiones para Global Learning (ESC).", "warning");
            return;
        }
    }


    $("#global-loader").css("display", "revert");

    $.post($('#inputInsertarPeriodoAcademico').val(), data)
        .done(res => {
            if (res.success) {
                Swal.fire("Éxito", res.mensaje, "success").then(() => {
                    location.reload(); // Recargar la vista para ver el nuevo registro
                });
            } else {
                Swal.fire("Error", res.mensaje, "error");
            }
        })
        .fail(() => {
            Swal.fire("Error", "Ocurrió un error al intentar guardar.", "error");
        })
        .always(() => {
            $("#global-loader").css("display", "none");
        });
}

function EditarPeriodo(id) {
    $.get($('#inputListarPeriodoAcademicoPorId').val(), { id })
        .done(res => {
            if (res.success) {
                const d = res.data;
                $('#idPeriodoAcademicoEdit').val(d.idPeriodoAcademico);
                // Setear valores
                $('#idOrganizacionEdit').val(d.organizacion).prop('disabled', true);

                // Cargar Año académico
                $.get($('#inputObtenerDatosPeriodo').val(), { sidprograma: d.organizacion })
                    .done(resA => {
                        if (resA.success) {
                            llenarSelect('#idAcademicYearEdit', resA.data, d.academicYear);

                            // Cargar Termino
                            $.get($('#inputObtenerDatosPeriodo').val(), { sidprograma: d.organizacion, sanio: d.academicYear })
                                .done(resT => {
                                    if (resT.success) {
                                        llenarSelect('#idAcademicTermEdit', resT.data, d.academicTerm);

                                        // Cargar Sesión (si ESC)
                                        if (d.organizacion === 'ESC') {
                                            $('#grupoSesionActualEdit').show();
                                            $.get($('#inputObtenerDatosPeriodo').val(), {
                                                sidprograma: d.organizacion,
                                                sanio: d.academicYear,
                                                ssemestre: d.academicTerm
                                            }).done(resS => {
                                                if (resS.success) {
                                                    llenarSelect('#idAcademicSessionEdit', resS.data, d.academicSession);
                                                }
                                            });
                                        } else {
                                            $('#grupoSesionActualEdit').hide();
                                        }
                                    }
                                });
                        }
                    });

                // Setear periodo anterior
                $('#idPreviousAcademicYearEdit').html(`<option value="${d.previousAcademicYear}">${d.previousAcademicYear}</option>`);
                $('#idPreviousAcademicTermEdit').html(`<option value="${d.previousAcademicTerm}">${d.previousAcademicTerm}</option>`);
                $('#idPreviousAcademicSessionEdit').html(`<option value="${d.previousAcademicSession}">${d.previousAcademicSession}</option>`);

                if (d.organizacion === 'ESC') {
                    $('#grupoSesionAnteriorEdit').show();
                } else {
                    $('#grupoSesionAnteriorEdit').hide();
                }

                // Abrir el modal
                $('#modalEditarPeriodoAcademico').modal('show');
            } else {
                Swal.fire("Error", res.mensaje, "error");
            }
        });
}

function GuardarEdicionPeriodoAcademico() {
    const data = {
        IdPeriodoAcademico: $('#idPeriodoAcademicoEdit').val(),
        Organizacion: $('#idOrganizacionEdit').val(),
        AcademicYear: $('#idAcademicYearEdit').val(),
        AcademicTerm: $('#idAcademicTermEdit').val(),
        AcademicSession: $('#idAcademicSessionEdit').val(),
        PreviousAcademicYear: $('#idPreviousAcademicYearEdit').val(),
        PreviousAcademicTerm: $('#idPreviousAcademicTermEdit').val(),
        PreviousAcademicSession: $('#idPreviousAcademicSessionEdit').val()
    };

    // Validación
    if (!data.Organizacion || !data.AcademicYear || !data.AcademicTerm) {
        Swal.fire("Advertencia", "Complete los campos obligatorios del periodo actual.", "warning");
        return;
    }

    if (!data.PreviousAcademicYear || !data.PreviousAcademicTerm) {
        Swal.fire("Advertencia", "Complete los campos del periodo anterior.", "warning");
        return;
    }

    if (data.Organizacion === 'ESC') {
        if (!data.AcademicSession || !data.PreviousAcademicSession) {
            Swal.fire("Advertencia", "Complete las sesiones del periodo actual y anterior.", "warning");
            return;
        }
    }

    $("#global-loader").css("display", "revert");

    $.post($('#inputActualizarPeriodoAcademico').val(), data)
        .done(res => {
            if (res.success) {
                Swal.fire("Éxito", res.mensaje, "success").then(() => location.reload());
            } else {
                Swal.fire("Error", res.mensaje, "error");
            }
        })
        .fail(() => {
            Swal.fire("Error", "No se pudo completar la solicitud.", "error");
        })
        .always(() => {
            $("#global-loader").css("display", "none");
        });
}


function llenarSelect(selector, items, valorSeleccionado = '') {
    const sel = $(selector);
    sel.empty().append('<option value="">-- Seleccionar --</option>');
    items.forEach(i => {
        sel.append(`<option value="${i.valor}" ${i.valor === valorSeleccionado ? 'selected' : ''}>${i.valor}</option>`);
    });
}

function limpiarSelects(ids = [
    '#idAcademicYear', '#idAcademicTerm', '#idAcademicSession',
    '#idPreviousAcademicYear', '#idPreviousAcademicTerm', '#idPreviousAcademicSession'
]) {
    ids.forEach(id => $(id).html('<option value="">-- Seleccionar --</option>'));
}