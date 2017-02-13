var MyDictionary_injection = {};

MyDictionary_injection.myalert = new MyAlert();

MyDictionary_injection.getSelectionCoords = function () {
    var sel = document.selection, range;
    var width = 0, height = 0;
    var point = {};
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            width = range.boudingWidth;
            height = range.boudingHeight;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getBoundingClientRect) {
                var rect = range.getBoundingClientRect();
                width = rect.right - rect.left;
                height = rect.bottom - rect.top;
                point.x = rect.left + (width >> 1);
                point.y = rect.top + (height >> 1);
            }
        }
    }
    if(point.x + point.y !== 0){
        point.x += window.scrollX
        point.y += window.scrollY;
    }else{
        point = null;
    }
    return point;
};

MyDictionary_injection.getSelectedText = function(){
    var text;
    if(window.getSelection){
        text = window.getSelection().toString();
    }else if(document.selection && document.selection.type != "Control"){
        text = document.selection.createRange().text;
    }
    text = $.trim(text);
    return ((text.length > 0) ? text : null);
};

MyDictionary_injection.popResponse = function(content){
    if(content.lemma && myDictionary.settings.sayWord){
        myDictionary.speech(content.lemma);
    }
    this.myalert.update(content);
};

MyDictionary_injection.defineSelection = function(event){
    if(myDictionary){
        var eventKeeper = {};
        eventKeeper.event = event;
        eventKeeper.selection = this.getSelectedText();
        eventKeeper.selectionCoords = this.getSelectionCoords();
        eventKeeper.callback = function(settings){
            var condition = settings.popupEnable && (settings.popupKey.length===0 || this.event[settings.popupKey]) &&
             this.selection && (this.selectionCoords != null) && 
             MyDictionary_injection.myalert && !MyDictionary_injection.myalert.isShown();
            if(condition){
                myDictionary.setSettings(settings);
                MyDictionary_injection.myalert._setOption(settings);
                var loadingContent = {'body':myDictionary.loader, 'footer':myDictionary.app_footer};
                MyDictionary_injection.myalert.show(this.selectionCoords, loadingContent);
                myDictionary.makeRequest(this.selection, $.proxy(MyDictionary_injection.popResponse, MyDictionary_injection));
            }
        };
        myDictionary.getValue("settings", $.proxy(eventKeeper.callback, eventKeeper));
    }else{
        console.log("MyDictionary: Js module is  missing.");
    }
};

$(document).on("dblclick", $.proxy(MyDictionary_injection.defineSelection, MyDictionary_injection));