angular.module('hrl')
    .controller('clientDetailsController',[ '$scope', '$timeout', 'clientDetailsFactory', 'Utils', function ($scope, $timeout, _clientDetailsFactory, _utils) {

    	//init function
        $scope.init = function(){ 
        	$scope.showDetailsSection = true;
        	
        	$scope.showLoader = true;
        	$scope.showActionSection = false;
        	$scope.showDetails = false;
        	
        	$scope.showSuccess = false;
        	$scope.showFailure = false;
        	$scope.showActivation = false;
        	$scope.showAnnualMailing = false;
        	        	
        	$scope.isEmailFirstTime = true;
        	$scope.isSuffixFirstTime = true;
        	$scope.isPreffixFirstTime = true;
        	$scope.isCityFirstTime = true;
        	$scope.isStreetNameFirstTime = true;
        	$scope.isStreetNumberFirstTime = true;
        	$scope.isZipCodeFirstTime = true;
        	
        	$scope.isPhonePreffixValid = false;
        	$scope.showLoader = true;
			
			//hide loader
			$timeout(function(){
					$scope.showLoader = false;
				$scope.showActionSection = true;
				$scope.showDetails = true;
				document.getElementById('details-section').style.display = '';
				document.getElementById('action-section').style.display = '';
				document.getElementById('update-success-strip').style.display = '';
			}, 2000);
			
        	
        };
        
        //submit update form event handler
        $scope.submitUpdateForm = function(){
        	      
        	
        	if (!$scope.updateDetailsForm.$valid){
        		
    	        $scope.onEmailChange();        	        
    	        $scope.onSuffixChange();       
    	        $scope.phonePreffixSelectionChange();
    	        $scope.onCityChange();
    	        $scope.onStreetNumberChange();
    	        $scope.onStreetNameChange();
    	        $scope.onZipCodeChange();
        		$scope.scrollTop();        		
        		return;
        	}
        	
        	
        	if(!$scope.isPhonePreffixValid){
        		$timeout(function(){
        			$scope.isPhonePreffixValid = false;
        			$scope.isPreffixFirstTime = false;
            		$scope.scrollTop();
        		});
        		return;
        	}
        	        	
        	var activationStatusUpdateValue = -1,
        		annualMailingStatusUpdateValue = -1,
        		dimutPensionStatusUpdateValue = -1,
        		dimutLifeStatusUpdateValue = -1,
        		dimutGemelStatusUpdateValue = -1,
        		dimutHealthStatusUpdateValue = -1,
        		activationStatus = -1,
        		annualMailingStatus = -1;
        	
        	//mark which topics (sections) need to be updated with customer details
        	for (var i=0;i<$scope.topicsList.length;i++){
        		switch ($scope.topicsList[i].topicId){
        			case 10:
        				dimutLifeStatusUpdateValue = 0;
        				break;
        			case 30:
        				dimutHealthStatusUpdateValue = 0;
        				break;
        			case 60:
        				dimutGemelStatusUpdateValue = 0;
        				break;
        			case 70:
        				dimutPensionStatusUpdateValue = 0;
        				break;
        		}
        	}
        	
        	if ($scope.showActivation){
        		activationStatus = 0;
        		if ($scope.isActivationChecked){
        			activationStatusUpdateValue = 1;
        		} else {
        			activationStatusUpdateValue = 0;
        		}
        	} else {
        		activationStatus = -1;
        	}
        	
        	if ($scope.showAnnualMailing){
        		annualMailingStatus = 0;
        		if ($scope.isAnnualMailingChecked){
        			annualMailingStatusUpdateValue = 1;
        		} else {
        			annualMailingStatusUpdateValue = 0;
        		}
        	} else {
        		annualMailingStatus = -1;
        	}
        	
        	_clientDetailsFactory.submitUpdate(
        			_utils.getQsParams('ticket'),        			
        			$scope.userId,
        			$scope.firstName,
        			$scope.lastName,
        			$scope.email,
    				document.getElementById('areaCode').value,
    				$scope.phoneSuffix,
    				$scope.cityName,
    				$scope.streetName,
    				$scope.streetNumber,
    				$scope.zipCode,
    				activationStatus,
    				annualMailingStatus, 
    				dimutPensionStatusUpdateValue,
            		dimutLifeStatusUpdateValue,
            		dimutGemelStatusUpdateValue,
            		dimutHealthStatusUpdateValue,
    				activationStatusUpdateValue,
    				annualMailingStatusUpdateValue,
    				function(status, data) {
        		
				if (status == 200) {
	    			$scope.showSuccess = true;
	    			$scope.showDetailsSection = false;
	            	$scope.showActionSection = false;	    			
	    		} else {
	               _utils.showErrorPage();
	    		}  
        	});
        };
        
        $scope.undoChanges = function(){
        	
        	if ($scope.selectedAreaCode){
	        	if ($scope.selectedAreaCode.prefix != $scope.phonePrefix){
	        		$timeout(function(){
		        		$scope.selectedAreaCode = {telCode: "", prefix: "בחר"};
		        		$scope.phonePreffixSelectionChange();
	        		});
	        	}  
        	} else {
        		$timeout(function(){
        			$scope.isPhonePreffixValid = false;
        		});
        	}
        	
        	$scope.isActivationChecked = true;
        	$scope.isAnnualMailingChecked = true;
        	
        	if ($scope.defaultData.userId != $scope.userId){
        		$scope.userId = $scope.defaultData.userId;
        	}        	
        	if ($scope.defaultData.firstName + " " + $scope.defaultData.lastName != $scope.name){
        		$scope.userId = $scope.defaultData.firstName + " " + $scope.defaultData.lastName;
        	}        	
        	if ($scope.defaultData.cityName != $scope.cityName){
        		$scope.cityName = $scope.defaultData.cityName;
        	}
        	if ($scope.defaultData.email != $scope.email){
        		$scope.email = $scope.defaultData.email;
        	}
        	if ($scope.defaultData.phonePrefix != $scope.phonePrefix){
        		$scope.phonePrefix = $scope.defaultData.phonePrefix;
        		if ($scope.phonePrefix != ''){
            		$scope.isPhonePreffixValid = true;
            	}
        	}
        	if ($scope.defaultData.phoneSuffix != $scope.phoneSuffix){
        		$scope.phoneSuffix = parseInt($scope.defaultData.phoneSuffix);
        	}
        	if ($scope.defaultData.cityName != $scope.cityName){
        		$scope.cityName = $scope.defaultData.cityName;
        	}
        	if ($scope.defaultData.streetNumber != $scope.streetNumber){
        		$scope.streetNumber = parseInt($scope.defaultData.streetNumber);
        	}
        	if ($scope.defaultData.streetName != $scope.streetName){
        		$scope.streetName = $scope.defaultData.streetName;
        	}
        	if ($scope.defaultData.zipCode != $scope.zipCode){
        		$scope.zipCode = parseInt($scope.defaultData.zipCode);
        	}
        	
        	$scope.scrollTop();
        	
        	//TODO - do we need to undo box selections ?
        	
        };
        
        $scope.activationOpenPopup = function(){
        	//document.getElementById('terms').className = 'hsg-modal hsg-open';
        	$("#terms").hsg("modal.show");
        };
        
        $scope.activationApproveBtnClick = function(){
        	$("#terms").hsg("modal.hide");
        	$scope.isActivationChecked = true;
        };
        
        $scope.scrollTop = function() {
        	$("html, body").animate({ scrollTop: 0 }, "slow");
        };
        
        $scope.phonePreffixSelectionChange = function(){
        	//$scope.selectedAreaCode.prefix
        	$scope.isPreffixFirstTime = false;
        	$timeout(function(){
        		if ($scope.selectedAreaCode.telCode == ""){
            		$scope.isPhonePreffixValid = false;
            		return;
            	}  
            	$scope.isPhonePreffixValid = true;
        	});
        };
        
        
        $scope.onEmailChange = function(){
        	$scope.isEmailFirstTime = false;
        };
        
        $scope.onSuffixChange = function(){
        	$scope.isSuffixFirstTime = false;
        };        
        
        $scope.onCityChange = function(){
        	$scope.isCityFirstTime = false;
        }; 
        
        $scope.onStreetNumberChange = function(){
        	$scope.isStreetNumberFirstTime = false;
        }; 
        
        $scope.onStreetNameChange = function(){
        	$scope.isStreetNameFirstTime = false;
        }; 
        
        $scope.onZipCodeChange = function(){
        	$scope.isZipCodeFirstTime = false;
        }; 
        
        $scope.onActivationTermsFocus = function(){
        	document.getElementById("approve-activation-btn").focus();
        };
        
        //controller kickoff function / onload    
        //$scope.EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //$scope.EMAIL_REGEXP = /[a-zA-Z0-9][\w\x2E\x2D]*[a-zA-Z0-9]\x40[a-zA-Z0-9][\w\x2E\x2D]*[a-zA-Z0-9]\x2E[a-zA-Z][a-zA-Z\x2E]*[a-zA-Z]/;
        $scope.EMAIL_REGEXP = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
        $scope.init();
    	
    }]);