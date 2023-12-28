angular.module('MetronicApp').service('CompanyHomeService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get comapny list
    this.GetCompanyList = function () {
        var response=$http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/companylist",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Auth-Token": sessionStorage.getItem("AccessToken")
            }
        });
        return response;
    }

    //Get States Details  
    this.getStateList = function (param) {
        var response = $http({
            method: "post",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/states",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Save Company 
    this.AddCompany = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/add/company",
            data: Param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    this.UpdateCompany = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/company",
            data: Param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    //Save conatct details
    this.NewContact = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/contact/create",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Save conatct details
    this.GetOfficeList = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/officelist",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        
        return response;
    };

    //Get Company Details   
    this.getCompanyDetails = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/company/details",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });

        return response;
    };

    //Get Company Details  
    this.UpdateCompanyDetails = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/company",
            data: Param,
            headers: AuthHeaderService.getFileHeader()
        });

        return response;
    }; 

    this.GetCompanyBackgroundImages = function (Param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/company-backgroundImage",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.UpdateCompanyLogo = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/company/logo",
            data: Param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    this.DeleteCompanyBranch = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/delete/branch",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //deleting the company Background image
    this.DeleteBackgroundImage = function (Param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/background-image",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });

        return response;
    }; 
}]);