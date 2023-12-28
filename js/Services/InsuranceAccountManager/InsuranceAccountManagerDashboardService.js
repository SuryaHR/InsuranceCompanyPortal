angular.module('MetronicApp').service('InsuranceAccountManagerDashboardService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {


    //Get Notifications => Get all policies close to renewal date and Updates on appraisals.
    this.getNotifications = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/policy/appraisals/notifications/" + param.limit +
                "?ParticipantId=" + param.ParticipantId + "&Company=" + param.Company + "&Role=" + param.Role + "&GetPolicyAlert=" + param.GetPolicyAlert,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getReportList = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/agency/report/list/" + param.pageNumber + "/" + param.itemsPerPage + "?keyword=" + param.keyword + "&sortBy=" + param.sortBy + "&orderBy=" + param.orderBy,
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get policies due for renewal within a month, appraisals having speedcheck value older than 3 years
    this.getPoliciesAndAppraisalsCount = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/count/expiring-policies/due-appraisals",
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get policy holders review status count
    this.getPolicyHoldersReviewStatus = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/policyholder/appraisalresults?statusFlag=" + param.statusFlag + "&agentId=" + param.agentId,
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //remove Notifications.
    this.removeNotification = function (notification) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/remove/notification?notificationId=" + notification.id,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getAppraisalsNeedSCUpdate = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/get/all/appraisals/need/speedcheck_update",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getPolicyExpiringAppraials = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/get/all/appraisals/policy_expiring",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getAppraisalReports = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/get/appraisal_reports?startPos=" + param.startPos + "&maxCount=" + param.maxCount,
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

     // getSpeedcheckMarkups
     this.getSpeedcheckMarkups = function (companyUrn) {
        var respComp = $http({
            method: "GET",
            url: AuthHeaderService.getSpeedCheckApiURL() + "web/get/speedcheck/markups?companyUrn="+companyUrn,
            headers: {
                "Content-Type":"application/json"
            }
        });
        return respComp;
    }
}]);
