

function actualizarMenu(contador) {


    let id_menu =  $(`input[name="ListMenuOptions[${contador}].Id"]`).val();
    let nom_menu = $(`input[name="ListMenuOptions[${contador}].nom_menu"]`).val();
    let path_menu = $(`input[name="ListMenuOptions[${contador}].path_menu"]`).val();
    let FlagSuperAdministrador = $(`input[name="ListMenuOptions[${contador}].FlagSuperAdministrador"]`).is(":checked") ? true : false;
    let FlagAdministrador = $(`input[name="ListMenuOptions[${contador}].FlagAdministrador"]`).is(":checked") ? true : false;
    let FlagDocente = $(`input[name="ListMenuOptions[${contador}].FlagDocente"]`).is(":checked") ? true : false;

    var formData = new FormData();
    formData.append('id_menu', id_menu);
    formData.append('nom_menu', nom_menu);
    formData.append('path_menu', path_menu);
    formData.append('FlagSuperAdministrador', FlagSuperAdministrador);
    formData.append('FlagAdministrador', FlagAdministrador);
    formData.append('FlagDocente', FlagDocente);

    $.ajax({
        url: $('#inputActualizarOpcionMenu').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success == true) {

                Swal.fire({
                    title: data1.mensaje,
                    text: "",
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.value) {
                        location.reload(true);

                    }
                });



            } else {

                

            }

        },
        error: function (error) {

        }
    });

}

function registrarMenuOpcion() {

    let nom_menu = $('#tituloAgregar').val();
    let path_menu = $('#URLAgregar').val();
    let IconoAgregar = $('#IconoAgregar').val();
    let FlagSuperAdministrador = $(`#checkSuperAdmin`).is(":checked") ? true : false;
    let FlagAdministrador = $(`#checkAdmin`).is(":checked") ? true : false;
    let FlagDocente = $(`#checkDocente`).is(":checked") ? true : false;

    var formData = new FormData();
    formData.append('nom_menu', nom_menu);
    formData.append('path_menu', path_menu);
    formData.append('src_image', IconoAgregar);
    formData.append('FlagSuperAdministrador', FlagSuperAdministrador);
    formData.append('FlagAdministrador', FlagAdministrador);
    formData.append('FlagDocente', FlagDocente);

    //console.log(formData);

    $.ajax({
        url: $('#inputRegistrarOpcionMenu').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success == true) {

                Swal.fire({
                    title: data1.mensaje,
                    text: "",
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.value) {
                        location.reload(true);

                    }
                });



            } else {



            }

        },
        error: function (error) {

        }
    });

}


//region

function prepareOrdenMenuDocentes(origin) {

    //deserializo el json origen
    var source = decodeBase64UTF8(origin);
    //console.log(source);
    //genero el json de elementos en la vista que han sido modificados, solo para los que tienen
    var viewjson = obtenerJSONDeTabla();

    //comparo ambos json para realizar la logica
    var origenesIdenticos = compararJsonDetallado(source, viewjson);
    //console.log(origenesIdenticos);

    if (!origenesIdenticos) {

        ("warning", "Cambios sin guardar", "Por favor guarde las configuraciones realizadas")
    }
    else {
        //obtengo nuevamente el YEISON del TABLE para armarlo en un modal y asi manejar el orden
        
        var target_table ="#lstOrdenMenu"
        buildElements(target_table, viewjson, viewjson.length);
        var target = "#modalMenuOrden";
        $(target).modal("show");
        
    }

}

//utilidades para construir tabla en datatable
function buildElements(target, json, len) {
    // Destruir cualquier instancia previa de DataTable y recrearla
    $(target).DataTable().clear().destroy();

    // Configuraci n y recreaci n de DataTable
    $(target).DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[50, 100, 150, -1], [50, 100, 150, "All"]],
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": true,
        "responsive": true,
        "language": {
            url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json",
            searchPlaceholder: "Buscar"
        },
        "initComplete": function (settings, json) {
            // Cambiar el texto de "Buscar:" en el label
            $('.dataTables_filter label').contents().filter(function () {
                return this.nodeType === 3;  // Filtra los nodos de texto
            }).first().replaceWith('');  // Reemplaza con el nuevo texto
        },
        data: json,
        columns: [
            { 'data': 'id_menu' },
            { 'data': 'nom_menu' },
            { 'data': 'path_menu' },
            {
                'data': 'nroOrden',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return `<input type="number" class="unique-number form-control" placeholder="IngreseOrden" min="1" max="${len}" value="${data}">`;
                    }
                    return data;
                }
            }
        ]
    });

    // Establecer el valor m ximo para la validaci n
    var maxvalue = len;

    // Delegaci n de eventos para manejar din micamente los cambios en los campos .unique-number
    $(target).on('input', '.unique-number', function (event) {
        validarNumerosUnicos(event, maxvalue);
    });

    function validarNumerosUnicos(event, maxvalue) {
        const inputs = Array.from(document.querySelectorAll('.unique-number'));
        const maxNumero = maxvalue;
        const errorMessage = document.getElementById("errorMessage");
        if (errorMessage) errorMessage.textContent = "";

        const valores = inputs.map(input => parseInt(input.value, 10)).filter(val => !isNaN(val));

        let valorActual = parseInt(event.target.value, 10);

        // Validar si el valor actual es menor que 1 o mayor que maxNumero
        if (valorActual < 1 || valorActual > maxNumero) {
            // Si el valor est  fuera de los l mites, ajustarlo al rango permitido
            let nuevoValor = valorActual < 1 ? 1 : maxNumero;
            event.target.value = nuevoValor;
            if (errorMessage) errorMessage.textContent = `El valor debe estar entre 1 y ${maxNumero}. Se cambi  a ${nuevoValor}.`;
            return; // Salimos de la funci n si el valor est  fuera de los l mites
        }

        // Verificamos si el n mero ingresado se repite
        if (valores.filter(val => val === valorActual).length > 1) {
            // Si hay repetici n, buscar un n mero alternativo
            let nuevoValor = valorActual + 1;

            // Intentamos encontrar el siguiente n mero disponible
            while (valores.includes(nuevoValor) && nuevoValor <= maxNumero) {
                nuevoValor++;
            }

            // Si el n mero mayor no est  disponible, intentamos el menor
            if (nuevoValor > maxNumero) {
                nuevoValor = valorActual - 1;
                while (valores.includes(nuevoValor) && nuevoValor >= 1) {
                    nuevoValor--;
                }
            }

            // Si encontramos un valor v lido, lo asignamos al campo actual
            if (nuevoValor >= 1 && nuevoValor <= maxNumero && !valores.includes(nuevoValor)) {
                event.target.value = nuevoValor;
                if (errorMessage) errorMessage.textContent = `N mero repetido, se cambi  a ${nuevoValor}`;
            } else {
                if (errorMessage) errorMessage.textContent = "No se encontr  un n mero alternativo disponible.";
            }
        }
    }
}
//utilidades para comparar jsons
function obtenerJSONDeTabla() {
    const table = document.getElementById("tblMenus");
    const rows = table.querySelectorAll("tbody tr");
    const jsonData = [];

    rows.forEach(row => {
        const id_menu = row.querySelector('input[name*="Id"]').value;
        
        const nom_menu = row.querySelector('input[name*="nom_menu"]').value;
        const path_menu = row.querySelector('input[name*="path_menu"]').value;
        const FlagSuperAdmin = row.querySelector('input[name*="FlagSuperAdministrador"]').checked;
        const FlagAdministrador = row.querySelector('input[name*="FlagAdministrador"]').checked;
        const FlagDocente = row.querySelector('input[name*="FlagDocente"]').checked;
        const nroorden =row.querySelector('input[name*="nroOrden"]').value;

        // Estructura del objeto JSON de acuerdo al formato que deseas
        const menuItem = {
            id_menu: parseInt(id_menu, 10),  // Convertimos el ID a n mero
            nom_menu,
            path_menu,
            FlagSuperAdmin,
            FlagAdministrador,
            FlagDocente,
            estado: false,  // Suponiendo que el estado se establece en falso por defecto
            nroOrden: nroorden
        };

        // Agregamos el objeto a la lista de datos JSON
        if (FlagDocente == true) {
            jsonData.push(menuItem);
        }
        
    });

    //console.log(JSON.stringify(jsonData, null, 2));
    return jsonData;
}
function compararJsonDetallado(json1, json2) {
    // Verificamos si ambos JSON tienen las mismas claves
    const keys1 = Object.keys(json1).sort();
    const keys2 = Object.keys(json2).sort();

    if (keys1.length !== keys2.length || JSON.stringify(keys1) !== JSON.stringify(keys2)) {
        return false; // Tienen diferente n mero de claves o diferentes claves
    }

    // Comparamos los valores de cada clave
    for (let key of keys1) {
        const val1 = json1[key];
        const val2 = json2[key];

        // Si los valores son objetos, hacemos una comparaci n recursiva
        if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
            if (!compararJsonDetallado(val1, val2)) {
                return false;
            }
        } else {
            // Convertimos ambos valores a strings para comparar incluso diferencias menores
            if (String(val1) !== String(val2)) {
                //console.log(`Valores distintos para la clave "${key}":`, val1, val2);
                return false;
            }
        }
    }

    return true; // Todos los elementos y valores son iguales, incluyendo tipos y estructura
}
function decodeBase64UTF8(encodedData) {
    // Decodificamos desde Base64
    const decodedData = atob(encodedData);

    // Convertimos la cadena decodificada en un array de bytes para interpretar caracteres especiales
    const bytes = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
        bytes[i] = decodedData.charCodeAt(i);
    }

    // Decodificamos el array de bytes como UTF-8
    const decodedString = new TextDecoder('utf-8').decode(bytes);

    try {
        // Parseamos el JSON decodificado
        return JSON.parse(decodedString);
    } catch (error) {
        console.error("Error al deserializar los datos:", error);
        return null;
    }
}

//utilidades para registrar orden de datos
function commitValues() {
    var target = "#lstOrdenMenu";
    var jsonSource = obtenerValoresTabla(target);
    var len = jsonSource.length;

    var existeErrores = validarNroOrden(jsonSource, len);

    if (existeErrores === true) {
        actualizarOrden(jsonSource);
    }
    else {
        console.warn("valores invalidos")
    }

}

function actualizarOrden(json) {
    try {
        var request = JSON.stringify(json);
        var target_modal = "#lstOrdenMenu";
        var fxdtx = new FormData();
        fxdtx.append("request", request);

        $.ajax({
            url: rq_actualizarOrden,
            type: 'POST',
            data: fxdtx,
            processData: false,
            contentType:false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                var status = response.success;

                if (status) {
                    alerta_center(response.swal, "Éxito", response.mensaje);
                    //finalmente
                    $(target_modal).modal("hide");
                }
                else {
                    alerta_center(response.swal, "Advertencia", response.mensaje);
                }
            },
            error: function (error) {
                alerta_center("error", "Error", "Ocurrió  un error inesperado");
                console.error(error.responseText);
            },
            complete: function () {
                hideModalLoader();
                location.reload(true)
            }
         })
    }
    catch (error) {
        console.error(error);
        alerta_center("error", "Excepcion encontrada", `${error.errorMessage}`)
    }
}

function obtenerValoresTabla(target) {
    const table = $(target).DataTable();
    const datos = [];

    table.rows().every(function () {
        const data = this.data(); // Obtiene los datos de la fila actual
        const idMenu = data.id_menu; // Primer columna
        const nroOrden = $(this.node()).find('.unique-number').val(); // Valor del input en la  ltima columna

        datos.push({ id_menu: idMenu, nroOrden: parseInt(nroOrden, 10) || 0 }); // Agrega los datos al array, usa 0 si el input est  vac o
    });

    //console.log(datos);
    return datos;
}
function validarNroOrden(datos,len) {
    const nroOrdenes = datos.map(item => item.nroOrden); // Extrae todos los valores de nroOrden
    const valoresUnicos = new Set();
    let esValido = true;
    let mensajeError = "";

    for (let nro of nroOrdenes) {
        // Verifica si el valor es 0
        if (nro === 0) {
            esValido = false;
            mensajeError = `Existen valores de numero de orden que son 0. Todos deben ser mayores que 0. y menores que ${len + 1}`;
            break;
        }

        // Verifica si el valor ya existe en el conjunto (es duplicado)
        if (valoresUnicos.has(nro)) {
            esValido = false;
            mensajeError = `El valor ${nro} en numero de orden est  repetido. Todos deben ser  nicos.`;
            break;
        }

        // Agrega el valor al conjunto de valores  nicos
        valoresUnicos.add(nro);
    }

    if (!esValido) {
        alerta_center("warning", "Advertencia", mensajeError);

    } else {
        //console.log("La validacion fue exitosa. Todos los valores son  unicos y mayores a 0.");
    }

    return esValido;
}