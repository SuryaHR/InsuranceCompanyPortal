angular.module('MetronicApp')
    .controller('GemlabLoginController', function ($http, $scope, $window, $location, $translate, $translatePartialLoader, InsuranceAgentHomeService,
        AuthHeaderService, $interval, $timeout, InsuranceCommonServices) {

        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        $translatePartialLoader.addPart('InsuranceAgentHome');
        $translate.refresh();
        $scope.ErrorMessage = "";
        $scope.ComapnyList = [];
        $scope.CompanyDetails;

        $scope.SelectedType = {};
        $scope.OfficeDetails = {};
        $scope.OfficeList = [];
        $scope.FilteredOffice;
        $scope.StateList = [];

        //$scope.CompanyLogo = [];
        $scope.SelectedOffice = {};
        $scope.ListCompany = true;
        $scope.AddCompany = false;
        $scope.ShowComanyDetails = true;
        $scope.showPersonalDetails = false;
        $scope.AddOffice = false;
        $scope.MemberContact = false;
        $scope.OfficeSummary = false;
        $scope.FlagForBreadcrumb = null;
        $scope.UserType = sessionStorage.getItem('RoleList');
        $scope.FileUploadSave = false;
        $scope.parameter = {};
        $scope.policy = {};
        $scope.policy.status = "All";

        $scope.KPIs = {};
        sessionStorage.setItem('GetPolicyAlerts', 'true');
        var userId = sessionStorage.getItem("UserId");
        var pageNumber = 0;

        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        var startPose = 0;
        var maxPose = 20;
        $scope.currentPage = 1;
        $scope.toShowingPage = 20;
        $scope.listId = "myList";
        $scope.policyList = [];
        $scope.searchPolicies = '';
        var sortByKeyname = '';
        $scope.reverse = true;
        $scope.currentProjectUrl = "";

        function init() {
           
            
        }
        init();
        $scope.OpenPopupWindow = function () {
            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $window.open("https://app.gemguide.com/api-login?client_key=" + ConfigSettings.gemGuideClientKey, "popup", "width=500,height=500,left=10,top=150");
            }, function (error) {
                console.log(error);
            });
        }

        //Pagination handler
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {
            if (pageNum == 1) {
                startPose = 0;
                $scope.policyList = [];
            } else {
                startPose = maxPose * (pageNum - 1);
            }
            $scope.currentPage = pageNum;
            GetPolicyList();
        }

        //on status change call API
        $scope.onStatusChange = onStatusChange;
        function onStatusChange() {
            GetPolicyList();
        }

        $scope.getKPIReports = getKPIReports;
        function getKPIReports() {

            var reports = InsuranceAgentHomeService.getKPIReport(userId);
            reports.then(function (success) {
                var kpi = success.data.KPIReport;
                var avgProcessingTime = kpi.avgAppraisalprocessingTime ? kpi.avgAppraisalprocessingTime : 0;
                $scope.KPIs = {
                    "KPIAppraisalsNeedingReview": kpi.appraisalsNeedingReview > 0 ? kpi.appraisalsNeedingReview : 0,
                    "KPIAppraisalCompleted": kpi.completedAppraisals > 0 ? kpi.completedAppraisals : 0,
                    "KPIAvgProcessingTime": avgProcessingTime,
                    "KPIConvRatePerWeek": kpi.convRatePerWeek != null ? kpi.convRatePerWeek : 0
                };

            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
            });
        }

        // Search appraisal reports
        $scope.searchPoliciesBykey = searchPoliciesBykey
        function searchPoliciesBykey(searchQuery) {
            $scope.searchPolicies = searchQuery.length > 0 ? searchQuery : '';
            $scope.currentPage = 1;
            GetPolicyList();
        }

        // get policies list
        $scope.GetPolicyList = GetPolicyList;
        function GetPolicyList() {
            $(".page-spinner-bar").removeClass("hide");
            var parameters = {
                "pageNumber": $scope.currentPage,
                "itemsPerPage": maxPose,
                "keyword": $scope.searchPolicies,
                "userId": userId,
                "status": $scope.policy.status,
                "orderBy": $scope.reverse ? 1 : 0,
                "sortBy": sortByKeyname
            }
            $scope.KPIsPolicies = 0;
            $scope.policyList  = [];
            var policiesList = InsuranceAgentHomeService.GetPolicyList(parameters);
            policiesList.then(function (success) {
                $scope.policyList  = success.data.PolicyList;
                $scope.totalItems = $scope.policyList .length > 0 ? $scope.policyList [0].totalPolicies : 0;
                if ($scope.policyList .length > 0 && $scope.policyList  != null) {
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = $scope.policyList.length;
                    } else {
                        $scope.toShowingPage = $scope.policyList.length + ($scope.pageSize * ($scope.currentPage - 1))
                    }
                }
                //$scope.policyList = resultList;
                // var currentListLength = ($scope.currentPage - 1) * maxPose;
                // if (currentListLength != $scope.policyList.length) {
                //     $scope.policyList = new Array(currentListLength).fill(new Object());
                // }
                // angular.forEach(resultList, function (item) {
                //     $scope.policyList.push(item);
                // });

                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
            });
        }

        $scope.openDetailsPage = openDetailsPage
        function openDetailsPage(item) {
            if (item.isPolicyAlert) {
                openPolicyDetailsPage(item);
            }
            else {
                sessionStorage.setItem("IsNoteNotification", item.isNote);
                openAppraisalDetailsPage(item);
            }

        }


        $scope.openPolicyDetailsPage = openPolicyDetailsPage;
        function openPolicyDetailsPage(item) {
            sessionStorage.setItem("policyId", item.policyId);
            sessionStorage.setItem("policyNumber", item.policyNumber);
            sessionStorage.setItem("primaryPolicyHolderFname", null);
            sessionStorage.setItem("refferer", "HOME");
            $location.path('/PolicyDetail');
        }

        $scope.openAppraisalDetailsPage = openAppraisalDetailsPage;
        function openAppraisalDetailsPage(item) {
            sessionStorage.setItem("appraisalId", item.appraisal.id);
            sessionStorage.setItem("AppraisalNo", item.appraisal.appraisalNumber);
            sessionStorage.setItem("policyId", item.policyId);
            sessionStorage.setItem("policyNumber", item.policyNumber);
            sessionStorage.setItem("primaryPolicyHolderFname", item.policyholderFname);
            sessionStorage.setItem("primaryPolicyHolderLname", item.policyholderLname);
            sessionStorage.setItem("refferer", "HOME");
            sessionStorage.setItem("EditAppraisal", "true");
            sessionStorage.setItem("notifications", true);
            $location.path('/Appraisal');
        }

        //get notifications details for close due date policies created by this agent
        $scope.getNotifications = getNotifications;
        function getNotifications() {
            //$scope.showViewBtn = true;
            var param = {
                "limit": 5,
                "ParticipantId": sessionStorage.getItem("UserId"),
                "Role": sessionStorage.getItem("UserType"),
                "GetPolicyAlert": sessionStorage.getItem("GetPolicyAlerts"),
                "Company": sessionStorage.getItem("CompanyId")
            }
            var getNotifications = InsuranceAgentHomeService.getNotifications(param);
            getNotifications.then(function (success) {
                $scope.NotificationsList = success.data.notifications;
                sessionStorage.setItem('GetPolicyAlerts', 'false')
                if ($scope.NotificationsList.length != 0 && $scope.NotificationsList[0].totalNotificationCount > 5) {
                    $scope.showViewBtn = true;
                } else {
                    $scope.showViewBtn = false;
                }
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
            });
        }

        $scope.getAllNotifications = getAllNotifications;
        function getAllNotifications() {
            $scope.showViewBtn = false;
            var param = {
                "limit": 0,
                "ParticipantId": sessionStorage.getItem("UserId"),
                "Role": sessionStorage.getItem("UserType"),
                "GetPolicyAlert": sessionStorage.getItem("GetPolicyAlerts"),
                "Company": sessionStorage.getItem("CompanyId")
            }
            $(".page-spinner-bar").removeClass("hide");
            var getNotifications = InsuranceAgentHomeService.getNotifications(param);
            getNotifications.then(function (success) {
                $scope.NotificationsList = success.data.notifications;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }


        $scope.GetStateList = GetStateList;
        function GetStateList() {
            var param =
            {
                "isTaxRate": false,
                "isTimeZone": false
            };
            var getStateList = InsuranceAgentHomeService.getStateList(param);
            getStateList.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        };

        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            sortByKeyname = keyname;
            startPose = 0;
            $scope.policyList = [];                       
            GetPolicyList();
        }

        $scope.DeletePolicy = DeletePolicy;
        function DeletePolicy(deleteParam) {
            bootbox.confirm({
                size: "",
                title: "Delete Policy",
                message: "Are you sure you want to delete this policy? All appraisals and information saved under this policy will be deleted.", closeButton: false,
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
                        if (angular.isDefined(deleteParam.policyId) && deleteParam.policyId !== null) {
                            $(".page-spinner-bar").removeClass("hide");
                            var param = {
                                "policyId": deleteParam.policyId,
                                "speedCheckVendor": sessionStorage.getItem("speedCheckVendor")

                            };
                            var DeleteItem = InsuranceAgentHomeService.DeletePolicy(param);
                            DeleteItem.then(function (success) {
                                toastr.remove();
                                toastr.success("All appraisals and information saved under the policy # " + deleteParam.policyNumber + " has been successfully deleted.", "Confirmation");
                                $scope.GetPolicyList();
                                $(".page-spinner-bar").addClass("hide");
                            }, function (error) {
                                toastr.remove();
                                toastr.error(error.data.errorMessage, "Error");
                                $(".page-spinner-bar").addClass("hide");
                            });

                        };
                    }
                }
            });
        }

        //Url path to change page
        $scope.AddNewPolicy = function () {
            $location.url('/AddPolicy');
        };
        $scope.InsuranceAgentHome = true;

        $scope.removeNotification = removeNotification;
        function removeNotification(notification) {          
            $(".page-spinner-bar").removeClass("hide");
            var removeNotification = InsuranceCommonServices.removeNotification(notification);
            removeNotification.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }

    });
