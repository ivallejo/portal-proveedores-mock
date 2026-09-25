$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

const _usuariosRemote = [];
const _usuarioSplitChar = ' - ';

const _usuariosTypeahead = new Bloodhound({
    datumTokenizer: datum => Bloodhound.tokenizers.whitespace(datum.value),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
        url: URL_BASE + 'WkGrupoUsuario/buscarUsuariosAd' + '?query=%QUERY',
        wildcard: '%QUERY',
        filter: _usuariosTypeahead => $.map(_usuariosTypeahead, option => ({
            value: option.usuarioAD + _usuarioSplitChar + option.displayName
            //value: option.usuarioAD
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_usuariosTypeahead.initialize();

class GrupoUsuarioCreate {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#nuevoGrupoModal"));
        this.tituloModal = $("#frmAccion #tituloNuevoGrupoModal");
        this.idGrupo = 0;
        this.nombre = $("#frmAccion #nombre");
        this.vigente = $("#frmAccion input[name=Estado]");
        this.usuario = $("#frmAccion #Usuario");
        this.frmAccion = $("#frmAccion");
        this.btnGuardar = $("#frmAccion #btnGuardar");
        this.btnAgregarUsuario = $("#frmAccion #btnAgregarUsuario");
        this.tblUsuarios = $("#frmAccion #tblUsuarios");
        this.dataTable = this.tblUsuarios.DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                { data: "idUsuarioGrupo", title: "ID usuario", className: "no-mobile" },
                { data: "usuario", title: "Usuario" },
                { data: "nombre", title: "Nombre del usuario" },
                {
                    className: 'td-accion text-center',
                    title: '<span class="no-mobile">Acciones<span>',
                    orderable: false,
                    render: (data, type) => {
                        return '<i class="fas fa-trash eliminar-usuario"></i>';
                    }
                },
            ]
        });
        this.model = null;
    }
    cargarData(grupo) {
        this.model = grupo;
        this.frmAccion.find(".was-validated").removeClass("was-validated");
        this.usuario.val("");
        //listamos la data de la tabla
        if (grupo) {
            this.tituloModal.text("Edición de Grupo");
            this.idGrupo = grupo.idGrupo;
            this.nombre.val(grupo.nombre);
            this.vigente.filter(`[value='${grupo.activo ? "1" : "0"}']`).prop('checked', true);
            new GrupoUsuarioService().listarUsuariosPorGrupo(grupo.idGrupo, (usuarios) => {
                this.dataTable.clear().rows.add(usuarios).draw();
            });
        } else {
            this.tituloModal.text("Nuevo Grupo");
            this.dataTable.clear().draw();
            this.nombre.val("");
            this.idGrupo = 0;
            this.vigente.first().prop("checked", true);
        }
        this.modal.show();
    }
    configurarVentana(grupo, callback) {
        this.btnGuardar.on("click", () => {
            if (this.frmAccion.valid()) {
                let usuarios = this.tblUsuarios.DataTable().rows().data().toArray();
                let request = new Object();
                request.idGrupo = this.idGrupo;
                request.nombre = this.nombre.val();
                request.activo = this.vigente.first().is(":checked");
                request.usuarios = usuarios;
                let actualizar = !isNaN(request.idGrupo) && parseInt(request.idGrupo) > 0;
                if (actualizar) {
                    new GrupoUsuarioService().actualizar(request, (response) => {
                        callback(true);
                        MessageBox.info('Grupo actualizado correctamente');
                        this.modal.hide();
                    }, true, true);
                } else {
                    new GrupoUsuarioService().agregar(request, (response) => {
                        callback(true);
                        MessageBox.info('Grupo guardado correctamente');
                        this.modal.hide();
                    }, true, true);
                }
                return false;
            } else {
                this.nombre.parent().addClass("was-validated");
            }
            
        });
        this.tblUsuarios.on("click", ".eliminar-usuario", (e) => {
            var data = this.tblUsuarios.DataTable().row(e.currentTarget.closest("td")).data();
            this.dataTable.row(e.currentTarget.closest("tr")).remove().draw();
        });
        this.btnAgregarUsuario.on("click", () => {
            let usuarioValue = this.usuario.val();
            if (usuarioValue == null || usuarioValue.trim() === '') return false;

            const usuarioValueSplitted = usuarioValue.split(_usuarioSplitChar);
            if (usuarioValueSplitted?.length < 2) {
                MessageBox.error('Usuario no válido');
                return false;
            }

            const usuario = usuarioValueSplitted[0];
            const usuarioRemote = _usuariosRemote.filter(x => x.usuario == usuario)?.[0];
            if (!usuarioRemote) {
                MessageBox.error('Usuario no válido');
                return false;
            }

            //let nombre = this.nombre.val();
            let usuarios = this.tblUsuarios.DataTable().rows().data().toArray();
            if (usuarios.findIndex(x => x.usuario === usuario) >= 0) {
                MessageBox.showMessenger('El usuario ya está asignado','warning','Usuario Duplicado');
            } else {
                let row = new Object();
                row.idUsuarioGrupo = null;
                row.usuario = usuario;
                row.nombre = usuarioRemote.nombre || '';
                this.tblUsuarios.DataTable().row.add(row).draw();
            }
        });
        this.usuario.typeahead({
            hint: true,
            highlight: true,
            minLength: 3,
            limit: 20,
            cache: false,
        }, {
            displayKey: 'value',
            source: _usuariosTypeahead.ttAdapter(),
            highlighter: function (item) {
                return item.split(_usuarioSplitChar)[0];
                //return item;
            }
        }).on("typeahead:selected typeahead:autocompleted", function (ev, my_Suggestion_class) {
            const usuarioValueSplitted = $("#frmAccion #Usuario")?.val().split(_usuarioSplitChar);
            if (!usuarioValueSplitted || usuarioValueSplitted.length < 2) return;
            const usuario = usuarioValueSplitted[0];
            if (!_usuariosRemote.some(x => x.usuario == usuario)) _usuariosRemote.push({
                usuario: usuario,
                nombre: usuarioValueSplitted[1]
            });
        });
        this.cargarData(grupo);
    }
}