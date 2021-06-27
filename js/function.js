	var myDictionary = {};

    myDictionary.class_map = {
        'n': 'Noun',
        'v': 'Verb',
        'a': 'Adjective',
        's': 'Adjective satellite', //
        'r': 'Adverb',
        '?': '?'
    };
    myDictionary.class_map_acro = {
        'n':'noun',
        'v':'verb',
        'a':'adj',
        's':'adjs',
        'r':'adv',
        '?': '?'
    };

    myDictionary.settings = {};
    myDictionary.app_footer;
    myDictionary.loader;

    myDictionary.setSettings = function(settings){
        this.settings = settings;
    }

    myDictionary.urlParser = function(filename){
    	if(chrome && chrome.extension){
            return chrome.extension.getURL(filename);
        }else{
            return filename;
        }
    }

    myDictionary.ArpabetToIPA = function(arpabet){
        var symbol_pair= 
        {
            "AO": "ɔ",
            "AA": "ɑ",
            "IY": "i",
            "UW": "u",
            "EH": "ɛ",
            "IH": "ɪ",
            "UH": "ʊ",
            "AH": "ʌ",
            "AX": "ə",
            "AE": "æ",

            "EY": "eɪ",
            "AY": "aɪ",
            "OW": "oʊ",
            "AW": "aʊ",
            "OY": "ɔɪ",

            "ER": "ɝ",
            "AXR": "ɚ",
            "EH R": "ɛr",
            "UH R": "ʊr",
            "AO R": "ɔr",
            "AA R": "ɑr",
            "IH R": "ɪr",
            "IY R": "ɪr",
            "AW R": "aʊr",

            "P": "p",
            "B": "b",
            "T": "t",
            "D": "d",
            "K": "k",
            "G": "ɡ",

            "CH": "tʃ",
            "JH": "dʒ",

            "F": "f",
            "V": "v",
            "TH": "θ",
            "DH": "ð",
            "S": "s",
            "Z": "z",
            "SH": "ʃ",
            "ZH": "ʒ",
            "HH": "h",

            "M": "m",
            "EM": "m̩",
            "N": "n",
            "EN": "n̩",
            "NG": "ŋ",
            "ENG": "ŋ̍",

            "L": "ɫ",
            "EL": "ɫ̩",
            "R": "r",
            "DX": "ɾ",
            "NX": "ɾ̃",

            "Y": "j",
            "W": "w",
            "Q": "ʔ"
        };
        var ipa = "";
        var arpabet_parts = arpabet.split(" ");

        for(var i=0, len=arpabet_parts.length; i<len; i++){
            var part_current = arpabet_parts[i];
            var stress= "";
            switch(part_current[part_current.length - 1])
            {
                case "0":
                    stress = '';
                    part_current = part_current.substr(0, part_current.length - 1);
                    break;
                case "1":
                    stress= '\'';
                    part_current = part_current.substr(0, part_current.length - 1);
                    break
                case "2":
                    stress= '\'\'';
                    part_current = part_current.substr(0, part_current.length - 1);
                    break;
                default:
            }
            if(symbol_pair[part_current]){
                ipa +=  symbol_pair[part_current]+stress
            }else{
                console.log("My Dictionay: Cannot convert Arpabet to IPA.");
                return arpabet;
            }
        }
        return ipa;
    }

    myDictionary.speech = function(word){
        if(chrome && chrome.runtime){
            chrome.runtime.sendMessage({"fn":"tts", "param": {"word":word} }, function(){});
        }
    }

    myDictionary.parseResp = function(response){
        if(response.error){
            return {'body': $('<div />').append(response.error), 'footer':this.app_footer};
        }
        if(response.content){
            return {'body': $('<div />').append(response.content), 'footer':this.app_footer};
        }
        var lemma_header_container = $('<div />', {'class':'lemma-header'}).css({'display':'block', 'width':'95%', 'margin': 'auto'});
        var lemma_header = $('<div />', {'style':"display: block; text-transform: capitalize; font-weight: bold; font-size: 19.2px; margin:6.4px 0.4rem 1px 6.4px;"})
            .append(response.lemma);
        var lemma_class_anchor = $('<div />').css({'float':'right'});
    
        response.phoneme = response.phoneme || "";
        if(this.settings && this.settings.phonetic && this.settings.phonetic === "ipa"){
            response.phoneme = this.ArpabetToIPA(response.phoneme);
        }
        var lemma_phoneme = $('<div />', {'style':'color:gray; font-size:16px;  margin:1px 6.4px 6.4px 6.4px;'});
        var phoneme_speaker_button = $('<img />', {'src':this.urlParser('res/speaker.png'), 'style':'vertical-align:middle; height:14px; cursor:pointer'}).
            on("click", $.proxy(function(){this.speech(response.lemma);}, this));
        lemma_phoneme.append(phoneme_speaker_button).append($('<span />', {'style':'font:\'Times New Roman\'; padding-left:4px;'}).html(response.phoneme));
        
        var $fancy_line_separator = $('<div />').addClass('fancy-line');
        if(this.settings.displayColor === "#FEA"){
              $fancy_line_separator.addClass('sepia');
        }else{
              $fancy_line_separator.addClass('normal');
        }

        lemma_header_container.append(lemma_header).append(lemma_class_anchor).append(lemma_phoneme).
        append($fancy_line_separator);

        var class_container = $('<div />', {'class':'class-container'});
        /*
            c is whether : "n" "v" "a" "s" "r"
        */
        var c;

        for(c in response.classes){
            /*
                Initialize _class_. An array, that holds different definition for lemma for the same class (like noun, averb,...)
            */
            var _class_ = response.classes[c];
            var class_id = 'class-' + this.class_map_acro[c] + '-random04';
            var class_anchor = $('<a />', {'href':"#"+class_id+">.class-noun-title"}).css({
                'font-size': '14.4px',
                'padding-right': '3.2px',
                'text-decoration': 'blink',
                'font-style': 'italic',
                'text-transform': 'lowercase',
                'color': '#888'
            }).html(this.class_map_acro[c]);
            lemma_class_anchor.append(class_anchor);
            /*
                "class" is a sub-container which will hold the def_lit for the current class
            */
            var sub_container = $('<div />', {'class':'class-noun', 'id':class_id}).html([
                "<div class='class-noun-title' style='display:inline-block; font-style:italic; width:90%; margin:0 5%; border-bottom: 1px solid #ccc;'>",
                    this.class_map[c],
                "</div>",
                ].join(""));
            /*
                def_lit is an ordered list. It will contain all definition of a lemma for the same one class
            */
            var def_list = $('<ol />');

            /*
                Loop through the _class_ array which contains different definitions of lemma for the same class. Then, format the html code and add it to 
                def_list. 
            */
            for(var i=0, len=_class_.length; i < len; i++){
                var html = [];
                var class_current = _class_[i];

                /*
                    If the current class doesn't have the definition property, then continue to next loop.
                */
                if(!class_current.definition)
                    continue;
                html.push(["<div class='definition'>",
                        class_current.definition,
                    "</div>",
                    ].join(''));

                if(class_current.examples && class_current.examples.length>0){
                    html.push([
                        "<div class='example' style='font-style:italic; font-weight:lighter; color:gray;'>",
                            class_current.examples.join("; "),
                        "</div>"
                        ].join(''));
                }

                if(class_current.synonyms && class_current.synonyms.length>0){
                    html.push([
                        "<div class='similar-word'>",
                            "<img src='" + this.urlParser('res/similar.png') + "' style='vertical-align:middle; height:12.8px !important;'>",

                            "<span>: </span>", 

                            class_current.synonyms.join("; "),
                        "</div>",
                        ].join(''));
                }

                if(class_current.antonyms && class_current.antonyms.length>0){
                    html.push([
                    "<div class='antonym-word'>",
                        "<img src='"+ this.urlParser('res/antonym.png') +"' style='vertical-align:middle; height: 12.8px !important;'>",

                        "<span>: </span>",

                        class_current.antonyms.join("; "),
                    "</div>"
                        ].join(''));
                }

                def_list.append( $('<li />', {'style':"padding-bottom:4px"}).append(html.join('\n')) );
            }
            /*
                Append the def_list to "class" (the sub-container) which contains definition for the current class to the main container.
            */
            sub_container.append(def_list);
            class_container.append(sub_container);
        }

        return {"lemma": response.lemma, "header": lemma_header_container, "body": class_container, "footer": this.app_footer};
    }

    myDictionary.makeRequest = function(lemma, callback){
        if(chrome && chrome.runtime){
            var msg = {};
            var callback = callback;
            msg.fn = "makeRequest";
            msg.param = {lemma: lemma};
            var onReceive = function(data){
                if(typeof data === "string"){
                    data = JSON.parse(data);
                }
                callback(this.parseResp(data));
            };
            chrome.runtime.sendMessage(msg, $.proxy(onReceive, this));
        }
    }

    myDictionary.getSuggestions = function(lemma, callback){
        if(chrome && chrome.runtime){
            var msg = {};
            var callback = callback;
            msg.fn = "getSuggestion";
            msg.param = {lemma: lemma};
            var onReceive = function(data){
                if(typeof data === "string"){
                    data = JSON.parse(data);
                }
                callback(data);
            };
            chrome.runtime.sendMessage(msg, $.proxy(onReceive, this));
        }
        /*var result = {
            'corrected': false,
            'suggestions': [
                "do", "do’s", "doable", "soak", "doan",
                "doan’s", "done", "dinah", "doanna", "doar"
            ]
        };
        if(callback){
            callback(result);
        }*/
    }

    myDictionary.getValue = function(item, callback){
        if(chrome && chrome.runtime){
            var msg = {};
            msg.fn = 'getValue';
            msg.param = {item:item};
            chrome.runtime.sendMessage(msg, $.proxy(function(value){

                if((typeof value) === "string"){
                    callback(JSON.parse(value));
                }else{
                    callback(value);
                }

            }, this));
        }
    }

    myDictionary.saveValue = function(key, value, callback){
        if(chrome && chrome.runtime){
            chrome.runtime.sendMessage({"fn":"saveValue", "param":{"key":key, "value": value}}, callback);
        }
    }

    myDictionary.init = function(callback){
        this.app_footer = [
            "<p style=' font-size:14.4px; margin:0; padding:5px; text-align:center;'>",
                "© 2015-2021 My Dictionary - <a style='color:black; font-weight: bold; text-decoration: none; word-wrap: break-word;' href='", this.urlParser("page/settings.html"), "' target='_blank'>Options</a>",
                "<a style='width:14.5px; float:right;' target='_blank' href='https://chrome.google.com/webstore/detail/jhehenajiifngcndnlecbmcdobnkeglb'>",
                    "<img src='" + this.urlParser("res/thumb-up.png") + "' style='width:inherit;'>", 
                "</a>",
            "</p>"
        ].join('');
        this.loader = [
            "<div style='width:48px; height:48px; margin:24px auto;'>",
            "<img src='" + this.urlParser("res/loader.gif") + "' style='width:100%;'>",
            "</div>"
        ].join("");
    }

    myDictionary.init();