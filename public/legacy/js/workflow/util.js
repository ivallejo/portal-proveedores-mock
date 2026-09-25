const Util = {
    generarKeyTemporal: () => {
        let fecha = new Date();
        return `NW-${fecha.getHours()}${fecha.getMinutes()}${fecha.getSeconds()}${fecha.getMilliseconds()}`;
    },
    crearFormData: function (formData, key, data) {
        if ((data === Object(data) || Array.isArray(data)) && !(data instanceof File)) {
            for (var i in data) {
                if (data[i] !== null)
                    this.crearFormData(formData, key + '[' + i + ']', data[i]);
            }
        } else {
            if (data !== null)
                formData.append(key, data);
        }
    },
    obtenerFechaActualAsString: function () {
        let fecha = new Date();
        let anio = fecha.getFullYear();
        let mes = fecha.getMonth() + 1;
        let dia = fecha.getDate();
        return (dia < 10 ? "0" : "") + dia + "/" + (mes < 10 ? "0" : "") + mes + "/" + anio;
    },
    formatearFechaAsString: function (value) {
        if (value === null || value === '' || value === '0001-01-01T00:00:00' || value === undefined)
            return "";
        if (value.length >= 19)
            value = value.substr(0, 10);
        if (value.length === 10 && value.includes('-')) {
            let fechas = value.split('-');
            return fechas[2] + '/' + fechas[1] + '/' + fechas[0];
        }
        return value
    },
    formatearFechaHoraAsString: function (value) {
        if (value === null || value === '' || value === '0001-01-01T00:00:00' || value === undefined)
            return "";
        if (value.includes("AM") || value.includes("PM"))
            return value;
        let fecha = null;
        if (value.length >= 19)
            fecha = value.substr(0, 10);
        else
            return "";
        if (fecha.includes('-')) {
            let fechas = fecha.split('-');
            fecha = fechas[2] + '/' + fechas[1] + '/' + fechas[0];
        }
        let hora = parseInt(value.substr(11, 2));
        let ampm = "AM";
        if (hora > 12) {
            hora -= 12;
            ampm = "PM";
        } else if (hora == 12) {
            ampm = "PM";
        }
        return fecha + " " + hora.toString().padStart(2, '0') + ":" + value.substr(14, 2) + " " + ampm;
    },
    formatearMoneda: function (monto) {
        if (monto === null || monto === "")
            return "";
        monto = parseFloat(monto.toString().replaceAll(",", "")).toFixed(2);
        monto += '';
        var x = monto.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1].padEnd(2, "0") : '.00';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },
    obtenerLenguajeDataTable: function () {
        return {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando del 0 al 0 de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix": "",
            "sSearch": "Buscar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": '<span class="fas fa-chevron-right"></span>',
                "sPrevious": '<span class="fas fa-chevron-left"></span>'
            },
            "oAria": {
                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        };
    }
};