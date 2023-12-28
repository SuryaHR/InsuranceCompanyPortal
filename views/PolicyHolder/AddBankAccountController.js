angular.module('MetronicApp').controller('AddBankAccountController', function ($translate, $translatePartialLoader, $scope, $uibModal, $rootScope, $state, settings,
    $location, MyPaymentService) {
    //$scope.$on('$viewContentLoaded', function () {
    //    // initialize core components
    //    App.initAjax();
    //});
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('AddBankAccount');
    $translate.refresh();

    $scope.ErrorMessage;
    $scope.StateList = [];
    $scope.State;
    $scope.BankDetails = {};
    function init()
    {
        var getStateList = MyPaymentService.getStates();
        getStateList.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

    }
    init();
    $scope.cancel=function()
    {       
        $scope.$close();
    }

});