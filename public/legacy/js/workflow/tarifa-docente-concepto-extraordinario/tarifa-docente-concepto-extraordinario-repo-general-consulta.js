$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

class TarifaDocenteConceptoExtraordinarioDetalleRepo {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#tarifaDocenteModal"));
        this.titulo = $("#frmTarifaDocente #tarifaDocenteModalTitulo");

        this.tblDocentes = $("#frmTarifaDocente #tarifaDocenteTableModal");
        this.contentCardsMobile = $("#frmTarifaDocente #contentCards-tarifaDocente");
        this.organizacion = $("#frmTarifaDocente #organizacion");
        this.periodo = $("#frmTarifaDocente #periodo");
        this.frmAccion = $("#frmTarifaDocente");

        this.btnExportar = $("#frmTarifaDocente #btnExportar");
        this.model = null;

        this.dataTable = this.tblDocentes.DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                { data: "docente", title: "Docente" },
                {
                    data: "tarifa", title: "Tarifa",
                    render: (data) => {
                        return "S/. " + data
                    }
                },
            ]
        });
    }

    cargarData(data) {
        this.organizacion.val(data.organizacion);
        this.periodo.val(data.periodo);
        this.dataTable.clear().draw();
        new SolicitudService().obtenerParticipadosPorId2(data.idSolicitud, data.soloFinales, (response) => {
            const docentes = response.tarifaDocenteConceptoExtraordinario;
            if (docentes.length > 0) {
                docentes.forEach(item => {
                    let row = new Object();
                    row.docente = item.docente;
                    row.tarifa = item.tarifa;
                    this.tblDocentes.DataTable().row.add(row).draw(false);
                });
                this.btnExportar.attr("href", URL_BASE + "WkAprobacionSolicitud/DescargarExcelPendienteAprobarPorId?key=" + data.idSolicitud);

                this.cargarMobile();
            }
        });
        this.modal.show();
    }

    configurarVentana(data, callback) {
        this.cargarData(data);
    }

    cargarMobile(response) {
        if (!response)
            response = this.tblDocentes.DataTable().rows().data().toArray();
        Mobile.generarCard(response, 1, (data) => {
            this.contentCardsMobile.html('');
            if (data.length === 0) {
                // Mostrar un mensaje si no hay datos
                this.contentCardsMobile.html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
                return; // Salir de la función si no hay datos
            }
            data.forEach((item, index) => {
                let card = `<div class="mobile-card">
                <div>
                    <span>Tarifa:</span>
                    <span>S/. ${item.tarifa}</span>
                </div>
                <div>
                    <span>Docente:</span>
                    <span>${item.docente}</span>
                </div>
                    </div>`;
                this.contentCardsMobile.append(card);
            });
        });
    }
}