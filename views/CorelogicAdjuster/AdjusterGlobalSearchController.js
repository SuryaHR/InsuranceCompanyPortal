angular.module('MetronicApp').controller('AdjusterGlobalSearchController', function ($rootScope, AdjusterDashboardService, $scope, $window, $filter, $location, $translate, $translatePartialLoader, $uibModal) {
   //$translatePartialLoader.addPart('AdjusterGlobalSearch');
    $translate.refresh();


    $scope.GlobalsearchText = sessionStorage.getItem("GlobalSearchtext");
    $scope.DisplayRecordForText = sessionStorage.getItem("GlobalSearchtext");
    $scope.itemPageSize = $rootScope.settings.itemPagesize;
    $scope.SearchResult = {
        "Document": [],
        "Claim": [],
        "Policy": [],
        "User": [],
        "Invoices": [],
        "Vendors": []
    };

    var pageName = "SEARCH_RESULT";
    var activeTab = 'Claims';

    function init() {
        $scope.UserType = sessionStorage.getItem("UserType");
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
            "companyId": sessionStorage.getItem("CompanyId")
        };

        var GlobalSearch = AdjusterDashboardService.GlobalSearch(param);
        GlobalSearch.then(function (success) {
            $scope.SearchResult.Document = success.data.data.documents;
            $scope.SearchResult.Claim = success.data.data.claims;
            $scope.SearchResult.Policy = success.data.data.policies;
            $scope.SearchResult.User = success.data.data.persons;
            $scope.SearchResult.Invoices = success.data.data.invoices;
            $scope.SearchResult.Vendors = success.data.data.vendors;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.Search = function () {
        $scope.DisplayRecordForText = $scope.GlobalsearchText;
        sessionStorage.setItem("GlobalSearchtext", $scope.GlobalsearchText)
        getSearchResult();
    }

    //Sorting  
    $scope.sortClaim = function (keyname) {
        $scope.sortKeyClaim = keyname;   //set the sortKey to the param passed
        $scope.Claimreverse = !$scope.Claimreverse; //if true make it false and vice versa
    }

    $scope.sortPolicy = function (keyname) {
        $scope.sortKeyPolicy = keyname;   //set the sortKey to the param passed
        $scope.Policyreverse = !$scope.Policyreverse; //if true make it false and vice versa
    }

    $scope.sortDocument = function (keyname) {
        $scope.sortKeyDocx = keyname;   //set the sortKey to the param passed
        $scope.Docxreverse = !$scope.Docxreverse; //if true make it false and vice versa
    }

    $scope.sortInvoice = function (keyname) {
        $scope.sortKeyInvoice = keyname;   //set the sortKey to the param passed
        $scope.Docxreverse = !$scope.Docxreverse; //if true make it false and vice versa
    }

    $scope.GotoDashboard = function () {
        sessionStorage.removeItem("currentTab");
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails(claim,tab) {
        var role = sessionStorage.getItem("RoleList");
        sessionStorage.setItem("refferer", pageName);
        //For adjuster
        if (role === 'ADJUSTER') {
            sessionStorage.setItem("ClaimId", claim.id);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            sessionStorage.setItem("claimDetailsCurrentTab",tab);
            if(sessionStorage.getItem("isCoreLogic")=="true"){
                $location.url('\CorelogicAdjusterPropertyClaimDetails', claim.policyNumber);

            }else {
                $location.url('\AdjusterPropertyClaimDetails', claim.policyNumber);
            }
        }
        //For Third party vendor
        else if (role === 'VENDOR CONTACT PERSON' || role === "VENDOR") {
            sessionStorage.setItem("ThirdPartyClaimId", claim.claimId);
            sessionStorage.setItem("ThirdPartyClaimNo", claim.claimNumber);
            $location.url('\ThirdPartyClaimDetails');
        }
        //For policyholder
        else if (role === 'INSURED') {
            sessionStorage.setItem("PolicyHolderClaimId", claim.claimId);
            sessionStorage.setItem("PolicyHolderClaimNo", claim.claimNumber);
            $location.url('\PolicyHolderClaimDetails');
        }
        //For vendor associate
        else if (role === 'CLAIM ASSOCIATE') {
            sessionStorage.setItem("VendorAssociateClaimId", claim.claimId);
            sessionStorage.setItem("VendorAssociateClaimNo", claim.claimNumber);
            $location.url('\VendorAssociateClaimDetails');
        }
        //For Claim Supervisor
        else if (role === 'SUPERVISOR') {
            sessionStorage.setItem("SupervisorClaimId", claim.claimId);
            sessionStorage.setItem("SupervisorClaimNo", claim.claimNumber);
            sessionStorage.setItem("claimDetailsCurrentTab",tab);
            $location.url('\SupervisorClaimDetails');
        }
        else if (role === "CLAIM MANAGER" || role === "CLAIM CENTER ADMIN" || role === "AGENT") {
            sessionStorage.setItem("ManagerScreenClaimId", claim.claimId);
            sessionStorage.setItem("ManagerScreenClaimNo", claim.claimNumber);
            sessionStorage.setItem("ManagerScreenpolicyNo", claim.claimNumber);

            $location.url('\ClaimCenter-ClaimDetails');
        }
    }

    $scope.GoToPolicyDetails = GoToPolicyDetails
    function GoToPolicyDetails(item) {
        $location.url('PolicyDetails');
    }

    $scope.GetDocxDetails = GetDocxDetails
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

    $scope.GotoPeopleDetails = GotoPeopleDetails;
    function GotoPeopleDetails(item) {
        if (item != null && angular.isDefined(item)) {
            sessionStorage.setItem("PeopleDetails", JSON.stringify(item));
            $location.url('\PeopleDetails');
        }
    }
    $scope.GotoVendorInfo = GotoVendorInfo;
    function GotoVendorInfo(item) {
        sessionStorage.setItem("VendorId", item.vendorId)
        $location.url('VendorInfo');
    }
    $scope.GoToInvoiceDetails = GoToInvoiceDetails;
    function GoToInvoiceDetails(invoice) {
        if (invoice.invoiceDetails.invoiceNumber !== null && angular.isDefined(invoice.invoiceDetails.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": invoice.invoiceDetails.invoiceNumber,
                "ClaimNo": invoice.claimNumber,
                "InvoicesToBePaid": "0",// $scope.TotalInvoicesToBePaid,
                "PageName": "AdjusterGlobalSearch"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }
    }
});