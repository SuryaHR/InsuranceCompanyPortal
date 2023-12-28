angular.module('MetronicApp').controller('PaymentTermsController', function ($rootScope, $scope,
    settings, $location, $translate, $translatePartialLoader, BusinessRuleService, AuthHeaderService) {

    //set language
    $translatePartialLoader.addPart('BusinessRules');
    $translate.refresh();

    $scope.PaymentTerms;
    function init() {
        GetPaymantTermList();       
    };
    init();
    //Get payment term
    function GetPaymantTermList() {
        var GetPaymentTerms = BusinessRuleService.GetPaymentTerms();
        GetPaymentTerms.then(function (success) {
            $scope.PaymentTerms = [];
            $scope.PaymentTerms = success.data.data;
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
        });
    }
    // For payment terms
    $scope.selected = {};
    $scope.NewPaymentTerm = false;
    $scope.AddNewPaymentTerm = AddNewPaymentTerm;
    function AddNewPaymentTerm() {
        $scope.selected = {};
        $scope.NewPaymentTerm = true;
        // $scope.EditPaymentTerm = false;
    }
    $scope.CancelPaymentTerm = CancelPaymentTerm;
    function CancelPaymentTerm() {
        $scope.NewPaymentTerm = false;
    }
    $scope.getTemplate = function (item) {
        if (!angular.isUndefined(item)) {
            if (item.id === $scope.selected.id) return 'edit';
            else
                return 'display';
        }
        else
            return 'display';
    };
    $scope.reset = function () {
        $scope.NewPaymentTerm = false;
        // $scope.EditPaymentTerm = false;
        $scope.selected = {};
    };
    $scope.EditPaymentTerms = function (item) {
        $scope.NewPaymentTerm = false;
        $scope.selected = {};
        $scope.selected = angular.copy(item);
    }
    $scope.SavePaymentTerm = SavePaymentTerm;
    function SavePaymentTerm() {
        if (angular.isDefined($scope.selected.id) && $scope.selected.id !== null) {
            //Update 
            var param = [
                {
                    "id": $scope.selected.id,
                    "name": $scope.selected.name,
                    "descriptions": $scope.selected.descriptions,
                    "status": $scope.selected.status
                }
            ];
            var SaveDetails = BusinessRuleService.UpdatePaymentTerm(param);
            SaveDetails.then(function (success) {
                $scope.reset();
                GetPaymantTermList();
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");

            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
        else {
            //Add new AddNewPaymentTerm
            var param = [
               {
                   "name": $scope.selected.name,
                   "descriptions": $scope.selected.descriptions,
                   "status": $scope.selected.status
               }
            ];
            var SaveDetails = BusinessRuleService.AddNewPaymentTerm(param);
            SaveDetails.then(function (success) {
                $scope.reset();
                GetPaymantTermList();
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");

            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }
    $scope.EnableDisablePaymentTerm = EnableDisablePaymentTerm;
    function EnableDisablePaymentTerm(item, status) {
        var param = {
            "id": item.id,
            "status": status
        };
        var SaveDetails = BusinessRuleService.ChangePaymentTermStatus(param);
        SaveDetails.then(function (success) {
            $scope.reset();
            GetPaymantTermList();
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");

        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    //Sort
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed      
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
});