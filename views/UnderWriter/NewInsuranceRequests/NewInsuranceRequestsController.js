angular.module('MetronicApp')
    .directive('ngFileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.ngFileModel);
                var isMultiple = attrs.multiple;
                var modelSetter = model.assign;
                element.bind('change', function () {
                    var values = [];
                    angular.forEach(element[0].files, function (item) {
                        var value = {
                            // File Name
                            name: item.name,
                            //File Size
                            size: item.size,
                            //File URL to view
                            url: URL.createObjectURL(item),
                            // File Input Value
                            _file: item
                        };
                        values.push(value);
                    });
                    scope.$apply(function () {
                        if (isMultiple) {
                            modelSetter(scope, values);
                        } else {
                            modelSetter(scope, values[0]);
                        }
                    });
                });
            }
        };
    }])

    .directive('disablearrows', function () {
        function disableArrows(event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        }
        return {
            link: function (scope, element, attrs) {
                element.on('keydown', disableArrows);
            }
        };
    })

    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    if (value == '0.0') {
                        return value = null;
                    } else {
                        return parseFloat(value, 100);
                    }
                });
            }
        };
    })
    .controller('NewInsuranceRequestsController', function ($http, $rootScope, $scope, settings, $location, $translate, $translatePartialLoader, $window,
        $filter, UnderWriterDashboardService, AuthHeaderService, $uibModal) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        $translatePartialLoader.addPart('NewInsuranceRequests');
        $translate.refresh();
        $scope.UserType = sessionStorage.getItem("RoleList");
        $scope.UserName = sessionStorage.getItem("UserLastName") + ", " + sessionStorage.getItem("UserFirstName")
        $scope.isEditAppraisal = false;

        $scope.pageSize = 20;
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        var startPos = 0;
        var maxCount = 20;
        $scope.toShowingPage = 20;
        $scope.reverse = true;
        $scope.appraisals = [];
        $scope.search = '';
        $scope.init = init;
        function init() {
            getNewInsuranceRequests($scope.currentPage, maxCount);
        }
        init();

        $scope.getNewInsuranceRequests = getNewInsuranceRequests;
        function getNewInsuranceRequests(page, max) {
            $scope.IsEditOrder = false;
            var param = {
                "page": page,
                "maxCount": max,
                "searchKeyword": $scope.search.length > 0 ? $scope.search.split('/').join('-') : "",
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? 1 : 0,
            }
            var newRequests = [];
            $(".page-spinner-bar").removeClass("hide");
            $scope.appraisals = [];
            var newRequestsAppraisals = UnderWriterDashboardService.getAdditionalInsuranceRequests(param);
            newRequestsAppraisals.then(function (success) {
                newRequests = success.data.data.newInsuranceRequests;
                $scope.totalItems = success.data.data != null ? success.data.data.totalRequests : 0;
                if (newRequests && newRequests.length > 0 && newRequests != null) {
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = newRequests.length;
                    } else {
                        $scope.toShowingPage = newRequests.length + ($scope.pageSize * ($scope.currentPage - 1))
                    }
                }
                // var currentListLength = ($scope.currentPage - 1) * maxCount;
                // if (currentListLength != $scope.appraisals.length) {
                //     $scope.appraisals = new Array(currentListLength).fill(new Object());
                // }
                angular.forEach(newRequests, function (item) {
                    item.createdBy = $filter('constructName')(item.agentDetails.firstName, item.agentDetails.lastName);
                    // // item.appraisal.submittedToUnderwriter = item.submittedDate
                    // // item.appraisal.underwriterApprovedDate = item.approvalDate;
                    // if(item.appraisal.isUnderwriterReviewed == true){
                    // }
                    // else
                    // item.appraisal.newInsurancePremiumCost = (item.appraisal.sc_insuranceReplacementValue)?item.appraisal.sc_insuranceReplacementValue/1000*12:0.0;
                    if (item.status.status === 'CREATED')
                        item.status = 'Pending Approval'
                    else
                        item.status = $filter('titleCase')(item.status.status);
                    $scope.appraisals.push(item);
                });
                $(".page-spinner-bar").addClass("hide");

            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }


        // Pagination
        $scope.pageChangeHandler = pageChangeHandler;
        function pageChangeHandler(pageNum) {
            if (pageNum == 1) {
                startPos = 0;
            } else {
                startPos = maxCount * (pageNum - 1);
            }
            $scope.currentPage = pageNum;
            getNewInsuranceRequests(pageNum, maxCount);
        }

        // sort function
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            getNewInsuranceRequests(1, 20);
        }

        //get Search new requests.
        $scope.searchAppraisalsByKeyword = searchAppraisalsByKeyword;
        function searchAppraisalsByKeyword(search) {
            $scope.search = search.length > 0 ? search : '';
            getNewInsuranceRequests(1, 20);
        }

        // Open Appraisal Details
        $scope.openAppraisalDetails = openAppraisalDetails;
        function openAppraisalDetails(item) {
            $(".page-spinner-bar").removeClass("hide");
            if (item != null) {
                sessionStorage.setItem("appraisalId", item.id);
                sessionStorage.setItem("AppraisalNo", item.appraisalNumber);
                sessionStorage.setItem("policyNumber", item.policyNumber);
                sessionStorage.setItem("EditAppraisal", true);
                //sessionStorage.setItem("approvedList", true);
                sessionStorage.setItem("refferer", "NEW_INSURANCE_REQUESTS");
                $location.path('/UnderwriterAddlAppraisal');
            }
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.GoToHome = GoToHome;
        function GoToHome() {
            $location.path('/UnderWriter');
        }
    });
