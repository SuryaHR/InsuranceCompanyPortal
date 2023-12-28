angular.module('MetronicApp').controller('ItemsHoldoverController', function ($rootScope, $uibModal, $scope, settings, $http, $timeout, $location, $translate, $translatePartialLoader) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
   
   
   
   

    //set language
    $translatePartialLoader.addPart('ItemsHoldover');
    $translate.refresh();
   
    $scope.ClaimNumber = sessionStorage.getItem("AdjusetrClaimNo")

    $scope.GoBack=function()
    {
        $location.url('AdjusterPropertyClaimDetails')
    }

    $scope.displayCheck = false;
    $scope.displayDebitCard = false;
    $scope.paymentButton = false;

    $scope.ShowCheckSection=function(e)
    {
        $scope.displayCheck = true;
        $scope.displayDebitCard = false;
        $scope.paymentButton = true;

    }
    $scope.ShowDebitCard = function (e) {
        $scope.displayCheck = false;
        $scope.displayDebitCard = true;
        $scope.paymentButton = true;

    }
});