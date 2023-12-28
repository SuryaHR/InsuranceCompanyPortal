angular.module('MetronicApp')
    .directive(
        'datePicker',
        function () {
            return {
                restrict: "A",
                require: "ngModel",
                link: function (scope, elm, attr, ctrl) {
                    // Format date on load
                    ctrl.$formatters.unshift(function (value) {
                        if (value && moment(value).isValid()) {
                            return moment(new Date(value)).format(
                                'MM/DD/YYYY');
                        }
                        return value;
                    })
                    // Disable Calendar
                    scope.$watch(attr.ngDisabled, function (newVal) {
                        if (newVal === true)
                            $(elm).datepicker("disable");
                        else
                            $(elm).datepicker("enable");
                    });
                    // Datepicker Settings
                    elm.datepicker({
                        autoSize: true,
                        changeYear: true,
                        changeMonth: true,
                        dateFormat: attr["dateformat"] || 'mm/dd/yy',
                        onSelect: function (valu) {
                            scope.$apply(function () {
                                ctrl.$setViewValue(valu);
                            });
                            elm.focus();
                        },

                        beforeShow: function () {
                            debugger;
                            if (attr["minDate"] != null)
                                $(elm).datepicker('option', 'minDate',
                                    attr["minDate"]);

                            if (attr["maxDate"] != null)
                                $(elm).datepicker('option', 'maxDate',
                                    attr["maxDate"]);
                        },
                    });
                }
            }
        })

    .directive('valdateDate', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, mCtrl) {
                function myValidation(value) {
                    var enterDate = new Date(value);
                    var currDate = new Date();
                    if (enterDate.getTime() <= currDate.getTime()) {
                        mCtrl.$setValidity('dateValid', true);
                    } else {
                        mCtrl.$setValidity('dateValid', false);
                    }
                    return value;
                }
                mCtrl.$parsers.push(myValidation);
            }
        };
    })

    .controller('AddPolicyController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,CalendarUtility,
        AuthHeaderService, AddPolicyService) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        //set language
        $translatePartialLoader.addPart('AddPolicy');
        $translate.refresh();

        $scope.policyDetails = {};

        // fetch state list
        $scope.StateList = [];

        $scope.HOPolicyTypes = [];

        function init() {
            // Service call to populate state list
            var statePromise = AddPolicyService.getStates();
            statePromise.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.StateList = []; });

            var hoPolicyTypes = AddPolicyService.getHomeOwnerPolicyTypes();
            hoPolicyTypes.then(function (success) { $scope.HOPolicyTypes = success.data.data; }, function (error) { $scope.HOPolicyTypes = []; });
        }
        init();


        //Get Agent's info from session
        $scope.policyDetails.createdBy = sessionStorage.getItem("UserId");

        $scope.GotoAgentDashboard = GotoAgentDashboard;
        function GotoAgentDashboard() {
            $location.url("/InsuranceAgent");
        }

        $scope.getMaxDate = getMaxDate;
        function getMaxDate(effDate) {
            var d = new Date(effDate);
            if(!isNaN(d.getTime())){
            nextRenewalYear = d.getFullYear() + 1;            
            renewDate = new Date(d).setFullYear(nextRenewalYear);
            var dateOffset = (24*60*60*1000) * 1; //1 day
            offDayDate = new Date(renewDate)
            offDayDate.setTime(offDayDate.getTime() - dateOffset);
            $scope.policyDetails.renewalDate = formatDatetoString(offDayDate);
            }
        }

        $('#effCal').on('click', function (e) {
            e.preventDefault();
            $(this).attr("autocomplete", "off");
        });

        $('#reCal').on('click', function (e) {
            e.preventDefault();
            $(this).attr("autocomplete", "off");
        });


        // Format Date to string to display in UI
        $scope.formatDatetoString = formatDatetoString
        function formatDatetoString(renewDate) {
            var d = new Date(renewDate);
            var curr_date = (d.getDate() < 10 ? '0' : '') + (d.getDate());
            // Months are zero based
            var curr_month = (d.getMonth() + 1 >= 10 ? '' : '0') + (d.getMonth() + 1);
            var curr_year = d.getFullYear();
            var formattedDate = curr_month + "/" + curr_date + "/" + curr_year;
            return formattedDate;
        }

        // Effective & Renewal date validations
        $scope.hasError = function(input){                     
             if($scope.policyDetails.effectiveDate && $scope.policyDetails.renewalDate){
                var effDate = new Date($scope.policyDetails.effectiveDate ); //dd-mm-YYYY
                var renDate = new Date($scope.policyDetails.renewalDate);
                //console.log(renDate +" < "+ effDate);
                if(renDate < effDate){
                    //$scope.addPolicyForm.renewDate.$setValidity("ccNumber", false);
                    input.$setValidity("renewDate",false);
                    return true;
                }else{
                    input.$setValidity("renewDate",true);
                    return false;
                }
             }
             input.$setValidity("renewDate",true);
             return false;
        };

        $scope.addPolicy = addPolicy;
        function addPolicy() {
            $scope.policyDetails.priCellPhone = $scope.policyDetails.priCellPhone.replace(/[^0-9]/g, '');
            if ($scope.policyDetails.secCellPhone != "" && $scope.policyDetails.secCellPhone != undefined) {
                $scope.policyDetails.secCellPhone = $scope.policyDetails.secCellPhone.replace(/[^0-9]/g, '');
            }
            var details = {
                "primaryPolicyHolderFname": $scope.policyDetails.priFirstName,
                "primaryPolicyHolderLname": $scope.policyDetails.priLastName,
                "secondaryPolicyHolderFname": $scope.policyDetails.secFirstName,
                "secondaryPolicyHolderLname": $scope.policyDetails.secLastName,
                "primaryPolicyHolderEmailId": $scope.policyDetails.priEmail,
                "secondaryPolicyHolderEmailId": $scope.policyDetails.secEmail,
                "primaryPolicyHolderCellphoneNo": $scope.policyDetails.priCellPhone,
                "secondaryPolicyHolderCellphoneNo": $scope.policyDetails.secCellPhone,
                "streetAddressOne": $scope.policyDetails.streetAddress1,
                "streetAddressTwo": $scope.policyDetails.streetAddress2,
                "city": $scope.policyDetails.cityTown,
                "state": {
                    "id": $scope.policyDetails.phState
                },
                "zipcode": $scope.policyDetails.zipCode,
                "policyEffectiveDate": (($scope.policyDetails.effectiveDate !== null && angular.isDefined($scope.policyDetails.effectiveDate)) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.policyDetails.effectiveDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null),
                "policyRenewalDate": (($scope.policyDetails.renewalDate !== null && angular.isDefined($scope.policyDetails.renewalDate)) ? $filter('DatabaseDateFormatMMddyyyyTime')($scope.policyDetails.renewalDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z" : null),
                "policyNumber": $scope.policyDetails.policyNum,
                "homeOwnersPolicyType": $scope.policyDetails.phPolicyType,
                "agentId": $scope.policyDetails.createdBy
            };

            // sessionStorage.setItem("policyNumber",$scope.policyDetails.policyNum);
            // sessionStorage.setItem("primaryPolicyHolderFname", $scope.policyDetails.priFirstName);
            // sessionStorage.setItem("primaryPolicyHolderLname", $scope.policyDetails.priLastName);
            // if(sessionStorage.setItem("secondaryPolicyHolderFname", $scope.policyDetails.secFirstName) != "null" && sessionStorage.setItem("secondaryPolicyHolderFname", $scope.policyDetails.secFirstName) != "" && typeof sessionStorage.setItem("secondaryPolicyHolderFname", $scope.policyDetails.secFirstName) != 'undefined'){
            //     sessionStorage.setItem("secondaryPolicyHolderFname", $scope.policyDetails.secFirstName);
            // }
            // if(sessionStorage.setItem("secondaryPolicyHolderLname", $scope.policyDetails.secLastName) != "null" && sessionStorage.setItem("secondaryPolicyHolderLname", $scope.policyDetails.secLastName) != "" && typeof sessionStorage.setItem("secondaryPolicyHolderLname", $scope.policyDetails.secLastName) != 'undefined'){
            //     sessionStorage.setItem("secondaryPolicyHolderLname", $scope.policyDetails.secLasttName);
            // }
            // sessionStorage.setItem("primaryPolicyHolderCellphoneNo", $scope.policyDetails.priCellPhone);
            // sessionStorage.setItem("policyEffectiveDate",$scope.policyDetails.effectiveDate);
            // sessionStorage.setItem("policyRenewalDate",$scope.policyDetails.renewalDate);
            // sessionStorage.setItem("primaryPolicyHolderEmailId",$scope.policyDetails.priEmail);
            // sessionStorage.setItem("secondaryPolicyHolderCellphoneNo", $scope.policyDetails.secCellPhone);
            // sessionStorage.setItem("secondaryPolicyHolderEmailId",$scope.policyDetails.secEmail);

            var savePolicy = AddPolicyService.savePolicy(details);
            savePolicy.then(function (success) {
                if (success.data.success.status === 200) {
                    sessionStorage.setItem("policyId", success.data.success.policyId);
                    sessionStorage.setItem("policyNumber", success.data.success.policyNumber);
                    toastr.remove();
                    toastr.success(success.data.success.message, "Confirmation");
                    sessionStorage.setItem("EditAppraisal", false);
                    $location.url("/Appraisal");
                }
                else {
                    toastr.remove();
                    toastr.success(success.data.success.message, "Error");
                }
            }, function (error) {
                toastr.remove()
                if (angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error");
                }
                else
                    toastr.error('Failed to save policy holder details. Please try again..', "Error");
            });
        }
        $scope.onStateChange = function(param){
            var hoPolicyTypes = AddPolicyService.getHomeOwnerPolicyTypesOnState(param);
            hoPolicyTypes.then(function (success) { $scope.HOPolicyTypes = success.data.data; }, function (error) { $scope.HOPolicyTypes = []; });
        }
    });