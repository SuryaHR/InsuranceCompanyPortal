angular.module('MetronicApp').service('ThirdPartyContractService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.getContracts = function () {       
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/contracts",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //API#599 Service for the insurance company to get the list of the salvage contract
    this.getSalvageContracts = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/salvage/contract",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //API #116
    this.getVendorList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    
    this.NewContract = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/contract/add",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }
    
    //API#593 Service for insurance  company to add salvage contract against vendor
    this.NewSalvageContract = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/salvage/add",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }

    this.UpdateContracts = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/contract/update",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }
    //API#594 Service for insurance  company to update salvage contract against vendor.
    this.UpdateSalvageContracts = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/salvage/update",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }
    this.DeleteContracts = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/contract/delete",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //API#600 Service for the insurance company to delete the salvage contract.
    this.DeleteSalvageContracts = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/contract/salvage/delete",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get Email Templates
    this.GetEmailTemplatesList = function () {      
        var response = $http({
            method: "Get",         
            url: AuthHeaderService.getApiURL() + "web/email/templates",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetEmailTemplatesDetails = function (param) {
        var response = $http({
            method: "POST",         
            url: AuthHeaderService.getApiURL() + "web/email/template/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    
    this.getContractsDetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/contract/detail",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API#596 Service for insurance company to get the details of the salvage contract.
    this.getSalvageContractsDetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/get/salvage/contract/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getVendorDetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/vendor/company/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Get Category List
    this.GetCategoryList = function (param) {
        var GetCategoryList = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return GetCategoryList;
    }

     // deleteContractAttachements
     this.deleteContractAttachements = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/contract/attachment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    // saveVendorSpecialities
    this.saveVendorSpecialities = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/add/vendor/specialities",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //getVendorSpecialities
    this.getVendorSpecialities = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/vendor/specialities/"+param.vendorId,
            
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //API#598 Service for the vendor company to update the salvage contract.
     this.updateSpeedCheckContract = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/contract/update",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }

   //API#599 Service for the vendor company to update the salvage contract.
   this.newSpeedCheckContract = function (param) {
    var response = $http({
        method: "POST",
        url: AuthHeaderService.getApiURL() + "web/contract/add",
        data: param,
        headers: AuthHeaderService.getFileHeader()
    });
    return response;
}


}]);