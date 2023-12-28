angular.module('MetronicApp').controller('AdjusterAssignServiceRequesttController', function ($rootScope, $uibModal, $scope, settings, $filter, $location, $translate, $translatePartialLoader
    , AdjusterServiceRequestService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language 
    $translatePartialLoader.addPart('ServiceRequestAssign');
    $translate.refresh();
    $scope.PageSize = $rootScope.settings.pagesize;
    $scope.serviceRequestDetails = {};
    //Service Details
    function init()
    {

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



        $scope.ServiceRequestId = sessionStorage.getItem("ServiceRequestId");
        if ($scope.ServiceRequestId === null || angular.isUndefined($scope.ServiceRequestId)) {
            $location.url("AdjusterServiceRequestEdit");
        }
        else {
            //Get statusList
            var GetStatusList = AdjusterServiceRequestService.GetStatusList();
            GetStatusList.then(function (success) {
                $scope.StatusList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.errorMessage;
            });
            //Get request details
            var paramRequestId = { "serviceRequestId": $scope.ServiceRequestId }
            var GetServiceDetails = AdjusterServiceRequestService.GetServiceDetails(paramRequestId);
            GetServiceDetails.then(function (success) {
                $scope.serviceRequestDetails = success.data.data;
            }, function (error) { });
        }
    }
    init();
    //End service details
  
    $scope.SelectVendor = SelectVendor;
    function SelectVendor(vendor) {
        $scope.SelectedVendor = vendor.name;
        if (vendor.servicesProvided !== null)
        {
            angular.forEach(vendor.servicesProvided, function (item) {
                if (item.id === $scope.serviceRequestDetails.category.categoryId) {
                    $scope.RateForService = item.rate;
                }
            });
        }
        else {
            $scope.RateForService = 0;
        }
       
        $scope.VendorIdToAssignRequest = vendor.id;
    }
    //Assign service to 3rd party
    $scope.AssignServiceRequest = AssignServiceRequest;
    function AssignServiceRequest() {
        $scope.ErrorMessage = "";
        if ($scope.VendorIdToAssignRequest !== null && angular.isDefined($scope.VendorIdToAssignRequest)) {
            var paramAssignRequest = {
                "assignedUserId": $scope.VendorIdToAssignRequest,
                "serviceRequestId": $scope.ServiceRequestId
            };
            
            var AssignServiceRequest = AdjusterServiceRequestService.AssignServiceRequest(paramAssignRequest);
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
            toastr.error("Please selete Vendor from the list.", "Select vendor");           
        }
    }
 
    $scope.sortVendor = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    //Back to details page
    $scope.GoBack = function () {
        $location.url('AdjusterServiceRequestEdit')
    }
    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails()
    {
        $location.url('AdjusterPropertyClaimDetails');
    }
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});