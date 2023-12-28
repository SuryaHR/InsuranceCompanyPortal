angular.module('MetronicApp').controller('ReportAttachedPopupController', function ($rootScope, $uibModal, $scope, $translate, $translatePartialLoader,
    objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('IncedentPicture');
    $translate.refresh();
    $scope.NoRecords = true;


    $scope.cancel = function () {
        $scope.$close();
    };
});