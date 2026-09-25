$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class AtencionSolicitud {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#atencionSolicitudModal"));
        this.idWorkflow = $("#frmAtencionSolicitud #IdWorkflow");
        this.idFaseWorkflow = $("#frmAtencionSolicitud #IdFaseWorkflow");
        this.solicitante = $("#frmAtencionSolicitud #Solicitante");
        this.fechaCreacion = $("#frmAtencionSolicitud #FechaCreacion");
        this.idSolicitud = $("#frmAtencionSolicitud #IdSolicitud");

        this.dataTable = $("#frmAtencionSolicitud #tblAtencionSolicitud").DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                //{ data: "idAtencionSolicitud", title: "ID", className: "no-mobile" },
                { data: "usuarioAtencion", title: "Usuario", render: (data, type, row) => row.nombreAtencion || row.usuarioAtencion },
                { data: "fechaAtencion", title: "Fecha", render: (data, type, row) => Util.formatearFechaAsString(row.fechaAtencion) },
                { data: "estadoSolicitud.nombre", title: "Estado" },
                { title: "Fase", className: "no-mobile", render: (data, type, row) => row.faseWorkflow?.nombre },
                { data: "comentarioAtencion", title: "Comentario", className: "no-mobile" }
            ],
            order: []
        });
    }
    cargarData(solicitud, esInicio = false) {
        console.log('llegooo');
        this.solicitante.val(solicitud.nombreSolicitante.toLowerCase());
        this.fechaCreacion.val(Util.formatearFechaHoraAsString(solicitud.fechaCreacion));
        this.idSolicitud.text(solicitud.idSolicitud);
        new AtencionSolicitudService().listar({ idSolicitud: solicitud.idSolicitud }, (reponse) => {
            console.log(reponse);
            this.dataTable.clear().rows.add(reponse).draw();
        });
        if (esInicio) {
            new WorkflowService().listar({}, (response) => {
                this.idWorkflow.append(Constantes.Select.OpcionSeleccione);
                response.forEach(x => {
                    this.idWorkflow.append(`<option value="${x.idWorkflow}">${x.nombre}</option>`);
                });
                if (solicitud) {
                    this.idWorkflow.val(solicitud.idWorkflow);
                }
            });
            new FaseWorkflowService().listar({}, (response) => {
                this.idFaseWorkflow.append(Constantes.Select.OpcionNinguno);
                response.forEach(x => {
                    this.idFaseWorkflow.append(`<option value="${x.idFaseWorkflow}">${x.nombre}</option>`);
                });
                if (solicitud) {
                    this.idFaseWorkflow.val(solicitud.idFaseWorkflow);
                }
            });
        } else {
            this.idFaseWorkflow.val(solicitud.idFaseWorkflow);
            this.idWorkflow.val(solicitud.idWorkflow);
        }
        this.modal.show();
    }
    configurarVentana(solicitud, callback) {
        this.cargarData(solicitud, true);
    }
}