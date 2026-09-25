var selectedFiles;
var DataURLFileReader = {
    read: function (file, callback) {
        var reader = new FileReader();
        var fileInfo = {
            name: file.name,
            type: file.type,
            fileContent: null,
            size: function () {
                var FileSize = 0;
                if (file.size > 1048576) {
                    FileSize = Math.round(file.size * 100 / 1048576) / 100 + " MB";
                }
                else if (file.size > 1024) {
                    FileSize = Math.round(file.size * 100 / 1024) / 100 + " KB";
                }
                else {
                    FileSize = file.size + " bytes";
                }
                return FileSize;
            }
        };
        reader.onload = function () {
            fileInfo.fileContent = reader.result;
            callback(null, fileInfo);
        };
        reader.onerror = function () {
            callback(reader.error, fileInfo);
        };
        reader.readAsDataURL(file);
    }
};

function multipleFiles_addMode() {
    $('.CreateLink').hide();
    Init_Multiple_Upload();
}

function Init_Multiple_Upload2() {
    $("#UploadedFiles").change(function (evt) {

        MultiplefileSelected(evt);

    });
    $("#FormMultipleUpload button[id=Cancel_btn]").click(function () {
        Cancel_btn_handler()
    });
    $('#FormMultipleUpload button[id=Submit_btn]').click(function () {
        var archivoexiste = $("#hdfcargado").val();
        if (archivoexiste == 0) {
            return;
        }
        else {
            UploadMultipleFiles2();
        }

    });    
}

function ajax_download(url, data) {
    var $iframe,
        iframe_doc,
        iframe_html;

    if (($iframe = $('#download_iframe')).length === 0) {
        $iframe = $("<iframe id='download_iframe'" +
            " style='display: none' src='about:blank'></iframe>"
        ).appendTo("body");
    }

    iframe_doc = $iframe[0].contentWindow || $iframe[0].contentDocument;
    if (iframe_doc.document) {
        iframe_doc = iframe_doc.document;
    }

    iframe_html = "<html><head></head><body><form method='POST' action='" +
        url + "'>"

    Object.keys(data).forEach(function (key) {
        iframe_html += "<input type='hidden' name='" + key + "' value='" + data[key] + "'>";

    });

    iframe_html += "</form></body></html>";
    try {
        iframe_doc.open();
        iframe_doc.write(iframe_html);
        $(iframe_doc).find('form').submit();
    }
    catch (e) {
        alert("No se encontró la ruta del documento seleccionado.");
    }
}
function MultiplefileSelected(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var maxsize = parseInt($("#MaxSize").val(), 10);
    $("#hdfcargado").val("1");
    $('#drop_zone').removeClass('hover');
    selectedFiles = evt.target.files || evt.dataTransfer.files;
    if (selectedFiles) {
        $('#Files').empty();
        for (var i = 0; i < selectedFiles.length; i++) {
            if (selectedFiles[i].size <= maxsize) {
                DataURLFileReader.read(selectedFiles[i], function (err, fileInfo) {
                    if (err != null) {
                        var RowInfo = '<div id="File_' + i + '" class="info"><div class="InfoContainer">' +
                            '<div class="Error">' + err + '</div>' +
                            '<div data-name="FileName" class="info">' + fileInfo.name + '</div>' +
                            '<div data-size="FileSize" class="info">' + fileInfo.size() + '</div></div><hr/></div>';
                        $('#Files').append(RowInfo);
                    }
                    else {
                        var image = '<img src="' + fileInfo.fileContent + '" class="thumb" title="' + fileInfo.name + '" />';
                        var RowInfo = '<div id="File_' + i + '" class="info"><div class="InfoContainer">' +
                            '<div data-name="FileName" class="info">' + fileInfo.name + '</div>' +
                            '<div data-size="FileSize" class="info">' + fileInfo.size() + '</div></div><hr/></div>';
                        $('#Files').append(RowInfo);
                    }
                });
            }
            else {
                var mensaje = 'El archivo ' + selectedFiles[i].name + ' supera el limite permitido.';
                alert(mensaje);
            }

        }
    }
}


function UploadMultipleFiles2() {
    var ParamUrl = $("#IdCargarArchivos").val();

    // here we will create FormData manually to prevent sending mon image files 
    var dataString = new FormData();
    var titulo = $("#txtnombre").val();
    var programa = $("#SlcPrograma").val();

    if (titulo == null || titulo == "") {
        $("#Div_MensajeError").html("Por favor ingrese el titulo a mostrar.");
        $('#ModalErrorCampos').modal('show');
    }
    else if (programa == null || programa == "") {
        $("#Div_MensajeError").html("Por favor seleccione un programa.");
        $('#ModalErrorCampos').modal('show');
    }
    else {
        if (selectedFiles.length > 0) {
            for (var i = 0; i < selectedFiles.length; i++) {

                dataString.append("uploadedFiles", selectedFiles[i]);
            }
            dataString.append("titulo", titulo);
            dataString.append("programa", programa);

            showAjaxLoading();

            $.ajax({
                url: ParamUrl,  //Server script to process data
                type: 'POST',
                xhr: function () {  // Custom XMLHttpRequest
                    var myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) { // Check if upload property exists
                        myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // For handling the progress of the upload
                    }
                    return myXhr;
                },
                // Form data
                data: dataString,
                //Ajax events
                success: function (data) {
                    CargarConsolidadoDocumentosCargados();
                    stopAjaxLoading();
                    $('#Div_Resultado').html(data);
                    $("#hdfcargado").val("0");

                },
                error: errorHandler,
                complete: completeHandler,


                //Options to tell jQuery not to process data or worry about content-type.
                cache: false,
                contentType: false,
                processData: false,
            });
        }
    }    
}

// Drag and Drop Events
function handleDragOver(evt) {
    evt.preventDefault();
    evt.dataTransfer.effectAllowed = 'copy';
    evt.dataTransfer.dropEffect = 'copy';
}

function dragenterHandler() {
    //$('#drop_zone').removeClass('drop_zone');
    $('#drop_zone').addClass('hover');
}

function dragleaveHandler() {
    $('#drop_zone').removeClass('hover');
}

function progressHandlingFunction(e) {
    if (e.lengthComputable) {
        var percentComplete = Math.round(e.loaded * 100 / e.total);
        $("#FileProgress").css("width", percentComplete + '%').attr('aria-valuenow', percentComplete);
        $('#FileProgress span').text(percentComplete + "%");
    }
    else {
        $('#FileProgress span').text('Np se pudo calcular');
    }
}

function completeHandler() {
    $('#createView').empty();
    //$('.CreateLink').show();
    //$.unblockUI();
}


function successHandler(data) {
    $('#Files div').empty();
    $('#Cargados').html('');
}

function errorHandler(xhr, ajaxOptions, thrownError) {
    alert("Ocurrió un error cuando se intentaba cargar el archivo. (" + thrownError + ")" + xhr);
}

function OnDeleteAttachmentSuccess(data) {

    if (data.ID && data.ID != "") {
        $('#Attachment_' + data.ID).fadeOut('slow');
    }
    else {
        alter("No se pudo eliminar");
        console.log(data.message);
    }
}

function Cancel_btn_handler() {
    $('#createView').empty();
    $('.CreateLink').show();
    $.unblockUI();
}