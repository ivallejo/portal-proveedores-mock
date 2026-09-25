$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class TarifaDocenteCreate {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#nuevoTarifaDocenteModal"));
        this.tituloModal = $("#frmAccion #tituloTarifaDocenteModal");
        this.idTarifaDocente = null;
        this.organizacion = $("#frmAccion #organizacionModal");
        this.periodoAcademico = $("#frmAccion #periodoAcademicoModal");
        this.docente = $("#frmAccion #docenteModal");
        this.frmAccion = $("#frmAccion");
        this.tarifa = $("#frmAccion #tarifaModal");
        this.btnGuardar = $("#frmAccion #btnGuardarModal");
        this.model = null;
    }
    cargarData(tarifaDocente) {
        this.model = tarifaDocente;
        this.frmAccion.find(".was-validated").removeClass("was-validated");
        const orgsOptions = $(`#organizacion > option`).clone();
        this.organizacion.empty().append(orgsOptions);
        const perAcaOptions = $(`#periodo > option`).clone();
        this.periodoAcademico.empty().append(perAcaOptions);
        //listamos la data de la tabla
        if (tarifaDocente) {
            this.tituloModal.text("Edición de Tarifa de Docente");
            this.idTarifaDocente = tarifaDocente.idTarifaDocente;
            this.organizacion.val(tarifaDocente.idOrganizacion);
            this.periodoAcademico.val(tarifaDocente.idPeriodoAcademico);
            this.docente.val(tarifaDocente.idDocente + ' - ' + tarifaDocente.docente);
            this.tarifa.val(tarifaDocente.tarifa);
        }
        this.modal.show();
    }
    configurarVentana(tarifaDocente, callback) {
        this.btnGuardar.on("click", () => {
            if (this.frmAccion.valid()) {
                let tarifaValue = this.tarifa.val();
                if (tarifaValue == null || tarifaValue.trim() === '') return false;

                let request = new Object();
                if (this.model)
                    request = Object.assign(this.model, {});
                request.tarifa = this.tarifa.val();
                $(`#tarifaDocenteTable`).DataTable().row(this.idTarifaDocente).data(request).draw();
                callback(true);
                MessageBox.info('Tarifa de Docente actualizado correctamente');
                this.modal.hide();
                return false;
                //}
            } else {
                this.tarifa.parent().addClass("was-validated");
            }
        });
        this.tarifa.keydown(function (e) {
            var match = $(this).val().match(/\./g);
            if (match != null) {
                // Allow: backspace, delete, tab, escape and enter 
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                    // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    // let it happen, don't do anything
                    return;
                }  // Ensure that it is a number and stop the keypress
                else if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && (e.keyCode == 190)) {
                    e.preventDefault();
                }
            }
            else {
                // Allow: backspace, delete, tab, escape, enter and .
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                    // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    // let it happen, don't do anything
                    return;
                }
                // Ensure that it is a number and stop the keypress
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
        this.cargarData(tarifaDocente);
    }
}