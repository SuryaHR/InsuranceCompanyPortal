    angular.module('MetronicApp').service('InsuranceAgentHomeService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
        //Get States Details  
        this.getStateList = function (param) {
            var response = $http({
                method: "post",
                data: param,
                url: AuthHeaderService.getApiURL() + "web/states",
                headers: AuthHeaderService.getHeader()
            });
            return response;
        };

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

        //get policyList by pooja
        this.GetPolicyList = function (param) {
            var response = $http({
                method: "GET",
                url: AuthHeaderService.getApiURL() + "customer/get/policies/" + param.pageNumber + "/" + param.itemsPerPage + "?agentId=" + param.userId + "&policyStatus=" + param.status+"&keyword="+param.keyword+"&orderBy="+param.orderBy+"&sortBy="+param.sortBy,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        };

        this.getKPIReport = function(userId,status) {
            var response = $http({
                method: "GET",
                url: AuthHeaderService.getApiURL() + "customer/kpi/reports?agentId="+userId+"&statusFlag="+status,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        }

        //get policy detail by id
        this.getPolicyDetailsById = function (param) {
            var response = $http({
                method: "GET",
                data: param,
                url: AuthHeaderService.getApiURL() + "customer/get/policyholder/details/" + param.id + "?agentId=" + param.AgentId + "&role=" + param.Role,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        };

        //DeletePolicy
        this.DeletePolicy = function (deleteParam) {
            var response = $http({
                method: "DELETE",
                url: AuthHeaderService.getApiURL() + "customer/delete/policy/" + deleteParam.policyId + "?speedCheckVendor=" + deleteParam.speedCheckVendor,
                //data: deleteParam,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        }

        this.savePolicy = function (param) {
            var responseSave = $http({
                method: "POST",
                data: param,
                url: AuthHeaderService.getApiURL() + "customer/create/policy",
                headers: AuthHeaderService.getHeader()
            });
            return responseSave;
        }
        //getAppraisalList

        this.getAppraisalList = function (policyNumber) {
            var responseSave = $http({
                method: "GET",
                url: AuthHeaderService.getApiURL() + "web/get/list/appraisals/1/100?policyNumber=" + policyNumber,
                headers: AuthHeaderService.getHeader()
            });
            return responseSave;
        }

        //Get Global Search results
        this.GlobalSearch = function (param) {
            var response = $http({
                method: "POST",
                //url: AuthHeaderService.getApiURL() + "web/insuranceagent/globalsearch?agentId="+param.agentId,
                url: AuthHeaderService.getApiURL() + "web/agent/search/"+"?"+"&userRole="+param.user_role+"&userId="+param.userId,
                data: param,
                headers: AuthHeaderService.getHeader()
            })
            return response;
        }        
    }]);