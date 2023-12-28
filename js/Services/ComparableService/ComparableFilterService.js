
    angular.module('MetronicApp').service('ComparableFilterService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
        //Get Dropdown List
        this.getAppraisalDropdowns = function () {
            var response = $http({
                method: "GET",
                url: AuthHeaderService.getApiURL() + "web/get/appraisal/dropdowns",
                data:'',
                headers: AuthHeaderService.getHeader()
            });
            return response;
        };
    
        //getscpeedcheck value 
        this.getSpeedcheValues = function(param){
            var response = $http({
                method: "POST",
                url: AuthHeaderService.getSpeedCheckApiURL()+"web/get/speedcheck/values",
                data:param,
                headers: {
                    "Content-Type":"application/json"
                }
            });
            return response;
        }
    
        //speedcheck mapping values
        this.getSpeedcheMapping = function(){
            //var data={};
            var response =  $http.get('views/InsuranceAgent/Appraisals/speedcheckMapping.json')
                    .success(function (data) {
                       data = data;// console.log(data);
                    })
                    .error(function (data) {
                        //console.log("Error getting data from " + thisCtrl.route);
                    });
                    return response;
                }
    
    
        
        //UpdateAppraisal
        this.UpdateAppraisal = function (param){
            var response = $http({
                method: "POST",
                url: AuthHeaderService.getApiURL() +"web/appraisal/update",
                data:param,
                headers: AuthHeaderService.getFileHeader()
            });
            return response;
        }
    
       
    
       // Update appraisal status - Active/In-Active 
        this.updateAppraisalStatus = function (param)
        {
             var response = $http({
                method: "POST",
                url: AuthHeaderService.getApiURL() +"web/appraisal/status/update",
                data:param,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        }
    
        ///delete/appraisal/
        this.deleteAppraisal = function (appraisal) {
            var response = $http({
                method: "DELETE",
                url: AuthHeaderService.getApiURL() +"web/delete/appraisal/"+appraisal.appraisalId+"?speedCheckVendor="+appraisal.speedCheckVendor,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        };
        
        //Update Underwriter Appraisal premium
        this.updateInsurancePremium = function (param){
            var response = $http({
                method: "POST",
                url: AuthHeaderService.getApiURL() +"web/appraisal/premium/update",
                data:param,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        }
    
        // this.GetPolicyList = function (param) {
        //     var response = $http({
        //         method: "GET",
        //         url: AuthHeaderService.getApiURL() + "/customer/get/policyholder/list/"+param.pageNumber+"/"+param.itemsPerPage+"?agentId="+param.userId+"&policyStatus="+param.status,
        //         headers: AuthHeaderService.getHeader()
        //     });
        //     return response;
        // };
    
         //sending SMS to pH
         this.sendSMSToPolicyholder = function (param) {
            var response = $http({
                method: "post",
                url: AuthHeaderService.getApiURL() + "web/send/appraisal/plivo/sms",
                data: param,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        };
    
    
        this.ValidateMobileNumber = function (param) {
            var response = $http({
                method: "POST",
                url: AuthHeaderService.getApiURL() + "web/validate/appraisal/sms/lastdigits",
                data: param,
                headers: AuthHeaderService.getHeaderWithoutToken()
            });
            return response;
        }; 
    
        this.setPHReviewStatus = function(param){
            var response = $http({
                method: "post",
                url: AuthHeaderService.getApiURL() + "web/save/appraisal/policyholder/review/status",
                data: param,
                headers: AuthHeaderService.getHeaderWithoutToken()
            });
            return response;
    
        };
    
        //email appraisal
        this.EmailAppraisal = function(param){
            var response = $http({
                method: "post",
                url: AuthHeaderService.getApiURL() + "web/email/appraisal",
                data: param,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        }
    
        //url information
        this.getUrlData = function(param){
            var response = $http({
                method: "post",
                url: AuthHeaderService.getApiURL() + "web/url/appraisal",
                data: param,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        }
    
        //DeletePolicy
        this.deteleAttachment = function(deleteParam){
            var response = $http({
                method: "DELETE",
                url: AuthHeaderService.getApiURL() + "web/delete/attachment?url="+deleteParam,
                //data: deleteParam,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        }
    
        //Get activity logs
        this.getActivityLog = function (param) {
            var response = $http({
                method: "GET",
                url: AuthHeaderService.getApiURL() +"web/get/appraisal/logs/"+param.appraisalId,
                headers: AuthHeaderService.getFileHeader()
            });
            return response;
        };  
    
        //getAvgStoneCount
        this.getAvgStoneCount = function (param) {
            var response = $http({
                method: "post",
                url: AuthHeaderService.getApiURL() + "web/get/average/count",
                data: param,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        } 
    
        // get total unread logs
        this.getUnReadLogs = function(appraisalId) {
            var response = $http({
                method: "GET",
                url: AuthHeaderService.getApiURL() + "web/get/unread_activities/"+appraisalId,
                headers: AuthHeaderService.getHeader()
            });
            return response;
        }
    
        //API to get app setting values.
        this.getAppSettingValues = function(params) {
            var response = $http({
                method: "GET",
                url: AuthHeaderService.getApiURL() + "web/get/app/setting/values",
                headers: AuthHeaderService.getHeader()
            });
            return response;
    
        }
    }]);
    