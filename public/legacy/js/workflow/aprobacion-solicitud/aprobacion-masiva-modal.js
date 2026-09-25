$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
    new MotivoAprobacionMasivaService().listar({}, (response) => {
        let idMotivoAprobacionMasiva = $("#frmAprobacionMasiva #IdMotivoAprobacionMasiva");
        idMotivoAprobacionMasiva.append(Constantes.Select.OpcionSeleccione);
        response.forEach(x => {
            idMotivoAprobacionMasiva.append(`<option value="${x.idMotivoAprobacionMasiva}">${x.nombre}</option>`);
        });
    }, false);
});
class AprobacionMasivaModal {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#aprobacionMasivaModal"));
        this.idMotivoAprobacionMasiva = $("#frmAprobacionMasiva #IdMotivoAprobacionMasiva");
        this.comentarioAtencion = $("#frmAprobacionMasiva #ComentarioAtencion");
        this.frmAccion = $("#frmAprobacionMasiva");
        this.btnProcesar = $("#frmAprobacionMasiva #btnProcesar");
        this.model = null;
    }

    show(solicitud, callback) {
        this.model = solicitud;
        this.frmAccion.removeClass("was-validated");
        this.idMotivoAprobacionMasiva.val("");
        this.comentarioAtencion.val("");
        this.configurarVentana(callback);
        this.modal.show();
    }

    configurarVentana(callback) {
        this.btnProcesar.off("click");
        this.btnProcesar.on("click", () => {
            if (this.frmAccion.valid()) {
                let request = Object.assign(this.model, {});
                request.idEstadoSolicitud = Constantes.EstadoSolicitud.Rechazado;
                request.idMotivoAprobacionMasiva = this.idMotivoAprobacionMasiva.val();
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