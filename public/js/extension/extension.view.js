var json = null;

$(document).ready(function() {
    json = $.parseJSON($('#jsonContent').html());

    $('#commentsDiv h4').remove();
    $('#ratingsDiv h4').remove();
    $('#ratingsUser').remove(); //hide for now until we can put it somewhere better

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