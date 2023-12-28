angular.module('MetronicApp').service('InsuranceInvoicesService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //Get states list
    this.getStates = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/get/state/list",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get agent list
    this.GetListOfAgent = function (param) {
        var GetAgent = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/agents",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return GetAgent;
    }

    //Get homeowner policyType list
    this.getHomeOwnerPolicyTypes = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/get/homeowner/policytypes",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get all Invoices list
    this.getInvoicesDetails = function (status) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/speedcheck/associates",
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getMonthlyInvoices = function(param){
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/list/appraisal_invoices",    
            data: param,   
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getMonthlyInvoiceDetails = function (invoiceNumber) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/monthly/invoice/details/" + invoiceNumber,
            data: "",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getSubInvoicesForMonthly = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/get/appraisalInvoices",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getAppraisalInvoices = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/list/appraisal_invoices?page=" + param.page + "&max=" + param.max +
                "&q=" + param.searchKeyword +
                "&states=" + param.states +
                "&sort_by=" + param.sortBy +
                "&order=" + param.orderBy +
                "&effectiveFromDate=" + param.fromDate +
                "&effectiveToDate=" + param.toDate,
            data: "",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getMonthlyInvoicePDF = function (invoiceNumber){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/download/monthly/invoice/" + invoiceNumber,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        });
        return response;
    }
    
    this.getAppraisalInvoicesExcel = function (param){
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/download/appraisal/invoices/excel",
            headers: AuthHeaderService.getHeader(),
            data:param,
            responseType: 'arraybuffer'
        });
        return response;
    }

    this.getGraphData  = function(numberOfMonths){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/appraisal/invoices/graph_data/" + numberOfMonths,
            headers: AuthHeaderService.getHeader(),
        });
        return response;
    }

    //Item Categories
    this.getAppraisalItemCategories = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/item/categories",
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);
