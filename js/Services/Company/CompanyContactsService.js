angular.module('MetronicApp').service('CompanyContactsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetContactList = function () {
        
        var Contacts = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/company/contactslist",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Contacts;
    };

    this.GetDesignationList = function () {
        
        var Contacts = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/designation",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Contacts;
    }
  
    this.GetReportingManagerList = function (param) {
        
        var RepMgnr = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/reportingmanagers",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return RepMgnr;
    };

    this.GetBranchList = function (param) {
        
        var Branches = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/branches",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Branches;
    };
    

    this.GetRoleList = function () {

        var Roles = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/roles",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Roles;
    };

    
    this.AddNewContact = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/contact/create",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);