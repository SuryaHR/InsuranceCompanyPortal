angular.module('MetronicApp').controller('VendorsListController', function ($rootScope, $filter, $location, $uibModal, $scope, $translate, $translatePartialLoader,AuthHeaderService, VendorRegistrationService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('ContractedVendor');
    $translate.refresh();
    $scope.AllVendorsList = [];
    $scope.VendorDetails;
    $scope.company = {};
    $scope.emailDetails = {}
    $scope.EmailTemplate = [];
    $scope.ddlStateList = [];
    $scope.inviteVendor = false;
    $scope.inviteVendorOnBoard = false;
    $scope.tab = 'All';
    function init() {
        getServiceProvidedList();
        getCategoryList();
        GetStateList();
        if (sessionStorage.getItem("isOnBoardVendor") == "true")
        {
            $scope.inviteVendorOnBoard = true;
        }
        else {
            $scope.inviteVendorOnBoard = false;
            GetVendorsList();
        }
        sessionStorage.removeItem("isOnBoardVendor");
    }
    init();   
    $scope.GetVendorsList = GetVendorsList;
    function GetVendorsList() {
        $(".page-spinner-bar").removeClass("hide");
        var GetVendorsList = VendorRegistrationService.GetVendorsList();
        GetVendorsList.then(function (success) {            
            $scope.AllVendorsList = success.data.data;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            if (error != null) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                toastr.remove();
                toastr.error(AuthHeaderService.getGenericgenericErrorMessage(), "Error");
            }
            $(".page-spinner-bar").addClass("hide");
        });
    };

    $scope.getCategoryList = getCategoryList;
    function getCategoryList() {
        var category = VendorRegistrationService.GetCategories();
        category.then(function (success) {
            $scope.categoryList = success.data.data;
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
    }
    $scope.getServiceProvidedList = getServiceProvidedList;
    function getServiceProvidedList() {
        var services = VendorRegistrationService.GetServiceProvided();
        services.then(function (success) {
            $scope.serviceList = success.data.data;
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
    }

    $scope.GetStateList =GetStateList;
    function GetStateList() {
        var param =
        {
            "isTaxRate": false,
            "isTimeZone": true
        }
        var StateList = VendorRegistrationService.getStates(param);
        StateList.then(function (success) { $scope.ddlStateList = success.data.data; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
    };

    //get the list of email templates
    $scope.getEmailTemplates=getEmailTemplates;
    function getEmailTemplates() {
        $(".page-spinner-bar").removeClass("hide");
        var promise = VendorRegistrationService.GetEmailTemplates();
        promise.then(function (success) {
            $scope.EmailTemplate = [];
            angular.forEach(success.data.data, function (value) {
                $scope.EmailTemplate.push(value);
            });
            $(".page-spinner-bar").addClass("hide");
        },function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
    }
    $scope.setEmailDetails = setEmailDetails;
    function setEmailDetails(item) {
        $(".page-spinner-bar").removeClass("hide");
        var param =
            {
                id: $scope.VendorDetails.EmailTemplate.id
            };
        var getEmailDetails = VendorRegistrationService.GetEmailTemplateDetails(param);
        getEmailDetails.then(function (success) {            
            $(".page-spinner-bar").addClass("hide");
            $scope.VendorDetails.EmailTemplate.templateSubject = success.data.data.templateSubject;
            $scope.VendorDetails.EmailTemplate.templateBody = success.data.data.templateBody;
            var path = $location.absUrl();
            var fields = path.split('#');           

            //Generation URL to attach with email body
            var MainURL = fields [0]+ "#/VendorRegistration?VRN=" + $scope.VendorDetails.registrationNumber; 

            //$scope.VendorDetails.EmailTemplate.templateBody = $scope.VendorDetails.EmailTemplate.templateBody + "<br/>" +"<a>"+ LocalURL+"</a>";
            $scope.VendorDetails.EmailTemplate.templateBody = $scope.VendorDetails.EmailTemplate.templateBody + "<br/>" + '<a href="' + MainURL + '">' + MainURL + '</a>';

        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
    $scope.inviteVendor = inviteVendor;
    function inviteVendor(item) {
        $scope.vendorinvite = true;
        $scope.VendorDetails = angular.copy(item);
        getEmailTemplates();
    }
    $scope.CancelInvite = CancelInvite;
    function CancelInvite() {
        $scope.vendorinvite = false;
    }
    $scope.newVendorOnBoard = newVendorOnBoard;
    function newVendorOnBoard(){
        $scope.inviteVendorOnBoard = true;
    }
    $scope.CancelVendorOnBoard = CancelVendorOnBoard;
    function CancelVendorOnBoard() {
        $location.url('ContractedVendor');
        $scope.inviteVendorOnBoard = false;
    };

    $scope.SetTimeZone = SetTimeZone;
    function SetTimeZone() {
        $scope.company.timezone = "";
        angular.forEach($scope.ddlStateList, function (state) {
            if(state.id==$scope.company.address.state.id)
            {
                $scope.company.timezone = state.timeZone;
            }
        });
    };

    $scope.CreateRquest = CreateRquest;
    function CreateRquest() {
        $(".page-spinner-bar").removeClass("hide");       
        var param =
            {
            "createCompany": {
                "adminCellPhone":(angular.isDefined($scope.company.adminMobile) ? $scope.company.adminMobile.replace(/[()-]/g, '').replace(/ /g, '') : null),
                "adminDayTimePhone":(angular.isDefined($scope.company.adminMobile) ? $scope.company.adminMobile.replace(/[()-]/g, '').replace(/ /g, '') : null),
                "adminDOB": null,
                "adminEmail": $scope.company.adminEmail,
                "adminEveningTimePhone":(angular.isDefined($scope.company.adminMobile) ? $scope.company.adminMobile.replace(/[()-]/g, '').replace(/ /g, '') : null),
                "adminFirstName": $scope.company.adminFirstName,
                "adminLastName": $scope.company.adminLastName,
                "billingAddress": $scope.company.address,
                "defaultTimezone": $scope.company.timezone,
                "faxNumber": null,
                "name": $scope.company.name,
                "officeAddress":$scope.company.address,
                "phoneWork": (angular.isDefined($scope.company.PhoneWork) ? $scope.company.PhoneWork.replace(/[()-]/g, '').replace(/ /g, '') : null),
                "registrationNumber": null,
                "url": null,
                "workFax": null,
                "publicUrl": $scope.company.url
            },
            "emailContact": {
                "bodyEmail": "Vendor Registration Request",                
                "subjectEmail": "Invitation to create new vendor"
            }
            }
        var CreateRequest = VendorRegistrationService.CreateRequest(param);
        CreateRequest.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $scope.CancelVendorOnBoard();
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
    };

    $scope.InviteVendor = InviteVendor;
    function InviteVendor() {
        var param =
            [{
     "createCompany": {
         "adminCellPhone": $scope.VendorDetails.adminCellPhone,
         "adminDayTimePhone": $scope.VendorDetails.adminDayTimePhone ,
         "adminDOB": $scope.VendorDetails.adminDOB ,
         "adminEmail": $scope.VendorDetails.adminEmail,
         "adminEveningTimePhone": $scope.VendorDetails.adminEveningTimePhone,
         "adminFirstName": $scope.VendorDetails.adminFirstName,
         "adminLastName": $scope.VendorDetails.adminLastName ,
         "billingAddress":$scope.VendorDetails.billingAddress ,         
         "createdDate": $scope.VendorDetails.createdDate ,
         "defaultTimezone": null,
         "faxNumber": $scope.VendorDetails.faxNumber ,
         "id": null,
         "insuranceCompanyRegNumber": $scope.VendorDetails.insuranceCompanyRegNumber ,
         "name":$scope.VendorDetails.name ,
         "officeAddress":$scope.VendorDetails.officeAddress ,
         "phoneWork": $scope.VendorDetails.phoneWork ,
         "registrationNumber":$scope.VendorDetails.registrationNumber ,
         "url": $scope.VendorDetails.url ,
         "vendorInsuranceCompanyCreateDate": null,
         "workFax":$scope.VendorDetails.workFax ,
         "isInsuranceCompanyContracted": false,
         "publicUrl": $scope.VendorDetails.publicUrl ,
         "isActive": null,
         "state": $scope.VendorDetails.state ,
         "city": $scope.VendorDetails.city ,
         "zipCode": $scope.VendorDetails.zipCode ,
         "completeOfficeAddress":$scope.VendorDetails.completeOfficeAddress ,
         "completeBillingAddress": $scope.VendorDetails.completeBillingAddress ,
         "status": "Registered"
     },
     "emailContact": {
         "bodyEmail":$scope.VendorDetails.EmailTemplate.templateBody, 
         "email":$scope.VendorDetails.adminEmail,//"pradip.teli@rhealtech.com",
         "subjectEmail": $scope.VendorDetails.EmailTemplate.templateSubject,
     }
 }]
        var InviteVendor = VendorRegistrationService.InviteVendor(param);
        InviteVendor.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $scope.GetVendorsList();
            $scope.vendorinvite = false;
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
        });
    };

});