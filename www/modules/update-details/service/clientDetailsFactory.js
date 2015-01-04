
angular.module('hrl').factory('clientDetailsFactory', ['$http', '$cookies', function($http, $cookies) {
//angular.module('hrl').factory('clientDetailsFactory', function($http) {
	return {
			
		baseUrlGetDetails: '/apps.contact-details-update',
		baseUrlServices: '/internet.services',
		
		getClientDetails: function (ticket, callback){
			var me = this;
			
			$http({
					method: 'GET', 
					url: me.baseUrlGetDetails + '/details',
					params: {
						"ticket" : ticket
					}
				})
				.success(function(data, status, headers, config) {
					//debugger;
					if (typeof(callback) == 'function'){
			    		callback(status ,data);
			    	}
			    })
			    .error(function(data, status, headers, config) {
			    	//debugger;
			    	if (typeof(callback) == 'function'){
			    		callback(status ,data);
			    	}
			    });
		},
		
		getPhonePrefixes: function (callback){
			var me = this;
			
			$http({
					method: 'GET', 
					url: me.baseUrlServices + '/general-db/mobile/prefix',
					params: {
					}
				})
				.success(function(data, status, headers, config) {
					//debugger;
					if (typeof(callback) == 'function'){
			    		callback(status ,data);
			    	}
			    })
			    .error(function(data, status, headers, config) {
			    	//debugger;
			    	if (typeof(callback) == 'function'){
			    		callback(status ,data);
			    	}
			    });
		},
		
		submitUpdate: function(
				ticket,
				clientId,
				firstName,
				lastName,
				email,
				phonePreffix,
				phoneSuffix,
				city,
				street,
				homeNumber,
				zipCode,
				activationStatus,
				annualMailingStatus,
				dimutPensionStatusUpdateValue,
        		dimutLifeStatusUpdateValue,
        		dimutGemelStatusUpdateValue,
        		dimutHealthStatusUpdateValue,
        		annualMailingValue,
        		activationValue,
        		
				callback){
						
			var me = this;			
			var submitContactUpdateDetailsDto = {
					"userId":clientId,
					"firstName":firstName,
					"lastName":lastName,
					"email":email,
					"phoneSuffix":phoneSuffix,
					"phonePreffix":phonePreffix,
					"streetName":street,
					"streetNumber":homeNumber,
					"cityName":city,
					"zipCode":zipCode,
					"activationStatus":activationStatus,
					"annualMailingStatus":annualMailingStatus,
					"dimutPensionStatus":dimutPensionStatusUpdateValue,
					"dimutLifeStatus":dimutLifeStatusUpdateValue,
					"dimutGemelStatus":dimutGemelStatusUpdateValue,
					"dimutHealthStatus":dimutHealthStatusUpdateValue,
					"activationValue":activationValue,
					"annualMailingValue":annualMailingValue
				};
			
			$http.post(me.baseUrlGetDetails + '/submit?_csrf=' + $cookies._csrf + '&ticket=' + ticket, submitContactUpdateDetailsDto)
				.success(function(data, status, headers, config) {
					//debugger;
					if (typeof(callback) == 'function'){
						callback(status ,data);						
					}
			    })
			    .error(function(data, status, headers, config) {
			    	//debugger;
			    	if (typeof(callback) == 'function'){
			    		callback(status ,data);
			    	}
			    }
		    );
			
			/*$http({
				method: 'POST', 
				url: me.baseUrlGetDetails+'/submit',
				headers: {'Content-Type': 'application/json'},
				transformRequest: function(obj) {
			        var str = [];
			        for(var p in obj)
			        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			        return str.join("&");
			    },
				params:{
					'_csrf': $cookies._csrf, //adding _csrf token to request body
					'ticket': ticket
				},
				data: {					
					'SubmitContactUpdateDetailsDto': submitContactUpdateDetailsDto
				}
			})
			.success(function(data, status, headers, config) {
				callback(status ,data);
		    })
		    .error(function(data, status, headers, config) {
		    	callback(status ,data);
		    });*/
		}
		
	};
}]);