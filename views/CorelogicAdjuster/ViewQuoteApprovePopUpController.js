angular.module('MetronicApp').controller('ViewQuoteApprovePopUpController',function($rootScope, $scope, settings, $translate, $translatePartialLoader,){
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    function init(){
        $scope.approveMessage = "";
    }
    init();
    $scope.cancel = function () {
        $scope.$close();
    };
    $scope.ok = function() {
        $scope.$close($scope.approveMessage);
    }
});