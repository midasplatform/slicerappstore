var midas = midas || {};
midas.slicerappstore = midas.slicerappstore || {};

var json = null;

/**
 * Displays the login dialog
 */
midas.slicerappstore.doLogin = function () {
    var content = $('#loginFormTemplate').clone();
    content.find('form.loginForm').attr('id', 'appstoreLoginForm');
    content.find('div.loginError').attr('id', 'appstoreLoginError');
    midas.showDialogWithContent('Login', content.html(), false, { width: 320 });
    $('a.registerLink').click(midas.slicerappstore.doRegister);
    $('#appstoreLoginForm').ajaxForm({
        success: function (responseText, statusText, xhr, form) {
            var resp = $.parseJSON(responseText);
            if(resp.status == 'ok') {
                window.location.reload();
            } else {
                $('#appstoreLoginError').html('Login failed');
            }
        }
    });
}

/**
 * Displays the register dialog
 */
midas.slicerappstore.doRegister = function () {
    var content = $('#registerFormTemplate').clone();
    content.find('form.registerForm').attr('id', 'registerForm');
    content.find('div.registerError').attr('id', 'registerError');
    midas.showDialogWithContent('Register', content.html(), false, { width: 380 });
    $('a.loginLink').click(midas.slicerappstore.doLogin);
    $('#registerForm').ajaxForm({
        success: function (responseText, statusText, xhr, form) {
            var resp = $.parseJSON(responseText);
            if(resp.status == 'ok') {
                window.location.reload();
            } else {
                var errorText = '<ul>';
                if(resp.alreadyRegistered) {
                    $('#registerForm').find('input[type=text],input[type=password]')
                    .removeClass('invalidField').addClass('validField');
                    $('#registerForm').find('input[name=email]').removeClass('validField').addClass('invalidField');
                    errorText += '<li>'+resp.message+'</li>';
                } else {
                    $('#registerForm').find('input[type=text],input[type=password]')
                    .removeClass('validField').addClass('invalidField');

                    $.each(resp.validValues, function(field, value) {
                        $('#registerForm').find('input[name='+field+']')
                        .removeClass('invalidField').addClass('validField');
                    });
                    if(!resp.validValues.email) {
                        errorText += '<li>Invalid email</li>';
                    }
                    if(!resp.validValues.firstname) {
                        errorText += '<li>Invalid first name</li>';
                    }
                    if(!resp.validValues.lastname) {
                        errorText += '<li>Invalid last name</li>';
                    }
                    if(!resp.validValues.password1) {
                        errorText += '<li>Invalid password</li>';
                    }
                    if(!resp.validValues.password2) {
                        errorText += '<li>Passwords must match</li>';
                    }
                }
                errorText += '</ul>';
                $('#registerError').html(errorText);
            }
        }
    });
}

/**
 * Renders the category of this extension as a breadcrumb bar
 */
midas.slicerappstore.renderCategory = function(category) {
    var currToken = '';
    // if this extension belongs to multiple categories, we just render the first one
    category = category.split(';')[0];
    var categories = category.split('.');
    $.each(categories, function(k, token) {
        currToken += token;
        var html = ' &gt; ';
        html += '<a class="breadcrumbLink" href="'+json.global.webroot+'/slicerappstore?category='+currToken
             + '&os=' + json.extension.os
             + '&arch=' + json.extension.arch
             + '&revision=' + json.extension.slicer_revision
             + '&layout=' + json.layout
             + '">' + token + '</a>';
        currToken += '.';
        $('#categoryBreadcrumb').append(html);
    });
};

/**
 * Renders the screenshots for this extension. Expects a space separated list of URLs
 */
midas.slicerappstore.renderScreenshots = function(screenshots) {
  if(screenshots == '') {
      $('div.screenshots').html('There are no screenshots for this extension.');
      return;
  }
  screenshots = screenshots.split(' ');
  $.each(screenshots, function(k, url) {
      if(url != '') {
          var template = $('#screenshotTemplate').clone();
          template.removeAttr('id');
          var link = template.find('a.screenshotPreview');
          link.attr('href', url);
          var img = link.find('img.screenshotPreview');
          img.attr('src', url);
          img.attr('alt', url);
          template.appendTo('div.screenshots');
          template.show();
      }
  });
  $('div.screenshots a.screenshotPreview').lightBox({
      imageLoading: json.global.webroot+'/modules/slicerappstore/public/images/lightbox/lightbox-ico-loading.gif',
      imageBlank: json.global.webroot+'/modules/slicerappstore/public/images/lightbox/lightbox-blank.gif',
      imageBtnClose: json.global.webroot+'/modules/slicerappstore/public/images/lightbox/lightbox-btn-close.gif',
      imageBtnPrev: json.global.webroot+'/modules/slicerappstore/public/images/lightbox/lightbox-btn-prev.gif',
      imageBtnNext: json.global.webroot+'/modules/slicerappstore/public/images/lightbox/lightbox-btn-next.gif'
  });
  $('div.screenshotContainer').imgLiquid({
      fill: false
  });
}

$(document).ready(function() {
    midas.slicerappstore.renderCategory(json.extension.category);
    midas.slicerappstore.renderScreenshots(json.extension.screenshots);

    $('input.extensionActionButton')
        .attr('element', json.extension.slicerpackages_extension_id)
        .attr('extensionname', json.extension.productname);

    if(json.layout == 'empty') {
        midas.registerCallback('CALLBACK_RATINGS_AFTER_LOAD', 'ratings', function() {
            $('#loginToComment,#loginToRate').unbind('click').click(midas.slicerappstore.doLogin);
            $('#registerToComment,#registerToRate').unbind('click').click(midas.slicerappstore.doRegister);
        });
    }

    $('#viewUrl').click(function(){
      $('#dialogUrl').dialog({
        width: 450,
        modal: true,
        open: function(){
          $('.ui-widget-overlay').click(function(){
            $('#dialogUrl').dialog('close');
          })
        }
      });
      $('#dialogUrl input').select();
      $('#dialogUrl input').click(function(){
        $(this).select();
      })
    });

    $('#commentsDiv h4').remove();
    $('#ratingsDiv h4').remove();
    $('#ratingsUser').appendTo('#ratingsDiv');
    $('div.loginToRate').appendTo('#ratingsDiv');
    $('div.loginToRate').css('float', 'left');

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

    var url = json.global.webroot+'/slicerappstore'
             + '?os=' + json.extension.os
             + '&arch=' + json.extension.arch
             + '&revision=' + json.extension.slicer_revision
             + '&layout=' + json.layout;

    $('#rootBreadcrumb').attr('href', url);
    // Enable logout link
    $('#logoutLink').click(function () {
        $.post(json.global.webroot+'/user/logout', {noRedirect: true}, function() {
            window.location.reload();
        });
    });
});

$(window).on("load", function() {
    // Extension button state is updated once all window variables and qt webchannels are set up.
    midas.slicerappstore.updateExtensionButtonState(json.extension.productname);
});
