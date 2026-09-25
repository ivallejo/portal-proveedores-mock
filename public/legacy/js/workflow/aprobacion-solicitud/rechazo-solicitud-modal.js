$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
    new MotivoRechazoSolicitudService().listar({}, (response) => {
        let idMotivoRechazoSolicitud = $("#frmRechazoSolicitud #IdMotivoRechazoSolicitud");
        idMotivoRechazoSolicitud.append(Constantes.Select.OpcionSeleccione);
        response.forEach(x => {
            idMotivoRechazoSolicitud.append(`<option value="${x.idMotivoRechazoSolicitud}">${x.nombre}</option>`);
        });
    }, false);
});
class RechazoSolicitudModal {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#rechazoSolicitudModal"));
        this.idMotivoRechazoSolicitud = $("#frmRechazoSolicitud #IdMotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmRechazoSolicitud #ComentarioAtencion");
        this.frmAccion = $("#frmRechazoSolicitud");
        this.btnRechazar = $("#frmRechazoSolicitud #btnRechazarSolicitud");
        this.model = null;
    }

    show(solicitud, callback) {
        this.model = solicitud;
        this.frmAccion.removeClass("was-validated");
        this.idMotivoRechazoSolicitud.val("");
        this.comentarioAtencion.val("");
        this.configurarVentana(callback);
        this.modal.show();
    }

    configurarVentana(callback) {
        this.btnRechazar.off("click");
        this.btnRechazar.on("click", () => {
            if (this.frmAccion.valid()) {
                let request = Object.assign(this.model, {});
                request.idEstadoSolicitud = Constantes.EstadoSolicitud.Rechazado;
                request.idMotivoRechazoSolicitud = this.idMotivoRechazoSolicitud.val();
                request.comentarioAtencion = this.comentarioAtencion.val();
                new SolicitudService().registrarEvaluacion(request, (response) => {
                    this.modal.hide();
                    callback();
                });
                return false;
            } else {
                this.frmAccion.addClass("was-validated");
            }
        });
    }
}