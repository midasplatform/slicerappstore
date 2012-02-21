var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};

midas.slicerappstore.renderCategory = function(category) {
    var currToken = '';
    var categories = category.split('.');
    $.each(categories, function(k, token) {
        currToken += token;
        var html = ' &gt; ';
        html += '<a class="breadcrumbLink" href="'+json.global.webroot+'/slicerappstore?category='+currToken;
        if(json.slicerView) {
            html += '&slicerView';
        }
        html += '">';
        html += token+'</a>';
        currToken += '.';
        $('#categoryBreadcrumb').append(html);
    });
}

var json = null;

$(document).ready(function() {
    json = $.parseJSON($('#jsonContent').html());
    midas.slicerappstore.renderCategory(json.extension.category);

    if(json.slicerView) {
        createNotice = function() {}; //dummy function definition to prevent exceptions
    }

    $('#commentsDiv h4').remove();
    $('#ratingsDiv h4').remove();
    $('#ratingsUser').appendTo('#ratingsDiv');

    $('.googlePlus,.twitter,.facebook').qtip({
        content: {
            attr: 'qtip'
        },
        position: {
            at: 'bottom right',
            my: 'top left',
            viewport: $(window),
            effect: true
        }
    });
});