angular.module('MetronicApp').controller('AdjusterDashboardController', function ($rootScope, AdjusterDashboardService, $filter, $scope, settings, $http, $timeout, $location,
    $translate, $translatePartialLoader, AuthHeaderService, DashboardAlertsService) {
    //set language
    $translatePartialLoader.addPart('AdjusterDashboard');
    $translate.refresh();
    //pagination
    $scope.pagesize = 20;
    $scope.totalItems = 0;
    $scope.OrigionalList = [];
    //Serch models
    $scope.search;   
    $scope.ClaimStatus = "ALL"
    $scope.ClaimList = [];
    $scope.NewClaims = [];//List for grid
    $scope.NewClaimCount = 0;
    $scope.ClaimInWork = [];
    $scope.ClaimsWithVendor = [];
    $scope.ClaimWaitongPHInfo = [];
    $scope.ClaimWaitingSupervisior = [];
    $scope.StatusList = [];
    $scope.OrignalNewClaims = [];
    $scope.ddlClaimStatusList = [];
    $scope.Notifications = "";
    $scope.ErrorMessage = "";
    $scope.GlobalSearchText = "";
    $scope.EventList = [];
    $scope.AlertList = [];
    $scope.sortKey = "createDate";
    $scope.isCoreLogic = sessionStorage.getItem("isCoreLogic")=="true" ? true : false;
    $scope.CurrentClaimTab = 'OpenClaims'// Used to show current active tab
    $scope.CurrentEventTab = 'Alert';// Used to show current active tab
    //search keyword
    $scope.pagination = {
        "current": 1
    }
    $scope.searchKeyword = '';
    $scope.SeletedStatus = ['0']; // get all open claims only
    $scope.reverse = true;
    $scope.limit = 50;
    $scope.moreShown = false;
    $scope.lastRecord = 20;
    $scope.hideAllCompanyInvoices = true;
    $scope.hideAllImmediateClaims = true;
    $scope.hideRegularClaims = false;
    $scope.hideRegularInvoices = false;
    $scope.crn = sessionStorage.getItem("CRN");
   


    function init() {
        $(".page-spinner-bar").removeClass("hide");
        if($location.absUrl().includes("user=")){
            var Baseurl = $location.absUrl().split("?")[0];
            window.location.replace(Baseurl)
            }
        $scope.UserDetails = {
            UserId: (angular.isDefined(sessionStorage.getItem("UserId")) ? sessionStorage.getItem("UserId") : null)
        };
        GetOpenClaims();
        ClaimStatus();
        getImmediateAttentionClaims();
        getPendingVendorInvoices();
        getClaimScoreCard("Month");
        populateDateButtons();
        $.fn.select2.amd.require([
            'select2/utils',
            'select2/dropdown',
            'select2/dropdown/attachBody'
        ], function (Utils, Dropdown, AttachBody) {
            function SelectAll() {
            }

            SelectAll.prototype.render = function (decorated) {
                var $rendered = decorated.call(this);
                var self = this;
                var $selectNone = $('<a/>').addClass('select2-none-header').text('Clear all');

                var checkOptionsCount = function () {
                    var count = $('.select2-results__option').length;
                };

                var $container = $('.select2-container');
                $container.bind('keyup click', checkOptionsCount);

                var $dropdown = $rendered.find('.select2-dropdown');

                $dropdown.prepend($selectNone);
                $selectNone.on('click', function (e) {
                    self.$element.val(null);
                    self.$element.trigger('change');
                    self.trigger('close');
                });

                return $rendered;
            };

            $("#select2insidemodal").select2({
                dropdownAdapter: Utils.Decorate(
                    Utils.Decorate(
                        Dropdown,
                        AttachBody
                    ),
                    SelectAll
                )
            });
        });
    };
    init();
     // get current month, quarter, year.
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
        var immediateClaimsPromise = AdjusterDashboardService.getImmediateClaims(sessionStorage.getItem("UserId"));
        immediateClaimsPromise.then(function (success) {
            // success.data.data
            $scope.immediateClaims = success.data.data.claims;
            $scope.immediateClaimsCount = success.data.data.totalClaims;
        });

    }
    $scope.getPendingVendorInvoices = getPendingVendorInvoices;
    function getPendingVendorInvoices() {
        sessionStorage.getItem("RoleList")
        var param = {
            "userId": sessionStorage.getItem("RoleList") == "ADJUSTER" ? sessionStorage.getItem("UserId") : null,
            "supervisorId": sessionStorage.getItem("RoleList") == "CLAIM SUPERVISOR" ? sessionStorage.getItem("UserId") : null,
            
        }
        var invoicesExcludingPolicyHolder;
        var pendingVendorInvoices = AdjusterDashboardService.getPendingVendorInvoices(param);
        pendingVendorInvoices.then(function (success) {
            invoicesExcludingPolicyHolder= success.data.data;
            invoicesExcludingPolicyHolder = invoicesExcludingPolicyHolder?.filter(inv=> inv.invoiceType!=="PolicyHolder");
            $scope.pendingVendorInvoices = invoicesExcludingPolicyHolder;
            $scope.pendingVendorInvoicesCount = invoicesExcludingPolicyHolder? invoicesExcludingPolicyHolder.length:"";
        });
    }
    $scope.goToRegularClaims = goToRegularClaims
    function goToRegularClaims() {
        $scope.hideAllImmediateClaims = true;
        $scope.hideAllCompanyInvoices = true;
        $scope.hideRegularClaims = false;

    }
    $scope.goToAllUrgentClaims = goToAllUrgentClaims;
    function goToAllUrgentClaims() {
        $scope.hideAllImmediateClaims = false;
        $scope.hideRegularClaims = true;
        $scope.hideAllCompanyInvoices = true;
        $scope.hideRegularInvoices = true;
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
        //var immediateClaimsPromise = AdjusterDashboardService.getAllImmediateClaims(sessionStorage.getItem("UserId"));
        var immediateClaimsPromise = AdjusterDashboardService.getAllImmediateClaims(param);
        immediateClaimsPromise.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            if (success.data.data != null) {
                $scope.allImmediateClaims = success.data.data.claims;
                $scope.allImmediateClaimsCount = success.data.data.totalClaims;
            }
        });

    }

    $scope.goToAllCompanyInvoices = goToAllCompanyInvoices;
    function goToAllCompanyInvoices() {
        $scope.hideAllCompanyInvoices = false;
        $scope.hideRegularInvoices = true;
        $scope.hideAllImmediateClaims = true;
        $scope.hideRegularClaims = true;
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "userId": sessionStorage.getItem("RoleList") == "ADJUSTER" ? sessionStorage.getItem("UserId") : null,
            "supervisorId": sessionStorage.getItem("RoleList") == "CLAIM SUPERVISOR" ? sessionStorage.getItem("UserId") : null,

        }
        var immediateInvoicePromise = AdjusterDashboardService.getPendingVendorInvoices(param);
        immediateInvoicePromise.then(function (success) {
            invoicesExcludingPolicyHolder= success.data.data;
            invoicesExcludingPolicyHolder = invoicesExcludingPolicyHolder?.filter(inv=> inv.invoiceType!=="PolicyHolder");
            $scope.pendingVendorInvoices = invoicesExcludingPolicyHolder;
            $scope.pendingVendorInvoicesCount = invoicesExcludingPolicyHolder? invoicesExcludingPolicyHolder.length:"";
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.goToRegularInvoices = goToRegularInvoices
    function goToRegularInvoices() {
        $scope.hideAllImmediateClaims = true;
        $scope.hideAllCompanyInvoices = true;
        $scope.hideRegularInvoices = false;

    }

    $scope.GetOpenClaims = GetOpenClaims;
    function GetOpenClaims() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "assignedUserId": $scope.UserDetails.UserId,
            "pagination": {
                "pageNumber": $scope.pagination.current,
                "limit": $scope.pagesize,
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? "desc" : "asc",
            },
            "searchKeyword": $scope.searchKeyword.length > 0 ? $scope.searchKeyword : '',
            "statusIds": $scope.SeletedStatus != null && $scope.SeletedStatus.length > 0
                && !($scope.SeletedStatus.length == 1 && $scope.SeletedStatus.indexOf('0') !== -1) ?
                $scope.SeletedStatus : null
        };
        $scope.tempStatus = param.statusIds;
        var promisePost = AdjusterDashboardService.getOpenClaims(param);
        promisePost.then(function (success) {
            $scope.NewClaims = [];
            var filteredResult = success.data ? success.data.data : null;
            if (filteredResult) {
                var claims = filteredResult.claims.length > 0 ? filteredResult.claims : null;
                if (angular.isDefined(claims) && claims != null && claims.length > 0) {
                    if ($scope.pagination.current == 1)
                        $scope.lastRecord = claims.length;
                    else {
                        $scope.lastRecord = claims.length + ($scope.pagesize * ($scope.pagination.current - 1))
                    }
                    angular.forEach(claims, function (item) {
                        $scope.NewClaims.push(item);
                    });
                }
                $scope.NewClaimCount = filteredResult.totalClaims;
                $scope.openClaimsPageSize = filteredResult.totalClaims / $scope.pagesize;
                $scope.totalItems = $scope.NewClaimCount;
                $scope.OrigionalList = $scope.NewClaims ? $scope.NewClaims : [];
                $scope.currentPageNo = filteredResult.currentPageNumber;
            }

            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error")
        });
    };

    $scope.GetClosedClaims = GetClosedClaims;
    function GetClosedClaims() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "assignedUserId": $scope.UserDetails.UserId,
            "claimStatus": "SETTLED",
            "pageNumber": 1
        };
        var promisePost = AdjusterDashboardService.getClaimsInProgress(param);
        promisePost.then(function (success) {
            $scope.ClosedClaimList = success.data.data;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error")
        });
    };

    $scope.GetUpcomingEvents = GetUpcomingEvents;
    function GetUpcomingEvents() {
        $(".page-spinner-bar").removeClass("hide");
        var GetEventList = AdjusterDashboardService.getEventList();
        GetEventList.then(function (success) {
            $scope.EventList = success.data.data;
            if (angular.isDefined($scope.EventList) && $scope.EventList != null) {
                if ($scope.EventList.length > 0) {
                    //getting all participants in a string          
                    angular.forEach($scope.EventList, function (event) {
                        event.PrticipantString = "";
                        angular.forEach(event.participants, function (participant, key) {
                            event.PrticipantString += participant.firstName == null ? "" : participant.firstName;
                            event.PrticipantString += participant.lastName == null ? "" : participant.lastName;
                            if (key != event.participants.length - 1) {
                                event.PrticipantString += ",";
                            }
                        });

                    });
                }
            }
            $scope.CheckStatus();
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error")
        });
    };

    $scope.sort = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false; //if true make it false and vice versa 
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.pagination.current = 1;
        GetOpenClaims();
    }

    $scope.ClosedsortKey = "createDate";
    $scope.Closedreverse = false;
    $scope.Closedsort = function (keyname) {
        $scope.ClosedsortKey = keyname;   //set the sortKey to the param passed
        $scope.ClosedClaimList = $filter('orderBy')($scope.ClosedClaimList, $scope.ClosedsortKey);
        $scope.Closedreverse = !$scope.Closedreverse; //if true make it false and vice versa
    };

    //Event Details
    $scope.GetEventDetails = GetEventDetails;
    function GetEventDetails(claim) {
        if (claim.id != null && claim.claimNumber != null) {
            sessionStorage.setItem("ClaimId", claim.id);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            sessionStorage.setItem("ShowEventActive", true);
            sessionStorage.setItem("ShowNoteActive", false);
            $location.url('AdjusterPropertyClaimDetails')
        }
    };

    //Alert Details
    $scope.GotoAlertDetails = GotoAlertDetails;
    function GotoAlertDetails(alert) {
        $rootScope.$broadcast('readNotification', { "id": alert.id });
        sessionStorage.setItem("ClaimId", alert.notificationParams.claimId);
        sessionStorage.setItem("ClaimNo", alert.notificationParams.claimNumber);
        if (angular.isDefined(alert.notificationParams.quoteNumber) && alert.notificationParams.quoteNumber != null) {
            sessionStorage.setItem("ClaimNumber",alert.notificationParams.claimNumber);
            sessionStorage.setItem("ClaimId",alert.notificationParams.claimId);
            sessionStorage.setItem("assignmentNumber",alert.notificationParams.assignmentNumber);
            sessionStorage.setItem("quoteNumber",alert.notificationParams.quoteNumber);
            $location.url('ViewQuote');
       }
       else if (alert.notificationParams.claimId != null && alert.notificationParams.claimNumber != null
            && (angular.isUndefined(alert.notificationParams.invoiceId) || alert.notificationParams.invoiceId == null)
            && (angular.isUndefined(alert.notificationParams.accountPayableId) || alert.notificationParams.accountPayableId == null)
            && (angular.isUndefined(alert.notificationParams.salvageId) || alert.notificationParams.salvageId == null)) {
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
                sessionStorage.setItem("AllNoteClaimNumber", alert.notificationParams.claimNumber);
                    sessionStorage.setItem("AllNoteClaimId", alert.notificationParams.claimId);
                    sessionStorage.setItem("messageGrpId", alert.notificationParams.messageGrpId);

                    // GotoAlertDetails
                    $location.url('/AllNotes');
            }
            else if (alert.notificationParams && alert.notificationParams.itemId) {
                if (alert.notificationParams.isItemNote)
                    sessionStorage.setItem("ForwardTab", "notes");
                sessionStorage.setItem("AdjusterPostLostItemId", alert.notificationParams.itemId);
                    $location.url('/AdjusterLineItemDetails');
            }
            else
                if(sessionStorage.getItem("isCoreLogic")=="true"){
                    $location.url('CorelogicAdjusterPropertyClaimDetails')

                }else {
                    $location.url('AdjusterPropertyClaimDetails')

                }
        }
        else if (angular.isDefined(alert.notificationParams.invoiceId) || alert.notificationParams.invoiceId != null) {
            var ObjDetails = {
                "InvoiceNo": alert.notificationParams.invoiceNumber,
                "ClaimNo": "",
                "isServiceRequestInvoice": false,
                "PageName": "BillsAndPayments"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }
        else if (angular.isDefined(alert.notificationParams.accountPayableId) || alert.notificationParams.accountPayableId != null) {
            var ObjDetails = {
                "InvoiceNo": alert.notificationParams.accountPayableInvoiceNumber,
                "isServiceRequestInvoice": false,
                "PageName": "Payable"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('PayableDetails');
        } else if (angular.isDefined(alert.notificationParams.claimNumber) && alert.notificationParams.salvageId == null) {
            sessionStorage.setItem("ClaimNo", alert.notificationParams.claimNumber);
            sessionStorage.setItem("ShowNoteActive", true);
            sessionStorage.setItem("ShowEventActive", false);
            if(sessionStorage.getItem("isCoreLogic")=="true"){
                $location.url('CorelogicAdjusterPropertyClaimDetails')

            }else {
                $location.url('AdjusterPropertyClaimDetails')

            }
        }
        else if (angular.isDefined(alert.notificationParams.salvageId) &&
            alert.notificationParams.salvageId != null) {
            sessionStorage.setItem("ClaimNo", alert.notificationParams.claimNumber);
            sessionStorage.setItem("AdjusterClaimNo", alert.notificationParams.claimNumber);
            sessionStorage.setItem("AdjusterClaimId", alert.notificationParams.claimId);
            sessionStorage.setItem("AdjusterPostLostItemId", alert.notificationParams.itemId);
            sessionStorage.setItem("ForwardTab", "Salvage");
            $location.url('AdjusterLineItemDetails')
        }
    }

    //Claim Details
    $scope.GotToClaimDetailsScreen = GotToClaimDetailsScreen;
    function GotToClaimDetailsScreen(claim) {
        sessionStorage.setItem("refferer", "HOME");
        if (claim && claim.claimId != null && claim.claimNumber != null) {
            sessionStorage.setItem("ClaimId", claim.claimId);
            sessionStorage.setItem("PolicyNo",claim.policyNumber);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            sessionStorage.setItem('ClaimCreatedDate', claim.createDate);
            sessionStorage.setItem("ShowNoteActive", true);
            sessionStorage.setItem("ShowEventActive", false);
            if(sessionStorage.getItem("isCoreLogic")=="true"){
                $location.url('CorelogicAdjusterPropertyClaimDetails')

            }else {
                $location.url('AdjusterPropertyClaimDetails')

            }
        }
    };

    //Global Search
    $scope.Globalsearch = function Globalsearch() {
        sessionStorage.setItem("GlobalSearchtext", $scope.GlobalsearchText);
        $location.url('AdjusterGlobalSearch');
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

    $scope.GoToAllUpcomingEvent = function () {
        var ClaimObj = {
            "IsClaimEvent": false,
            "ClaimNumber": "",
            "ClaimId": ""
        }
        sessionStorage.setItem("ClaimObj", JSON.stringify(ClaimObj));
        $location.url("AllEvents");
    };

    $scope.NewClaim = NewClaim;
    function NewClaim() {
        sessionStorage.setItem("isItemUploaded", false);//To indicate that we are redirecting to this page without uploading item
        $location.url("/NewClaim")
    };

    //Settings for customized pagination
    $scope.setCurrentPage = setCurrentPage;
    function setCurrentPage(pageNum) {
        $scope.pagination.current = pageNum;
        GetOpenClaims();
    };

    // Search keyword
    $scope.customSearch = customSearch
    function customSearch(searchQuery) {
        $scope.searchKeyword = angular.isDefined(searchQuery) && searchQuery != null && searchQuery.length > 0 ? searchQuery : '';
        $scope.pagination.current = 1;
        GetOpenClaims();
    }

    $scope.ClaimStatus = ClaimStatus;
    function ClaimStatus() {
        var GetClaimStatusList = AdjusterDashboardService.getClaimStatus();
        GetClaimStatusList.then(function (success) {
            $scope.TempStatusList = success.data.data;
            console.log($scope.TempStatusList);
            angular.forEach($scope.TempStatusList, function(status){
                if(status.status == "Work In Progress" || status.status == "Created" || status.status == "Supervisor Approval" || status.status == "3rd Party Vendor"){
                    $scope.StatusList.push(status);
                }
            })
        }, function (error) {
            if (error != null) {
                $scope.ErrorMessage = error.data.errorMessage;
            }
        });
    }

    var previousStatusList = angular.copy($scope.SeletedStatus);
    $scope.afterSelectedStatus = function () {
        $scope.filterd = [];
        let preIndex = previousStatusList.findIndex(status => status === '0');
        let previousListasAll = false
        if (preIndex > -1) {
            previousListasAll = true;
        }
        // previousStatusList = [];
        // $('#select2insidemodal').find('option:selected').each(function () {
        //     var opt = $(this);
        //     var opvalue = opt.attr('value');
        //     if(opvalue != "0")
        //         previousStatusList.push(opvalue);
        // });
        let index = $scope.SeletedStatus.findIndex(status => status === '0');
        let currListasAll = false;
        if (index > -1) {
            currListasAll = true;
        }
        if (previousListasAll && currListasAll && $scope.SeletedStatus.length > 1) {
            $scope.SeletedStatus.splice(index, 1);
            $('#select2insidemodal option:selected[value="0"]').removeAttr('selected');
        }
        if (!previousListasAll && currListasAll && $scope.SeletedStatus.length > 1) {
            angular.forEach($scope.SeletedStatus, function (status, removeindex) {
                if (status != '0')
                    $scope.SeletedStatus.splice(removeindex, $scope.SeletedStatus.length);
            });
            $('#select2insidemodal option:selected[value!="0"]').removeAttr('selected');
        }
        previousStatusList = angular.copy($scope.SeletedStatus);    
        GetOpenClaims();
    };
    $scope.goToInvoiceDetailsPage = goToInvoiceDetailsPage;
    function goToInvoiceDetailsPage(invoice) {


        if (invoice.invoiceNumber !== null && angular.isDefined(invoice.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": invoice.invoiceNumber,
                "ClaimNo": "",
                "InvoicesToBePaid": $scope.TotalInvoicesToBePaid,
                "isServiceRequestInvoice": invoice.isServiceRequestInvoice,
                "PageName": "BillsAndPayments",
                "PagePath": "BillsAndPayments"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }



    }

    //claims/scorecard
    $scope.getClaimScoreCard = getClaimScoreCard;
    function getClaimScoreCard(status){
        $scope.CurrentKPITab = status;
        var param ={
            "statusFlag":status=='Month'?1:(status=='Quater'?2:3),
        }
        var claimScoreCard = AdjusterDashboardService.getClaimScoreCard(param);
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
});