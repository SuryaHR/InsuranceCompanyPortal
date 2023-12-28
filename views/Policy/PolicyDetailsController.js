angular.module('MetronicApp').controller('PolicyDetailsController', function ($rootScope, $filter, $uibModal, $window, $scope, settings, $http, $timeout, $location, $translate,
    $translatePartialLoader, AuthHeaderService, PolicyDetailsService) {
        $scope.role = sessionStorage.getItem("RoleList");
        
    $scope.CommonObj = {
        ClaimNumber:$scope.role =='POLICYHOLDER'?sessionStorage.getItem("PolicyHolderClaimNo"): sessionStorage.getItem("ClaimNo"),
        ClaimId: sessionStorage.getItem("ClaimId"),
        UserId: sessionStorage.getItem("UserId"),
        claimNote: "",
        eventNote: "",
        Categories: "ALL",
        Attachment: '',
        EventTitle: "",
        EventDate: $filter('date')(new Date(), "dd/MM/yyyy"),
        EventActive: sessionStorage.getItem("ShowEventActive"),
        NoteActive: sessionStorage.getItem("ShowNoteActive"),
        ClaimProfile: sessionStorage.getItem("claimProfile"),
        AssignmentNumber: '',
        newInsuranceAccountNumber: '',
        newPolicyNumber: ''
    };

    function init() {
        getPolicyDetails();
        // getHomeOwnerPolicyTypes();
        getStates();
    $scope.isCoreLogic = sessionStorage.getItem("isCoreLogic")=="true" ? true : false;
    }
    init();

    $scope.getPolicyDetails = getPolicyDetails;
    function getPolicyDetails() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.tab = 'PolicyDetails';
        //Get Policy Details
        var param = {
            "policyNumber": null,
            "claimNumber": $scope.CommonObj.ClaimNumber
        };
        var policyDetails = PolicyDetailsService.getPolicyDetails(param);
        policyDetails.then(function (success) {
            $scope.PolicyDetails = success.data.data;
            $scope.PolicyDetails.policyHolder.dayTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.dayTimePhone, false);
            $scope.PolicyDetails.policyHolder.address.completeAddress = ($scope.PolicyDetails.policyHolder.address.completeAddress && $scope.PolicyDetails.policyHolder.address.completeAddress.includes(", ,")) ? $scope.PolicyDetails.policyHolder.address.completeAddress.replace(", ,", ",") : $scope.PolicyDetails.policyHolder.address.completeAddress;
            if ($scope.PolicyDetails.policyHolder.secondaryAddress)
                $scope.PolicyDetails.policyHolder.secondaryAddress.completeAddress = ($scope.PolicyDetails.policyHolder.secondaryAddress.completeAddress && $scope.PolicyDetails.policyHolder.secondaryAddress.completeAddress.includes(", ,")) ? ($scope.PolicyDetails.policyHolder.secondaryAddress.completeAddress.trim() == ", ,") ? "" : $scope.PolicyDetails.policyHolder.secondaryAddress.completeAddress.replace(", ,", ",") : $scope.PolicyDetails.policyHolder.secondaryAddress.completeAddress
            $scope.PolicyDetails.reportDate = $filter('DateFormatMMddyyyy')($scope.PolicyDetails.reportDate, "MM/dd/yyyy")
            // PolicyDetails.homeownerPolicyType
            if (!$scope.PolicyDetails.remitToAddress || !$scope.PolicyDetails.remitToAddress.state || !$scope.PolicyDetails.remitToAddress.state.id) {
                $scope.PolicyDetails.policyHolder.remitToAddress = $scope.PolicyDetails.policyHolder.address;
                $scope.PolicyDetails.policyHolder.remitToAddress.completeAddress = $scope.PolicyDetails.policyHolder.address.completeAddress;
            }
            else {
                $scope.PolicyDetails.policyHolder.remitToAddress = $scope.PolicyDetails.remitToAddress;
            }
            $scope.PolicyDetails.policyHolder.dayTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.dayTimePhone, false);
            $scope.PolicyDetails.reportDate = $filter('DateFormatMMddyyyy')($scope.PolicyDetails.reportDate, "MM/dd/yyyy")
            $scope.getHomeOwnerPolicyTypes();
            if ($scope.DdlSourcePolicyType && $scope.PolicyDetails.homeownerPolicyType) {
                var specialLimit = $scope.DdlSourcePolicyType.filter(function (DdlSourcePolType) {
                    return DdlSourcePolType.id == $scope.PolicyDetails.homeownerPolicyType.id
                });
                if (specialLimit && specialLimit.length > 0 && specialLimit[0]) {
                    $scope.PolicyDetails.totalSpecialLimit = specialLimit[0].specialLimit;
                }
                else {
                    if ($scope.PolicyDetails.categories && $scope.PolicyDetails.categories.length > 0) {
                        var limit = 0;
                        angular.forEach($scope.PolicyDetails.categories, function (item) {
                            limit = limit + parseFloat(item.coverageLimit);
                        })
                        $scope.PolicyDetails.totalSpecialLimit = limit;
                    }
                }
            }

            // Get default details
            CreateDefaultDetails();
            
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.getHomeOwnerPolicyTypes = getHomeOwnerPolicyTypes
    function getHomeOwnerPolicyTypes() {
        //API#95
        if ($scope.PolicyDetails.policyHolder && $scope.PolicyDetails.policyHolder.remitToAddress.state && $scope.PolicyDetails.policyHolder.remitToAddress.state.id) {

            var GetPolicyType = PolicyDetailsService.getPolicyType($scope.PolicyDetails.policyHolder.remitToAddress.state.id);
            GetPolicyType.then(function (success) {
                $scope.DdlSourcePolicyType = success.data.data;
                if ($scope.DdlSourcePolicyType && $scope.PolicyDetails && $scope.PolicyDetails.homeownerPolicyType) {
                    var specialLimit = $scope.DdlSourcePolicyType.filter(function (DdlSourcePolType) {
                        return DdlSourcePolType.id == $scope.PolicyDetails.homeownerPolicyType.id
                    });
                    if (specialLimit && specialLimit.length > 0 && specialLimit[0]) {
                        $scope.PolicyDetails.totalSpecialLimit = specialLimit[0].specialLimit;
                    }
                    else {
                        if ($scope.PolicyDetails.categories && $scope.PolicyDetails.categories.length > 0) {
                            var limit = 0;
                            angular.forEach($scope.PolicyDetails.categories, function (item) {
                                limit = limit + parseFloat(item.coverageLimit);
                            })
                            $scope.PolicyDetails.totalSpecialLimit = limit;
                        }
                    }
                }
                else {
                    if ($scope.PolicyDetails.categories && $scope.PolicyDetails.categories.length > 0) {
                        var limit = 0;
                        angular.forEach($scope.PolicyDetails.categories, function (item) {
                            limit = limit + parseFloat(item.coverageLimit);
                        })
                        $scope.PolicyDetails.totalSpecialLimit = limit;
                    }
                }
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }

    }

    $scope.updatePolicyInfo = updatePolicyInfo;
    function updatePolicyInfo() {
        var paramUpdate = {
            "id": $scope.PolicyDetails.id,
            "policyNumber": $scope.PolicyDetails.policyNumber,
            "policyType": $scope.PolicyDetails.policyType,
            "totalPolicyCoverage": $scope.PolicyDetails.totalCoverage,
            "totalSpecialLimit": $scope.PolicyDetails.totalSpecialLimit,
            "totalDetuctableAmount": $scope.PolicyDetails.totalDetuctibleAmount,
            "reportDate": $scope.PolicyDetails.reportDate,
            "homeOwnerPolicyTypeId": $scope.PolicyDetails.homeownerPolicyType.id,
            "remitToAddress": $scope.PolicyDetails.policyHolder.remitToAddress
        };


        var UpdatePolicyDetails = PolicyDetailsService.UpdatePolicyDetails(paramUpdate);
        UpdatePolicyDetails.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.success("Policyholder details has beed updated successfully", "Confirmation");
            getPolicyDetails();
            $scope.isPolicyDetailsEdit = false;
        },
            function (error) {
                toastr.error();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
    }

    $scope.showPolicyDetailsEdit = function () {
        $scope.isPolicyDetailsEdit = true;
    }
    $scope.showPolicyDetailsReadOnly = function (form) {
        $scope.isPolicyDetailsEdit = false;
        form.$setPristine();
    }
    $scope.showPolicyholderEdit = function (e) {
        // Get default details
        CreateDefaultDetails();
        $scope.isPolicyholderEdit = true;
    }
    $scope.showPolicyholderReadOnly = function (form) {
        getPolicyDetails();
        $scope.isPolicyholderEdit = false;
        form.$setPristine();
    }

    // Update PolicyholderInfo
    $scope.updatePolicyholderInfo = updatePolicyholderInfo;
    function updatePolicyholderInfo() {
        $(".page-spinner-bar").removeClass("hide");
        var cellPhone = $scope.PolicyDetails.policyHolder.cellPhone;
        var dayTimePhone = $scope.PolicyDetails.policyHolder.dayTimePhone;
        var eveningTimePhone = $scope.PolicyDetails.policyHolder.eveningTimePhone;
        var secondaryAddressId = "";
        var secondaryCity = null;
        var streetAddressOne = null;
        var streetAddressTwo = null;
        var zipcode = null;
        var stateId = null;
        if ($scope.PolicyDetails.policyHolder.secondaryAddressId != null) {
            secondaryAddressId = $scope.PolicyDetails.policyHolder.secondaryAddressId.id;
            secondaryCity = $scope.PolicyDetails.policyHolder.secondaryAddress;
            streetAddressOne = $scope.PolicyDetails.policyHolder.secondaryAddress.streetAddressOne;
            streetAddressTwo = $scope.PolicyDetails.policyHolder.secondaryAddress.streetAddressTwo;
            zipcode = $scope.PolicyDetails.policyHolder.secondaryAddress.zipcode;
            stateId = $scope.PolicyDetails.policyHolder.address.state;


        }

        var paramUpdate = {
            "contactId" : $scope.PolicyDetails.policyHolder.contactId,
            "id": $scope.PolicyDetails.policyHolder.policyHolderId,
            "claimNumber": sessionStorage.getItem("ClaimNo"),
            "cellPhone": cellPhone != null ? cellPhone.replace(/[^0-9]/g, '') : null,
            "dayTimePhone": dayTimePhone != null ? dayTimePhone.replace(/[^0-9]/g, '') : null,
            "email": $scope.PolicyDetails.policyHolder.email,
            "secondaryEmail": $scope.PolicyDetails.policyHolder.secondaryEmail,
            "eveningTimePhone": eveningTimePhone != null ? eveningTimePhone.replace(/[^0-9]/g, '') : null,
            "firstName": $scope.PolicyDetails.policyHolder.firstName,
            "lastName": $scope.PolicyDetails.policyHolder.lastName,
            "address": {
                "id": $scope.PolicyDetails.policyHolder.address.id ? $scope.PolicyDetails.policyHolder.address.id : "",
                "city": $scope.PolicyDetails.policyHolder.address.city,
                "streetAddressOne": angular.isUndefined($scope.PolicyDetails.policyHolder.address.streetAddressOne) ? null : $scope.PolicyDetails.policyHolder.address.streetAddressOne,
                "streetAddressTwo": angular.isUndefined($scope.PolicyDetails.policyHolder.address.streetAddressTwo) ? null : $scope.PolicyDetails.policyHolder.address.streetAddressTwo,
                "zipcode": angular.isUndefined($scope.PolicyDetails.policyHolder.address.zipcode) ? null : $scope.PolicyDetails.policyHolder.address.zipcode,
                "state": {
                    "id": angular.isUndefined($scope.PolicyDetails.policyHolder.address.state) ? null : $scope.PolicyDetails.policyHolder.address.state.id
                }
            },
            "secondaryAddress": {
                "id": $scope.PolicyDetails.policyHolder.secondaryAddress && $scope.PolicyDetails.policyHolder.secondaryAddress.id ? $scope.PolicyDetails.policyHolder.secondaryAddress.id : "",
                "city": $scope.PolicyDetails.policyHolder.secondaryAddress && $scope.PolicyDetails.policyHolder.secondaryAddress.city ? $scope.PolicyDetails.policyHolder.secondaryAddress.city : "",
                "streetAddressOne": $scope.PolicyDetails.policyHolder.secondaryAddress && $scope.PolicyDetails.policyHolder.secondaryAddress.streetAddressOne ? $scope.PolicyDetails.policyHolder.secondaryAddress.streetAddressOne : "",
                "streetAddressTwo": $scope.PolicyDetails.policyHolder.secondaryAddress && $scope.PolicyDetails.policyHolder.secondaryAddress.streetAddressTwo ? $scope.PolicyDetails.policyHolder.secondaryAddress.streetAddressTwo : "",
                "zipcode": $scope.PolicyDetails.policyHolder.secondaryAddress && $scope.PolicyDetails.policyHolder.secondaryAddress.zipcode ? $scope.PolicyDetails.policyHolder.secondaryAddress.zipcode : "",
                "state": {
                    "id": $scope.PolicyDetails.policyHolder.secondaryAddress && $scope.PolicyDetails.policyHolder.secondaryAddress.state ? $scope.PolicyDetails.policyHolder.secondaryAddress.state.id : ""
                }
            },
            "registrationNumber": sessionStorage.getItem("speedCheckVendor"),

            "curInsuranceAccountNumber": $scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber,
            "newInsuranceAccountNumber": $scope.CommonObj.newInsuranceAccountNumber,
            "curPolicyNumber": $scope.PolicyDetails.policyNumber,
            "newPolicyNumber": $scope.CommonObj.newPolicyNumber,

        };       

        var UpdatePolicyDetails = PolicyDetailsService.UpdatePolicyholderDetails(paramUpdate);
        UpdatePolicyDetails.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.success("Policyholder details has beed updated successfully", "Confirmation");
            getPolicyDetails();
            $scope.isPolicyholderEdit = false;
        },
            function (error) {
                toastr.error();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
    };

    $scope.getStates = getStates;

    function getStates() {
        var param = {
            "isTaxRate": false,
            "isTimeZone": false
        };
        var statelist = PolicyDetailsService.getStates(param);
        statelist.then(function (success) {
            $scope.DdlStateList = success.data.data;

        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };
    $scope.getSpecialLimitOnPolicyType = function () {
        //    $scope.PolicyDetails.homeownerPolicyType.id
        var selectedHO = $scope.DdlSourcePolicyType.find(x => x.id === $scope.PolicyDetails.homeownerPolicyType.id)
        $scope.PolicyDetails.totalSpecialLimit = selectedHO.specialLimit;
        $scope.PolicyDetails.totalCoverage = selectedHO.totalCoverage;
    }

    // Invite Policyholder
    $scope.resetUserPsw = resetUserPsw;
    function resetUserPsw() {
        if($scope.PolicyDetails.policyHolder.contactId){
            $(".page-spinner-bar").removeClass("hide");        
            var EmpDetails = {
                "id": $scope.PolicyDetails.policyHolder.contactId
            }
            var resetPassword = PolicyDetailsService.resetUserPassword(EmpDetails);
            resetPassword.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                $scope.Status = success.data.status;
                if ($scope.Status == 200) {
                    toastr.remove();
                    $(".page-spinner-bar").addClass("hide");
                    toastr.success(success.data.message, "Confirmation");
                }            
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                toastr.error(error.data.errorMessage, "Error");
            });  
        }else{
            toastr.remove()
            toastr.error("Contact id should not be null.", "Error");
        }      
    }

    $scope.CreateDefaultDetails = CreateDefaultDetails;
    function CreateDefaultDetails() {
            if (angular.isDefined($scope.PolicyDetails.policyHolder)) {
                var PolicyInitials = "";
                var InsuranceCompanyIntials = "";
                var CurrentDate = $filter('date')(new Date(), "MMddyyyy");
                var CurrentTime = $filter('date')(new Date(), "HHmmss");
                if ((angular.isDefined($scope.PolicyDetails.policyHolder.lastName) && $scope.PolicyDetails.policyHolder.lastName !== null) &&
                    (angular.isDefined($scope.PolicyDetails.policyHolder.firstName) && $scope.PolicyDetails.policyHolder.firstName !== null)) {
                    PolicyInitials += ($scope.PolicyDetails.policyHolder.firstName.charAt(0)) + "" + ($scope.PolicyDetails.policyHolder.lastName.charAt(0));
                }
                if (angular.isDefined($scope.PolicyDetails.insuraceAccountDetails) && angular.isDefined($scope.PolicyDetails.insuraceAccountDetails.insuranceCompanyDetails) && 
                    $scope.PolicyDetails.insuraceAccountDetails.insuranceCompanyDetails.name !== null) {

                    var insuranceCompanyName = $scope.PolicyDetails.insuraceAccountDetails.insuranceCompanyDetails.name.trim();//Removing Empty spaces at left and right side
                    var abc = insuranceCompanyName.indexOf(' ');//Checking for spaces in Company name string
                    if (abc == -1) {
                        InsuranceCompanyIntials += (insuranceCompanyName.charAt(0)) + "" + (insuranceCompanyName.charAt());
                        if ((angular.isDefined(PolicyInitials) && PolicyInitials.length > 0) &&
                            (angular.isDefined(InsuranceCompanyIntials) && InsuranceCompanyIntials.length > 0)) {
                            $scope.CommonObj.newPolicyNumber = "PL" + "" + InsuranceCompanyIntials.toUpperCase() + "" + PolicyInitials.toUpperCase() + "" + CurrentDate + "" + CurrentTime.toString();
                            $scope.CommonObj.newInsuranceAccountNumber = "CA" + "" + InsuranceCompanyIntials.toUpperCase() + "" + PolicyInitials.toUpperCase() + "" + CurrentDate + CurrentTime.toString();
                        }
                    }
                    else {
                        InsuranceCompanyIntials += (insuranceCompanyName.charAt(0));
                        for (var i = 0; i <= insuranceCompanyName.length; i++) {
                            if (insuranceCompanyName[i] == " " && i < insuranceCompanyName.length) {
                                InsuranceCompanyIntials += insuranceCompanyName[i + 1];
                            }
                        }
                        if ((angular.isDefined(PolicyInitials) && PolicyInitials.length > 0) &&
                            (angular.isDefined(InsuranceCompanyIntials) && InsuranceCompanyIntials.length > 0)) {
                            $scope.CommonObj.newPolicyNumber = "PL" + "" + InsuranceCompanyIntials.toUpperCase() + "" + PolicyInitials.toUpperCase() + "" + CurrentDate + CurrentTime.toString();
                            $scope.CommonObj.newInsuranceAccountNumber = "CA" + "" + InsuranceCompanyIntials.toUpperCase() + "" + PolicyInitials.toUpperCase() + "" + CurrentDate + CurrentTime.toString();
                        }
                    }
                }
            }
    }

});