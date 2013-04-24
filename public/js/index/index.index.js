var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};
midas.slicerappstore.totalResults = -1;
midas.slicerappstore.pageOffset = 0;
midas.slicerappstore.scrollPaginationInitialized = false;

/**
 * Called when a user clicks to view the extension page
 */
midas.slicerappstore.extensionClick = function() {
  var url = json.global.webroot+'/slicerappstore/extension/view?extensionId='+$(this).attr('element')+'&layout='+json.layout;
  window.location = url;
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
 * Return the ideal number of items required to fill the space horizontally.
 */
midas.slicerappstore.idealNumberOfHorizontalItems = function(){
  var itemWidth = $('#extensionTemplate').outerWidth(true);
  var horizontalCount = Math.floor($('#extensionsContainer').width() / itemWidth);
  return horizontalCount;
}

/**
 * Return the ideal number of items required to fill the space vertically.
 */
midas.slicerappstore.idealNumberOfVerticalItems = function(){
  var itemHeight = $('#extensionTemplate').outerHeight(true);
  var verticalCount = Math.floor(($(window).height() - $('.extensionsHeader').height()) / itemHeight);
  return verticalCount;
}

/**
 * Return the ideal number of items required to fill the space horizontally and vertically.
 */
midas.slicerappstore.idealNumberOfItems = function(){
  return midas.slicerappstore.idealNumberOfHorizontalItems() *
      midas.slicerappstore.idealNumberOfVerticalItems();
}

/**
 * Compute number of items to fetch based on available width and height.
 * If no items have been fetched, number of items filling the available space plus an
 * extra row will be returned.
 * If items have already been fetched, number of items filling one row will be returned.
 */
midas.slicerappstore.pageLimit = function(){
    var pageLimit = midas.slicerappstore.idealNumberOfHorizontalItems();
    if (midas.slicerappstore.totalResults == -1){
        pageLimit += midas.slicerappstore.idealNumberOfItems();
    }
    return pageLimit;
}

/**
 * Return loading option to associate with scrollpagination callback.
 * @pageLimit By default, the pageLimit value will be retrieved using function midas.slicerappstore.pageLimit()
 */
midas.slicerappstore.scrollPaginationOptions = function(pageLimit){
return {
  'contentPage': json.global.webroot+'/slicerappstore/index/listextensions',
  'contentData': function(){
    var currentPageLimit = typeof pageLimit !== 'undefined' ? pageLimit : midas.slicerappstore.pageLimit();
    contentData = {
      category: midas.slicerappstore.category,
      os: midas.slicerappstore.os,
      arch: midas.slicerappstore.arch,
      //release: midas.slicerappstore.release,
      revision: midas.slicerappstore.revision,
      limit: currentPageLimit,
      offset: midas.slicerappstore.pageOffset
    };
    midas.slicerappstore.pageOffset += currentPageLimit;
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
};
}

/**
 * Initialize scroll pagination
 */
midas.slicerappstore.initScrollPagination = function(){
    if(midas.slicerappstore.scrollPaginationInitialized){
        return;
    }

    // If it applies, fetch additonal items upon window resize
    $(window).resize(function(){
        // See http://stackoverflow.com/questions/4298612/jquery-how-to-call-resize-event-only-once-its-finished-resizing
        clearTimeout(this.id);
        this.id = setTimeout(function(){
            current_count = $('#extensionsContainer .extensionWrapper').length;
            if (midas.slicerappstore.totalResults != -1
                  && midas.slicerappstore.totalResults != current_count) {
                ideal_count = midas.slicerappstore.idealNumberOfItems() + midas.slicerappstore.idealNumberOfHorizontalItems();
                complement_count = current_count % midas.slicerappstore.idealNumberOfHorizontalItems();
                item_to_fetch = 0;
                if (current_count < ideal_count){
                    item_to_fetch = ideal_count - current_count;
                } else if (complement_count > 0){
                    item_to_fetch = midas.slicerappstore.idealNumberOfHorizontalItems() - complement_count;
                }
                if (item_to_fetch > 0){
                    $.fn.scrollPagination.loadContent(
                        $('#extensionsContainer'), midas.slicerappstore.scrollPaginationOptions(item_to_fetch), true);
                }

            }
        }, 500);
    });

    midas.slicerappstore.resetFilter();
    $('#extensionsContainer').scrollPagination(midas.slicerappstore.scrollPaginationOptions());
    midas.slicerappstore.scrollPaginationInitialized = true;
}

/**
 * Based on the filter parameters, return a page of extension results
 */
midas.slicerappstore.applyFilter = function(skipFetchCategories) {
    midas.slicerappstore.resetFilter();
    if(window.history && typeof window.history.replaceState == 'function') {
        var params = '?os=' + window.encodeURIComponent(midas.slicerappstore.os);
        params += '&arch=' + window.encodeURIComponent(midas.slicerappstore.arch);
        params += '&revision=' + window.encodeURIComponent(midas.slicerappstore.revision);
        params += '&category=' + window.encodeURIComponent(midas.slicerappstore.category);
        params += '&layout=' + json.layout;
        window.history.replaceState({
            os: midas.slicerappstore.os,
            arch: midas.slicerappstore.arch,
            revision: midas.slicerappstore.revision,
            category: midas.slicerappstore.category,
            layout: json.layout
        }, '', params);
    }
    if ($.support.pageVisibility){
        $('#extensionsContainer').startScrollPagination();
    } else {
        $.fn.scrollPagination.loadContent(
            $('#extensionsContainer'), midas.slicerappstore.scrollPaginationOptions(/*pageLimit = */ 0), true);
    }
    if(!skipFetchCategories) {
        midas.slicerappstore.fetchCategories();
    }
}

/**
 * Render the category tree based on tokens separated by . character
 */
midas.slicerappstore.showCategory = function(category, count) {
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
                var html = '<li class="categoryControl" name="'+name+'" id="'+id+'">'+token+' ('+count+')</li>';
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
                var html = '<li class="categoryControl" name="'+name+'" id="'+id+'">'+token+' ('+count+')</li>';
                $('#'+parentId).append(html);
            }
        }
        lastToken += tokenId;
        name += '.';
    });
};

/**
 * Called when the categories have been loaded or refreshed
 */
midas.slicerappstore.categoriesLoaded = function () {
    $('li.categoryControl').remove();
    $.each(midas.slicerappstore.categories, function(category, count) {
        midas.slicerappstore.showCategory(category, count);
    });

    // Enable the "All" category filter
    midas.slicerappstore.selectedCategory = $('li#categoryAll').unbind('click').click(function() {
        midas.slicerappstore.category = '';
        midas.slicerappstore.selectedCategory.removeClass('selectedCategory');
        midas.slicerappstore.selectedCategory = $(this);
        $(this).addClass('selectedCategory');
        midas.slicerappstore.applyFilter(true);
    });

    // Enable filtering by specific categories
    $('li.categoryControl').unbind('click').click(function() {
        midas.slicerappstore.category = $(this).attr('name');
        midas.slicerappstore.selectedCategory.removeClass('selectedCategory');
        midas.slicerappstore.selectedCategory = $(this);
        $(this).addClass('selectedCategory');
        midas.slicerappstore.applyFilter(true);
    });

    var selector = midas.slicerappstore.category == '' ?
        'li#categoryAll' :
        'li.categoryControl[name="'+midas.slicerappstore.category+'"]';
    midas.slicerappstore.selectedCategory = $(selector).addClass('selectedCategory');

    // Setup scroll pagination and fetch results based on the initial settings
    if ($.support.pageVisibility){
        if(!midas.slicerappstore.isPageHidden()){
            midas.slicerappstore.initScrollPagination();
        } else {
            $(document).bind("show", function(){
              midas.slicerappstore.initScrollPagination();
              $(document).unbind("show");
            });
        }

    }
    else {
      // If visibility API is not supported, fetch all extensions
      midas.slicerappstore.applyFilter();
    }
};

midas.slicerappstore.fetchCategories = function () {
    // Refresh and render the category tree based on all available categories
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: json.global.webroot+'/slicerappstore/index/categories',
        data: {
            os: midas.slicerappstore.os,
            arch: midas.slicerappstore.arch,
            revision: midas.slicerappstore.revision
        },
        success: function (resp) {
            midas.slicerappstore.categories = resp;
            midas.slicerappstore.categoriesLoaded();
        }
    });
};

$(document).ready(function() {
    midas.slicerappstore.os = json.os;
    midas.slicerappstore.arch = json.arch;
    midas.slicerappstore.release = json.release;
    midas.slicerappstore.revision = json.revision;
    midas.slicerappstore.category = json.category;

    $('#osSelect').val(json.os);
    $('#archSelect').val(json.arch);
    $('#releaseSelect').val(json.release);
    $('#revisionInput').val(json.revision);

    if(json.layout != 'empty' ) {
        midas.slicerappstore.os = $('#osSelect').val();
        midas.slicerappstore.arch = $('#archSelect').val();
        midas.slicerappstore.release = $('#releaseSelect').val();
        midas.slicerappstore.revision = $('#revisionInput').val();

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

        // Enable filtering by revision
        $('#revisionInput').keyup(function() {
            midas.slicerappstore.revision = $(this).val();
            midas.slicerappstore.applyFilter();
        });

        // Enable filtering by release
        $('#releaseSelect').change(function() {
            midas.slicerappstore.release = $(this).val();
            midas.slicerappstore.applyFilter();
        });
    }

    midas.slicerappstore.fetchCategories();

    $('img.kwLogo').click(function () {
        var dlgWidth = Math.min($(window).width() * 0.9, 600);
        midas.loadDialog('KWInfo', '/slicerappstore/index/kwinfo');
        midas.showDialog('Slicer Extensions Catalog', false, {width: dlgWidth})
    });
});
