angular.module('MetronicApp').controller('IncedentPicturePopupController', function ($rootScope, $uibModal, $scope, $translate, $translatePartialLoader,
    objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('IncedentPicture');
    $translate.refresh();



    $scope.cancel = function () {
        $scope.$close();
    };
});