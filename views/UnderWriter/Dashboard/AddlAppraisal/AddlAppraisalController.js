angular.module('MetronicApp')
    .controller('AddlAppraisalController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,
        AppraisalService, AuthHeaderService, InsuranceAgentHomeService) {

        $translatePartialLoader.addPart('Appraisal');
        $translate.refresh();
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        $scope.$on('eventEmitedPolicyHolderName', function (event, data) {
            //$scope.mainData.logs = $scope.mainData.logs + '\nMainController - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
            $scope.policyholder = data.policyholder;
        });
        $scope.isEditAppraisal = sessionStorage.getItem("isEditAppraisal") == "true";
        $scope.EditAppraisal = "true";
        $scope.AppraisalNo = sessionStorage.getItem("AppraisalNo");
        $scope.tab = 'Appraisal';
        $scope.ErrorMessage = "";
        $scope.StateList = [];
        var UserType = sessionStorage.getItem('RoleList');
        $scope.showBell = false;
        $scope.primaryFname = sessionStorage.getItem("primaryPolicyHolderFname");
        $scope.primaryLname = sessionStorage.getItem("primaryPolicyHolderLname");        
        var appraisalId = sessionStorage.getItem("appraisalId");
        function init() {
            {
                ShowItem: "All"
            };
            $scope.policyDetail = {};
            $scope.policyDetail.policyNumber = sessionStorage.getItem("policyNumber");
            //getPolicyDetailsById(sessionStorage.getItem("policyNumber"));

            //Get page from which its redirecting
            var refferer = sessionStorage.getItem("refferer");
            $scope.isNotification = true;
            $scope.searchResult = false;
            if (refferer === "SEARCH_RESULT") {
                $scope.searchResult = true;
            }
            else if (refferer === "HOME") {
                // $scope.AppraisalNo=sessionStorage.getItem("AppraisalNo");
            }
            else if (refferer === "APPROVED_APPRAISALS") {
                $scope.approvedAppraisal = true;
            }
            else if (refferer === "APPRAISALS_NEED_UPDATE") {
                $scope.appraisalNeedUpdate = true;
            }
            else if (refferer === "APPRAISALS_EXPIRING") {
                $scope.appraisalExpiring = true;
            }
        }
        init();

        $scope.showNotes = showNotes;
        function showNotes() {
            $(".page-spinner-bar").removeClass("hide");
            // GetNotes();
            $scope.tab = 'Notes';
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.showActivityLog = showActivityLog;
        function showActivityLog() {
            $(".page-spinner-bar").removeClass("hide");
            // GetActivityLog();
            $scope.tab = 'ActivityLog';
            $scope.limit = 50;
            $scope.moreShown = false;
            getActivityLog();
            $scope.showBell = false;
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.goToNewInsuranceRequests = goToNewInsuranceRequests;
        function goToNewInsuranceRequests() {
            //Navigate to New Insurance requests page
            $location.path('/NewInsuranceRequests');
        }

        $scope.gotoDashboard = gotoDashboard;
        function gotoDashboard() {
            sessionStorage.removeItem("refferer");
            $location.path('/UnderWriter');
        }

        $scope.GoToAppraisal = GoToAppraisal;
        function GoToAppraisal() {
            $scope.tab = 'Appraisal';
        }

        $scope.getPolicyDetailsById = getPolicyDetailsById;
        function getPolicyDetailsById(id) {
            var param = {
                "id": id,
                "AgentId": sessionStorage.getItem("UserId"),
                "Role": sessionStorage.getItem("UserType")
            }
            var policyDetails = InsuranceAgentHomeService.getPolicyDetailsById(param);
            policyDetails.then(function (success) {
                $scope.policyDetail = success.data.PolicyHolderDetails;
                //$scope.primaryFname = $scope.policyDetail.primaryPolicyHolderFname;
                //$scope.primaryLname = $scope.policyDetail.primaryPolicyHolderLname;
                //console.log($scope.primaryFname + " , "+$scope.primaryLname);
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.getActivityLog = getActivityLog;
        function getActivityLog() {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "appraisalId": sessionStorage.getItem("appraisalId")
            }
            var assign = AppraisalService.getActivityLog(param);
            assign.then(function (success) {
                toastr.remove();
                $scope.activityLogDetails = success.data.appraisalLogs;
                angular.forEach($scope.activityLogDetails, function (item) {

                    if (item.timeElapsed == null || item.timeElapsed == '') {
                        item.timeElapsed = "";
                    }
                    if (item.message == null || item.message == '') {
                        item.message = "";
                    }
                    var formattedTime = -(new Date().getTimezoneOffset() * 60 * 1000) + new Date(item.createdDate).getTime();
                    item.createdDate = moment(formattedTime).format("DD MMM YYYY hh:mm A");
                });
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                $(".page-spinner-bar").addClass("hide");
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
            });
        }
    });
