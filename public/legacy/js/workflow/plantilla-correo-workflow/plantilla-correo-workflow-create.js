$(document).ready(function () {
    $.validator.setDefaults({
        //ignore: '[name="Plantilla"]',
        onfocusout: false
    });
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

class PlantillaCorreoWorkflowCreate {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#nuevoCorreoModal"));
        this.idWorkflow = $("#frmAccion #IdWorkflow");
        this.idEstadoSolicitud = $("#frmAccion #IdEstadoSolicitud");
        this.idFaseWorkflow = $("#frmAccion #IdFaseWorkflow");
        this.destinatario = $("#frmAccion #Destinatario");
        this.asunto = $("#frmAccion #Asunto");
        this.tituloModal = $("#frmAccion #tituloNuevoCorreoModal")
        this.plantilla = $("#frmAccion #Plantilla");
        this.vigente = $("#frmAccion input[name=Estado]");
        this.frmAccion = $("#frmAccion");
        this.btnGuardar = $("#frmAccion #btnGuardar");
        this.btnVerVariables = $("#frmAccion #btnVerVariables");
        this.btnCerrarAlertVariables = $("#frmAccion #div-alert-variables .btn-close");
        this.divDestinaratio = $("#frmAccion #divDestinatario");
        this.divFaseWorkflow = $("#frmAccion #divFaseWorkflow");
        this.model = null;
        this.destinatariosModel = [];
    }
    cargarData(plantilla, copiar, esInicio = false) {
        this.frmAccion.removeClass("was-validated");
        this.destinatariosModel = [];
        //listamos la data de la tabla
        if (plantilla) {

            new PlantillaCorreoWorkflowService().obtenerPorId(plantilla.idPlantillaCorreoWorkflow, (response) => {
                this.asunto.val(response.asunto);
                this.plantilla.summernote("code", response.plantilla);
                this.vigente.filter(`[value='${response.activo ? "1" : "0"}']`).prop('checked', true);
                if (!esInicio) {
                    this.idWorkflow.val(plantilla.idWorkflow);
                    this.idEstadoSolicitud.val(plantilla.idEstadoSolicitud).trigger("change")
                    this.idFaseWorkflow.val(plantilla.idFaseWorkflow);
                    //this.destinatario.val(plantilla.destinatario);
                    this.destinatario.val("");
                }
                if (response.idEstadoSolicitud === Constantes.EstadoSolicitud.Aprobado) {
                    new PlantillaCorreoWorkflowService().listarDestinatarios(
                        {
                            idPlantillaCorreoWorkflow: response.idPlantillaCorreoWorkflow
                        }, (responseDestinatarios) => {
                            this.destinatariosModel.push(...responseDestinatarios);
                            if (responseDestinatarios.length > 0) {
                                this.plantilla.summernote("code", responseDestinatarios[0].plantilla);
                                if (!esInicio) {
                                    this.destinatario.val(responseDestinatarios[0].destinatario);
                                }
                                plantilla.destinatario = responseDestinatarios[0].destinatario
                                console.log(plantilla.destinatario);
                            } else {
                                this.plantilla.summernote("code", "");
                            }
                        }, false, false);
                }
            }, true, false);
            if (!copiar) {
                this.tituloModal.text("Edición de Correo");
                this.model = plantilla;
            } else {
                this.tituloModal.text("Copiar Correo");
                this.model = null;
            }
        } else {
            this.tituloModal.text("Nuevo Correo");
            this.idWorkflow.val("");
            this.asunto.val("");
            this.idEstadoSolicitud.val("").trigger("change");
            this.idFaseWorkflow.val("");
            this.destinatario.val("");
            this.plantilla.summernote("code", "");
            this.vigente.first().prop("checked", true);
            this.model = null;
        }
        if (esInicio) {
            new WorkflowService().listar({}, (response) => {
                this.idWorkflow.append(Constantes.Select.OpcionSeleccione);
                response.forEach(x => {
                    this.idWorkflow.append(`<option value="${x.idWorkflow}">${x.nombre}</option>`);
                });
                if (plantilla) {
                    this.idWorkflow.val(plantilla.idWorkflow);
                }
            });
            new ParametroWorkflowService().listar({ dominio: Constantes.Parametros.Dominio.Destinatarios }, (response) => {
                this.destinatario.append(Constantes.Select.OpcionNinguno);
                response.forEach(x => {
                    this.destinatario.append(`<option value="${x.codigo}">${x.valor}</option>`);
                });
                if (plantilla && plantilla.destinatario) {
                    this.destinatario.val(plantilla.destinatario);
                }
            });
            new FaseWorkflowService().listar({}, (response) => {
                this.idFaseWorkflow.append(Constantes.Select.OpcionNinguno);
                response.forEach(x => {
                    this.idFaseWorkflow.append(`<option value="${x.idFaseWorkflow}">${x.nombre}</option>`);
                });
                if (plantilla && plantilla.idFaseWorkflow) {
                    this.idFaseWorkflow.val(plantilla.idFaseWorkflow);
                }
            });
            new EstadoSolicitudService().listar({}, (response) => {
                this.idEstadoSolicitud.append(Constantes.Select.OpcionSeleccione);
                response.forEach(x => {
                    this.idEstadoSolicitud.append(`<option value="${x.idEstadoSolicitud}">${x.nombre}</option>`);
                });
                if (plantilla) {
                    this.idEstadoSolicitud.val(plantilla.idEstadoSolicitud);
                    if (plantilla.idEstadoSolicitud != Constantes.EstadoSolicitud.Aprobado) {
                        this.divDestinaratio.addClass('d-none');
                        if (plantilla.idEstadoSolicitud != Constantes.EstadoSolicitud.EnEvaluacion) {
                            this.divFaseWorkflow.addClass('d-none');
                        }
                    } else {
                        this.divFaseWorkflow.addClass('d-none');
                    }
                }
            });
        }
        this.modal.show();
    }
    configurarVentana(data, copiar, callback) {
        this.btnGuardar.on("click", () => {
            if (this.frmAccion.valid()) {
                let request = new Object();
                if (this.model)
                    request = Object.assign(this.model, {});
                request.idWorkflow = this.idWorkflow.val();
                request.asunto = this.asunto.val();
                request.idEstadoSolicitud = this.idEstadoSolicitud.val();
                request.idFaseWorkflow = this.idFaseWorkflow.val();
                request.destinatario = this.destinatario.val();
                let plantilla = this.plantilla.summernote("code");
                if (request.destinatario) {
                    let destinatario = this.destinatariosModel.find(x => x.destinatario === request.destinatario);
                    if (destinatario) {
                        destinatario.plantilla = plantilla;
                    } else {
                        this.destinatariosModel.push({
                            plantilla: plantilla,
                            destinatario: request.destinatario
                        });
                    }
                    request.destinatarios = this.destinatariosModel;
                } else {
                    request.plantilla = plantilla;
                }
                request.activo = this.vigente.first().is(":checked");
                let actualizar = !isNaN(request.idPlantillaCorreoWorkflow) && parseInt(request.idPlantillaCorreoWorkflow) > 0;
                if (actualizar) {
                    new PlantillaCorreoWorkflowService().actualizar(request, (response) => {
                        callback(true);
                        MessageBox.info('Correo actualizado correctamente');
                        this.modal.hide();
                    }, true, true);
                } else {
                    new PlantillaCorreoWorkflowService().agregar(request, (response) => {
                        callback(true);
                        MessageBox.info('Correo guardado correctamente');
                        this.modal.hide();
                    }, true, true);
                }
                return false;
            } else {
                //this.nombre.parent().addClass("was-validated");
                this.frmAccion.addClass("was-validated");
            }

        });
        this.idEstadoSolicitud.on("change", (e) => {
            if (e.currentTarget.value != Constantes.EstadoSolicitud.Aprobado) {
                this.divDestinaratio.addClass('d-none');
                this.destinatario.val("");
                if (e.currentTarget.value == Constantes.EstadoSolicitud.EnEvaluacion) {
                    this.divFaseWorkflow.removeClass('d-none');
                } else {
                    this.divFaseWorkflow.addClass('d-none');
                    this.idFaseWorkflow.val("");
                }
            } else {
                this.divDestinaratio.removeClass('d-none');
                this.divFaseWorkflow.addClass('d-none');
                this.idFaseWorkflow.val("");
                this.plantilla.summernote("code", "");
                this.destinatariosModel = [];
            }

        });
        this.destinatario.on("focus", (e) => {
            let plantilla = this.plantilla.summernote("code").trim();
            let destinatario = this.destinatariosModel.find(x => x.destinatario === e.currentTarget.value);
            if (destinatario) {
                destinatario.plantilla = plantilla;
            } else {
                if (plantilla) {
                    this.destinatariosModel.push({
                        plantilla: plantilla,
                        destinatario: e.currentTarget.value
                    });
                }
            }
        });
        this.destinatario.on("change", (e) => {
            let destinatario = this.destinatariosModel.find(x => x.destinatario === e.currentTarget.value);
            if (destinatario) {
                this.plantilla.summernote("code", destinatario.plantilla);
            } else {
                this.plantilla.summernote("code", "");
            }
        });
        this.plantilla.summernote({
            height: 250,
            minHeight: null,
            maxHeight: null,
            disableDragAndDrop: true,
            dialogsInBody: true,
            lang: 'es-ES',
            //hint: {
            //    mentions: ['hackerwins', 'lqez', 'easylogic', 'dennis'],
            //    match: /\B{{(\w*)$/,
            //    search: function(keyword, callback) {
            //        callback($.grep(this.mentions, (item)=> {
            //            return item.indexOf(keyword) >= 0;
            //        }));
            //    },
            //    content: (item)=> {
            //        return '{{' + item +'}}';
            //    }
            //}
        });
        this.btnVerVariables.on('click', () => {
            $('#div-alert-variables').removeClass('d-none');
        });
        this.btnCerrarAlertVariables.on('click', () => {
            $('#div-alert-variables').removeClass('d-none').addClass('d-none');
        });
        $(".note-dropzone, .note-group-select-from-files").remove();

        this.cargarData(data, copiar, true);
    }
}