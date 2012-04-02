/**
 * No assumptions
 */
var $ = $ || {};
var document = document || {};

/**
 * Namespacing
 */
var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};
midas.slicerappstore.config = midas.slicerappstore.config || {};

/**
 * Validation function for the config form
 */
midas.slicerappstore.config.validateConfig = function(formData, jqForm, options) {
};

midas.slicerappstore.config.successConfig = function(responseText, statusText, xhr, form) {
    "use strict";
    try {
        var jsonResponse = jQuery.parseJSON(responseText);
    } catch (e) {
        midas.createNotice("An error occured. Please check the logs.", 4000, 'error');
        return;
    }
    if(jsonResponse == null) {
        midas.createNotice('Error', 4000, 'error');
        return;
    } else if(jsonResponse[0]) {
        midas.createNotice(jsonResponse[1], 4000);
    } else {
        midas.createNotice(jsonResponse[1], 4000, 'error');
    }
};

midas.slicerappstore.config.ready = function () {
    "use strict";
    $('#configForm').ajaxForm({
        beforeSubmit: midas.slicerappstore.config.validateConfig,
        success: midas.slicerappstore.config.successConfig 
    });
};

$(document).ready(midas.slicerappstore.config.ready);
