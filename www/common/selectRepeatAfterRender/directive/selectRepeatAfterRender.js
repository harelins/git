angular.module('hrl').directive('selectRepeatAfterRender',[ '$timeout', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
        	$(".hsg-select").selectOrDie("update");
        });
      }
    }
  };
}]);