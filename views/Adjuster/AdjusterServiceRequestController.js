angular.module('MetronicApp').controller('AdjusterServiceRequestController', function ($translate, $translatePartialLoader, $scope, $rootScope, $state, settings, $location,
    AdjusterServiceRequestService, $filter) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('AdjusterServiceRequest');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.UploadedFiles = [];
    $scope.ServiceDetails = {};
    $scope.ServiceCategoryList = [];
    $scope.disableSave = false;
    function init() {
        $scope.CommonObj = { ClaimNumber: sessionStorage.getItem("ClaimNo") };
        var param = {
            "companyId": sessionStorage.getItem("CompanyId"),
            "claimNumber": sessionStorage.getItem("ClaimNo")
        }
        var VendorList = AdjusterServiceRequestService.getVendorList(param);
        VendorList.then(function (success) {

            $scope.VendorList = success.data.data;
             
            angular.forEach($scope.VendorList, function (value, key) {
                value.specialitiesList = '';
                value.ServicesList = '';

                angular.forEach(value.specialities, function (value1, key1) {

                    value.specialitiesList += value1.speciality;
                    if (key1 < value.specialities.length - 1)
                        value.specialitiesList += ",";
                });
                angular.forEach(value.servicesProvided, function (value2, key2) {

                    value.ServicesList += value2.name;
                    if (key2 < value.servicesProvided.length - 1)
                        value.ServicesList += ",";
                });
            });

        }, function (error) { $scope.ErrorMessage = error.errorMessage });


        var param = {
            "companyId": sessionStorage.getItem("CompanyId")
        }
        var GetServiceRequestCatList = AdjusterServiceRequestService.getCategoriesList(param);
        GetServiceRequestCatList.then(function (success) {
            $scope.ServiceCategoryList = success.data.data;
         
        }, function (error) { $scope.ErrorMessage = error.errorMessage });
        $scope.ServiceDetails = {
            "serviceCategoryId": null,
            "CreatedBy": sessionStorage.getItem("Name")
        }
    }

    init();
    $scope.sortVendor = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //Attachment setion
    $scope.AttachmentDetails = [];

    $scope.FileList = [];
    $scope.SelectFile = function () {
        angular.element('#FileUpload').trigger('click');
    }

    $scope.getFileDetails = function (ev) {
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.UploadedFiles = ev.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                $scope.AttachmentDetails.push({
                    "fileName": file.name,
                    "fileType": file.type,
                    "extension": file.name.substr(file.name.lastIndexOf('.')),
                    "filePurpose": "SERVICE_REQUEST",
                    "latitude": null,
                    "longitude": null
                });
                $scope.FileList.push({ "file": file })
                reader.readAsDataURL(file);
            }
        });
    };
    //End attachment section

    //Save service request  
    $scope.SaveServiceRequest = function () {
        var ParamServiceDetails = new FormData();
        $(".page-spinner-bar").removeClass("hide");
        var serviceRequestDetails = {          
            "claimNumber": sessionStorage.getItem("ClaimNo"),
            "description": $scope.ServiceDetails.Description,
            "targateDate": (angular.isDefined($scope.ServiceDetails.TargetDate) && $scope.ServiceDetails.TargetDate != null) ? ($filter('DatabaseDateFormatMMddyyyy')($scope.ServiceDetails.TargetDate)) : null,
            "registrationNumber": $scope.RegNumber,
            "serviceCost": (($scope.ServiceDetails.RateForService !== null && angular.isDefined($scope.ServiceDetails.RateForService)) ? $scope.ServiceDetails.RateForService : null),
            "assignTo":((angular.isDefined($scope.ServiceDetails.SeletedVendor) && $scope.ServiceDetails.SeletedVendor !== null)?{
                "vendorId":$scope.ServiceDetails.SeletedVendor,
                "registrationNumber": $scope.RegNumber
            }:null),
            "serviceCategory": {
                "id": $scope.ServiceDetails.serviceCategoryId,
                "name": GetCategoryForService($scope.ServiceDetails.serviceCategoryId)
            }
        }; 
        if ($scope.AttachmentDetails.length > 0) {
            ParamServiceDetails.append("filesDetails", JSON.stringify($scope.AttachmentDetails));
            angular.forEach($scope.FileList, function (item) {
                ParamServiceDetails.append("file", item.file
                    );
            });
        }
        else {
            ParamServiceDetails.append("filesDetails", null);
            ParamServiceDetails.append("file", null);
        } 
        ParamServiceDetails.append("serviceRequestDetails", JSON.stringify(serviceRequestDetails));
        //API call
        var NewServiceRequest = AdjusterServiceRequestService.NewServiceRequest(ParamServiceDetails);
        NewServiceRequest.then(function (success) {
            $scope.disableSave = true;         
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $location.url("AdjusterPropertyClaimDetails");
            $(".page-spinner-bar").addClass("hide");
            //Show popup
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    $scope.RegNumber = null;
    $scope.SelectVendor = function (vendor) {
         
        $scope.RegNumber = null;
        $scope.SelectedVendor = vendor.name
        $scope.ServiceDetails.SeletedVendor = vendor.id;
        $scope.RegNumber = vendor.registrationNumber;
        $scope.ServiceDetails.RateForService = 0;
        angular.forEach(vendor.servicesProvided, function (item) {
            if (item.id === $scope.ServiceDetails.serviceCategoryId) {
                $scope.ServiceDetails.RateForService = item.rate;
            }
        });

    }
    //End servicew 

    //Go back
    $scope.BackToClaimDetails = BackToClaimDetails;
    function BackToClaimDetails() {
        // sessionStorage.setItem("AdjusterClaimId", null);
        $location.url("AdjusterPropertyClaimDetails");
    }
    //Go to Dashboard
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.GetCategoryForService = GetCategoryForService;
    function GetCategoryForService(categoryId)
    {
        name="";
        angular.forEach($scope.ServiceCategoryList, function (category)
        {
            if(category.id==categoryId)
            {
                name = category.name;
            }
        });

        return name;
         
    }
});