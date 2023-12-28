angular.module('MetronicApp')
    .controller('InsuranceGlobalSearchController', function ($http, $rootScope, $scope, $window, $filter, $location, $translate, $translatePartialLoader, InsuranceAgentHomeService, $uibModal) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        $translatePartialLoader.addPart('InsuranceGlobalSearch');
        $translate.refresh();
        $scope.GlobalsearchText = sessionStorage.getItem("GlobalSearchtext");
        $scope.DisplayRecordForText = sessionStorage.getItem("GlobalSearchtext");
        $scope.SearchResult = {
            "appraisals": [],
            "documents": [],
            "policies": [],
            "policyHolders": [],
            "appraisalsCount": 0
        };
        $scope.attachments = [];
        $scope.isEditable = false;
        $scope.appraisalPath = '';
        $scope.SearchResult.documents = [];
        $scope.currentPage = 1;
        $scope.itemsPerPage = 20;
        $scope.serverAddress = '';
        $scope.TableSearch = '';
        var pageName = "SEARCH_RESULT";
        var activeTab = 'Appraisals';
        $scope.reverse = false;
        function init() {
            //var tab = sessionStorage.getItem("CurrentTab");
            var UserType = sessionStorage.getItem("UserType");
            if (UserType == 'INSURANCE_AGENT') {
                $scope.isClickable = true;
                $scope.role = 'INSURANCE AGENT';
                $scope.appraisalPath = '/Appraisal';
            }
            else if (UserType == 'COMPANY_USER') {
                $scope.isClickable = false;
                $scope.role = 'INSURANCE ACCOUNT MANAGER';
                $scope.appraisalPath = '/UnderwriterAppraisal';
            }
            else {
                $scope.isClickable = false;
                $scope.role = 'UNDERWRITER';
                $scope.appraisalPath = '/UnderwriterAppraisal';
            }
            var GetGlobaldata = $http.get('Config/Configuration.json');
            GetGlobaldata.then(function (success) {
                ConfigSettings = success.data.data;
                $scope.serverAddress = ConfigSettings.serverAddress;
            });
            $scope.CurrentDiv = angular.isDefined(sessionStorage.getItem("currentTab")) && sessionStorage.getItem("currentTab") != null && sessionStorage.getItem("currentTab") != "" ? sessionStorage.getItem("currentTab") : activeTab;
            sessionStorage.setItem("currentTab", $scope.CurrentDiv);
            getSearchResult();
        }
        init();

        $scope.ShowHideTab = function (tabname) {
            $scope.CurrentDiv = tabname;
            sessionStorage.setItem("currentTab", $scope.CurrentDiv);
        };

        function getSearchResult() {
            $(".page-spinner-bar").removeClass("hide");
            var param =
            {
                "searchString": sessionStorage.getItem("GlobalSearchtext"),
                "companyId": sessionStorage.getItem("CompanyId"),
                "tab": $scope.CurrentDiv,
                "orderBy": $scope.reverse ? 1 : 0,
                "page": $scope.currentPage,
                "sortBy": $scope.sortKey,
                "user_role": $scope.role,
                "userId":sessionStorage.getItem("UserId"),
            };
            var GlobalSearch = InsuranceAgentHomeService.GlobalSearch(param);
            GlobalSearch.then(function (success) {
                if (success.data.data) {
                    // if ($scope.CurrentDiv === 'Appraisals') {
                        var appraisals = success.data.data.appraisals;
                        if (appraisals != null && appraisals.length > 0) {
                            $scope.SearchResult.appraisalsCount = success.data.data.appraisalsCount;
                            var currentListLength = ($scope.currentPage - 1) * $scope.itemsPerPage;
                            if (currentListLength != appraisals.length) {
                                $scope.SearchResult.appraisals = new Array(currentListLength).fill(new Object());
                            }
                            angular.forEach(appraisals, function (item) {
                                item.pName = $filter('constructName')(item.policyholderDetails.primaryPolicyHolderFname, item.policyholderDetails.primaryPolicyHolderLname);
                                $scope.SearchResult.appraisals.push(item);
                            });
                        }
                    // }

                    $scope.SearchResult.policies = success.data.data.policies;
                    $scope.SearchResult.policyHolders = success.data.data.policyHolders;
                    $scope.attachments = success.data.data.attachments;
                    angular.forEach($scope.attachments, function (value, key) {
                        if (value.docs.filePath != null) {
                            var filename = value.docs.filePath.split('/');
                            var fileType = value.docs.filePath.split('.');
                            $scope.SearchResult.documents.push(
                                {
                                    'fileName': filename[filename.length - 1],
                                    'url': $scope.serverAddress + value.docs.filePath,
                                    'type': fileType[fileType.length - 1],
                                    'appraisalUpdatedDate': value.appraisalUpdatedDate,
                                    'policyNumber': value.policyNumber,
                                    'appraisalNumber': value.appraisalNumber,
                                    'id': value.docs.appraisalId
                                });
                        }
                    });

                    angular.forEach($scope.SearchResult.policyHolders, function (item) {
                        item.priFirstName = $filter('constructName')(item.priFirstName, item.priLastName);
                        item.secFirstName = $filter('constructName')(item.secFirstName, item.secLastName);
                    });

                    angular.forEach($scope.SearchResult.policies, function (item) {
                        if (!item.noOfAppraisals) {
                            item.noOfAppraisals = 0;
                        }
                    });
                    $(".page-spinner-bar").addClass("hide");
                }
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.warning(error.data.errorMessage, "Warning");
            });
        }

        $scope.Search = function () {
            $scope.DisplayRecordForText = $scope.GlobalsearchText;
            sessionStorage.setItem("GlobalSearchtext", $scope.GlobalsearchText)
            getSearchResult();
        }

        $scope.GotoDashboard = function () {
            sessionStorage.removeItem("currentTab");
            $location.url(sessionStorage.getItem('HomeScreen'));
        }

        //Open policy details page    
        $scope.openPolicyDetailsPage = openPolicyDetailsPage;
        function openPolicyDetailsPage(item) {
            sessionStorage.setItem("AgentPolicyId", item.policyId);
            sessionStorage.setItem("policyNumber", item.policyNumber);
            //add a refferer from which page it is redirected 
            sessionStorage.setItem("refferer", "SEARCH_RESULT");
            $location.path('/PolicyDetail');
        }

        $scope.openAppraisalDetails = openAppraisalDetails;
        function openAppraisalDetails(appraisal) {
            sessionStorage.setItem("appraisalId", appraisal.id);
            sessionStorage.setItem("AppraisalNo", appraisal.appraisalNumber);
            sessionStorage.setItem("isEditAppraisal", true);
            sessionStorage.setItem("EditAppraisal", true);
            sessionStorage.setItem("unReadLogs", appraisal.unreadLogs);
            sessionStorage.setItem("refferer", "SEARCH_RESULT");
            sessionStorage.setItem("policyNumber", appraisal.policyNumber);

            if (angular.isDefined(appraisal.policyholderDetails.policyEffectiveDate)) {
                var policyEffectiveDate = $filter('formatDate')(appraisal.policyholderDetails.policyEffectiveDate);
            }
            else
                var policyEffectiveDate = null;

            if (angular.isDefined(appraisal.policyholderDetails.policyRenewalDate)) {
                var policyRenewalDate = $filter('formatDate')(appraisal.policyholderDetails.policyRenewalDate);
            }
            else
                var policyRenewalDate = null;

            sessionStorage.setItem("primaryPolicyHolderFname", appraisal.policyholderDetails.primaryPolicyHolderFname);
            sessionStorage.setItem("primaryPolicyHolderLname", appraisal.policyholderDetails.primaryPolicyHolderLname);
            sessionStorage.setItem("primaryPolicyHolderCellphoneNo", appraisal.policyholderDetails.primaryPolicyHolderCellphoneNo);
            sessionStorage.setItem("primaryPolicyHolderEmailId", appraisal.policyholderDetails.primaryPolicyHolderEmailId);

            sessionStorage.setItem("policyEffectiveDate", policyEffectiveDate);
            sessionStorage.setItem("policyRenewalDate", policyRenewalDate);
            sessionStorage.setItem("status", appraisal.status.status);

            sessionStorage.setItem("secondaryPolicyHolderCellphoneNo", appraisal.policyholderDetails.secondaryPolicyHolderCellphoneNo);
            sessionStorage.setItem("secondaryPolicyHolderEmailId", appraisal.policyholderDetails.secondaryPolicyHolderEmailId);
            sessionStorage.setItem("secondaryPolicyHolderFname", appraisal.policyholderDetails.secondaryPolicyHolderFname);
            sessionStorage.setItem("secondaryPolicyHolderLname", appraisal.policyholderDetails.secondaryPolicyHolderLname);

            $location.path($scope.appraisalPath);
        }

        $scope.openAppraisalFromAttachments = openAppraisalFromAttachments;
        function openAppraisalFromAttachments(appraisal) {
            sessionStorage.setItem("appraisalId", appraisal.id);
            sessionStorage.setItem("AppraisalNo", appraisal.appraisalNumber);
            sessionStorage.setItem("isEditAppraisal", true);
            sessionStorage.setItem("EditAppraisal", true);
            sessionStorage.setItem("refferer", "SEARCH_RESULT");
            sessionStorage.setItem('notifications', true);
            sessionStorage.setItem("policyNumber", appraisal.policyNumber);
            $location.path($scope.appraisalPath);
        }

        $scope.GetDocxDetails = GetDocxDetails;
        function GetDocxDetails(item) {
            $scope.animationsEnabled = true;
            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/GlobalSearch/DocumentDetails.html",
                    controller: "DocumentDetailsController",
                    resolve:
                    {
                        objDocx: function () {
                            objDocx = item;
                            return objDocx;
                        }
                    }

                });
            out.result.then(function (value) {

            }, function (res) {

            });
            return {
                open: open
            };
        }

        $scope.sort = function (keyname) {
            $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
            $scope.sortKey = keyname;   //set the sortKey to the param passed           
            getSearchResult();
        }

        // Search appraisal reports
        $scope.searchPoliciesBykey = searchPoliciesBykey
        function searchPoliciesBykey(searchQuery) {
            $scope.TableSearch = searchQuery;
            $scope.currentPage = 1;
            getSearchResult();
        }

        //Pagination handler
        $scope.pageChanged = pageChanged;
        function pageChanged(pageNum) {
            $scope.currentPage = pageNum;
            getSearchResult();
        }

    });
