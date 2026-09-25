/**
 * DataTables internal date sorting replies on `Date.parse()` which is part of 
 * the Javascript language, but you may wish to sort on dates which is doesn't 
 * recognise. The following is a plug-in for sorting dates in the format 
 * `dd/mm/yy`.
 * 
 * An automatic type detection plug-in is available for this sorting plug-in.
 *
 * Please note that this plug-in is **deprecated*. The
 * [datetime](//datatables.net/blog/2014-12-18) plug-in provides enhanced
 * functionality and flexibility.
 *
 *  @name Date (dd/mm/YY)
 *  @summary Sort dates in the format `dd/mm/YY`
 *  @author Andy McMaster
 *  @deprecated
 *
 *  @example
 *    $('#example').dataTable( {
 *       columnDefs: [
 *         { type: 'date-uk', targets: 0 }
 *       ]
 *    } );
 */

jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "date-uk-pre": function (a) {
        if (a == null || a === "") {
            return 0;
        }
        var ukDatea = a.split('/');
        var day = parseInt(ukDatea[0], 10);
        var month = parseInt(ukDatea[1], 10) - 1; // Restar 1 al mes para que esté en el rango 0-11
        var year = parseInt(ukDatea[2], 10);
        return new Date(year, month, day).getTime();
    },

    "date-uk-asc": function (a, b) {
        return a - b;
    },

    "date-uk-desc": function (a, b) {
        return b - a;
    }
});


