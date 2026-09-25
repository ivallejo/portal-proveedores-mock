const Mobile = {
    generarCard: (data, currentPage, cardContent) => {
        let maxVisibleButtons = 5;
        let start = (currentPage - 1) * 10;
        let end = start + 10;
        let pageData = data.slice(start, end); // Obtener los datos de la página actual
        let totalPages = Math.ceil(data.length / 10);
        cardContent(pageData);
        let divPaginacion = $("#paginationCard");
        divPaginacion.html(''); // Limpiar el contenedor de la paginación
        let startPage = Math.max(currentPage - Math.floor(maxVisibleButtons / 2), 1);
        let endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);
        // Ajustar los botones visibles cuando estás al inicio o al final
        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
        }
        // Botón "Anterior"
        divPaginacion.append(`<li class="paginate_button page-item previous ${currentPage > 1 ? "" : "disabled"}"><a href="#" class="prev-page page-link"><i class="fas fa-chevron-left"></i></a></li>`);
        // Botones de número de página
        for (let i = startPage; i <= endPage; i++) {
            let pageLink = `<li class="paginate_button page-item ${i === currentPage ? 'active' : ''}"><a href="#" class="page-link" data-page="${i}">${i}</a></li>`;
            divPaginacion.append(pageLink);
        }
        // Botón "Siguiente"
        divPaginacion.append(`<li class="paginate_button page-item previous ${currentPage < totalPages ? "" : "disabled"}"><a href="#" class="next-page page-link"><i class="fas fa-chevron-right"></i></a></li>`);
        divPaginacion.unbind().on("click", ".page-link", (e) => {
            e.preventDefault();
            let nextPage = 0;
            if ($(e.currentTarget).hasClass('prev-page')) {
                nextPage = Math.max(currentPage - 1, 1);
            } else if ($(e.currentTarget).hasClass('next-page')) {
                nextPage = Math.min(currentPage + 1, totalPages);
            } else {
                nextPage = $(e.currentTarget).data('page');
            }
            Mobile.generarCard(data, nextPage, cardContent);
        });
    }
};