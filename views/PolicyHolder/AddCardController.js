angular.module('MetronicApp').controller('AddCardController', function ($translate, $translatePartialLoader, $scope, $uibModal, $rootScope, $state, settings,
    $location) {
    //$scope.$on('$viewContentLoaded', function () {
    //    // initialize core components
    //    App.initAjax();
    //});
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('AddBankAccount');
    $translate.refresh();
    $scope.CardDetails = {};
       
  
    $scope.cancel = function () {
       
        $scope.$close();
    }
    $scope.Months = [{ Id: 1, Name: "Jan" }, { Id: 1, Name: "Feb" }, { Id: 1, Name: "March" }, { Id: 1, Name: "April" }
        , { Id: 1, Name: "May" }, { Id: 1, Name: "June" }, { Id: 1, Name: "Jully" }, { Id: 1, Name: "Aug" }
        , { Id: 1, Name: "Sept" }, { Id: 1, Name: "Oct" }, { Id: 1, Name: "Nov" }, { Id: 1, Name: "Dec" }
    ];
    $scope.CardDetails.ExpiryMonth =parseInt(5);
    $scope.Years = [{ Id: 1, Year: "2017" }, { Id: 2, Year: "2018" }, { Id: 3, Year: "2019" }, { Id: 4, Year: "2020" }, { Id: 5, Year: "2021" }, { Id: 6, Year: "2022" }]
});