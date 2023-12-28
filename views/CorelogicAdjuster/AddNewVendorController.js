angular.module('MetronicApp').controller('AddNewVendorController', function ($rootScope, AdjusterPropertyClaimDetailsService, $uibModal, $scope, settings, $http, $timeout,
    $location, $translate, $filter, $translatePartialLoader, ClaimObj) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });


    //set language
    $translatePartialLoader.addPart('AdjustorAddNewVendor');
    $translate.refresh();


    $scope.ErrorMessage = "";

    $scope.cancel = function () {
        $scope.$close();
    };
    $scope.ok = function () {
        $scope.$close();
    };



    $scope.ContactDeatils = [{ id: null, email: '', firstName: '', lastName: '', phoneNumber: '' }];
    $scope.counter = 0;
    $scope.PhoneNumbers = [{ Type: '', PhoneNo: '' }];
    $scope.phonecounter = 0;
    $scope.ddlParticipantTypeList = [];
    $scope.ddlStateList = [];
    $scope.existingVendorSearchResult = [];
    $scope.InternalEmployeeSearchResult = [];
    $scope.SelectedExistingVendors = null;
    $scope.SelectedInternalEmployees = null;

    $scope.ErrorMessage = "";

    $scope.commObj =
       {
           ParticipantType: "Select",
           ExistingVendorText: '',
           InternalText: '',
           ExternalText: '',
           ShippingState: '',
           BillingState: '',
           ExternalPartState: '',
           ClaimNumber: ClaimObj[0].ClaimNumber,
           ClaimId: ClaimObj[0].ClaimId

       }
     
    $scope.ExternalParticipant = {
        FirstName: '',
        LastName: '',
        PhoneNo: '',
        Email: '',
        ResonForInclusion: '',
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        ZipCode: ''
    }

    $scope.IsPermanent = false;
    $scope.NewVendor = {};


    $scope.displayNewVendor = false;
    $scope.displayInternalParticipant = false;
    $scope.displayExistingVendor = false;
    $scope.displayExternalParticipant = false;
    $scope.displayAddVendorBtn = false;
    $scope.displayAddParticipantBtn = true;
    $scope.displaySearchExistingResult = false;
    $scope.displaySearchInternalResult = false;
    $scope.ShowExistingVendorError = false;
    $scope.IsExistingVendorSelected = false;
    $scope.ActiveAddBtn = true;//making add participant btn disabled for validation


    $scope.AddContactPerson = function (index, contact) {


        $scope.ContactDeatils.push({ id: null, email: '', firstName: '', lastName: '', phoneNumber: '' });

    };

    $scope.RemoveContactPerson = function (index, contact) {


        $scope.ContactDeatils.splice(index, 1);

    };


    $scope.RemovePhone = function (index) {

        $scope.PhoneNumbers.splice(index, 1)
    };

    $scope.AddPhone = function () {

        $scope.PhoneNumbers.push({ Type: '', PhoneNo: '' });
    };



    $scope.selectParticipant = function () {
        $scope.ResetNewVendor();
        $scope.ClearExistingVendorResult();
        $scope.ClearInternalEmployeeResult();
        $scope.ClearExternalParticipant();

        if ($scope.commObj.ParticipantType == "Select") {
            $scope.displayNewVendor = false;
            $scope.displayInternalParticipant = false;
            $scope.displayExistingVendor = false;
            $scope.displayExternalParticipant = false;
            $scope.displayAddVendorBtn = false;
            $scope.displayAddParticipantBtn = true;
            $scope.ActiveAddBtn = true;

        }
        else if ($scope.commObj.ParticipantType == "INTERNAL") {
            $scope.displayNewVendor = false;
            $scope.displayInternalParticipant = true;
            $scope.displayExistingVendor = false;
            $scope.displayExternalParticipant = false;
            $scope.displayAddVendorBtn = false;
            $scope.displayAddParticipantBtn = true;
            $scope.ActiveAddBtn = true;

        }
        else if ($scope.commObj.ParticipantType == "EXTERNAL") {
            angular.element('#select2insidemodal').select2({});
            $scope.displayNewVendor = false;
            $scope.displayInternalParticipant = false;
            $scope.displayExistingVendor = false;
            $scope.displayExternalParticipant = true;
            $scope.displayAddVendorBtn = false;
            $scope.displayAddParticipantBtn = false;
            $scope.ActiveAddBtn = true;

        }
        else if ($scope.commObj.ParticipantType == "EXISTING VENDOR") {
            $scope.displayNewVendor = false;
            $scope.displayInternalParticipant = false;
            $scope.displayExistingVendor = true;
            $scope.displayExternalParticipant = false;
            $scope.displayAddVendorBtn = false;
            $scope.displayAddParticipantBtn = true;
            $scope.ActiveAddBtn = true;

        }
        else if ($scope.commObj.ParticipantType == "NEW VENDOR") {
            angular.element('#select2insidemodal').select2({});
            $scope.displayNewVendor = true;
            $scope.displayInternalParticipant = false;
            $scope.displayExistingVendor = false;
            $scope.displayExternalParticipant = false;
            $scope.displayAddVendorBtn = true;
            $scope.displayAddParticipantBtn = false;
            $scope.ActiveAddBtn = true;

        }

        else {
            $scope.displayNewVendor = false;
            $scope.displayInternalParticipant = false;
            $scope.displayExistingVendor = false;
            $scope.displayExternalParticipant = false;
            $scope.displayAddVendorBtn = false;
            $scope.displayAddParticipantBtn = true;
            $scope.ActiveAddBtn = true;

        }

    };


    function init() {
        //get participant type
        var particiapntType = AdjusterPropertyClaimDetailsService.getParticipantType()
        particiapntType.then(function (success) {

            $scope.ddlParticipantTypeList = success.data.data;
        }, function (error) {
            if (error != null) {
                $scope.ErrorMessage = error.data.errorMessage;
            }

        });



        //get all states 
        var param =
            {
                "isTaxRate": true,
                "isTimeZone": true
            }
        var StateList = AdjusterPropertyClaimDetailsService.getStates(param)
        StateList.then(function (success) {

            $scope.ddlStateList = success.data.data;
        }, function (error) {

            if (error != null) {
                $scope.ErrorMessage = error.data.errorMessage;
            }
        });

    };
    init();

    //search existing vendor
    $scope.searchExistingVendor = function () {
        var param = {
            "searchString": $scope.commObj.ExistingVendorText
        };

        var getResult = AdjusterPropertyClaimDetailsService.searchExistingEmployee(param)
        getResult.then(function (success) {

            $scope.existingVendorSearchResult = success.data.data;
            $scope.displaySearchExistingResult = true;

        }, function (error) {

            $scope.ErrorMessage = error.data.errorMessage;
        });

    };

    //search internal employee
    $scope.searchInternalEmployee = function () {

        var param = {
            "searchString": $scope.commObj.InternalText,
            "companyId": sessionStorage.getItem("CompanyId").toString()

        };

        var getResult = AdjusterPropertyClaimDetailsService.searchInternalEmployee(param)
        getResult.then(function (success) {

            $scope.InternalEmployeeSearchResult = success.data.data;
            $scope.displaySearchInternalResult = true;

        }, function (error) {

            //$scope.ErrorMessage = error.data.errorMessage;
        });
    };

    $scope.selectInternalEmployee = function (employee) {

        angular.forEach($scope.InternalEmployeeSearchResult, function (obj) {
            if (employee.id != obj.id) {
                obj.IsSelected = false;
                $scope.ActiveAddBtn = true;
            }

        })

        if (employee.id != null) {
            if ($scope.SelectedInternalEmployees === employee.id) {
                $scope.SelectedInternalEmployees = null;
            }
            else {

                $scope.SelectedInternalEmployees = employee.id;
                $scope.ShowInternalEmployeeError = false;
                $scope.ActiveAddBtn = false;

            }
        }

    };

    $scope.selectExistingVendor = function (vendor, index) {

        angular.forEach($scope.existingVendorSearchResult, function (obj) {
            if (vendor.vendorId != obj.vendorId) {
                obj.Selected = false;
                $scope.ActiveAddBtn = true;
            }

        })

        if (vendor.vendorId != null) {
            if ($scope.SelectedExistingVendors === vendor.vendorId) {
                $scope.SelectedExistingVendors = null;
            }
            else {
                $scope.SelectedExistingVendors = vendor.vendorId;
                $scope.ShowExistingVendorError = false;
                $scope.ActiveAddBtn = false;
            }
        }

    };


    //select participant form list
    $scope.AddParticipantToClaim = function () {

        if ($scope.commObj.ParticipantType == "EXTERNAL") {
            $scope.AddExternalParticipant();
        }
        else if ($scope.commObj.ParticipantType == "EXISTING VENDOR") {
            if ($scope.SelectedExistingVendors == null) {
                $scope.ShowExistingVendorError = true;
            }
            else {

                $scope.AddExistingVendorAgainstClaim();
            }
        }
        else if ($scope.commObj.ParticipantType == "INTERNAL") {
            if ($scope.SelectedInternalEmployees == null) {
                $scope.ShowInternalEmployeeError = true;
            }
            else {
                $scope.AddInternalEmployeeAgainstClaim();
            }
        }


    };


    //Internal Employee as participant
    $scope.AddInternalEmployeeAgainstClaim = AddInternalEmployeeAgainstClaim;
    function AddInternalEmployeeAgainstClaim() {
        var TypeId = 1;
        var Type = "INTERNAL";
        $scope.AddParticipantForClaim($scope.SelectedInternalEmployees, TypeId, Type);

    };

    $scope.ClearInternalEmployeeResult = ClearInternalEmployeeResult;
    function ClearInternalEmployeeResult() {

        $scope.commObj.InternalText = '';
        $scope.InternalEmployeeSearchResult = [];
        $scope.SelectedInternalEmployees = null;
        $scope.displaySearchInternalResult = false;
        $scope.ShowInternalEmployeeError = false;

    };

    //External Participant as participant
    $scope.AddExternalParticipant = AddExternalParticipant;
    function AddExternalParticipant() {
        $scope.StateName = '';
        $scope.SelectedState = $filter('filter')($scope.ddlStateList, { id: $scope.commObj.ExternalPartState });
        angular.forEach($scope.SelectedState, function (obj) { $scope.StateName = obj.state });
        var param =
            {
                "claimNumber": $scope.commObj.ClaimNumber,
                "firstName": $scope.ExternalParticipant.FirstName,
                "lastName": $scope.ExternalParticipant.LastName,
                "phoneNumber": $scope.ExternalParticipant.PhoneNo,
                "email": $scope.ExternalParticipant.Email,
                "reasonForInclusion": $scope.ExternalParticipant.ResonForInclusion,
                "address": {
                    "streetAddressOne": $scope.ExternalParticipant.AddressLine1,
                    "streetAddressTwo": $scope.ExternalParticipant.AddressLine2,
                    "city": $scope.ExternalParticipant.City,
                    "state": {
                        "id": $scope.commObj.ExternalPartState,
                        "state": $scope.StateName
                    },

                    "zipcode": $scope.ExternalParticipant.ZipCode
                }
            };

        var addExternalParticipant = AdjusterPropertyClaimDetailsService.addExternalParticipant(param);
        addExternalParticipant.then(function (success) {

            $scope.Status = success.data.status;
            if ($scope.Status == 200) {

                toastr.remove()
                toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                //$scope.ClearExternalParticipant();
            }

        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
        });

    };

    $scope.ClearExternalParticipant = ClearExternalParticipant;
    function ClearExternalParticipant() {
        $scope.ExternalParticipant = {}; //clear data
    };


    //Existing vendor as participant
    $scope.AddExistingVendorAgainstClaim = AddExistingVendorAgainstClaim;
    function AddExistingVendorAgainstClaim() {
        var TypeId = 3;
        var Type = "EXISTING VENDOR";
        $scope.AddParticipantForClaim($scope.SelectedExistingVendors, TypeId, Type);

    };

    $scope.ClearExistingVendorResult = ClearExistingVendorResult;
    function ClearExistingVendorResult() {
        $scope.commObj.ExistingVendorText = '';
        $scope.existingVendorSearchResult = [];
        $scope.SelectedExistingVendors = null;
        $scope.displaySearchExistingResult = false;
        $scope.ShowExistingVendorError = false;
    }

    //New Vendor as particiapnt
    $scope.AddNewVendor = function () {
        $scope.DayTime = null;
        $scope.EveningTime = null;
        $scope.Cell = null;

        angular.forEach($scope.PhoneNumbers, function (phone) {
            if (phone.Type == "Work") {
                $scope.DayTime = phone.PhoneNo
            }
            else if (phone.Type == "Mobile") {
                $scope.EveningTime = phone.PhoneNo
            }
            else if (phone.Type == "Other") {
                $scope.Cell = phone.PhoneNo;
            }
        });

        var param = {
            "vendorId": null,
            "vendorName": $scope.NewVendor.SupplierName,
            "address": {
                "id": null,
                "streetAddressOne": null,
                "streetAddressTwo": null,
                "city": null,
                "state": {
                    "id": null
                },
                "zipcode": null
            },
            "billingAddress": {
                "id": null,
                "streetAddressOne": $scope.NewVendor.BillingAddressLine1,
                "streetAddressTwo": $scope.NewVendor.BillingAddressLine2,
                "city": $scope.NewVendor.BillingCity,
                "state": {
                    "id": $scope.commObj.BillingState
                },
                "zipcode": $scope.NewVendor.BillingZipCode
            },
            "shippingAddress": {
                "id": null,
                "streetAddressOne": $scope.NewVendor.ShippingAddressLine1,
                "streetAddressTwo": $scope.NewVendor.ShippingAddressLine2,
                "city": $scope.NewVendor.ShippingCity,
                "state": {
                    "id": $scope.commObj.ShippingState
                },
                "zipcode": $scope.NewVendor.ShippingZipCode
            },
            "contactPersons": $scope.ContactDeatils,
            "dayTimePhone": $scope.DayTime,
            "eveningTimePhone": $scope.EveningTime,
            "cellPhone": $scope.Cell,
            "isActive": true,
            "isTemporary": $scope.IsPermanent === true ? false : true,
            "website": $scope.NewVendor.Website
        };


        var addNewVendor = AdjusterPropertyClaimDetailsService.addVendor(param);
        addNewVendor.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                var TypeId = 4;
                var Type = "NEW VENDOR";
                $scope.AddParticipantForClaim(success.data.data.vendorId, TypeId, Type);//adding newly added vendor as participant against claim
                $scope.ResetNewVendor();//clear data
            }
            else if ($scope.Status == 400) {

            }
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
        });


    };

    //Clear New Vendor
    $scope.ResetNewVendor = ResetNewVendor;
    function ResetNewVendor() {
        $scope.NewVendor = {};
        $scope.ContactDeatils = [{ id: null, email: '', firstName: '', lastName: '' }];
        $scope.PhoneNumbers = [{ Type: '', PhoneNo: '' }];
        $scope.IsPermanent = false;
        $scope.commObj.BillingState = "";
        $scope.commObj.ShippingState = "";
    };

    //making vendor permanent/temprary
    $scope.MakePermanent = function () {
        $scope.IsPermanent = !$scope.IsPermanent;
    };
    //Commaon function to add any type of participant against claim
    $scope.AddParticipantForClaim = AddParticipantForClaim;
    function AddParticipantForClaim(id, TypeId, Type) {
         
        var param = {
            "id": id,
            "participantType": {
                "id": TypeId,
                "participantType": Type
            },
            "claimDetails": {
                "claimNumber": $scope.commObj.ClaimNumber
            }
        };

        var addParticiapnt = AdjusterPropertyClaimDetailsService.AddParticipantAgainstClaim(param);
        addParticiapnt.then(function (success) {

            $scope.Status = success.data.status;

            if ($scope.Status == 200) {

                toastr.remove()
                toastr.success(success.data.message, $translate.instant("SuccessHeading"));

                $scope.ClearInternalEmployeeResult(); //clear internal employee data
                $scope.ClearExistingVendorResult(); //clear existing vendor data
            }

        }, function (error) {
            if (error != null) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
            }

        });

    }
});