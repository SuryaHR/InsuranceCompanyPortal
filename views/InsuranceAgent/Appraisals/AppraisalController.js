angular.module('MetronicApp')
    .controller('AppraisalController', function ($rootScope, $state, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,$timeout, InsuranceAgentHomeService,
        AppraisalService, AuthHeaderService, InsuranceAgentHomeService) {

        $translatePartialLoader.addPart('Appraisal');
        $translate.refresh();
        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        //$scope.isEditAppraisal = sessionStorage.getItem("isEditAppraisal") == "false";

        $scope.EditAppraisal = sessionStorage.getItem("EditAppraisal") == "true";
        $scope.isNotification = sessionStorage.getItem("isNotification") == "true";
        $scope.AppraisalNo = sessionStorage.getItem("AppraisalNo");

        $scope.$on('eventEmitedAppraisalNo', function(event, data) {
            //$scope.mainData.logs = $scope.mainData.logs + '\nMainController - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
            $scope.AppraisalNo = data.appraisalNumber;
            $scope.EditAppraisal = data.editAppraisal

          });

        // $scope.primaryFname = sessionStorage.getItem('primaryPolicyHolderFname') ? sessionStorage.getItem('primaryPolicyHolderFname') : "";
        // $scope.primaryLname = sessionStorage.getItem('primaryPolicyHolderLname') ? sessionStorage.getItem('primaryPolicyHolderLname') : "";
        sessionStorage.setItem("NewAppraisal", false);
        $scope.tab = 'Appraisal';
        //set language
        $scope.ErrorMessage = "";
        $scope.StateList = [];
        //$scope.CompanyLogo = [];
        $scope.activityLogDetails = [];
        $scope.UserType = sessionStorage.getItem('RoleList');
        $scope.showBell = false;
        var appraisalId = sessionStorage.getItem("appraisalId");
        var pageName = "APPRAISAL_DETAILS";
        $scope.nextPage = "";
        
        function init() {
            $scope.policyDetail = {};
            $scope.policyDetail.policyNumber = sessionStorage.getItem("policyNumber");
            //Get page from which its redirecting
            $timeout(function(){
              getPolicyDetailsById(sessionStorage.getItem("policyNumber"));
            },100);
            var refferer = sessionStorage.getItem("refferer");
            if (refferer === "SEARCH_RESULT") {
                $scope.isNotification = true;
                $scope.searchResult = true;
            }
            else if (refferer === "HOME") {
                $scope.isNotification = true;
                // $scope.AppraisalNo=sessionStorage.getItem("AppraisalNo");
            }
            else if(refferer === "REPORTS"){
                $scope.isNotification = true;
                $scope.isReports = true;
            }else if(refferer === "ALLAPPRAISALS"){
                $scope.isNotification = true;
                $scope.isAllAppraisals = true;
            }
            if(angular.isDefined(appraisalId) && appraisalId != null && appraisalId != ""){
            $timeout(function(){
              getUnReadLogs();
            },100)
          }
        }
        init();

        $scope.getUnReadLogs = getUnReadLogs;
        function getUnReadLogs() {
            $(".page-spinner-bar").removeClass("hide");
            var unReadLogs = AppraisalService.getUnReadLogs(appraisalId);
            unReadLogs.then(function (success) {
                if (success)
                {
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
            var flag = $rootScope.ApprisalFormPristine;
            sessionStorage.setItem("nextPage","note");
            confirmBeforeChangindPage();
            if(!flag){
                $scope.tab = 'Notes';
                $rootScope.$emit("CallNotesInitMethod", {});
            }
            //$(".page-spinner-bar").removeClass("hide");
            // GetNotes();
            // $scope.tab = 'Notes';
            // $rootScope.$emit("CallNotesInitMethod", {});
        }

        $scope.showActivityLog = showActivityLog;
        function showActivityLog() {
            var flag = $rootScope.ApprisalFormPristine;
            sessionStorage.setItem("nextPage","activityLog")
            confirmBeforeChangindPage();
            if(!flag){
            $(".page-spinner-bar").removeClass("hide");
            // GetActivityLog();
            $scope.tab = 'ActivityLog';
            $scope.limit = 50;
            $scope.moreShown = false;
            $scope.getActivityLog();
            $scope.showBell = false;
            $(".page-spinner-bar").addClass("hide");
            }
        }

        $scope.getPolicyDetailsById = getPolicyDetailsById;
        function getPolicyDetailsById(id) {
          $(".page-spinner-bar").removeClass("hide");
            var param = {
                "id": id,
                "AgentId": sessionStorage.getItem("UserId"),
                "Role": sessionStorage.getItem("UserType")
            }
            var policyDetails = InsuranceAgentHomeService.getPolicyDetailsById(param);
            policyDetails.then(function (success) {
                $scope.policyDetail = success.data.PolicyHolderDetails;
                $scope.primaryFname = $scope.policyDetail.primaryPolicyHolderFname;
                $scope.primaryLname = $scope.policyDetail.primaryPolicyHolderLname;                
                $(".page-spinner-bar").addClass("hide");
            },function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.GoToHome = GoToHome;
        function GoToHome() {
            var flag = $rootScope.ApprisalFormPristine;
            sessionStorage.setItem("nextPage","home");
            confirmBeforeChangindPage();
            if(!flag){
            sessionStorage.removeItem("currentTab");
            $location.path('/InsuranceAgent');
            }
        }

        //GoToPolicyDetails
        $scope.GoToPolicyDetails = GoToPolicyDetails;
        function GoToPolicyDetails() {
            var flag = $rootScope.ApprisalFormPristine;
            sessionStorage.setItem("nextPage","policyDetails");
            confirmBeforeChangindPage();
            if(!flag)
            $location.path('/PolicyDetail');
            
        }

        $scope.GoToSearchPage = GoToSearchPage;
        function GoToSearchPage() {
            $location.path('/InsuranceGlobalSearch');
        }

        $scope.GoToReportPage = GoToReportPage;
        function GoToReportPage() {
            sessionStorage.setItem("previousPage", pageName);
            sessionStorage.setItem('AppraisalToReport', "yes");            
            $location.path('/InsuranceReports');
        }

        $scope.GoToAllAppraisals = GoToAllAppraisals;
        function GoToAllAppraisals() {
            sessionStorage.setItem("previousPage", pageName);
            $location.path('/InsuranceAllAppraisals');
        }

        $scope.GoToAppraisal = GoToAppraisal;
        function GoToAppraisal() {
            $scope.tab = 'Appraisal';
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
                    item.createdDate = moment(formattedTime).format("DD MMM YYYY hh:mm A")
                });
               // Intl.DateTimeFormat().resolvedOptions().

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
        $scope.confirmBeforeChangindPage = confirmBeforeChangindPage;
        function confirmBeforeChangindPage(){
            var flag = $rootScope.ApprisalFormPristine;
            if(flag){
            bootbox.confirm({
                size: "",
                title: "Need to save changes",
                message: "Changes made by you have not been saved. Would you like to save them?", closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Yes, save changes",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "No, I am okay",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        
                        $rootScope.UpdateApprisal();
                        
                    }
                    $rootScope.ApprisalFormPristine = false;
                    if(sessionStorage.getItem("nextPage") == "policyDetails"){
                        $scope.$apply(function () {
                            $location.path('/PolicyDetail');
                        });
                        
                    }
                        else if(sessionStorage.getItem("nextPage") == "note"){
                            //GetNotes();
                            $scope.tab = 'Notes';
                            $rootScope.$emit("CallNotesInitMethod", {});
                        }
                        else if(sessionStorage.getItem("nextPage") == "activityLog"){
                            $scope.tab = 'ActivityLog';
                            $scope.limit = 50;
                            $scope.moreShown = false;
                            getActivityLog();
                            $scope.showBell = false;
                        }
                        else if(sessionStorage.getItem("nextPage") == "home"){
                            sessionStorage.removeItem("currentTab");
                            $scope.$apply(function () {
                                $location.path('/InsuranceAgent');
                            });
                            
                        }
                }
            })
        }
        }

    });
