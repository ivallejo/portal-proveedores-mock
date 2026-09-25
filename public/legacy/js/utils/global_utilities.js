const  selectoresNota_v = [".promedio_bd", ".nota"]; //selectores de notas para la delimitación
const dictionary = [
    {
        "name": "MAÑANA",
        "value": "MAÑANA"
    },
    {
        "name": "TARDE",
        "value": "TAR"
    },
    {
        "name": "NOCHE",
        "value": "NOC"
    }
]


function extractDate(dateTimeString) { //yyyy-MM-ddThh:mm:ss -->yyyy-MM-dd
    // Usar el método split para dividir la cadena en 'T'
    let datePart = dateTimeString.split('T')[0];
    return datePart;
}

function transformDateFormat(dateString) {  //yyyy-MM-dd --> dd/MM/yyyy
    // Verificar que la cadena tenga el formato correcto
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error("El formato de la fecha debe ser 'yyyy-MM-dd'");
    }

    // Dividir la cadena de fecha en partes
    const parts = dateString.split("-");
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    // Retornar la fecha en el nuevo formato
    return `${day}/${month}/${year}`;
}

function formatDate(dateString) {
    // Comprobar si la cadena de fecha está en el formato 'yyyy-MM-dd'
    let dateParts;
    if (dateString.includes('-')) {
        dateParts = dateString.split('-');
        let year = parseInt(dateParts[0], 10);
        let month = parseInt(dateParts[1], 10) - 1; // Los meses son indexados desde 0
        let day = parseInt(dateParts[2], 10);

        // Crear un nuevo objeto Date con los componentes
        let date = new Date(year, month, day);

        // Obtener el día, mes y año formateados
        let formattedDay = date.getDate().toString().padStart(2, '0');
        let formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        let formattedYear = date.getFullYear();

        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
    } else {
        // Comprobar si la cadena de fecha está en el formato 'dd/MM/yyyy'
        dateParts = dateString.split('/');
        let day = parseInt(dateParts[0], 10);
        let month = parseInt(dateParts[1], 10) - 1; // Los meses son indexados desde 0
        let year = parseInt(dateParts[2], 10);

        // Crear un nuevo objeto Date con los componentes
        let date = new Date(year, month, day);

        // Obtener el día, mes y año formateados
        let formattedDay = date.getDate().toString().padStart(2, '0');
        let formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        let formattedYear = date.getFullYear();

        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
    }
}

function convertDateFormat(dateString) {  //dd-MM-yyyy -> yyyy-MM-ddT00:00:00.000Z
    // Separar el día, mes y año usando split
    let parts = dateString.split("-");
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];

    // Crear un objeto de fecha utilizando los valores separados
    let date = `${year}-${month}-${day}T00:00:00.000Z`;

    // Convertir la fecha al formato ISO y retornar la cadena
    return date;
}

function invertFormatDate(dateString) {//dd-MM-yyyy

    let parts = dateString.split("-");
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];

    let date = `${year}-${month}-${day}`;

    return date;
}

function formatDateDeprecated(dateString) {
    // Parsear la cadena de fecha
    let date = new Date(dateString);

    // Obtener el día, mes y año
    let day = date.getDate();
    let month = date.getMonth() + 1; // Los meses son indexados desde 0
    let year = date.getFullYear();

    // Formatear el día y el mes para que tengan dos dígitos
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }

    return day + '/' + month + '/' + year;
}


function convertToISOFormat(dateString) {
    // Asumiendo que el formato de entrada es "DD/MM/YYYY"
    const [day, month, year] = dateString.split('/');

    // Crear un objeto Date con los valores extraídos
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    // Convertir la fecha a formato ISO
    const isoDate = date.toISOString();

    return isoDate;
}

//UTILIDADES UX
function showModalLoader() {
    $("#global-loader").css("display", "revert");
}
function hideModalLoader() {
    $("#global-loader").css("display", "none");
}

function showAlternativeLoader(target) {
    $(`#${target}`).css("display", "revert")
}

function hideAlternativeLoader(target) {
    $(`#${target}`).css("display", "none")
}


//utilidades secciones fusionadas

function toastSeccionesHijas(content) {
    Swal.fire({
        icon: "info",
        title: "La sección seleccionada es una sección fusionada.",
        html: content,
        toast: false,
        position: 'center',
        showConfirmButton: false,
        timerProgressBar: true,
        showConfirmButton: true,
        customClass: {
            popup: 'large-swal' // Clase personalizada para el tamaño
        }
    });
    return;
}

function toastHtml(icon, title, content) {

    Swal.fire({
        icon: icon,
        //title: title,
        title: `<div class="custom-title">${title}</div>`,
        html: content,
        toast: false,
        position: 'center',
        showConfirmButton: false,
        timerProgressBar: true,
        showConfirmButton: true,
        customClass: {
            title: 'custom-title-class'
        }
    });

    return;

}

//reutilizables secciones fusionadas
function generateHTMLSeccionesHijas(seccionesHijas, classdiv) {
    var attrs = `class="text-center"`;
    var styleHeaders = "padding: 5px; color: white; margin: 10px;border: 1px solid white;";
    var body = `<div class='${classdiv}' id="hijasContent">`;
    body += `<table id='lstSeccionesFusionadas' class='table table-striped table-bordered'>
                <thead>
                <tr>
                    <th class="bg-header-table" style="${styleHeaders}">AÑO</th>
                    <th class="bg-header-table" style="${styleHeaders}">SEMESTRE</th>
                    <th class="bg-header-table" style="${styleHeaders}">SECCIÓN</th>
                    <th class="bg-header-table" style="${styleHeaders}">ID CURSO</th>
                    <th class="bg-header-table" style="${styleHeaders}">TURNO</th>
                    <th class="bg-header-table" style="${styleHeaders}">MODALIDAD</th>
                </tr>
                </thead>`;
    body += '<tbody>';
    seccionesHijas.forEach(function (item) {
        var session = getNameFromValue(item.academic_session);
        body += '<tr>';
        body += `<td ${attrs}><p>${item.sAnio}</p></td>`;
        body += `<td ${attrs}>${item.sSemestre}</td>`;
        body += `<td ${attrs}>${item.sSeccion}</td>`;
        body += `<td ${attrs}>${item.sIdCurso}</td>`;
        body += `<td ${attrs}>${session}</td>`;
        body += `<td ${attrs}>${item.modalidad}</td>`;
        body += '</tr>';
    })
    body += '</tbody>';
    body += '</table>';
    body += '</div>';
    return body;
}

function generateHTMLSeccionesHijasMobile(seccionesHijas) {
    var body = `<div class="sHijasMobile" style="overflow:auto">
                    <div class="row">`;

    seccionesHijas.forEach(function (item) {
        var session = getNameFromValue(item.academic_session)

        body += `<div class="col-12 mb-4">`;
        body += `<div class="card sHijas">`;
        body += `<div class="card-header" style="background: #207fe9;"></div>`;
        body += `<div class="card-body">`;

        body += `<h6>Año/Semestre: <strong>${item.sAnio}/${item.sSemestre}</strong> </h6>
                    <h6>Sección: <strong>${item.sSeccion}</strong> </h6>
                    <h6>Id Curso: <strong>${item.sIdCurso}</strong> </h6>
                    <h6>Id Turno: <strong>${session}</strong> </h6>
                    <h6>Modalidad: <strong>${item.modalidad}</strong> </h6>
                    `;
        body += `</div>`;
        body += `</div>`;
        body += `</div>`;
    })

    body +=     `</div>
            </div>`;
    return body;
}

function generate_ToggleSF(seccionesHijas) {
    //const px = window.innerWidth; //obtengo la cantidad de px para im
    var content = generateHTMLSeccionesHijasMobile(seccionesHijas);
    content += generateHTMLSeccionesHijas(seccionesHijas, "sHijasPC");


    var response = `
        <p>
          <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseSF" aria-expanded="false" aria-controls="collapseSF">
            Ver detalle S. fusionadas
          </button>
        </p>
        <div class="collapse" id="collapseSF">
          <div class="card card-body">
            ${content}
          </div>
        </div>
        `
    return response;
}

function generate_dynamic_ToggleSF(title, selector, content, class_vencimiento, plazoVencido) {
    var options = plazoVencido ? "shake_element fw-bold" : "";
    var header = plazoVencido ? `${title} - VENCIDO` : `${title} - A TIEMPO`;
    //title = plazoVencido ? `${title} - VENCIDO` : title;
    //console.log(header, plazoVencido)

    var response = `<p>
          <button class="btn bg-${class_vencimiento} ${options} text-white" type="button" data-toggle="collapse" data-target="#${selector}" aria-expanded="false" aria-controls="${selector}">
            ${header}
          </button>
        </p>
        <div class="collapse mb-2" id="${selector}">
          <div class="card card-body">
            ${content}
          </div>
        </div>`;
    return response;
}

//para validar fills vacios o nulos
function existeInputVacio(className, type, table) {
    var inputVacio = false;
    var table = $(table).DataTable();

    table.rows().every(function () {
        var data = this.data(); // Obtener los datos de la fila

        // Verificar si el campo está vacío, nulo o indefinido
        var valueInInput =
            type === "notas"
                ? (data && data.nota !== undefined ? data.nota : null)
                : type === "pf"
                    ? (data.promedios ? data.promedios.promedio_bd : null)
                    : null;
        //

        if (valueInInput === null
            //|| valueInInput === ''
            || valueInInput === undefined) {
            inputVacio = true; // Marcar que hay un valor vacío

            // Capturar el nodo de la fila y buscar el input correspondiente
            var inputElement = $('input', this.node()).filter(function () {
                //console.log($(this).hasClass(className))
                return $(this).hasClass(className); // Filtrar por clase si es necesario

            });

            // Aplicar un estilo al input vacío (añadir clase o foco)
            inputElement.addClass('input-error'); // Añade una clase de estilo
            // Remover la clase después de 2 segundos (2000 milisegundos)
            setTimeout(function () {
                inputElement.removeClass('input-error');
            }, 5000);

            return false; // Romper el bucle al encontrar el primer valor vacío
        }
    });

    return inputVacio;
}
function existeInputVacioCardsNF(inputName, contentContainer) {
    let isEmpty = false;

    // Recorre cada card en el contenedor de cards
    $(`${contentContainer} .mobile-card`).each(function () {
        let inputValue = $(this).find(`input[name="${inputName}"]`).val();

        // Si el valor del input está vacío, cambia isEmpty a true
        if (inputValue === "" || inputValue === undefined || inputValue === null) {
            isEmpty = true;
            return false; // Detiene el bucle si encuentra un input vacío
        }
    });

    return isEmpty;
}
function existeInputVacioCards(contentContainer, className, type) {
    var inputVacio = false;

    // Itera sobre cada tarjeta dentro del contenedor especificado
    $(contentContainer).find('.mobile-card').each(function () {
        // Identifica el campo de entrada de la nota basado en el tipo
        var notaInput = $(this).find(`input.${className}`);
        var valueInInput = notaInput.val();

        // Verificar si el valor del campo está vacío, nulo o indefinido
        if (valueInInput === null
            //|| valueInInput === ''
            || valueInInput === undefined) {
            inputVacio = true; // Marcar que hay un valor vacío

            // Añadir clase de estilo de error y removerla después de 5 segundos
            notaInput.addClass('input-error');
            setTimeout(function () {
                notaInput.removeClass('input-error');
            }, 5000);

            return false; // Detener el bucle en cuanto se encuentre un input vacío
        }
    });

    return inputVacio;
}

function existeSelectVacio(className, type, table) {
    var selectVacio = false;
    var table = $(table).DataTable();

    table.rows().every(function () {
        var data = this.data(); // Obtener los datos de la fila
        //console.log(data);

        // Verificar si el campo  está vacío, nulo o indefinido
        var valueInSelect =
            type === "attendance_status"
                ? (data && data.attendance_status !== undefined ? data.attendance_status : null)
                : type === "pf"
                    ? (data.promedios ? data.promedios.promedio_bd : null)
                    : null;
        //
        

        if (valueInSelect === null || valueInSelect === '' || valueInSelect === undefined
            //|| valueInSelect ==  "SELECCIONE..."
            ) {
            //console.log(valueInSelect);
            selectVacio = true; // Marcar que hay un valor vacío

            // Capturar el nodo de la fila y buscar el input correspondiente
            var inputElement = $('select', this.node()).filter(function () {
                //console.log($(this).hasClass(className))
                return $(this).hasClass(className); // Filtrar por clase si es necesario

            });

            // Aplicar un estilo al input vacío (añadir clase o foco)
            inputElement.addClass('input-error'); // Añade una clase de estilo
            // Remover la clase después de 2 segundos (2000 milisegundos)
            setTimeout(function () {
                inputElement.removeClass('input-error');
            }, 5000);

            return false; // Romper el bucle al encontrar el primer valor vacío
        }
    });

    return selectVacio;
}


//para requests en fullcalendar
function extractSectionAndCourseID(input,anio,semestre) {
    //console.log(typeof input);

    //const anio = $('#academic_year_txt').val();
    //const semestre = $('#academic_term_txt').val();

    // Expresión regular para capturar el ID del curso (antes de " - ")
    const courseIdMatch = input.match(/<br\/>(.*?) - /);
    const courseId = courseIdMatch ? courseIdMatch[1] : null;

    // Expresión regular para capturar la Sección (después de "Sección: " y antes de "<br/>Nota:")
    const sectionMatch = input.match(/Sección: (.*?)<br\/>Nota:/);
    const section = sectionMatch ? sectionMatch[1] : null;
    //console.log(anio, semestre, section, courseId);

    return {
        academic_year: anio,
        academic_term: semestre,
        section: section,
        event_id: courseId
    };
}

function searchSeccionesHijas(json, path_rq,date,esVistaPC) {
    /*
        
    */

    console.log(path_rq);
    try {
        var rq = new FormData();
        rq.append("academic_year", json.academic_year)
        rq.append("academic_term", json.academic_term)
        rq.append("section", json.section)
        rq.append("event_id", json.event_id)

        rq.append("dateStr", date)
        rq.append("esVistaPC", esVistaPC)

        $.ajax({
            url: path_rq,
            type: "POST",
            data: rq,
            processData: false,
            contentType:false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                //console.log(path_rq);
                let status = response.success;
                if (status) {
                    var rs = response.data
                    var len = rs.length;
                    if (len > 0) {

                        //console.log(rs);
                        var htmlSecciones = generateHTMLSeccionesHijasHorario(rs, "kdju38-333")
                        var mobile = generateHTMLSeccionesHijasMobile_m(rs);
                        var content = htmlSecciones + mobile;
                        api_result_alert_m("info", "Secciones fusionadas", content, mobile );
                        //api_result_alert("info", "Secciones fusionadas", htmlSecciones);
                        
                    }
                    else {
                        api_result_alert_m("info","", "Esta clase no cuenta con secciones fusionadas.","");
                        //api_result_alert("info", "Esta clase no cuenta con secciones fusionadas.", "");
                    }
                }
                else {
                    alerta_center();
                }
                
            },
            error: function (error) {
                alerta_center("error", "Ups", "Se ha producido un error en la consulta.");

            },
            complete: function () {
                hideModalLoader();
            }

        })
    }
    catch (error) {
        alerta_center("error", "Ups", "Se ha producido un error en la consulta.");
    }
}


function generateHTMLSeccionesHijasMobile_m(seccionesHijas) {
    var body = `<div class="sHijasMobile" style="overflow:auto">
                    <div class="row">`;

    seccionesHijas.forEach(function (item) {
        var session = getNameFromValue(item.academiC_SESSION)

        body += `<div class="col-12 mb-4">`;
        body += `<div class="card sHijas">`;
        body += `<div class="card-header" style="background: #207fe9;"></div>`;
        body += `<div class="card-body">`;

        body += `<h6>Año/Semestre: <strong>${item.academiC_YEAR}/${item.academiC_TERM}</strong> </h6>
                    <h6>Sección: <strong>${item.section}</strong> </h6>
                    <h6>Aula: <strong>${item.aula}</strong> </h6>
                    <h6>Id Curso: <strong>${item.evenT_ID}</strong> </h6>
                    <h6>Id Turno: <strong>${session}</strong> </h6>
                    <h6>Modalidad: <strong>${item.modalidad}</strong> </h6>
                    `;
        body += `</div>`;
        body += `</div>`;
        body += `</div>`;
    })

    body += `</div>
            </div>`;
    return body;
}
function generateHTMLSeccionesHijasHorario(seccionesHijas, classdiv) {

    console.log(seccionesHijas);

    var body = `<div class='${classdiv}' id="hijasContent">`;
    body += `<table id='lstSeccionesFusionadas' class='table table-striped table-bordered'>
                <thead>
                <tr>
                    <th class="bg-header-table" style="padding: 5px; color: white; margin: 10px;border: 1px solid white;">AÑO</th>
                    <th class="bg-header-table" style="padding: 5px; color: white; margin: 10px;border: 1px solid white;">SEMESTRE</th>
                    <th class="bg-header-table" style="padding: 5px; color: white; margin: 10px;border: 1px solid white;">SECCIÓN</th>
                    <th class="bg-header-table" style="padding: 5px; color: white; margin: 10px;border: 1px solid white;">AULA</th>
                    <th class="bg-header-table" style="padding: 5px; color: white; margin: 10px;border: 1px solid white;">ID CURSO</th>
                    <th class="bg-header-table" style="padding: 5px; color: white; margin: 10px;border: 1px solid white;">TURNO</th>
                    <th class="bg-header-table" style="padding: 5px; color: white; margin: 10px;border: 1px solid white;">MODALIDAD</th>
                </tr>
                </thead>`;
    body += '<tbody>';
    seccionesHijas.forEach(function (item) {
        var castSession = getNameFromValue(item.academiC_SESSION);
        //console.log(castSession)

        body += '<tr>';
        body += `<td>${item.academiC_YEAR}</td>`;
        body += `<td>${item.academiC_TERM}</td>`;
        body += `<td>${item.section}</td>`;
        body += `<td>${item.aula}</td>`;
        body += `<td>${item.evenT_ID}</td>`;
        body += `<td>${castSession}</td>`;
        body += `<td>${item.modalidad}</td>`;
        body += '</tr>';
    })
    body += '</tbody>';
    body += '</table>';
    body += '</div>';
    return body;
}

function searchDetailscardHorario(anio, semestre, section, event_id, path_ajx, date) {
    var request = {
        academic_year: anio,
        academic_term: semestre,
        section: section,
        event_id: event_id
    };
    var esVistaPC = 0;
    searchSeccionesHijas(request, path_ajx, date, esVistaPC);

}

///utilidades para delimitar los valores de nota desde 0 hasta 20
function limitGradePointsInteger() {

    selectoresNota_v.forEach(function (item) {
            $(item).on('input', function () {
            let valor = parseInt($(this).val(), 10); // Convertir el valor a un número entero

            // Validar si el valor es menor que 0 o mayor que 20
            if (isNaN(valor) || valor < 0) {
                valor = ''; // Si es menor que 0 o no es un número, establecer en 0
            } else if (valor > 20) {
                valor = '20'; // Si es mayor que 20, establecer en 20
            }

            $(this).val(valor); // Actualizar el valor del campo
        });
    })
}

function limitGradePoints() {
    selectoresNota_v.forEach(function (item) {
        $(item).on('input', function () {
            let valor = $(this).val(); // Obtener el valor actual como cadena

            // Validar que el valor sea un número válido o un punto parcial
            if (!/^\d*\.?\d*$/.test(valor)) {
                $(this).val(valor.slice(0, -1)); // Eliminar el último carácter inválido
                return;
            }

            // Permitir valores parciales como "10." o ".5"
            if (valor === '.' || valor === '') {
                return; // Permitir el punto inicial o un campo vacío
            }

            // Convertir el valor a número para validar rangos
            let valorNumerico = parseFloat(valor);

            // Validar si el valor es mayor que 20
            if (!isNaN(valorNumerico) && valorNumerico > 20) {
                $(this).val('20'); // Limitar al máximo permitido
            }
        });

        // Validar al perder el foco
        $(item).on('blur', function () {
            let valor = $(this).val(); // Obtener el valor actual como cadena

            // Convertir a número
            let valorNumerico = parseFloat(valor);

            // Si el valor es menor que 0, vacío o NaN, establecer en vacío
            if (isNaN(valorNumerico) || valorNumerico < 0) {
                $(this).val('');
            }
        });
    });
}



//speechs para info
function leyendaSecciones() {
    var html = `
        <div class="container text-center">
            <h3 class="text-muted mb-3">Esta leyenda describe los tipos de secciones disponibles:</h3>
        
            <!-- Sección Normal -->
            <div class="card border-0 mb-3">
                <button class="btn btn-outline-primary fw-bold">Sección Normal</button>
                <p class="text-muted small mt-2">Indica una sección que se desarrolla de manera estándar.</p>
            </div>

            <!-- Sección Fusionada -->
            <div class="card border-0 mb-3">
                <button class="btn btn-outline-info fw-bold">Sección Fusionada</button>
                <p class="text-muted small mt-2">Representa una sección que agrupa varias secciones "hijas".</p>
            </div>
        </div>
    `;

    info_alert("info", "", html);
}


//utilidades para manejar jsons
function encriptarBase64UTF8(texto) {
    let encoder = new TextEncoder(); // Crear un codificador para UTF-8
    let data = encoder.encode(texto); // Codificar la cadena en bytes UTF-8
    let base64String = btoa(String.fromCharCode(...data)); // Convertir los bytes a Base64
    return base64String;
}
function desencriptarBase64UTF8(base64String) {
    let binaryString = atob(base64String); // Decodificar la cadena Base64 a bytes
    let bytes = new Uint8Array([...binaryString].map(char => char.charCodeAt(0))); // Convertir cada carácter a su código UTF-8
    let decoder = new TextDecoder(); // Crear un decodificador para UTF-8
    let decodedText = decoder.decode(bytes); // Decodificar los bytes a texto
    return decodedText;
}


function getNameFromValue(text) {
    // Buscar el objeto en el diccionario que tenga el value igual al texto proporcionado
    const foundItem = dictionary.find(item => item.value === text);

    // Si se encuentra, devolver el name; si no, devolver el texto original
    return foundItem ? foundItem.name : text;
}

function inicializartooltip4() { //bootstrap 4
    //console.log("Inicializando tooltip")
    $('[data-toggle="tooltip"]').tooltip({
        html: true
    });
}
function inicializartooltip() {
    // Inicializa tooltips usando el API de Bootstrap 5
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl, {
            html: true
        });
    });
}


function destroyguidSessionStorage() {
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Recorrer todas las claves en sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        // Verificar si la clave coincide con el patrón de GUID
        if (guidPattern.test(key)) {
            sessionStorage.removeItem(key);
            console.warn(`Eliminado ${key}`);
        }
    }
}