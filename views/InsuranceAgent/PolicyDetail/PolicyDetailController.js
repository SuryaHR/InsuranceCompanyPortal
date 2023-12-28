angular.module('MetronicApp')

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

    .controller('PolicyDetailController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $timeout, $translatePartialLoader, InsuranceAgentHomeService, CalendarUtility,
        AuthHeaderService, AppraisalService, AddPolicyService) {
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        $translatePartialLoader.addPart('PolicyDetails');
        $translate.refresh();
        $scope.ErrorMessage = "";
        $scope.policyDetail = {};
        $scope.searchResult = false;
        $scope.StateList = [];
        $scope.UserType = sessionStorage.getItem('RoleList');
        var pageName = "POLICY_DETAILS";
        $scope.canDelete = true;

        // Pagination
        $scope.pageSize = 15;
        $scope.totalItems = 0;        
        $scope.currentPage = 1;
        $scope.toShowingPage = 15;

        function init() {
            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;
            {
                ShowItem: "All"
            };
            //check from which page is it redirecting to
            var refferer = sessionStorage.getItem("refferer");
            if (refferer === "SEARCH_RESULT")
                $scope.searchResult = true;
            if (refferer === "REPORTS")
                $scope.isReport = true;
            if(refferer === "ALLAPPRAISALS")
                $scope.isAllAppraisals = true;
            // fetch state list
            // Service call to populate state list
            var statePromise = AddPolicyService.getStates();
            statePromise.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.StateList = []; });
            $timeout(function(){
              getPolicyDetailsById(sessionStorage.getItem("policyNumber"));
            },100)
        }
        init();

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

        $scope.getMaxDate = getMaxDate;
        function getMaxDate(effDate) {
            var d = new Date(effDate);
            if(!isNaN(d.getTime())){
                nextRenewalYear = d.getFullYear() + 1;            
                renewDate = new Date(d).setFullYear(nextRenewalYear);
                var dateOffset = (24*60*60*1000) * 1; //1 day
                offDayDate = new Date(renewDate)
                offDayDate.setTime(offDayDate.getTime() - dateOffset);
                $scope.policyDetail.policyRenewalDate = formatDatetoString(offDayDate);
            }
        }

        $scope.getMaxDateOld = getMaxDateOld;
        function getMaxDateOld(effDate) {
            var d = new Date(effDate);
            var effMonth = d.getMonth() + 1;
            var effDay = d.getDate();
            var effYear = d.getFullYear();

            var currDate = new Date();
            var currMonth = currDate.getMonth() + 1;
            var currDay = currDate.getDate();
            var currYear = currDate.getFullYear();

            if (effMonth < currMonth) {
                var nextRenewalYear = new Date().getFullYear() + 1;
                var renewDate = new Date(d).setFullYear(nextRenewalYear);
            }
            else if (effMonth === currMonth) {
                if (effDay < currDay) {
                    var nextRenewalYear = new Date().getFullYear() + 1;
                    var renewDate = new Date(d).setFullYear(nextRenewalYear);
                }
                else {
                    var nextRenewalDay = new Date(d).getDate();
                    var nextRenewalYear = new Date(d).getFullYear();
                    var renewDate = new Date(d).setDate(nextRenewalDay);
                    if (nextRenewalYear < currYear) {
                        var renewDate = new Date(d).setFullYear(currYear);
                    }
                    else if (nextRenewalYear === currYear) {
                        var renewDate = new Date(d).setFullYear(currYear + 1);
                    }
                }
            }
            else {
                var nextRenewalYear = new Date().getFullYear();
                var renewDate = new Date(d).setFullYear(nextRenewalYear);
            }

            if (d.getTime() <= currDate.getTime()) {
                $scope.policyDetail.policyRenewalDate = formatDatetoString(renewDate);
            } else {
                $scope.policyDetail.policyRenewalDate = null;
            }

        }

        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            $scope.currentPage = 1;

            var pagesTotal= $scope.currentPage *  $scope.pageSize;            
            if($scope.totalItems > pagesTotal ){
                $scope.toShowingPage = ($scope.pageSize * ($scope.currentPage - 1))+1+($scope.pageSize-1);
            }else{
                var absolutePagesize= pagesTotal - $scope.pageSize;
                $scope.toShowingPage = absolutePagesize + ($scope.totalItems-absolutePagesize);
            }
        }

        $scope.getPolicyDetailsById = getPolicyDetailsById;
        function getPolicyDetailsById(id) {
            var param = {
                "id": id,
                "AgentId": sessionStorage.getItem("UserId"),
                "Role": sessionStorage.getItem("UserType")
            }
            $(".page-spinner-bar").removeClass("hide");
            var policyDetails = InsuranceAgentHomeService.getPolicyDetailsById(param);
            policyDetails.then(function (success) {
                $scope.policyDetail = success.data.PolicyHolderDetails;
                $rootScope.policyDetail = $scope.policyDetail;


                if (angular.isDefined($scope.policyDetail.policyEffectiveDate)) {
                    $scope.policyDetail.policyEffectiveDate = $filter('date')(new Date($scope.policyDetail.policyEffectiveDate), 'MM/dd/yyyy');
                }
                else
                    $scope.policyDetail.policyEffectiveDate = null;


                if (angular.isDefined($scope.policyDetail.policyRenewalDate)) {
                    $scope.policyDetail.policyRenewalDate = $filter('date')(new Date($scope.policyDetail.policyRenewalDate), 'MM/dd/yyyy');;
                }
                else
                    $scope.policyDetail.policyRenewalDate = null;

                if ($scope.policyDetail.policyStatus)
                    $scope.policyDetail.status = "Active";
                else
                    $scope.policyDetail.status = "InActive";

                $rootScope.policyDetail.status = $scope.policyDetail.status

                $scope.secondaryPolicyholderEmail = ($scope.policyDetail.secondaryPolicyHolderEmailId) ? $scope.policyDetail.secondaryPolicyHolderEmailId : "";
                $scope.secondaryPolicyholderFirstName = ($scope.policyDetail.secondaryPolicyHolderFname) ? $scope.policyDetail.secondaryPolicyHolderFname : "";
                $scope.secondaryPolicyHolderLastName = ($scope.policyDetail.secondaryPolicyHolderLname) ? $scope.policyDetail.secondaryPolicyHolderLname : "";

                $scope.policyDetail.primaryPolicyHolderCellphoneNo = $filter('tel')($scope.policyDetail.primaryPolicyHolderCellphoneNo);
                $scope.policyDetail.secondaryPolicyHolderCellphoneNo = $filter('tel')($scope.policyDetail.secondaryPolicyHolderCellphoneNo);

                // $scope.policyDetail.policyRenewalDate = $filter('date')(new Date($scope.policyDetail.policyRenewalDate),'yyyy-MM-dd');
                //for further use store into session
                sessionStorage.setItem("id", $scope.policyDetail.id);
                sessionStorage.setItem("policyId", $scope.policyDetail.policyId);
                sessionStorage.setItem("policyNumber", $scope.policyDetail.policyNumber);
                sessionStorage.setItem("primaryPolicyHolderFname", $scope.policyDetail.primaryPolicyHolderFname);
                sessionStorage.setItem("primaryPolicyHolderLname", $scope.policyDetail.primaryPolicyHolderLname);
                sessionStorage.setItem("secondaryPolicyHolderFname", $scope.policyDetail.secondaryPolicyHolderFname);
                sessionStorage.setItem("zipcode", $scope.policyDetail.address.zipcode);
                sessionStorage.setItem("primaryPolicyHolderCellphoneNo", $scope.policyDetail.primaryPolicyHolderCellphoneNo);
                sessionStorage.setItem("primaryPolicyHolderEmailId", $scope.policyDetail.primaryPolicyHolderEmailId);
                sessionStorage.setItem("streetAddressOne", $scope.policyDetail.address.streetAddressOne);
                sessionStorage.setItem("streetAddressTwo", $scope.policyDetail.address.streetAddressTwo);
                sessionStorage.setItem("city", $scope.policyDetail.address.city);
                sessionStorage.setItem("stateName", $scope.policyDetail.address.state.stateName);
                sessionStorage.setItem("completeAddress", $scope.policyDetail.address.completeAddress);
                sessionStorage.setItem("policyEffectiveDate", $scope.policyDetail.policyEffectiveDate);
                sessionStorage.setItem("policyRenewalDate", $scope.policyDetail.policyRenewalDate);
                sessionStorage.setItem("secondaryPolicyHolderLname", $scope.policyDetail.secondaryPolicyHolderLname)
                sessionStorage.setItem("status", $scope.policyDetail.status);
                sessionStorage.setItem("secondaryPolicyHolderCellphoneNo", $scope.policyDetail.secondaryPolicyHolderCellphoneNo);
                sessionStorage.setItem("secondaryPolicyHolderEmailId", $scope.secondaryPolicyholderEmail);
                //$scope.FilteredOffice = success.data.data;
              getAppraisalList();
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.editPolicy = editPolicy;
        function editPolicy() {
            $scope.isEdit = true;
        }

        $scope.DeletePolicy = DeletePolicy;
        function DeletePolicy() {
            bootbox.confirm({
                size: "",
                title: "Delete Policy ",
                message: "Are you sure you want to delete this policy? All appraisals and information saved under this policy will be deleted."
                , closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Delete",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        if (angular.isDefined(sessionStorage.getItem("policyId")) && sessionStorage.getItem("policyId") !== null) {
                            var param = {
                                "policyId": sessionStorage.getItem("policyId"),
                                "speedCheckVendor": sessionStorage.getItem("speedCheckVendor")
                            };
                            $(".page-spinner-bar").removeClass("hide");
                            var DeleteItem = InsuranceAgentHomeService.DeletePolicy(param);
                            DeleteItem.then(function (success) {
                                $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.success(success.data.message, "Confirmation");
                                $location.path("/InsuranceAgent");
                            }, function (error) {
                                $(".page-spinner-bar").addClass("hide");
                                toastr.remove();
                                toastr.error(error.data.errorMessage, "Error");
                            });

                        };
                    }
                }
            });
        }

        $scope.AddNewAppraisal = AddNewAppraisal;
        function AddNewAppraisal() {
            sessionStorage.setItem("isEditAppraisal", false);
            sessionStorage.setItem("EditAppraisal", false);
            $timeout(function(){
              $location.path('/Appraisal');
            },10);
        }

        $scope.DeleteAppraisal = DeleteAppraisal;
        function DeleteAppraisal(appraisal) {
            var msg = "";
            msg = "Are you sure you want to delete this appraisal? All information saved under this appraisal will be deleted.";
            if (appraisal.supAssociateReviewStatus && appraisal.status.status == 'DEACTIVATED') {
                $scope.allowToDelete = true;
            } else {
                $scope.allowToDelete = false;
            }
            bootbox.confirm({
                size: "",
                title: "Delete Appraisal",
                message: msg, closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Delete",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        if (angular.isDefined(appraisal.id) && appraisal.id !== null && !($scope.allowToDelete)) {

                            var app = {
                                "appraisalId": appraisal.id,
                                "speedCheckVendor": sessionStorage.getItem("speedCheckVendor")
                            }

                            $(".page-spinner-bar").removeClass("hide");
                            var promis = AppraisalService.deleteAppraisal(app);
                            promis.then(function (success) {
                                $(".page-spinner-bar").addClass("hide");
                                toastr.remove()
                                toastr.success(" All information saved under the appraisal # " + appraisal.appraisalNumber + " has been successfully deleted.", "Confirmation");
                                getPolicyDetailsById(sessionStorage.getItem("policyNumber"));
                                getAppraisalList();
                            },
                                function (error) {
                                    $(".page-spinner-bar").addClass("hide");
                                    toastr.remove();
                                    if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                                        toastr.error(error.data.errorMessage, "Error")
                                    }
                                    else {
                                        toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                                    }
                                });
                        } else {
                            toastr.remove()
                            toastr.warning("The Appraisal # " + appraisal.appraisalNumber + " is already deactivated.", "Warning");
                        }
                    }
                }
            });

        }

        $scope.AppraisalList = [];
        //appraisalList
        $scope.getAppraisalList = getAppraisalList;
        function getAppraisalList() {
            var AppraisalList = InsuranceAgentHomeService.getAppraisalList(sessionStorage.getItem("policyId"));
            AppraisalList.then(function (success) {
                $scope.AppraisalList = success.data.appraisalList;
                $scope.totalItems = $scope.AppraisalList !=null ? $scope.AppraisalList.length:0; 
                if($scope.pageSize > $scope.totalItems){
                    $scope.toShowingPage = $scope.totalItems;
                }                
                $scope.sortKey = 'appraisalUpdatedDate';
                //$scope.reverse = false;
                $scope.sort('appraisalUpdatedDate');
                canbeDeleted();
                $(".page-spinner-bar").addClass("hide");
            });
        }

        //Pagination handler
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {            
            $scope.currentPage = pageNum;

            var pagesTotal= $scope.currentPage *  $scope.pageSize;            
            if($scope.totalItems > pagesTotal ){
                $scope.toShowingPage = ($scope.pageSize * ($scope.currentPage - 1))+1+($scope.pageSize-1);
            }else{
                var absolutePagesize= pagesTotal - $scope.pageSize;
                $scope.toShowingPage = absolutePagesize + ($scope.totalItems-absolutePagesize);
            }
        }

        //page redirections
        $scope.GoToHome = GoToHome;
        function GoToHome() {
            sessionStorage.removeItem("currentTab");
            $location.path('InsuranceAgent')
        }

        $scope.GoToSearchPage = GoToSearchPage;
        function GoToSearchPage() {
            $location.path('InsuranceGlobalSearch')
        }

        // GoToReportsPage
        $scope.GoToReportsPage = GoToReportsPage;
        function GoToReportsPage() {
            sessionStorage.setItem("previousPage", pageName);
            $location.path('/InsuranceReports')
        }

        $scope.GoToAllAppraisals = GoToAllAppraisals;
        function GoToAllAppraisals() {
            sessionStorage.setItem("previousPage", pageName);
            $location.path('/InsuranceAllAppraisals');
        }
        
        //editAppraisal
        $scope.editAppraisal = editAppraisal;
        function editAppraisal(param) {

            sessionStorage.setItem("isEditAppraisal", $scope.policyDetail.status == "Active");
            sessionStorage.setItem("AppraisalNo", param.appraisalNo);
            $location.path('/Appraisal');
        }

        $scope.UpdatePolicy = UpdatePolicy;
        function UpdatePolicy() {

            if ($scope.policyDetail.status == "Active")
                $scope.status = true;
            else
                $scope.status = false;

            // $scope.policyDetail.primaryPolicyHolderCellphoneNo = $scope.policyDetail.primaryPolicyHolderCellphoneNo.replace(/[^0-9]/g, '');
            // if($scope.policyDetail.secondaryPolicyHolderCellphoneNo != "" && $scope.policyDetail.secondaryPolicyHolderCellphoneNo != undefined)
            // {
            // $scope.policyDetail.secondaryPolicyHolderCellphoneNo = $scope.policyDetail.secondaryPolicyHolderCellphoneNo.replace(/[^0-9]/g, '');
            // }

            var details = {
                "id": sessionStorage.getItem("id"),
                "policyStatus": $scope.status,
                "policyNumber": $scope.policyDetail.policyNumber,

                "policyEffectiveDate": $filter('DatabaseDateFormatMMddyyyyTime')($scope.policyDetail.policyEffectiveDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z",
                "policyRenewalDate": $filter('DatabaseDateFormatMMddyyyyTime')($scope.policyDetail.policyRenewalDate) + "T" + $filter('date')(new Date(), 'HH:mm:ss') + "Z",

                "primaryPolicyHolderFname": $scope.policyDetail.primaryPolicyHolderFname,
                "primaryPolicyHolderLname": $scope.policyDetail.primaryPolicyHolderLname,
                "primaryPolicyHolderEmailId": $scope.policyDetail.primaryPolicyHolderEmailId,
                "primaryPolicyHolderCellphoneNo": $scope.policyDetail.primaryPolicyHolderCellphoneNo.replace(/[^0-9]/g, ''),

                "secondaryPolicyHolderFname": $scope.policyDetail.secondaryPolicyHolderFname,
                "secondaryPolicyHolderLname": $scope.policyDetail.secondaryPolicyHolderLname,
                "secondaryPolicyHolderEmailId": $scope.policyDetail.secondaryPolicyHolderEmailId,

                "secondaryPolicyHolderCellphoneNo": $scope.policyDetail.secondaryPolicyHolderCellphoneNo.replace(/[^0-9]/g, ''),

                "streetAddressOne": $scope.policyDetail.address.streetAddressOne,
                "streetAddressTwo": $scope.policyDetail.address.streetAddressTwo,
                "city": $scope.policyDetail.address.city,
                "state": {
                    "id" : $scope.policyDetail.address.state.id
                },
                "zipcode": $scope.policyDetail.address.zipcode,

                "agentId": sessionStorage.getItem("UserId"),
                "speedCheckVendor": sessionStorage.getItem("speedCheckVendor")
            };

            sessionStorage.setItem("policyNumber", $scope.policyDetail.policyNumber);
            sessionStorage.setItem("primaryPolicyHolderFname", $scope.policyDetail.primaryPolicyHolderFname);
            sessionStorage.setItem("primaryPolicyHolderLname", $scope.policyDetail.primaryPolicyHolderLname);
            sessionStorage.setItem("secondaryPolicyHolderFname", $scope.policyDetail.secondaryPolicyHolderFname);
            sessionStorage.setItem("primaryPolicyHolderCellphoneNo", $scope.policyDetail.primaryPolicyHolderCellphoneNo);
            sessionStorage.setItem("primaryPolicyHolderEmailId", $scope.policyDetail.primaryPolicyHolderEmailId);
            sessionStorage.setItem("policyEffectiveDate", $scope.policyDetail.policyEffectiveDate);
            sessionStorage.setItem("policyRenewalDate", $scope.policyDetail.policyRenewalDate);
            sessionStorage.setItem("secondaryPolicyHolderLname", $scope.policyDetail.secondaryPolicyHolderLname)
            sessionStorage.setItem("status", $scope.policyDetail.status);
            sessionStorage.setItem("secondaryPolicyHolderCellphoneNo", $scope.policyDetail.secondaryPolicyHolderCellphoneNo);
            sessionStorage.setItem("secondaryPolicyHolderEmailId", $scope.policyDetail.secondaryPolicyHolderEmailId);
            sessionStorage.setItem("secondaryPolicyHolderFname", $scope.policyDetail.secondaryPolicyHolderFname);
            sessionStorage.setItem("secondaryPolicyHolderLname", $scope.policyDetail.secondaryPolicyHolderLname);



            $(".page-spinner-bar").removeClass("hide");
            var savePolicy = InsuranceAgentHomeService.savePolicy(details);
            savePolicy.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                $scope.ErrorMessage = success.data.message;
                toastr.remove();
                toastr.success("Policy details were successfully updated", "Confirmation");
                $location.path('/PolicyDetail');
                getAppraisalList();
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                if (angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error");
                }
                else
                    toastr.error('Failed to update policy holder details. Please try again..', "Error");
            });
        }

        $scope.CancelUpdatePolicy = CancelUpdatePolicy;
        function CancelUpdatePolicy() {
            $scope.isEdit = true;
            //$scope.policyDetail.primaryPolicyHolderFname = "pooja";
            // $scope.policyDetail = $rootScope.policyDetail;
        }

        $scope.openAppraisalDetails = openAppraisalDetails;
        function openAppraisalDetails(appraisal) {
          $(".page-spinner-bar").removeClass("hide");
          sessionStorage.setItem("appraisalId", appraisal.id);
          sessionStorage.setItem("AppraisalNo", appraisal.appraisalNumber);
          sessionStorage.setItem("isEditAppraisal", $scope.policyDetail.status == "Active");
          sessionStorage.setItem("EditAppraisal", true);
          $location.path('/Appraisal');
        }

        //format date
        $scope.formatDatetoString = formatDatetoString
        function formatDatetoString(renewDate) {
            var d = new Date(renewDate);
            var curr_date = (d.getDate() < 10 ? '0' : '') + (d.getDate());
            // Months are zero based
            var curr_month = (d.getMonth() < 10 ? '0' : '') + (d.getMonth() + 1);
            var curr_year = d.getFullYear();
            var formattedDate = curr_month + "/" + curr_date + "/" + curr_year;
            return formattedDate;
        }

        // Activate / Deativate appraisal
        $scope.appraisalAction = appraisalAction
        function appraisalAction(item, status) {
            if($scope.policyDetail.status == "InActive"){
                toastr.remove();
                toastr.warning('Access denied for editing appraisal since policy is inactive!!');
            } else {
            var details = {
                "id": item.id,
                "appraisalNumber": item.appraisalNumber,
                "active": status,
                "speedCheckVendorRegNumber": sessionStorage.getItem("speedCheckVendor")

            };
            $(".page-spinner-bar").removeClass("hide");
            var updateAppraisal = AppraisalService.updateAppraisalStatus(details);
            updateAppraisal.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.success("valuable # " + item.appraisalNumber + " " + success.data.message, "Confirmation");
                $location.path('/PolicyDetail');
                getAppraisalList();
                if(status == true){
                    sessionStorage.setItem("isAppraisalActive",true);

                }else {
                    sessionStorage.setItem("isAppraisalActive",false);

                }
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                if (angular.isDefined(error.data.errorMessage)) {
                    toastr.error('Failed to update valuable # ' + item.appraisalNumber + '. Please try again..', "Error");
                }
                else
                    toastr.error('Failed to update valuable # ' + item.appraisalNumber + '. Please try again..', "Error");
            });
        }
        }

        $scope.canbeDeleted = canbeDeleted;
        function canbeDeleted(){
            if(!!$scope.AppraisalList){
            $scope.reviewList = $scope.AppraisalList.filter((appr)=> ['ARTIGEM-SPEEDCHECK REVIEW','UNDERWRITER REVIEW','POLICYHOLDER REVIEW','AGENT REVIEW'].includes(appr.status?.status));
            $scope.canDelete = !($scope.reviewList?.length==0);
            }
            else
                $scope.canDelete=false;
        }
    });
