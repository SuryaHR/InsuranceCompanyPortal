angular.module('MetronicApp').controller('SuperVisorDashboardController', function ($rootScope, $filter, $scope, settings, $http, $timeout,
    $uibModal, $location, $translate, $translatePartialLoader, SupervisorDashboardService, AuthHeaderService, AssignClaimForAdjusterService) {
    //set language
    $translatePartialLoader.addPart('SupervisorDashboard');
    $translate.refresh();
    $scope.pagesize = 20;
    //Variables
    $scope.AlertList = [];
    // $scope.EventList = [];
    $scope.NewClaims = [];
    $scope.CurrentClaimTab = 'OpenClaims'// Used to show current active tab
    $scope.CurrentEventTab = 'Alert';
    $scope.CurrentKPITab = 'Month'
    $scope.limit = 50;
    $scope.moreShown = false;
    $scope.hideAllCompanyInvoices = true;
    $scope.hideAllImmediateClaims = true;
    $scope.hideRegularClaims = false;
    $scope.hideRegularInvoices = false;


    function init() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.sortKey = "";
        $scope.reverse = true;
        $scope.totalUnassignedClaims = 0;
        $scope.unAssigned = {
            "currentPage": 1,
            "lastRecord": 10,
            "searchKeyword": ''
        }

        $scope.totalClaimsNeedApproval = 0;
        $scope.ClaimInWork = [];
        $scope.claimsNeedApproval = {
            "currentPage": 1,
            "lastRecord": 10,
            "searchKeyword ": ''
        }
        $scope.WorksortKey = '';
        $scope.Workreverse = true;

        $scope.vendorInvoiceSortKey = '';
        $scope.vendorInvoiceReverse = true;
        $scope.totalInvoices = 0;
        $scope.hideAllCompanyInvoices = true;
        $scope.hideAllImmediateClaims = true;
        $scope.invoicesNeedApproval = {
            "currentPage": 1,
            "lastRecord": 10,
            "searchKeyword ": ''
        }
        //getClaimsUnderReview();
        //getClaimList();       
        supervisorApproval();
        getImmediateAttentionClaims()
        getPendingVendorInvoices();
        getClaimSupervisorScoreCard("Month");
        populateDateButtons();
    }
    init();

    $scope.populateDateButtons = populateDateButtons;
     function populateDateButtons() {
         var now = new Date();
         var currentQuarter = moment().quarter();
         var year = now.getFullYear();
         var splitYear = year.toString().substr(2, 2);
        
         var today = moment(now).format('dddd');
         $scope.yearValues =
         {
             "thisMonth": moment().format('MMM'),
             "thisYear": now.getFullYear(),
             "lastYear": now.getFullYear() - 1,
             "thisQuaterFirstMonth": moment().quarter(currentQuarter).startOf('quarter').format('MMM'),
             "thisQuaterLastMonth": moment().quarter(currentQuarter).endOf('quarter').format('MMM'),
             "thisSplitYear": splitYear,
             "today": today
         }

     }

    $scope.getImmediateAttentionClaims = getImmediateAttentionClaims;
    function getImmediateAttentionClaims() {
        var immediateClaimsPromise = SupervisorDashboardService.getImmediateClaims(sessionStorage.getItem("UserId"));
        immediateClaimsPromise.then(function (success) {
            $scope.immediateClaims = success.data.data.claims;
            $scope.immediateClaimsCount = success.data.data.totalClaims;
        });

    }

    $scope.getPendingVendorInvoices = getPendingVendorInvoices;
    function getPendingVendorInvoices(){
        sessionStorage.getItem("RoleList")
        var param = {
            "userId":sessionStorage.getItem("RoleList")=="ADJUSTER"?sessionStorage.getItem("UserId"):null,
            "supervisorId":sessionStorage.getItem("RoleList")=="CLAIM SUPERVISOR"?sessionStorage.getItem("UserId"):null,

        }
        var pendingVendorInvoices = SupervisorDashboardService.getPendingVendorInvoices(param);
        pendingVendorInvoices.then(function (success) {
            invoicesExcludingPolicyHolder= success.data.data;
            invoicesExcludingPolicyHolder = invoicesExcludingPolicyHolder.filter(inv=> inv.invoiceType!=="PolicyHolder");
            $scope.pendingVendorInvoices = invoicesExcludingPolicyHolder;
            $scope.pendingVendorInvoicesCount = invoicesExcludingPolicyHolder? invoicesExcludingPolicyHolder.length:"";
        });
    }
    $scope.goToRegularClaims = goToRegularClaims
    function goToRegularClaims() {
        $scope.hideAllImmediateClaims = true;
        $scope.hideRegularClaims = false;

    }
    $scope.goToAllUrgentClaims = goToAllUrgentClaims;
    function goToAllUrgentClaims() {
        $scope.hideAllImmediateClaims = false;
        $scope.hideRegularClaims = true;
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "userId": sessionStorage.getItem("UserId"),
            "pagination":{
                "pageNumber":null,
                "limit":null,
                "sortBy":"createDate",
                "orderBy":"desc"
            },
            "searchKeyword":""            
        }
        //var immediateClaimsPromise = SupervisorDashboardService.getAllImmediateClaims(sessionStorage.getItem("UserId"));
        var immediateClaimsPromise = SupervisorDashboardService.getAllImmediateClaims(param);
        immediateClaimsPromise.then(function (success) {
            $scope.allImmediateClaims = success.data.data.claims;
            $scope.allImmediateClaimsCount = success.data.data.totalClaims;
            $(".page-spinner-bar").addClass("hide");
        });

    }
    $scope.goToAllCompanyInvoices = goToAllCompanyInvoices;
    function goToAllCompanyInvoices(){
        $scope.hideAllCompanyInvoices = false;
        $scope.hideRegularInvoices = true;
        $scope.hideAllImmediateClaims = true;
        $scope.hideRegularClaims = true;
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "userId":sessionStorage.getItem("RoleList")=="ADJUSTER"?sessionStorage.getItem("UserId"):null,
            "supervisorId":sessionStorage.getItem("RoleList")=="CLAIM SUPERVISOR"?sessionStorage.getItem("UserId"):null,

        }
        var immediateInvoicePromise = SupervisorDashboardService.getPendingVendorInvoices(param);
        immediateInvoicePromise.then(function (success) {
            var invoicesExcludingPolicyHolder= success.data.data;
            invoicesExcludingPolicyHolder = invoicesExcludingPolicyHolder.filter(inv=> inv.invoiceType!=="PolicyHolder");
            $scope.pendingVendorInvoices = invoicesExcludingPolicyHolder;
            $scope.pendingVendorInvoicesCount = invoicesExcludingPolicyHolder? invoicesExcludingPolicyHolder.length:"";
            $(".page-spinner-bar").addClass("hide");
        });
    }

    //Service for get unasigned claim list for supervisor
    $scope.getClaimList = getClaimList;
    function getClaimList() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            // "supervisorId": sessionStorage.getItem("UserId"),
            "page": $scope.unAssigned.currentPage,
            "sortBy": $scope.sortKey,
            "orderBy": $scope.reverse ? 1 : 0,
            "searchKeyword": $scope.unAssigned.searchKeyword,
            "tab": "UNASSIGNED_CLAIMS",
            "limit": $scope.pagesize
        }
        var UnassignClaims = SupervisorDashboardService.GetClaimList(param);
        UnassignClaims.then(function (success) {
            $scope.unassignedClaims = [];
            var claims = success.data.data != null
                && success.data.data.claims != null ? success.data.data.claims : null;
            if (claims != null && claims.length > 0) {
                if ($scope.unAssigned.currentPage == 1)
                    $scope.unAssigned.lastRecord = claims.length;
                else {
                    // var currentListLength = ($scope.unAssigned.currentPage - 1) * $scope.pagesize;
                    // if (currentListLength != $scope.unassignedClaims)
                    //     $scope.unassignedClaims = new Array(currentListLength).fill(new Object());
                    $scope.unAssigned.lastRecord = claims.length + ($scope.pagesize * ($scope.unAssigned.currentPage - 1))
                }
                angular.forEach(claims, function (item) {
                    $scope.unassignedClaims.push(item);
                });
            }
            $scope.totalUnassignedClaims = success.data.data && success.data.data.totalClaims != null ? success.data.data.totalClaims : 0;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    }

    //Service for claim needing supervisor approval
    $scope.supervisorApproval = supervisorApproval;
    function supervisorApproval() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            // "supervisorId": sessionStorage.getItem("UserId"),
            "page": $scope.claimsNeedApproval.currentPage,
            "sortBy": $scope.WorksortKey,
            "orderBy": $scope.Workreverse ? 1 : 0,
            "searchKeyword": $scope.claimsNeedApproval.searchKeyword,
            "tab": "CLAIMS_NEED_APPROVAL",
            "limit": $scope.pagesize
        };
        var supevisorApp = SupervisorDashboardService.supervisorApprovals(param);
        supevisorApp.then(function (success) {
            $scope.ClaimInWork = [];
            var claims = success.data.data != null
                && success.data.data.claims != null ? success.data.data.claims : null;
            if (claims != null && claims.length > 0) {
                if ($scope.claimsNeedApproval.currentPage == 1)
                    $scope.claimsNeedApproval.lastRecord = claims.length;
                else {
                    // var currentListLength = ($scope.claimsNeedApproval.currentPage - 1) * $scope.pagesize;
                    // if (currentListLength != $scope.ClaimInWork)
                    //     $scope.ClaimInWork = new Array(currentListLength).fill(new Object());
                    $scope.claimsNeedApproval.lastRecord = claims.length + ($scope.pagesize * ($scope.claimsNeedApproval.currentPage - 1))
                }
                angular.forEach(claims, function (item) {
                    $scope.ClaimInWork.push(item);
                });
            }
            $scope.totalClaimsNeedApproval = success.data.data && success.data.data.totalClaims != null ? success.data.data.totalClaims : 0;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.getClaimsUnderReview = getClaimsUnderReview;
    function getClaimsUnderReview() {
        var param = {
            "supervisorId": sessionStorage.getItem("UserId"),
            "claimStatus": "UNDER REVIEW" //hard-coded for time being remove after getting API
        }
        var claimsInWork = SupervisorDashboardService.getClaimsInProgress(param);
        claimsInWork.then(function (success) {

            $scope.ClaimsInWork = success.data.data;
        }, function (error) {
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");
        });

    }
    $scope.InvoiceDetails = function InvoiceDetails(item) {
        sessionStorage.setItem("SupervisorClaimNo", item.claimNumber);
        sessionStorage.setItem("SuperVisorInvoiceNo", item.invoiceNumber);
        sessionStorage.setItem("SuperVisorInvoicesToBePaid", 0);
        //sessionStorage.setItem("SupervisorClaimNo", "CVB654765");
        //sessionStorage.setItem("SuperVisorInvoiceNo", "8BAA9D4E96F7");
        //    sessionStorage.setItem("SuperVisorInvoicesToBePaid", 0);
        $location.url('SupervisorInvoiceDetails');
    }

    $scope.Globalsearch = function Globalsearch() {
        sessionStorage.setItem("GlobalSearchtext", $scope.GlobalsearchText);
        $location.url('SupervisorGlobalSearch');
    }

    //Goto Alert Details
    $scope.GotoAlertDetails = GotoAlertDetails;
    function GotoAlertDetails(alert) {
        if (alert.notificationParams.claimId != null && alert.notificationParams.claimNumber != null) {
            $rootScope.$broadcast('readNotification', { "id": alert.id });
            sessionStorage.setItem("ClaimNo", alert.notificationParams.claimNumber);
            sessionStorage.setItem("ClaimId", alert.notificationParams.claimId);
            if (alert.type.type === "ALERT") {

                sessionStorage.setItem("ShowNoteActive", true);
                sessionStorage.setItem("ShowEventActive", false);
            }
            else if (alert.type.type === "EVENT") {
                sessionStorage.setItem("ShowEventActive", true);
                sessionStorage.setItem("ShowNoteActive", false);
            }
            else {
                sessionStorage.setItem("ShowEventActive", false);
                sessionStorage.setItem("ShowNoteActive", true);
            }
            //URL for Note
            if (alert.notificationParams && alert.notificationParams.isClaimNote) {
                sessionStorage.setItem("AllNoteClaimNumber", alert.notificationParams.claimNumber),
                    sessionStorage.setItem("AllNoteClaimId", alert.notificationParams.claimId),
                    sessionStorage.setItem("messageGrpId", alert.notificationParams.messageGrpId);

                    $location.url('/AllNotes');
            }
            else if (alert.notificationParams && alert.notificationParams.itemId) {
                if (alert.notificationParams.isItemNote)
                    sessionStorage.setItem("ForwardTab", "notes");
                sessionStorage.setItem("SupervisorPostLostItemId", alert.notificationParams.itemId),
                    $location.url('/SupervisorLineItemDetails');
            }
            //URL for Claim details
            else {
                sessionStorage.setItem("BackPage", "Dashboard");
                $location.url('SupervisorClaimDetails');
            }
        }
    };

    //got to Event Details
    $scope.GetEventDetails = GetEventDetails;
    function GetEventDetails(claim) {
        if (claim.id != null && claim.claimNumber != null) {
            sessionStorage.setItem("ClaimId", claim.id);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            sessionStorage.setItem("ShowEventActive", true);
            sessionStorage.setItem("ShowNoteActive", false);
            sessionStorage.setItem("BackPage", "Dashboard");
            $location.url('SupervisorClaimDetails');
        }
    };

    //Goto ClaimDetails
    $scope.GotToClaimDetailsScreen = GotToClaimDetailsScreen;
    function GotToClaimDetailsScreen(claim) {
        if (claim && claim.claimId != null && claim.claimNumber != null) {
            sessionStorage.setItem("ClaimId", claim.claimId);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            sessionStorage.setItem("PolicyNo",claim.policyNumber);
            sessionStorage.setItem("ShowNoteActive", true);
            sessionStorage.setItem("ShowEventActive", false);
            sessionStorage.setItem("BackPage", "Dashboard");
            sessionStorage.setItem("refferer","SupervisorDashboard");
            $location.url('SupervisorClaimDetails');
        }
    };

    // Unassigned Claims
    $scope.sort = function (keyname) {
        $scope.reverse = ($scope.sortKey == keyname) ? !$scope.reverse : false; //if true make it false and vice versa
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        //$scope.NewClaims = $filter('orderBy')($scope.NewClaims, $scope.sortKey);
        $scope.unAssigned.currentPage = 1;
        getClaimList();
    }

    // Claims need approval
    $scope.Worksort = function (keyname) {
        $scope.Workreverse = ($scope.WorksortKey == keyname) ? !$scope.Workreverse : false;//if true make it false and vice versa
        $scope.WorksortKey = keyname;   //set the WorksortKey to the param passed
        $scope.claimsNeedApproval.currentPage = 1;
        supervisorApproval();
    }

    $scope.AssignClaim = function (obj, rowindex, listname) {
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: "lg",
                templateUrl: "views/ClaimsSupervisor/SupervisorAssignClaim.html",
                controller: "SupervisorAssignClaimController",
                resolve:
                {
                    items: function () {                        
                        return obj;
                    },
                    AdjusterList: function () {
                        return $scope.AdjusterList;
                    }
                }
            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                if (listname === "NewClaims") {
                    $scope.NewClaims.splice(rowindex, 1);
                    //$scope.FilteredFnolList[rowindex].status.status = "ASSIGNED";
                    // $scope.FnolList.splice($scope.FnolList.indexOf(obj), 1);
                    //$scope.FnolList[$scope.FnolList.indexOf(obj)].status.status = "ASSIGNED";
                }
            }
        }, function () {
        });
        return {
            open: open
        };
    }
    $scope.ClosedsortKey = "lastUpdateDate";
    $scope.Closedreverse = true;
    $scope.Closedsort = function (keyname) {
        $scope.ClosedsortKey = keyname;   //set the sortKey to the param passed
        $scope.Closedreverse = !$scope.Closedreverse; //if true make it false and vice versa
    };

    //Read Finished event
    $scope.CheckStatus = CheckStatus;
    function CheckStatus() {
        var UpcomingEvent = [];
        var CurrentDate = $filter('date')(new Date(), "MM/dd/yyyy");
        var CurrentTime = $filter('date')(new Date(), "hh:mma");

        angular.forEach($scope.EventList, function (event) {
            var EndDate = "";
            var EndTime = "";
            EndDate = $filter('DateFormatMMddyyyy')(event.endTiming);
            EndTime = $filter('DateFormatTime')(event.endTiming);

            if (EndDate >= CurrentDate) {
                if (EndTime >= CurrentTime) {

                    event.IsActive = true
                    UpcomingEvent.push(event);
                }
                else {
                    event.IsActive = false
                }
            }
            else {
                event.IsActive = false
            }
        });
        $scope.EventList = UpcomingEvent;
    };

    $scope.GoToDetails = GoToDetails;
    function GoToDetails() {
        sessionStorage.setItem("ClaimNo", "123");
        sessionStorage.setItem("ClaimId", "1");
        sessionStorage.setItem("ShowEventActive", false);
        sessionStorage.setItem("ShowNoteActive", true);
        sessionStorage.setItem("BackPage", "Dashboard");
        $location.url('SupervisorClaimDetails');
    };

    $scope.GotoAdjusterPerformance = GotoAdjusterPerformance
    function GotoAdjusterPerformance(Adjuster) {
        var obj = {};
        obj.adjusterId = Adjuster.id;
        sessionStorage.setItem("AdjusterId", Adjuster.id);
        sessionStorage.setItem("AdjusterName", (angular.isDefined(Adjuster.lastName) && Adjuster.lastName != null ? Adjuster.lastName : "")
            + "" + (angular.isDefined(Adjuster.firstName) && Adjuster.firstName != null ? ", " + Adjuster.firstName : ""));
        $location.url("/Performance");
    };

    //Settings for customized pagination
    $scope.setClaimCurrentPage = setClaimCurrentPage;
    function setClaimCurrentPage(pageNum, tab) {
        if (tab == 1) {
            $scope.unAssigned.currentPage = pageNum;
            getClaimList();
        }
        else if (tab == 2) {
            $scope.claimsNeedApproval.currentPage = pageNum;
            supervisorApproval();
        }
    };

    // Search keyword
    $scope.searchByKeyword = searchByKeyword
    function searchByKeyword(searchQuery, tab) {
        if (tab == 1) {
            $scope.unAssigned.searchKeyword = angular.isDefined(searchQuery) && searchQuery != null && searchQuery.length > 0 ? searchQuery : '';
            $scope.unAssigned.currentPage = 1;
            getClaimList();
        }
        else if (tab == 2) {
            $scope.claimsNeedApproval.searchKeyword = angular.isDefined(searchQuery) && searchQuery != null && searchQuery.length > 0 ? searchQuery : '';
            $scope.claimsNeedApproval.currentPage = 1;
            supervisorApproval();
        }
    };

    $scope.goToInvoiceDetailsPage = goToInvoiceDetailsPage;
    function goToInvoiceDetailsPage(invoice){


        if (invoice.invoiceNumber !== null && angular.isDefined(invoice.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": invoice.invoiceNumber,
                "ClaimNo": "",
                "InvoicesToBePaid": $scope.TotalInvoicesToBePaid,
                "isServiceRequestInvoice":invoice.isServiceRequestInvoice,
                "PageName": "BillsAndPayments",
                "PagePath": "BillsAndPayments"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }



    }
    //supervisor scorecard
    $scope.getClaimSupervisorScoreCard = getClaimSupervisorScoreCard;
    function getClaimSupervisorScoreCard(status){
        $scope.CurrentKPITab = status;
        var param ={
            "statusFlag":status=='Month'?1:(status=='Quater'?2:3),
        }
        var claimScoreCard = SupervisorDashboardService.getClaimSupervisorScoreCard(param);
        claimScoreCard.then(function (success) {
            var result = success.data.data;
            console.log(result);
            
            $scope.newClaims = result.newClaims;
            $scope.openClaims = result.openClaims;
            $scope.closedClaims = result.closedClaims ? result.closedClaims : 0;
            $scope.avgClosingClaim = result.avgClosingClaim ? result.avgClosingClaim : 0;
        }, function (error) {
            if (error != null) {
                $scope.ErrorMessage = error.data.errorMessage;
            }
        });
    }

    $scope.capitalizeFirstLetter = capitalizeFirstLetter;
    function capitalizeFirstLetter(str) {

        // converting first letter to uppercase
        const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    
        return capitalized;
    }
});
