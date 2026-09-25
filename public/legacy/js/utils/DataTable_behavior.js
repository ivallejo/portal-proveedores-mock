//funciones que me permiten alterar el comportamiento por defecto de DataTable


//funcion para evitar que el [DATATABLE RESPONSIVE] reestablezca
//cualquier valor insertado en un input
function preventChangeDefaultValue(target, inputclass, columnKey) {
    //previene la reversion de cambios utilizando ahora propiedades anidadas de un object
    //console.info(`Restricción agregada para: ${target}/${inputclass}, actualizando columna: ${columnKey}`);

    var table = $(target).DataTable();
    

    // Evento que se dispara cuando cambias el valor en el input
    $(target).on('change', `.${inputclass}`, function () {
        var $this = $(this); // Guardar referencia al input

        // Verificar si estamos en modo responsive (fila `tr.child`)
        var row = $this.closest('tr.child').prev('tr'); // Buscar la fila anterior si estamos en un `tr.child`
        
        if (row.length === 0) {
            // Si no estamos en una fila `tr.child`, obtener la fila normal
            row = $this.closest('tr');
        }
        var currentPage = table.page();
        //var newNota = validarNota($this.val()); // Obtener el nuevo valor ingresado
        var newNota = $this.val(); // Obtener el nuevo valor ingresado

        //console.log(`Nuevo valor ingresado para ${columnKey}:`, newNota);

        // Obtener los datos de la fila correspondiente
        var rowData = table.row(row).data();
        var people_code_id = rowData.people_code_id;
        //console.log('Datos originales de la fila:', rowData);

        // Acceder y actualizar la propiedad anidada usando columnKey
        updateNestedProperty(rowData, columnKey, newNota);

        // Actualizar los datos en DataTables
        table.row(row).data(rowData).draw();
        table.page(currentPage).draw(false);

        //actualizar el valor en el equivalente responsive
        updateValueInCardResponsive(people_code_id, newNota)
        //console.log(`Fila actualizada con el nuevo valor de ${columnKey}:`, rowData);
    });

    function updateValueInCardResponsive(people_code_id, newValue) { //funcion para modificar los cards cuando se modifica los selects
        // Encuentra la tarjeta que contiene el span con el people_code_id especificado
        const targetCard = $('.mobile-card').filter(function () {
            return $(this).find('.people_code_id').text().trim() === people_code_id;
        });

        // Si se encuentra la tarjeta, actualiza el valor del input y dispara el evento change
        if (targetCard.length > 0) {
            const notaInput = targetCard.find('input.nota');
            notaInput.val(newValue).trigger('change');
        }
    }
}

//lo mismo pero para un select
function preventChangeDefaultValue_Select(target, inputclass, columnKey) {
    // Previene la reversión de cambios utilizando ahora propiedades anidadas de un objeto
    console.info(`Restricción agregada para: ${target}/${inputclass}, actualizando columna: ${columnKey}`);

    var table = $(target).DataTable();

    $(target).off('change');
    // Evento que se dispara cuando cambias el valor en el input o el select
    $(target).on('change', `.${inputclass}`, function () {
        var $this = $(this); // Guardar referencia al elemento
        var currentPage = table.page();

        // Verificar si estamos en modo responsive (fila `tr.child`)
        var row = $this.closest('tr.child').prev('tr'); // Buscar la fila anterior si estamos en un `tr.child`
        if (row.length === 0) {
            // Si no estamos en una fila `tr.child`, obtener la fila normal
            row = $this.closest('tr');
        }

        var newNota;

        // Detecta si el elemento es un select o un input
        if ($this.is('select')) {
            newNota = $this.find('option:selected').val(); // Obtener el valor seleccionado en el select
        } else {
            newNota = $this.val(); // Obtener el nuevo valor ingresado en el input
        }

        //console.log(`Nuevo valor ingresado para ${columnKey}:`, newNota);

        // Obtener los datos de la fila correspondiente
        var rowData = table.row(row).data();

        //console.log(rowData, columnKey, newNota);

        // Acceder y actualizar la propiedad anidada usando columnKey
        updateNestedProperty(rowData, columnKey, newNota);

        
        // Actualizar los datos en DataTables
        table.row(row).data(rowData).draw();
        table.page(currentPage).draw(false);
        //console.log(`Fila actualizada con el nuevo valor de ${columnKey}:`, rowData);
    });
}


// Función auxiliar para actualizar propiedades anidadas
function updateNestedProperty(obj, path, value) {
    //console.log(path, value);
    try {
        var keys = path.split('.');
        var lastKey = keys.pop();
        var nestedObj = obj;

        keys.forEach(function (key) {
            if (!nestedObj[key]) {
                nestedObj[key] = {}; // Crear el objeto si no existe
            }
            nestedObj = nestedObj[key];
        });

        nestedObj[lastKey] = value; // Asignar el valor
    }
    catch (error) {
        alerta_center("error", "", error.message)
        console.error(error);
    }
}

//

function validarNota(nota) {
    // Eliminar todo lo que no sea un número (incluyendo 'e', '.' y cualquier otro símbolo)
    if (!/^\d+$/.test(nota)) {
        return ''; // Devolver cadena vacía si no es un número válido
    }

    // Convertir el valor a número entero
    var valorNota = parseInt(nota, 10);

    // Verificar los límites
    if (valorNota > 20) {
        return 20; // Limitar a 20
    } else if (valorNota < 0) {
        return 0; // Limitar a 0
    }

    // Si está dentro del rango, devolver el valor original
    return valorNota;

    //return true;
}

function delimitarNotas(inputclass) {
    document.querySelectorAll(`.${inputclass}`).forEach(function (input) {
        // Evento para restringir la entrada en tiempo real
        input.addEventListener('input', function () {
            // Eliminar cualquier cosa que no sea un número
            let cleanedValue = this.value.replace(/[^0-9]/g, '');

            // Si el campo está vacío, permitimos que se mantenga así
            if (cleanedValue === '') {
                this.value = '';
                return;
            }

            // Convertir el valor a un número
            let numberValue = parseInt(cleanedValue);

            // Limitar el valor a 20 si es mayor que 20
            if (numberValue > 20) {
                this.value = 20;
            } else {
                // Si está en el rango permitido, lo dejamos tal cual
                this.value = numberValue;
            }
        });

        // Validación adicional cuando se pierde el foco (blur)
        input.addEventListener('blur', function () {
            let numberValue = parseInt(this.value);

            // Si el valor es menor que 0 o está vacío, lo limpiamos
            if (numberValue < 0 || isNaN(numberValue)) {
                this.value = ''; // O puedes establecer un valor predeterminado como 0
            }
        });
    });
}

function delimitarNotasX(inputclass) {
    document.querySelectorAll(`.${inputclass}`).forEach(function (input) {
        input.addEventListener('input', function () {
            let value = parseInt(this.value);

            if (value < 0) {
                this.value = 0;
            } else if (value > 20) {
                this.value = 20;
            }
        });
    });

}

//custom values datatable
function dt_generalComponents() {
   

    //length
    $('.dataTables_length').addClass('mt-2');
    $('.dataTables_length select').addClass('form-control');
    $('.dataTables_length label').addClass('fw-bold');

    //filtro
    $('.dataTables_filter input').addClass('form-control custom-input rounded-pill text-center mb-3 shake_element');
    $('.dataTables_filter label').contents().filter(function () {
        return this.nodeType === 3; // Selecciona nodos de texto
    }).remove();
    $('.dataTables_filter input').attr('placeholder', 'Buscar registros...');

  
    var attr = "rounded-circle bg-primary text-white";
    $('.dataTables_paginate .previous').html('<i class="fas fa-arrow-left text-white"></i>').addClass(attr); // Flecha izquierda
    $('.dataTables_paginate .next').html('<i class="fas fa-arrow-right text-white"></i>').addClass(attr);

}

function applicateCustomDt(target) {
    var table = $(target).DataTable();
    table.on('draw', function () {
        dt_generalComponents(); // Reaplica los estilos personalizados
    });
}