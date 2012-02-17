midas.registerCallback('CALLBACK_RATINGS_BEFORE_LOAD', 'ratings', function() {
    $('#ratingsDiv h4').remove();
    $('#ratingsUser').remove(); //hide for now until we can put it somewhere better
});

var json = null;

$(document).ready(function() {
    json = $.parseJSON($('#jsonContent').html());

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