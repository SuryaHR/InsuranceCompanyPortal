angular.module('MetronicApp').service('InsuranceReportService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //Insurance Agent review
    this.getAppraisalStatusList = function(){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/reports/all/appraisal_status",
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.getPolicyReportList = function(param){
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/get/policy_reports?startPos="+param.startPos+"&maxCount="+param.maxCount,
            data:param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.getItemCategorySplit = function(param){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/reports/get/itemCategoryCount?statusFlag="+param.statusFlag+"&agentId="+param.agentId,
            data:'',
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //getApprovedItemCategorySplit
    this.getApprovedItemCategorySplit = function(param){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/reports/get/itemCategoryApprovedCount?statusFlag="+param.statusFlag+"&agentId="+param.agentId,
            data:'',
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.getAgencyPerformance = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/reports/get/efficiency/report/list?statusFlag="+param.statusFlag+"&agentId="+param.agentId,
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getArticleCoverageTrend = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/reports/get/coverage/trends/report?statusFlag="+param.statusFlag+"&agentId="+param.agentId,
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getPremiumTrend = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/reports/get/premium/trends/report?statusFlag="+param.statusFlag+"&agentId="+param.agentId,
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getArticleCoverageTrendForUnderwriter = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/underwriter/get/coverage/trends/report?statusFlag="+param.statusFlag+"&agentId="+param.agentId,
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getPremiumTrendForUnderwriter = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/underwriter/get/premium/trends/report?statusFlag="+param.statusFlag+"&agentId="+param.agentId,
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    this.getUnderWriterPolicyReportList = function(param){
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/underwriter/get/policy_reports?startPos="+param.startPos+"&maxCount="+param.maxCount,
            data:param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //getUnderwritter  item category split

    this.getUnderwriterItemCategorySplit = function(param){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/underwriter/get/itemCategoryCount?statusFlag="+param.statusFlag+"&underwritterId="+param.agentId,
            data:'',
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //getApprovedItemCategorySplit
    this.getUnderwritterApprovedItemCategorySplit = function(param){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/underwriter/get/itemCategoryApprovedCount?statusFlag="+param.statusFlag+"&underwritterId="+param.agentId,
            data:'',
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //Get UnderWriter AgencyPerformanceReoport
    this.getUnderWriterAgencyPerformance = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/underwriter/get/agency/report/list?statusFlag="+param.statusFlag+"&agentId="+param.agentId,
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    this.getMyAppraisalList = function(param){
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/reports/get/policy_reports?startPos="+param.startPos+"&maxCount="+param.maxCount+"&request="+"My_Appraisal",
            data:param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //Get agents list
    this.getAgentsByState = function (stateId) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/reports/get/agents/list?stateId=" + stateId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getAllAgency = function(){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/reports/get/all/agency",
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
}]);
