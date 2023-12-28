angular.module('MetronicApp').controller('ItemValueController', function ($rootScope, $scope, settings, $translate, $translatePartialLoader,ItemValueService, items) {

    //$scope.$on('$viewContentLoaded', function () {
    //    // initialize core components
    //    App.initAjax();
    //});

    //set language
    $translatePartialLoader.addPart('ItemValue');
    $translate.refresh();
    $scope.ItemDetails = items;
    $scope.ACVSection = true;
    $scope.RCVSection = false;

    $scope.displayACV = function ()
    {
        $scope.ACVSection = true;
        $scope.RCVSection = false;
    }
    $scope.displayRCV = function () {
        $scope.ACVSection = false;
        $scope.RCVSection = true;
    }

    $scope.ok = function () {
        //Success Call Back is the value to be pass after opertion deone
        var param = {
            "id": $scope.ItemDetails.ItemId,
            "acv": $scope.ItemDetails.acv,
            "depriciationRate": $scope.ItemDetails.depriciationRate,
            "taxRate": $scope.ItemDetails.taxRate,
            "valueOfItem": $scope.ItemDetails.TotalValue
        };
       
        var response = ItemValueService.SaveItemValue(param);
        response.then(function (success) {  $scope.$close("Success"); }, function (error) {
            if (error.data !== null)
                $scope.Errormessage = error.data.errorMessage;
            else
                $scope.Errormessage = $translate.instant("ErrorMessage.Failed");
        });
    };
    $scope.cancel = function () {

        $scope.$close();
    };
});