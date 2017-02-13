
  var popup = $('<div />', {'id':'popup', 'class':'popup-default reset-this'}).css({'width':'25rem'});

  var header = $('<div />', {'id':'header'});
  var body = $('<div />', {'id':'body'});
  var wrapper = $('<div />', {'id':'iscroll-wrapper'}).css({
  }).append(body);
  var footer = $('<div />', {'id':'footer'}).append(myDictionary.app_footer);
  if(IScroll){
      wrapper.iscroll = new IScroll(wrapper[0], {
          scrollbars: true,
          mouseWheel: true,
          interactiveScrollbars: true,
          shrinkScrollbars: 'scale',
          fadeScrollbars: true
      });
  };

  var form_input = $('<input />', {'type':'text', 'value':''}).css({
      'width': '16rem',
      'height': '1.5rem',
      'padding': '0 0.2rem',
      'border': '1px solid',
      'border-radius': '5px'
  });
  form_input.timeout = null;

  var form_submit = $('<input />', {'type':'submit', 'value':'Define'}).css({
        'margin-left': '0.5rem',
        'max-width': '6rem',
        'text-align': 'center',
        'height': '1.8rem',
        'padding': '0 1rem',
        'background-color': '#da4132',
        'border-color': '#37d',
        'color': '#FFF',
        'font-size': '0.8rem',

        'border': '1px solid transparent',
        'border-radius': '3px',
        'cursor': 'pointer',
        '-webkit-user-select': 'none',
        'user-select': 'none'
  });
  var $suggestion_container = $('<p />', {'id':'suggestion-container'}).css({
      'line-height': '2rem',
      'margin': '0 1.5rem 0 0rem',   

      'font-variant': 'small-caps',
      'text-transform': 'capitalize',

      'transform': 'translateZ(1px)'
    });

  var queryForm = $('<form />').append(form_input).append(form_submit);


  body.append($suggestion_container.html(''));
  popup.append(queryForm).append(header).append(wrapper).append(footer);

  var updateSuggestions = function(result){
    
    if(result.corrected){
      form_input.addClass("color-red");
    }else{
      form_input.removeClass("color-red");
    }

    var suggested_items = [];
    result.suggestions.forEach(function(el, ind, arr){
      var suggested_el = $('<a />', {'href':'#'})
                          .append($('<span />').html(el))
                          .addClass('suggested-item')
                          .on("click", onSuggestionClick);
      suggested_items.push(suggested_el);
    });

     /*
     clear the pop dialog to remove anything that is actually
     in the body; both previous suggestions and/or a previous
     definition(s).
     */
     clearPopup();
    //add the suggested word/lemma in the suggestion container
    $suggestion_container.append(suggested_items);

    //remove or add class to suggested_item to create animation effect
  };

  var onFormInputChange = function(event){
    if(form_input.old != form_input.val() ){

      if(form_input.timeout){
          clearTimeout(form_input.timeout);
      }
      form_input.timeout = setTimeout(function(){
        var lemma = $.trim(form_input.val());
        myDictionary.getSuggestions(lemma, updateSuggestions);
      }, 500);

    }

    form_input.old = form_input.val();
  };

  var onSubmit = function(event){
    var lemma = $.trim(form_input.val());
    clearPopup();
    body.html('').append(myDictionary.loader);
    myDictionary.makeRequest(lemma, popResponse);
    event.preventDefault();
    return false;
  };

  var onSuggestionClick = function(event){
    var lemma = this.innerText;
    form_input.val(lemma);
    onSubmit(event);
  };

  var clearPopup = function(){
    header.html('');
    body.html('');
    if(form_input.timeout){
      clearTimeout(form_input.timeout);
    }
    body.append($suggestion_container.html(''));
    window.setTimeout($.proxy(wrapper.iscroll.refresh, wrapper.iscroll), 100);
  };
  var popResponse = function(content){
    form_input[0].value = '';
    clearPopup();
    if(myDictionary.settings.sayWord && content.lemma){
      myDictionary.speech(content.lemma);
    }
    if(content.header){
      header.append(content.header);
    }
    if (content.body) {
      body.append(content.body);
    }
    window.setTimeout($.proxy(wrapper.iscroll.refresh, wrapper.iscroll), 100);
  };


document.addEventListener('DOMContentLoaded', function() {
  if(myDictionary){
    form_input.on("keyup", onFormInputChange);
    queryForm.on("submit", onSubmit);
    var onSettings = function(settings){
      myDictionary.setSettings(settings);
      $(document.body).css({'background-color': settings.displayColor || '#FFF'});
      document.body.appendChild(popup[0]);
      form_input.focus();
    };
    myDictionary.getValue("settings", $.proxy(onSettings, this));
  }else{
    console.log("MyDictionary: Js module is missing.");
  }
});
