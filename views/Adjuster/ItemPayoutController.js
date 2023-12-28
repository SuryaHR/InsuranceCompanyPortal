angular.module('MetronicApp').controller('ItemPayoutController', function ($rootScope, $scope, settings, $http, $timeout, $location, $translate, $translatePartialLoader) {

    //$scope.$on('$viewContentLoaded', function () {
    //    // initialize core components
    //    App.initAjax();
    //});

    //set language
    $translatePartialLoader.addPart('ItemPayout');
    $translate.refresh();

    $scope.DirectDepositSection = false;
    $scope.DebitCardSection = false;
    $scope.CheckSection = false;
    $scope.GetPaymentMethod;

    $scope.ok = function () {
        //Success Call Back is the value to be pass after opertion deone
        $scope.$close();
    };
    $scope.cancel = function () {

        $scope.$close();
    };
    $scope.check = check;
    function check(first, second)
    {
        var thisbutton = angular.element(document.querySelector(first));
        var otherbutton = angular.element(document.querySelector(second));
       
        thisbutton.removeClass('btn-outline');
        thisbutton.addClass('solid');
        otherbutton.addClass('btn-outline');
        otherbutton.removeClass('solid');

    }

    $scope.ShowPaymentDetails=function(param)
    {
        if(param=='DirectDeposit')
        {
            $scope.DebitCardSection = false;
            $scope.CheckSection = false;
            $scope.DirectDepositSection = true;
         
        }
        else if (param == 'DebitCard')
        {
            $scope.DebitCardSection = true;
            $scope.CheckSection = false;
            $scope.DirectDepositSection = false;
        }
        else if(param='check')
        {
            $scope.DebitCardSection = false;
            $scope.CheckSection = true;
            $scope.DirectDepositSection = false;
        }
    }
   


});