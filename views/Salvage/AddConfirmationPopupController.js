angular.module('MetronicApp').controller('AddConfirmationPopupController',function($scope,ClaimObj){
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    
    $scope.CommonObj = {
        "approveMessage": "",
        "action": ClaimObj.action,
        "type": angular.isDefined(ClaimObj.type) && ClaimObj.type != '' ? ClaimObj.type : null

    }
    $scope.cancel = function () {
        $scope.$close();
    };
    $scope.ok = function() {
        $scope.$close($scope.CommonObj.approveMessage);
    }
});