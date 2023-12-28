angular.module('MetronicApp').controller('SuperVisorServiceRequestController', function ($translate, $translatePartialLoader, $scope,$filter, $rootScope, $state, settings, $location, SuperVisorServiceRequestService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('SuperVisorServiceRequest');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.UploadedFiles = [];
    $scope.ServiceDetails = {};
    $scope.ServiceCategoryList = [];

    function init() {   
        $scope.CommonObj = {
            ClaimNumber: sessionStorage.getItem("ClaimNo"),
            ClaimId: sessionStorage.getItem("SupervisorClaimId")
        };
        var param = {
            "companyId": sessionStorage.getItem("CompanyId"), "claimNumber": $scope.CommonObj.ClaimNumber
            }
        
        if ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber)) {
            var VendorList = SuperVisorServiceRequestService.getVendorList(param);
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
            var NewServiceRequest = SuperVisorServiceRequestService.getCategoriesList(param);
            NewServiceRequest.then(function (success) {
                $scope.ServiceCategoryList = success.data.data;
            }, function (error) { $scope.ErrorMessage = error.errorMessage });
            $scope.ServiceDetails = {
                "serviceCategoryId": null,
                "CreatedBy": sessionStorage.getItem("Name")
            }
        }
        else
        {
            sessionStorage.setItem("ServiceRequestId", null)
            $location.url('SupervisorClaimDetails')
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
                    "filePurpose": "SERVICE REQUEST",
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
        var serviceRequestDetails = {
            "claimId": $scope.CommonObj.ClaimId,
            "description": $scope.ServiceDetails.Description,
            "targateDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ServiceDetails.TargetDate),
            "serviceCost": $scope.ServiceDetails.RateForService,
            "assignTo": {              
                "vendorId": ((angular.isDefined($scope.ServiceDetails.SeletedVendor) && $scope.ServiceDetails.SeletedVendor !== null) ? $scope.ServiceDetails.SeletedVendor : null)
            },
            "serviceCategory": {
                "id":($scope.ServiceDetails.category != null) ? $scope.ServiceDetails.category.id : null
            }
        }
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
        var NewServiceRequest = SuperVisorServiceRequestService.NewServiceRequest(ParamServiceDetails);
        NewServiceRequest.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $location.url("SupervisorClaimDetails");
            //Show popup
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.SelectVendor = function (vendor) {
        $scope.SelectedVendor = vendor.name
        $scope.ServiceDetails.SeletedVendor = vendor.id;
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
        sessionStorage.setItem("ServiceRequestId", null)
        $location.url('SupervisorClaimDetails')
    }
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});