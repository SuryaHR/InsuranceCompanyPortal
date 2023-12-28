angular.module('MetronicApp').controller('StateTaxController', function ($rootScope, $scope,
    settings, $location, $translate, $translatePartialLoader,BusinessRuleService) {

    //set language
    $translatePartialLoader.addPart('BusinessRules');
    $translate.refresh();

    $scope.StateList = []
    $scope.Selected = {};

    function init() {
        $(".page-spinner-bar").removeClass("hide");
        GetStateList();
    };


    $scope.GetStateList =GetStateList;
    function GetStateList()
        {
            param = {
                "isTaxRate": true,
                "isTimeZone": false
            };
            var GetStateList = BusinessRuleService.GetStateList(param);
            GetStateList.then(function (success) {
                $scope.StateList = success.data.data;
                angular.forEach($scope.StateList, function (state) {
                    state.isEdit = false;
                });
                $(".page-spinner-bar").addClass("hide");
            },
            function (error) {
            });
        }
    //$scope.onStateChange = function (state) {
    //    $scope.stateID = state;
    //    param = {
    //        "id": state
    //    };
    //    var GetStateTax = BusinessRuleService.GetStateTax(param);
    //    GetStateTax.then(function (success) {
    //        $scope.TaxRate = success.data.data.taxRate;
    //    },
    //    function (error) {
    //        $scope.TaxRate =0;
    //    });       
    //}

    $scope.SelectValue = SelectValue;
    function SelectValue(state) {
        angular.forEach($scope.StateList, function (state) {
            state.isEdit = false;
        });
        state.isEdit = true;
    };

    $scope.Close=function(state)
    {
        state.isEdit = false;
    }
    $scope.UpdateStateTax = function (state) {
         
        param = {
            "id": state.id,
            "taxRate": state.taxRate
        };
         
        var UpdateStateTax = BusinessRuleService.UpdateStateTax(param);
        UpdateStateTax.then(function (success) {
             
            toastr.remove()
            toastr.success(success.data.message, "Confirmation");
            $scope.GetStateList();
        },
        function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, "Error while updating");
        });
    }

    init();
    $scope.GoToHome=function()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});