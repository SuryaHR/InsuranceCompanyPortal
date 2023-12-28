angular.module('MetronicApp').controller('AdjusterThirdPartyVendorController', function ($rootScope, $scope, $http, settings, $translate, $translatePartialLoader, $location, $filter,
    ThirdPartyVendorService, $uibModal) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('AdjusterThirdPartyVendor');
    $translate.refresh();
    //Variables
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.VendorList = [];
    $scope.AllvendorServices = [];
    $scope.FilteredvendorList = [];
    $scope.FilterService = "ALL";
    $scope.ErrorMessage = "";
    $scope.claimProfile = sessionStorage.getItem("claimProfile");
    $scope.serverAddress = '';

    // Pagination
    $scope.pageSize = 20;
    $scope.totalVendors = 0;
    $scope.currentPage = 1;
    $scope.lastRowCount = 0;
    $scope.reverse = false;
    $scope.sortKey = '';
    $scope.search = '';

    function init() {
        sessionStorage.setItem("VendorDetailsId", "");
        GetVendorsList();
        //Get  all vendor services for dropdown
        // var GetAllVendorServices = ThirdPartyVendorService.GetAllVendorServices();
        // GetAllVendorServices.then(function (success) {
        //     $scope.AllvendorServices = success.data.data;
        // }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        var GetGlobaldata = $http.get('Config/Configuration.json');
        GetGlobaldata.then(function (success) {
            var ConfigSettings = success.data.data;
            $scope.serverAddress = ConfigSettings.serverAddress;
        });

    };
    init();

    $scope.GetVendorsList = GetVendorsList;
    function GetVendorsList() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            'searchKey': $scope.search,
            'page': $scope.currentPage,
            'limit': $scope.pageSize,
            'sortBy': $scope.sortKey,
            'orderBy': $scope.reverse ? 'desc' : 'asc'
        }
        var getVendorList = ThirdPartyVendorService.getVendorList(param);
        getVendorList.then(function (success) {
            $scope.FilteredvendorList = [];
            $scope.totalVendors = 0;
            if (success.data.data) {
                var resData = success.data && success.data.data ? success.data.data : null;
                $scope.totalVendors = resData && resData.totalVendors > 0 ? resData.totalVendors : 0;
                if ($scope.currentPage == 1) {
                    $scope.lastRowCount = resData.totalPageSize;
                } else {
                    $scope.lastRowCount = resData.totalPageSize + ($scope.pageSize * ($scope.currentPage - 1));
                    // var currentListLength = ($scope.currentPage - 1) * $scope.pageSize;
                    // if (currentListLength != $scope.appraisalInvoices.length) {
                    //     $scope.appraisalInvoices = new Array(currentListLength).fill(new Object());
                    // }
                }
                angular.forEach(resData.companyVendors, function (item) {
                    var contactPerson = item.contactPersons;
                    item.contactPerson = contactPerson ? $filter('constructName')(contactPerson.firstName, contactPerson.lastName) : '';
                    $scope.FilteredvendorList.push(item);
                });
            }
            $(".page-spinner-bar").addClass("hide");
        },
            function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to get vendor details. please try again.", "Error");
            });
    }

    //Filter vendor by services
    // $scope.FilterVendorlist = FilterVendorlist;
    // function FilterVendorlist() {
    //     //{ itemType: {name: $scope.ItemFilter}}
    //     if (($scope.FilterService === "ALL") || (angular.isUndefined($scope.FilterService) || $scope.FilterService === null))
    //         $scope.FilteredvendorList = angular.copy($scope.VendorList)
    //     else {
    //         $scope.FilteredvendorList = angular.copy($scope.VendorList);
    //         $scope.FilteredvendorList = $filter('filter')($scope.FilteredvendorList, { vendorProvidedServices: { vendorServices: { id: $scope.FilterService } } });
    //     }
    // }

    //  sort
    $scope.sort = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;   //set the sortKey to the param passed                     
        GetVendorsList();
    };

    //Edit Vednor
    $scope.EditVendor = function (Vendor) {
        if (Vendor.registrationNumber != null) {
            sessionStorage.setItem("VendorDetailsId", Vendor.registrationNumber);
            sessionStorage.setItem('vendorId', Vendor.id);
            sessionStorage.setItem("EmaiInvite", null)
            $location.url('AdjusterVendorDetails');
        }
    };

    $scope.EditVendorNew = function () {
        sessionStorage.setItem("VendorDetailsId", 5)
        sessionStorage.setItem("EmaiInvite", null)
        $location.url('AdjusterVendorDetails');
    };

    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.exportVendors = function () {
        $(".page-spinner-bar").removeClass("hide");
        var data = {
            "userId": ""
        }
        var reports = ThirdPartyVendorService.getThirdPartyReport(data);
        reports.then(function (success) {
            var vendorReports = success.data.vendorReports;
            if (vendorReports) {
                $scope.downloadFile(vendorReports.downloadURL);
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.downloadFile = function (url) {
        var filename = url.split('/');
        filename = filename[filename.length - 1].split('_');
        var s = $scope.serverAddress + url;
        var linkElement = document.createElement('a');
        linkElement.setAttribute('href', s);
        linkElement.setAttribute("download", filename[filename.length - 1]);
        var clickEvent = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
        });
        linkElement.dispatchEvent(clickEvent);
    }

    // Pagination
    $scope.pageChanged = pageChanged;
    function pageChanged(pageNum) {
        $scope.currentPage = pageNum;
        GetVendorsList();
    }

    $scope.searchVendors = searchVendors
    function searchVendors() {
        $scope.currentPage = 1
        GetVendorsList();
    }
});