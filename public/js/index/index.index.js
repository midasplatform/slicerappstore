var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};

var json = null;

/**
 * Called when a user clicks to view the extension page
 */
midas.slicerappstore.extensionClick = function() {
  console.log('open extension ' + $(this).attr('element'));
}

/**
 * Called when a user clicks the download or install button
 */
midas.slicerappstore.downloadClick = function() {
  console.log('download ' + $(this).attr('element'));
}

/**
 * Render the extension result in the result list area
 * @param extension Json-ified slicerpackages_extension dao
 */
midas.slicerappstore.renderExtension = function(extension) {
    var extDiv = $('#extensionTemplate').clone();
    var buttonText = json.slicerView ? 'Install' : 'Download';
    extDiv.attr('element', extension.slicerpackages_extension_id);
    extDiv.find('a.extensionName').html(extension.productname)
      .attr('qtip', extension.productname)
      .attr('element', extension.slicerpackages_extension_id)
      .qtip({
          content: {
              attr: 'qtip'
          }
      })
      .click(midas.slicerappstore.extensionClick);
    extDiv.find('span.subtitle').html(extension.subtitle);
    extDiv.find('img.extensionIcon').attr('src', extension.icon)
      .attr('element', extension.slicerpackages_extension_id)
      .click(midas.slicerappstore.extensionClick);
    extDiv.find('input.downloadButton').val(buttonText)
      .attr('element', extension.slicerpackages_extension_id)
      .click(midas.slicerappstore.downloadClick);

    var average = Math.round(extension.ratings.average * 100) / 100;
    var starSelect = Math.round(average * 2) - 1;
    $('#ratingsAverage').stars('selectID', starSelect);
    extDiv.find('div.extensionRatings').stars({
        disabled: true,
        split: 2
    }).stars('selectID', starSelect);
    extDiv.find('span.averageRating').html(average);

    extDiv.appendTo('#extensionsContainer');
    extDiv.show();
}

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
            midas.slicerappstore.renderExtension(this);
        });
    });
}

$(document).ready(function() {
    json = $.parseJSON($('#jsonContent').html());
    midas.slicerappstore.getExtensions();
});