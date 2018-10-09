var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};
'use strict';

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
    } else if($(this).hasClass('extensionCancelScheduledForUninstallButton')) {
        window.extensions_manager_model.cancelExtensionScheduledForUninstall($(this).attr('extensionname'));
    } else if($(this).hasClass('extensionScheduleUninstallButton')) {
        window.extensions_manager_model.scheduleExtensionForUninstall($(this).attr('extensionname'));
    }
}

/**
 * Update extension button state considering 'window.extensions_manager_model'
 * @param extensionName Name of the extension associated with the button to update
 */
midas.slicerappstore.updateExtensionButtonState = function(extensionName) {
    if(!window.extensions_manager_model) {
        midas.slicerappstore.setExtensionButtonState(extensionName, 'Download');
    } else {
        var buttonState = 'Install';
        if(window.extensions_manager_model.isExtensionScheduledForUninstall(extensionName)) {
          buttonState = 'CancelScheduledForUninstall';
        } else if(window.extensions_manager_model.isExtensionInstalled(extensionName)) {
          buttonState = 'ScheduleUninstall';
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
    if (buttonState != 'Download'
        && buttonState != 'Install'
        && buttonState != 'CancelScheduledForUninstall'
        && buttonState != 'ScheduleUninstall') {
        alert('Unknown buttonState:' + buttonState);
    }
    var buttonText = buttonState;
    if(buttonState == 'ScheduleUninstall') {
      buttonText = 'Uninstall';
    } else if(buttonState == 'CancelScheduledForUninstall') {
      buttonText = 'Uninstall';
    }

    var buttonClass = 'extension' + buttonState + 'Button';
    $('input[extensionname="' + extensionName + '"]').val(buttonText)
      .removeClass('extensionDownloadButton extensionInstallButton extensionCancelScheduledForUninstallButton extensionScheduleUninstallButton')
      .addClass(buttonClass)
      .unbind('click').click(midas.slicerappstore.extensionButtonClick);
}

midas.slicerappstore.isPageHidden = function(){
  return document.hidden || document.msHidden || document.webkitHidden;
}
