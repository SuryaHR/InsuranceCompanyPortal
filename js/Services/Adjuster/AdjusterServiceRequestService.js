angular.module('MetronicApp').service('AdjusterServiceRequestService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get Service request notes 
    this.GetServiceRequestNotes = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/notes",//web/servicerequest/notes
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Get vendor list
    this.getVendorForAssignServiceRequest = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Add note 
    this.addNote = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/push/note", //web/servicerequest/note
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }   

    //Update service request API #217
    this.UpdateServiceRequest = function (param) {
        var saveDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/servicerequest",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return saveDetails;
    }

    //Create new service request
    this.NewServiceRequest = function (param) {
        var saveDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/create/servicerequest",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return saveDetails;
    }

    //Get status list for service
    this.GetStatusList=function(){
        var statusList = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/servicerequest/status",           
            headers: AuthHeaderService.getHeader()
        });
        return statusList;
    }
    //Get details on serviceId
    this.GetServiceDetails = function (param) {
        var serviceDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/servicerequest/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return serviceDetails;
    }
    //Delete service request
    this.DeleteServiceRequest = function (param) {
        var servicerequest = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/servicerequest",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return servicerequest;
    }

    //List of service request category API#222
    this.getCategoriesList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/servicerequest/categories",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Assign service request to 3rd party vendor
    this.AssignServiceRequest = function (param) {
        var Assignresponse = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/servicerequest/assign/vendor",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Assignresponse;
    }
   
    //List of vendors API#233
    this.getVendorList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/service/claim/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get Vendors List Against Claim  - API #172
    this.getVendorsListAgainstClaim = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/participants",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //API#624 Service to delete media file from Vendor side schema
    this.deleteMediaFile = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/delete/mediafiles",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //API#5 Service to update claim status
    this.DeleteNote = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/delete/note",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);