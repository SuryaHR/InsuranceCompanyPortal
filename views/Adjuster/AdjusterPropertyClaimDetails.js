angular.module('MetronicApp').controller('AdjusterPropertyClaimController', function ($uibModal, $state,
    $scope, $filter, $window, $location,$rootScope,
    $translate, $translatePartialLoader,
    AdjusterPropertyClaimDetailsService, AuthHeaderService, LineItemsFactory, LineItemService,
    StatusConstants, utilityMethods) {
    /* Below Commented Due to IE-11 issues */
    // $scope.$on('$viewContentLoaded', function () {
    //     // initialize core components
    //     App.initAjax();
    // });
    //set language
    $translatePartialLoader.addPart('AdjusterPropertyClaimDetails');
    $translate.refresh();
    $scope.CreateEventObject = {
        "EventDate": null,
        "EventTitle": null,
        "StartTime": null,
        "Endtime": null,
        "EventNote": null
    };
    //pagination
    $scope.pagesize = 10;
    $scope.pagination =
    {
        current: 1
    }
    $scope.acceptingStandardCost =false;
    $scope.all = true;
    $scope.allcat = true;
    $scope.acceptStandardCostThreshold = 50;
    $scope.alltotalprice = true;
    $scope.allvendor = true;
    $scope.unique = true;
    $scope.uniqueStatus =[];
    $scope.allItemTag = true;
    $scope.displaystatusfiltr = false;
    $scope.displaycategoryfiltr = false;
    $scope.displaytotalpricefiltr = false;
    $scope.displayvendorfiltr = false;
    $scope.itemsTolimit = 100;
    $scope.OrigionalList = [];
    $scope.indextab = 0;
    $scope.TotalStatedValue = 0.00;
    $scope.claimStatus = { id: 1 };
    $scope.CurrentClaimDetailsTab = 'ContentList';
    $scope.ClaimDetailstab = "Notes";
    //$scope.currentAttchment = null;
    $scope.ClaimStatusInvoiceDetails = []; $(".page-spinner-bar").removeClass("hide");
    $scope.ClaimStatusContent = [];
    $scope.ClaimParticipantsList = []; //We are adding vendor list to this object which is used for autocomplete extender
    $scope.ParticipantId = null;
    $scope.ParticipantName = "";
    $scope.ErrorMessage = "";
    $scope.FiletrLostDamageList = [];
    $scope.creaAssignmentFlag = false;
    $scope.ItemAssignmentList = [];
    $scope.OriginalPostLossItem = [];
    $scope.DdlSourceCategoryList = [];
    $scope.LostDamagedContentByCategory = [];
    $scope.SubCategory = [];
    $scope.VendorsAgainstClaim = [];
    $scope.claimMessages = [];
    $scope.SelectedPostLostItems = [];
    $scope.EventList = [];
    $scope.PolicyDetails = [];
    $scope.ServiceRequestList = [];
    $scope.AttachmentTypes = [];
    $scope.VendorAssignmentList = [];
    $scope.PricingSpecialist = [];
    $scope.QuoteDetails = [];
    $scope.AssginmentDetails = {};
    $scope.NewlyAddedItemId = null;
    sessionStorage.setItem("SelectedItemList", $scope.SelectedPostLostItems);
    sessionStorage.setItem("ServiceRequestId", "")
    $scope.PendingTaskList = [];
    $scope.displayEvent = true;
    $scope.displayNotes = false;
    $scope.displayParticipant = false;
    $scope.displayOrigionalItems = true;
    $scope.displayContentList = false;
    $scope.reverseIcon = true;
    $scope.displayClaimDetails = false;
    $scope.displayAddAttachmentbtn = true;
    $scope.displayClaimFileName = false;
    $scope.maxItemNo = 0;
    //For Claim Details Tab Section
    $scope.ContentsDiv = true;
    $scope.InvoicesDiv = false;
    $scope.PolicyDetailsDiv = false;
    $scope.ClaimDetailsDiv = false;
    $scope.ReportsDiv = false;
    //$scope.attachmentList = [];
    $scope.tab = angular.isDefined(sessionStorage.getItem("claimDetailsCurrentTab")) && sessionStorage.getItem("claimDetailsCurrentTab") != null && sessionStorage.getItem("claimDetailsCurrentTab") != "" ? sessionStorage.getItem("claimDetailsCurrentTab") : 'Contents';
    $scope.editClaimDetail = false;
    $scope.editServicesRequested = false;
    $scope.ShowAssignments = false;
    $scope.ShowAssignmentDetails = false;
    $scope.fromSearch = false;
    $scope.fromPeopleDetails = false;
    var pageName = "CLAIMS";
    $scope.editAssignedClaimDetail = {};
    $scope.shippingMethodsList = [];
    //$scope.tab = 'Contents';
    $scope.deletedItemAttachments = [];
    $scope.userId = sessionStorage.getItem("UserId") ? sessionStorage.getItem("UserId") : null;

    $scope.limit = 30;
    $scope.desclimit = 30;
    $scope.moreShown = false;
    $scope.descMoreShown = false;
    var itemCategoryIds = [];
    $scope.reverseVendorsList = false;
    $scope.vendorSortKey = '';
    $scope.searchVendorsKeyword = '';
    $scope.getNumberOfRec = 20;
    $scope.countOfinvoces = 0;
    $scope.totalInvoiceAmount = 0;
    $scope.paidInvoiceCount = 0;
    $scope.totalInvoicePaidAmount = 0;

    $scope.hideSettlementSuccessMsg = false;

    $scope.VendorName = "Artigem";

    //Get Item / claim status
    $scope.constants = {
        itemStatus: StatusConstants.ItemStatus,
        invoiceStatus: StatusConstants.InvoiceStatus,
    };
    //----------Sorting of datatbale--------------------------------------------------------------//
    $scope.sortServiceRequest = function (keyname) {
        $scope.sortServiceRequestreverse = ($scope.sortServiceRequestKey === keyname) ? !$scope.sortServiceRequestreverse : false;
        $scope.sortServiceRequestKey = keyname;
    }
    $scope.sortpostlostitem = function (keyname) {
        // CTB-3514 - Disabled 
        // $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        // $scope.sortKey = keyname;
    };
    $scope.sortVendor = function (keyname) {
        $scope.sortVendorKey = keyname;
        $scope.reverseVendor = !$scope.reverseVendor;
    };
    $scope.sortClaimDetails = function (keyname) {
        $scope.sortClaimDetailsKey = keyname;
        $scope.reverseClaimDetails = !$scope.reverseClaimDetails;
    };

    // Pagination
    $scope.itemPageSize = 20;
    $scope.totalItems = 0;
    $scope.totalVendors = 0;
    $scope.currentPage = 1;
    $scope.toShowingPage = 20;
    $scope.vendorPage = 1;
    $scope.lastRowCount = 0;
    $scope.ItemsSelectedForAssignments = [];
    // Total ACVs and RCVs
    $scope.TotalOfACVs = 0;
    $scope.TotalOfRCVs = 0;

    $scope.TotalOfCashExpo = 0;
    $scope.TotalOfHoldoverPaid = 0;
    $scope.TotalOfHoldoverRemaining = 0;
    $scope.TotalOfCashPaid = 0;
    $scope.TotalOfReplExpo = 0;

    $scope.RoomsList = [];
    $scope.Retailers = [];
    $scope.paymentTypes = [];
    $scope.addOtherRetailer = false;
    $scope.PostLostItemsTab = 'LineItemsTab';
    //
    // Claim snap shot and Activities > CTB-2704
    $scope.totalMessages = 0;
    var currentMessagePage = 1;
    var totalMessagePages = 0;
    $scope.isMessagesLoading = false;
    var scrollItemsLimit = 10;

    //Default participants list
    $scope.defaultRecepients = [];
    function init() {
        $scope.graphTab = "LineGraph";
        $scope.imgDiv = false;
        sessionStorage.setItem("ReportClaimNo", null);
        $scope.claimCreatedDate = sessionStorage.getItem('ClaimCreatedDate') ? sessionStorage.getItem('ClaimCreatedDate') : '';
        $scope.navFromAllClaim = sessionStorage.getItem("NavFrom") == "AllClaim" ? true : false;
        sessionStorage.setItem("NavFrom", "");

        $scope.CommonObj =
        {
            ClaimNumber: sessionStorage.getItem("ClaimNo"),
            PolicyNumber: sessionStorage.getItem("PolicyNo"),
            ClaimId: sessionStorage.getItem("ClaimId"),
            UserId: sessionStorage.getItem("UserId"),
            UserName: sessionStorage.getItem("UserName"),
            claimNote: "",
            eventNote: "",
            Categories: "ALL",
            Attachment: '',
            EventTitle: "",
            EventDate: $filter('date')(new Date(), "dd/MM/yyyy"),
            EventActive: sessionStorage.getItem("ShowEventActive"),
            NoteActive: sessionStorage.getItem("ShowNoteActive"),
            BranchCode: null,
            ClaimProfile: sessionStorage.getItem("claimProfile"),
            ServiceRequests: sessionStorage.getItem("serviceRequests"),
            UserRole: sessionStorage.getItem("RoleList"),
            AssignmentNumber: '',
            isAssignmentDone: false
        };
        $rootScope.AssignmentRemark ='';
        $scope.newInvoiceTab = sessionStorage.getItem('newInvoiceTab');
        if ($scope.newInvoiceTab) {
            sessionStorage.removeItem('newInvoiceTab');
            ShowInvoicesTab();
            return false;
        }
        if (sessionStorage.getItem("claimDetailsCurrentTab") == "Item Replacement Quotes") {
            //sessionStorage.removeItem("claimDetailsCurrentTab");
            $scope.tab = "Vendor Assignments";
            //$scope.tab = "Item Replacement Quotes";
            showAllReplacementQuotes();
            getClaimsStatusContentDetails();
        }
        else if(sessionStorage.getItem("ForwardTab")=="Vendor Assignments"){
            $scope.tab = "Vendor Assignments";
            $scope.assignmentRedirection = true;
            ShowVendors();
            sessionStorage.setItem("ForwardTab","")
        }
        else if ($scope.CommonObj.ClaimId != null || $scope.CommonObj.ClaimNumber != null) {
            $(".page-spinner-bar").removeClass("hide");
            getPolicyDetails();
            getMessages();
            getRequestList();
            GetCategory();
            getClaimParticipants();
            GetCompanyBranchList();
            GetPendingTaskList();
            if (angular.isDefined($scope.tab) && $scope.tab != null && $scope.tab === 'Invoices')
                ShowInvoicesTab();
            else if($scope.tab === 'Policy Details')
                ShowPolicyDetails();
            else if($scope.tab === 'Vendor Assignments')
            ShowVendors();
            else
                showContents();
            //By default showing notes or events tab opened if redirected from alert tab to this page
            if ($scope.CommonObj.EventActive !== "" || $scope.CommonObj.NoteActive !== "") {
                if ($scope.CommonObj.EventActive === "true" && $scope.CommonObj.NoteActive === "false") {
                    $scope.ClaimDetailstab = 'Event';
                }
                else if ($scope.CommonObj.EventActive === "false" && $scope.CommonObj.NoteActive === "true") {
                    $scope.ClaimDetailstab = 'Notes';
                }
            }
            else {
                $scope.ClaimDetailstab = 'Notes';
                if (angular.isDefined(sessionStorage.getItem("ActiveVendorAssignment"))) {
                    $scope.name = sessionStorage.getItem("ActiveVendorAssignment");
                    if ($scope.name === "true") {
                        $scope.tab = 'Vendor Assignments';
                        $scope.ShowAssignments = true;
                        $scope.ShowAssignmentsList = false;
                        sessionStorage.setItem("ActiveVendorAssignment", "")
                    }
                    else {
                        sessionStorage.setItem("ActiveVendorAssignment", "")
                    }
                }
                else {
                    $scope.tab = 'Contents';
                    sessionStorage.setItem("ActiveVendorAssignment", "")
                }
            }
        }
        else {
            $location.url('AdjusterDashboard'); //if session data is lost then redirect to previous page
        }
        if ($scope.CommonObj.ClaimProfile == "Jewelry") {
            getShippingMethods();
        }
        else {
            $scope.selected = { isScheduledItem: false, category: { id: null } };
        }

        if (sessionStorage.getItem("refferer") === "SEARCH_RESULT")
            $scope.fromSearch = true;
        else if (sessionStorage.getItem("refferer") === "PEOPLE_DETAILS") {
            $scope.fromSearch = true;
            $scope.fromPeopleDetails = true;
        } else {
            $scope.fromSearch = false;
            $scope.fromPeopleDetails = false;
        }

        // Div hihlight
        $(document).ready(function () {
            $("#itemsHighlight").click(function (event) {
                event.preventDefault();
                $("html, body").animate({ scrollTop: $($(this).attr("href")).offset().top }, 500);
            });
        });

        var assignment = [];
        assignment.vendorDetails = [];
        assignment.assignmentNumber = sessionStorage.getItem("assignementObject");
        assignment.vendorDetails.registrationNumber = sessionStorage.getItem("vrn");
        if (assignment.assignmentNumber) {
            sessionStorage.removeItem("assignementObject");
            OpenAssignmentDetails(assignment);
        }
        GetSubCategoryList();

        if(sessionStorage.getItem("claimProfile")!=="Jewelry")
        calculateSettlement(false);

    }
    init();



    $scope.openInvoicesInNewTab = openInvoicesInNewTab;
    function openInvoicesInNewTab() {
        sessionStorage.setItem('newInvoiceTab', true);
        sessionStorage.setItem('assignmentNumber', $scope.CommonObj.AssignmentNumber);
        var url = $state.href('AdjusterPropertyClaimDetails');
        $window.open(url, '_blank');
    }

    $scope.getShippingMethods = getShippingMethods;
    function getShippingMethods() {
        var shippingMethods = AdjusterPropertyClaimDetailsService.getShippingMethods();
        shippingMethods.then(function (success) {
            $scope.shippingMethodsList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    $scope.calculateMaxItemNo = calculateMaxItemNo;
    function calculateMaxItemNo() {
        $scope.selected.itemNumber = parseInt($scope.FiletrLostDamageList == null ? 0 : $scope.FiletrLostDamageList.length) + 1;
    }
    //Invoices
    $scope.InvoiceContents = {};
    $scope.ShowInvoicesTab = ShowInvoicesTab;
    function ShowInvoicesTab() {
        $(".page-spinner-bar").removeClass("hide");
        GetVendorAllInvoices();
        $scope.ShowAssignmentDetails = false;
        $scope.ShowAssignmentsList = false;
        $scope.CurrentTab = 'Invoices';
        $(".page-spinner-bar").addClass("hide");
    }
    $scope.GetInvoiceContents = GetInvoiceContents;
    function GetInvoiceContents() {
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber
        };
        var getGetInvoiceContents = AdjusterPropertyClaimDetailsService.getInvocieContents(param);
        getGetInvoiceContents.then(function (success) {
            $scope.InvoiceContents = success.data.data;
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
    $scope.GetVendorAllInvoices = GetVendorAllInvoices;
    function GetVendorAllInvoices() {
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "assignmentNumber": sessionStorage.getItem('assignmentNumber')
        };
        sessionStorage.removeItem('assignmentNumber');
        var getAllVendorInvoices = AdjusterPropertyClaimDetailsService.getAllVendorInvoices(param);
        getAllVendorInvoices.then(function (success) {
            $scope.AllInvoices = success.data.data;

            var invoices = $scope.AllInvoices[0].invoices.filter(invoice => invoice.status.id != 6);
            $scope.countOfinvoces = invoices.length;
            $scope.totalInvoiceAmount = invoices.reduce((a, b) => a + b.amount, 0);
            var paidInvoices = invoices.filter(invoice => invoice.status.id == 2);
            $scope.totalInvoicePaidAmount = paidInvoices.reduce((a, b) => a + b.amount, 0);
            $scope.paidInvoiceCount = paidInvoices.length;

            angular.forEach($scope.AllInvoices, function (vendor) {
                vendor.totalAmount = 0;
                angular.forEach(vendor.invoices, function (invoice) {
                    vendor.totalAmount += invoice.amount;
                });
            });
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
    // Messages
    $scope.getMessages = getMessages;
    function getMessages(event) {
        var param = {
            "claimId": $scope.CommonObj.ClaimId,
            "page": currentMessagePage,
            "limit": scrollItemsLimit
        }
        var getpromise = AdjusterPropertyClaimDetailsService.getClaimMessages(param);
        getpromise.then(function (success) {
            var messagesList = success.data.data;
            if (messagesList) {
                angular.forEach(messagesList.messages, function (msg) {
                    $scope.claimMessages.push(msg);
                });
                $scope.totalMessages = messagesList.totalCount;
                totalMessagePages = Math.ceil(messagesList.totalCount / scrollItemsLimit);
            }
            $scope.isMessagesLoading = false;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    $scope.itemsLoading = true;
    $scope.noItems = false;
    $scope.GetPostLostItems = GetPostLostItems;
    function GetPostLostItems() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "claimId": $scope.CommonObj.ClaimId
        }
        var getpromise = AdjusterPropertyClaimDetailsService.getPostLostItemsForAdjuster(param);
        getpromise.then(function (success) {
            $scope.creaAssignmentFlag = false;
            $scope.FiletrLostDamageList = [];
            if (success.data.data != null) {
                $scope.FiletrLostDamageList = success.data.data;
                $scope.statusFilterItems = success.data.data;
                $scope.itemsLoading = false;
                statusBasedFilter($scope.FiletrLostDamageList);
               
                var param2 = {
                    "claimNumber": $scope.CommonObj.ClaimNumber,
                    "claimId": $scope.CommonObj.ClaimId
                }
                mapFilterLostDamageList(param2);
                $scope.noItems = $scope.statusFilterItems.length == 0;
            } else {
                $scope.itemsLoading = false;
                $scope.noItems = true;
            }

            $scope.uniqueStatus=[];
            $scope.filterStatus=[];
            $scope.uniqueStatus = [...new Set($scope.statusFilterItems.map(item => item.status.status))];
            $scope.uniqueStatus = $scope.uniqueStatus.filter((status)=> !!status)
            $scope.filterStatus = [...$scope.uniqueStatus];

            $scope.uniqueItemTag=[];
            $scope.filterItemTag=[];
            $scope.uniqueItemTag = [...new Set($scope.statusFilterItems.map(item => item.itemTag?.name))];
            $scope.uniqueItemTag = $scope.uniqueItemTag.filter((itemTag)=> !!itemTag)
            $scope.filterItemTag = [...$scope.uniqueItemTag];
            $scope.filterItemTag.push("Blank");
            $scope.uniqueItemTag.push("Blank");

            $scope.uniqueCategory=[];
            $scope.filterCategory=[];
            $scope.uniqueCategory =[...new Set($scope.statusFilterItems.map(item=> item.category?.name))]
            $scope.uniqueCategory = $scope.uniqueCategory.filter((category)=> !!category)
            $scope.filterCategory = [...$scope.uniqueCategory];
            $scope.filterCategory.push("Blank");
            $scope.uniqueCategory.push("Blank");

            $scope.uniqueVendor=[];
            $scope.filterVendor=[];
            $scope.uniqueVendor =[...new Set($scope.statusFilterItems.map(item=> item.vendorDetails?.vendorName))]
            $scope.uniqueVendor = $scope.uniqueVendor.filter((vendor)=> !!vendor)
            $scope.filterVendor = [...$scope.uniqueVendor];

            $scope.uniqueTotalPrice=[];
            $scope.filterTotalPrice=[];
            $scope.filterTotalPrice = ['1','2','3','4']
            $scope.uniqueTotalPrice = ['1','2','3','4'];

            checkAllfilters();
            
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }
    var underReviewItems;
    var lineItems;
    $scope.statusBasedFilter = statusBasedFilter;
    function statusBasedFilter(itemList) {
        if (itemList && itemList.length > 0) {
            $scope.TotalOfACVs = 0;
            $scope.TotalOfRCVs = 0;
            $scope.TotalOfCashExpo = 0;
            $scope.TotalOfHoldoverPaid = 0;
            $scope.TotalOfHoldoverRemaining = 0;
            $scope.TotalOfCashPaid = 0;
            $scope.TotalOfReplExpo = 0;
            for (var i = 0; i < itemList.length; i++) {
                var item = itemList[i];
                item.rcvTotal = item.rcvTotal ? item.rcvTotal : 0.0;
                item.cashPayoutExposure = item.cashPayoutExposure ? item.cashPayoutExposure : 0.0;
                item.totalStatedAmount = item.totalStatedAmount ? item.totalStatedAmount : 0.0;
                item.holdOverPaid = item.holdOverPaid ? item.holdOverPaid : 0.0;
                item.holdOverRemaining = item.holdOverRemaining ? item.holdOverRemaining : 0.0;
                item.cashPaid = item.cashPaid ? item.cashPaid : 0.0;
                item.replacementExposure = item.replacementExposure ? item.replacementExposure : 0.0;

                $scope.TotalOfCashExpo += item.cashPayoutExposure;
                $scope.TotalOfHoldoverPaid += item.holdOverPaid;
                $scope.TotalOfHoldoverRemaining += item.holdOverRemaining;
                $scope.TotalOfCashPaid += item.cashPaid;
                $scope.TotalOfReplExpo += item.replacementExposure;
                if (item.acv != null) {
                    $scope.TotalOfACVs += parseInt(item.acv);
                }
                if (item.rcvTotal != null) {
                    $scope.TotalOfRCVs += parseInt(item.rcvTotal);
                }
                item.itemNumber = Number(item.itemNumber);
            }
        }
    }

    // $scope.getUnderReviewitems = getUnderReviewitems;
    // function getUnderReviewitems() {
    //     //Unselect the items if there are any selected ones.
    //     $scope.selectedAll = false;
    //     $scope.PostLostItemsTab = "UnderReviewItemsTab";
    //     $scope.statusFilterItems = underReviewItems
    //     $scope.checkAll($scope.statusFilterItems);
    // }

    // $scope.getLineItems = getLineItems;
    // function getLineItems() {
    //     $scope.selectedAll = false;
    //     $scope.PostLostItemsTab = "LineItemsTab";
    //     $scope.statusFilterItems = lineItems
    //     $scope.statusFilterItems = $scope.data.slice(0, 100);
    //     $scope.checkAll($scope.statusFilterItems);
    //     //$scope.GetPostLostItems();
    // }
    $scope.TotalOfACVs = 0;
    $scope.TotalOfRCVs = 0;
    function mapFilterLostDamageList(param) {
        $scope.totalItems = $scope.toShowingPage = $scope.FiletrLostDamageList.length;
        var tempList = [];

        // angular.forEach($scope.FiletrLostDamageList, function (item) {
        // item.claimItem.itemNumber = Number(item.claimItem.itemNumber);
        // item.claimItem.associateName = "";
        // if (item.claimItem && item.claimItem.status && item.claimItem.status.id === 4) {
        //     item.isQuoteSubmittedByVendor = true;
        // } else {
        //     item.isQuoteSubmittedByVendor = false;
        // }
        // if (item.claimItem.ageMonths != null && item.claimItem.ageMonths != " " && item.claimItem.ageMonths != "") {
        //     item.claimItem.ageMonths = parseInt(item.claimItem.ageMonths);
        // }
        // else {
        //     item.claimItem.ageMonths = 0;
        // }
        // if (item.claimItem.ageYears != null && item.claimItem.ageYears != " " && item.claimItem.ageYears != "") {
        //     item.claimItem.ageYears = parseInt(item.claimItem.ageYears);
        // }
        // else {
        //     item.claimItem.ageYears = 0;
        // }
        // if (item.claimItem.status.status != $scope.constants.itemStatus.assigned || item.claimItem.status.status != $scope.constants.itemStatus.approved ||
        //     item.claimItem.status.status != $scope.constants.itemStatus.settled || item.claimItem.status.status != $scope.constants.itemStatus.repaced) {
        //     $scope.creaAssignmentFlag = false;
        // }
        // if (item.claimItem.vendorAssociate) {
        //     item.claimItem.associateName = item.claimItem.vendorAssociate.lastName + ", " + item.claimItem.vendorAssociate.firstName
        // }
        // Calculate of Total ACVs / RCVs

        // if (item.claimItem.isActive) {
        // tempList.push(item)
        // }
        // });
        // if (tempList.length > 0) {
        //     $scope.FiletrLostDamageList = angular.copy(tempList);
        // }
        $scope.OriginalPostLossItem = $scope.FiletrLostDamageList;
        $scope.LostDamagedContentByCategory = $scope.FiletrLostDamageList;
        $scope.VendorAssignmentList = $scope.FiletrLostDamageList; //Used for vendor assignment tab
        $scope.ContentServiceList = [];
        // store item list in a factory
        LineItemsFactory.addItemsToList(angular.copy($scope.FiletrLostDamageList), param);
        if ($scope.name === "true") {
            var ItemList = sessionStorage.getItem("ItemsList");
            if (ItemList != null && angular.isDefined(ItemList)) {
                $scope.VendorAssignmentList = JSON.parse(ItemList);
                if ($scope.VendorAssignmentList.length == 0) {
                    $scope.VendorAssignmentList = $scope.FiletrLostDamageList;
                }
            }
            var SelectedPostlossItems = sessionStorage.getItem("SelectedItemsList");
            if (SelectedPostlossItems != null && angular.isDefined(SelectedPostlossItems)) {
                $scope.SelectedVendorPostLossItem = JSON.parse(SelectedPostlossItems);
                if ($scope.SelectedVendorPostLossItem.length == 0) {
                    $scope.SelectedVendorPostLossItem = [];
                    $scope.selectedAllVendorItem = false;
                    $scope.SelectedCategories = [];
                }
                else {
                    $scope.selectedAllVendorItem = true;
                    // angular.forEach($scope.SelectedVendorPostLossItem, function (obj) {
                    //     angular.forEach($scope.VendorAssignmentList, function (Origionalitem) {
                    //         if (Origionalitem.category) {
                    //             if (obj == Origionalitem.itemUID) {
                    //                 itemCategoryIds.push(Origionalitem.category.id);
                    //             }
                    //         }
                    //     });
                    // });
                    //GetVendorsList();
                    $scope.SelectCategory();
                }
            }
            var ItemStatus = sessionStorage.getItem("ItemsStatus");
            if (ItemStatus != null && angular.isDefined(ItemStatus)) {
                if (ItemStatus === "true") {
                    $scope.selectedAllVendorItem = true;
                }
                else {
                    $scope.selectedAllVendorItem = false;
                }
            }
            else {
                $scope.selectedAllVendorItem = false;
            }
        }
        else {
            $scope.SelectedVendorPostLossItem = [];
            $scope.selectedAllVendorItem = false;
            $scope.SelectedCategories = [];
        }
    }

    $scope.GetContentService = GetContentService;
    function GetContentService() {
        var getContentService = AdjusterPropertyClaimDetailsService.getContentService();
        getContentService.then(function (success) {
            $scope.ContentServiceList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    $scope.GetStates = GetStates;
    function GetStates() {
        var param =
        {
            "isTaxRate": false,
            "isTimeZone": false
        };
        var statelist = AdjusterPropertyClaimDetailsService.getStates(param);
        statelist.then(function (success) {
            $scope.DdlStateList = success.data.data;

        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    function getServiceRequestList() {
        var param = {
            "claimId": $scope.CommonObj.ClaimId
        };
        var serviceRequestList = AdjusterPropertyClaimDetailsService.getServiceRequestList(param);
        serviceRequestList.then(function (success) {
            $scope.FilteredList = $filter('filter')(success.data.data, { isDelete: false });
            $scope.ServiceRequestList = $scope.FilteredList;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.GetEventList = GetEventList;
    function GetEventList() {
        var paramClaimId = { "id": $scope.CommonObj.ClaimId }
        var EventListPromise = AdjusterPropertyClaimDetailsService.GetEventList(paramClaimId);
        EventListPromise.then(function (success) {
            $scope.EventList = [];
            $scope.EventList = success.data.data;
            //Getting accepted event
            angular.forEach($scope.EventList, function (event) {
                if (event.organizer.id == parseInt($scope.CommonObj.UserId)) {
                    event.IsPaticiapntAccepted = "creator";
                }
                else {
                    angular.forEach(event.participants, function (participant, key) {
                        if (participant.id == parseInt($scope.CommonObj.UserId)) {
                            if (participant.isAccepted == true) {
                                event.IsPaticiapntAccepted = "true";
                            }
                            else if (participant.isAccepted == null) {
                                event.IsPaticiapntAccepted = "pending";
                            }
                            else if (participant.isAccepted == false) {
                                event.IsPaticiapntAccepted = "false";
                            }
                        }
                    });
                }
            });
            //Getting participant list as string
            angular.forEach($scope.EventList, function (event) {
                event.particiapntsTstring = '';
                angular.forEach(event.participants, function (participant, key) {
                    participant.firstName = ((participant.firstName == null) ? participant.firstName = "" : participant.firstName);
                    participant.lastName = ((participant.lastName == null) ? participant.lastName = "" : participant.lastName);

                    event.particiapntsTstring += participant.firstName + " " + participant.lastName
                    if (key != event.participants.length - 1) {
                        event.particiapntsTstring += ',';
                    }
                });
            });
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        })
    }

    $scope.getRequestList = getRequestList;
    function getRequestList() {
        var paramClaimId =
        {
            "id": $scope.CommonObj.ClaimId,
        }
        var requestListPromise = AdjusterPropertyClaimDetailsService.GetRequestList(paramClaimId);
        requestListPromise.then(function (success) {
            $scope.requestList = [];
            $scope.requestList = success.data.data;
            //Getting accepted event
            angular.forEach($scope.requestList, function (request) {
                if (request.organizer.id == parseInt($scope.CommonObj.UserId)) {
                    request.IsPaticiapntAccepted = "creator";
                }
                else {
                    angular.forEach(request.participants, function (participant, key) {
                        if (participant.id == parseInt($scope.CommonObj.UserId)) {
                            if (participant.isAccepted == true) {
                                request.IsPaticiapntAccepted = "true";
                            }
                            else if (participant.isAccepted == null) {
                                request.IsPaticiapntAccepted = "pending";
                            }
                            else if (participant.isAccepted == false) {
                                request.IsPaticiapntAccepted = "false";
                            }
                        }
                    });
                }
            });
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        })
    }

    $scope.getVendorsAgainstClaim = getVendorsAgainstClaim;
    function getVendorsAgainstClaim() {
        // get active vendors against claim with all details for binding to grid
        var param = { "claimNumber": $scope.CommonObj.ClaimNumber }
        var getpromise = AdjusterPropertyClaimDetailsService.getVendorsAgainstClaimDetails(param);
        getpromise.then(function (success) {
            $scope.VendorsAgainstClaim = success.data.data;
            angular.forEach($scope.VendorsAgainstClaim, function (vendor) {
                vendor.RoleString = '';
                angular.forEach(vendor.roles, function (role, key) {
                    vendor.RoleString += role.roleName ? role.roleName : '';
                    if (key != vendor.roles.length - 1) {
                        vendor.RoleString += ' , ';
                    }
                });
            });
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    function returnDateForEvent(dt, time) {
        //EventDate
        var eventdate = new Date(dt);
        eventdate = new Date(eventdate.toISOString());
        var date = eventdate.getDate();
        var month = eventdate.getMonth();
        var year = eventdate.getFullYear();
        time = new Date(time);
        time.setDate(date);
        time.setMonth(month);
        time.setYear(year);
        time = time.toISOString().split('.')[0];
        time = time + 'Z';
        return time;
    }
    //Create event with date and time
    $scope.AddEvent = function () {
        var ParticipantIds = [];
        angular.forEach($scope.participantsForEvent, function (item) { ParticipantIds.push({ "id": item.ParticipantId }); });
        var paramEvent = {
            "id": null,
            "claim": {
                "id": $scope.CommonObj.ClaimId
            },
            "createDate": null,
            "endTiming": returnDateForEvent($scope.CreateEventObject.EventDate, $scope.CreateEventObject.Endtime),//"2017-01-11T12:10:30Z"
            "isDone": false,
            "isReschedule": false,
            "item": {
                "id": null
            },
            "nativeEvent": {},
            "purpose": $scope.CreateEventObject.EventNote,
            "reScheduleEvents": null,
            "startTiming": returnDateForEvent($scope.CreateEventObject.EventDate, $scope.CreateEventObject.StartTime),//"2017-01-12T12:00:00Z".toISOString()
            "title": $scope.CreateEventObject.EventTitle,
            "participants": ParticipantIds,
            "organizer": {
                "id": sessionStorage.getItem("UserId")
            }
        };

        var EventPromise = AdjusterPropertyClaimDetailsService.CreateEvent(paramEvent);
        EventPromise.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            var paramClaimId = { "id": $scope.CommonObj.ClaimId };
            var EventListPromise = AdjusterPropertyClaimDetailsService.GetEventList(paramClaimId);
            EventListPromise.then(function (success) {
                $scope.EventList = success.data.data;
            }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    //Showing claim attachment details
    $scope.ClaimAttachmentDetails = function (attachment) {
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: "md",
                templateUrl: "views/Adjuster/ShowClaimAttachmentDetails.html",
                controller: "ShowClaimAttachmentController",
                backdrop: 'static',
                keyboard: false,

                resolve:
                {
                    /**
                     * @return {?}
                     */

                    items: function () {

                        return attachment
                    }
                }

            });
        out.result.then(function (value) {

            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }
    //Showing notes attachment details
    $scope.NotesAttachmentDetails = function (Attachment) {
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: "md",
                templateUrl: "views/Adjuster/ShowNoteAttachmentDetails.html",
                controller: "ShowNotesAttachmentController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    items: function () {

                        return Attachment;
                    }
                }

            });
        out.result.then(function (value) {

            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }

    //Get post lost items by category
    $scope.GetItemsByCategory = function (tab) {
        $scope.TempObj = [];
        var index_of_ALL = $scope.CommonObj.Categories.find((ele)=> ele==="ALL");
        if($scope.CommonObj.Categories.length >=0 && angular.isUndefined(index_of_ALL) )
        {
            $scope.CommonObj.Categories.map( (category_id)=>{
                angular.forEach($scope.FiletrLostDamageList, function (value) {
                if ($scope.CommonObj.Categories != null && value.category !== null) {
                    
                    if (value.category.id == category_id) {
                        $scope.TempObj.push(value);
                    }
                }
            });
            $scope.statusFilterItems = $scope.TempObj;
          });
        }
        else
        {
        $scope.CommonObj.Categories = ["ALL"];   
        $scope.statusFilterItems = $scope.FiletrLostDamageList; 
        }
        if ($scope.itemPageSize + ($scope.itemPageSize * ($scope.currentPage - 1)) < $scope.totalItems)
            $scope.toShowingPage = $scope.itemPageSize + ($scope.itemPageSize * ($scope.currentPage - 1));
        else
            $scope.toShowingPage = $scope.totalItems;
    }

    $scope.filterItemsByCategoryInAssignment = function (category) {
        $scope.TempObj = [];
        if(category.id != ""){
            $scope.searchVendorItem = angular.fromJson(category.id);
            if (!$scope.searchVendorItem
                || !$scope.searchVendorItem.categoryId) {
                $scope.VendorAssignmentList = $scope.ItemsSelectedForAssignments;
                if ($scope.SelectedVendorPostLossItem.length != $scope.VendorAssignmentList.length)
                    $scope.selectedAllVendorItem = false;
            }
            else {
                angular.forEach($scope.ItemsSelectedForAssignments, function (value) {
                    if ($scope.searchVendorItem.categoryId != null && value.category !== null) {
                        if (value.category.id == $scope.searchVendorItem.categoryId) {
                            $scope.TempObj.push(value);
                        }
                    }
                });
                $scope.VendorAssignmentList = $scope.TempObj;
            }
        }else{
            $scope.VendorAssignmentList = $scope.ItemsSelectedForAssignments;
            if ($scope.SelectedVendorPostLossItem.length != $scope.VendorAssignmentList.length)
                    $scope.selectedAllVendorItem = false;
        }
    }

    $scope.filterItemsInAssignmentBySearch = function (e) {
        $scope.VendorAssignmentList = $scope.ItemsSelectedForAssignments;
        if ($scope.searchContentAssign != null && $scope.searchContentAssign != '') {
            $scope.VendorAssignmentList = $filter('filter')($scope.VendorAssignmentList, $scope.searchContentAssign);
            if ($scope.SelectedVendorPostLossItem.length != $scope.VendorAssignmentList.length)
                $scope.selectedAllVendorItem = false;
        }
    }

    // init the filtered items
    $scope.getItemsByKeyword = function (tab) {
        $scope.statusFilterItems = $scope.FiletrLostDamageList;
        if ($scope.searchDamagedContent != null && $scope.searchDamagedContent != '') {
            $scope.statusFilterItems = $filter('filter')($scope.statusFilterItems, $scope.searchDamagedContent)
        }
        if ($scope.itemPageSize + ($scope.itemPageSize * ($scope.currentPage - 1)) < $scope.totalItems)
            $scope.toShowingPage = $scope.itemPageSize + ($scope.itemPageSize * ($scope.currentPage - 1));
        else
            $scope.toShowingPage = $scope.totalItems;
    };

    //Delete Items Form Damage Lost
    $scope.DeleteListLostDamageItem = [];
    $scope.DeleteAllItems = function () {
        $scope.DeleteListLostDamageItem = [];
        if ($scope.DeleteAll) {
            angular.forEach($scope.FiletrLostDamageList, function (item) {
                $scope.DeleteListLostDamageItem.push(item.itemId)
            });
        }
    }
    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };
    $scope.AddToDeleteList = function (item) {
        var idx = $scope.DeleteListLostDamageItem.indexOf(item);
        if (idx > -1) {
            $scope.DeleteAll = false;
            $scope.DeleteListLostDamageItem.splice(idx, 1);
        }
        else {
            $scope.DeleteListLostDamageItem.push(item);
        }
    }
    //Delete / Cancel Task
    $scope.DeletTask = function (task) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('ClaimTask_Delete.Title'),
            message: $translate.instant('ClaimTask_Delete.Message'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('ClaimTask_Delete.BtnYes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('ClaimTask_Delete.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    var formId = task.taskId;

                    var response = AdjusterPropertyClaimDetailsService.deleteClaimForm(formId);
                    response.then(function (success) {
                        GetPendingTaskList();

                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");


                    });
                }
            }
        });
    }
    $scope.CencelTask = function (task) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('ClaimTask_Cencel.Title'),
            message: $translate.instant('ClaimTask_Cencel.Message'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('ClaimTask_Cencel.BtnYes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('ClaimTask_Cencel.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    var param = {
                        "claimNumber": sessionStorage.getItem("ClaimNo"),
                        "formId": task.taskId,
                        "xOriginator": sessionStorage.getItem("speedCheckVendor")

                    };


                    var response = AdjusterPropertyClaimDetailsService.cancelClaimForm(param);
                    response.then(function (success) { //Filter list and remove item
                        GetPendingTaskList();


                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");


                    });
                }
            }
        });
    }
    // Assign to different. user
    $scope.ModalAssignAdjustor = function () {
        $scope.animationsEnabled = true;
        $scope.items = "Testing Pas Value";
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AdjusterReAssign.html",
                controller: "AdjusterReAssignController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    /**
                     * @return {?}
                     */

                    items: function () {
                        return "Testing Pas Value";
                    }
                }

            });
        out.result.then(function (value) {

            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }

    //Assigning post lost item to specialist
    $scope.AssignPostLostItem = function () {
        sessionStorage.setItem("SelectedItemList", $scope.SelectedPostLostItems);
        sessionStorage.setItem("AdjusterTaxRate", $scope.ClaimStatusContent.taxRate);
        $location.url('AssignPostLostItem')
    }
    $scope.AddnewItemPopup = function () {
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AddNewLostDamageItem.html",
                controller: "AddNewLostDamageItemController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    items: function () {
                        return "Testing Pas Value";
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }
    $scope.OpenAddNewVendorModel = function (e) {
        $scope.animationsEnabled = true;
        var ClaimObj = [];
        ClaimObj.push({ ClaimId: sessionStorage.getItem("ClaimId"), ClaimNumber: sessionStorage.getItem("ClaimNo") });
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: "lg",
                templateUrl: "views/Adjuster/AddNewVendor.html",
                controller: "AddNewVendorController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    ClaimObj: function () {
                        return ClaimObj;
                    }
                }

            });
        out.result.then(function (value) {
            getClaimParticipants();
        }, function () {
        });
        return {
            open: open
        };
    }

    $scope.getClaimParticipants = getClaimParticipants;
    function getClaimParticipants() {
        // get active participants against claim
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "policyNumber": $scope.CommonObj.PolicyNumber
        }
        var getpromise = AdjusterPropertyClaimDetailsService.getClaimParticipants(param);
        getpromise.then(function (success) {
            $scope.ClaimParticipantsList = success.data.data;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }
    //--Redirection------------------------//

    $scope.GotoNewServiceRequest = function () {
        sessionStorage.setItem("AdjusterClaimId", $scope.CommonObj.ClaimId)
        $location.url('AdjusterServiceRequest');
    }
    //Service requested
    $scope.GoToServiceRequestEdit = function (item) {
        if (item.serviceRequestId !== null && angular.isDefined(item.serviceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", item.serviceRequestId);
            sessionStorage.setItem("AdjusterClaimId", $scope.CommonObj.ClaimId);
            $location.url('AdjusterServiceRequestEdit');
        }
    }
    $scope.GotoAssign = function (item) {
        if (item.serviceRequestId !== null && angular.isDefined(item.serviceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", item.serviceRequestId);

            $location.url('AdjusterAssignServiceRequest');
        }
    }
    $scope.GotoItemStteled = function () {
        $location.url('ItemsSetteled');
    }
    $scope.GotoItemToBeStteled = function () {
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("ClaimNo", $scope.CommonObj.ClaimNumber);
        $location.url('ItemsToBeSetteled');
    }
    $scope.HoldoverDetails = function () {
        $location.url('ItemsHoldover');
    }
    $scope.GotoVendorInvoices = function () {
        sessionStorage.setItem("ClaimNo", $scope.CommonObj.ClaimNumber);
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        $location.url('VendorInvoices');
    }
    $scope.GoToDetails = function (item) {
        $(".page-spinner-bar").addClass("hide");
        sessionStorage.setItem("AdjusterPostLostItemId", item.id)
        let index = $scope.FiletrLostDamageList.findIndex(function (i) {
            return i.id === item.id;
        })
        sessionStorage.setItem("pageIndex", index + 1)
        $location.url('AdjusterLineItemDetails');
    }
    $scope.back = function () {
        sessionStorage.setItem("AdjusterClaimNo", "");
        sessionStorage.setItem("AdjusterClaimId", "");
        sessionStorage.setItem("SelectedItemList", "");
        sessionStorage.setItem("ShowEventActive", "");
        sessionStorage.setItem("ShowNoteActive", "");
        sessionStorage.removeItem("previousPage");
        sessionStorage.removeItem("postLostItems");
        LineItemsFactory.removeAll();
        //$window.history.back();
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
    $scope.GoToClaim = function () {
        $location.url('AdjusterPropertyClaimDetails');
    }
    $scope.ItemsToBeSetteled = function () {
        $location.url('ItemsToBeSetteled');
    }
    //--End Redirection--------------------//

    //---------------End Other functions-------------------------------------------//

    // -------Time picker--------------------------------

    /** @type {Date} */
    $scope.EventTime = new Date;
    /** @type {number} */
    $scope.hstep = 1;
    /** @type {number} */
    $scope.mstep = 15;
    $scope.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    /** @type {boolean} */
    $scope.ismeridian = true;
    /**
     * @return {undefined}
     */
    $scope.toggleMode = function () {
        /** @type {boolean} */
        $scope.ismeridian = !$scope.ismeridian;
    };
    /**
     * @return {undefined}
     */
    $scope.update = function () {
        /** @type {Date} */
        var d = new Date;
        d.setHours(14);
        d.setMinutes(0);
        /** @type {Date} */
        $scope.EventTime = d;
    };
    /**
     * @return {undefined}
     */
    $scope.changed = function () {
    };
    $scope.changed1 = function () {
    };
    /**
     * @return {undefined}
     */
    $scope.clear = function () {
        /** @type {null} */
        $scope.EventTime = null;
    };

    //--------End Time Picker-------------------------------------------------------------

    //--------Auto complete extender to search and participant------------------------------
    $scope.participantsForEvent = [];
    //select particiapnt
    $scope.afterSelectedParticipant = function (selected) {
        if (selected) {
            $scope.participantsForEvent.push({
                "ParticipantId": selected.originalObject.id,
                "ParticipantName": selected.originalObject.firstName + " " + selected.originalObject.lastName
            });
        }
    };
    $scope.ParticipantName = "";    //select particiapnt
    $scope.GetNoteParticipant = function (selected) {
        if (selected) {
            $scope.ParticipantName = selected.originalObject.firstName + " " + selected.originalObject.lastName
        }
    };
    // search function to match full text
    $scope.localSearch = function (str) {
        var matches = [];
        $scope.ClaimParticipantsList.forEach(function (person) {
            var fullName = person.firstName + ' ' + person.lastName;
            if ((person.firstName.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) ||
                (person.lastName.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) ||
                (fullName.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0)) {
                matches.push(person);
            }
        });
        return matches;
    };
    //------File Upload----------------------------------------------------

    // Variables for file upload
    $scope.fileName = '';
    $scope.FileExtension = '';
    $scope.FileType = '';
    $scope.files = [];
    $scope.ClaimfileName = '';
    $scope.ClaimFileExtension = '';
    $scope.ClaimFileType = '';
    $scope.Claimfiles = [];

    //for note attachment
    $scope.SelectNoteFile = function () {
        angular.element('#NoteFileUpload').trigger('click');
    }
    //Get note attachment details
    $scope.getNoteFileDetails = function (e) {
        $scope.$apply(function () {
            $scope.fileName = e.files[0].name;
            $scope.FileType = e.files[0].type
            $scope.FileExtension = $scope.fileName.substr($scope.fileName.lastIndexOf('.'))
            $scope.files.push(e.files[0]);
            let fr = new FileReader();
            fr.readAsDataURL(e.files[0]);
        });
    };
    //Add note with attachment against claim
    $scope.NoteParticipantName = "";
    $scope.AddNote = function (e) {
        var data = new FormData();
        data.append("mediaFilesDetail", JSON.stringify([{ "fileName": $scope.fileName, "fileType": $scope.FileType, "extension": $scope.FileExtension, "filePurpose": "NOTE", "latitude": null, "longitude": null }]))
        data.append("noteDetail", JSON.stringify({ "claimId": $scope.CommonObj.ClaimId, "senderName": $scope.ParticipantName, "addedBy": "CORPORATE USER", "addedById": sessionStorage.getItem("UserId"), "message": $scope.CommonObj.claimNote }))
        if ($scope.files[0] !== null) {
            data.append("file", $scope.files[0]);
        } else {
            data.append("file", null);
        }
        var getpromise = AdjusterPropertyClaimDetailsService.addClaimNoteWithOptionalAttachment(data);
        getpromise.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.CommonObj.claimNote = "";
                angular.element("input[type='file']").val(null);
                $scope.fileName = '';
                $scope.FileType = '';
                $scope.FileExtension = '';
                //after adding new note updating note list
                $scope.getMessages();
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }


    //get claim attachment details
    $scope.getClaimFileDetails = function (e) {
        $scope.displayClaimFileName = true;
        $scope.displayAddAttachmentbtn = false;
        $scope.$apply(function () {
            $scope.ClaimfileName = e.files[0].name;
            $scope.ClaimFileType = e.files[0].type
            $scope.ClaimFileExtension = $scope.ClaimfileName.substr($scope.ClaimfileName.lastIndexOf('.'))
            $scope.Claimfiles.push(e.files[0]);
            let fr = new FileReader();
            fr.readAsDataURL(e.files[0]);
        });
        if ($scope.Claimfiles.length > 0)
            $scope.AddClaimAttachment();
    }

    //------------------Post lost item------------------------------------------------------
    $scope.AddNewItem = false;
    $scope.EditItem = false;
    $scope.GetSubCategory = GetSubCategory;
    function GetSubCategory() {
        if ($scope.selected.category != null && angular.isDefined($scope.selected.category)) {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "categoryId": $scope.selected.category.id
            };
            GetCatagoryLimit($scope.selected.category.id);
            var respGetSubCategory = AdjusterPropertyClaimDetailsService.getSubCategory(param);
            respGetSubCategory.then(function (success) {
                $scope.SubCategory = success.data.data;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.SubCategory = null; $scope.ErrorMessage = error.data.errorMessage
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }
    $scope.GetCatagoryLimit = GetCatagoryLimit;
    function GetCatagoryLimit(id) {
        var count = 0;
        angular.forEach($scope.PolicyDetails.categories, function (item) {
            if (item.id == id) {
                count++
                $scope.selected.category.aggregateLimit = (item.coverageLimit == null ? 0 : item.coverageLimit);
            }
        })
        if (count == 0) {
            $scope.selected.category.aggregateLimit = 0
        }
    }

    $scope.GetCategory = GetCategory;
    function GetCategory() {
        var getpromise = AdjusterPropertyClaimDetailsService.getCategories();
        getpromise.then(function (success) {
            $scope.DdlSourceCategoryList = success.data.data;
            if ($scope.CommonObj.ClaimProfile == 'Jewelry') {
                var jewelryCategory = angular.copy($scope.DdlSourceCategoryList.filter(function (category) {
                    return category.categoryName.toLowerCase() === "jewelry";
                })[0]);
                sessionStorage.setItem("CurrentCategoryJewelryId", jewelryCategory.categoryId);
                $scope.selected = {
                    isScheduledItem: false,
                    category: {
                        id: jewelryCategory.categoryId,
                        aggregateLimit: null,
                        individualLimitAmount: 0
                    },
                };
                var count = 0;
                angular.forEach($scope.PolicyDetails.categories, function (item) {
                    if (item.id == $scope.selected.category.id) {
                        count++;
                        $scope.selected.category.aggregateLimit = (item.coverageLimit == null ? 0 : item.coverageLimit);
                    }
                })
                if (count == 0) {
                    $scope.selected.category.aggregateLimit = 0;
                }
                sessionStorage.setItem("CurrentCategoryJewelryCoverageLimit", $scope.selected.category.aggregateLimit)
            }
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    $scope.AddEditItem = AddEditItem;
    function AddEditItem(item, operation) {
        if ($scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry") {
            sessionStorage.setItem("IndividualLimitJewelryCat", (($scope.PolicyDetails.claimIndividualLimit != null && $scope.PolicyDetails.claimIndividualLimit != "") ? $scope.PolicyDetails.claimIndividualLimit : 0))
        }
        $scope.animationsEnabled = true;
        $scope.CommonObj.individualLimit=$scope.ClaimStatusContent.individualLimit;
        var data = {
            "CommonObj": angular.copy($scope.CommonObj),
            "PolicyDetails": angular.copy($scope.PolicyDetails),
            "Category": angular.copy($scope.DdlSourceCategoryList),
            "isEditItem": operation === 'EDIT' ? true : false,
            "Item": operation === 'EDIT' ? item : null,
            "ShippingMethods": angular.copy($scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry" ? $scope.shippingMethodsList : null),
            "applyTax": $scope.ClaimStatusContent.applyTax            
        }
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: 'lg',
                templateUrl: "views/CommonTemplates/AddItemPopup.html",
                controller: "AddItemPopupController",
                backdrop: 'static',
                keyboard: false,
                transclude: false,
                resolve:
                {
                    objData: function () {
                        return data;
                    }
                }
            });
        out.result.then(
            function (value) {
                //Call Back Function success
                getClaimsStatusContentDetails();
                $scope.FiletrLostDamageList = LineItemsFactory.getItemsList().originalItemsList;
                $scope.statusFilterItems = $scope.FiletrLostDamageList;
                $scope.statusBasedFilter($scope.FiletrLostDamageList);
                // $scope.getLineItems();
                // removePostLostItems($scope.constants.itemStatus.underReview);
                mapFilterLostDamageList({
                    claimNumber: $scope.CommonObj.ClaimNumber,
                });

                // Refresh Main Page data if data updated in popup
                debugger;
                // if(value =="Added" || value =="Updated"){
                    if($scope.CommonObj.ClaimProfile.toLowerCase()!="jewelry")
                        calculateSettlement(); 
                    else
                        GetPostLostItems();
                // }
            },
            function (res) {
                //Call Back Function close
            }
        );
        return {
            open: open,
        };
    }
    $scope.CancelAddNewItem = CancelAddNewItem;
    function CancelAddNewItem() {
        $scope.AddNewItem = false;
    }
    // $scope.getTemplate = function (item) {
    //     return 'display';
    // };
    $scope.reset = function () {
        if ($scope.CommonObj.ClaimProfile == 'Jewelry') {
            $scope.AddItemForm.$setUntouched();
            $scope.AddItemForm.$setPristine();
        }
        else {
            $scope.AddContentsItemForm.$setUntouched();
            $scope.AddContentsItemForm.$setPristine();
        }
        $scope.AddNewItem = false;
        $scope.EditItem = false;
        $scope.ItemFiles = [];
        $scope.EditItemFiles = [];
        if ($scope.CommonObj.ClaimProfile == 'Jewelry') {
            $scope.selected = {
                isScheduledItem: false,
                category: {
                    id: parseInt(sessionStorage.getItem("CurrentCategoryJewelryId")),
                    aggregateLimit: parseInt(sessionStorage.getItem("CurrentCategoryJewelryCoverageLimit"))
                },
            };
            $scope.GetSubCategory();
        }
        else {
            $scope.selected = { isScheduledItem: false };
        }
        $scope.addOtherRetailer = false;
    };
    //Lost Damage Items
    $scope.DeletItem = DeletItem;
    function DeletItem(obj) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('Confirm.DeleteItemTitle'),
            message: $translate.instant('Confirm.DeleteItemMessage'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('Confirm.BtnYes'),
                    className: 'btn-outline green'
                },
                cancel: {
                    label: $translate.instant('Confirm.BtnNo'),
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                if (result) {
                    var param = {
                        "id": obj.id,
                        "itemUID": obj.itemUID
                    }
                    var response = AdjusterPropertyClaimDetailsService.DeleteLostDamageItem(param);
                    response.then(function (success) { //Filter list and remove item
                        toastr.remove();
                        toastr.success(success.data.message, "Confirmation");
                        var index = $scope.statusFilterItems.indexOf(obj);
                        if (index > -1) {
                            $scope.statusFilterItems.splice(index, 1);
                        }
                        LineItemsFactory.removeItemFromList(obj);
                        $scope.totalItems = $scope.ClaimStatusContent.itemsClaimed = LineItemsFactory.countOfItems();
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });
                }
            }
        });
    }
    //For reset Item List Selection
    $scope.resetItemListSelection = resetItemListSelection;
    function resetItemListSelection() {
        $scope.selectedAll = false;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            item.Selected = false;
        });
        $scope.SelectedPostLostItems = [];
        itemCategoryIds = [];
        $scope.creaAssignmentFlag = false;
        $scope.CommonObj.isAssignmentDone = false;
    }
    //For claim line item
    $scope.lastChecked = [];
    $scope.SelectMultiple = function($event,$index)
    { 
        var keyname = $scope.sortKey;
        if(keyname === undefined)
        {
            var filterlist = $scope.statusFilterItems;
        }
        else
        {
            filterlist = $filter('orderBy')($scope.statusFilterItems,$scope.sortKey, $scope.reverse);    
        }
      

       if($scope.lastChecked[$scope.lastChecked.length-1]!=null && $event.shiftKey)
       {  
        if($scope.lastChecked[$scope.lastChecked.length-1] <= $index)
        {      
            for(i=$scope.lastChecked[$scope.lastChecked.length-1]+1; i<=$index;i++)
            {
                item = filterlist[i];
                itemindex = $scope.statusFilterItems.indexOf(item);
                // if(
                //     // !(item.status.id === 4 && item.status.status === $scope.constants.itemStatus.valued) &&
                // !(item.status.id === 6 && item.status.status === $scope.constants.itemStatus.settled) &&
                // !(item.status.id === 2 && item.status.status === $scope.constants.itemStatus.assigned))                
                // {
                $scope.statusFilterItems[itemindex].Selected = true;
                // }
                $scope.SelectPostLostItem($scope.statusFilterItems[itemindex]);
            }
        }
        else if($scope.lastChecked[$scope.lastChecked.length-1] > $index)
        {
            for(i=$scope.lastChecked[$scope.lastChecked.length-1]-1;i>=$index;i--)
            {
                item = filterlist[i];
                itemindex = $scope.statusFilterItems.indexOf(item);
                // if(
                //     // !(item.status.id === 4 && item.status.status === $scope.constants.itemStatus.valued) &&
                // !(item.status.id === 6 && item.status.status === $scope.constants.itemStatus.settled) &&
                // !(item.status.id === 2 && item.status.status === $scope.constants.itemStatus.assigned))
                // {
                $scope.statusFilterItems[itemindex].Selected = true;
                // }
                $scope.SelectPostLostItem($scope.statusFilterItems[itemindex]);
            }
        }
       }
       else
       {
        if($scope.lastChecked[$scope.lastChecked.length-1] === $index && $scope.statusFilterItems[$index].Selected === false)
        {
                $scope.lastChecked.pop();
        }else
        {
            $scope.lastChecked.push($index);
        }
        item = filterlist[$index];
        itemindex = $scope.FiletrLostDamageList.indexOf(item);
        $scope.SelectPostLostItem($scope.FiletrLostDamageList[itemindex]);
       }
    }

    $scope.canPay = false;
    $scope.mapReceiptsFlag = false;
    $scope.SelectPostLostItem = function (item) {
        var flag = 0;
        var valuedCnt = 0;
        var valueAndPaidCount = 0;
        $scope.creaAssignmentFlag = true;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                flag++;
                if (item.status && (item.status.id == 4 || item.status.status === $scope.constants.itemStatus.valued))
                    valuedCnt++;
                if (item.status && (item.status.id == 4 || item.status.status === $scope.constants.itemStatus.valued) &&
                    (item.status.id == 8 || item.status.status === $scope.constants.itemStatus.paid)) {
                    valueAndPaidCount++;
                }
            }
        });
        if (flag != 0 && flag == valuedCnt)
            $scope.canPay = true;
        else
            $scope.canPay = false;

        if (valueAndPaidCount > 0) {
            $scope.mapReceiptsFlag = true;
        } else {
            $scope.mapReceiptsFlag = false;
        }
        var flagNew = 0;
        var flagOldSelected = false;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (angular.isDefined(item.status) && item.status != null) {
                if ((item.status.id != 2 || item.status.status != $scope.constants.itemStatus.assigned) &&
                    (item.status.id != 4 || item.status.status != $scope.constants.itemStatus.valued) &&
                    (item.status.id != 5 || item.status.status != $scope.constants.itemStatus.approved) &&
                    (item.status.id != 6 || item.status.status != $scope.constants.itemStatus.settled) &&
                    (item.status.id != 7 || item.status.status != $scope.constants.itemStatus.replaced) &&
                    (item.status.id != 8 || item.status.status != $scope.constants.itemStatus.workInProgress)) {
                    flagNew++;
                } else {
                    if (item.Selected) {
                        flagOldSelected = true;
                    }
                }
            }
        });
        if (flagOldSelected) {
            $scope.creaAssignmentFlag = false;
        }
        $scope.selectedAll = false;
        if (flag > 0 && flagNew > 0 && flag == flagNew) {
            $scope.selectedAll = true;
        }
        var index = $scope.SelectedPostLostItems.indexOf(item.id);
        if (index > -1) {
            $scope.SelectedPostLostItems.splice(index, 1);
            // // remove category from category
            // if (item.category) {
            //     var removeIndex = itemCategoryIds.indexOf(item.category.id);
            //     itemCategoryIds.splice(removeIndex, 1);
            // }
        }
        else {
            if (item.Selected) {
                $scope.SelectedPostLostItems.push(item.id);
            }
            // if (item.category)
            //     itemCategoryIds.push(item.category.id);
        }
        if ($scope.SelectedPostLostItems.length == 0) {
            $scope.creaAssignmentFlag = false;
        }
        $scope.selectedItemIsUnderReview = false;
        var flagunderReview = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                if (item.status && (item.status.id == 3 || item.status.status === $scope.constants.itemStatus.underReview)) {
                    flagunderReview++;
                }
            }
        });
        if (flagunderReview > 0) {
            $scope.selectedItemIsUnderReview = true;
        }
        else {
            $scope.selectedItemIsUnderReview = false;
        }
    };
    $scope.selectedAll = false;
    $scope.checkAll = function (statusFilterItems) {
        $scope.SelectedPostLostItems = [];
        var valuedCnt = 0;
        var mapReceiptsCount = 0;
        if ($scope.selectedAll) {
            // $scope.selectedAll = true;
            /* Item status with ASSIGNED, APPROVED, SETTLED, $scope.constants.itemStatus should not be included
               Only Item status with CREATED, UNDER REVIEW , $scope.constants.itemStatus included for create assignment
            */
            angular.forEach(statusFilterItems, function (item) {
                if ((item.status.id != 2 || item.status.status != $scope.constants.itemStatus.assigned) &&
                    // (item.status.id != 4 || item.status.status != $scope.constants.itemStatus.valued) &&
                    (item.status.id != 5 || item.status.status != $scope.constants.itemStatus.approved) &&
                    (item.status.id != 6 || item.status.status != $scope.constants.itemStatus.settled) &&
                    (item.status.id != 7 || item.status.status != $scope.constants.itemStatus.replaced) &&
                    (item.status.id != 8 || item.status.status != $scope.constants.itemStatus.workInProgress)) {
                    $scope.SelectedPostLostItems.push(item.id);
                    // if (item.category)
                    //     itemCategoryIds.push(item.category.id);
                }
                if ((item.status.id == 4 || item.status.status == $scope.constants.itemStatus.valued))
                    valuedCnt++;
                if ((item.status.id == 4 || item.status.status === $scope.constants.itemStatus.valued) &&
                    (item.status.id == 8 || item.status.status == $scope.constants.itemStatus.paid)) {
                    mapReceiptsCount++;
                }
            });
            if ($scope.FiletrLostDamageList.length == valuedCnt)
                $scope.canPay = true;
            else
                $scope.canPay = false;

            if (mapReceiptsCount > 0)
                $scope.mapReceiptsFlag = true;
            else
                $scope.mapReceiptsFlag = false;

        } else {
            $scope.selectedAll = false;
            $scope.SelectedPostLostItems = [];
            itemCategoryIds = [];
            $scope.canPay = false;
            $scope.mapReceiptsFlag = false;
        }
        angular.forEach(statusFilterItems, function (item) {
            if ((item.status.id != 2 || item.status.status != $scope.constants.itemStatus.assigned) &&
                // (item.status.id != 4 || item.status.status != $scope.constants.itemStatus.valued) &&
                (item.status.id != 5 || item.status.status != $scope.constants.itemStatus.approved) &&
                (item.status.id != 6 || item.status.status != $scope.constants.itemStatus.settled) &&
                (item.status.id != 7 || item.status.status != $scope.constants.itemStatus.replaced) &&
                (item.status.id != 8 || item.status.status != $scope.constants.itemStatus.workInProgress)) {
                item.Selected = $scope.selectedAll;
            }
        });
        // Enable Create Assignment Button
        var flagVendor = 0;
        if ($scope.SelectedPostLostItems && $scope.SelectedPostLostItems.length > 0) {
            angular.forEach($scope.SelectedPostLostItems, function (item) {
                var dataItem = statusFilterItems.filter(function (filetrLostDamageItem) {
                    return filetrLostDamageItem.id == item
                });
                if (dataItem[0].vendorName != null && dataItem[0].vendorName != "") {
                    flagVendor++;
                }
            });
            if (flagVendor > 0) {
                $scope.creaAssignmentFlag = false;
            }
            else {
                $scope.creaAssignmentFlag = true;
            }
        } else {
            $scope.creaAssignmentFlag = false;
        }

    };
    //End code for claim line item selection

    //For Vendor Item Assignment -Item Selection and category selection
    $scope.GoToVendorAssignment = GoToVendorAssignment;
    function GoToVendorAssignment() {
        if ($scope.SelectedPostLostItems.length > 0) {
            $scope.VendorAssignmentList = []; $scope.SelectedVendorPostLossItem = [];
            angular.forEach($scope.SelectedPostLostItems, function (selected) {
                //var lostItem = $scope.FiletrLostDamageList.find(FiletrLostDamageItem => FiletrLostDamageItem.id === selected);
                var lostItem = $scope.FiletrLostDamageList.filter(function (filetrLostDamageItem) {
                    return filetrLostDamageItem.id == selected
                })[0];
                if (lostItem) {
                    lostItem.Selected = true;
                    $scope.VendorAssignmentList.push(lostItem);
                    $scope.SelectedVendorPostLossItem.push(lostItem.itemUID);
                }
            });
            $scope.ItemsSelectedForAssignments = angular.copy($scope.VendorAssignmentList);
            $scope.selectedAllVendorItem = true;
            $scope.tab = 'Vendor Assignments';
            //$scope.IscheckedParticipant = false;
            $scope.ContentServiceList = [];
            $scope.ServiceTypeDiv = "";
            $scope.ShowAssignments = true;
            $scope.ShowAssignmentsList = false;
            $scope.ShowAssignmentDetails = false;
        }
        else {
            //$scope.GetVendorsList();
            $scope.selectedAllVendorItem = false;
            $scope.VendorAssignmentList = angular.copy($scope.FiletrLostDamageList);
            $scope.tab = 'Vendor Assignments';
            //$scope.IscheckedParticipant = false;
            $scope.ContentServiceList = [];
            $scope.ShowAssignments = true;
            $scope.ShowAssignmentsList = false;
        }
        $rootScope.AssignmentRemark = "";
        GetStates();
        $scope.SelectCategory();
        GetVendorsList();
    }
    $scope.GoToClaimDetailsFromItemPage = GoToClaimDetailsFromItemPage;
    function GoToClaimDetailsFromItemPage() {
        if ($scope.SelectedPostLostItems.length > 0) {
            $scope.VendorAssignmentList = [];
            angular.forEach($scope.SelectedPostLostItems, function (selected) {
                angular.forEach($scope.FiletrLostDamageList, function (item) {
                    if (selected == item.id) {
                        item.Selected = true;
                        $scope.VendorAssignmentList.push(item);
                        $scope.SelectedVendorPostLossItem.push(item.itemUID);
                    }
                });
            });
            $scope.selectedAllVendorItem = true;
        }
        else {
            $scope.selectedAllVendorItem = false;
            $scope.VendorAssignmentList = angular.copy($scope.FiletrLostDamageList);
            $scope.SelectedVendorPostLossItem = [];
        }
        sessionStorage.setItem("ItemsList", JSON.stringify($scope.VendorAssignmentList));
        sessionStorage.setItem("SelectedItemsList", JSON.stringify($scope.SelectedVendorPostLossItem));
        sessionStorage.setItem("ItemsStatus", $scope.selectedAllVendorItem);
        sessionStorage.setItem("ActiveVendorAssignment", true);
        sessionStorage.setItem("ShowEventActive", "");
        sessionStorage.setItem("ShowNoteActive", "");
        $location.url('AdjusterPropertyClaimDetails');
    }
    $scope.SelectedVendorPostLossItem = [];
    $scope.SelectVendorPostLostItem = function (item) {
        var flag = $scope.VendorAssignmentList.filter(i => i.selected).length;
        var flagNew = 0;
        angular.forEach($scope.VendorAssignmentList, function (vaItem) {
            if (vaItem.status) {
                if ((vaItem.status.id != 2 || vaItem.status.status != $scope.constants.itemStatus.assigned) &&
                    (vaItem.status.id != 4 || vaItem.status.status != $scope.constants.itemStatus.valued) &&
                    (vaItem.status.id != 5 || vaItem.status.status != $scope.constants.itemStatus.approved) &&
                    (vaItem.status.id != 6 || vaItem.status.status != $scope.constants.itemStatus.settled) &&
                    (vaItem.status.id != 7 || vaItem.status.status != $scope.constants.itemStatus.replaced) &&
                    (vaItem.status.id != 8 || vaItem.status.status != $scope.constants.itemStatus.workInProgress)) {
                    flagNew++;
                }
            }
        });
        if (flag != flagNew) {
            $scope.selectedAllVendorItem = false;
        }
        else if (flag == flagNew) {
            $scope.selectedAllVendorItem = true;
        }
        var index = $scope.SelectedVendorPostLossItem.indexOf(item.itemUID);
        // Remove from list
        if (index > -1) {
            var itemsOfSimilarCategory = 0;
            $scope.SelectedVendorPostLossItem.splice(index, 1);
            angular.forEach($scope.ItemsSelectedForAssignments, function (itemInList) {
                angular.forEach($scope.SelectedVendorPostLossItem, function (itemUID) {
                    if (itemInList.itemUID === itemUID && (item.category && itemInList.category ? itemInList.category.id === item.category.id : true))
                        itemsOfSimilarCategory++;
                });
            });
            if (itemsOfSimilarCategory == 0 && item.category) {
                var selectedCategoryIndex = $scope.SelectedCategories.findIndex(originalList => originalList.name === item.category.name);
                if (selectedCategoryIndex > -1)
                    $scope.SelectedCategories.splice(index, 1);
            }
            // // remove category from category filter
            // var filterIndex = item.category ? itemCategoryIds.indexOf(item.category.id) : -1;
            // if (filterIndex > -1)
            //     itemCategoryIds.splice(filterIndex, 1);
        }
        // Add to list
        else {
            $scope.SelectedVendorPostLossItem.push(item.itemUID);
            // Get list of vendors filtering based on selected item categories
            index = item.category ? $scope.SelectedCategories.findIndex(originalList => originalList.name === item.category.name) : 0;
            if (index <= -1) {
                $scope.SelectedCategories.push({
                    id: item.category.id,
                    name: item.category.name
                });
                // // push category item category List
                // itemCategoryIds.push(item.category.id)
            }
        }
        if ($scope.VendorAssignmentList.length === $scope.ItemsSelectedForAssignments.length)
            $scope.SelectCategory();
        else {
            $scope.TotalStatedValue = 0.00;
            angular.forEach($scope.ItemsSelectedForAssignments, function (itemSelected) {
                if (itemSelected.Selected) {
                    $scope.TotalStatedValue += itemSelected.totalStatedAmount;
                }
            });
        }
        GetVendorsList();
    };

    //to get selected categories of selected item
    $scope.SelectedCategories = [];
    $scope.SelectCategory = SelectCategory;
    function SelectCategory() {
        $scope.TotalStatedValue = 0.00;
        angular.forEach($scope.VendorAssignmentList, function (item) {
            if (item.Selected) {
                $scope.TotalStatedValue += item.totalStatedAmount;
            }
        })
        if ($scope.SelectedVendorPostLossItem.length > 0) {
            $scope.SelectedCategories = [];
            angular.forEach($scope.SelectedVendorPostLossItem, function (obj) {
                angular.forEach($scope.VendorAssignmentList, function (Origionalitem) {
                    if (Origionalitem.category != null && angular.isDefined(Origionalitem.category)) {
                        if (obj == Origionalitem.itemUID) {
                            var param =
                            {
                                id: Origionalitem.category.id,
                                name: Origionalitem.category.name
                            };
                            var count = 0
                            angular.forEach($scope.SelectedCategories, function (categories) {
                                if (categories.id == param.id) {
                                    count++;
                                }
                            })
                            if (count == 0) {
                                $scope.SelectedCategories.push(param)
                                count = 0;
                            }
                            else {
                                count = 0;
                            }
                        }
                    }
                });
            });
        }
        else {
            $scope.SelectedCategories = [];
        }
        itemCategoryIds = $scope.SelectedCategories.map(category => category.id);
    }

    $scope.selectedAllVendorItem = false;
    $scope.checkAllVendorItem = function () {
        $scope.SelectedVendorPostLossItem = [];
        $scope.selectedAllVendorItem = !$scope.selectedAllVendorItem;
        if ($scope.selectedAllVendorItem) {
            $scope.selectedAllVeSelectCategoryndorItem = true;
            angular.forEach($scope.VendorAssignmentList, function (item) {
                if ((item.status.id != 2 || item.status.status != $scope.constants.itemStatus.assigned) &&
                    (item.status.id != 4 || item.status.status != $scope.constants.itemStatus.valued) &&
                    (item.status.id != 5 || item.status.status != $scope.constants.itemStatus.approved) &&
                    (item.status.id != 6 || item.status.status != $scope.constants.itemStatus.settled) &&
                    (item.status.id != 7 || item.status.status != $scope.constants.itemStatus.replaced) &&
                    (item.status.id != 8 || item.status.status != $scope.constants.itemStatus.workInProgress)) {
                    $scope.SelectedVendorPostLossItem.push(item.itemUID);
                    // if (item.category)
                    //     itemCategoryIds.push(item.category.id);
                }
            });
        } else {
            $scope.selectedAllVendorItem = false;
            $scope.SelectedVendorPostLossItem = [];
            itemCategoryIds = [];
        }
        angular.forEach($scope.VendorAssignmentList, function (item) {
            if ((item.status.id != 2 || item.status.status != $scope.constants.itemStatus.assigned) &&
                (item.status.id != 4 || item.status.status != $scope.constants.itemStatus.valued) &&
                (item.status.id != 5 || item.status.status != $scope.constants.itemStatus.approved) &&
                (item.status.id != 6 || item.status.status != $scope.constants.itemStatus.settled) &&
                (item.status.id != 7 || item.status.status != $scope.constants.itemStatus.replaced) &&
                (item.status.id != 8 || item.status.status != $scope.constants.itemStatus.workInProgress)) {
                item.Selected = $scope.selectedAllVendorItem;
            }
        });

        angular.forEach($scope.ItemsSelectedForAssignments, function (item) {
            if ((item.status.id != 2 || item.status.status != $scope.constants.itemStatus.assigned) &&
                (item.status.id != 4 || item.status.status != $scope.constants.itemStatus.valued) &&
                (item.status.id != 5 || item.status.status != $scope.constants.itemStatus.approved) &&
                (item.status.id != 6 || item.status.status != $scope.constants.itemStatus.settled) &&
                (item.status.id != 7 || item.status.status != $scope.constants.itemStatus.replaced) &&
                (item.status.id != 8 || item.status.status != $scope.constants.itemStatus.workInProgress)) {
                item.Selected = $scope.selectedAllVendorItem;
            }
        });
        $scope.SelectCategory();
        GetVendorsList();
    };


    //-------End Inline editing for post lost item-------------------------------------//
    //Claim Form functionlity
    // Create task list to cretae pending task
    $scope.dynamicPopover = {
        isOpen: false,
        html: true,
        templateUrl: "myPopoverTemplate.html",
        open: function open() {
            $scope.dynamicPopover.isOpen = true;
        },
        close: function close() {
            $scope.dynamicPopover.isOpen = false;

        }
    };
    $scope.CreatePendingTasksObjList = [];
    $scope.StoreTaskObject = StoreTaskObject;
    function StoreTaskObject(taskSet) {
        $scope.CreatePendingTasksObjList = [];
        $scope.CreatePendingTasksObjList.push({
            "taskId": taskSet.taskId,
            "comment": taskSet.comment
        });
    }
    //Create Pending task against claim
    $scope.CreatePendingtask = CreatePendingtask;
    function CreatePendingtask() {
        var param = {
            "claimId": $scope.CommonObj.ClaimId,
            claimPendingTasks: $scope.CreatePendingTasksObjList
        };
        // $scope.dynamicPopover.close();
        var CreateTask = AdjusterPropertyClaimDetailsService.CreatePendingtask(param);
        CreateTask.then(function (success) {
            $scope.dynamicPopover.close(); toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    //End Task

    //Add Note popup
    $scope.AddNotePopup = AddNotePopup;
    function AddNotePopup(message, operation) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ParticipantList": $scope.ClaimParticipantsList.filter(function (cp) {
                if (cp.emailId != $scope.CommonObj.UserName)
                    return cp;
            }),
            "subject": message,
            "defaultRecepients": $scope.defaultRecepients && $scope.defaultRecepients.length > 0 ? $scope.defaultRecepients : null
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/CommonTemplates/AddNotePopup.html",
                controller: "AddNotePopupController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }
            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                if (operation)
                    supervisorReview(operation);
                $scope.claimMessages = [];
                $scope.getMessages();
            }
            if (value === "Cancel") {
                $scope.defaultRecepients = [];
            }
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
        // }
    }
    //End add note popup
    //Add Event Popup

    $scope.AddEventPopup = AddEventPopup;
    function AddEventPopup(ev) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList
        };
        $scope.animationsEnabled = true;

        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AddEventPopup.html",
                controller: "AddEventPopupController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                $scope.GetEventList();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
        //}

    }
    //End Event popup
    $scope.AddRequestPopup = AddRequestPopup;
    function AddRequestPopup(ev) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList
        };
        $scope.animationsEnabled = true;

        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AddRequestPopup.html",
                controller: "AddRequestPopupController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }
            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                $scope.getRequestList();
            }
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }
    $scope.GotoReceiptMapperHome = GotoReceiptMapperHome;
    function GotoReceiptMapperHome() {
        if ((angular.isDefined($scope.CommonObj.ClaimNumber) && $scope.CommonObj.ClaimNumber !== null && $scope.CommonObj.ClaimNumber !== "") &&
            (angular.isDefined($scope.CommonObj.ClaimId) && $scope.CommonObj.ClaimId !== null && $scope.CommonObj.ClaimId !== "")) {
            sessionStorage.setItem("ClaimNoForReceipt", $scope.CommonObj.ClaimNumber);
            sessionStorage.setItem("ClaimIdForReceipt", $scope.CommonObj.ClaimId);
            $location.url('ReceiptMapperHome');
        }
    }
    //Servcie request
    //Delete service request
    $scope.Deleteservicerequest = Deleteservicerequest;
    function Deleteservicerequest(service) {
        bootbox.confirm({
            title: $translate.instant("AlertMessage.Update"),
            closeButton: false,
            className: "modalcustom",
            message: $translate.instant("AlertMessage.ConfirmDelete"),
            buttons: {
                confirm: {
                    label: $translate.instant("AlertMessage.YesBtn"),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant("AlertMessage.NoBtn"),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    var paramDelete = {
                        "serviceId": service.serviceRequestId
                    };
                    var Deleteservice = AdjusterPropertyClaimDetailsService.DeleteServiceRequest(paramDelete);
                    Deleteservice.then(function (success) {
                        if (success.data.status === 200) {
                            getServiceRequestList();
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                        }
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");

                    });
                }
            }
        });
    }
    //Upload post loss item from file
    $scope.UploadPostLossItem = function () {
        if ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber)) {
            sessionStorage.setItem("UploadClaimNo", $scope.CommonObj.ClaimNumber);
            sessionStorage.setItem("applyTax",$scope.PolicyDetails.applyTax);
            $location.url('UploadItemsFromCSV')
        }
    };
    //Get Claim Form Task
    function GetPendingTaskList() {
        var paramUserTaskListList = {
            "claimId": $scope.CommonObj.ClaimId
        };
        var GetPendingTaskPromise = AdjusterPropertyClaimDetailsService.GetPendingTask(paramUserTaskListList);
        GetPendingTaskPromise.then(function (success) {

            $scope.PendingTaskList = success.data.data;

        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    //Create new ClaimTash (Claim Form)
    $scope.AddClaimForm = AddClaimForm;
    function AddClaimForm() {
        var obj = {
            "ClaimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "PolicyType": $scope.PolicyDetails.policyType
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/NewClaimFormPopup.html",
                controller: "NewClaimFormPopupController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                GetPendingTaskList();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }
    $scope.ShowClaimFormAttachments = ShowClaimFormAttachments;
    function ShowClaimFormAttachments(item) {
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/ClaimFormDetails/ClaimFormDetails.html",
                controller: "ClaimFormDetailsController",
                backdrop: 'static',
                keyboard: false
            });
        out.result.then(function (value) {
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }
    //Goto Report
    $scope.GoToReport = GoToReport;
    function GoToReport() {
        sessionStorage.setItem("ReportClaimNo", $scope.CommonObj.ClaimNumber);
        $location.url('Report');
    }
    //Get event details
    $scope.GetEventDetails = function (event) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList,
            "event": angular.copy(event)
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/EventDetails.html",
                controller: "EventDetailsController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                $scope.GetEventList();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    };

    $scope.GetRequestDetails = function (request) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList,
            "request": angular.copy(request)
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/RequestDetails.html",
                controller: "RequestDetailsController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                $scope.getRequestList();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    };
    $scope.GotoAllEvents = GotoAllEvents;
    function GotoAllEvents() {
        var ClaimObj = {
            "IsClaimEvent": true,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ClaimId": $scope.CommonObj.ClaimId
        }
        sessionStorage.setItem("ClaimObj", JSON.stringify(ClaimObj));
        $location.url("AllEvents");
    }
    $scope.GotoAllRequests = GotoAllRequests;
    function GotoAllRequests() {
        var ClaimObj = {
            "IsClaimEvent": true,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ClaimId": $scope.CommonObj.ClaimId
        }
        sessionStorage.setItem("ClaimObj", JSON.stringify(ClaimObj));
        $location.url("AllRequests");
    }
    $scope.GotoAllNotes = GotoAllNotes;
    function GotoAllNotes(message) {
        if (($scope.CommonObj.ClaimId !== null && angular.isDefined($scope.CommonObj.ClaimId)) && ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber))) {
            sessionStorage.setItem("AllNoteClaimId", $scope.CommonObj.ClaimId);
            sessionStorage.setItem("AllNoteClaimNumber", $scope.CommonObj.ClaimNumber);
            if (message){
                sessionStorage.setItem("selectedMessageGrp", JSON.stringify({ groupId: message.noteGroupId }));
            }
            sessionStorage.removeItem("messageGrpId");

                $location.url('AllNotes');
        }
    }
    //For note details
    $scope.GetNoteDetails = function (item) {
        var obj = {
            "Note": angular.copy(item),
            "ParticipantList": $scope.ClaimParticipantsList,
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/AllNotes/NoteDetails.html",
                controller: "NoteDetailsController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    NoteObj: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            $scope.getMessages();
        }, function (res) {

        });
        return {
            open: open
        };
    };

    $scope.GoToMapping = GoToMapping;
    function GoToMapping(attachment) {
        var obj = {
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ParticipantList": $scope.ClaimParticipantsList,
            "Attachment": angular.copy(attachment)
        }
        sessionStorage.setItem("claimDetails", JSON.stringify(obj))
        $location.url('AttachmentMapping');
    }


    //Approve Invoice
    $scope.ApproveInvoiceFromAllInvoices = ApproveInvoiceFromAllInvoices;
    function ApproveInvoiceFromAllInvoices(invoice) {
        if (angular.isDefined(invoice.id) || invoice.id !== null) {
            var param = {
                "id": invoice.id,
                "isApproved": true
            };
            var ApprooveInvoice = AdjusterPropertyClaimDetailsService.ApproveInvoice(param);
            ApprooveInvoice.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                //show loader
                $(".page-spinner-bar").removeClass("hide");
                $scope.GetVendorAllInvoices();
                //show loader
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }

    $scope.OpenPaymentPopUp = OpenPaymentPopUp;
    function OpenPaymentPopUp(Vendor, invoice) {
        var InvoiceObj = {
            VendorId: Vendor.vendorId,
            VendorReg: Vendor.vendorNumber,
            Invoice: angular.copy(invoice)
        }
        $scope.animationsEnabled = true;

        var out = $uibModal.open(
            {
                size: 'lg',
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/InvoicePaymentPopup.html",
                controller: "InvoicePaymentPopupController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    InvoiceObj: function () {
                        return InvoiceObj;
                    }
                }
            });
        out.result.then(function (value) {
            if (value == "Success") {
                $scope.GetVendorAllInvoices();
            }
        }, function (res) {
        });
        return {
            open: open
        };
    }

    $scope.GotoInvoiceDetails = function (invoice) {
        var ObjDetails = {
            "InvoiceNo": invoice.invoiceNumber,
            "ClaimNo": $scope.CommonObj.ClaimNumber,
            "InvoicesToBePaid": $scope.ClaimStatusInvoiceDetails.unPaidVendorInvoices,
            "PageName": "AdjusterPropertyClaimDetails"
        };
        sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
        var url = $state.href('VendorInvoiceDetails');
        $window.open(url, '_blank');
    };

    $scope.SortVendorInvoice = function (key) {
        $scope.sortInvoiceKey = key;
        $scope.reverseInvoice = !$scope.reverseInvoice
    };
    $scope.SortClaimForm = function (key) {
        $scope.sortClaimFormKey = key;
        $scope.reversesortClaimFormKey = !$scope.reversesortClaimFormKey
    };

    $scope.ShowReports = function () {
        sessionStorage.setItem("ReportClaimNo", $scope.CommonObj.ClaimNumber);
        $scope.tab = 'Claim Summary';
    }

    $scope.sortVendorreverse = false;
    $scope.sortVendorKey = "vendorId";
    $scope.sortVendorList = function (keyname) {
        $scope.sortVendorKey = keyname;   //set the sortKey to the param passed
        $scope.sortVendorreverse = !$scope.sortVendorreverse; //if true make it false and vice versa
    }

    $scope.sortVendorreverses = true;
    $scope.sortVendorKeys = "itemsInHand";
    $scope.sortVendorLists = function (keyname) {
        $scope.sortVendorKeys = keyname;   //set the sortKey to the param passed
        $scope.sortVendorreverses = !$scope.sortVendorreverses; //if true make it false and vice versa
    };

    //New for service seleted
    $scope.Servicetype = null;
    $scope.ServiceTypeDiv = "";
    $scope.SelectServicetype = SelectServicetype;
    function SelectServicetype(Servicetype) {
        $scope.minCost = 0;
        $scope.selectedSubserviceList = [];
        $scope.Servicetype = Servicetype;
        //"Quote with Contact"
        if ($scope.Servicetype == 1) {
            $scope.ServiceTypeDiv = "Quote With Contact";
            $scope.salvageContentService = [];
            angular.forEach($scope.ContentServiceList[0].subServices, function (subService){
                //regarding ctb-3410 quote with contact service should have only salvage sub option
                if($scope.CommonObj.ClaimProfile == "Contents" && subService.service == 'Salvage'){
                    $scope.salvageContentService.push(subService);
                }
                if($scope.CommonObj.ClaimProfile == "Jewelry" && subService.service != 'Quote Only'){
                    $scope.salvageContentService.push(subService);
                }
            })
            calculateMinServiceCost();
        }
        //"Quote No Contact"
        else if ($scope.Servicetype == 2) {
            $scope.ServiceTypeDiv = "Quote No Contact";
            
            calculateMinServiceCost()
        }
        //"Salvage"
        else if ($scope.Servicetype == 3) {
            $scope.ServiceTypeDiv = "Salvage Only";
            $scope.salvageContentService = [];
            angular.forEach($scope.ContentServiceList[0].subServices, function (subService){
                if(subService.service != 'Salvage' && subService.service != 'Quote Only'){
                    $scope.salvageContentService.push(subService);
                }
            })
            // sub services should be hide when salvage only selected
            if($scope.CommonObj.ClaimProfile == "Jewelry"){
                $scope.salvageContentService = [];
            }
            calculateMinServiceCost();
        }
        angular.forEach($scope.ContentServiceList, function (contentService) {
            if (contentService.id === Servicetype) {
                angular.forEach(contentService.subServices, function (subService) {
                    subService.Selected = false;
                });
            }
        });
    }

    $scope.ReAssign = ReAssign;
    function ReAssign() {
        $scope.animationsEnabled = true;
        $scope.items = "Testing Pas Value";
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AdjusterReAssign.html",
                controller: "AdjusterReAssignController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    /**
                     * @return {?}
                     */

                    items: function () {
                        return "Testing Pas Value";
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }

    //Assign post losss item
    $scope.GetVendorsList = GetVendorsList;
    function GetVendorsList() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            'searchKey': $scope.searchVendorsKeyword,
            'categoryIds': itemCategoryIds,
            'page': $scope.vendorPage,
            'limit': $scope.pagesize,
            'sortBy': $scope.vendorSortKey,
            'orderBy': $scope.reverseVendorsList ? 'desc' : 'asc'
        }
        var VendorList = AdjusterPropertyClaimDetailsService.getVendorList(param);
        VendorList.then(function (success) {
            $scope.PricingSpecialist = [];
            $scope.totalVendors = 0;
            if (success.data.data) {
                var resData = success.data.data;
                $scope.totalVendors = resData && resData.totalVendors > 0 ? resData.totalVendors : 0;
                if ($scope.vendorPage == 1) {
                    $scope.lastRowCount = resData.totalPageSize;
                } else {
                    $scope.lastRowCount = resData.totalPageSize + ($scope.pagesize * ($scope.vendorPage - 1));
                }
                if (resData.companyVendors) {
                    angular.forEach(resData.companyVendors, function (vendor) {
                        if (vendor.specializedCategories && vendor.specializedCategories.length > 0) {
                            var specialities = [];
                            angular.forEach(vendor.specializedCategories, function (item) {
                                specialities.push(item.speciality);
                                vendor.specializedCategories = specialities.join(', ');
                            });
                        }
                        vendor.isSelectedVendor = false;
                        $scope.PricingSpecialist.push(vendor);
                        $scope.ContentServiceList = [];
                    });
                }
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to get vendor details. please try again.", "Error");
        });
    }
    $scope.getLineChartForAssignments = getLineChartForAssignments;
    function getLineChartForAssignments() {
        var responsePromise = AdjusterPropertyClaimDetailsService.getDataForAssignmentLineGraph($scope.CommonObj.AssignmentNumber);
        responsePromise.then(function (success) {
            var resData = success.data.data;
            var dates = [];
            var userRoles = [];
            var statuses = [];

            for (var i = 0; i < resData.length; i++) {
                dates.push($filter("DateFormatMMddyyyyHHmm")(resData[i].date))
                userRoles.push(resData[i].userRole)
                statuses.push(resData[i].status)
            }
            var markerColors = [];
            for (status of statuses) {
                if (status.indexOf('REVIEW') !== -1) {
                    markerColors.push("red");
                } else {
                    markerColors.push("green");
                }
            }
            var trace1 = {
                x: dates,
                y: userRoles,
                text: statuses,
                type: 'scatter',
                line: {
                    color: "blue"
                },
                marker: {
                    color: markerColors,
                    size: 10,
                }
            };

            var layout = {
                width: 580,
                height: 340,
                yaxis: {
                    tickfont: { size: 9 },
                    rangemode: 'tozero',
                    automargin: true,

                },
                xaxis: {
                    tickfont: { size: 10 },
                    rangemode: 'tozero',
                    automargin: true,
                },
                margin: {
                    l: 120,
                }

            };
            var data = [trace1];
            Plotly.newPlot('lineChart', data, layout, { displayModeBar: false });

        });
    }
    $scope.timeComparisonBarChart = timeComparisonBarChart;
    function timeComparisonBarChart() {
        var responsePromise = AdjusterPropertyClaimDetailsService.getDataForAssignmentBarGraph($scope.CommonObj.AssignmentNumber);
        responsePromise.then(function (success) {
            var resData = success.data.data;

            var trace1 = {
                x: ['First Touch', 'Claim Resolution'],
                y: resData.actualTimes,
                name: 'Actual Time Taken',
                type: 'bar'
            };

            var trace2 = {
                x: ['First Touch', 'Claim Resolution'],
                y: resData.contractedHours,
                name: 'Contracted Hours',
                type: 'bar'
            };

            var data = [trace1, trace2];

            var layout = {
                barmode: 'group',
                legend: {

                    font: {
                        size: 9
                    }
                },
                width: 400,
                height: 340,
                margin: {
                    l: 100,
                    r: 10,
                }
            };

            Plotly.newPlot('barGraph', data, layout, { displayModeBar: false });
        });
    }
    //Functions related to to Assign Item to vendor
    // Sort vendors List
    $scope.sortVendors = function (keyname) {
        $scope.reverseVendorsList = ($scope.vendorSortKey === keyname) ? !$scope.reverseVendorsList : false;
        $scope.vendorSortKey = keyname;   //set the sortKey to the param passed
        GetVendorsList();
    }
    $scope.SelectedVendorDetails = {};
    $scope.selectVendor = selectVendor;
    function selectVendor(vendor) {
        $scope.Servicetype = null;
        $(".page-spinner-bar").removeClass("hide");
        $scope.SelectedCategories = $scope.SelectedCategories && $scope.SelectedCategories.length > 0 ? ($scope.SelectedCategories.id !=null && $scope.SelectedCategories.name !=null ? $scope.SelectedCategories: null): null;
        var paramVendor = {
            "registrationNumber": vendor.registrationNumber,
            "categories": $scope.SelectedCategories
        };
        var VendorDetails = AdjusterPropertyClaimDetailsService.getSelectedVendorDetails(paramVendor);
        VendorDetails.then(function (success) {
            $scope.SelectedVendorDetails = success.data.data;
            if ($scope.SelectedVendorDetails
                && $scope.SelectedVendorDetails.vendorContentServiceList
                && $scope.SelectedVendorDetails.vendorContentServiceList.length > 0) {
                BindSelectedServices(vendor);
            }
            else {
                toastr.remove();
                toastr.error("No service is provided by " + vendor.name + " for selected categories. Please select different vendor and try again. For more info contact admin.", "Error", { timeOut: 0 });
                $(".page-spinner-bar").addClass("hide");
            }
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to get vendor details. please try again.", "Error");
        });
    }
    function BindSelectedServices(vendor) {
        $scope.ContentServiceList = [];
        var nonServicedCategories = [];
        //For time being we are matching only first category from selected category list and getting content service for that first category by checking the id of selected first category to vendor provided category(Put debugger to see categories)
        if ($scope.SelectedCategories && $scope.SelectedCategories.length > 0 && $scope.SelectedCategories.id !=null && $scope.SelectedCategories.name !=null) {
            angular.forEach($scope.SelectedCategories, function (seletedCategory, key) {
                var index = $scope.SelectedVendorDetails.vendorContentServiceList.findIndex(vendorContentService => vendorContentService.category.name === seletedCategory.name);
                if (index <= -1)
                    nonServicedCategories.push(seletedCategory.name);
                else if (key === 0) {
                    var contentServices = $scope.SelectedVendorDetails.vendorContentServiceList[0].contentServices;
                    if (contentServices && contentServices.length > 0) {
                        angular.forEach(contentServices, function (service) {
                            //regarding ctb-3410 salvage only service option should remove from content service
                            if($scope.CommonObj.ClaimProfile == "Contents" && service.service != 'Salvage Only')
                            $scope.ContentServiceList.push(service);
                            if($scope.CommonObj.ClaimProfile == "Jewelry")
                            $scope.ContentServiceList.push(service);
                        });
                    }
                }
            });

            if (nonServicedCategories.length > 0) {
                toastr.remove();
                toastr.error(vendor.name + " do not provide services for " + nonServicedCategories.join(", ") + ". Please remove item(s) from the assignment or select a different vendor and try again.", "Error", { timeOut: 0 });
            }
        }
        // Get default content services & subservices from selected vendor
        else {
            var category = $scope.SelectedVendorDetails.vendorContentServiceList.find(vendorcategory => vendorcategory.category.name.toLowerCase() === "others");
            angular.forEach(category.contentServices, function (service) {
                //regarding ctb-3410 salvage only service option should remove from content service
                if($scope.CommonObj.ClaimProfile == "Contents" && service.service != 'Salvage Only')
                $scope.ContentServiceList.push(service);
                if($scope.CommonObj.ClaimProfile == "Jewelry")
                    $scope.ContentServiceList.push(service);
            });
        }
        $(".page-spinner-bar").addClass("hide");
    }
    //add items in subservice List
    $scope.minCost = 0;
    $scope.selectedSubserviceList = [];
    $scope.SelectSubservice = SelectSubservice;
    function SelectSubservice(Subservices) {
        //var flag = 1;
        var subservice = {
            "id": Subservices.id,
            "name": Subservices.service,
            "selected": Subservices.Selected
        }
        if (subservice.selected) {
            $scope.selectedSubserviceList.push(subservice);
            if (Subservices.id == 1) {
                $scope.minCost = calculateMinServiceCost();
            }


            //PLease keep this code this is supposed to be correct functionality
            // $scope.minCost = $scope.minCost + Subservices.serviceCharge;
        }
        else {
            angular.forEach($scope.selectedSubserviceList, function (value, index) {
                if (Subservices.service == value.name) {
                    $scope.selectedSubserviceList.splice(index, 1);
                    $scope.SelectedVendorPostLossItem.length
                    if (Subservices.id == 1) {
                        $scope.minCost = 0;
                    }
                    //PLease keep this code this is supposed to be correct functionality
                    // $scope.minCost = $scope.minCost - Subservices.serviceCharge;
                    //flag = 0;
                }
            });
        }
    }

    function calculateMinServiceCost() {
        if($scope.Servicetype !=3){
            const contract = $scope.SelectedVendorDetails.contractBaseDTO;
            $scope.minCost =0;
            var maxLineItems ;
            var additionalQuoteFee ;
            var minCost =0;
            if($scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry"){
                var itemCount = $scope.SelectedVendorPostLossItem?.length;
                var maxLineItems = contract.jewelryMaxLineItemsPerAssignment;
                var additionalQuoteFee = contract.jewelryAdditionalLineItemQuoteFee;
                var quoteFee = contract.jewelryQuoteOnlyFee;
                var minCost = 0;

                if (itemCount > maxLineItems) {
                     minCost = parseFloat(quoteFee);
                     minCost = parseFloat(minCost) + parseFloat(additionalQuoteFee) * (itemCount - maxLineItems);
                     $scope.minCost = $scope.minCost + minCost;
                }
                else{
                     $scope.minCost = $scope.minCost + parseFloat(quoteFee);
                }

                return $scope.minCost;
                
            }else{
                countJewelryAndContentItems();
                var itemCount = $scope.SelectedVendorPostLossItem?.length;
                var maxLineItems = contract.contentsMaxLineItemsPerAssignment;
                var additionalQuoteFee = contract.contentsAdditionalLineItemQuoteFee;
                var quoteFee = contract.contentsQuoteOnlyFee;
                var minCost = 0;
            }

            if($scope.jewelryItems?.length>0)
            {
                minCost = parseInt(contract.jewelryQuoteOnlyFee);
                if ($scope.jewelryItems.length > contract.jewelryMaxLineItemsPerAssignment) {
                    minCost = parseFloat(minCost * contract.jewelryMaxLineItemsPerAssignment);
                    minCost = parseFloat(minCost) + parseFloat(contract.jewelryAdditionalLineItemQuoteFee * ($scope.jewelryItems.length - contract.jewelryMaxLineItemsPerAssignment));
                    $scope.minCost = minCost;
                }
                else{
                    $scope.minCost = parseFloat(minCost * contract.jewelryMaxLineItemsPerAssignment); 
                }
                itemCount = $scope.contentItems.length;
            }
            if (itemCount > maxLineItems) {
                minCost = parseFloat(quoteFee * maxLineItems);
                minCost = parseFloat(minCost) + parseFloat(additionalQuoteFee) * (itemCount - maxLineItems);
                $scope.minCost = $scope.minCost + minCost;
            }
            else{
            $scope.minCost = $scope.minCost + parseFloat(quoteFee * itemCount);
            }
            return minCost;
        }
        else{
            $scope.minCost = parseFloat($scope.SelectedVendorPostLossItem?.length *$scope.SelectedVendorDetails.contractBaseDTO.gemologistEvalFee);
        }
        
    }

    //assign claim to selected vendor
    $scope.AssignItemToVendor = AssignItemToVendor;
    function AssignItemToVendor() {
        $(".page-spinner-bar").removeClass("hide");
        if ($scope.Servicetype == 1) {
            $scope.ServiceText = "Quote With Contact"
        }
        else if ($scope.Servicetype == 2) {
            $scope.ServiceText = "Quote No Contact"
        }
        if ($scope.Servicetype == 3) {
            $scope.ServiceText = "Salvage Only"
        }

        if ($scope.SelectedVendorPostLossItem.length > 0) {
            if (angular.isDefined($scope.SelectedVendorDetails.registrationNumber) && $scope.SelectedVendorDetails.registrationNumber !== null) {
                var categories = [];
                angular.forEach($scope.SelectedCategories, function (item) {
                    categories.push({
                        "categoryId": item.id,
                        "categoryName": item.name
                    })
                });
                var SelectedPostItems = [];
                angular.forEach($scope.SelectedVendorPostLossItem, function (item) {
                    // SelectedPostItems.push({
                    //     "itemUID": item
                    // });
                    SelectedPostItems.push(item);
                });
                var ParamAssignment = {
                    "vendorDetails": {
                        "registrationNumber": $scope.SelectedVendorDetails.registrationNumber
                    },
                    "claimBasicDetails": {
                        "claimNumber": $scope.CommonObj.ClaimNumber
                    },
                    "categories": categories,
                    "claimedItems": SelectedPostItems,
                    "requestedVendorService": {
                        "id": $scope.Servicetype,
                        "name": $scope.ServiceText,
                        "subContentServices": ($scope.selectedSubserviceList.length > 0 ? $scope.selectedSubserviceList : null)
                    },
                    "canContactInsured": true,
                    "vendorAssigment": {
                        "claimNumber": $scope.CommonObj.ClaimNumber,
                        "dueDate": null, //"12-26-2017T14:47:56Z",
                        "remark": (angular.isDefined($rootScope.AssignmentRemark) && $rootScope.AssignmentRemark != null ? $rootScope.AssignmentRemark : null)
                    },
                    "insuranceCompanyDetails": {
                        "crn": sessionStorage.getItem("CRN")
                    },
                    "isNewItemCreated": true
                };

                var Assign = AdjusterPropertyClaimDetailsService.AssignItemToVendor(ParamAssignment);
                Assign.then(function (success) {
                    $(".page-spinner-bar").addClass("hide");
                    $scope.selectedSubserviceList = [];
                    $scope.minCost = 0;
                    toastr.remove();
                    toastr.success((success.data !== null) ? success.data.message : "Item(s) assigned successfully.", "Success");
                    $scope.CommonObj.isAssignmentDone = true;
                    $scope.tab = 'Vendor Assignments';
                    Cancel();
                    GetVendorAssignmnetList();
                }, function (error) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove();
                    toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to assign item to vendor. please try again.", "Error");
                });
            }
            else {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.warning("Please select vendor to whome you want to assign items.", "Warning");
            }
        } else {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.warning("Please select items to assign .", "Warning");
        }
    }
    $scope.GetCompanyBranchList = GetCompanyBranchList;
    function GetCompanyBranchList() {
        var param = { "id": sessionStorage.getItem("CompanyId") };
        var getBranchList = AdjusterPropertyClaimDetailsService.getCompanyBranchList(param);
        getBranchList.then(function (success) {
            $scope.companyDetails = success.data.data;
            $scope.BranchList = success.data.data.companyBranches;
            $scope.CommonObj.BranchCode = $scope.BranchList[0].branchCode;
        }, function (error) {
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            }
            else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }
    //Vendor Assignments
    $scope.groupedAssignmentList = {};
    $scope.GetVendorAssignmnetList = GetVendorAssignmnetList;
    function GetVendorAssignmnetList() {
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
        };
        var getAllVendorList = AdjusterPropertyClaimDetailsService.getVendorAssignmnetList(param);
        getAllVendorList.then(function (success) {
            if (success.data.data) {
                $scope.ItemAssignmentList = success.data.data.claimAssignmentVendors ? success.data.data.claimAssignmentVendors : [];
                $scope.ClaimStatusContent.itemsAssignedToVendors = success.data.data.itemsWithVendors ? success.data.data.itemsWithVendors : 0;
                groupAssignments();
                if($scope.assignmentRedirection)
                {
                   var assignment= $scope.ItemAssignmentList.filter((assignment)=>assignment.assignmentNumber===sessionStorage.getItem("assignmentNumber"));
                   GotoAssignmentDetails(assignment[0]);
                }
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            }
            else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }
    function groupAssignments() {
        $scope.groupedAssignmentList = $scope.ItemAssignmentList.reduce((r, a) => {
            r[a.vendorDetails.vendorName] = [...r[a.vendorDetails.vendorName] || [], a];
            return r;
        }, {});
    }
    $scope.GotoAssignmentDetails = GotoAssignmentDetails;
    function GotoAssignmentDetails(item) {
        GetContentService();
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = false;
        $scope.ShowAssignmentDetails = true;
        $(".page-spinner-bar").removeClass("hide");
        var param =
        {
            "assignmentNumber": item.assignmentNumber
        };
        var GetAssingmentDetails = AdjusterPropertyClaimDetailsService.GetVendorassignmentDetails(param);
        GetAssingmentDetails.then(function (success) {
            $scope.AssginmentDetails = success.data.data;
            $scope.CommonObj.AssignmentNumber = $scope.AssginmentDetails.assignmentNumber;
            $scope.assignmentRating = $scope.AssginmentDetails.assignmentRating;
            $scope.assignmentComment = $scope.AssginmentDetails.assignmentComment;
            $scope.prevAssignmentDetails =
                    {
                        "assignmentNumber": $scope.AssginmentDetails.assignmentNumber,
                        "assignmentRating": $scope.AssginmentDetails.assignmentRating,
                        "assignmentComment":$scope.AssginmentDetails.assignmentComment
                    };
            GetVendorAssignmnetItemList(item);
            $scope.getLineChartForAssignments();
            $scope.timeComparisonBarChart();
        }, function (error) {
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            }
            else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }
    function GetVendorAssignmnetItemList(item) {
        var param = {
            "assignmentNumber": item.assignmentNumber,
            "vrn": item.vendorDetails.registrationNumber
        };
        var getItemList = AdjusterPropertyClaimDetailsService.GetVendorassignmentItems(param);
        getItemList.then(function (success) {
            $scope.AssignmentItemList = success.data.data;
            $scope.totalQuote = 0; //quantity / rcv
            let tax = 0;
            angular.forEach($scope.AssignmentItemList, function (item) {
                $scope.totalQuote = parseFloat($scope.totalQuote) + parseFloat(item.claimItem.rcv != null && item.claimItem.quotedBy!=null && item.claimItem.quoteDate!=null && item.claimItem.quantity != null  ? (item.claimItem.rcv * item.claimItem.quantity) : 0)
                //$scope.totalQuote = parseFloat($scope.totalQuote) + parseFloat(item.claimItem.rcvTotal != null ? item.claimItem.rcvTotal : 0)
                tax = parseFloat(item.claimItem.taxRate);
            });

            // Tax calculations
            $scope.totalQuote = parseFloat($scope.totalQuote) + parseFloat((($scope.totalQuote * tax) / 100));

            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            }
            else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }
    $scope.ShowVendorAssignments = ShowVendorAssignments;
    function ShowVendorAssignments() {
        $scope.selectedAllVendorItem = false;
        $scope.SelectedVendorPostLossItem = [];
        $scope.SelectedCategories = [];
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            item.Selected = false;
        });
        $scope.selectedAll = false;
        $scope.SelectedPostLostItems = [];
        $scope.VendorAssignmentList = angular.copy($scope.FiletrLostDamageList);
        $scope.ShowAssignments = true;
        $scope.ShowAssignmentsList = false;
        $scope.ShowAssignmentDetails = false;
        $scope.tab = 'Vendor Assignments';
    }
    $scope.Cancel = Cancel;
    function Cancel() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.selectedAll = false;
        $scope.SelectedPostLostItems = [];
        $scope.selectedAllVendorItem = false;
        if (!$scope.CommonObj.isAssignmentDone) {
            $scope.tab = 'Contents';
            resetItemListSelection();
            angular.forEach($scope.statusFilterItems, function (item) {
                item.Selected = false;
            });
        }
        $scope.SelectedCategories = [];
        $scope.SelectedVendorPostLossItem = [];
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = true;
        $scope.ShowAssignmentDetails = false;
        sessionStorage.setItem("ItemsList", "");
        sessionStorage.setItem("SelectedItemsList", "");
        sessionStorage.setItem("ItemsStatus", false);
        //$scope.IscheckedParticipant = false;
        $scope.ServiceTypeDiv = "";
        $scope.ContentServiceList = [];
        $scope.showValued = false;
        $scope.showPaid = false;
        $scope.isReplaceable = false;
        $scope.showSettled = false;
        $scope.name = "false";
        $rootScope.AssignmentRemark = "";
        $(".page-spinner-bar").addClass("hide");
    }
    $scope.CancelAssignmentDetails = CancelAssignmentDetails;
    function CancelAssignmentDetails() {
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = true;
        $scope.ShowAssignmentDetails = false;
    }

    // Quote
    $scope.ShowViewQuote = false;
    $scope.GoToViewQuote = GoToViewQuote;
    function GoToViewQuote() {
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = false;
        $scope.ShowAssignmentDetails = false;
        $scope.ShowViewQuote = true;
        $scope.QuoteDetails = [];
        $(".page-spinner-bar").removeClass("hide");
        $scope.GetQuoteDetails();
    }
    $scope.GetQuoteDetails = GetQuoteDetails;
    function GetQuoteDetails() {
        var param = {
            "assignmentNumber": $scope.AssginmentDetails.assignmentNumber,
            "vrn": $scope.AssginmentDetails.vendor.registrationNumber
        };
        var getItemList = AdjusterPropertyClaimDetailsService.GetQuoteDetails(param);
        getItemList.then(function (success) {
            $scope.QuoteDetails = success.data.data;
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
    $scope.CancelViewQuote = CancelViewQuote;
    function CancelViewQuote() {
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = true;
        $scope.ShowAssignmentDetails = false;
        $scope.ShowViewQuote = false;
    }
    $scope.getClaimsStatusContentDetails = getClaimsStatusContentDetails;
    function getClaimsStatusContentDetails() {
        $(".page-spinner-bar").removeClass("hide");
        var param = { "id": $scope.CommonObj.ClaimId, "claimNumber": $scope.CommonObj.ClaimNumber };
        var getpromise = AdjusterPropertyClaimDetailsService.getClaimsStatusContentDetails(param);
        getpromise.then(function (success) {
            // $(".page-spinner-bar").addClass("hide");
            $scope.ClaimStatusContent = success.data.data;
            $scope.ClaimStatusContent.shippingDate = $filter('formatDate')($scope.ClaimStatusContent.shippingDate);
            if (!$scope.CommonObj.isAssignmentDone) {
                getServiceRequestList();
                //GetVendorAssignmnetList();
            }
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            if (error.data.errorCode == 400203) {
                $location.url("AdjusterDashboard");
            }
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error")
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.showContents = showContents;
    function showContents() {
        $scope.tab = 'Contents';
        $(".page-spinner-bar").removeClass("hide");
        getClaimsStatusContentDetails();
        $scope.statusFilterItems = [];
        GetPostLostItems();
        $scope.ShowAssignmentsList = false;
        $scope.ShowAssignmentDetails = false;
        sessionStorage.setItem("claimDetailsCurrentTab", "Contents");
        resetItemListSelection();
    }

    $scope.ShowVendors = ShowVendors;
    function ShowVendors() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.tab = 'Vendor Assignments';
        $scope.ShowViewQuote = false;
        $scope.ShowAssignmentDetails = false;
        GetVendorAssignmnetList();
        getClaimsStatusContentDetails();
        if ($scope.ShowAssignments == true) {
            $(".page-spinner-bar").removeClass("hide");
        }
        else {
            $scope.ShowAssignmentsList = true;
            $(".page-spinner-bar").removeClass("hide");
        }
    };

    $scope.OpenAssignmentDetails = OpenAssignmentDetails;
    function OpenAssignmentDetails(assignment) {
        $(".page-spinner-bar").removeClass("hide");
        $scope.tab = 'Vendor Assignments';
        $scope.ShowViewQuote = false;
        $scope.ShowAssignmentDetails = true;
        $scope.ShowAssignmentsList = false;
        GotoAssignmentDetails(assignment);
    }

    $scope.ShowPolicyDetails = ShowPolicyDetails;
    function ShowPolicyDetails() {
        $scope.ShowAssignmentDetails = false;
        $scope.ShowAssignmentsList = false;
        $scope.tab = 'Policy Details';
    }

    // CTB-3496 start
    // $scope.ShowClaimForm = ShowClaimForm;
    // function ShowClaimForm() {
    //     $scope.ShowAssignmentDetails = false;
    //     $scope.ShowAssignmentsList = false;
    //     $scope.tab = 'ClaimForm';
    //     GetPendingTaskList();
    // }

    $scope.GotoPolicyholderTasks = GotoPolicyholderTasks;
    function GotoPolicyholderTasks() {
        $location.url('AllTasks');
        GetPendingTaskList();
    }
    // end CTB-3496

    $scope.ShowReportsTab = ShowReportsTab;
    function ShowReportsTab() {
        $scope.tab = 'Claim Summary';
        $scope.ShowAssignmentDetails = false;
        $scope.ShowAssignmentsList = false;
    }

    //Supervisor Review
    $scope.supervisorReview = supervisorReview;
    function supervisorReview(reviewType) {
        $(".page-spinner-bar").removeClass("hide");
        var items = [];
        if (reviewType && reviewType === 'ITEMS') {
            angular.forEach($scope.SelectedPostLostItems, function (item) {
                items.push({
                    "itemId": item
                })
            });
        }
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "items": reviewType && reviewType === 'ITEMS' && items.length ? items : null,
        }
        var addSupervisorReview = AdjusterPropertyClaimDetailsService.SendClaimForSupervisorReview(param);
        addSupervisorReview.then(function (success) {
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            $scope.SelectedPostLostItems = [];
            $scope.statusFilterItems = [];
            getClaimsStatusContentDetails();
            GetPostLostItems();
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.message, $translate.instant("ErrorHeading"));
            $(".page-spinner-bar").addClass("hide");
        });
    }
    $scope.SetScheduledStatus = SetScheduledStatus;
    function SetScheduledStatus(item, status) {
        item.isScheduledItem = status;
    }
    //   Close claim
    $scope.closeClaim = closeClaim;
    function closeClaim(claim) {
        bootbox.confirm({
            size: "",
            title: "Close Claim",
            message: "Are you sure you want to close the claim# " + claim.ClaimNumber + " ?", closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: "Yes",
                    className: 'btn-success'
                },
                cancel: {
                    label: "No",
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                $(".page-spinner-bar").removeClass("hide");
                var param = {
                    "claimId": $scope.CommonObj.ClaimId,
                    "claimStatus": "Closed"
                }
                var promis = AdjusterPropertyClaimDetailsService.updateClaimStatus(param);
                promis.then(function (success) {
                    //If there are any pending invoices / items show them as message in modal
                    var response = success.data ? success.data.data : null;
                    if (response.claim) {
                        $scope.ClaimStatusContent.claimTime = response.claim.elapsedTime;
                        $scope.ClaimStatusContent.claimStatus = response.claim.status;
                    }
                    if (!response.statusUpdated) {
                        let itemTable = '';
                        let paymentsTable = "";
                        if (response.pendingItems && response.pendingItems.length > 0) {
                            itemTable = 'These line items need to be settled before closing the claim: <div class="table-responsive padding1px" style="height:fit-content; max-height:150px !important;display: block;position: relative;overflow: auto;">' +
                                '<table class="table table-striped table-bordered table-hover">'
                                + '<thead><tr>'
                                + '<th style="position:sticky; top:-1px;">Item #</th><th style="position:sticky; top:-1px;">Description</th><th style="position:sticky; top:-1px;">Status</th>'
                                + '</tr></thead><tbody>';
                            angular.forEach(response.pendingItems, function (item) {
                                var tr = '<tr>';
                                tr += '<td>';
                                tr += item.itemNumber;
                                tr += '</td> ';
                                tr += '<td>';
                                tr += decodeURIComponent(item.description);
                                tr += '</td> ';
                                tr += '<td>';
                                tr += item.status.status;
                                tr += '</td> ';
                                tr += '</tr> ';
                                itemTable += tr;
                            });
                            itemTable += "</tbody></table></div>";
                        }
                        let invoiceTable = '';
                        if (response.pendingInvoices && response.pendingInvoices.length > 0) {
                            invoiceTable = 'These invoices need to be paid before closing the claim: <div class="table-responsive padding1px" style="height:fit-content; max-height:150px !important;display: block;position: relative;overflow: auto;">' +
                                '<table class="table table-striped table-bordered table-hover">'
                                + '<thead><tr>'
                                + '<th style="position:sticky; top:-1px;">Invoice #</th><th style="position:sticky; top:-1px;">Vendor</th><th style="position:sticky; top:-1px;">Status</th>'
                                + '</tr></thead><tbody>';
                            angular.forEach(response.pendingInvoices, function (invoice) {
                                var tr = '<tr>';
                                tr += '<td>';
                                tr += invoice.invoiceNumber;
                                tr += '</td> ';
                                tr += '<td>';
                                tr += invoice.vendorName;
                                tr += '</td> ';
                                tr += '<td>';
                                tr += invoice.status.status;
                                tr += '</td> ';
                                tr += '</tr> ';
                                invoiceTable += tr;
                            });
                            invoiceTable += "</tbody></table></div><br>";
                        }

                        bootbox.confirm({
                            size: "medium",
                            title: 'Need Attention!',
                            message: itemTable + invoiceTable,
                            closeButton: true,
                            className: "modalcustom", buttons: {
                                confirm: {
                                    label: 'Ok',
                                    className: 'btn-outline green'
                                },
                                cancel: {
                                    label: 'No',
                                    className: 'btn-outline red hide'
                                }
                            },
                            callback: function () {
                            }
                        });
                    }
                    else {
                        mapCompletedServiceRequests(response.claim ? response.claim.serviceRequests : null);
                        toastr.remove();
                        toastr.success("Claim # "+claim.ClaimNumber+" was closed successfully", "Success");
                        $scope.back();
                    }
                    $(".page-spinner-bar").addClass("hide");
                }, function (error) {
                    toastr.remove()
                    toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
                    $(".page-spinner-bar").addClass("hide");
                });
            }
            if(!result){
                toastr.remove()
                toastr.warning("Not able to close claim", "Warning");
                $(".page-spinner-bar").addClass("hide");
            }
        }
    });
    }

    function mapCompletedServiceRequests(completedServiceRequests) {
        if (completedServiceRequests && completedServiceRequests.length > 0) {
            angular.forEach(completedServiceRequests, function (req) {
                let index = $scope.ServiceRequestList.findIndex(r => r.serviceNumber === req.serviceNumber)
                if (index > -1) {
                    $scope.ServiceRequestList[index].status = angular.copy(req.status);
                }
            });
        }
    }
    $scope.DeleteClaim = DeleteClaim;
    function DeleteClaim(claim) {
        bootbox.confirm({
            size: "",
            title: "Delete Claim",
            message: "Are you sure want to delete claim# " + claim.ClaimNumber + " ?", closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: "Yes",
                    className: 'btn-success'
                },
                cancel: {
                    label: "No",
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    $(".page-spinner-bar").removeClass("hide");
                    var param =
                        { "claimNumber": claim.ClaimNumber };

                    var DeleteclaimAdjuster = AdjusterPropertyClaimDetailsService.deleteClaim(param);
                    DeleteclaimAdjuster.then(function (success) {
                        toastr.remove();
                        toastr.success(success.data.message, "Confirmation");
                        $(".page-spinner-bar").addClass("hide");
                        $location.url(sessionStorage.getItem('HomeScreen'));
                    }, function (error) {
                        toastr.remove()
                        toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
                        $(".page-spinner-bar").addClass("hide");
                    });
                    $(".page-spinner-bar").addClass("hide");


                }
            }
        });
    }

    $scope.hardDeleteClaim = hardDeleteClaim;
    function hardDeleteClaim(claim) {
        bootbox.confirm({
            size: "",
            title: "Delete Claim",
            message: "Are you sure want to delete claim# " + claim.ClaimNumber + " ?", closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: "Yes",
                    className: 'btn-success'
                },
                cancel: {
                    label: "No",
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    $(".page-spinner-bar").removeClass("hide");
                    var param =
                        { "claimNumber": claim.ClaimNumber };

                    var DeleteclaimAdjuster = AdjusterPropertyClaimDetailsService.hardDeleteClaim(param);
                    DeleteclaimAdjuster.then(function (success) {
                        toastr.remove();
                        toastr.success(success.data.message, "Confirmation");
                        $location.url(sessionStorage.getItem('HomeScreen'));
                        $(".page-spinner-bar").addClass("hide");
                    }, function (error) {
                        toastr.remove()
                        if(!!error.data?.errorMessage)
                            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
                        else
                            toastr.warning(error.data.message, $translate.instant("warning"));

                        $(".page-spinner-bar").addClass("hide");
                    });



                }
            }
        });
    }

    $scope.ShowActivityLogTab = ShowActivityLogTab;
    function ShowActivityLogTab() {
        $scope.tab = 'Activity Log';
        $scope.ShowAssignmentsList = false;
        $scope.ShowAssignmentDetails = false;
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("BackPage", "AdjusterPropertyClaimDetails");
    }

    //go to search results page
    $scope.goToSearchResult = goToSearchResult;
    function goToSearchResult() {
        sessionStorage.setItem("previousPage", pageName);
        $location.path("/AdjusterGlobalSearch");
    }

    //go to all claims page
    $scope.goToAllClaims = goToAllClaims;
    function goToAllClaims() {
        sessionStorage.setItem("NavFrom", "AllClaim");
        $location.path("/AdjusterAllClaims");
    }

    // go to people details page
    $scope.goToPeopleDetails = goToPeopleDetails
    function goToPeopleDetails() {
        $location.path("/PeopleDetails");
    }

    // Attachments Preview and download
    $scope.GetDocxDetails = function (item) {
        $scope.pdf = true;
        $scope.showDownload = true;
        $scope.showDelete = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showDownload = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            if ($scope.CommonObj.UserId != item.uploadBy.id)
                $scope.showDelete = false;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg","image/jpg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf((($scope.DocxDetails.FileType ? $scope.DocxDetails.FileType : $scope.DocxDetails.type).toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf((($scope.DocxDetails.FileType ? $scope.DocxDetails.FileType : $scope.DocxDetails.type).toLowerCase())) > -1) {
            $scope.isPDF = 2;
        }
        else {
            $scope.isPDF = 0;
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.FileName != null && angular.isDefined($scope.DocxDetails.FileName) && $scope.DocxDetails.FileName !== "") ? $scope.DocxDetails.FileName : "Document"));
            downloadLink[0].click();
        }
        window.setTimeout(function () {
            $("#img_preview").css({
                'right': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
        }, 100);
    }
    $scope.close = function () {
        $("#img_preview").hide();
    }
    var zoomFactor = 100;
    $scope.largeMe = largeMe;
    function largeMe() {
        zoomFactor += 5;
        document.getElementById('imagepre').style.zoom = zoomFactor + "%";
    }
    $scope.smallMe = smallMe;
    function smallMe() {
        zoomFactor -= 5;
        document.getElementById('imagepre').style.zoom = zoomFactor + "%";
    }
    $scope.downloadFile = function (data) {
        var linkElement = document.createElement('a');
        linkElement.setAttribute('href', data.url);
        linkElement.setAttribute("download", data.name);
        linkElement.setAttribute('target', '_self');
        var clickEvent = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
        });
        linkElement.dispatchEvent(clickEvent);
    }
    $scope.isPdf = function (fileName) {
        if (/\.(pdf|PDF)$/i.test(fileName)) {
            return true;
        }
    }
    $scope.isImage = function (fileName) {
        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
            return true;
        }
    }
    $scope.isExcel = function (fileName) {
        if (/\.(xls|xlsx)$/i.test(fileName)) {
            return true;
        }
    }
    $scope.isDocx = function (fileName) {
        if (/\.(docx|doc)$/i.test(fileName)) {
            return true;
        }
    }
    // Attachment Preview and Download

    $scope.editClaimDetails = editClaimDetails;
    function editClaimDetails() {
        GetLossTypes();
        $scope.editClaimDetail = true;
        $scope.editAssignedClaimDetail = angular.copy($scope.ClaimStatusContent);
        //$scope.editAssignedClaimDetail.policyLimit= angular.copy($scope.PolicyDetails.policyLimit);
        //$scope.editAssignedClaimDetail.claimIndividualLimit = angular.copy($scope.PolicyDetails.claimIndividualLimit);
        // $scope.tempClaimDetails = {
        //     "oldClaimNumber": $scope.CommonObj.ClaimNumber,
        //     "damageTypeId": $scope.ClaimStatusContent.damageTypeId,
        //     "taxRate": $scope.ClaimStatusContent.taxRate,
        //     // "aggregateLimit": $scope.ClaimStatusContent.underLimit,
        //     "deductible": $scope.ClaimStatusContent.deductible,
        //     "minimumThreshold": $scope.ClaimStatusContent.minimumThreshold,
        //     "totalPolicyCoverage": $scope.ClaimStatusContent.totalPolicyCoverage,
        //     "shippingDate": $scope.ClaimStatusContent.shippingDate,
        //     "shippingMethodId": $scope.ClaimStatusContent.shippingMethod ? $scope.ClaimStatusContent.shippingMethod.id : null
        // }
    }

    $scope.editServices = editServices;
    function editServices(value) {
        if (value == '1') {
            $scope.editServicesRequested = true;
            if (angular.isUndefined($scope.AssginmentDetails.contentService)) {
                $scope.Servicetype = null;
                $scope.ServiceTypeDiv = null
            }
            else
                selectAssignmentContentServices($scope.AssginmentDetails.contentService);
        }
        else
            $scope.editServicesRequested = false;
    }

    //selet subservices
    $scope.selectAssignmentContentServices = selectAssignmentContentServices;
    function selectAssignmentContentServices(contentService) {
        $scope.Servicetype = contentService.id;
        $scope.selectedSubserviceList = [];
        $scope.ServiceTypeDiv = contentService.service;
        //"Salvage"
        if (contentService.service != 'Salvage Only') {
            angular.forEach($scope.ContentServiceList, function (item) {
                if (item.service == contentService.service) {
                    angular.forEach(item.subServices, function (subservice) {
                        angular.forEach($scope.AssginmentDetails.contentService.subServices, function (data) {
                            if (subservice.service === data.service) {
                                subservice.Selected = true;
                                SelectSubservice(subservice);
                            }
                        });
                    });
                }
            });
        }
    }

    $scope.updateServices = updateServices;
    function updateServices() {
        $(".page-spinner-bar").removeClass("hide");
        if (angular.isDefined($scope.CommonObj.ClaimId != null) && $scope.CommonObj.ClaimId != null && $scope.CommonObj.ClaimId != '') {
            var categories = [];
            $scope.SelectedCategories.push({ id: 22, name: "Jewelry" });
            angular.forEach($scope.SelectedCategories, function (item) {
                categories.push({
                    "categoryId": item.id,
                    "categoryName": item.name
                });
            });
            var requestedVendorService = {
                "id": $scope.Servicetype,
                "name": $scope.ServiceTypeDiv,
                "subContentServices": ($scope.selectedSubserviceList.length > 0 ? $scope.selectedSubserviceList : null)
            }
            var updateClaimDetailsDTO = {
                "claimId": $scope.CommonObj.ClaimId,
                "oldClaimNumber": $scope.CommonObj.ClaimNumber,
                "assignmentNumber": $scope.CommonObj.AssignmentNumber,
                "requestedVendorService": requestedVendorService,
                "isUpdatedByInsuranceUser": true,
                "categories": categories,
                "isAssignmentUpdated": true
            }
            var updateServ = AdjusterPropertyClaimDetailsService.updateClaimDetails(updateClaimDetailsDTO);
            updateServ.then(function (success) {
                $scope.editServicesRequested = false;
                $scope.selectedSubserviceList = [];
                $scope.AssginmentDetails.contentService = {};
                $scope.AssginmentDetails.contentService.subServices = [];
                $scope.AssginmentDetails.contentService.id = requestedVendorService.id;
                $scope.AssginmentDetails.contentService.service = requestedVendorService.name;
                if ($scope.AssginmentDetails.contentService.service && $scope.AssginmentDetails.contentService.service != 'Salvage Only') {
                    angular.forEach(requestedVendorService.subContentServices, function (item) {
                        var subService = {
                            "id": item.id,
                            "service": item.name
                        }
                        $scope.AssginmentDetails.contentService.subServices.push(subService);
                    });
                }
                toastr.remove();
                toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                $(".page-spinner-bar").addClass("hide");
                GetVendorAssignmnetList();
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error(error.data.errorMessage);
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }

    //Edit Claim details
    //Get Loss Types.
    $scope.GetLossTypes = GetLossTypes;
    $scope.LossTypeList = [];
    function GetLossTypes() {
        var GetLossTypesList = AdjusterPropertyClaimDetailsService.getLossTypes();
        GetLossTypesList.then(function (success) {
            $scope.LossTypeList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    // Funtion to update claim details from claim details page.
    $scope.updateClaimDetails = updateClaimDetails;
    function updateClaimDetails() {
        if (angular.isDefined($scope.CommonObj.ClaimId) && $scope.CommonObj.ClaimId != null && $scope.CommonObj.ClaimId != '') {
            var updateClaimDetailsDTO = {
                "claimId": $scope.CommonObj.ClaimId,
                "updatedClaimNumber": $scope.editAssignedClaimDetail.claimNumber ? $scope.editAssignedClaimDetail.claimNumber : $scope.CommonObj.ClaimNumber,
                "oldClaimNumber": $scope.CommonObj.ClaimNumber,
                "damageTypeId": $scope.editAssignedClaimDetail.damageTypeId,
                "taxRate": $scope.editAssignedClaimDetail.taxRate,
                // "aggregateLimit": $scope.ClaimStatusContent.underLimit,
                "deductible": $scope.editAssignedClaimDetail.deductible,
                "minimumThreshold": $scope.editAssignedClaimDetail.minimumThreshold,
                "totalPolicyCoverage": $scope.ClaimStatusContent.totalPolicyCoverage,
                "policyLimit": $scope.editAssignedClaimDetail.policyLimit,
                "individualLimit": $scope.editAssignedClaimDetail.individualLimit,
                "isUpdatedByInsuranceUser": true,
                "shippingDate": angular.isDefined($scope.ClaimStatusContent.shippingDate) && $scope.ClaimStatusContent.shippingDate != '' ? $filter('DatabaseDateFormatMMddyyyy')($scope.ClaimStatusContent.shippingDate) : null,
                "shippingMethod": $scope.CommonObj && $scope.CommonObj.ClaimProfile === 'Jewelry' ? {
                    "id": angular.isDefined($scope.ClaimStatusContent.shippingMethod) && $scope.ClaimStatusContent.shippingMethod ? $scope.ClaimStatusContent.shippingMethod.id : null,
                } : null,
                "additionalNote": $scope.editAssignedClaimDetail.additionalNote
            }
            var upDateClaimDetails = AdjusterPropertyClaimDetailsService.updateClaimDetails(updateClaimDetailsDTO);
            upDateClaimDetails.then(function (success) {
                $scope.CommonObj.ClaimNumber = $scope.editAssignedClaimDetail.claimNumber ? $scope.editAssignedClaimDetail.claimNumber : $scope.CommonObj.ClaimNumber;
                sessionStorage.setItem('ClaimNumber', $scope.CommonObj.ClaimNumber);
                sessionStorage.setItem('ClaimNo', $scope.CommonObj.ClaimNumber);
                $scope.editClaimDetail = false;
                getClaimsStatusContentDetails();
                GetPostLostItems();
                toastr.remove();
                toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error(error.data.errorMessage);
            });
        }
    }

    $scope.cancelEditDetails = cancelEditDetails;
    function cancelEditDetails() {
        $scope.editClaimDetail = false;
        $scope.editAssignedClaimDetail = {};

        // $scope.CommonObj.ClaimNumber = $scope.tempClaimDetails.oldClaimNumber;
        // $scope.ClaimStatusContent.damageTypeId = $scope.tempClaimDetails.damageTypeId;
        // $scope.ClaimStatusContent.taxRate = $scope.tempClaimDetails.taxRate;
        // // $scope.ClaimStatusContent.underLimit = $scope.tempClaimDetails.aggregateLimit;
        // $scope.ClaimStatusContent.deductible = $scope.tempClaimDetails.deductible;
        // $scope.ClaimStatusContent.minimumThreshold = $scope.tempClaimDetails.minimumThreshold;
        // $scope.ClaimStatusContent.totalPolicyCoverage = $scope.tempClaimDetails.totalPolicyCoverage;
        // $scope.ClaimStatusContent.shippingDate = $scope.tempClaimDetails.shippingDate;
        // $scope.ClaimStatusContent.shippingMethod = {};
        // $scope.ClaimStatusContent.shippingMethod.id = $scope.tempClaimDetails.shippingMethodId
    }

    //Get Policy details
    //Contains Policy and all category details added while creating policy
    $scope.getPolicyDetails = getPolicyDetails;
    function getPolicyDetails() {
        //Get Policy Details
        var param = { "policyNumber": null, "claimNumber": $scope.CommonObj.ClaimNumber };
        var getPolyDetails = AdjusterPropertyClaimDetailsService.getPolicyDetails(param);
        getPolyDetails.then(function (success) {
            $scope.PolicyDetails = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    // Pagination
    $scope.pageChangeHandler = pageChangeHandler;
    function pageChangeHandler(pageNum) {
        $scope.currentPage = pageNum;
    }

    // Pagination
    $scope.pageChanged = pageChanged;
    function pageChanged(pageNum) {
        $scope.vendorPage = pageNum;
        GetVendorsList();
    }

    $scope.searchVendors = searchVendors
    function searchVendors(key) {
        $scope.vendorPage = 1
        GetVendorsList();
    }
    $scope.sendAssignmentRating = sendAssignmentRating
    function sendAssignmentRating(assignmentNumber, ratingNumber) {
        $scope.animationsEnabled = true;
        var assignmentObj = [];
        assignmentObj.push({
            assugnmentNumber:assignmentNumber,
            ratingNumber:ratingNumber,
            comment:$scope.assignmentComment,
            prevAssignmentDetails:$scope.prevAssignmentDetails
        })
        if(ratingNumber && assignmentNumber){
            var out = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AssignmentRatingPopUp.html",
                controller: "assignmentRatingController",
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    assignmentObj: function () {
                        return assignmentObj;
                    }
                }
            });
            out.result.then(function (value){
                console.log(value);
                if(value && value!=null && value.assignmentRating!=null){
                    var responsePromise = AdjusterPropertyClaimDetailsService.updateAssignmentRating(assignmentNumber, value.assignmentRating, value.comment);
                    responsePromise.then(function (success) {
                        var param =
                        {
                            "assignmentNumber": assignmentNumber
                        };
                        var GetAssingmentDetails = AdjusterPropertyClaimDetailsService.GetVendorassignmentDetails(param);
                        GetAssingmentDetails.then(function (success) {
                            $scope.AssginmentDetails = success.data.data;
                            $scope.CommonObj.AssignmentNumber = $scope.AssginmentDetails.assignmentNumber;
                            $scope.assignmentRating = $scope.AssginmentDetails.assignmentRating;
                            $scope.assignmentComment = $scope.AssginmentDetails.assignmentComment;
                            $scope.prevAssignmentDetails =
                            {
                                "assignmentNumber": $scope.AssginmentDetails.assignmentNumber,
                                "assignmentRating": $scope.AssginmentDetails.assignmentRating,
                                "assignmentComment":$scope.AssginmentDetails.assignmentComment
                            };
                        }, function (error) {
                            toastr.remove();
                            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                                toastr.error(error.data.errorMessage, "Error")
                            }
                            else {
                                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                            }
                        });
                        toastr.remove();
                        if(!value.cancel)
                        toastr.success("Successfully submitted rating", $translate.instant("SuccessHeading"));

                    }, function (error) {

                        $scope.ErrorMessage = error.data.errorMessage;
                        toastr.error(error.data.errorMessage, "Error")
                    });
                }else{
                    toastr.remove();
                }

            },function(){

            });
            return{
                open: open
            };
        }
    }

    //GoTo View Quote
    $scope.GoToViewQuoteFromAssigment = GoToViewQuoteFromAssigment;
    function GoToViewQuoteFromAssigment(item) {
        sessionStorage.setItem("ClaimNumber", $scope.CommonObj.ClaimNumber);
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("ItemNumber", item.itemNumber);
        sessionStorage.setItem("ItemUID", item.itemUID);
        sessionStorage.setItem("assignmentNumber", item.assignmentDetails.assignmentNumber);// not getting value  that's why hide
        sessionStorage.setItem("vendorNumber", item.vendorDetails.vendorNumber);
        sessionStorage.setItem("AdjusterClaimNo", item.claimNumber);
        sessionStorage.setItem("AdjusterClaimId", item.claimId);
        sessionStorage.setItem("AdjusterPostLostItemId", item.id);
        $location.url('ViewQuote');
    }

    //Go to MER
    $scope.GoToMER = GoToMER;
    function GoToMER(item) {
        sessionStorage.setItem("AdjusterClaimNo", item.claimNumber);
        sessionStorage.setItem("AdjusterClaimId", item.claimId);
        sessionStorage.setItem("AdjusterPostLostItemId", item.id);
        sessionStorage.setItem("ItemId",item.id);
        sessionStorage.setItem("ClaimNumber",item.claimNumber);
        if($scope.CommonObj.UserRole == 'ADJUSTER')
            sessionStorage.setItem("ClaimDetailsPage", "AdjusterPropertyClaimDetails");
        if($scope.CommonObj.UserRole == 'CLAIM SUPERVISOR')
            sessionStorage.setItem("ClaimDetailsPage", "SupervisorClaimDetails");

        $location.url('MER');
    }

    $scope.OnCancel = OnCancel;
    function OnCancel() {
        $location.url('/AdjusterPropertyClaimDetails');
    }

    $scope.CategoryPopup = function () {
        $scope.animationsEnabled = true;
        if ($scope.SelectedPostLostItems && $scope.SelectedPostLostItems.length > 0) {
            var out = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "views/CommonTemplates/CategoryChangePopUp.html",
                controller: "CategoryChangePopUpController",
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    itemData: function () {
                        return $scope.SelectedPostLostItems;
                    }

                }
            });
            window.setTimeout(function () {
                out.close();
                GetPostLostItems();
            }, 300000);
            out.result.then(function (value) {
                $scope.SelectedPostLostItems = [];
                GetPostLostItems();

            }, function (res) {
                //Call Back Function close
                $scope.SelectedPostLostItems = [];
                GetPostLostItems();
            });
            return {
                open: open
            };
        }
    }

    $scope.ChangeStatus = function (status) {
        var selectedItems = [];
        $(".page-spinner-bar").removeClass("hide");
        $scope.acceptingStandardCost = true;
        $scope.isReplaced = true;
        angular.forEach($scope.statusFilterItems, function (item) {
            if (item.Selected) {
                $scope.ItemDetails = item;
              if(status===$scope.constants.itemStatus.valued)
              {
                item.adjusterDescription = item.description;
                // insuredPrice
                if(!(!!item.category?.name))
                {
                    var othersCategory = $scope.DdlSourceCategoryList.find((category)=>category.categoryName=="Others");
                    item.category = {
                       "id" : othersCategory.categoryId,
                       "name" : othersCategory.categoryName
                    };

                    if(!(!!item.subCategory?.name))
                    {
                         var othersSubCategory = $scope.SubCategoryList.find((category)=>category.name=="Others");
                         item.subCategory = othersSubCategory;
                    }
                }
                
                    var taxRate = ($scope.ItemDetails.taxRate && $scope.ItemDetails.applyTax == true) ? $scope.ItemDetails.taxRate : 0
                     if(taxRate>0)
                     {
                        item.rcv =  utilityMethods.parseFloatWithFixedDecimal(((item.totalStatedAmount/item.quantity)*100)/(taxRate+100));
                     }
                    else
                    {
                        item.rcv = utilityMethods.parseFloatWithFixedDecimal(item.totalStatedAmount / item.quantity)
                    }
                    item.replacedItemPrice = item.rcv;
                    item.replacementQty = item.quantity;
                    item.rcvTotal = item.totalStatedAmount;
                    item.replaced = true;
                    $scope.ItemDetails = item;
                    setItemLimitDetailsFromHOPolicyType();
                    $scope.CalculateRCV();
                }
              
                selectedItems.push($scope.ItemDetails);
            }
        });
        var param = {
            //"itemIds": $scope.SelectedPostLostItems,
            "itemStatus": status,
            "claimItems": selectedItems
        }
        var getCategories = LineItemService.bulkUpdateStatus(param);
        getCategories.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            $scope.hideSettlementSuccessMsg = true;
            $scope.SelectedPostLostItems = [];
            Cancel();
            var res = success.data.data
            // if (res.claimItems) {
            //     mapUpdatedItemsToOriginalList(res.claimItems);
            //     $scope.calculateSettlement(false);
            //     // $scope.statusBasedFilter($scope.FiletrLostDamageList);
            // } else
            // GetPostLostItems();
            calculateSettlement();
            $(".page-spinner-bar").addClass("hide");
            getClaimsStatusContentDetails();
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
     $scope.acceptingStandardCost = false;
     $scope.isReplaced = false;
    }

    $scope.reTriggerAndSaveCalculationProcess = function () {
        var selectedItems = [];
        $scope.isReplaced = true;
        $(".page-spinner-bar").removeClass("hide");
        $scope.acceptingStandardCost = true;
        angular.forEach($scope.statusFilterItems, function (item) {
              if(item.replaced && ["CREATED","VALUED","UNDER REVIEW"].includes(item.status?.status))
              {
                if(!(!!item.category?.name))
                {
                    var othersCategory = $scope.DdlSourceCategoryList.find((category)=>category.categoryName=="Others");
                    item.category = {
                       "id" : othersCategory.categoryId,
                       "name" : othersCategory.categoryName
                    };

                    if(!(!!item.subCategory?.name))
                    {
                         var othersSubCategory = $scope.SubCategoryList.find((category)=>category.name=="Others");
                         item.subCategory = othersSubCategory;
                    }
                }
                
                $scope.ItemDetails = item;
                setItemLimitDetailsFromHOPolicyType();
                $scope.CalculateRCV();
                selectedItems.push($scope.ItemDetails);
                }              
        });
        var param = {
            "claimItems": selectedItems,
            "reqForReCalculation":true
        }
        var getCategories = LineItemService.bulkUpdateStatus(param);
        getCategories.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            $scope.hideSettlementSuccessMsg = true;
            $scope.SelectedPostLostItems = [];
            Cancel();
            var res = success.data.data
            // if (res.claimItems) {
            //     mapUpdatedItemsToOriginalList(res.claimItems);
            //     $scope.calculateSettlement(false);
            //     // $scope.statusBasedFilter($scope.FiletrLostDamageList);
            // } else
            // GetPostLostItems();
            calculateSettlement();
            $(".page-spinner-bar").addClass("hide");
            getClaimsStatusContentDetails();
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
     $scope.acceptingStandardCost = false;
     $scope.isReplaced = false;
    }

    $scope.CalculateRCV = function () {
        //ACV = P - ((CA / EL) * P) Formula
        //Get Price of added comparable value

        var Price = 0.0; var taxRate = 0.0;
        var ACV = 0.0; var RCV = 0.0;
        var Age = 0.0;
        var EL = 0.0; var CA = 0.0;
        var depreciationPercent = 0.0;
        Price = $scope.acceptingStandardCost? $scope.ItemDetails.rcv : $scope.ItemDetails.totalStatedAmount ;

        //Get age of item
        if ($scope.ItemDetails.ageMonths !== null && angular.isDefined($scope.ItemDetails.ageMonths) && $scope.ItemDetails.ageMonths > 0) {
            if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears) && $scope.ItemDetails.ageYears !== "")
                Age = parseFloat($scope.ItemDetails.ageYears) + (parseFloat($scope.ItemDetails.ageMonths) / 12);
            else
                Age = Math.ceil(parseFloat($scope.ItemDetails.ageMonths) / 12);
        }
        else {
            if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears))
                Age = parseFloat($scope.ItemDetails.ageYears);
        }

        // if ($scope.ItemDetails.subCategory != null && angular.isDefined($scope.ItemDetails.subCategory)) {
        //     if ($scope.ItemDetails.subCategory.annualDepreciation != null && angular.isDefined($scope.ItemDetails.subCategory.annualDepreciation)) {
        //         depreciationPercent = parseFloat(Age * ($scope.ItemDetails.subCategory.annualDepreciation / 100));
        //     }
        //     else
        //         depreciationPercent = parseFloat(Age * (10 / 100));
        // }

        //if usefulYears not getting form db then calculate usefulYears by formula
        //Useful Years = 100 / (Depreciation %) = 100/10 = 10 years
        EL = (depreciationPercent == null ? 0 : depreciationPercent.toFixed(2));
        CA = parseFloat(Age);
        RCV = parseFloat(Price);
        /**
         * Calculate material cost
         */
        if($scope.isReplaced || $scope.ItemDetails.replaced){
            Price =utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcv*$scope.ItemDetails.replacementQty)
        }

       
        taxRate = ($scope.ItemDetails.taxRate && $scope.ItemDetails.applyTax == true) ? $scope.ItemDetails.taxRate : 0;
        $scope.ItemDetails.totalTax = utilityMethods.parseFloatWithFixedDecimal((taxRate / 100) * (isNaN(Price) ? 1 : Price));

        Price = isNaN(Price) ? 0 : utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.totalTax + Price);
        // EL = isNaN(EL) ? 0 : EL;
        $scope.ItemDetails.rcvTotal =utilityMethods.parseFloatWithFixedDecimal(Price);
        if ($scope.SubCategoryList
            && $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id) {
            var subcategory = null;// = $scope.SubCategoryList.find(x => x.id == $scope.ItemDetails.subCategory.id);
            angular.forEach($scope.SubCategoryList, function (item) {
                if (item.id == $scope.ItemDetails.subCategory.id) {
                    subcategory = item;
                }
            })
            // if(subcategory && subcategory.name.toLowerCase() == 'Fiction and Non-Fiction'.toLowerCase()){
            //     EL = (60/100).toFixed(2);
            // }
            // else if(subcategory && subcategory.name.toLowerCase() == 'Paperbacks'.toLowerCase()){
            //     EL = (50/100).toFixed(2);
            // }
            if (subcategory) {
                $scope.CalculateRCVWithSplCase(subcategory, Price);
            }
        }

        // $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal(Price * (EL / 100));
        ACV = utilityMethods.parseFloatWithFixedDecimal(Price - $scope.ItemDetails.depreciationAmount);
        ACV = isNaN(ACV) || ACV < 0 ? 0 : ACV;

        $scope.ItemDetails.itemOverage = 0.0;
        //$scope.ItemDetails.individualLimitAmount = $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : 0.0;
        $scope.ItemDetails.scheduleAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : 0.0);
        // CTB-2903
        // Condition where Item's category is not listed in selected home owners Policy type
        // then individual Limit will be 0.00, Item overage must also be considered 0.00.
        // Every item’s final Item Overage(holdover value) will be calculated based on the final Total Cash Value (ACV)
        // If(Total Cash Value > Item Limit) then acv - individual item limit else  Item Overage = 0.0
        if ($scope.ItemDetails.individualLimitAmount && $scope.ItemDetails.individualLimitAmount > 0 && ACV > $scope.ItemDetails.individualLimitAmount)
            $scope.ItemDetails.itemOverage = utilityMethods.parseFloatWithFixedDecimal(ACV - $scope.ItemDetails.individualLimitAmount);

        $scope.ItemDetails.acv = utilityMethods.parseFloatWithFixedDecimal(ACV);
        $scope.ItemDetails.rcv = utilityMethods.parseFloatWithFixedDecimal(RCV);

        // as per request if category is jewelry the acv is equals to replacement cost
         //as per request commented out the below lines decided to handle this in configuration
        // if ($scope.ItemDetails.category && ($scope.ItemDetails.category.name.toLowerCase() == 'jewelry' && $scope.ItemDetails.subCategory != null && $scope.ItemDetails.subCategory.name !== 'Costume Jewelry')) {
        //     $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
        // }
           //ACV shld be always smaller than RCV
        if($scope.ItemDetails.acv >$scope.ItemDetails.rcvTotal){
            $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
        }

        if (isNaN($scope.ItemDetails.valueOfItem)) {
            $scope.ItemDetails.valueOfItem = 0;
        }
        if (isNaN($scope.ItemDetails.itemOverage)) {
            $scope.ItemDetails.itemOverage = 0;
        }
        if (isNaN($scope.ItemDetails.totalTax)) {
            $scope.ItemDetails.totalTax = 0;
        }
        if (isNaN($scope.ItemDetails.acv)) {
            $scope.ItemDetails.acv = 0;
        }
        if (isNaN($scope.ItemDetails.rcv)) {
            $scope.ItemDetails.rcv = 0;
        }
        if (isNaN($scope.ItemDetails.rcvTax)) {
            $scope.ItemDetails.rcvTax = 0;
        }
        if (isNaN($scope.ItemDetails.rcvTotal)) {
            $scope.ItemDetails.rcvTotal = 0;
        }
        if (isNaN($scope.ItemDetails.acvTotal)) {
            $scope.ItemDetails.acvTotal = 0;
        }
        if (isNaN($scope.ItemDetails.acvTax)) {
            $scope.ItemDetails.acvTax = 0;
        }
        // taxRate = $scope.ItemDetails.taxRate ? $scope.ItemDetails.taxRate : 0;
        // $scope.ItemDetails.totalTax = parseFloat((taxRate / 100) * (isNaN(Price) ? 1 : Price)).toFixed(2);
        // ACV = isNaN(ACV) ? 0 : ACV;
        // Price = isNaN(Price) ? 0 : (parseFloat($scope.ItemDetails.totalTax) + parseFloat(Price)).toFixed(2);
        // CA = isNaN(CA) ? 0 : CA;
        // EL = isNaN(EL) ? 0 : EL;
        // $scope.ItemDetails.depreciationAmount = parseFloat((parseFloat(Price) * parseFloat(EL)).toFixed(2)) > 0 ? parseFloat((parseFloat(Price) * parseFloat(EL)).toFixed(2)) : 0;
        // ACV = (parseFloat(Price) - (parseFloat(Price) * parseFloat(EL))) > 0 ? (parseFloat(Price) - (parseFloat(Price) * parseFloat(EL))) : 0;
        // $scope.ItemDetails.rcvTotal = Price;
        // $scope.ItemDetails.holdOverValue = parseFloat(Price - ACV).toFixed(2);
        // if ($scope.ItemDetails.holdOverValue < 0)
        //     $scope.ItemDetails.holdOverValue = 0;


        // $scope.ItemDetails.acv = parseFloat(ACV.toFixed(2));
        // $scope.ItemDetails.rcv = parseFloat(RCV.toFixed(2));
        // // as per request if category is jwelary the acv is equals to replacement cost
        // if ($scope.ItemDetails.category && ($scope.ItemDetails.category.id == 31)) {
        //     $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
        // }
        // if (isNaN($scope.ItemDetails.valueOfItem)) {
        //     $scope.ItemDetails.valueOfItem = 0;
        // }
        // if (isNaN($scope.ItemDetails.holdOverValue)) {
        //     $scope.ItemDetails.holdOverValue = 0;
        // }
        // if (isNaN($scope.ItemDetails.totalTax)) {
        //     $scope.ItemDetails.totalTax = 0;
        // }
        // if (isNaN($scope.ItemDetails.acv)) {
        //     $scope.ItemDetails.acv = 0;
        // }
        // if (isNaN($scope.ItemDetails.rcv)) {
        //     $scope.ItemDetails.rcv = 0;
        // }
        // if (isNaN($scope.ItemDetails.rcvTax)) {
        //     $scope.ItemDetails.rcvTax = 0;
        // }
        // if (isNaN($scope.ItemDetails.rcvTotal)) {
        //     $scope.ItemDetails.rcvTotal = 0;
        // }
        // if (isNaN($scope.ItemDetails.acvTotal)) {
        //     $scope.ItemDetails.acvTotal = 0;
        // }
        // if (isNaN($scope.ItemDetails.acvTax)) {
        //     $scope.ItemDetails.acvTax = 0;
        // }
    }
    $scope.CalculateRCVWithSplCase = function (subcategory, Price) {
        var ACV = 0;
        var depriciationAmt = 0;
        var maxDepreciationAmt = Price * (subcategory.maxDepreciation / 100);
        $scope.ItemDetails.ageYears = Number.isNaN(Number($scope.ItemDetails.ageYears)) ? 0 : $scope.ItemDetails.ageYears;
        $scope.ItemDetails.ageMonths = Number.isNaN(Number($scope.ItemDetails.ageMonths)) ? 0 : $scope.ItemDetails.ageMonths;
        var depreciationRate = subcategory.annualDepreciation * ($scope.ItemDetails.ageYears + ($scope.ItemDetails.ageMonths/12));
        $scope.ItemDetails.depreciationRate = depreciationRate;
        $scope.ItemDetails.depriciationRateStr = subcategory.annualDepreciation + "%";
        
        $scope.ItemDetails.subcategory = subcategory;
        if (subcategory.specialCase) {
            if (subcategory.depreciation) {
                var ageInYrs = $scope.ItemDetails.ageYears + ($scope.ItemDetails.ageMonths/12);
                if(ageInYrs>0){
                    var depreciatedPrice = Price;
                    // depriciationAmt = Price * (subcategory.firstYearDepreciation / 100);
                    if(ageInYrs <1)
                    {
                        depriciationAmt += (depreciatedPrice * ((subcategory.firstYearDepreciation / 100)* ageInYrs));
                        depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.firstYearDepreciation / 100) * ageInYrs));
                    }
                    else
                    {
                        depriciationAmt += depreciatedPrice * (subcategory.firstYearDepreciation / 100);
                        depreciatedPrice = depreciatedPrice - (depreciatedPrice * (subcategory.firstYearDepreciation / 100));
                    }
                    // var depreciatedPrice = Price - depriciationAmt;
                    ageInYrs = ageInYrs-1;//after fst yr depreciation
                    while (ageInYrs > 0) {
                        if(ageInYrs <1)
                        {
                            depriciationAmt += depreciatedPrice * ((subcategory.correspondYearDepreciation / 100)* ageInYrs);
                            depreciatedPrice = depreciatedPrice - (depreciatedPrice * ((subcategory.correspondYearDepreciation / 100)* ageInYrs));
                            ageInYrs = ageInYrs - 1;
                        }
                        else
                        {
                            depriciationAmt += depreciatedPrice * (subcategory.correspondYearDepreciation / 100);
                            depreciatedPrice = depreciatedPrice - (depreciatedPrice * (subcategory.correspondYearDepreciation / 100));
                            ageInYrs = ageInYrs - 1;
                        }
    
                    }
                    $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - depreciatedPrice);
                    ACV = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount);
                }
    
                    $scope.ItemDetails.depriciationRateStr = subcategory.firstYearDepreciation + "%, "+subcategory.correspondYearDepreciation+"% year on" ;
    
                }
                else if (subcategory.flatDepreciation && subcategory.flatDepreciation > 0) {
                    depriciationAmt = utilityMethods.parseFloatWithFixedDecimal(Price * (subcategory.flatDepreciation / 100));
                    ACV = Price - depriciationAmt;
                    $scope.ItemDetails.depriciationRateStr = subcategory.flatDepreciation +"% flat"
                }
                else {
                    var ageInYrs = $scope.ItemDetails.ageYears;
                    ageInYrs = $scope.ItemDetails.ageYears + ($scope.ItemDetails.ageMonths/12);
                    // depriciationAmt = Price * (subcategory.annualDepreciation / 100);
                    var depreciatedPrice = Price;
                    //  = Price - depriciationAmt;
                    // ageInYrs = ageInYrs-1;//after fst yr depreciation
                    while (ageInYrs > 0) {
                        if(ageInYrs <1)
                        {
                        depriciationAmt += (depreciatedPrice * ((subcategory.annualDepreciation / 100)* ageInYrs));
                        depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.annualDepreciation / 100) * ageInYrs));
                        }
                        else{
                        depriciationAmt += (depreciatedPrice * (subcategory.annualDepreciation / 100));
                        depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.annualDepreciation / 100)));
                        }
                        ageInYrs = ageInYrs - 1;
    
                       
                    }
                    $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - depreciatedPrice);
                    ACV = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount);
                 
    
                }
                // $scope.ItemDetails.rcv = RCV;
            }
            else {
                ageInYrs = $scope.ItemDetails.ageYears + ($scope.ItemDetails.ageMonths/12);
                    // depriciationAmt = Price * (subcategory.annualDepreciation / 100);
                    var depreciatedPrice = Price;
                    //  = Price - depriciationAmt;
                    // ageInYrs = ageInYrs-1;//after fst yr depreciation
                while (ageInYrs > 0) {
                    if(ageInYrs <1)
                    {
                    depriciationAmt += (depreciatedPrice * ((subcategory.annualDepreciation / 100)* ageInYrs));
                    depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.annualDepreciation / 100) * ageInYrs));
                    }
                    else{
                    depriciationAmt += (depreciatedPrice * (subcategory.annualDepreciation / 100));
                    depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.annualDepreciation / 100)));
                    }
                    ageInYrs = ageInYrs - 1;
    
                }
                $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - depreciatedPrice);
                    ACV = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount);
    
            }
        
        $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal(depriciationAmt);
        $scope.ItemDetails.acv = utilityMethods.parseFloatWithFixedDecimal(ACV);

             //CTB-3151
             if($scope.ItemDetails.condition && $scope.ItemDetails.condition.conditionId && (subcategory.flatDepreciation > 0 || ($scope.ItemDetails.ageYears>0 || $scope.ItemDetails.ageMonths>0)) ){
                if($scope.ItemDetails.condition.conditionId === 1){
                    $scope.ItemDetails.acv = $scope.ItemDetails.acv*1.10;
                }else if($scope.ItemDetails.condition.conditionId === 2){
                    $scope.ItemDetails.acv = $scope.ItemDetails.acv*1.05;
                }else if($scope.ItemDetails.condition.conditionId === 4){
                    $scope.ItemDetails.acv = $scope.ItemDetails.acv*0.9;
                 }
            }
    
            if($scope.ItemDetails.acv>0){    
                $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - $scope.ItemDetails.acv);
                $scope.ItemDetails.depreciationAmount = $scope.ItemDetails.depreciationAmount < 0 ? 0 : $scope.ItemDetails.depreciationAmount;
                if($scope.ItemDetails.depreciationAmount > maxDepreciationAmt && maxDepreciationAmt>0 ){
                    $scope.ItemDetails.depreciationAmount =utilityMethods.parseFloatWithFixedDecimal(maxDepreciationAmt);
                    $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount;    
                }
               }
               else
               {
                if($scope.ItemDetails.isReplaced && $scope.ItemDetails.depreciationAmount>0 && maxDepreciationAmt && maxDepreciationAmt>0)
                {
                    $scope.ItemDetails.depreciationAmount =utilityMethods.parseFloatWithFixedDecimal(maxDepreciationAmt);
                    $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount;   
                }
                else{    
                 $scope.ItemDetails.depreciationAmount =0;
                 $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
                }
               }
            
        // var depreciateRateDetails = $http.get("Contants/DepriciationRatesContant.json");
        // depreciateRateDetails.then(function (success) {
        //     // console.log(success.data);
        //     var depreciationDetails = success.data.find(x => x.subcategory.toLowerCase() === subcategory.name.toLowerCase());

        //     if (depreciationDetails && depreciationDetails.totalRate != 0 && depreciationDetails.monthlyRate == 0) {
        //         var EL = depreciationDetails.totalRate / 100;
        //         let depreciateValue = Price * EL;
        //         var ACV = utilityMethods.parseFloatWithFixedDecimal((Price - depreciateValue) > 0 ? (Price - depreciateValue) : 0);
        //         $scope.ItemDetails.itemOverage = utilityMethods.parseFloatWithFixedDecimal(Price - ACV);
        //         if ($scope.ItemDetails.itemOverage < 0)
        //             $scope.ItemDetails.itemOverage = 0;
        //         $scope.ItemDetails.acv = utilityMethods.parseFloatWithFixedDecimal(ACV);
        //     }
        //     else if (depreciationDetails && depreciationDetails.totalRate == 0 && depreciationDetails.monthlyRate == 0 && depreciationDetails.comment) {
        //         if (depreciationDetails.comment == 'replacement cost') {
        //             $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
        //         }
        //         if (depreciationDetails.comment == 'appraisal value') {
        //             $scope.ItemDetails.acv = $scope.ItemDetails.appraisalValue;
        //         }
        //         if (depreciationDetails.comment == 'material cost') {
        //             $scope.ItemDetails.acv = $scope.ItemDetails.appraisalValue;
        //         }
        //         //  material cost
        //     }
        //     //  else if(subcategory.name == 'Paperbacks'){
        //     //  }
        // }, function (error) {
        // })

    }
    $scope.paid = function () {
        var selectesItems = [];
        var total = 0.00;
        var itemCnt = 0;
        angular.forEach($scope.statusFilterItems, function (item) {
            if (item.Selected) {
                if (item.status.status === $scope.constants.itemStatus.valued) {
                    selectesItems.push(item);
                    total += parseFloat(item.cashPayoutExposure);
                    itemCnt++;
                }
            }
        });
        var itmStr = (itemCnt == 1) ? "item" : "items";
        if (isNaN(total) || total == 0) {
            bootbox.alert({
                message: "<b><center>Payment Details</center></b><br/>Paying a sum of " + $filter('currency')(total) + " (Cash Payout Exposure) for " + itemCnt + " " + itmStr + "<br/><br/><span class='text-danger'>Cash Payout Exposure value should be greater than $0.00</span>",
                size: 'small'
            });
            return false;
        }
        bootbox.confirm({
            size: 'small',
            //closeButton: false,
            // Paying a sum of $6,798.00 (ACV) for 20 items
            message: "<b><center>Payment Details</center></b><br/>Paying a sum of " + $filter('currency')(total) + " (Cash Payout Exposure) for " + itemCnt + " " + itmStr + "<br/><br/>Check #<span class='text-danger'>*</span>&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' id='checkNumber'>" +
                "<span class='text-danger' id='checkError' hidden>Please Enter Check number</span>", closeButton: false,
            buttons: {
                confirm: {
                    label: "Submit"
                },
                cancel: {
                    label: "Cancel" //$translate.instant('ClaimDetails_Delete.BtnNo'),
                }
            },
            callback: function (result) {
                if (result) {
                    $(".page-spinner-bar").removeClass("hide");
                    if (!$.trim($('#checkNumber').val()) || $.trim($('#checkNumber').val()) == "") {
                        $(".page-spinner-bar").addClass("hide");
                        $('#checkError').show();
                        $("#checkNumber").focus();
                        return false;
                    }
                    $('#checkError').hide();
                    angular.forEach(selectesItems, function (item) {
                        item.isPaid = true;
                    });
                    var param = {
                        "checkNumber": $('#checkNumber').val(),
                        "ammount": total,
                        "claimLineItemDetails": selectesItems,
                        "registrationNumber": sessionStorage.getItem("jewelryVendor") ? sessionStorage.getItem("jewelryVendor") : sessionStorage.getItem("speedCheckVendor"),
                        "paidBy": $scope.userId,
                        "claimNumber": $scope.CommonObj.ClaimId
                    }
                    var getpromise = AdjusterPropertyClaimDetailsService.updatePostLostItemsStatus(param);
                    getpromise.then(function (success) {
                        toastr.remove();
                        toastr.success("Successfully submitted request", $translate.instant("SuccessHeading"));
                        $scope.SelectedPostLostItems = [];
                        Cancel();
                        if (success.data.data)
                            mapUpdatedItemsToOriginalList(success.data.data);
                            GetPostLostItems();
                        //GetPostLostItems();
                        $(".page-spinner-bar").addClass("hide");
                    }, function (error) {
                        $(".page-spinner-bar").addClass("hide");
                        $scope.ErrorMessage = error.data.errorMessage;
                    });
                }
            }
        });
    }
    //method to map the items in response
    function mapUpdatedItemsToOriginalList(updatedItems) {
        angular.forEach(updatedItems, function (updatedItem) {
            angular.forEach($scope.statusFilterItems, function (originalItem) {
                if (originalItem && originalItem.id === updatedItem.id) {
                    originalItem.status = angular.copy(updatedItem.status);
                }
            })
        });

        $scope.statusBasedFilter($scope.FiletrLostDamageList);
    }

    $scope.mapSupervisorReviewData = mapSupervisorReviewData
    function mapSupervisorReviewData(event, reviewType) {
        if (reviewType === 'ITEMS' && (!$scope.SelectedPostLostItems || !$scope.SelectedPostLostItems.length)) {
            toastr.remove();
            toastr.error('Please select items for supervisor review', 'Error')
            event.stopPropagation();
            event.preventDefault();
        }
        $scope.defaultRecepients = [];
        //Selected Claim supervisor(s) has default recepient
        angular.forEach($scope.ClaimParticipantsList, function (participant) {
            if (participant.role && participant.role === 'CLAIM SUPERVISOR')
                $scope.defaultRecepients.push(participant);
        });
        AddNotePopup('Supervisor Review', reviewType);
    }

    $scope.checkOptions = function () {
        var selectedItemDetails = [];
        $scope.showValued = false;
        $scope.showPaid = false;
        $scope.isReplaceable = false;
        $scope.showSettled = false;
        var canBeValued = 0, canBePaid = 0, isReplaceable = 0, canBeSettled = 0;
        if ($scope.SelectedPostLostItems && $scope.SelectedPostLostItems.length > 0) {
            angular.forEach($scope.SelectedPostLostItems, function (selectItem) {
                selectedItemDetails.push($scope.statusFilterItems.find(item => item.id === selectItem));
            })
            angular.forEach(selectedItemDetails, function (item) {
                if (item.status && (item.status.status === $scope.constants.itemStatus.workInProgress || item.status.status === $scope.constants.itemStatus.created))
                    canBeValued++;
                else if (item.status && item.status.status === $scope.constants.itemStatus.valued) {
                    canBePaid++;
                    if(item.category.name === "Jewelry")
                    isReplaceable++;
                }
                else if (item.status && item.status.status === $scope.constants.itemStatus.settled && item.category.name === "Jewelry")
                    isReplaceable++;
                else if (item.status && (item.status.status === $scope.constants.itemStatus.paid || item.status.status === $scope.constants.itemStatus.partialReplaced))
                    canBeSettled++;
            });
            if (canBeValued >= 1)
                $scope.showValued = true;
            if (canBePaid >= 1)
                $scope.showPaid = true;
            if (isReplaceable >= 1 && isReplaceable === selectedItemDetails.length)
                $scope.isReplaceable = true;
            if (canBeSettled >= 1 && canBeSettled === selectedItemDetails.length)
                $scope.showSettled = true;
        }
    }

    $scope.showReplacmentTab = showReplacmentTab;
    function showReplacmentTab() {
        $scope.tab = 'Item Replacement Quotes';
        sessionStorage.setItem("claimDetailsCurrentTab", "Item Replacement Quotes");
    }
    $scope.showAllReplacementQuotes = showAllReplacementQuotes;
    function showAllReplacementQuotes() {
        GetPostLostItems();
        resetItemListSelection();
    }

    $scope.nextMessagePage = function () {
        if (currentMessagePage < totalMessagePages) {
            $scope.isMessagesLoading = true;
            currentMessagePage += 1;
            getMessages();
        }
    }

    $scope.nextRecords = function () {
        $scope.getNumberOfRec += 20;
    }
    
    $scope.showDocumentsTab = function () {
        //Claim Attachments (Gets all attachments under Policy & Claim / Items / Invoices / Receipts / Others)
        $scope.tab = 'Documents';
    }
    $scope.showClaimParticipantsTab = function () {
        $scope.tab = 'Claim Participants';
        getClaimParticipants();
    }
    $scope.sendMessageToParticipant = function (participant) {
        $scope.defaultRecepients = [];
        $scope.defaultRecepients.push(participant);
        AddNotePopup(null, null);
    }

    $scope.updateAndInviteUser = function (participant) {
        updateResetUser(participant);
    }

    $scope.GoToViewQuote = GoToViewQuote;
    function GoToViewQuote(quoteNumber) {
        sessionStorage.setItem("ClaimNumber", $scope.CommonObj.ClaimNumber);
        //  sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        //  sessionStorage.setItem("ItemNumber", $scope.ItemDetails.itemNumber);
        //  sessionStorage.setItem("ItemUID", $scope.ItemDetails.itemUID);
        // sessionStorage.setItem("assignmentNumber",assignmentNumber);
        sessionStorage.setItem("quoteNumber", quoteNumber)
        //  sessionStorage.setItem("vendorNumber", $scope.ItemDetails.vendorDetails.registrationNumber);
        $location.url('ViewQuote');
    };
    $scope.reviewTaskPopup = reviewTaskPopup;
    function reviewTaskPopup(task) {
        var obj = {
            "index": $scope.PendingTaskList.indexOf(task) + 1,
            "status": task.status.status,
            "comment": task.comment,
            "createdBy": task.createdBy,
            "assignedDate": task.assignedDate,
            "taskName": task.taskName,
            "taskId": task.taskId,
            "UserRole": $scope.CommonObj.UserRole,
            "response": task.response,
            "attachments": task.attachments,
            "completedDate": task.completedDate
        }
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/PolicyHolder/CompleteTaskPopup.html",
                controller: "CompleteTaskPopupController",
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }
            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                GetPendingTaskList();
            }
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }

    $scope.calculateSettlement = calculateSettlement
    function calculateSettlement (hideMessage) {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            claimNumber: $scope.CommonObj.ClaimNumber
        }
        var getpromise = AdjusterPropertyClaimDetailsService.claimSettlement(param);
        getpromise.then(function (success) {
            toastr.remove();
            if(hideMessage){
                toastr.success(success.data.message + " Refreshing items list...", "Confirmation");
            }
            GetPostLostItems();
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            let errorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(errorMessage ? errorMessage : "Failed to calculate claim settlement. Please try again.", "Attention");
        });
    }

    $scope.viewAllItems = function(){
        $scope.animationsEnabled = true;
        let itemsObj = [];
        itemsObj.push({items: $scope.VendorAssignmentList});
        console.log("vendorAssigment",$scope.VendorAssignmentList )
        itemsObj.push({DdlSourceCategoryList:$scope.DdlSourceCategoryList})
        var out = $uibModal.open(
            {   
                animation: $scope.animationsEnabled,
                size: "lg",
                templateUrl:'views/Adjuster/itemAssignmentPopUp.html',
                controller:"itemAssignmentPopUpController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    itemsObj: function () {
                        return angular.copy(itemsObj);
                    }
                }
            }
        );
        out.result.then(function (value) {
            
            $scope.VendorAssignmentList = angular.copy(value);
            $scope.ItemsSelectedForAssignments = angular.copy(value);
            $scope.SelectedPostLostItems = angular.copy(value);
            $scope.SelectedVendorPostLossItem = [];            
            angular.forEach(value, function (itemSelected) {
                $scope.SelectVendorPostLostItem(itemSelected);
            });
        },function () {
        });
        return{
            open: open
        };
    }

    $scope.ConversationPopup = ConversationPopup;
    function ConversationPopup(item) {
        item.noOfUnreadComment = 0;
        var obj = {
            "ClaimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ItemId": item.id,
            "ItemUID": item.itemUID,
            "description": item.description,
            "ParticipantList": $scope.ClaimParticipantsList.filter(function (cp) {
                if (cp.emailId != sessionStorage.getItem("UserName"))
                    return cp;
            }),
            "UserId": sessionStorage.getItem("UserId"),
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/ConversationPopup.html",
                controller: "ConversationController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objMsg: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                $scope.Tab = sessionStorage.getItem("ActiveTab");
                showMessages();
                sessionStorage.removeItem("ActiveTab");
            }
            item.noOfUnreadComment = 0;


        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }

    $scope.showMessages = showMessages;
    function showMessages() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.tab = 'Notes';
        GetMessages(null);
        $(".page-spinner-bar").addClass("hide");
    }

    $scope.GetMessages = GetMessages;
    function GetMessages(event) {
        if (event && event === 'refresh')
            $(".note_refresh_spinner").addClass("fa-spin");
        else
            $(".page-spinner-bar").removeClass("hide");
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        var getpromise = AdjusterLineItemDetailsService.getItemNotes(param);
        getpromise.then(function (success) {
            //var Notes = $filter('orderBy')(success.data && success.data.data ? success.data.data : null, 'updateDate', true);
            var Notes = success.data && success.data.data ? success.data.data : null;
            $scope.Notes = [];
            var idx = 0;
            var selIdx = 0;
            angular.forEach(Notes, function (item, index) {
                // if (item.groupTitle != null) {
                var tooltip = '';
                var count = 0;
                if ($scope.NoteDetails && $scope.NoteDetails.groupId == item.groupId) {
                    selIdx = idx;
                } else {
                    idx++;
                }
                angular.forEach(item.participants, function (participant) {
                    if (count == item.participants.length - 1) {
                        tooltip += participant.name;
                    } else {
                        tooltip += participant.name + "\n";
                    }
                    count++;
                });
                // map messages attachments within group
                angular.forEach(item.messages, function (message) {
                    angular.forEach(message.attachments, function (attachment) {
                        attachment.FileType = attachment.claimFileType;
                        attachment.FileName = attachment.name;
                        attachment.addedByUser = {
                            "id": message.addedBy.id
                        };
                        attachment.message = {
                            "id": message.noteId
                        };
                    });
                });
                item.tooltipText = tooltip;
                $scope.Notes.push(item);
                // }
            });
            if ($scope.Notes !== null && $scope.Notes.length > 0) {
                $scope.NoteDetails = $scope.Notes[selIdx];
                $scope.NoteIndex = selIdx;
            }
            if (event && event === 'refresh')
                $(".note_refresh_spinner").removeClass("fa-spin");
            else
                $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".note_refresh_spinner").removeClass("fa-spin");
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.GetSubCategoryList = GetSubCategoryList;
    function GetSubCategoryList() {
        //--------------------------------------------------------------------------------------------------------------
        //bind subcategory
        
                        // else {
            //     if (Price != null)
            //         $scope.CalculateRCV();
            // }
            var param = { "categoryId": null };
            var getpromise = AdjusterPropertyClaimDetailsService.getSubCategory(param);
            getpromise.then(function (success) {
                // CTB-2923
                // If a certain category has exactly 1 subcategory -
                // its should be populated automatically in the sub-category drop down.
                var res = success.data ? success.data.data : null;
                if (res) {
                        $scope.SubCategoryList=res;
                    
                   
                    // else
                    //     $scope.CalculateRCV();
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                //$scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error(error.data.errorMessage, 'Error');
                $(".page-spinner-bar").addClass("hide");
            });
    }
    $scope.getMinimumValues = getMinimumValues;
    function getMinimumValues(event){
        $scope.isReplaced = true;
        var selectedItems = [];
        var totalAmountToPrice = 0;
        angular.forEach($scope.statusFilterItems, function (item) {
            if(item.totalStatedAmount != 0 && item.totalStatedAmount <= $scope.ClaimStatusContent.minimumThreshold  && item.status.status=="CREATED"){
                totalAmountToPrice += item.totalStatedAmount;
                selectedItems.push(item);
            }
        });
        
        
            bootbox.confirm({
                size: "",
                title: "Accept Min. Values",
                message:"A total of <"+ selectedItems.length +"> items will be accepted at replacement cost of <$"+totalAmountToPrice.toFixed(2)+">.Would you like to accept the original costs as replacement costs of these items?", closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Yes",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "No",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        angular.forEach(selectedItems, function (item) {
                         $scope.acceptingStandardCost =true;
                         if(!(!!item.category?.name))
                         {
                             var othersCategory = $scope.DdlSourceCategoryList.find((category)=>category.categoryName=="Others");
                             item.category = {
                                "id" : othersCategory.categoryId,
                                "name" : othersCategory.categoryName
                             };
         
                             if(!(!!item.subCategory?.name))
                             {
                                  var othersSubCategory = $scope.SubCategoryList.find((category)=>category.name=="Others");
                                  item.subCategory = othersSubCategory;
                             }
                         }
                            $scope.ItemDetails = item;
                                item.adjusterDescription = item.description;
                                var taxRate = ($scope.ItemDetails.taxRate && $scope.ItemDetails.applyTax == true) ? $scope.ItemDetails.taxRate : 0
                                if(taxRate>0)
                                {
                                   item.rcv =  utilityMethods.parseFloatWithFixedDecimal(((item.totalStatedAmount/item.quantity)*100)/(taxRate+100));
                                }
                                else
                                {
                                    item.rcv = utilityMethods.parseFloatWithFixedDecimal(item.totalStatedAmount / item.quantity)
                                }
                                item.replacedItemPrice = item.rcv;
                                item.rcvTotal = item.totalStatedAmount;
                                item.replacementQty = item.quantity ?? 1;
                                item.replaced = true;
                                $scope.ItemDetails = item;
                                $scope.CalculateRCV();
                        });
                        if(selectedItems && selectedItems.length>0){
                        $(".page-spinner-bar").removeClass("hide");
                        var param = {
                            //"itemIds": $scope.SelectedPostLostItems,
                            "itemStatus": $scope.constants.itemStatus.valued,
                            "claimItems": selectedItems
                        }
                        var getCategories = LineItemService.bulkUpdateStatus(param);
                        getCategories.then(function (success) {
                            
                            $scope.SelectedPostLostItems = [];
                            Cancel();
                            var res = success.data.data
                            if (res.claimItems) {
                                mapUpdatedItemsToOriginalList(res.claimItems);
                                $scope.calculateSettlement(false);
                                // $scope.statusBasedFilter($scope.FiletrLostDamageList);
                            } else
                                GetPostLostItems();
                                

                            // $(".page-spinner-bar").addClass("hide");
                            window.setTimeout(function () {
                                toastr.remove();
                                // toastr.success("success");
                                toastr.success("<"+selectedItems.length+"> items have been valued at their original cost for a total of <"+totalAmountToPrice.toFixed(2)+">", $translate.instant("SuccessHeading"));
                            }, 1000);
                            getClaimsStatusContentDetails();
                            LineItemService.updateItemsLogHistory(param);
                        }, function (error) {
                            $(".page-spinner-bar").addClass("hide");
                            $scope.ErrorMessage = error.data.errorMessage;
                            toastr.remove();
                            toastr.error(error.data.errorMessage, "Error");
                        });
                    }
                    else{
                        $(".page-spinner-bar").addClass("hide");
                        event.stopPropagation();
                        toastr.remove();
                        toastr.warning("There are no items which are less than minimum $ to price", "Warning");
                        return false;  
                    }
                    // if(!result){
                    //     $(".page-spinner-bar").addClass("hide");
                    //         toastr.remove();
                    //         toastr.warning("not able to price", "warning");
                    // }
                }
            }
        });
        $scope.acceptingStandardCost =false; 
        $scope.isReplaced = false;
    }

    $scope.acceptStandardCost = acceptStandardCost;
    function acceptStandardCost(event){
        $scope.acceptingStandardCost =true;
        var selectedItems = [];
        if($scope.statusFilterItems && $scope.statusFilterItems.length <= 0){
             $(".page-spinner-bar").addClass("hide");
             event.stopPropagation();
             toastr.remove();
             toastr.warning("there is no items to accept standard cost", "Warning");
             return false;
            }else{
            angular.forEach($scope.statusFilterItems, function (item) {
         
            // insuredPrice
            $scope.ItemDetails = item;
            // if ($scope.ItemDetails.totalStatedAmount > $scope.ClaimStatusContent.minimumThreshold) {
            //     $scope.CalculateRCV();
            // }else {
                var originalCost = $scope.ItemDetails.unitCost ?? ($scope.ItemDetails.totalStatedAmount/ ($scope.ItemDetails.quantity??1));
                if((originalCost <= $scope.acceptStandardCostThreshold) && !!$scope.ItemDetails.standardCost){
                var twentyPerCost = 0.2 * originalCost;
                var standardReplacementCost;
                if(originalCost>0)
                    standardReplacementCost = originalCost - twentyPerCost <= $scope.ItemDetails.standardCost && 
                                              originalCost + twentyPerCost >= $scope.ItemDetails.standardCost ? $scope.ItemDetails.standardCost : originalCost;
                else
                    standardReplacementCost = $scope.ItemDetails.standardCost;
                if((originalCost - twentyPerCost <= $scope.ItemDetails.standardCost && 
                    originalCost + twentyPerCost >= $scope.ItemDetails.standardCost)&& $scope.ItemDetails.status.status==="CREATED" && standardReplacementCost<60){
                item.adjusterDescription = item.description; 
                $scope.ItemDetails.replaced = true;        
                $scope.ItemDetails.adjusterDescription = $scope.ItemDetails.standardDescription ?? item.description;                
                $scope.ItemDetails.rcv = standardReplacementCost;
                // $scope.ItemDetails.rcvTotal = utilityMethods.parseFloatWithFixedDecimal(standardReplacementCost * $scope.ItemDetails.quantity??1);
                $scope.ItemDetails.replacedItemPrice = standardReplacementCost;
                $scope.ItemDetails.replacementQty = $scope.ItemDetails.quantity ?? 1;
                $scope.ItemDetails.source = $scope.ItemDetails.standardItemSource;
                $scope.CalculateRCV();
                if($scope.ItemDetails.rcvTotal==null){
                $scope.ItemDetails.rcv = standardReplacementCost;
                $scope.ItemDetails.rcvTotal = utilityMethods.parseFloatWithFixedDecimal(standardReplacementCost * $scope.ItemDetails.quantity??1);
                }
            //}
            selectedItems.push($scope.ItemDetails);
             }
            }
        });
            var originalCostTotal = selectedItems.map(item=>item.totalStatedAmount).reduce((a,b)=>a+b,0);
            var standardCostTotal = selectedItems.map(item=>item.rcvTotal).reduce((a,b)=>a+b,0);
    }
     
    if(selectedItems && selectedItems.length <= 0){
         $(".page-spinner-bar").addClass("hide");
         event.stopPropagation();
         toastr.remove();
         toastr.warning("There are no such items to accept standard replacement cost", "Warning");
         GetPostLostItems();   
         return false;
     }
     else{
        bootbox.confirm({
            size: "",
            title: "Accept Standard Costs",
            message: "A total of "+selectedItems.length+" items originally priced at a total of $"
            +originalCostTotal.toFixed(2)+" have standard replacements available for $"+standardCostTotal.toFixed(2)+". Would you like to accept"+
        " the standard costs for these items?",
            closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('Confirm.BtnYes'),
                    className: 'btn-outline green'
                },
                cancel: {
                    label: $translate.instant('Confirm.BtnNo'),
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                if (result) {
                    $(".page-spinner-bar").removeClass("hide");
                    var param = {
                        //"itemIds": $scope.SelectedPostLostItems,
                        "itemStatus": $scope.constants.itemStatus.valued,
                        "claimItems": selectedItems
                    }
                    if(selectedItems.length>0){
                    var getCategories = LineItemService.bulkUpdateStatus(param);
                    getCategories.then(function (success) {
                        // toastr.remove();
                        // toastr.success("success");
                        // toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                        $scope.SelectedPostLostItems = [];
                        Cancel();
                        var res = success.data.data
                        if (res.claimItems) {
                            mapUpdatedItemsToOriginalList(res.claimItems);
                            $scope.calculateSettlement(false);
                            // $scope.statusBasedFilter($scope.FiletrLostDamageList);
                        } else
                            GetPostLostItems();
                        
                        $(".page-spinner-bar").addClass("hide");
                        var msg =selectedItems.length+ " item(s) have been standard prices for a total of $"+standardCostTotal.toFixed(2);
                        // event.stopPropagation();
                        window.setTimeout(function () {
                            toastr.remove();
                            // toastr.success("success");
                            toastr.success(msg);
                        }, 1000);
                       
                        // return false;
                        getClaimsStatusContentDetails();
                    }, function (error) {
                        $(".page-spinner-bar").addClass("hide");
                        $scope.ErrorMessage = error.data.errorMessage;
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });
                    }
                    else
                    {
                        $(".page-spinner-bar").addClass("hide");
                    }
                   }
             }
        });
      }
      GetPostLostItems(); 
      $scope.acceptingStandardCost =false; 
    }

    $scope.handleCheckbx = handleCheckbx;
    function handleCheckbx(){
       var elements= document.getElementsByClassName("status_check");
       $scope.filterStatus = [];
    angular.forEach(elements,function(ele){
    
            if(ele.checked)
            {
                $scope.filterStatus.push(ele.value);
            }
    });
  }

  $scope.handleCancelbx = handleCancelbx;
  function handleCancelbx(flag){
      if(flag ==='status'){
      $scope.displaystatusfiltr = !$scope.displaystatusfiltr;
      $scope.displaycategoryfiltr = false;
      $scope.displaytotalpricefiltr = false;
      $scope.displayvendorfiltr = false;
      $scope.displayItemTagfiltr = false;
      }
      if(flag ==='itemTag'){
        $scope.displayItemTagfiltr = !$scope.displayItemTagfiltr;
        $scope.displaystatusfiltr = false;
        $scope.displaycategoryfiltr = false;
        $scope.displaytotalpricefiltr = false;
        $scope.displayvendorfiltr = false;
        }
      
      else if(flag==='category'){
      $scope.displaycategoryfiltr = !$scope.displaycategoryfiltr;
      $scope.displaystatusfiltr = false;
      $scope.displaytotalpricefiltr = false;
      $scope.displayvendorfiltr = false;
      $scope.displayItemTagfiltr = false;
      }

      else if(flag==='totalprice'){
      $scope.displaytotalpricefiltr = !$scope.displaytotalpricefiltr;
      $scope.displaystatusfiltr = false;
      $scope.displaycategoryfiltr = false;
      $scope.displayvendorfiltr = false;
      $scope.displayItemTagfiltr = false;
      
      }

      else if(flag==='vendor'){
      $scope.displayvendorfiltr = !$scope.displayvendorfiltr;
      $scope.displaystatusfiltr = false;
      $scope.displaycategoryfiltr = false;
      $scope.displaytotalpricefiltr = false;
      $scope.displayItemTagfiltr = false;
      }
  }

  $scope.Filter = Filter;
  function Filter(flag){

    if($scope.filterVendor.length >0 && $scope.filterTotalPrice.length ===4)
    $scope.statusFilterItems = $scope.FiletrLostDamageList.filter(item=>
        $scope.filterStatus.includes(item.status.status)&& 
        $scope.filterCategory.includes(item.category?.name??"Blank") &&
        $scope.filterVendor.includes(item.vendorDetails?.vendorName) &&
        $scope.filterItemTag.includes(item.itemTag?.name??"Blank"));

    else if($scope.filterVendor.length ===0 && $scope.filterTotalPrice.length ===4)
    $scope.statusFilterItems = $scope.FiletrLostDamageList.filter(item=>
        $scope.filterStatus.includes(item.status.status) && 
        $scope.filterCategory.includes(item.category?.name??"Blank") && 
        $scope.filterItemTag.includes(item.itemTag?.name??"Blank"));


    else if($scope.filterTotalPrice.length > 0)
    {
        var temp=[];
        $scope.filterTotalPrice.map(
         function(value)
         {
             let minprice;
             let maxprice;
             var result;
             if(value ==='1')
             {
                minprice =0;
                maxprice = 24.99;
             }
             else if(value ==='2')
             {
                minprice =25;
                maxprice = 99.99;
             }
             else if(value==='3')
             {
                minprice =100;
                maxprice = 999.99;
             }
             else{
                minprice =1000;
             }

             if(maxprice === undefined)
             result = $scope.filterVendor.length > 0 ?
             ($scope.FiletrLostDamageList.filter(item=>
                $scope.filterStatus.includes(item.status.status)&& 
                $scope.filterCategory.includes(item.category?.name??"Blank")&&
                $scope.filterVendor.includes(item.vendorDetails?.vendorName)&&
                item.totalStatedAmount >= minprice && $scope.filterItemTag.includes(item.itemTag?.name??"Blank"))) :
             ($scope.FiletrLostDamageList.filter(item=>
                $scope.filterStatus.includes(item.status.status) && 
                 $scope.filterCategory.includes(item.category?.name??"Blank")&&
                 item.totalStatedAmount >= minprice && $scope.filterItemTag.includes(item.itemTag?.name??"Blank")))
             
             else
             result = $scope.filterVendor.length > 0 ?
             ($scope.FiletrLostDamageList.filter(item=>
                $scope.filterStatus.includes(item.status.status) && 
                $scope.filterCategory.includes(item.category?.name??"Blank")&&
                $scope.filterVendor.includes(item.vendorDetails?.vendorName) &&
                item.totalStatedAmount >= minprice && item.totalStatedAmount <= maxprice && $scope.filterItemTag.includes(item.itemTag?.name??"Blank"))) :
             ($scope.FiletrLostDamageList.filter(item=>
                $scope.filterStatus.includes(item.status.status)&& 
                 $scope.filterCategory.includes(item.category?.name??"Blank")&&
                 item.totalStatedAmount >= minprice && item.totalStatedAmount <= maxprice && $scope.filterItemTag.includes(item.itemTag?.name??"Blank")));

            temp=[...temp,...result];

         }
        );
        $scope.statusFilterItems = [...temp];
    }
    
    $scope.handleCancelbx(flag);


  }

  handleCheck = function(event)
  {
    var checked = event.target.checked;
    var value = event.target.value;
    if( checked && !$scope.filterStatus.includes(value))
    {
        $scope.filterStatus.push(value);
    }
    else if(!checked && $scope.filterStatus.includes(value))
    {
        $scope.filterStatus =$scope.filterStatus.filter((status)=> status!==value)
    }     
    if($scope.filterStatus.length!==$scope.uniqueStatus.length)
    {
        document.getElementById('selectall').checked=false;
    }
    else
    {
        document.getElementById('selectall').checked=true;
    }
  }

  selectAll = function(event) {
      if(event.target.checked)
      {
        $scope.uniqueStatus.forEach(value => {
        handleCheck({target: {value, checked:true}})
      })
      var elements = document.getElementsByClassName('status_check');
        angular.forEach(elements,(ele)=>{ ele.checked=true;})
    }
    else
    {
        $scope.uniqueStatus.forEach(value => {
            handleCheck({target: {value, checked:false}})
        })
        var elements = document.getElementsByClassName('status_check');
            angular.forEach(elements,(ele)=>{ ele.checked=false;})
   }
  }

  handleCheckItemTag = function(event)
  {
    var checked = event.target.checked;
    var value = event.target.value;
    if( checked && !$scope.filterItemTag.includes(value))
    {
        $scope.filterItemTag.push(value);
    }
    else if(!checked && $scope.filterItemTag.includes(value))
    {
        $scope.filterItemTag =$scope.filterItemTag.filter((status)=> status!==value)
    }     
    if($scope.filterItemTag.length!==$scope.uniqueItemTag.length)
    {
        document.getElementById('selectallItemTag').checked=false;
    }
    else
    {
        document.getElementById('selectallItemTag').checked=true;
    }
  }

  selectAllItemTag = function(event) {
      if(event.target.checked)
      {
        $scope.uniqueItemTag.forEach(value => {
            handleCheckItemTag({target: {value, checked:true}})
      })
      var elements = document.getElementsByClassName('itemTag_check');
        angular.forEach(elements,(ele)=>{ ele.checked=true;})
    }
    else
    {
        $scope.uniqueItemTag.forEach(value => {
            handleCheckItemTag({target: {value, checked:false}})
        })
        var elements = document.getElementsByClassName('itemTag_check');
            angular.forEach(elements,(ele)=>{ ele.checked=false;})
   }
  }

  handleCheckCategory = function(event)
  {
    var checked = event.target.checked;
    var value = event.target.value;
    if( checked && !$scope.filterCategory.includes(value))
    {
        $scope.filterCategory.push(value);
    }
    else if(!checked && $scope.filterCategory.includes(value))
    {
        $scope.filterCategory =$scope.filterCategory.filter((category)=> category!==value)
    }     
    if($scope.filterCategory.length!==$scope.uniqueCategory.length)
    {
        document.getElementById('selectallCategory').checked=false;
    }
    else
    {
        document.getElementById('selectallCategory').checked=true;
    }
  }

  selectAllCategory = function(event) {
      if(event.target.checked)
      {
    $scope.uniqueCategory.forEach(value => {
        handleCheckCategory({target: {value, checked:true}})
      })
      var elements = document.getElementsByClassName('cat_check');
      angular.forEach(elements,(ele)=>{ ele.checked=true;})
    }
    else
    {
        $scope.uniqueCategory.forEach(value => {
            handleCheckCategory({target: {value, checked:false}})
        })
        var elements = document.getElementsByClassName('cat_check');
        angular.forEach(elements,(ele)=>{ ele.checked=false;})
   }
  }

  handleCheckVendor = function(event)
  {
    var checked = event.target.checked;
    var value = event.target.value;
    if( checked && !$scope.filterVendor.includes(value))
    {
        $scope.filterVendor.push(value);
    }
    else if(!checked && $scope.filterVendor.includes(value))
    {
        $scope.filterCategory =$scope.filterVendor.filter((vendor)=> vendor!==value)
    }     
    if($scope.filterVendor.length!==$scope.uniqueVendor.length)
    {
        document.getElementById('selectallVendor').checked=false;
    }
    else
    {
        document.getElementById('selectallVendor').checked=true;
    }
  }

  selectAllVendor = function(event) {
      if(event.target.checked)
      {
    $scope.uniqueVendor.forEach(value => {
        handleCheckVendor({target: {value, checked:true}})
      })
      var elements = document.getElementsByClassName('vendor_check');
      angular.forEach(elements,(ele)=>{ ele.checked=true;})
    }
    else
    {
        $scope.uniqueVendor.forEach(value => {
            handleCheckVendor({target: {value, checked:false}})
        })
        var elements = document.getElementsByClassName('vendor_check');
        angular.forEach(elements,(ele)=>{ ele.checked=false;})
   }
  }
  
  handleCheckTotalPrice = function(event)
  {
    var checked = event.target.checked;
    var value = event.target.value;
    if( checked && !$scope.filterTotalPrice.includes(value))
    {
        $scope.filterTotalPrice.push(value);
    }
    else if(!checked && $scope.filterTotalPrice.includes(value))
    {
        $scope.filterTotalPrice =$scope.filterTotalPrice.filter((price)=> price!==value)
    }     
    if($scope.filterTotalPrice.length!==$scope.uniqueTotalPrice.length)
    {
        document.getElementById('selectallTotalPrice').checked=false;
    }
    else
    {
        document.getElementById('selectallTotalPrice').checked=true;
    }
  }

  selectAllTotalPrice = function(event) {
      if(event.target.checked)
      {
    $scope.uniqueTotalPrice.forEach(value => {
        handleCheckTotalPrice({target: {value, checked:true}})
      })
      var elements = document.getElementsByClassName('price_check');
      angular.forEach(elements,(ele)=>{ ele.checked=true;})
    }
    else
    {
        $scope.uniqueTotalPrice.forEach(value => {
            handleCheckTotalPrice({target: {value, checked:false}})
        })
        var elements = document.getElementsByClassName('price_check');
        angular.forEach(elements,(ele)=>{ ele.checked=false;})
   }
  }

  checkAllfilters = function()
  {
    document.getElementById('selectallTotalPrice').checked=true;
    selectAll({'target':{'checked':true}})
    document.getElementById('selectAllVendor').checked=true;
    selectAllVendor({'target':{'checked':true}})
    document.getElementById('selectallCategory').checked=true;
    selectAllCategory({'target':{'checked':true}})
    document.getElementById('selectall').checked=true;
    selectAllTotalPrice({'target':{'checked':true}});
  
  }

  $scope.setItemLimitDetailsFromHOPolicyType = setItemLimitDetailsFromHOPolicyType;
  function setItemLimitDetailsFromHOPolicyType(){
    if(!!$scope.PolicyDetails.categories)
    {
        $scope.categorySpecCovDet = $scope.PolicyDetails.categories.filter((x)=>x.name==$scope.ItemDetails.category.name);
        if(!!$scope.categorySpecCovDet){
            $scope.ItemDetails.individualLimitAmount = $scope.categorySpecCovDet[0] ? $scope.categorySpecCovDet[0].individualItemLimit : 0;
            console.log($scope.ItemDetails.individualLimitAmount);
        }
    }
  }
  

  $scope.countJewelryAndContentItems = countJewelryAndContentItems;
  function countJewelryAndContentItems()
  {
      $scope.VendorArray = $scope.VendorAssignmentList.filter((item)=> $scope.SelectedVendorPostLossItem.includes(item.itemUID));
      $scope.contentItems = $scope.VendorArray.filter((item)=>item?.category?.name!="Jewelry");
      $scope.jewelryItems = $scope.VendorArray.filter((item)=>item?.category?.name=="Jewelry");
      console.log( $scope.contentItems);
      console.log(  $scope.jewelryItems);
  }


  //Add Note popup
  $scope.updateResetUser = updateResetUser;
  function updateResetUser(particiapnt) {
      var obj = {
          "claimId": $scope.CommonObj.ClaimId,
          "ClaimNumber": $scope.CommonObj.ClaimNumber,
          "participant": Object.assign({}, particiapnt)
      };
      $scope.animationsEnabled = true;
      var out = $uibModal.open(
          {
              animation: $scope.animationsEnabled,
              templateUrl: "views/CommonTemplates/UpdateInviteUserPopup.html",
              controller: "UpdateInviteUserPopupController",
              backdrop: 'static',
              keyboard: false,
              resolve:
              {
                  objClaim: function () {
                      return obj;
                  }
              }
          });
      out.result.then(function (value) {
          //Call Back Function success
          if (value === "Success") {
              
          }
          if (value === "Cancel") {
              
          }
      }, function (res) {
          //Call Back Function close
      });
      return {
          open: open
      };
      // }
  }
  //End add note popup
  
});
