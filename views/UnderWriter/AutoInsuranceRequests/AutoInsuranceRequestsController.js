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
    .controller('AutoInsuranceRequestsController', function ($http, $rootScope, $scope, settings, $location, $translate, $translatePartialLoader, $window,
        $filter, UnderWriterDashboardService, AuthHeaderService, $uibModal) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        $translatePartialLoader.addPart('AutoInsuranceRequests');
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
        $scope.autoAppraisals = [];
        $scope.search = '';
        $scope.init = init;
        function init() {
            getAutoInsuranceRequests($scope.currentPage, maxCount);
        }
        init();

        $scope.getAutoInsuranceRequests = getAutoInsuranceRequests;
        function getAutoInsuranceRequests(page, max) {
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
            $scope.autoAppraisals = [];
            var newRequestsAppraisals = UnderWriterDashboardService.getAutoInsuranceRequests(param);
            newRequestsAppraisals.then(function (success) {
                newRequests = success.data && success.data.data ? success.data.data :0;
                $scope.totalItems = success.data && success.data.data ? success.data.data.length : 0;
                if (newRequests.length > 0 && newRequests != null) {
                    if ($scope.currentPage == 1) {
                        $scope.toShowingPage = newRequests.length;
                    } else {
                        $scope.toShowingPage = newRequests.length + ($scope.pageSize * ($scope.currentPage - 1))
                    }
                }
                // var currentListLength = ($scope.currentPage - 1) * maxCount;
                // if (currentListLength != $scope.autoAppraisals.length) {
                //     $scope.autoAppraisals = new Array(currentListLength).fill(new Object());
                // }
                angular.forEach(newRequests, function (item) {
                    item.createdBy = $filter('constructName')(item.adjusterBaseDTO.firstName, item.adjusterBaseDTO.lastName);
                    item.status = $filter('titleCase')(item.status);
                    $scope.autoAppraisals.push(item);
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
            getAutoInsuranceRequests(pageNum, maxCount);
        }

        // sort function
        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            getAutoInsuranceRequests(1, 20);
        }

        //get Search new requests.
        $scope.searchAppraisalsByKeyword = searchAppraisalsByKeyword;
        function searchAppraisalsByKeyword(search) {
            $scope.search = search.length > 0 ? search : '';
            getAutoInsuranceRequests(1, 20);
        }

        // Open Appraisal Details
        $scope.openAutoAppraisalDetails = openAutoAppraisalDetails;
        function openAutoAppraisalDetails(item) {
            console.log('data',item)
            $(".page-spinner-bar").removeClass("hide");
            if (item != null) {
                sessionStorage.setItem("vinId", item.id);
                sessionStorage.setItem("vinNumber", item.vin);
                sessionStorage.setItem("EditAppraisal", true);
                sessionStorage.setItem("refferer", "AUTO_INSURANCE_REQUESTS");
                $location.path('/UnderwriterAutoInsuranceRequestDetails');
            }
            $(".page-spinner-bar").addClass("hide");
        }

        $scope.GoToHome = GoToHome;
        function GoToHome() {
            $location.path('/UnderWriter');
        }
    });
