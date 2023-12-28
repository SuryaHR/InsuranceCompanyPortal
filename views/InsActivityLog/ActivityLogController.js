angular.module('MetronicApp')
    .controller('ActivityLogController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, AppraisalService,
        AuthHeaderService) {

        $scope.ShowHeader = true;
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        $translatePartialLoader.addPart('InsActivityLog');
        //$translatePartialLoader.addPart('InsuranceAgentHome');
        $translate.refresh();
        $scope.ErrorMessage = "";
        $scope.ComapnyList = [];
        $scope.CompanyDetails;

        $scope.SelectedType = {};
        $scope.OfficeDetails = {};
        $scope.OfficeList = [];
        $scope.FilteredOffice;
        $scope.StateList = [];
        $scope.currentPage = 1;
        //$scope.CompanyLogo = [];
        $scope.SelectedOffice = {};
        $scope.activityLogDetails = [];
        $scope.limit = 50;
        $scope.moreShown = false;
        function init() {
            $scope.isShowAlerts = true;
            $scope.isShowKpis = true;
            getActivityLog();
        }
        init();

        // Sort Appraisal List Columns
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed     
        }

        $scope.activityLogDetails = [];

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

