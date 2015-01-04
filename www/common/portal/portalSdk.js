/*
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,h,c){var a=$([]),e=$.resize=$.extend($.resize,{}),i,k="setTimeout",j="resize",d=j+"-special-event",b="delay",f="throttleWindow";e[b]=10;e[f]=true;$.event.special[j]={setup:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.add(l);$.data(this,d,{w:l.width(),h:l.height()});if(a.length===1){g()}},teardown:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.not(l);l.removeData(d);if(!a.length){clearTimeout(i)}},add:function(l){if(!e[f]&&this[k]){return false}var n;function m(s,o,p){var q=$(this),r=$.data(this,d);r.w=o!==c?o:q.width();r.h=p!==c?p:q.height();n.apply(this,arguments)}if($.isFunction(l)){n=l;return m}else{n=l.handler;l.handler=m}}};function g(){i=h[k](function(){a.each(function(){var n=$(this),m=n.width(),l=n.height(),o=$.data(this,d);if(m!==o.w||l!==o.h){n.trigger(j,[o.w=m,o.h=l])}});g()},e[b])}})(jQuery,this);




/*
 * PM functions.
 * Copyright (c) 2014 Jonathan Vital.
 * Requires jQuery 1.5 and up.
 */


//TODO - added domain
var PostMsg_DOMAINS = new Array("http://harel-customers",
							"http://hrl-test.harel-office.com", 
							"https://hrl-test.harel-office.com", 
							"http://www.hrl.co.il",
							"https://www.hrl.co.il",
							"http://hlwsag07-t:8080",
							"http://localhost:8080");


// --------
//  Definition functions (non-usable by apps):
// --------

// creating xml text message to post
function PostMsg_CreateXmlTextMessage(action){
	var msg = "<PostData><Action>"+action+"</Action><Params>";
	var argsLen = arguments.length;
	if (argsLen > 1){
		var modulu = argsLen%2;
		if (modulu==1){
			for (var n=1 ; n < argsLen ; n+=2){
				msg += "<" + PostMsg_CreateXmlTextMessage.arguments[n] + ">";
				msg += PostMsg_CreateXmlTextMessage.arguments[n+1];
				msg += "</" + PostMsg_CreateXmlTextMessage.arguments[n] + ">";
			}
		}else{
			argsLen = argsLen-1;
			for (var n=1 ; n < argsLen ; n+=2){
				msg += "<" + PostMsg_CreateXmlTextMessage.arguments[n] + ">";
				msg += PostMsg_CreateXmlTextMessage.arguments[n+1];
				msg += "</" + PostMsg_CreateXmlTextMessage.arguments[n] + ">";
			}
		}
	}
	msg += "</Params></PostData>";
	return msg;
}


// listener side - get an iframe element id
function getIframeId(event) {
    var frames = document.getElementsByTagName('iframe'),
        frameId = 0,
        framesLength = frames.length;

    for (; frameId < framesLength; frameId++) {
        if (frames[frameId].contentWindow === event.source) {
            return frames[frameId].id;
        }
    }
    return null;
}




// --------
//  Post and Receive:
// --------

// do actual message post
function PostMsg_Post(msgXml){	
	if (console.debug){
		console.debug('app->',msgXml);
	}
	var objIframe = window.parent;
	if (objIframe!=undefined && objIframe!=null){
		objIframe.postMessage(msgXml, "*");
	}
}

// the receive function
function PostMsg_Receive(event) {
	if (console.warn){
		console.warn('portal->',event);
	}
	var callingElementId;
	try{
		callingElementId = getIframeId(event);
		if (callingElementId == null || callingElementId=='') {
			callingElementId = event.srcElement.name;
			if (callingElementId==null || callingElementId=='') return;
		}
	}catch(err){return;}


	if (PostMsg_DOMAINS && PostMsg_DOMAINS.length > 0){
		for (var pmIndex = 0 ; pmIndex < PostMsg_DOMAINS.length ; pmIndex++){
		    if (event.origin.toLowerCase() == PostMsg_DOMAINS[pmIndex]){
		    	var pmData = $.parseXML("<?xml version='1.0'?>"+event.data);
		    	if ($(pmData).find("Action")){
			        switch ($(pmData).find("Action").text()) {
			            case "Resize": 
			            {			            	
			                var height = $(pmData).find("Params Height").text();
			                $("#" + callingElementId).css('height', height);
			                //TODO - CHANGE - change IE8 fix
			                $("body").addClass("tmp");
			                window.setTimeout(function(){
			                	$("body").removeClass("tmp");
			                }, 500);
			                break;
			            }
				        case "Scroll":
						{
							if ($(pmData).find("Params ScrollTo") && $(pmData).find("Params ScrollTo").text()!=''){
								var toElemId = $(pmData).find("Params ScrollTo").text();
								if (toElemId == 'Myself'){
									$('html,body').animate({
										scrollTop: $("#" + callingElementId).offset().top
									}, 500);
								}
								else if ($("#" + toElemId).length > 0 ){
									$('html,body').animate({
										scrollTop: $("#" + toElemId).offset().top
									}, 500);
								}
								else{
								}
							}
							else{ // param empty
								$('html, body').animate({
									scrollTop: 0
								}, 500);
							}
			                break;
			            }
				        case "Redirect":
						{
			                var url = $(pmData).find("Params Url").text();
			                window.location.href = url;
			                break;
			            }
			            
			            
			        } // end of switch
		        }
		    }
		}
	}
}

// bind message listener to window
try {
       if (window.addEventListener)
           window.addEventListener("message", PostMsg_Receive);
       else if (window.attachEvent)
           window.attachEvent("onmessage", PostMsg_Receive);
       else
           window["onmessage"] = PostMsg_Receive;
}
catch (err) { }






// ------------------------------
//  Functions usable by apps:
// ------------------------------


function PostMsg_ScrollTOP(){
	var myMessage = PostMsg_CreateXmlTextMessage("Scroll");
	PostMsg_Post(myMessage);  // do the post
}

function PostMsg_ScrollTo(scrollToElementId){
	var myMessage = PostMsg_CreateXmlTextMessage("Scroll", "ScrollTo", scrollToElementId);
	PostMsg_Post(myMessage);  // do the post
}

function PostMsg_ScrollToMyself(){
	var myMessage = PostMsg_CreateXmlTextMessage("Scroll", "ScrollTo", "Myself");
	PostMsg_Post(myMessage);  // do the post
}


function PostMsg_Redirect(url){
	var myMessage = PostMsg_CreateXmlTextMessage("Redirect", "Url", url);
	PostMsg_Post(myMessage);  // do the post
}

function PostMsg_Resize_By_Element(hight){
	var myMessage = PostMsg_CreateXmlTextMessage("Resize", "Height", hight);
	PostMsg_Post(myMessage);  // do the post
}

function PostMsg_Resize() {
	
	var myWidth = 0, myHeight = 0;
	if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	}
	else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	}
	else if( typeof( window.innerWidth ) == 'number' ) {
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	} 

	var myMessage = PostMsg_CreateXmlTextMessage("Resize", "Height", myHeight);

	PostMsg_Post(myMessage);  // do the post
}


function PostMsg_ResizeTo(height){
	var myMessage = PostMsg_CreateXmlTextMessage("Resize", "Height", height);
	PostMsg_Post(myMessage);  // do the post
}

$(document).ready(function(){
	
	$("body").resize(function () {
        //Placeholders();        
        if (this.triggerInterval === true) {
            $(this).trigger('resizeInterval');
            this.triggerInterval = false;
            setTimeout(function () {
                this.triggerInterval = true;
            }, 50);
        }
        if (this.resizeTO) {
            clearTimeout(this.resizeTO);
        } else {
            $(this).trigger('resizeStart');
        }
        this.resizeTO = setTimeout(function () {
        	$("body").trigger('resizeEnd');
            $(this).trigger('resizeInterval');
            try {
                delete this.resizeTO;
            } catch (e) {
                this.resizeTO = undefined;
            }
        }, 100);
    });

	//$(".content").bind("resizeEnd", function(){ 
	$("body").bind("resizeEnd", function(){ 

		PostMsg_Resize_By_Element($("body").height()); 
	});

	PostMsg_Resize_By_Element($("body").height());

});



