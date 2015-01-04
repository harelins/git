/**
 * 
 */
angular.module('hrl').factory('Utils', [ '$location', function($location) {

	return{
		getQsParams: function(name){
			
			var winURL = window.location.href;
		    var queryStringArray = winURL.split("?");
		    if (!queryStringArray[1]){
		    	if (console && console.warn){
		    		console.warn('expecting '+name+' query string param');
		    		return;
		    	}
		    }
		    var queryStringParamArray = queryStringArray[1].split("&");
		    var nameValue = null;

		    for ( var i=0; i<queryStringParamArray.length; i++ )
		    {           
		        queryStringNameValueArray = queryStringParamArray[i].split("=");

		        if ( name == queryStringNameValueArray[0] )
		        {
		            nameValue = queryStringNameValueArray[1];
		        }                       
		    }

		    return nameValue;
		},
		
		showErrorPage: function(){	
			window.location.href = 'front/common/error.html';
		}
	};
}]);