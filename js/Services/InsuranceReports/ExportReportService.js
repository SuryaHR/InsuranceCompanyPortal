angular.module('MetronicApp').service('ExportReportService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

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

    this.exportAgentsReport = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/export/agent_reports?fileType="+param.fileType,
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        })
        return response;
    }

    this.getPolicyholderReviewReports = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/export/policyholder_review_reports?fileType="+param.fileType+"&agentId="+param.agentId,
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        })
        return response;
    }

    this.getCoverageAndPremiumReports = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/export/coverage/premium?fileType="+param.fileType,
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        })
        return response;
    }

    this.exportItemCategorySplitReport = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/export/item_category_split_reports?fileType="+param.fileType+"&agentId="+param.agentId,
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        })
        return response;
    }


    this.exportPerformanceReport = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/export/efficiency/report/list?fileType="+param.fileType,
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        })
        return response;
    }

    this.exportPerformanceReportForInsuranceManager = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/export/efficiency/report/list?fileType="+param.fileType+"&agentId="+param.agentId,
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        })
        return response;
    }

}]);
