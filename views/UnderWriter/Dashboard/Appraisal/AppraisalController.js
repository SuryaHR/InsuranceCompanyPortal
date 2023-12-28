angular.module('MetronicApp')
    .controller('AppraisalController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,
        AppraisalService, AuthHeaderService, InsuranceAgentHomeService) {

        $translatePartialLoader.addPart('Appraisal');
        $translate.refresh();
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        $scope.isEditAppraisal = sessionStorage.getItem("isEditAppraisal") == "true";
        $scope.EditAppraisal = "true";
        $scope.AppraisalNo = sessionStorage.getItem("AppraisalNo");
        $scope.tab = 'Appraisal';
        $scope.ErrorMessage = "";
        $scope.StateList = [];
        var UserType = sessionStorage.getItem('RoleList');
        $scope.showBell = false;

        var appraisalId = sessionStorage.getItem("appraisalId");
        function init() {
            {
                ShowItem: "All"
            };
            $scope.policyDetail = {};

            $scope.policyDetail.policyNumber = sessionStorage.getItem("policyNumber");

            getPolicyDetailsById(sessionStorage.getItem("policyNumber"));
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
            else if (refferer === "ALL_APPRAISALS") {
                $scope.allAppraisals = true;
            }
            else if (refferer === "APPRAISALS_NEED_UPDATE") {
                $scope.appraisalNeedUpdate = true;
            }
            else if (refferer === "APPRAISALS_EXPIRING") {
                $scope.appraisalExpiring = true;
            }
            else if(refferer === "REPORTS"){
                $scope.isReports = true;
            }

            if(angular.isDefined(appraisalId) && appraisalId != null && appraisalId != "")
            getUnReadLogs();
        }
        init();

        $scope.getUnReadLogs = getUnReadLogs;
        function getUnReadLogs() {
            $(".page-spinner-bar").removeClass("hide");
            var unReadLogs = AppraisalService.getUnReadLogs(appraisalId);
            unReadLogs.then(function (success) {
                if(success){
                $scope.showBell = success.data.data.unReadLogs > 0 ? true : false;
                $scope.unReadLogsCount = success.data.data.unReadLogs > 0 ? success.data.data.unReadLogs : 0;
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
            });
        }

        $scope.showNotes = showNotes;
        function showNotes() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.tab = 'Notes';
            $rootScope.$emit("CallNotesInitMethod", {});            
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

        $scope.GoToHome = GoToHome;
        function GoToHome() {
            $location.path('/InsuranceAgent');
        }

        $scope.goToHome = goToHome;
        function goToHome() {
            if (UserType === "INSURANCE ACCOUNT MANAGER")
                $location.path('/InsuranceAccountManager');
            else
                $location.path('/UnderWriter');
        }

        $scope.goToManagerAppraisalReports = goToManagerAppraisalReports;
        function goToManagerAppraisalReports(tab) {
            if (tab == 'NeedUpdate')
                sessionStorage.setItem("reportType", "NeedUpdate");
            $location.path('/InsAppraisalDueUpdateReports');
        }

        //GoToPolicyDetails
        $scope.GoToPolicyDetails = GoToPolicyDetails;
        function GoToPolicyDetails() {
            $location.path('/PolicyDetail');
        }

        $scope.goToSearchPage = goToSearchPage;
        function goToSearchPage() {
            $location.path('/InsuranceGlobalSearch');
        }

        //goToReportsPage
        $scope.goToReportsPage = goToReportsPage;
        function goToReportsPage() {
            $location.path('/UnderwriterReports');
        }

        $scope.GoToAppraisal = GoToAppraisal;
        function GoToAppraisal() {
            $scope.tab = 'Appraisal';
        }

        $scope.goToAllAppraisals = goToAllAppraisals;
        function goToAllAppraisals() {
            $location.path('/AllAppraisals');
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
               $scope.primaryFname = $scope.policyDetail.primaryPolicyHolderFname;
               $scope.primaryLname = $scope.policyDetail.primaryPolicyHolderLname;
               console.log($scope.policyDetail);
               $(".page-spinner-bar").addClass("hide");
           },function (error) {
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
                    var formattedTime = -(new Date().getTimezoneOffset()*60*1000) + new Date(item.createdDate).getTime();
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
