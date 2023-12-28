angular.module('MetronicApp').service('UnderWriterDashboardService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get AppraisalList for review
    this.getAppraisalList = function (data) {
        var responseSave = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/list/appraisals/" + data.page + "/" + data.maxCount + "?&role=" + data.role + "&keyword=" + data.keyword + "&sortBy=" + data.sortBy + "&orderBy=" + data.orderBy,
            headers: AuthHeaderService.getHeader()
        });
        return responseSave;
    }

    //get alert ,notifications ,reminder
    this.getAlerts = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/policy/appraisals/notifications/" + param.limit +
                "?ParticipantId=" + param.ParticipantId + "&Company=" + param.Company + "&Role=" + param.Role + "&GetPolicyAlert=" + param.GetPolicyAlert,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    // get list of appraisal approved by underwriter
    this.getAllAppraisals = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/get/all/reviewed/appraisals",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    // get list of additional     
    this.getAdditionalInsuranceRequests = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/get/list/new_insurance_requests",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    // update Additional Appraisal Request
    this.updateAdditionalAppraisalRequest = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/new_insurance_requests",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get alert ,notifications ,reminder
    this.getCountryList = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/get/country/list",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //getWineVarietalList on change of item type
    this.getWineVarietalList = function (typeId) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/appraisal/wine/varietal/dropdowns?itemTypeId=" + typeId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Get Auto Inasurance Requests.
    this.getAutoInsuranceRequests = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/automobile/insurance/get/list",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Get AutoIns Details By Id
    this.getAutoInsDetails = function (insuranceId) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/get/automobile/insurance/" + insuranceId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Update AutoIns By Id
    this.updateVehicleAppraisal = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "customer/automobile/insurance/update",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }
    this.getPolicyReport = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/export/policy?&fileType="+param.fileType,
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'

        })
        return response;
    }

}]);
