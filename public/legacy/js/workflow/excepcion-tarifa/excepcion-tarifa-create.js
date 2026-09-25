$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class ExcepcionTarifaCreate {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#nuevoExcepcionTarifaModal"));
        this.tituloModal = $("#frmAccion #tituloExcepcionTarifaModal");
        this.idExcepcionTarifa = null;
        this.organizacion = $("#frmAccion #organizacionModal");
        this.periodoAcademico = $("#frmAccion #periodoAcademicoModal");
        this.docente = $("#frmAccion #docenteModal");
        this.curso = $("#frmAccion #cursoModal");
        this.frmAccion = $("#frmAccion");
        this.tarifa = $("#frmAccion #tarifaModal");
        this.btnGuardar = $("#frmAccion #btnGuardarModal");
        this.model = null;
    }
    cargarData(excepcionTarifa) {
        this.model = excepcionTarifa;
        this.frmAccion.find(".was-validated").removeClass("was-validated");
        const orgsOptions = $(`#organizacion > option`).clone();
        this.organizacion.empty().append(orgsOptions);
        const perAcaOptions = $(`#periodo > option`).clone();
        this.periodoAcademico.empty().append(perAcaOptions);
        if (excepcionTarifa) {
            this.tituloModal.text("Edición de Excepción de Tarifa de Docente");
            this.idExcepcionTarifa = excepcionTarifa.idExcepcionTarifa;
            this.organizacion.val(excepcionTarifa.idOrganizacion);
            this.periodoAcademico.val(excepcionTarifa.idPeriodoAcademico);
            this.docente.val(excepcionTarifa.idDocente + ' - ' + excepcionTarifa.docente);
            this.curso.val(excepcionTarifa.idCurso + ' - ' + excepcionTarifa.curso);
            this.tarifa.val(excepcionTarifa.tarifa);
        }
        this.modal.show();
    }
    configurarVentana(excepcionTarifa, callback) {
        this.btnGuardar.on("click", () => {
            if (this.frmAccion.valid()) {
                let tarifaValue = this.tarifa.val();
                if (tarifaValue == null || tarifaValue.trim() === '') return false;

                let request = new Object();
                if (this.model)
                    request = Object.assign(this.model, {});
                request.tarifa = this.tarifa.val();
                $(`#excepcionTarifaTable`).DataTable().row(this.idExcepcionTarifa).data(request).draw();
                callback(true);
                MessageBox.info('Excepción de Tarifa de Docente actualizado correctamente');
                this.modal.hide();
                return false;
            } else {
                this.tarifa.parent().addClass("was-validated");
            }
        });
        this.tarifa.keydown(function (e) {
            var match = $(this).val().match(/\./g);
            if (match != null) {
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                else if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && (e.keyCode == 190)) {
                    e.preventDefault();
                }
            }
            else {
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            }
        });
        this.tarifa.keyup(function () {
            if ($(this).val().indexOf('.') != -1) {
                if ($(this).val().split(".")[1].length > 2) {
                    if (isNaN(parseFloat(this.value))) return;
                    this.value = parseFloat(this.value).toFixed(2);
                }
            }
        });
        this.cargarData(excepcionTarifa);
    }
}