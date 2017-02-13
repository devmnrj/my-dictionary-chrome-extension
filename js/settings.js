  var onSubmit =  function(event){
    event.preventDefault();
    if(myDictionary){

      var settings = {
        "language": $("#language-selector").val(),
        "phonetic": $("#phonetic-selector").val(),
        "sayWord": $("#say-word-checkbox").prop('checked'),
        "popupKey": $("#popup-key-selector").val(),
        "popupEnable": $("#pop-checkbox").prop('checked'),
        "displayColor": $("#display-mode-selector").val()
      };

      myDictionary.saveValue("settings", settings, function(){
        $('#log-line').html("Settings saved").css({'display':'block'});
        window.setTimeout(function(){
          $('#log-line').html('').css({'display':'none'});
        }, 1000);
      });
      return false;
    }
  };
  var hideBanner = function(){
    var thank_banner = $("#thank-banner");
    if(thank_banner){
      thank_banner.css({'display':"none"});
    }
  };

  $(document).on("ready", function(){
      var thank_banner_continue = $("#thank-banner-continue");
      if(thank_banner_continue){
        thank_banner_continue.on("click", hideBanner);
      }
      if(myDictionary){
        var onSettings = function(settings){
          if(settings){
            if(settings.language){
              $("#language-selector").val(settings.language);
            }
            if(settings.phonetic){
              $("#phonetic-selector").val(settings.phonetic);
            }
            if(settings.sayWord){
              $("#say-word-checkbox").prop('checked', settings.sayWord);
            }
            if(settings.popupKey){
              $("#popup-key-selector").val(settings.popupKey);
            }
            if(settings.popupEnable){
              $("#pop-checkbox").prop('checked', settings.popupEnable);
            }
            if(settings.displayColor){
              $("#display-mode-selector").val(settings.displayColor);
            }
          }else{
            $("#thank-banner").css({"display":"block"});
            $("#options-form").submit();
          }
        };
        $("#options-form").on("submit", onSubmit);
        myDictionary.getValue("settings", onSettings);
    }
  });