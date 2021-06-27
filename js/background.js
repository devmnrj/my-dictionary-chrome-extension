    /*
    * Private variables: speech & voices
    * speech & voices is used many time. So, we initialize them since the start of
    * the extension (process) thus no re-initialization will be needed.
    */
    var speech;
    var voices;

    // The host and port we are running the server at:
    const HOST = 'http://162.243.83.79';
    const PORT = 2015;

    /*
    * The callback method to serve chrome extension messaging with the background page.
    * @param {Object} request The message sent.
    * @param {Object} sender The sender of the message.
    * @pram {Function} callback The callback to call at the function exist (return for asynchronous return).
    */
    
    function serveChromeRequest(request, sender, callback){
        console.log("Message received: " + JSON.stringify(request));
        if(window[request.fn]){
            switch(typeof window[request.fn]){

                case "function":
                    if(!request.param)
                        request.param = {};
                    request.param.callback = callback;
                    window[request.fn](request.param);
                    break;

                default:
                    callback(JSON.stringify(window[request.fn]));
            }
            return true;
        }else{
            console.log("My Dictionaty: cannot handle request.");
            if(callback)
                callback({'error':"Cannot handle request: " + JSON.stringify(request)});
        };
    };

    /*
    * Make request to retrieve param.lemma's definition from MyDictionary's server
    */
    function makeRequest(param){
        if(param.lemma && param.lemma.length>0 && param.lemma.length < 100){
            param.lemma = param.lemma.replace(/\s+/g, '+');
            var data = {"action":"define", "app":"myDictionary", "version":1, "lemma":param.lemma};
            var callbackHolder = {};
            callbackHolder.param = param;
            
            callbackHolder.onSuccess = (function(response){
                if(this.param.callback){
                    response = ((typeof response) === "string") ? JSON.parse(response) : response;
                    this.param.callback(response);
                }
            });
            callbackHolder.onError = function(xhr, status, error){
                if(this.param.callback){
                    error = (error.length === 0) ? ("Cannot reach the server") : error;
                    var error = [
                      '<p style=\'font-family: Segoe UI, Tahoma, sans-serif;\'>',
                      '<span>An error has occurred will treating your request.</span><br>',
                      '<span style=\'color:red;\'>', status, ": ", error, '</span>',
                      '</p>'
                      ].join('');
                    this.param.callback({'error':error});
                }
            };
            $.ajax({
                "type": "POST",
                "async":true,
                "data": JSON.stringify(data),
                "contentType": "application/json",
                "url": `${HOST}:${PORT}`,
                //"https://my-dictionary-server.herokuapp.com/",
                //"url": "https://my-dictionary-server-143705.appspot.com",
                "timeout": 10000,
                "param": param,
                success: callbackHolder.onSuccess,
                error: callbackHolder.onError,
            });
        }else{
            if(param.callback){
                var error = [
                          '<p style=\'font-family: Segoe UI, Tahoma, sans-serif;\'>',
                          '<span>Something is preventing MyDictionary to retrieve the definition. Your request seem to be empty or too large.</span>',
                          '</p>'
                          ].join('');
                param.callback({'error':error});
            }
        }
    }

    function getSuggestion(param){
        if(param.lemma){
            param.lemma = param.lemma.replace(/\s+/g, '+');
            callbackHolder = {};
            callbackHolder.param = param;

            callbackHolder.onSuccess = (function(response){
                if(this.param.callback){
                    response = ((typeof response) === "string") ? JSON.parse(response) : response;
                    this.param.callback(response);
                }
            });

            callbackHolder.onError = function(xhr, status, error){
                if(this.param.callback){
                    this.param.callback({
                        'error': status + ": " + error
                    });
                }
            };

            $.ajax({
                "type": "GET",
                "async":true,
                "contentType": "application/json",
                "url": `${HOST}:${PORT}/suggestions?lemma=${param.lemma}`,
                //"url": "https://my-dictionary-server-143705.appspot.com/suggestions?lemma=" + param.lemma,
                "timeout": 10000,
                success: callbackHolder.onSuccess.bind(callbackHolder),
                error: callbackHolder.onError.bind(callbackHolder),
            });
        }
    };

    function tts(param){
        if((speech != null)){
            window.speechSynthesis.cancel();
            speech.text = param.word;
            window.speechSynthesis.speak(speech);
            }else{
                var audio = new Audio();
                audio.src ="http://responsivevoice.org/responsivevoice/getvoice.php?t=" + escape(param.word) + "&tl=en-GB";
                audio.play();
            }
    }

    /*
    * Return the persistent storage object of the background page.
    */
    function getValue(param){
        var value = localStorage.getItem(param.item) || null;
        if(param.callback)
            param.callback(JSON.parse(value));
    };

    /*
    * Set/Change value into the background's localstorage
    */
    function saveValue(param){
        if(param.key && param.value){
            localStorage.setItem(param.key, JSON.stringify(param.value));
            if(param.callback){
                var value = JSON.parse(localStorage.getItem(param.key));
                param.callback(value);
            }
        }
    };

    /*
    *
    */

    function install_notice()
    {
        if (localStorage.getItem('install_time'))
            return;

        var now = new Date().getTime();
        localStorage.setItem('install_time', now);
        chrome.tabs.create({url: chrome.extension.getURL('page/settings.html')});
    }

    /*
    * Initialization function of the background page which primarly handles default properties settings
    * and chrome's messaging.
    */
    function init(){
        install_notice();
        if(chrome && chrome.runtime){
            chrome.runtime.onMessage.addListener(serveChromeRequest);
        }else{
            console.log("My Dictionaty: Chrome runtime is not available. Therefore, communication with background page is not accessible.");
        }
        if(SpeechSynthesisUtterance && window.speechSynthesis.speak){
            speech = new SpeechSynthesisUtterance();
            voices = window.speechSynthesis.getVoices().filter(function(voice) {
                return ((voice.lang == "en-GB") | (voice.lang == "en-US")) 
            });
            window.speechSynthesis.onvoiceschanged = function(){
                voices = window.speechSynthesis.getVoices().filter(function(voice) {
                    return ((voice.lang == "en-GB") | (voice.lang == "en-US")) 
                });
                if(voices.length > 0){
                    speech.voice = voices[0];
                }
            }
            if(voices.length > 0){
                speech.voice = voices[0];
            }
        }
    };

    init();