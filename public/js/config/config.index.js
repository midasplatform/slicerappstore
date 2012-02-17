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
    "use scrict";
    try {
        var jsonResponse = jQuery.parseJSON(responseText);
    } catch (e) {
        alert("An error occured. Please check the logs.");
        return;
    }
    if(jsonResponse==null) {
        createNotive('Error',4000);
        return;
    } else if(jsonResponse[0]) {
        createNotive(jsonResponse[1],4000);
    } else {
        createNotive(jsonResponse[1],4000);
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
