var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};

/**
 * Called when a user clicks the extension button (download, install or uninstall)
 */
midas.slicerappstore.extensionButtonClick = function() {
    var extensionId = $(this).attr('element');
    if(!window.extensions_manager_model || $(this).hasClass('extensionDownloadButton')) {
        var url = json.global.webroot+'/slicerappstore/index/downloadextension?extensionId='+extensionId;
        window.location.assign(url);
    } else if($(this).hasClass('extensionInstallButton')) {
        window.extensions_manager_model.downloadAndInstallExtension(extensionId);
    } else if($(this).hasClass('extensionUninstallButton')) {
        window.extensions_manager_model.uninstallExtension($(this).attr('extensionname'));
    }
}

/**
 * Update extension button state considering 'window.extensions_manager_model'
 * @param extensionName Name of the extension associated with the button to update
 */
midas.slicerappstore.updateExtensionButtonState = function(extensionName) {
    if(!window.extensions_manager_model) {
        midas.slicerappstore.setExtensionButtonState(extensionName, 'download');
    } else {
        var buttonState = 'install';
        if(window.extensions_manager_model.isExtensionInstalled(extensionName)) {
          buttonState = 'uninstall';
        }
        midas.slicerappstore.setExtensionButtonState(extensionName, buttonState);
    }
}

/**
 * Set extension button state
 * @param extensionName Name of the extension associated with the button to update
 * @param buttonState Either 'download', 'install' or 'uninstall'
 */
midas.slicerappstore.setExtensionButtonState = function(extensionName, buttonState) {
    if (buttonState != 'download' && buttonState != 'install' && buttonState != 'uninstall') {
        alert('Unknown buttonState:' + buttonState);
    }
    var buttonText = buttonState.charAt(0).toUpperCase() + buttonState.slice(1);
    var buttonClass = 'extension' + buttonText + 'Button';
    $('input[extensionname="' + extensionName + '"]').val(buttonText)
      .removeClass('extensionDownloadButton extensionInstallButton extensionUninstallButton')
      .addClass(buttonClass)
      .unbind('click').click(midas.slicerappstore.extensionButtonClick);
}
