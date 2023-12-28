angular.module('MetronicApp').controller('PolicyHolderHomeController', function ($translate, $translatePartialLoader, $scope, $uibModal, $rootScope, $state, settings,
    $location, PolicyHolderHomeService) {
    //$scope.$on('$viewContentLoaded', function () {
    //    // initialize core components
    //    App.initAjax();
    //});
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('PolicyHolderHome');
    $translate.refresh();
    $scope.PolicyList = [];
    $scope.InsuranceAccountNo;
    
    $scope.ErrorMessage;

    function init()
    {
        var GetPolicyList = PolicyHolderHomeService.getPolicyList();
        GetPolicyList.then(function (success) {
            if (success.data.data !== null) {
                $scope.PolicyList = success.data.data.policyDetails;
                $scope.InsuranceAccountNo = success.data.data.insuranceAccountNumber;
            }
        }, function (error) {
            $scope.PolicyList = [];
            $scope.InsuranceAccountNo = ""; toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    init();
});