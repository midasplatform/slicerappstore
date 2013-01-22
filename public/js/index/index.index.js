var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};
midas.slicerappstore.totalResults = -1;
midas.slicerappstore.pageOffset = 0;

/**
 * Called when a user clicks to view the extension page
 */
midas.slicerappstore.extensionClick = function() {
  var url = json.global.webroot+'/slicerappstore/extension/view?extensionId='+$(this).attr('element')+'&layout='+json.layout;
  window.location.assign(url);
}

/**
 * Render the extension result in the result list area
 * @param extension Json-ified slicerpackages_extension dao
 */
midas.slicerappstore.renderExtension = function(extension, index) {
    var extensionName = extension.productname;
    var extDiv = $('#extensionTemplate').clone()
      .attr('id', 'extensionWrapper_'+extension.slicerpackages_extension_id);
    extDiv.attr('element', extension.slicerpackages_extension_id)
    .attr('extensionname', extensionName);
    extDiv.find('a.extensionName').html(extensionName)
      .attr('qtip', extensionName)
      .attr('element', extension.slicerpackages_extension_id)
      .qtip({
          content: {
              attr: 'qtip'
          },
          position: {
              at: 'bottom left',
              my: 'top left',
              viewport: $(window),
              effect: true
          }
      })
      .click(midas.slicerappstore.extensionClick);
    extDiv.find('span.subtitle').html(extension.subtitle);
    extDiv.find('img.extensionIcon').attr('src', extension.icon)
      .attr('element', extension.slicerpackages_extension_id)
      .attr('extensionname', extensionName)
      .click(midas.slicerappstore.extensionClick);
    extDiv.find('input.extensionActionButton')
      .attr('element', extension.slicerpackages_extension_id)
      .attr('extensionname', extensionName);

    var average = Math.round(extension.ratings.average * 100) / 100;
    var starSelect = Math.round(average * 2);
    extDiv.find('div.extensionRatings').find('input[value="'+starSelect+'"]').attr('checked', 'checked');
    extDiv.find('div.extensionRatings').attr('id', 'rating_'+extension.slicerpackages_extension_id)
      .stars({
          disabled: true,
          split: 2
      });
    extDiv.find('span.totalVotes').html('('+extension.ratings.total+')');

    extDiv.appendTo('#extensionsContainer');

    midas.slicerappstore.updateExtensionButtonState(extensionName);

    extDiv.fadeIn(200 * index);
}

/**
 * Reset variables, clear 'extensionsContainer' and show loading image.
 */
midas.slicerappstore.resetFilter = function(){
  midas.slicerappstore.totalResults = -1;
  midas.slicerappstore.pageOffset = 0;
  $('.paginationMessage').hide();
  $('.loadingExtensions').show();
  $('#extensionsContainer').html('');
}

/**
 * Compute number of items to fetch based on available width and height.
 * If no items have been fetched, number of items filling the available space plus an
 * extra row will be returned.
 * If items have already been fetched, number of items filling one row will be returned.
 */
midas.slicerappstore.pageLimit = function(){
    itemWidth = $('#extensionTemplate').outerWidth(true);
    itemHeight = $('#extensionTemplate').outerHeight(true);
    horizontalCount = Math.floor($('#extensionsContainer').width() / itemWidth);
    verticalCount = Math.floor(($(window).height() - $('.extensionsHeader').height()) / itemHeight);
    pageLimit = 0;
    if (midas.slicerappstore.totalResults == -1){
        pageLimit = horizontalCount * (verticalCount +1);
    }
    else {
        pageLimit = horizontalCount;
    }
    return pageLimit;
}

/**
 * Based on the filter parameters, return a page of extension results
 */
midas.slicerappstore.applyFilter = function() {
    midas.slicerappstore.resetFilter();
    $('#extensionsContainer').startScrollPagination();
}

/**
 * Render the category tree based on tokens separated by . character
 */
midas.slicerappstore.showCategory = function(category) {
    var tokens = category.split('.');
    var lastToken = '';
    var name = '';
    $.each(tokens, function(k, token) {
        var tokenId = token.replace(/ /g, '_');
        var parentId = lastToken == '' ? 'categoriesList' : 'category_'+lastToken;

        name += token;
        if(lastToken != '') { //subcategory
            lastToken += '_';
            var id = 'category_'+lastToken+tokenId;
            if($('#'+id).length == 0) {
                var html = '<li class="categoryControl" name="'+name+'" id="'+id+'">'+token+'</li>';
                html = '<ul class="categoriesSubList">'+html+'</ul>';
                var el = $('#'+parentId);
                while(el.next().length > 0) {
                    el = el.next(); //insert as last child
                }
                el.after(html);
            }
        } else { //top level category
            var id = 'category_'+tokenId;
            if($('#'+id).length == 0) {
                var html = '<li class="categoryControl" name="'+name+'" id="'+id+'">'+token+'</li>';
                $('#'+parentId).append(html);
            }
        }
        lastToken += tokenId;
        name += '.';
    });
}

$(document).ready(function() {

    midas.slicerappstore.os = json.os;
    midas.slicerappstore.arch = json.arch;
    midas.slicerappstore.release = json.release;
    midas.slicerappstore.revision = json.revision;
    midas.slicerappstore.category = json.category;

    $('#osSelect').val(json.os);
    $('#archSelect').val(json.arch);
    $('#releaseSelect').val(json.release);
    // TODO revision?

    if(json.layout != 'empty' ) {
        midas.slicerappstore.os = $('#osSelect').val();
        midas.slicerappstore.arch = $('#archSelect').val();
        midas.slicerappstore.release = $('#releaseSelect').val();

        // Enable filtering by OS
        $('#osSelect').change(function() {
            midas.slicerappstore.os = $(this).val();
            midas.slicerappstore.applyFilter();
        });

        // Enable filtering by architecture
        $('#archSelect').change(function() {
            midas.slicerappstore.arch = $(this).val();
            midas.slicerappstore.applyFilter();
        });

        // Enable filtering by release
        $('#releaseSelect').change(function() {
            midas.slicerappstore.release = $(this).val();
            midas.slicerappstore.applyFilter();
        });
    }

    // Render the category tree based on all available categories
    $.each(json.categories, function(k, category) {
        midas.slicerappstore.showCategory(category);
    });

    // Enable the "All" category filter
    midas.slicerappstore.selectedCategory = $('li#categoryAll').click(function() {
        midas.slicerappstore.category = '';
        midas.slicerappstore.selectedCategory.removeClass('selectedCategory');
        midas.slicerappstore.selectedCategory = $(this);
        $(this).addClass('selectedCategory');
        midas.slicerappstore.applyFilter();
    });

    // Enable filtering by specific categories
    $('li.categoryControl').click(function() {
        console.log("Enable filtering by specific categories");
        midas.slicerappstore.category = $(this).attr('name');
        midas.slicerappstore.selectedCategory.removeClass('selectedCategory');
        midas.slicerappstore.selectedCategory = $(this);
        $(this).addClass('selectedCategory');
        midas.slicerappstore.applyFilter();
    });

    var selector = midas.slicerappstore.category == '' ?
        'li#categoryAll' :
        'li.categoryControl[name="'+midas.slicerappstore.category+'"]';
    midas.slicerappstore.selectedCategory = $(selector).addClass('selectedCategory');

    // Setup scroll pagination and fetch results based on the initial settings
    midas.slicerappstore.resetFilter();
    $('#extensionsContainer').scrollPagination({
      'contentPage': json.global.webroot+'/slicerappstore/index/listextensions',
      'contentData': function(){
          pageLimit = midas.slicerappstore.pageLimit();
          contentData = {
            category: midas.slicerappstore.category,
            os: midas.slicerappstore.os,
            arch: midas.slicerappstore.arch,
            release: midas.slicerappstore.release,
            revision: midas.slicerappstore.revision,
            limit: pageLimit,
            offset: midas.slicerappstore.pageOffset
          };
          midas.slicerappstore.pageOffset += pageLimit;
          // Stop fetch on scroll if "not the first query" and "all items have been fetched"
          if (midas.slicerappstore.totalResults != -1 &&
              midas.slicerappstore.pageOffset >= midas.slicerappstore.totalResults){
              $('#extensionsContainer').stopScrollPagination();
          }
          return contentData;
      },
      'scrollTarget': $(window),
      'heightOffset': 20,
      'dataType':'json',
      'onSuccess': function(obj, data){
          midas.slicerappstore.totalResults = data.total;
          $.each(data.extensions, function(index, extension) {
              midas.slicerappstore.renderExtension(extension, index);
          });
          if(data.total == 0) {
              $('.paginationMessage').show().text('No extensions found');
          }
      },
      'afterLoad': function(elementsLoaded){
          $('.loadingExtensions').hide();
      }
    });
});
