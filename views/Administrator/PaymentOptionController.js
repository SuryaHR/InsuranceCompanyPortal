angular.module('MetronicApp').controller('PaymentOptionController', function ($rootScope, $scope,
    settings, $location, $translate, $translatePartialLoader, BusinessRuleService, AuthHeaderService) {

    //set language
    $translatePartialLoader.addPart('BusinessRules');
    $translate.refresh();
    $scope.PaymentOptions;
    function init() {      
        GetPaymantoptions();       
    };
    init();
   $scope.sortPay = function (keyname) {
        $scope.sortKeyPay = keyname;   //set the sortKey to the param passed      
        $scope.reversepay = !$scope.reversepay; //if true make it false and vice versa
    }

    //Payment mode/options
    function GetPaymantoptions() {
        var GetPaymentOption = BusinessRuleService.GetPaymentOption();
        GetPaymentOption.then(function (successoption) {
            $scope.PaymentOptions = [];
            $scope.PaymentOptions = successoption.data.data;
        }, function (error1) {
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

    $scope.selectedPaymentOption = {};
    $scope.NewPaymentoption = false;
    $scope.AddNewPaymentOption = AddNewPaymentOption;
    function AddNewPaymentOption() {
        $scope.selectedPaymentOption = {};
        $scope.NewPaymentoption = true;
        // $scope.EditPaymentTerm = false;
    }

    $scope.getTemplatePay = function (item) {
        if (!angular.isUndefined(item)) {
            if (item.id === $scope.selectedPaymentOption.id) return 'edit1';
            else
                return 'display1';
        }
        else
            return 'display1';
    };
    $scope.resetPaymentOption = function () {
        $scope.NewPaymentoption = false;
        // $scope.EditPaymentTerm = false;
        $scope.selectedPaymentOption = {};
    };
    $scope.EditPaymentOption = function (item) {
        $scope.NewPaymentoption = false;
        $scope.selectedPaymentOption = {};
        $scope.selectedPaymentOption = angular.copy(item);
    }
    $scope.SavePaymentOption = SavePaymentOption;
    function SavePaymentOption() {
        if (angular.isDefined($scope.selectedPaymentOption.id) && $scope.selectedPaymentOption.id !== null) {
            //Update 
            var param = {
                "id": $scope.selectedPaymentOption.id,
                "modeOfPayment": $scope.selectedPaymentOption.modeOfPayment,
                "description": $scope.selectedPaymentOption.description,
                "status": $scope.selectedPaymentOption.status,
                "actions": $scope.selectedPaymentOption.actions
            };
            var SaveDetails = BusinessRuleService.UpdatePaymentOption(param);
            SaveDetails.then(function (success) {
                $scope.resetPaymentOption();
                GetPaymantoptions();
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");

            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
        else {
            //Add new AddNewPaymentTerm
            var param = {
                "modeOfPayment": $scope.selectedPaymentOption.modeOfPayment,
                "description": $scope.selectedPaymentOption.description,
                "status": $scope.selectedPaymentOption.status,
                "actions": true
            };
            var SaveDetails = BusinessRuleService.AddNewPaymentOption(param);
            SaveDetails.then(function (success) {
                $scope.resetPaymentOption();
                GetPaymantoptions();
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");

            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }
    $scope.EnableDisablePaymentOption = EnableDisablePaymentOption;
    function EnableDisablePaymentOption(item, status) {
        var param =
            {
                "id": item.id,
                "status": status
            };
        var SaveDetails = BusinessRuleService.ChangePaymentOptionStatus(param);
        SaveDetails.then(function (success) {
            $scope.resetPaymentOption();
            GetPaymantoptions();
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };


   
});