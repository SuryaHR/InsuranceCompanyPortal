angular.module('MetronicApp').service('BusinessRuleService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetRoleList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/roles",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetPaymentTerms = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/paymentterms",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.AddNewPaymentTerm = function (param) {
        var save = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/paymentterms",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return save;
    }
    this.UpdatePaymentTerm = function (param) {
        var Update = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/paymentterms",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Update;
    }
    this.GetPaymentOption = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/payment/modes",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.AddNewPaymentOption = function (param) {
        var save = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/paymentmode/add",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return save;
    }
    this.UpdatePaymentOption = function (param) {
        var Update = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/paymentmode/update",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Update;
    }
    this.ChangePaymentTermStatus = function (param) {
        var Status = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/changestatus/paymentterms",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Status;
    }
    this.ChangePaymentOptionStatus = function (param) {
        var Status = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/paymentmode/update/actions",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Status;
    };

    this.updateRole = function (param) {
        var response = $http({
            method: "Put",
            url: AuthHeaderService.getApiURL() + "web/role/update",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetStateList = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/states",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetStateTax = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/state/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.UpdateStateTax = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/update/state",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);