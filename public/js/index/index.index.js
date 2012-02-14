var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};

var json = null;

/**
 * Based on the filter parameters, return a page of extension results
 */
midas.slicerappstore.getExtensions = function() {
    $.post(json.webroot+'/slicerappstore/index/listextensions', {
    }, function(data) {
        $('.loadingExtensions').hide();
        var resp = $.parseJSON(data);
        $('#extensionsContainer').html('');
        $.each(resp, function() {
            var extension = $('#extensionTemplate').clone();
            extension.attr('id', 'extension_'+this.slicerpackages_extension_id);
            extension.appendTo('#extensionsContainer');
            extension.show();
        });
    });
}

$(document).ready(function() {
    json = $.parseJSON($('#jsonContent').html());
    midas.slicerappstore.getExtensions();
});