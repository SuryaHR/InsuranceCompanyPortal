angular.module('MetronicApp')

    .controller('DashboardController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,
        AuthHeaderService, UnderWriterDashboardService, $interval) {

        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        $translatePartialLoader.addPart('Dashboard');
        //$translatePartialLoader.addPart('InsuranceAgentHome');
        $translate.refresh();
        $scope.isViewPage = true;
        $scope.ErrorMessage = "";
        $scope.FlagForBreadcrumb = null;
        $scope.UserType = sessionStorage.getItem('RoleList');
        $scope.FileUploadSave = false;
        $scope.parameter = {};
        $scope.policy = {};
        $scope.appraisalList = [];
        $scope.searchKeyword = '';

        // Pagination
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        var startPose = 0;
        var maxPose = 20;
        $scope.toShowingPage = 20;

        function init() {
            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;
            $scope.pageNumber = 0;

            {
                ShowItem: "All"
            };

            //commented getAlertList()
            //getAlertList();
            //Enabled getAllAlerts() default
            getAllAlerts();
            getAppraisalList();

            // $interval(function () {
            //     if ($rootScope.IsLoginedUser === true) {
            //         getAlertList();
            //         getAppraisalList();
            //     }
            // }, 60000);
        }
        init();

        $scope.getAlertList = getAlertList;
        function getAlertList() {
            //$scope.showViewBtn = true;
            var param = {
                "limit": 5,
                "ParticipantId": sessionStorage.getItem("UserId"),
                "GetPolicyAlert": "false",
                "Role": sessionStorage.getItem("UserType"),
                "Company": sessionStorage.getItem("CompanyId")
            }
            $(".page-spinner-bar").removeClass("hide");
            var getNotifications = UnderWriterDashboardService.getAlerts(param);
            getNotifications.then(function (success) {
                $scope.AlertList = success.data.notifications;
                $(".page-spinner-bar").addClass("hide");
                if($scope.AlertList!=null && angular.isDefined($scope.AlertList[0]) && $scope.AlertList[0].totalNotificationCount>5){
                 $scope.showViewBtn = true;
                }else {
                 $scope.showViewBtn = false;
                }
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }


        $scope.getAllAlerts = getAllAlerts;
        function getAllAlerts() {
            $scope.showViewBtn = false;
            var param = {
                "limit": 0,
                "ParticipantId": sessionStorage.getItem("UserId"),
                "GetPolicyAlert": "false",
                "Role": sessionStorage.getItem("UserType"),
                "Company": sessionStorage.getItem("CompanyId")
            }
            $(".page-spinner-bar").addClass("hide");
            var getNotifications = UnderWriterDashboardService.getAlerts(param);
            getNotifications.then(function (success) {
                $scope.AlertList = success.data.notifications;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                };
                $(".page-spinner-bar").addClass("hide");
            });
        }

        // Open AppraisalDetailsPage
        $scope.openAppraisalDetailsPage = openAppraisalDetailsPage;
        function openAppraisalDetailsPage(item) {
            $(".page-spinner-bar").removeClass("hide");
            var paramData = item.paramData !=null && angular.isDefined(item.paramData) ? JSON.parse(item.paramData):null;
            if (item != null) {
                if(item.appraisal){
                sessionStorage.setItem("appraisalId", item.appraisal.id);
                sessionStorage.setItem("AppraisalNo", item.appraisal.appraisalNumber);
                sessionStorage.setItem("policyNumber", item.appraisal.policyNumber);
                }
                else{
                    sessionStorage.setItem("appraisalId", item.appraisalId);
                sessionStorage.setItem("AppraisalNo", item.appraisalNumber);
                sessionStorage.setItem("policyNumber", item.policyNumber);
                }
                if(paramData && paramData.isAdditionalRequest){                   
                    sessionStorage.setItem("EditAppraisal",true);
                    sessionStorage.setItem("refferer", "NEW_INSURANCE_REQUESTS");
                    $location.path('/UnderwriterAddlAppraisal');
                }else{                  
                    $location.path('/UnderwriterAppraisal');
               }  
            }
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.openDetailsPage = openDetailsPage
        function openDetailsPage(item) {            
            sessionStorage.setItem("IsNoteNotification", item.isNote);
            openAppraisalDetailsPage(item);  
        }

        //appraisal List
        $scope.getAppraisalList = getAppraisalList;
        function getAppraisalList() {
            var reqData = {
                "role": "UNDERWRITER",
                "page": $scope.currentPage,
                "maxCount": maxPose,
                "keyword": $scope.searchKeyword.length > 0 ? $scope.searchKeyword.split('/').join('-') : "",
                "sortBy": $scope.sortKey ? $scope.sortKey :"",
                "orderBy": $scope.reverse ? 0 : 1,
            };
            $(".page-spinner-bar").removeClass("hide");
            $scope.KPIsAppraisals = 0;
            var underwriterReviewAppraisal = UnderWriterDashboardService.getAppraisalList(reqData);
            underwriterReviewAppraisal.then(function (success) {
                $scope.appraisalList = success.data.appraisalList;
                $scope.totalItems = ($scope.appraisalList && $scope.appraisalList[0] != null )? $scope.appraisalList[0].totalCount : 0;
                if($scope.appraisalList){
                if($scope.currentPage==1){
                    $scope.toShowingPage = $scope.appraisalList.length;
                }else{
                      $scope.toShowingPage =$scope.appraisalList.length + ($scope.pageSize * ($scope.currentPage-1))
                }
                // var currentListLength= ($scope.currentPage-1) * maxPose;
                // if(currentListLength!=$scope.appraisalList.length){
                //     $scope.appraisalList = new Array(currentListLength).fill(new Object());
                // }
                // angular.forEach(appraisalList, function (item) {
                //     item.policyholderName = $filter('constructName')(item.policyholderDetails.primaryPolicyHolderFname, item.policyholderDetails.primaryPolicyHolderLname);
                //     $scope.appraisalList.push(item);
                // });
            }
            else{
                $scope.appraisalList = [];
            }

                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
           
                $scope.appraisalList = [];
           
                startPose = 0;
            
            $scope.currentPage = 1;
            getAppraisalList();
        }

        // Pagination
        $scope.pageChangeHandler = pageChangeHandler;
        function pageChangeHandler(pageNum) {
            if (pageNum == 1) {
                $scope.appraisalList = [];
            } else {
                startPose = maxPose * (pageNum - 1);
            }
            
            $scope.currentPage = pageNum;
            getAppraisalList();
        }

        $scope.searchAppraisalsBykey = searchAppraisalsBykey;
        function searchAppraisalsBykey(searchQuery)
        {
            $scope.searchKeyword = searchQuery.length > 0 ? searchQuery : '';
            $scope.currentPage = 1;
            getAppraisalList();
        }

    });
