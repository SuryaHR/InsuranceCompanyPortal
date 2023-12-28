angular.module('MetronicApp').controller('SuperVisorAssignServiceRequestController', function ($rootScope, $uibModal, $scope, settings, $filter, $location, $translate, $translatePartialLoader
    , SuperVisorServiceRequestService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language 
    $translatePartialLoader.addPart('ServiceRequestAssign');
    $translate.refresh();
    $scope.PageSize = $rootScope.settings.pagesize;
    $scope.serviceRequestDetails = {};
    $scope.SelectedVendorId;
    $scope.MinimumServiceCost;
    //Service Details
    function init() {


        var param = {
            "companyId": sessionStorage.getItem("CompanyId"),
            "claimNumber": sessionStorage.getItem("ClaimNo")
        }
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

        $scope.ServiceRequestId = sessionStorage.getItem("ServiceRequestId");
        if ($scope.ServiceRequestId === null || angular.isUndefined($scope.ServiceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", null);
            $location.url("SupervisorClaimDetails");
        }
        else {
            //Get statusList
            var GetStatusList = SuperVisorServiceRequestService.GetStatusList();
            GetStatusList.then(function (success) {
                $scope.StatusList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.errorMessage;
            });
            //Get request details
            var paramRequestId = { "serviceRequestId": $scope.ServiceRequestId }
            var GetServiceDetails = SuperVisorServiceRequestService.GetServiceDetails(paramRequestId);
            GetServiceDetails.then(function (success) {
                $scope.serviceRequestDetails = success.data.data;
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }
    init();
    //End service details

    $scope.SelectVendor = function (vendor) {
        $scope.SelectedVendor = vendor.name;
        $scope.SelectedVendorId = vendor.id;
        if (vendor.servicesProvided != null)
        {
            angular.forEach(vendor.servicesProvided, function (service) {
             
                ($scope.serviceRequestDetails.category.name ==service.name)
                {
                    $scope.MinimumServiceCost = service.rate;
                }
               
            })
        }
        else {
           
            $scope.MinimumServiceCost = 0;
        }
    }
    $scope.sortVendor = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.GoBack = function () {
         $location.url('SuperVisorServiceRequestEdit')
    }
    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails() {
        $location.url('SupervisorClaimDetails');
    }
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url('SupervisorDashboard');
    }
    $scope.AssignServiceRequest = AssignServiceRequest;
    function AssignServiceRequest() {
        $scope.ErrorMessage = "";
        if ($scope.SelectedVendorId !== null && angular.isDefined($scope.SelectedVendorId)) {
            var paramAssignRequest = {
                "assignedUserId": $scope.SelectedVendorId,
                "serviceRequestId": $scope.ServiceRequestId
            };
            
            var AssignServiceRequest = SuperVisorServiceRequestService.AssignServiceRequest(paramAssignRequest);
            AssignServiceRequest.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");

            });
        }
        else {
            toastr.remove();
            toastr.warning("Please selete Vendor from the list.", "Select vendor");
           

        }
    }
});