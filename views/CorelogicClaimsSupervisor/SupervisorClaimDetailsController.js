angular.module('MetronicApp').controller('SupervisorClaimDetailsController', function ($rootScope, $filter, $uibModal, $window, $scope, $state, $stateParams, settings, $http, $timeout, $location, $translate,
    $translatePartialLoader, AuthHeaderService, SupervisorClaimDetailsService,CorelogicConstants,
    AdjusterPropertyClaimDetailsService, NewClaimService, LineItemsFactory,
    LineItemService, StatusConstants, utilityMethods) {
    //set language
    $translatePartialLoader.addPart('SuperVisorClaimDetails');
    $translate.refresh();
    $scope.coreLogicConst = CorelogicConstants;
    //$scope.pagesize = $rootScope.settings.pagesize;
    //-------------------------------Varaibles----------------------------------------------//
    $scope.CommonObj = {
        ClaimNumber: sessionStorage.getItem("ClaimNo"),
        ClaimId: sessionStorage.getItem("ClaimId"),
        PolicyNumber: sessionStorage.getItem("PolicyNo"),
        UserId: sessionStorage.getItem("UserId"),
        claimNote: "",
        eventNote: "",
        Categories: "ALL",
        Attachment: '',
        EventTitle: "",
        EventDate: $filter('date')(new Date(), "dd/MM/yyyy"),
        EventActive: sessionStorage.getItem("ShowEventActive"),
        NoteActive: sessionStorage.getItem("ShowNoteActive"),
        ClaimProfile: sessionStorage.getItem("claimProfile"),
        ServiceRequests: sessionStorage.getItem("serviceRequests"),
        UserRole: sessionStorage.getItem("RoleList"),
        AssignmentNumber: '',
        isAssignmentDone: false
    };
    $scope.CreateEventObject = {
        "EventDate": null,
        "EventTitle": null,
        "StartTime": null,
        "Endtime": null,
        "EventNote": null
    };
    $scope.indextab = 0;
    $scope.claimStatus = {
        id: 1
    };
    $scope.pagesize = 10;
    $scope.totalItems = 0;
    $scope.pagination = {
        current: 1
    }
    $scope.all = false;
    $scope.allcat = true;
    $scope.alltotalprice = true;
    $scope.allvendor = true;
    $scope.unique = true;
    $scope.uniqueStatus =[];
    $scope.allItemTag = true;
    $scope.acceptStandardCostThreshold = 50;
    $scope.displaystatusfiltr = false;
    $scope.displaycategoryfiltr = false;
    $scope.displaytotalpricefiltr = false;
    $scope.displayvendorfiltr = false;
    $scope.itemPageSize = $rootScope.settings.itemPagesize;
    $scope.CurrentClaimDetailsTab = 'ContentList';
    $scope.ClaimDetailstab = "Notes";
    $scope.currentAttchment = null;
    $scope.ClaimStatusInvoiceDetails = [];
    $scope.ClaimStatusContent = [];
    $scope.ClaimAttachments = [];
    $scope.ClaimParticipantsList = []; //We are adding vendor list to this object which is used for autocomplete extender
    $scope.ParticipantId = null;
    $scope.ParticipantName = "";
    $scope.ErrorMessage = "";
    $scope.FiletrLostDamageList = [];
    $scope.VendorAssignmentList = [];
    $scope.AssginmentDetails = {};
    $scope.OriginalPostLossItem = [];
    $scope.ItemAssignmentList = [];
    $scope.DdlSourceCategoryList = [];
    $scope.LostDamagedContentByCategory = [];
    $scope.SubCategory = [];
    $scope.VendorsAgainstClaim = [];
    $scope.ClaimNotes = [];
    $scope.SelectedPostLostItems = [];
    $scope.EventList = [];
    $scope.PolicyDetails = [];
    $scope.ServiceRequestList = [];
    $scope.FiletrLostDamageList = [];
    $scope.NewlyAddedItemId = null;
    //$scope.sortKey = "claimItem.id"//setting by defult sorting by created date
    sessionStorage.setItem("SelectedItemList", $scope.SelectedPostLostItems);
    sessionStorage.setItem("ServiceRequestId", "")
    //Pending task list
    $scope.PendingTaskList = [];
    $scope.selected = {};
    $scope.displayEvent = true;
    $scope.displayNotes = false;
    $scope.displayParticipant = false;
    $scope.displayOrigionalItems = true;
    $scope.displayContentList = false;
    $scope.reverseIcon = true;
    $scope.reverse = false;
    $scope.displayClaimDetails = false;
    $scope.displayAddAttachmentbtn = true;
    $scope.displayClaimFileName = false;
    $scope.AddNewItem = false;
    $scope.EditItem = false;
    $scope.tab = sessionStorage.getItem('claimDetailsCurrentTab') && sessionStorage.getItem('claimDetailsCurrentTab') != null && sessionStorage.getItem('claimDetailsCurrentTab') != "" ? sessionStorage.getItem('claimDetailsCurrentTab') : 'Contents'; //For displaying active tab at the page load
    $scope.editAssignedClaimDetail = {};
    $scope.editServicesRequested = false;
    $scope.ShowAssignmentDetails = false;
    $scope.countOfinvoces = 0;
    $scope.paidInvoiceCount = 0;
    $scope.totalInvoiceAmount = 0;
    $scope.totalInvoicePaidAmount = 0;
    $scope.getNumberOfRec = 20;
    //Get Item status
    $scope.constants = {
        itemStatus: StatusConstants.ItemStatus,
        invoiceStatus: StatusConstants.InvoiceStatus
    };

    //---------------------//
    $scope.limit = 30;
    $scope.moreShown = false;
    $scope.desclimit = 30;
    $scope.descMoreShown = false;
    var itemCategoryIds = [];
    $scope.reverseVendorsList = false;
    $scope.vendorSortKey = '';
    $scope.searchVendorsKeyword = '';

    // Pagination
    $scope.totalVendors = 0;
    $scope.currentPage = 1;
    $scope.vendorPage = 1;
    $scope.lastRowCount = 0;
    $scope.ItemsSelectedForAssignments = [];
    $scope.VendorName = "Artigem";
    //----------Sorting of datatbale--------------------------------------------------------------//
    $scope.sortServiceRequest = function (keyname) {
        $scope.sortServiceRequestKey = keyname; //set the sortKey to the param passed
        $scope.sortServiceRequestreverse = !$scope.sortServiceRequestreverse; //if true make it false and vice versa
    }

    $scope.sortpostlostitem = function (keyname) {
        // CTB-3514 - Disabled 
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;
    }

    $scope.sortVendor = function (keyname) {
        $scope.sortVendorKey = keyname;
        $scope.reverseVendor = !$scope.reverseVendor;
    }

    $scope.sortClaimDetails = function (keyname) {
        $scope.sortClaimDetailsKey = keyname;
        $scope.reverseClaimDetails = !$scope.reverseClaimDetails;
    }

    // Sort vendors List
    $scope.sortVendors = function (keyname) {
        $scope.reverseVendorsList = ($scope.vendorSortKey === keyname) ? !$scope.reverseVendorsList : false;
        $scope.vendorSortKey = keyname; //set the sortKey to the param passed
        GetVendorsList();
    }

    $scope.fromSearch = false;
    var pageName = "SUPERVISOR_CLAIM_DETAILS";
    //----------Sorting of datatbale--------------------------------------------------------------//

    // Claim snap shot and Activities > CTB-2704
    $scope.totalMessages = 0;
    var currentMessagePage = 1;
    var totalMessagePages = 0;
    $scope.isMessagesLoading = false;
    var scrollItemsLimit = 10;

    //Default participants list
    $scope.defaultRecepients = [];
    $scope.claimMessages = [];
    $scope.reffererPage = sessionStorage.getItem("refferer");

    //--------------page load function-------------------------------------------------------------//
    function init() {
        $scope.CommonObj.ClaimNumber = sessionStorage.getItem("ClaimNo");
        $scope.CommonObj.ClaimId = sessionStorage.getItem("ClaimId");
        $scope.ShowAssignmentsList = true;
        $scope.backPage = sessionStorage.getItem("BackPage");
        $scope.useStatusFilter = $scope.backPage === "SupervisorAllClaim" || $scope.backPage === "Performance" ? true : false;
        $scope.claimCreatedDate = sessionStorage.getItem('ClaimCreatedDate') ? sessionStorage.getItem('ClaimCreatedDate') : '';
        $scope.newInvoiceTab = sessionStorage.getItem('newInvoiceTab');
        if ($scope.newInvoiceTab) {
            sessionStorage.removeItem('newInvoiceTab');
            getInvoice();
            return false;
        }
        if ($scope.CommonObj.ClaimId != null || $scope.CommonObj.ClaimNumber != null) {
            $(".page-spinner-bar").removeClass("hide");
            // Service request for claim
            getServiceRequestList();
            if ($scope.CommonObj.ClaimProfile == "Jewelry") {
                getShippingMethods();
            } else {
                $scope.selected = {
                    isScheduledItem: false,
                    category: {
                        id: null
                    }
                };
            }
            // get claim notes API New-#126
            getMessages();
            getRequestList();
            GetCategory();
            showContents();
            getClaimParticipants();
            GetCompanyBranchList();
            getPolicyDetails();
            GetPendingTaskList();
            // // Get Claim Status
            // $scope.ClaimStatusList = [];
            // var claimStatusList = SupervisorClaimDetailsService.GetClaimStatusList();
            // claimStatusList.then(function (success) {
            //     $scope.ClaimStatusList = success.data.data;
            //     $scope.SetCurrentStageID();
            // }, function (error) { })
            //By default showing notes or events tab opened if redirected from alert tab to this page
            if ($scope.CommonObj.EventActive !== "" || $scope.CommonObj.NoteActive !== "") {
                if ($scope.CommonObj.EventActive === "true" && $scope.CommonObj.NoteActive === "false") {
                    $scope.ClaimDetailstab = 'Event';
                    if($scope.reffererPage != 'SEARCH_RESULT')
                    $scope.tab = sessionStorage.getItem('claimDetailsCurrentTab') && sessionStorage.getItem('claimDetailsCurrentTab') != null && sessionStorage.getItem('claimDetailsCurrentTab') != "" ? sessionStorage.getItem('claimDetailsCurrentTab') : 'Contents'; //For displaying active tab at the page load
                } else if ($scope.CommonObj.EventActive === "false" && $scope.CommonObj.NoteActive === "true") {
                    $scope.ClaimDetailstab = 'Notes';
                    if($scope.reffererPage != 'SEARCH_RESULT')
                    $scope.tab = sessionStorage.getItem('claimDetailsCurrentTab') && sessionStorage.getItem('claimDetailsCurrentTab') != null && sessionStorage.getItem('claimDetailsCurrentTab') != "" ? sessionStorage.getItem('claimDetailsCurrentTab') : 'Contents'; //For displaying active tab at the page load
                }
            } else {
                $scope.ClaimDetailstab = 'Notes';
                if (angular.isDefined(sessionStorage.getItem("ActiveVendorAssignment"))) {
                    $scope.name = sessionStorage.getItem("ActiveVendorAssignment");
                    if ($scope.name === "true") {
                        $scope.tab = 'Vendor Assignments';
                        showAllReplacementQuotes();
                        $scope.ShowAssignments = true;
                        $scope.ShowAssignmentsList = false;
                        sessionStorage.setItem("ActiveVendorAssignment", "")
                    } else {
                        if($scope.reffererPage != 'SEARCH_RESULT')
                        $scope.tab = 'Contents';
                        sessionStorage.setItem("ActiveVendorAssignment", "")
                    }
                } else {
                    if($scope.reffererPage != 'SEARCH_RESULT')
                    $scope.tab = 'Contents';
                    sessionStorage.setItem("ActiveVendorAssignment", "")
                }
            }
        } else {
            $location.url('SupervisorDashboard'); //if session data is lost then redirect to previous page
        }
        if (sessionStorage.getItem("refferer") === "SEARCH_RESULT") {
            $scope.fromSearch = true;
        }
        var assignment = {
            assignmentNumber: sessionStorage.getItem("assignementObject"),
            vendorDetails: {
                registrationNumber: sessionStorage.getItem("vrn")
            }
        };
        if (assignment.assignmentNumber) {
            sessionStorage.removeItem("assignementObject");
            OpenAssignmentDetails(assignment);
        }

        GetSubCategoryList();

        if($scope.CommonObj.ClaimProfile.toLowerCase()!="jewelry")
            calculateSettlement(false);
        if($scope.tab == 'Vendor Assignments'){
            vendorAssigmentTab();
        }
    }
    init();

    $scope.nextRecords = function () {
        $scope.getNumberOfRec += 20;
    }
    function getServiceRequestList() {
        var Claimparam = {
            "claimId": $scope.CommonObj.ClaimId
        };
        var serviceRequestList = SupervisorClaimDetailsService.getServiceRequestList(Claimparam);
        serviceRequestList.then(function (success) {
            $scope.FilteredList = $filter('filter')(success.data.data, { isDelete: false });
            $scope.ServiceRequestList = $scope.FilteredList;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    //---------End page load function--------------------------------------------------------------//
    $scope.showContents = showContents;
    function showContents() {
        if($scope.reffererPage != 'SEARCH_RESULT')
        $scope.tab = 'Contents';
        $(".page-spinner-bar").removeClass("hide");
        getClaimsStatusContentDetails();
        //get post lost items #162
        GetPostLostItems();
        //$scope.ShowAssignmentsList = false;
        $scope.ShowAssignmentDetails = false;
        resetItemListSelection();
        $(".page-spinner-bar").addClass("hide");
    }
    function getClaimStatusInvoiceDetails() {
        //get claim status details for invoice section API #155
        var paramClaimId = {
            "id": $scope.CommonObj.ClaimId,
            "claimNumber": $scope.CommonObj.ClaimNumber
        };
        var getpromise = SupervisorClaimDetailsService.getClaimsStatusInvoiceDetails(paramClaimId);
        getpromise.then(function (success) {
            $scope.ClaimStatusInvoiceDetails = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    $scope.calculateMaxItemNo = calculateMaxItemNo;
    function calculateMaxItemNo() {
        $scope.selected.itemNumber = parseInt($scope.FiletrLostDamageList == null ? 0 : $scope.FiletrLostDamageList.length) + 1;
    }
    $scope.SetCurrentStageID = function () {
        $scope.ClaimStatusList = $filter('orderBy')($scope.ClaimStatusList, 'stageNumber');
        angular.forEach($scope.ClaimStatusList, function (item) {
            if ($scope.PolicyDetails && $scope.PolicyDetails.claimStatus && $scope.PolicyDetails.claimStatus.id == item.id) {
                $scope.CurrentStageNumber = item.stageNumber;
                $scope.PolicyDetails.claimStatus.status = item.status;
            }
        });
    };

    $scope.GetvendorList = GetvendorList;
    function GetvendorList() {
        var param = {
            "claimId": $scope.CommonObj.ClaimId,
            "companyId": sessionStorage.getItem('CompanyId'),
        };
        var getAllVendorInvoices = SupervisorClaimDetailsService.getAllVendorListForClaim(param);
        getAllVendorInvoices.then(function (success) {
            $scope.VendorList = success.data.data;
        }, function (error) { });
    };

    $scope.GetVendorAllInvoices = GetVendorAllInvoices;
    function GetVendorAllInvoices() {
        var param = {
            "claimId": $scope.CommonObj.ClaimId,
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "assignmentNumber": sessionStorage.getItem('assignmentNumber')
        };
        sessionStorage.removeItem('assignmentNumber');
        var getAllVendorInvoices = SupervisorClaimDetailsService.getAllVendorInvoices(param);
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
            $(".page-spinner-bar").addClass("hide");
        }, function (error) { });
        $(".page-spinner-bar").addClass("hide");
    };

    $scope.getMessages = getMessages;
    function getMessages(event) {
        var param = {
            "claimId": $scope.CommonObj.ClaimId,
            "page": currentMessagePage,
            "limit": scrollItemsLimit
        }
        var getpromise = SupervisorClaimDetailsService.getClaimMessages(param);
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

    $scope.GetPostLostItems = GetPostLostItems;
    function GetPostLostItems() {
        $scope.itemsLoading = true;
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "claimId": $scope.CommonObj.ClaimId,
            // if claim is from search result no need to restring by claim status
            // "itemStatus": $scope.reffererPage == 'SEARCH_RESULT' ? null : ($scope.useStatusFilter ? null : $scope.constants.itemStatus.underReview), // List only 'UNDER REVIEW'
            "pageNumber": $scope.currentPage,
            "limit": $scope.pageSize,
        }
        var getpromise = SupervisorClaimDetailsService.getPostLostItemsWithComparables(param);
        getpromise.then(function (success) {
            $scope.creaAssignmentFlag = false;
            $scope.FiletrLostDamageList = [];
            if (success.data.data != null) {
                $scope.FiletrLostDamageList = success.data.data;
                $scope.statusFilterItems = success.data.data;
                $scope.itemsLoading = false;
                
                mapFilterLostDamageList(param);
            } else {
                $scope.itemsLoading = false;
                $scope.noItems = true;
            }

            $scope.uniqueStatus=[];
            $scope.filterStatus=[];
            $scope.uniqueStatus = [...new Set($scope.statusFilterItems.map(item => item.status.status))];
            $scope.uniqueStatus = $scope.uniqueStatus.filter((status)=> !!status)
            $scope.filterStatus =[...$scope.uniqueStatus]

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
            angular.forEach($scope.FiletrLostDamageList, function(item){
                item.adjusterDescription= item.adjusterDescription && item.adjusterDescription!=null ? item.adjusterDescription : '';
              })
            
            
            $(".page-spinner-bar").addClass("hide");
            $scope.itemsLoading = false;
            if($scope.reffererPage != 'SEARCH_RESULT' && $scope.reffererPage != 'SupervisorAllClaim' && $scope.backPage!='Performance')
                showOnlyUnderReview();

        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }

    function mapFilterLostDamageList(param) {
        $scope.totalItems = $scope.toShowingPage = $scope.FiletrLostDamageList.length;
        // var totPage = Math.ceil($scope.totalItems / 20);
        // if ($scope.currentPage == 1) {
        //     if ($scope.totalItems >= 20)
        //         $scope.toShowingPage = 20;
        //     else
        //         $scope.toShowingPage = $scope.totalItems;
        // } else {
        //     if (totPage == $scope.currentPage) {
        //         var shwRecds = $scope.totalItems - ((totPage - 1) * 20);
        //         $scope.toShowingPage = shwRecds + ($scope.itemPageSize * ($scope.currentPage - 1))
        //     } else {
        //         $scope.toShowingPage = 20 + ($scope.itemPageSize * ($scope.currentPage - 1))
        //     }
        // }
        var tempList = [];
        $scope.TotalOfACVs = 0;
        $scope.TotalOfRCVs = 0;
        $scope.TotalOfCashExpo = 0;
        $scope.TotalOfHoldoverPaid = 0;
        $scope.TotalOfHoldoverRemaining = 0;
        $scope.TotalOfCashPaid = 0;
        $scope.TotalOfReplExpo = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            item.itemNumber = Number(item.itemNumber);
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

            item.associateName = "";
            if (item && item.status && item.status.id === 4) {
                item.isQuoteSubmittedByVendor = true;
            } else {
                item.isQuoteSubmittedByVendor = false;
            }
            if (item.ageMonths != null && item.ageMonths != " " && item.ageMonths != "") {
                item.ageMonths = parseInt(item.ageMonths);
            }
            else {
                item.ageMonths = 0;
            }
            if (item.ageYears != null && item.ageYears != " " && item.ageYears != "") {
                item.ageYears = parseInt(item.ageYears);
            }
            else {
                item.ageYears = 0;
            }
            if (item.status.status != $scope.constants.itemStatus.assigned || item.status.status != $scope.constants.itemStatus.approved ||
                item.status.status != $scope.constants.itemStatus.settled || item.status.status != $scope.constants.itemStatus.replaced) {
                $scope.creaAssignmentFlag = false;
            }
            if (item.vendorAssociate) {
                item.associateName = item.vendorAssociate.lastName + ", " + item.vendorAssociate.firstName
            }
            // Calculate of Total ACVs / RCVs
            if (item.acv != null) {
                $scope.TotalOfACVs += item.acv;
            }
            if (item.comparableItems != null && item.comparableItems[0].unitPrice != null) {
                $scope.TotalOfRCVs += item.comparableItems[0].unitPrice;
            }

            if (item.isActive) {
                tempList.push(item)
            }
        });
        if (tempList.length > 0) {
            $scope.FiletrLostDamageList = angular.copy(tempList);
        }
        // $scope.currentPageNo = success.data.data.currentPageNumber;
        // $scope.totalItems = parseInt(success.data.data.totalPageSize) * parseInt($scope.pagesize);
        $scope.OriginalPostLossItem = $scope.FiletrLostDamageList;
        $scope.LostDamagedContentByCategory = $scope.FiletrLostDamageList;
        $scope.VendorAssignmentList = $scope.FiletrLostDamageList; //Used for vendor assignment tab
        $scope.ContentServiceList = [];
        // store item list in a factory
        LineItemsFactory.addItemsToList(angular.copy($scope.statusFilterItems), param);
        //$scope.GetVendorsList();
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
                    //         if (Origionalitem.category != null && angular.isDefined(Origionalitem.category)) {
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

    $scope.GetCategory = GetCategory;
    function GetCategory() {
        var getpromise = SupervisorClaimDetailsService.getCategories();
        getpromise.then(function (success) {
            $scope.DdlSourceCategoryList = success.data.data;
            if ($scope.CommonObj.ClaimProfile == 'Jewelry') {
                $scope.selected = {
                    isScheduledItem: false,
                    category: {
                        id: parseInt(sessionStorage.getItem("CurrentCategoryJewelryId")),
                        aggregateLimit: null
                    },
                    individualLimitAmount: sessionStorage.getItem("IndividualLimitJewelryCat"),
                    aggregateLimit: null,
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
                //To set jewelry profile by default
                GetSubCategory();
            }
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.AddEditItem = AddEditItem;
    function AddEditItem(item, operation) {
        if ($scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry") {
            sessionStorage.setItem("IndividualLimitJewelryCat", (($scope.PolicyDetails.claimIndividualLimit != null && $scope.PolicyDetails.claimIndividualLimit != "") ? $scope.PolicyDetails.claimIndividualLimit : 0))
        }
        $scope.animationsEnabled = true;
        var data = {
            "CommonObj": $scope.CommonObj,
            "PolicyDetails": $scope.PolicyDetails,
            "Category": $scope.DdlSourceCategoryList,
            "isEditItem": operation === 'EDIT' ? true : false,
            "Item": operation === 'EDIT' ? item : null,
            "ShippingMethods": $scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry" ? $scope.shippingMethodsList : null,
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
                //scope: $scope,
                transclude: false,
                resolve:
                {
                    objData: function () {
                        return data;
                    }
                }
            });
        out.result.then(function (value) {
            //Call Back Function success
            if(value =="Updated"){
                calculateSettlement(); 
            }
            else
            GetPostLostItems();
            $scope.FiletrLostDamageList = LineItemsFactory.getItemsList().originalItemsList;
            mapFilterLostDamageList({ "claimNumber": $scope.CommonObj.ClaimNumber });
            //Call Back Function success
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }

    $scope.CancelAddNewItem = CancelAddNewItem;
    function CancelAddNewItem() {
        $scope.AddNewItem = false;
    }

    $scope.getTemplate = function (item) {
        return 'display';
    };

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
                individualLimitAmount: sessionStorage.getItem("IndividualLimitJewelryCat")
            };
            $scope.GetSubCategory();
        } else {
            $scope.selected = {
                isScheduledItem: false
            };
        }
        $scope.addOtherRetailer = false;
    };


    $scope.OriginalPostLossIndex = 0;
    // $scope.EditItemDetails = function (item) {
    //     $scope.AddNewItem = false;
    //     $scope.EditItem = false;
    //     $scope.selected = {};
    //     $scope.selected = angular.copy(item.claimItem);
    //     $scope.OriginalPostLossIndex = $scope.FiletrLostDamageList.indexOf(item);
    //     $scope.OriginalPostLossItem = angular.copy(item);
    //     $scope.GetCategory();
    //     $scope.GetSubCategory();
    // };
    $scope.EditItemDetails = function (item) {
        $scope.AddNewItem = false;
        $scope.EditItem = false;
        $scope.ItemFiles = [];
        $scope.EditItemFiles = [];

        if ($scope.EditItemFiles == null || $scope.EditItemFiles.length == 0) {
            angular.forEach(item.attachments, function (attachment) {
                $scope.EditItemFiles.push({
                    "FileName": attachment.name,
                    "url": attachment.url
                })
            });
        }
        $scope.selected = {};
        $scope.selected = angular.copy(item.claimItem);
        $scope.selected.category.aggregateLimit = $scope.selected.categoryLimit;

        $scope.selected.appraisalDate = ((angular.isDefined($scope.selected.appraisalDate) && $scope.selected.appraisalDate !== null && $scope.selected.appraisalDate != "") ? $filter('DateFormatMMddyyyy')($scope.selected.appraisalDate) : null);
        $scope.OriginalPostLossIndex = $scope.FiletrLostDamageList.indexOf(item);
        $scope.OriginalPostLossItem = angular.copy(item);

        if ($scope.CommonObj.ClaimProfile == 'Contents') {
            $scope.GetCategory();
            $scope.GetSubCategory();
        }

        if (item.room) {
            $scope.selected.room = {
                "id": item.room ? item.room.id : null,
                "roomName": item.room ? item.room.roomName : null
            }
        }
        if (item.originallyPurchasedFrom) {
            var index = $scope.Retailers.findIndex(retailer => retailer.name === item.originallyPurchasedFrom.name);
            if (index <= -1)
                getRetailers();
            $scope.selected.originallyPurchasedFrom = {
                "id": item.originallyPurchasedFrom ? item.originallyPurchasedFrom.id : null,
                "name": item.originallyPurchasedFrom ? item.originallyPurchasedFrom.name : null
            }
            if (item.originallyPurchasedFrom.name === 'Other')
                $scope.addOtherRetailer = true;
        }
        $scope.selected.purchaseMethod = item.purchaseMethod ? item.purchaseMethod : null;
        $scope.selected.giftFrom = item.giftedFrom ? item.giftedFrom : null;

        //$scope.EditItemFiles = item.attachments;
    };


    $scope.deletedItemAttachments = [];
    $scope.RemoveAttachment = RemoveAttachment;
    function RemoveAttachment(index) {
        $("#ItemFileUpload").val('');
        // if ($scope.attachmentList.length > 0) {
        //     $scope.attachmentList.splice(index, 1);
        // }
        if ($scope.ItemFiles.length > 0) {
            var deletedItem = $scope.ItemFiles[index];
            if (angular.isDefined(deletedItem.imageId)) {
                $scope.deletedItemAttachments.push({ "id": deletedItem.imageId });
            }
            $scope.ItemFiles.splice(index, 1);
        }
        if ($scope.CommonObj.ClaimProfile == 'Jewelry')
            $scope.AddItemForm.$setDirty();
        else
            $scope.AddContentsItemForm.$setDirty();
    };


    // $scope.GetEventList = GetEventList;
    // function GetEventList() {
    //     // Get events for Claims
    //     var paramClaimId = {
    //         "id": $scope.CommonObj.ClaimId
    //     }
    //     var EventListPromise = SupervisorClaimDetailsService.GetEventList(paramClaimId);
    //     EventListPromise.then(function (success) {
    //         // $scope.EventList = $filter('filter')(success.data.data, { claim: {id: $scope.CommonObj.ClaimId}});

    //         $scope.EventList = [];
    //         $scope.EventList = success.data.data;
    //         //Getting participant list as string
    //         angular.forEach($scope.EventList, function (event) {

    //             event.particiapntsTstring = '';
    //             angular.forEach(event.participants, function (participant, key) {
    //                 participant.firstName = ((participant.firstName == null) ? participant.firstName = "" : participant.firstName);
    //                 participant.lastName = ((participant.lastName == null) ? participant.lastName = "" : participant.lastName);

    //                 event.particiapntsTstring += participant.firstName + " " + participant.lastName
    //                 if (key != event.participants.length - 1) {
    //                     event.particiapntsTstring += ',';
    //                 }
    //             });

    //         });
    //     }, function (error) {
    //         $(".page-spinner-bar").addClass("hide");
    //         $scope.ErrorMessage = error.data.errorMessage;
    //     })
    // }

    $scope.getVendorsAgainstClaim = getVendorsAgainstClaim;
    function getVendorsAgainstClaim() {
        // get active vendors against claim with all details for binding to grid
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber
        }
        var getpromise = SupervisorClaimDetailsService.getVendorsAgainstClaimDetails(param);
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
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
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
        angular.forEach($scope.participantsForEvent, function (item) {
            ParticipantIds.push({
                "id": item.ParticipantId
            });
        });
        var paramEvent = {
            "id": null,
            "claim": {
                "id": $scope.CommonObj.ClaimId
            },
            "createDate": null,
            "endTiming": returnDateForEvent($scope.CreateEventObject.EventDate, $scope.CreateEventObject.Endtime), //"2017-01-11T12:10:30Z"
            "isDone": false,
            "isReschedule": false,
            "item": {
                "id": null
            },
            "nativeEvent": {},
            "purpose": $scope.CreateEventObject.EventNote,
            "reScheduleEvents": null,
            "startTiming": returnDateForEvent($scope.CreateEventObject.EventDate, $scope.CreateEventObject.StartTime), //"2017-01-12T12:00:00Z".toISOString()
            "title": $scope.CreateEventObject.EventTitle,
            "participants": ParticipantIds,
            "organizer": {
                "id": sessionStorage.getItem("UserId")
            }
        };

        var EventPromise = SupervisorClaimDetailsService.CreateEvent(paramEvent);
        EventPromise.then(function (success) {
            var paramClaimId = {
                "id": $scope.CommonObj.ClaimId
            };
            var EventListPromise = SupervisorClaimDetailsService.GetEventList(paramClaimId);
            EventListPromise.then(function (success) {
                // $scope.EventList = $filter('filter')(success.data.data, { claim: {id: $scope.CommonObj.ClaimId}});
                $scope.EventList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
            bootbox.alert({
                size: "",
                title: $translate.instant("AlertMessage.ClaimAttachmentTitle"),
                closeButton: false,
                message: success.data.message,
                className: "modalcustom",
                callback: function () {
                    /* your callback code */
                }
            });
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    //Showing claim attachment details
    $scope.ClaimAttachmentDetails = function (attachment) {
        $scope.animationsEnabled = true;
        var vm = this;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            size: "md",
            templateUrl: "views/ClaimsSupervisor/ShowClaimAttachmentDetails.html",
            controller: "ShowClaimAttachmentController",
            backdrop: 'static',
            keyboard: false,

            resolve: {
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
    $scope.NotesAttachmentDetails = function (attachment) {
        $scope.animationsEnabled = true;
        var vm = this;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            size: "md",
            templateUrl: "views/ClaimsSupervisor/ShowNoteAttachmentDetails.html",
            controller: "ShowNotesAttachmentController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
                items: function () {

                    return attachment;
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
    $scope.GetItemsByCategory = function (e) {

        $scope.TempObj = [];
        var index_of_ALL = $scope.CommonObj.Categories.find((ele)=> ele==="ALL");
        if($scope.CommonObj.Categories.length >=0 && angular.isUndefined(index_of_ALL) )
        {
            $scope.CommonObj.Categories.map( (category_id)=>{
                angular.forEach($scope.LostDamagedContentByCategory, function (value) {
                if ($scope.CommonObj.Categories != null && value.category !== null) {
                    
                    if (value.category.id == category_id) {
                        $scope.TempObj.push(value);
                    }
                }
            });
            //$scope.FiletrLostDamageList = $scope.TempObj;
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
        } else {
            $scope.DeleteListLostDamageItem.push(item);
        }
    }

    $scope.DeletItem = function (obj) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('ClaimDetails_Delete.Title'),
            message: $translate.instant('ClaimDetails_Delete.Message'),
            closeButton: false,
            className: "modalcustom",
            buttons: {
                confirm: {
                    label: $translate.instant('ClaimDetails_Delete.BtnYes'),
                    className: 'btn-outline green'
                },
                cancel: {
                    label: $translate.instant('ClaimDetails_Delete.BtnNo'),
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                if (result) {
                    var param = {
                        "id": obj.id,
                        "itemUID": obj.itemUID
                    }
                    var response = SupervisorClaimDetailsService.removePostLostItem(param);
                    response.then(function (success) { //Filter list and remove item

                        var index = $scope.FiletrLostDamageList.indexOf(obj);
                        if (index > -1) {
                            $scope.FiletrLostDamageList.splice(index, 1);
                            toastr.remove()
                            toastr.success(success.data.message, "Confirmation");
                        }
                    }, function (error) {

                        toastr.remove()
                        toastr.error(error.data.errorMessage, "Error");


                    });
                }
            }
        });
    }

    //Add Note popup
    $scope.AddNotePopup = AddNotePopup;
    function AddNotePopup(message, operation) {
        //if ($scope.ClaimParticipantsList.length > 0) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ParticipantList": $scope.ClaimParticipantsList.filter(function (cp) {
                if (cp.emailId != sessionStorage.getItem("UserName"))
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
                    ApproveClaim(operation);
                $scope.claimMessages = [];
                $scope.getMessages();
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
        // if ($scope.ClaimParticipantsList.length > 0) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/AddEventPopup.html",
            controller: "AddEventPopupController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
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
        // }

    }
    //End Event popup
    $scope.AddRequestPopup = AddRequestPopup;
    function AddRequestPopup(ev) {
        //if ($scope.ClaimParticipantsList.length > 0) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/AddRequestPopup.html",
            controller: "AddRequestPopupController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
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
        //}
    }

    $scope.getRequestList = getRequestList;
    function getRequestList() {
        var paramClaimId = {
            "id": $scope.CommonObj.ClaimId
        }
        var requestListPromise = AdjusterPropertyClaimDetailsService.GetRequestList(paramClaimId);
        requestListPromise.then(function (success) {
            $scope.requestList = [];
            $scope.requestList = success.data.data;
            //Getting accepted event
            angular.forEach($scope.requestList, function (request) {
                //event.IsPaticiapntAccepted = "false";
                if (request.organizer.id == parseInt($scope.CommonObj.UserId)) {

                    request.IsPaticiapntAccepted = "creator";
                } else {
                    angular.forEach(request.participants, function (participant, key) {
                        if (participant.id == parseInt($scope.CommonObj.UserId)) {
                            if (participant.isAccepted == true) {
                                request.IsPaticiapntAccepted = "true";
                            } else if (participant.isAccepted == null) {
                                request.IsPaticiapntAccepted = "pending";
                            } else if (participant.isAccepted == false) {
                                request.IsPaticiapntAccepted = "false";
                            }
                        }
                    });
                }
            });

            //Getting participant list as string
            // angular.forEach($scope.requestList, function (request) {
            //     request.particiapntsTstring = '';
            //     angular.forEach(request.participants, function (participant, key) {
            //         participant.firstName = ((participant.firstName == null) ? participant.firstName = "" : participant.firstName);
            //         participant.lastName = ((participant.lastName == null) ? participant.lastName = "" : participant.lastName);

            //         request.particiapntsTstring += participant.firstName + " " + participant.lastName
            //         if (key != request.participants.length - 1) {
            //             request.particiapntsTstring += ',';
            //         }
            //     });
            // });
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        })
    }
    $scope.GetRequestDetails = function (request) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList,
            "request": angular.copy(request)
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/RequestDetails.html",
            controller: "RequestDetailsController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
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

    $scope.SelectedPostLostItems = [];
    //Assigning post lost item to specialist
    $scope.AssignPostLostItem = function () {

        sessionStorage.setItem("SelectedItemList", $scope.SelectedPostLostItems);
        $location.url('SupervisorAssignPostLostItem')
    }

    $scope.OpenAddNewVendorModel = function (e) {
        $scope.animationsEnabled = true;
        var ClaimObj = [];
        ClaimObj.push({
            ClaimId: $scope.CommonObj.ClaimId,
            ClaimNumber: $scope.CommonObj.ClaimNumber
        });

        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            size: "lg",
            templateUrl: "views/ClaimsSupervisor/AddNewVendor.html",
            controller: "AddNewVendorController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
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


    // Create task list to cretae pending task
    $scope.dynamicPopover = {
        isOpen: false,
        html: true,
        templateUrl: "myPopoverTemplate.html",
        open: function open() {
            $scope.dynamicPopover.isOpen = true;
            // $("[data-toggle=popover]").popover();
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
            "claimId": $scope.CommonObj.ClaimId.toString(),
            claimPendingTasks: $scope.CreatePendingTasksObjList
        };
        // $scope.dynamicPopover.close();
        var CreateTask = SupervisorClaimDetailsService.CreatePendingtask(param);
        CreateTask.then(function (success) {
            $scope.dynamicPopover.close();
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");

        });
    }

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
                if(
                //     // !(item.status.id === 4 && item.status.status === $scope.constants.itemStatus.valued) &&
                !(item.status.id === 6 && item.status.status === $scope.constants.itemStatus.settled)
                // !(item.status.id === 2 && item.status.status === $scope.constants.itemStatus.assigned)) 
                )               
                // {
                $scope.statusFilterItems[itemindex].Selected = true;
                // }
                $scope.SelectPostLostItem($scope.statusFilterItems[itemindex]);
            }
        }
        else if($scope.lastChecked[$scope.lastChecked.length-1] > $index)
        {
            for(i=$scope.lastChecked[$scope.lastChecked.length-1];i>=$index;i--)
            {
                item = filterlist[i];
                itemindex = $scope.statusFilterItems.indexOf(item);
                if(
                //     // !(item.status.id === 4 && item.status.status === $scope.constants.itemStatus.valued) &&
                !(item.status.id === 6 && item.status.status === $scope.constants.itemStatus.settled) 
                // !(item.status.id === 2 && item.status.status === $scope.constants.itemStatus.assigned))
                // {
                   )
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


    //End Task
    $scope.SelectPostLostItem = function (item) {
        var flag = 0;
        $scope.creaAssignmentFlag = true;

        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                flag++;
            }
        });
        var flagNew = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (angular.isDefined(item.status) && item.status != null) {
                if (item.status.status != $scope.constants.itemStatus.underReview || item.status.id != 3) {
                    flagNew++;
                }
            }
        });

        var flagNew = 0;
        var flagOldSelected = false;
        angular.forEach($scope.statusFilterItems, function (item) {
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

        if (flag != flagNew) {
            $scope.selectedAll = false;
        } else if (flag == flagNew) {
            $scope.selectedAll = true;
        }
    }

    $scope.selectedAll = false;
    $scope.checkAll = function (isSelectedAll) {
        $scope.creaAssignmentFlag= true;
        $scope.selectedAll = isSelectedAll;
        $scope.SelectedPostLostItems = [];
        var valuedCnt = 0;
        var mapReceiptsCount = 0;
        if ($scope.selectedAll) {
            // $scope.selectedAll = true;
            /* Item status with ASSIGNED, APPROVED, SETTLED, REPLACED should not be included
               Only Item status with CREATED, UNDER REVIEW , VALUED included for create assignment
            */
            angular.forEach($scope.statusFilterItems, function (item) {
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
                if ((item.status.id == 4 || item.status.status === $scope.constants.itemStatus.valued))
                    valuedCnt++;
                if ((item.status.id == 4 || item.status.status === $scope.constants.itemStatus.valued) &&
                    (item.status.id == 8 || item.status.status === $scope.constants.itemStatus.paid)) {
                    mapReceiptsCount++;
                }
            });
            if ($scope.statusFilterItems.length == valuedCnt)
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
        angular.forEach($scope.statusFilterItems, function (item) {
            if ((item.status.id != 2 || item.status.status != $scope.constants.itemStatus.assigned) &&
                // (item.status.id != 4 || item.status.status != $scope.constants.itemStatus.valued) &&
                (item.status.id != 5 || item.status.status != $scope.constants.itemStatus.approved) &&
                (item.status.id != 6 || item.status.status != $scope.constants.itemStatus.settled) &&
                (item.status.id != 7 || item.status.status != $scope.constants.itemStatus.replaced) &&
                (item.status.id != 8 || item.status.status != $scope.constants.itemStatus.workInProgress)) {
                item.Selected = $scope.selectedAll;
            }
        });

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

        // Enable Create Assignment Button
        // if (itemCategoryIds != null && itemCategoryIds.length > 0) {
        //     $scope.creaAssignmentFlag = true;
        // } else {
        //     $scope.creaAssignmentFlag = false;
        // }
    };
    //End code for claim line item selection



    //--Redirection------------------------//

    $scope.GotoNewServiceRequest = function () {
        sessionStorage.setItem("AdjusterClaimId", $scope.CommonObj.ClaimId)
        $location.url('SupervisorServiceRequest');
    }
    //Service requested
    $scope.GoToServiceRequestEdit = function (item) {
        if (item.serviceRequestId !== null && angular.isDefined(item.serviceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", item.serviceRequestId);
            sessionStorage.setItem("SupervisorClaimId", $scope.CommonObj.ClaimId);
            $location.url('SuperVisorServiceRequestEdit');
        }
    }
    $scope.GotoAssign = function (item) {
        if (item.serviceRequestId !== null && angular.isDefined(item.serviceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", item.serviceRequestId);
            $location.url('SuperVisorAssignServiceRequest');
        }
    }

    $scope.GotoItemStteled = function () {

        //  $location.url('ItemsSetteled');

    }
    $scope.GotoItemToBeStteled = function () {

        // $location.url('ItemsToBeSetteled');

    }
    $scope.HoldoverDetails = function () {
        //  $location.url('ItemsHoldover');
    }
    $scope.GotoVendorInvoices = function () {
        sessionStorage.setItem("ClaimNo", $scope.CommonObj.ClaimNumber);
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        $location.url('VendorInvoices');
    }
    $scope.GoToDetails = function (item) {
        $(".page-spinner-bar").removeClass("hide");
        sessionStorage.setItem("SupervisorPostLostItemId", item.id);
        sessionStorage.setItem("AdjusterPostLostItemId", item.id);
        let index = $scope.FiletrLostDamageList.findIndex(function (i) {
            return i.id === item.id;
        })
        sessionStorage.setItem("pageIndex", index + 1);
        $location.url('SupervisorLineItemDetails');

    }
    $scope.home = function () {
        sessionStorage.setItem("SupervisorClaimId", "");
        sessionStorage.setItem("SelectedItemList", "");
        sessionStorage.setItem("ShowEventActive", "");
        sessionStorage.setItem("ShowNoteActive", "");
        sessionStorage.removeItem("postLostItems");
        //$window.history.back();
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.GoToBack = function () {
        $location.url('SupervisorClaimDetails');
    }

    $scope.ItemsToBeSetteled = function () {
        //   $location.url('ItemsToBeSetteled');
    }
    //--End Redirection--------------------//

    //Delete ServiceRequest
    //Delete service request
    $scope.Deleteservicerequest = Deleteservicerequest;
    function Deleteservicerequest(ServiceObject) {
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
                        "serviceId": ServiceObject.serviceRequestId
                    };
                    var Deleteservice = SupervisorClaimDetailsService.DeleteServiceRequest(paramDelete);
                    Deleteservice.then(function (success) {
                        if (success.data.status === 200) {
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
    //End Service Request

    $scope.SaveItemDetails = function (itemid) {
        if (!angular.isUndefined(itemid)) {
            var param = new FormData();
            var fileDetails = [];
            angular.forEach($scope.ItemFiles, function (ItemFile) {
                fileDetails.push({
                    "fileName": ItemFile.FileName,
                    "fileType": ItemFile.FileType,
                    "extension": ItemFile.FileExtension,
                    "filePurpose": "ITEM",
                    "latitude": null,
                    "longitude": null
                })
                param.append('file', ItemFile.File);
            });
            if ($scope.ItemFiles.length == 0 || $scope.ItemFiles == null) {
                param.append('filesDetails', null);
                param.append('file', null);
            } else {
                param.append('filesDetails', JSON.stringify(fileDetails));
            }
            param.append("itemDetails",
                JSON.stringify({
                    "acv": $scope.selected.acv,
                    "acvTax": $scope.selected.acvTax,
                    "acvTotal": $scope.selected.acvTotal,
                    "adjusterDescription": $scope.selected.adjusterDescription,
                    "ageMonths": $scope.selected.ageMonths,
                    "ageYears": $scope.selected.ageYears,
                    "approvedItemValue": $scope.selected.approvedItemValue,
                    "assignedTo": $scope.selected.assignedTo,
                    "brand": $scope.selected.brand,
                    "category": {
                        "annualDepreciation": $scope.selected.category && $scope.selected.category.annualDepreciation ? $scope.selected.category.annualDepreciation : null,
                        "id": $scope.selected.category && $scope.selected.category.id ? $scope.selected.category.id : null,
                        "name": $scope.selected.category && $scope.selected.category.id ? GetCategoryOrSubCategoryOnId(true, $scope.selected.category.id) : null,
                        "description": $scope.selected.category && $scope.selected.category.description ? $scope.selected.category.description : null,
                        "usefulYears": $scope.selected.category && $scope.selected.category.usefulYears ? $scope.selected.category.usefulYears : null,
                        "aggregateLimit": $scope.selected.category && $scope.selected.category.aggregateLimit ? $scope.selected.category.aggregateLimit : null
                    },
                    "claimId": $scope.selected.claimId,
                    "claimNumber": $scope.selected.claimNumber,
                    "dateOfPurchase": (($scope.selected.dateOfPurchase !== null && angular.isDefined($scope.selected.dateOfPurchase)) ? $scope.selected.dateOfPurchase : null),
                    "depriciationRate": $scope.selected.depriciationRate,
                    "description": $scope.selected.description,
                    "holdOverPaymentDate": $scope.selected.holdOverPaymentDate,
                    "holdOverPaymentMode": $scope.selected.holdOverPaymentMode,
                    "holdOverPaymentPaidAmount": $scope.selected.holdOverPaymentPaidAmount,
                    "holdOverValue": $scope.selected.holdOverValue,
                    "id": $scope.selected.id,
                    "itemNumber": $scope.selected.itemNumber,
                    "insuredPrice": $scope.selected.insuredPrice,
                    "isReplaced": $scope.selected.isReplaced,
                    "isScheduledItem": $scope.selected.isScheduledItem,
                    "scheduleAmount": $scope.selected.scheduleAmount,
                    "itemName": $scope.selected.itemName,
                    "itemType": $scope.selected.itemType,
                    "model": $scope.selected.model,
                    "paymentDetails": $scope.selected.paymentDetails,
                    "quantity": $scope.selected.quantity,
                    "quotedPrice": $scope.selected.insuredPrice,
                    "rcv": $scope.selected.rcv,
                    "rcvTax": $scope.selected.rcvTax,
                    "rcvTotal": $scope.selected.rcvTotal,
                    "receiptValue": $scope.selected.receiptValue,
                    "status": {
                        "id": $scope.selected.status.id,
                        "status": $scope.selected.status.status
                    },
                    "subCategory": {
                        "annualDepreciation": $scope.selected.subCategory && $scope.selected.subCategory.annualDepreciation ? $scope.selected.subCategory.annualDepreciation : null,
                        "id": $scope.selected.subCategory && $scope.selected.subCategory.id ? $scope.selected.subCategory.id : null,
                        "name": $scope.selected.subCategory && $scope.selected.subCategory.id ? GetCategoryOrSubCategoryOnId(false, $scope.selected.subCategory.id) : null,
                        "description": $scope.selected.subCategory && $scope.selected.subCategory.description ? $scope.selected.subCategory.description : null,
                        "usefulYears": $scope.selected.subCategory && $scope.selected.subCategory.usefulYears ? $scope.selected.subCategory.usefulYears : null,
                        "aggregateLimit": $scope.selected.subCategory && $scope.selected.subCategory.aggregateLimit ? $scope.selected.subCategory.aggregateLimit : null,
                    },
                    "taxRate": $scope.selected.taxRate,
                    "totalTax": $scope.selected.totalTax,
                    "valueOfItem": $scope.selected.valueOfItem,
                    "vendorDetails": $scope.selected.vendorDetails,
                    "yearOfManufecturing": $scope.selected.yearOfManufecturing,
                    "totalStatedAmount": parseFloat($scope.selected.insuredPrice) * parseFloat(($scope.selected.quantity !== null && angular.isDefined($scope.selected.quantity) ? $scope.selected.quantity : (1))),
                    "individualLimitAmount": $scope.selected.individualLimitAmount ? $scope.selected.individualLimitAmount : null,
                    // Originally purchased from, purhase method, If gifted then donor's name and address
                    "originallyPurchasedFrom": $scope.selected.originallyPurchasedFrom,
                    "room": $scope.selected.room,
                    "newRetailer": $scope.selected.newRetailer ? $scope.selected.newRetailer : null,
                    "giftedFrom": $scope.selected.giftedFrom ? $scope.selected.giftedFrom : null,
                    "purchaseMethod": $scope.selected.purchaseMethod ? $scope.selected.purchaseMethod : null

                }));
            param.append('file', null);
            var UpdatePostLoss = SupervisorClaimDetailsService.UpdatePostLoss(param);
            UpdatePostLoss.then(function (success) {
                var obj = MakeObjectToAddInList(success);
                obj.status.status = $scope.OriginalPostLossItem.status.status;
                obj.isReplaced = $scope.OriginalPostLossItem.isReplaced;
                $scope.FiletrLostDamageList[$scope.OriginalPostLossIndex].claimItem = angular.copy(obj);
                toastr.remove();
                toastr.success("Item # " + $scope.selected.itemNumber + " successfully updated", "Success");
                //$scope.reset();
            },
                function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                });
        } else { //Call Api save And get its id then assign id and pass
            var param = new FormData();
            var param = new FormData();
            calculateMaxItemNo();
            angular.forEach($scope.ItemFiles, function (ItemFile) {
                param.append('filesDetails', JSON.stringify([{
                    "fileName": ItemFile.FileName,
                    "fileType": ItemFile.FileType,
                    "extension": ItemFile.FileExtension,
                    "filePurpose": "ITEM",
                    "latitude": null,
                    "longitude": null
                }]));
                param.append('file', ItemFile.File);
            });
            param.append("itemDetails",
                JSON.stringify({
                    "acv": null,
                    "acvTax": null,
                    "acvTotal": null,
                    "adjusterDescription": null,
                    "ageMonths": $scope.selected.ageMonths,
                    "ageYears": $scope.selected.ageYears,
                    "assignedTo": null,
                    "brand": null,
                    "category": {
                        "annualDepreciation": null,
                        "id": $scope.selected.category && $scope.selected.category.id ? $scope.selected.category.id : null,
                        "name": $scope.selected.category && $scope.selected.category.id ? GetCategoryOrSubCategoryOnId(true, $scope.selected.category.id) : null,
                        "description": null,
                        "usefulYears": null,
                        "aggregateLimit": null
                    },
                    "claimId": $scope.CommonObj.ClaimId, //Need to pass the claimId
                    "claimNumber": $scope.CommonObj.ClaimNumber,
                    "dateOfPurchase": (($scope.selected.dateOfPurchase !== null && angular.isDefined($scope.selected.dateOfPurchase)) ? $scope.selected.dateOfPurchase : null),
                    "depriciationRate": null,
                    "description": $scope.selected.description,
                    "holdOverPaymentDate": null,
                    "holdOverPaymentMode": null,
                    "holdOverPaymentPaidAmount": null,
                    "holdOverValue": null,
                    "id": null,
                    "itemNumber": null, //$scope.selected.itemNumber
                    "insuredPrice": $scope.selected.insuredPrice,
                    "isReplaced": null,
                    "isScheduledItem": $scope.selected.isScheduledItem,
                    "scheduleAmount": $scope.selected.scheduleAmount,
                    "itemName": $scope.selected.itemName,
                    "itemType": null,
                    "model": null,
                    "paymentDetails": null,
                    "quantity": $scope.selected.quantity,
                    "quotedPrice": $scope.selected.insuredPrice,
                    "rcv": null,
                    "rcvTax": null,
                    "rcvTotal": null,
                    "receiptValue": null,
                    "status": {
                        "id": null,
                        "status": null
                    },
                    "subCategory": {
                        "annualDepreciation": null,
                        "id": $scope.selected.subCategory && $scope.selected.subCategory.id ? $scope.selected.subCategory.id : null,
                        "name": $scope.selected.subCategory && $scope.selected.subCategory.id ? GetCategoryOrSubCategoryOnId(false, $scope.selected.subCategory.id) : null,
                        "description": null,
                        "usefulYears": null,
                        "aggregateLimit": null
                    },
                    "taxRate": null,
                    "totalTax": null,
                    "valueOfItem": null,
                    "yearOfManufecturing": null,
                    "vendorDetails": null,
                    "totalStatedAmount": parseFloat($scope.selected.insuredPrice) * parseFloat(($scope.selected.quantity !== null && angular.isDefined($scope.selected.quantity) ? $scope.selected.quantity : (1))),
                    "individualLimitAmount": (angular.isDefined($scope.selected.individualLimitAmount) ? $scope.selected.individualLimitAmount : null),
                    // Originally purchased from, purhase method, If gifted then donor's name and address
                    "originallyPurchasedFrom": $scope.selected.originallyPurchasedFrom,
                    "room": $scope.selected.room,
                    "newRetailer": $scope.selected.newRetailer ? $scope.selected.newRetailer : null,
                    "giftedFrom": $scope.selected.giftedFrom ? $scope.selected.giftedFrom : null,
                    "purchaseMethod": $scope.selected.purchaseMethod ? $scope.selected.purchaseMethod : null
                }));

            var SavePostLossItem = SupervisorClaimDetailsService.AddPostLossItem(param);
            SavePostLossItem.then(function (success) {
                //Need to pass the ItemId which will generate after inserting item
                $scope.NewlyAddedItemId = success.data.data.id;
                $scope.EditItemFiles = [];
                $scope.NewlyAddedItemId = success.data.data.id;
                $scope.GetPostLostItems();

                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.reset();
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }

    };
    //Make object to be add or replace after save or edit item details
    function MakeObjectToAddInList(success) {
        return {
            "id": success.data.data.id,
            "itemUID": success.data.data.itemUID,
            "itemNumber": success.data.data.itemNumber,
            "acv": success.data.data.acv,
            "adjusterDescription": success.data.data.adjusterDescription,
            "ageMonths": success.data.data.ageMonths,
            "ageYears": success.data.data.ageYears,
            "assignedTo": success.data.data.assignedTo,
            "brand": success.data.data.brand,
            "category": {
                "id": ((success.data.data.category !== null && angular.isDefined(success.data.data.category)) ? success.data.data.category.id : null),
                "name": ((success.data.data.category !== null && angular.isDefined(success.data.data.category)) ? GetCategoryOrSubCategoryOnId(true, success.data.data.category.id) : null),
                "annualDepreciation": null,
                "usefulYears": null
            },
            "claimId": success.data.data.claimId,
            "claimNumber": success.data.data.claimNumber,
            "dateOfPurchase": success.data.data.dateOfPurchase,
            "depriciationRate": success.data.data.depriciationRate,
            "description": success.data.data.description,
            "holdOverValue": success.data.data.holdOverValue,
            "insuredPrice": success.data.data.insuredPrice,
            "isReplaced": success.data.data.isReplaced,
            "isScheduledItem": success.data.data.isScheduledItem == true ? true : false,
            "scheduleAmount": success.data.data.scheduleAmount,
            "itemName": success.data.data.itemName,
            "itemType": success.data.data.itemType,
            "model": success.data.data.model,
            "paymentDetails": success.data.data.paymentDetails,
            "quantity": success.data.data.quantity,
            "quotedPrice": success.data.data.insuredPrice,
            "rcv": success.data.data.rcv,
            "status": {
                "id": success.data.data.status.id,
                "status": ""
            },
            "subCategory": {
                "id": ((success.data.data.subCategory !== null && angular.isDefined(success.data.data.subCategory)) ? success.data.data.subCategory.id : null),
                "name": ((success.data.data.subCategory !== null && angular.isDefined(success.data.data.subCategory)) ? GetCategoryOrSubCategoryOnId(false, success.data.data.subCategory.id) : null),
                "annualDepreciation": null,
                "usefulYears": null
            },

            "taxRate": success.data.data.taxRate,
            "totalTax": success.data.data.totalTax,
            "valueOfItem": success.data.data.valueOfItem,
            "vendorDetails": success.data.data.vendorDetails,
            "yearOfManufecturing": success.data.data.yearOfManufecturing
        }



    }
    //get Category name on category id for showing in grid of post loss itemd
    function GetCategoryOrSubCategoryOnId(OpertionFlag, id) {
        if (id !== null && angular.isDefined(id)) {
            if (OpertionFlag) {
                var list = $filter('filter')($scope.DdlSourceCategoryList, {
                    categoryId: id
                });
                return list[0].categoryName;
            } else {
                var list = $filter('filter')($scope.SubCategory, {
                    id: id
                });
                if (list.length > 0)
                    return list[0].name;
                else
                    return null;
            }
        } else
            return null;
    }

    $scope.GetSubCategory = GetSubCategory;
    function GetSubCategory() {
        if ($scope.selected.category != null && angular.isDefined($scope.selected.category)) {
            var param = {
                "categoryId": $scope.selected.category.id
            };
            var respGetSubCategory = SupervisorClaimDetailsService.getSubCategory(param);
            respGetSubCategory.then(function (success) {
                $scope.SubCategory = success.data.data;
            }, function (error) {
                $scope.SubCategory = null;
                $scope.ErrorMessage = error.data.errorMessage
            });
        }
    }

    //Upload post loss item from file
    $scope.UploadPostLossItem = function () {
        if ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber)) {
            sessionStorage.setItem("UploadClaimNo", $scope.CommonObj.ClaimNumber);
            $location.url('UploadItemsFromCSV')
        }
    }
    //Get Claim Form Task
    function GetPendingTaskList() {
        var paramUserTaskListList = {
            "claimId": $scope.CommonObj.ClaimId
        };
        var GetPendingTaskPromise = SupervisorClaimDetailsService.GetPendingTask(paramUserTaskListList);
        GetPendingTaskPromise.then(function (success) {
            $scope.PendingTaskList = success.data.data;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });

    };
    //Create new ClaimTash (Claim Form)
    $scope.AddClaimForm = AddClaimForm;
    function AddClaimForm() {
        var obj = {
            "ClaimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "PolicyType": $scope.PolicyDetails.policyType
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/NewClaimFormPopup.html",
            controller: "NewClaimFormPopupController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
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

    };

    //Get event details
    $scope.GetEventDetails = function (event) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList,
            "event": angular.copy(event)
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/EventDetails.html",
            controller: "EventDetailsController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
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
    }
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

    $scope.GotoAllNotes = GotoAllNotes;
    function GotoAllNotes(message) {
        if (($scope.CommonObj.ClaimId !== null && angular.isDefined($scope.CommonObj.ClaimId)) && ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber))) {
            sessionStorage.setItem("AllNoteClaimId", $scope.CommonObj.ClaimId);
            sessionStorage.setItem("AllNoteClaimNumber", $scope.CommonObj.ClaimNumber);
            if (message)
                sessionStorage.setItem("selectedMessageGrp", JSON.stringify(message));
            $location.url('AllNotes');
        }
    };

    //Goto Report
    $scope.GoToReport = GoToReport;
    function GoToReport() {
        sessionStorage.setItem("ReportClaimNo", $scope.CommonObj.ClaimNumber);
        $location.url('Report');
    };

    //For note details
    $scope.GetNoteDetails = function (item) {
        var obj = {
            "Note": angular.copy(item),
            "ParticipantList": $scope.ClaimParticipantsList,
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/AllNotes/NoteDetails.html",
            controller: "NoteDetailsController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
                NoteObj: function () {
                    return obj;
                }
            }

        });
        out.result.then(function (value) {
            $scope.getMessages();
        }, function (res) { });
        return {
            open: open
        };
    };

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

    };



    $scope.OpenPaymentPopUp = OpenPaymentPopUp;
    function OpenPaymentPopUp(VendorId, invoice) {
        var InvoiceObj = {
            VendorId: VendorId,
            Invoice: angular.copy(invoice)
        }
        $scope.animationsEnabled = true;

        var out = $uibModal.open({
            size: 'lg',
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/InvoicePaymentPopup.html",
            controller: "InvoicePaymentPopupController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
                InvoiceObj: function () {
                    InvoiceObj = InvoiceObj;
                    return InvoiceObj;
                }
            }

        });
        out.result.then(function (value) {
            if (value == "Success") {
                $scope.GetVendorAllInvoices();
            }
        }, function (res) { });
        return {
            open: open
        };

    }

    $scope.GotoInvoiceDetails = function (invoice) {
        if (invoice.invoiceNumber !== null && angular.isDefined(invoice.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": invoice.invoiceNumber,
                "ClaimNo": $scope.CommonObj.ClaimNumber,
                "InvoicesToBePaid": $scope.TotalInvoicesToBePaid,
                "PageName": "SupervisorClaimDetails"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }
    };

    $scope.SortVendorInvoice = function (key) {
        $scope.sortInvoiceKey = key;
        $scope.reverseInvoice = !$scope.reverseInvoice
    }

    $scope.SortVendor = function (key) {
        $scope.sortVendorKey = key;
        $scope.reverseVendor = !$scope.reverseVendor
    }


    $scope.SortClaimForm = function (key) {
        $scope.sortClaimFormKey = key;
        $scope.reversesortClaimFormKey = !$scope.reversesortClaimFormKey
    };
    $scope.sortVendorreverse = false;
    $scope.sortVendorKey = "startDate";
    $scope.sortVendorList = function (keyname) {
        $scope.sortVendorKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    $scope.sortVendorreverses = true;
    $scope.sortVendorKeys = "itemsInHand";
    $scope.sortVendorLists = function (keyname) {
        $scope.sortVendorKeys = keyname; //set the sortKey to the param passed
        $scope.sortVendorreverses = !$scope.sortVendorreverses; //if true make it false and vice versa
    }

    $scope.VendorListInVendor = VendorListInVendor;
    function VendorListInVendor() {
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
        };
        var getAllVendorList = SupervisorClaimDetailsService.getVendorWorkingonClaim(param);
        getAllVendorList.then(function (success) {
            $scope.VendorListInVndor = success.data.data;
        }, function (error) { });
    };

    $scope.ApproveClaim = ApproveClaim;
    function ApproveClaim(operation) {
        $(".page-spinner-bar").removeClass("hide");
        var items = [];
        if (operation && operation === 'ITEMS') {
            angular.forEach($scope.SelectedPostLostItems, function (item) {
                items.push({
                    "itemId": item
                })
            });
        }
        if (angular.isDefined($scope.CommonObj.ClaimId) && $scope.CommonObj.ClaimId !== null) {
            var param = {
                "claimId": $scope.CommonObj.ClaimId,
                "items": operation && operation === 'ITEMS' && items.length ? items : null,
            };
            var approveClaim = SupervisorClaimDetailsService.ApproveAssignedClaim(param);
            approveClaim.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                if (operation === 'ITEMS') {
                    $scope.SelectedPostLostItems = [];
                    getClaimsStatusContentDetails();
                    GetPostLostItems();
                } else
                    $location.url(sessionStorage.getItem('HomeScreen'));
            }, function (error) {
                toastr.remove();
                toastr.error((error.data !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage(), "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }

    }

    $scope.selected.isScheduledItem = false;
    $scope.SelectScheduledItem = SelectScheduledItem;
    function SelectScheduledItem(val) {
        if (val == true) {
            $scope.ScheduledItem = true;
        } else if (val == false) {
            $scope.ScheduledItem = false;
        }
    }

    $scope.ReAssign = ReAssign;
    function ReAssign() {
        $scope.animationsEnabled = true;
        $scope.items = "Testing Pas Value";
        var vm = this;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/AdjusterReAssign.html",
            controller: "AdjusterReAssignController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
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
    };
    //New for service seleted


    //For vendor item assignments

    //Assign post losss item
    $scope.PricingSpecialist = [];
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
        var VendorList = SupervisorClaimDetailsService.getVendorList(param);
        VendorList.then(function (success) {
            $scope.PricingSpecialist = [];
            $scope.totalVendors = 0;
            if (success.data.data) {
                var resData = success.data.data;
                $scope.totalVendors = resData && resData.totalVendors > 0 ? resData.totalVendors : 0;
                if ($scope.vendorPage == 1) {
                    $scope.lastRowCount = resData.totalPageSize;
                } else {
                    $scope.lastRowCount = resData.totalPageSize + ($scope.pageSize * ($scope.vendorPage - 1));
                    // var currentListLength = ($scope.currentPage - 1) * $scope.pageSize;
                    // if (currentListLength != $scope.appraisalInvoices.length) {
                    //     $scope.appraisalInvoices = new Array(currentListLength).fill(new Object());
                    // }
                }
                if (angular.isDefined(resData.companyVendors) && resData.companyVendors != null) {
                    angular.forEach(resData.companyVendors, function (vendor) {
                        if (angular.isDefined(vendor.specializedCategories) && vendor.specializedCategories != null && vendor.specializedCategories.length > 0) {
                            var specialities = [];
                            angular.forEach(vendor.specializedCategories, function (item) {
                                specialities.push(item.speciality);
                                vendor.specializedCategories = specialities.join(', ');
                            });
                        }
                        $scope.PricingSpecialist.push(vendor);
                        $scope.ContentServiceList = [];
                    });
                }
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to get vendor details. please try again.", "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    };

    $scope.GoToVendorAssignment = GoToVendorAssignment;
    function GoToVendorAssignment() {
        if ($scope.SelectedPostLostItems.length > 0) {
            $scope.VendorAssignmentList = []; $scope.SelectedVendorPostLossItem = [];
            angular.forEach($scope.SelectedPostLostItems, function (selected) {
                //var lostItem = $scope.FiletrLostDamageList.find(FiletrLostDamageItem => FiletrLostDamageItem.claimItem.id === selected);
                var lostItem = $scope.FiletrLostDamageList.filter(function (filetrLostDamageItem) {
                    return filetrLostDamageItem.id == selected
                })[0];
                if (lostItem) {
                    lostItem.Selected = true;
                    $scope.VendorAssignmentList.push(lostItem);
                    $scope.SelectedVendorPostLossItem.push(lostItem.itemUID);
                }
            });
            $scope.ItemsSelectedForAssignments = $scope.VendorAssignmentList;
            $scope.selectedAllVendorItem = true;
            //$scope.SelectedVendorPostLossItem = $scope.SelectedPostLostItems;
            $scope.tab = 'Vendor Assignments';
            $scope.ShowAssignments = true;
            $scope.ShowAssignmentsList = false;
            GetVendorsList();
        } else {
            $scope.selectedAllVendorItem = false;
            $scope.VendorAssignmentList = angular.copy($scope.FiletrLostDamageList);
            $scope.tab = 'Vendor Assignments';
            $scope.ShowAssignments = true;
            $scope.ShowAssignmentsList = false;
        }
        GetStates();
        $scope.SelectCategory();
    }

    $scope.SelectedVendorPostLossItem = [];
    $scope.SelectVendorPostLostItem = function (item) {
        var flag = $scope.VendorAssignmentList.filter(i => i.selected).length;
        var flagNew = 0;
        angular.forEach($scope.VendorAssignmentList, function (vaItem) {
            if (vaItem.claimItem.status) {
                // if ((item.claimItem.status.id != 3 || item.claimItem.status.status != 'UNDER REVIEW') && ((item.claimItem.status.id != 2 || item.claimItem.status.status != 'ASSIGNED'))) {
                //     flagNew++;
                // }
                if ((vaItem.claimItem.status.id != 2 || vaItem.claimItem.status.status != $scope.constants.itemStatus.assigned) &&
                    (vaItem.claimItem.status.id != 4 || vaItem.claimItem.status.status != $scope.constants.itemStatus.valued) &&
                    (vaItem.claimItem.status.id != 5 || vaItem.claimItem.status.status != $scope.constants.itemStatus.approved) &&
                    (vaItem.claimItem.status.id != 6 || vaItem.claimItem.status.status != $scope.constants.itemStatus.settled) &&
                    (vaItem.claimItem.status.id != 7 || vaItem.claimItem.status.status != $scope.constants.itemStatus.replaced) &&
                    (vaItem.claimItem.status.id != 8 || vaItem.claimItem.status.status != $scope.constants.itemStatus.workInProgress)) {
                    flagNew++;
                }
            }
        });
        if (flag != flagNew) {
            $scope.selectedAllVendorItem = false;
        } else if (flag == flagNew) {
            $scope.selectedAllVendorItem = true;
        }
        var index = $scope.SelectedVendorPostLossItem.indexOf(item.claimItem.itemUID);
        if (index > -1) {
            var itemsOfSimilarCategory = 0;
            $scope.SelectedVendorPostLossItem.splice(index, 1);
            angular.forEach($scope.ItemsSelectedForAssignments, function (itemInList) {
                angular.forEach($scope.SelectedVendorPostLossItem, function (itemUID) {
                    if (itemInList.claimItem.itemUID === itemUID && (item.claimItem.category && itemInList.claimItem.category ? itemInList.claimItem.category.id === item.claimItem.category.id : true))
                        itemsOfSimilarCategory++;
                });
            });
            if (itemsOfSimilarCategory == 0 && item.claimItem.category) {
                var selectedCategoryIndex = $scope.SelectedCategories.findIndex(originalList => originalList.name === item.claimItem.category.name);
                if (selectedCategoryIndex > -1)
                    $scope.SelectedCategories.splice(index, 1);
            }
            // remove category from category filter
            // var filterIndex = item.claimItem.category ? itemCategoryIds.indexOf(item.claimItem.category.id) : -1;
            // if (filterIndex > -1)
            //     itemCategoryIds.splice(filterIndex, 1);
        }
        else {
            $scope.SelectedVendorPostLossItem.push(item.claimItem.itemUID);
            // Get list of vendors filtering based on selected item categories
            index = item.claimItem.category ? $scope.SelectedCategories.findIndex(originalList => originalList.name === item.claimItem.category.name) : 0;
            if (index <= -1) {
                $scope.SelectedCategories.push({
                    id: item.claimItem.category.id,
                    name: item.claimItem.category.name
                });
                // push category item category List
                // itemCategoryIds.push(item.claimItem.category.id)
            }
        }
        if ($scope.VendorAssignmentList.length === $scope.ItemsSelectedForAssignments.length)
            $scope.SelectCategory();
        else {
            $scope.TotalStatedValue = 0.00;
            angular.forEach($scope.ItemsSelectedForAssignments, function (item) {
                if (item.Selected) {
                    $scope.TotalStatedValue += item.claimItem.insuredPrice;
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
                $scope.TotalStatedValue += item.rcv;
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

    // $scope.selectedAllVendorItem = false;
    // $scope.checkAllVendorItem = function () {
    //     $scope.SelectedVendorPostLossItem = [];
    //     if ($scope.selectedAllVendorItem) {
    //         $scope.selectedAllVendorItem = true;
    //         angular.forEach($scope.VendorAssignmentList, function (item) {
    //             if ((item.claimItem.status.id != 3 || item.claimItem.status.status != 'UNDER REVIEW') && ((item.claimItem.status.id != 2 || item.claimItem.status.status != 'ASSIGNED'))) {
    //                 $scope.SelectedVendorPostLossItem.push(item.claimItem.itemUID);
    //                 itemCategoryIds.push(item.claimItem.category.id);
    //             }
    //         });
    //     } else {
    //         $scope.selectedAllVendorItem = false;
    //         $scope.SelectedVendorPostLossItem = [];
    //         itemCategoryIds = [];
    //     }
    //     angular.forEach($scope.VendorAssignmentList, function (item) {
    //         if ((item.claimItem.status.id != 3 || item.claimItem.status.status != 'UNDER REVIEW') && ((item.claimItem.status.id != 2 || item.claimItem.status.status != 'ASSIGNED'))) {
    //             item.Selected = $scope.selectedAllVendorItem;
    //         }
    //     });
    //     GetVendorsList();
    //     $scope.SelectCategory();
    // };

    $scope.selectedAllVendorItem = false;
    $scope.checkAllVendorItem = function () {
        $scope.SelectedVendorPostLossItem = [];
        if ($scope.selectedAllVendorItem) {
            $scope.selectedAllVendorItem = true;
            angular.forEach($scope.VendorAssignmentList, function (item) {
                if ((item.claimItem.status.id != 2 || item.claimItem.status.status != $scope.constants.itemStatus.assigned) &&
                    (item.claimItem.status.id != 4 || item.claimItem.status.status != $scope.constants.itemStatus.valued) &&
                    (item.claimItem.status.id != 5 || item.claimItem.status.status != $scope.constants.itemStatus.approved) &&
                    (item.claimItem.status.id != 6 || item.claimItem.status.status != $scope.constants.itemStatus.settled) &&
                    (item.claimItem.status.id != 7 || item.claimItem.status.status != $scope.constants.itemStatus.replaced) &&
                    (item.claimItem.status.id != 8 || item.claimItem.status.status != $scope.constants.itemStatus.workInProgress)) {
                    $scope.SelectedVendorPostLossItem.push(item.claimItem.itemUID);
                    // if (item.claimItem.category)
                    //     itemCategoryIds.push(item.claimItem.category.id);
                }
            });
        } else {
            $scope.selectedAllVendorItem = false;
            $scope.SelectedVendorPostLossItem = [];
            itemCategoryIds = [];
        }
        angular.forEach($scope.VendorAssignmentList, function (item) {
            if ((item.claimItem.status.id != 2 || item.claimItem.status.status != $scope.constants.itemStatus.assigned) &&
                (item.claimItem.status.id != 4 || item.claimItem.status.status != $scope.constants.itemStatus.valued) &&
                (item.claimItem.status.id != 5 || item.claimItem.status.status != $scope.constants.itemStatus.approved) &&
                (item.claimItem.status.id != 6 || item.claimItem.status.status != $scope.constants.itemStatus.settled) &&
                (item.claimItem.status.id != 7 || item.claimItem.status.status != $scope.constants.itemStatus.replaced) &&
                (item.claimItem.status.id != 8 || item.claimItem.status.status != $scope.constants.itemStatus.workInProgress)) {
                item.Selected = $scope.selectedAllVendorItem;
            }
        });

        angular.forEach($scope.ItemsSelectedForAssignments, function (item) {
            if ((item.claimItem.status.id != 2 || item.claimItem.status.status != $scope.constants.itemStatus.assigned) &&
                (item.claimItem.status.id != 4 || item.claimItem.status.status != $scope.constants.itemStatus.valued) &&
                (item.claimItem.status.id != 5 || item.claimItem.status.status != $scope.constants.itemStatus.approved) &&
                (item.claimItem.status.id != 6 || item.claimItem.status.status != $scope.constants.itemStatus.settled) &&
                (item.claimItem.status.id != 7 || item.claimItem.status.status != $scope.constants.itemStatus.replaced) &&
                (item.claimItem.status.id != 8 || item.claimItem.status.status != $scope.constants.itemStatus.workInProgress)) {
                item.Selected = $scope.selectedAllVendorItem;
            }
        });
        GetVendorsList();
        $scope.SelectCategory();
    };

    $scope.SelectedVendorDetails = {};
    $scope.selectVendor = selectVendor;
    function selectVendor(vendor) {
        $(".page-spinner-bar").removeClass("hide");
        var paramVendor = {
            "registrationNumber": vendor.registrationNumber,
            "categories": $scope.SelectedCategories && $scope.SelectedCategories.length > 0 ? $scope.SelectedCategories : null
        };
        var VendorDetails = SupervisorClaimDetailsService.getSelectedVendorDetails(paramVendor);
        VendorDetails.then(function (success) {
            $scope.SelectedVendorDetails = success.data.data;
            if ($scope.SelectedVendorDetails && $scope.SelectedVendorDetails.vendorContentServiceList && $scope.SelectedVendorDetails.vendorContentServiceList.length > 0) {
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
        if ($scope.SelectedCategories && $scope.SelectedCategories.length > 0) {
            angular.forEach($scope.SelectedCategories, function (seletedCategory, key) {
                var index = $scope.SelectedVendorDetails.vendorContentServiceList.findIndex(vendorContentService => vendorContentService.category.name === seletedCategory.name);
                if (index <= -1)
                    nonServicedCategories.push(seletedCategory.name);
                else if (key === 0) {
                    var contentServices = $scope.SelectedVendorDetails.vendorContentServiceList[0].contentServices;
                    if (contentServices && contentServices.length > 0) {
                        angular.forEach(contentServices, function (service) {
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
            var category = $scope.SelectedVendorDetails.vendorContentServiceList.find(vendorcategory => vendorcategory.category.name === "Others");
            angular.forEach(category.contentServices, function (service) {
                $scope.ContentServiceList.push(service);
            });
        }
        $(".page-spinner-bar").addClass("hide");
    }

    $scope.GetContentService = GetContentService;
    function GetContentService() {
        var getContentService = AdjusterPropertyClaimDetailsService.getContentService();
        getContentService.then(function (success) {
            $scope.ContentServiceList = success.data.data;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    $scope.AssignPostLossDetails = {};
    //assign claim to selected vendor
    $scope.AssignItemToVendor = AssignItemToVendor;
    function AssignItemToVendor() {
        if ($scope.SelectedVendorPostLossItem.length > 0) {
            $(".page-spinner-bar").removeClass("hide");
            $scope.ServiceText = "";
            if ($scope.Servicetype == 1) {
                $scope.ServiceText = "Quote With Contact"
            } else if ($scope.Servicetype == 2) {
                $scope.ServiceText = "Quote No Contact"
            }
            if ($scope.Servicetype == 3) {
                $scope.ServiceText = "Salvage Only"
            }
            if (angular.isDefined($scope.SelectedVendorDetails.registrationNumber)
                && $scope.SelectedVendorDetails.registrationNumber !== null) {
                var categories = [];
                angular.forEach($scope.SelectedCategories, function (item) {
                    categories.push({
                        "categoryId": item.id,
                        "categoryName": item.name
                    })
                });
                var SelectedPostItems = [];
                angular.forEach($scope.SelectedVendorPostLossItem, function (item) {
                    SelectedPostItems.push(item);
                });
                //3D5DE8A315C3-item-Id -5
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
                        "remark": (angular.isDefined($scope.AssignmentRemark) && $scope.AssignmentRemark != null ? $scope.AssignmentRemark : null)
                    },
                    "insuranceCompanyDetails": {
                        "crn": sessionStorage.getItem("CRN")
                    }
                };
                //AssignItemToVendor
                var Assign = SupervisorClaimDetailsService.AssignItemToVendor(ParamAssignment);
                Assign.then(function (success) {
                    toastr.remove();
                    toastr.success((success.data !== null) ? success.data.message : "Item(s) assigned scuccessfully.", "Success");
                    $scope.CommonObj.isAssignmentDone = true;
                    $scope.tab = 'Vendor Assignments';
                    $scope.Cancel();
                    getVendorAssignmentList();
                    $(".page-spinner-bar").addClass("hide");
                }, function (error) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove();
                    toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to assign item to vendor. please try again.", "Error");
                });
            } else {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.warning("Please select a vendor to assign items.", "Warning");
            }
        } else {
            toastr.remove();
            toastr.warning("Please select items to assign .", "Warning");
        }
    }

    $scope.GetStates = GetStates;
    function GetStates() {
        var param = {
            "isTaxRate": false,
            "isTimeZone": false
        };
        var statelist = SupervisorClaimDetailsService.getStates(param);
        statelist.then(function (success) {
            $scope.DdlStateList = success.data.data;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    function getVendorAssignmentList() {
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
        };
        var getAllVendorList = SupervisorClaimDetailsService.getVendorAssignmnetList(param);
        getAllVendorList.then(function (success) {
            if (success.data.data)
                $scope.ItemAssignmentList = success.data.data.claimAssignmentVendors;
                $scope.ClaimStatusContent.itemsAssignedToVendors = success.data.data.itemsWithVendors ? success.data.data.itemsWithVendors : 0;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            } else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.GotoAssignmentDetails = GotoAssignmentDetails;
    function GotoAssignmentDetails(item) {
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = false;
        $scope.ShowAssignmentDetails = true;
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "assignmentNumber": item.assignmentNumber
        };
        var GetAssingmentDetails = SupervisorClaimDetailsService.GetVendorassignmentDetails(param);
        GetAssingmentDetails.then(function (success) {
            GetContentService();
            $scope.AssginmentDetails = success.data.data;

            $scope.CommonObj.AssignmentNumber = $scope.AssginmentDetails.assignmentNumber;
            $scope.assignmentRating = $scope.AssginmentDetails.assignmentRating
            GetVendorAssignmnetItemList(item);
            $scope.getLineChartForAssignments();
            $scope.timeComparisonBarChart();
        }, function (error) {
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            } else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }

    $scope.openInvoicesInNewTab = openInvoicesInNewTab;
    function openInvoicesInNewTab() {
        sessionStorage.setItem('newInvoiceTab', true);
        sessionStorage.setItem('assignmentNumber', $scope.CommonObj.AssignmentNumber);
        var url = $state.href('SupervisorClaimDetails');
        $window.open(url, '_blank');
    }


    $scope.AssignmentItemList = [];
    function GetVendorAssignmnetItemList(item) {
        var param = {
            "assignmentNumber": item.assignmentNumber,
            "vrn": item.vendorDetails.registrationNumber
        };
        var getItemList = SupervisorClaimDetailsService.GetVendorassignmentItems(param);
        getItemList.then(function (success) {
            $scope.AssignmentItemList = success.data.data;
            $scope.totalQuote = 0;
            angular.forEach($scope.AssignmentItemList, function (item) {
                $scope.totalQuote = parseFloat($scope.totalQuote) + parseFloat(item.claimItem.rcv != null && item.claimItem.quotedBy!=null && item.claimItem.quoteDate!=null && item.claimItem.quantity != null  ? (item.claimItem.rcv * item.claimItem.quantity) : 0)
                tax = parseFloat(item.claimItem.taxRate);

            });
            $scope.totalQuote = parseFloat($scope.totalQuote) + parseFloat((($scope.totalQuote * tax) / 100));
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            } else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }

    $scope.CancelAssignmentDetails = CancelAssignmentDetails;
    function CancelAssignmentDetails() {
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = true;
        $scope.ShowAssignmentDetails = false;
    }

    $scope.Cancel = function () {
        $scope.selectedAll = false;
        $scope.SelectedPostLostItems = [];
        $scope.SelectedVendorPostLossItem = [];
        $scope.selectedAllVendorItem = false;
        $scope.SelectedCategories = [];
        if (!$scope.CommonObj.isAssignmentDone) {
            $scope.tab = 'Contents';
            resetItemListSelection();
        }
        sessionStorage.setItem("ItemsList", "")
        sessionStorage.setItem("SelectedItemsList", "")
        sessionStorage.setItem("ItemsStatus", false);
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = true;
        $scope.ShowAssignmentDetails = false;
        $scope.name = "false";
        $scope.showValued = false;
        $scope.showPaid = false;
        $scope.isReplaceable = false;
        $scope.isApprovable = false;
        $scope.showSettled = false;
    };

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

    function GetCompanyBranchList() {
        var param = { "id": sessionStorage.getItem("CompanyId") };
        var getBranchList = AdjusterPropertyClaimDetailsService.getCompanyBranchList(param);
        getBranchList.then(function (success) {
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

    $scope.GoToClaimDetailsFromItemPage = GoToClaimDetailsFromItemPage;
    function GoToClaimDetailsFromItemPage() {
        if ($scope.SelectedPostLostItems.length > 0) {
            $scope.VendorAssignmentList = [];
            angular.forEach($scope.SelectedPostLostItems, function (selected) {
                angular.forEach($scope.FiletrLostDamageList, function (item) {
                    //if ((item.claimItem.status.id != 3 || item.claimItem.status.status != 'UNDER REVIEW') && ((item.claimItem.status.id != 2 || item.claimItem.status.status != 'ASSIGNED'))) {
                    if (selected == item.claimItem.id) {
                        item.Selected = true;
                        $scope.VendorAssignmentList.push(item);
                        $scope.SelectedVendorPostLossItem.push(item.claimItem.itemUID);
                    }
                });
            });
            $scope.selectedAllVendorItem = true;
        } else {
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
        $location.url('SupervisorClaimDetails');
    }

    $scope.GoToViewQuote = GoToViewQuote;
    function GoToViewQuote() {
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = false;
        $scope.ShowAssignmentDetails = false;
        $scope.ShowViewQuote = true;
    }

    $scope.CancelViewQuote = CancelViewQuote;
    function CancelViewQuote() {
        $scope.ShowAssignments = false;
        $scope.ShowAssignmentsList = true;
        $scope.ShowAssignmentDetails = false;
        $scope.ShowViewQuote = false;
    }

    $scope.getClaimForm = getClaimForm;
    function getClaimForm() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.tab = 'Claim Form';
        //Get pending task list
        GetPendingTaskList();
    }

    $scope.getInvoice = getInvoice;
    function getInvoice() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.CurrentTab = 'Invoices';
        GetVendorAllInvoices();
        //Get pending task list
    }

    $scope.vendorAssigmentTab = vendorAssigmentTab;
    function vendorAssigmentTab() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.tab = 'Vendor Assignments';
        $scope.ShowViewQuote = false;
        $scope.ShowAssignmentDetails = false;
        //VendorListInVendor();
        getVendorAssignmentList();
        //getClaimStatusInvoiceDetails();
        if ($scope.ShowAssignments == true) {
            $(".page-spinner-bar").addClass("hide");
        } else {
            $scope.ShowAssignmentsList = true;
            $(".page-spinner-bar").addClass("hide");
        }
    }

    $scope.ShowParticipantTab = ShowParticipantTab;
    function ShowParticipantTab() {
        $scope.ClaimDetailstab = 'Participant';
    }

    $scope.getClaimParticipants = getClaimParticipants;
    function getClaimParticipants() {
        //get active vendors against claim for autocomplete textbox
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "policyNumber": $scope.CommonObj.PolicyNumber
        }
        var getpromise = SupervisorClaimDetailsService.getVendorsListAgainstClaim(param);
        getpromise.then(function (success) {
            $scope.ClaimParticipantsList = success.data.data;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
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
    };

    $scope.GotoReceiptMapperHome = GotoReceiptMapperHome;

    function GotoReceiptMapperHome() {
        if ((angular.isDefined($scope.CommonObj.ClaimNumber) && $scope.CommonObj.ClaimNumber !== null && $scope.CommonObj.ClaimNumber !== "") &&
            (angular.isDefined($scope.CommonObj.ClaimId) && $scope.CommonObj.ClaimId !== null && $scope.CommonObj.ClaimId !== "")) {
            sessionStorage.setItem("ClaimNoForReceipt", $scope.CommonObj.ClaimNumber);
            sessionStorage.setItem("ClaimIdForReceipt", $scope.CommonObj.ClaimId);
            $location.url('ReceiptMapperHome');
        }
    }

    $scope.ShowActivityLogTab = ShowActivityLogTab;
    function ShowActivityLogTab() {
        $scope.tab = 'Activity Log';
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("BackPage", "SupervisorClaimDetails");
    };

    $scope.showPolicyDetailsTab = showPolicyDetailsTab;
    function showPolicyDetailsTab() {
        $scope.tab = 'Policy Details';
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("BackPage", "SupervisorClaimDetails");
    };

    //go to search results page
    $scope.goToSearchResult = goToSearchResult;

    function goToSearchResult() {
        sessionStorage.setItem("previousPage", pageName);
        $location.path("/SupervisorGlobalSearch");
    };

    //go to all claims page
    $scope.goToPreviousPage = goToPreviousPage;
    function goToPreviousPage() {
        sessionStorage.setItem("BackPage", "");
        $location.path($scope.backPage);
    }

    //New for service seleted
    $scope.Servicetype = null;
    $scope.ServiceTypeDiv = "";
    $scope.SelectServicetype = SelectServicetype;

    function SelectServicetype() {
        $scope.minCost = 0;
        $scope.selectedSubserviceList = [];

        //"Quote with Contact"
        if ($scope.Servicetype == 1) {
            $scope.ServiceTypeDiv = "Quote with Contact";
        }
        //"Quote No Contact"
        else if ($scope.Servicetype == 2) {
            $scope.ServiceTypeDiv = "Quote No Contact";
            // angular.forEach($scope.ContentServiceList, function (item) {
            //     if (item.service == 'Quote No Contact') {
            //         angular.forEach(item.subServices, function (subservice) {
            //             if (subservice.service != 'Partial Replacement')
            //                 SelectSubservice(subservice);
            //         });
            //     }
            // });
        }
        //"Salvage"
        else if ($scope.Servicetype == 3) {
            $scope.ServiceTypeDiv = "Salvage Only";
        }
    };

    //add items in subservice List
    $scope.minCost = 0;
    $scope.selectedSubserviceList = [];
    $scope.SelectSubservice = SelectSubservice;

    function SelectSubservice(Subservices) {
        var flag = 1;
        var subservice = {
            "name": Subservices.service
        }
        angular.forEach($scope.selectedSubserviceList, function (value, index) {
            if (Subservices.service == value.name) {
                $scope.selectedSubserviceList.splice(index, 1);
                $scope.minCost = $scope.minCost - Subservices.serviceCharge;
                flag = 0;
            }
        });
        if (flag != 0) {
            $scope.selectedSubserviceList.push(subservice);
            $scope.minCost = $scope.minCost + Subservices.serviceCharge;
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

    $scope.editClaimDetails = editClaimDetails;

    function editClaimDetails() {
        GetLossTypes();
        $scope.editClaimDetail = true;
        $scope.tempClaimDetails = {
            "oldClaimNumber": $scope.CommonObj.ClaimNumber,
            "damageTypeId": $scope.ClaimStatusContent.damageTypeId,
            "taxRate": $scope.ClaimStatusContent.taxRate,
            // "aggregateLimit": $scope.ClaimStatusContent.underLimit,
            "deductible": $scope.ClaimStatusContent.deductible,
            "minimumThreshold": $scope.ClaimStatusContent.minimumThreshold,
            "totalPolicyCoverage": $scope.ClaimStatusContent.totalPolicyCoverage,
        }
    };

    //Edit Claim details
    //Get Loss Types.
    $scope.GetLossTypes = GetLossTypes;
    $scope.LossTypeList = [];

    function GetLossTypes() {
        var GetLossTypesList = AdjusterPropertyClaimDetailsService.getLossTypes();
        GetLossTypesList.then(function (success) {
            $scope.LossTypeList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };

    $scope.getClaimsStatusContentDetails = getClaimsStatusContentDetails;
    function getClaimsStatusContentDetails() {
        if($scope.reffererPage != 'SEARCH_RESULT')
        $scope.tab = 'Contents';
        var param = {
            "id": $scope.CommonObj.ClaimId,
            "claimNumber": $scope.CommonObj.ClaimNumber
        };
        var getpromise = AdjusterPropertyClaimDetailsService.getClaimsStatusContentDetails(param);
        getpromise.then(function (success) {
            $scope.ClaimStatusContent = success.data.data;
            $scope.ClaimStatusContent.shippingDate = $filter('formatDate')($scope.ClaimStatusContent.shippingDate);
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };

    $scope.updateClaimDetails = updateClaimDetails;
    function updateClaimDetails() {
        $scope.ServiceText;
        if (angular.isDefined($scope.CommonObj.ClaimId) && $scope.CommonObj.ClaimId != null && $scope.CommonObj.ClaimId != '') {
            var updateClaimDetailsDTO = {
                "claimId": $scope.CommonObj.ClaimId,
                "updatedClaimNumber": $scope.editAssignedClaimDetail.claimNumber ? $scope.editAssignedClaimDetail.claimNumber : $scope.CommonObj.ClaimNumber,
                "oldClaimNumber": $scope.CommonObj.ClaimNumber,
                "damageTypeId": $scope.ClaimStatusContent.damageTypeId,
                "taxRate": $scope.ClaimStatusContent.taxRate,
                // "aggregateLimit": $scope.ClaimStatusContent.underLimit,
                "deductible": $scope.ClaimStatusContent.deductible,
                "minimumThreshold": $scope.ClaimStatusContent.minimumThreshold,
                "totalPolicyCoverage": $scope.ClaimStatusContent.totalPolicyCoverage,
                "assignmentNumber": $scope.CommonObj.AssignmentNumber,
                "isUpdatedByInsuranceUser": true,
                "isUpdatedByInsuranceUser": true,
                "shippingDate": angular.isDefined($scope.ClaimStatusContent.shippingDate) && $scope.ClaimStatusContent.shippingDate != '' ? $filter('DatabaseDateFormatMMddyyyy')($scope.ClaimStatusContent.shippingDate) : null,
                "shippingMethod": $scope.CommonObj && $scope.CommonObj.ClaimProfile === 'Jewelry' ? {
                    "id": angular.isDefined($scope.ClaimStatusContent.shippingMethod) && $scope.ClaimStatusContent.shippingMethod ? $scope.ClaimStatusContent.shippingMethod.id : null,
                } : null
            }
        }
        var upDateClaimDetails = AdjusterPropertyClaimDetailsService.updateClaimDetails(updateClaimDetailsDTO);
        upDateClaimDetails.then(function (success) {
            $scope.CommonObj.ClaimNumber = $scope.editAssignedClaimDetail.claimNumber ? $scope.editAssignedClaimDetail.claimNumber : $scope.CommonObj.ClaimNumber;
            $scope.editClaimDetail = false;
            getClaimsStatusContentDetails();
            toastr.remove();
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            //$location.path('/ThirdPartyVendorDashboard');
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage);
        });
    }

    $scope.cancelEditDetails = cancelEditDetails;
    function cancelEditDetails() {
        $scope.editClaimDetail = false;
        $scope.editAssignedClaimDetail = {};
        $scope.CommonObj.ClaimNumber = $scope.tempClaimDetails.oldClaimNumber;
        $scope.ClaimStatusContent.damageTypeId = $scope.tempClaimDetails.damageTypeId;
        $scope.ClaimStatusContent.taxRate = $scope.tempClaimDetails.taxRate;
        // $scope.ClaimStatusContent.underLimit = $scope.tempClaimDetails.aggregateLimit;
        $scope.ClaimStatusContent.deductible = $scope.tempClaimDetails.deductible;
        $scope.ClaimStatusContent.minimumThreshold = $scope.tempClaimDetails.minimumThreshold;
        $scope.ClaimStatusContent.totalPolicyCoverage = $scope.tempClaimDetails.totalPolicyCoverage;
    };

    $scope.editServices = editServices;

    function editServices(value) {
        if (value == '1') {
            $scope.editServicesRequested = true;
            //$scope.selectedSubserviceList = [];
            if (angular.isUndefined($scope.AssginmentDetails.contentService)) {
                $scope.Servicetype = null;
                $scope.ServiceTypeDiv = null
            } else
                selectAssignmentContentServices($scope.AssginmentDetails.contentService.id);
        } else
            $scope.editServicesRequested = false;
    }

    //selet subservices
    $scope.selectAssignmentContentServices = selectAssignmentContentServices;

    function selectAssignmentContentServices(contentServiceType) {
        $scope.Servicetype = contentServiceType;
        $scope.selectedSubserviceList = [];
        //"Quote with Contact"
        if ($scope.Servicetype == 1) {
            $scope.ServiceTypeDiv = "Quote with Contact";
            angular.forEach($scope.ContentServiceList, function (item) {
                if (item.service === 'Quote With Contact') {
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
        //"Quote No Contact"
        else if ($scope.Servicetype == 2) {
            $scope.ServiceTypeDiv = "Quote No Contact";
            angular.forEach($scope.ContentServiceList, function (item) {
                if (item.service == 'Quote No Contact') {
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
        //"Salvage"
        else if ($scope.Servicetype == 3) {
            $scope.ServiceTypeDiv = "Salvage Only";
        }
    }

    $scope.updateServices = updateServices;

    function updateServices() {
        $(".page-spinner-bar").removeClass("hide");
        if (angular.isDefined($scope.CommonObj.ClaimId != null) && $scope.CommonObj.ClaimId != null && $scope.CommonObj.ClaimId != '') {
            var categories = [];
            $scope.SelectedCategories.push({
                id: 22,
                name: "Jewelry"
            });
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
            var updateServices = AdjusterPropertyClaimDetailsService.updateClaimDetails(updateClaimDetailsDTO);
            updateServices.then(function (success) {
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
                getVendorAssignmentList();
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error(error.data.errorMessage);
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }


    /**
     * Get Policyholde details based on Claim Number
     */
    $scope.getPolicyDetails = getPolicyDetails;
    function getPolicyDetails() {
        if($scope.reffererPage != 'SEARCH_RESULT')
        $scope.tab = 'Policy Details';
        //Get Policy Details
        var param = {
            "policyNumber": null,
            "claimNumber": $scope.CommonObj.ClaimNumber
        };
        var getPolicyDetails = AdjusterPropertyClaimDetailsService.getPolicyDetails(param);
        getPolicyDetails.then(function (success) {
            $scope.PolicyDetails = success.data.data;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
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


    //Assignment Rating.
    $scope.sendAssignmentRating = sendAssignmentRating
    function sendAssignmentRating(assignmentNumber, ratingNumber) {
        $(".page-spinner-bar").removeClass("hide");
        var responsePromise = AdjusterPropertyClaimDetailsService.updateAssignmentRating(assignmentNumber, ratingNumber);
        responsePromise.then(function (success) {
            toastr.remove();
            toastr.success("Successfully submitted rating", $translate.instant("SuccessHeading"));
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.error(error.data.errorMessage, "Error")
        });

        $(".page-spinner-bar").addClass("hide");

    }
    // Get Shipping methods.
    $scope.getShippingMethods = getShippingMethods;
    function getShippingMethods() {
        var shippingMethods = NewClaimService.getShippingMethods();
        shippingMethods.then(function (success) {
            $scope.shippingMethodsList = success.data.data;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };

    $scope.getRooms = getRooms;
    function getRooms() {
        var rooms = NewClaimService.getRooms($scope.CommonObj.ClaimNumber);
        rooms.then(function (success) {
            $scope.RoomsList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    $scope.getRetailers = getRetailers;
    function getRetailers() {
        var retailers = NewClaimService.getRetailers();
        retailers.then(function (success) {
            if (success.data.data) {
                $scope.Retailers = success.data.data.retailers;
                $scope.paymentTypes = success.data.data.paymentTypes;
            }
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    $scope.selected.room = {};
    $scope.selectRoom = function (room) {
        $scope.selected.room = {
            "id": room.id,
            "roomName": room.roomName
        }
    }
    $scope.selected.retailer = {};
    $scope.selectRetailer = function (retailer) {
        $scope.selected.originallyPurchasedFrom = {
            "id": retailer.id,
            "name": retailer.name
        }
        if (retailer.name === 'Other')
            $scope.addOtherRetailer = true;
        else {
            $scope.selected.newRetailer = null;
            $scope.addOtherRetailer = false;
        }
    }
    $scope.selectPaymentmethod = function (paymentMethod) {
        if (paymentMethod === 'Gift')
            $scope.selected.originallyPurchasedFrom = null;
        else
            $scope.selected.giftedFrom = null;
    }

    $scope.SetScheduledStatus = SetScheduledStatus;
    function SetScheduledStatus(item, status) {
        item.isScheduledItem = status;
    };
    $scope.GoToClaim = GoToClaim;
    function GoToClaim() {
        $location.url('SupervisorClaimDetails');
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
                //Call Back Function success
                if (value === "Success") {
                    // GetPostLostItems();
                    // getMessages();
                }
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
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                item.adjusterDescription = item.description;
                // insuredPrice
                $scope.ItemDetails = item;
                if ($scope.ItemDetails.totalStatedAmount > $scope.ClaimStatusContent.minimumThreshold) {
                    CalculateRCV();
                }
                else {
                    $scope.ItemDetails.rcv = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.totalStatedAmount / $scope.ItemDetails.quantity);
                    $scope.ItemDetails.rcvTotal = $scope.ItemDetails.totalStatedAmount;
                    $scope.ItemDetails.acv = $scope.ItemDetails.totalStatedAmount;
                }

                selectedItems.push($scope.ItemDetails);
            }
        });
        var param = {
            "itemIds": $scope.SelectedPostLostItems,
            "itemStatus": status,
            "claimItems": selectedItems
        }
        var getCategories = LineItemService.bulkUpdateStatus(param);
        getCategories.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            $scope.SelectedPostLostItems = [];
            $scope.Cancel();
            // GetPostLostItems();
            calculateSettlement();
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.approve = function (event, approveType) {
        if (approveType === 'ITEMS' && (!$scope.SelectedPostLostItems || !$scope.SelectedPostLostItems.length)) {
            toastr.remove();
            toastr.error('Please select items to approve', 'Error')
            event.stopPropagation();
            event.preventDefault();
        }
        $scope.defaultRecepients = [];
        //Selected Claim supervisor has default recepient
        $scope.defaultRecepients.push($scope.ClaimParticipantsList.find(participant => participant.role === 'ADJUSTER'))
        AddNotePopup(null, approveType);
    }

    $scope.paid = function () {
        var selectesItems = [];
        var total = 0.00;
        var itemCnt = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                selectesItems.push(item.claimItem);
                if (item.status.status === $scope.constants.itemStatus.valued) {
                    total += parseFloat(item.acv);
                    itemCnt++;
                }
            }
        });
        var itmStr = (itemCnt == 1) ? "item" : "items";
        if (total == 0) {
            bootbox.alert({
                message: "<b><center>Payment Details</center></b><br/>Paying a sum of " + $filter('currency')(total) + " (Cash Payout Exposure) for " + itemCnt + " " + itmStr + "<br/><br/><span class='text-danger'>ACV value should be greater than $0.00</span>",
                size: 'small'
            });
            return false;
        }
        angular.forEach(selectesItems, function (item) {
            item.isPaid = true;
        });
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
                        "registrationNumber": sessionStorage.getItem("jewelryVendor") ? sessionStorage.getItem("jewelryVendor") : sessionStorage.getItem("speedCheckVendor")
                    }
                    var getpromise = AdjusterPropertyClaimDetailsService.updatePostLostItemsStatus(param);
                    getpromise.then(function (success) {
                        toastr.remove();
                        toastr.success("Successfully submitted request", $translate.instant("SuccessHeading"));
                        $scope.SelectedPostLostItems = [];
                        $scope.Cancel();
                        GetPostLostItems();
                        $(".page-spinner-bar").addClass("hide");
                    }, function (error) {
                        $(".page-spinner-bar").addClass("hide");
                        $scope.ErrorMessage = error.data.errorMessage;
                    });
                }
            }
        });

    }

    $scope.checkOptions = checkOptions;
    function checkOptions() {
        var selectedItemDetails = [];
        $scope.showValued = false;
        $scope.showPaid = false;
        $scope.isApprovable = false;
        $scope.isReplaceable = false;
        $scope.showSettled = false;
        var canBeValued = 0, canBePaid = 0, isReplaceable = 0, isApprovable = 0, canBeSettled = 0;
        if ($scope.SelectedPostLostItems && $scope.SelectedPostLostItems.length > 0) {
            angular.forEach($scope.SelectedPostLostItems, function (selectItem) {
                selectedItemDetails.push($scope.FiletrLostDamageList.find(item => item.id === selectItem));
            })
            angular.forEach(selectedItemDetails, function (item) {
                if (item.status && (item.status.status === $scope.constants.itemStatus.workInProgress || item.status.status === $scope.constants.itemStatus.created))
                    canBeValued++;
                else if (item.status && item.status.status === $scope.constants.itemStatus.valued) {
                    canBePaid++;
                    isReplaceable++;
                }
                else if (item.status && item.status.status === $scope.constants.itemStatus.settled)
                    isReplaceable++;
                else if (item.status && item.status.status === $scope.constants.itemStatus.underReview)
                    isApprovable++;
                else if (item.status && (item.status.status === $scope.constants.itemStatus.paid || item.status.status === $scope.constants.itemStatus.partialReplaced))
                    canBeSettled++;
            });
            if (canBeValued >= 1)
                $scope.showValued = true;
            if (canBePaid >= 1)
                $scope.showPaid = true;
            if (isReplaceable >= 1 && isReplaceable === selectedItemDetails.length)
                $scope.isReplaceable = true;
            if (isApprovable >= 1 && isApprovable === selectedItemDetails.length)
                $scope.isApprovable = true;
            if (canBeSettled >= 1 && canBeSettled === selectedItemDetails.length)
                $scope.showSettled = true;
        }
    }
    // function CalculateRCV() {
    //     //Get Price of added comparable value
    //     var Price = 0.0; var taxRate = 0.0;
    //     var ACV = 0.0; var RCV = 0.0;
    //     var Age = 0.0;
    //     var EL = 0.0; var CA = 0.0;
    //     var depreciationPercent = 0.0;
    //     Price =  $scope.ItemDetails.rcv;

    //     //Get age of item
    //     if ($scope.ItemDetails.ageMonths !== null && angular.isDefined($scope.ItemDetails.ageMonths) && $scope.ItemDetails.ageMonths > 0) {
    //         if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears) && $scope.ItemDetails.ageYears !== "")
    //             Age = parseFloat($scope.ItemDetails.ageYears) + (parseFloat($scope.ItemDetails.ageMonths) / 12);
    //         else
    //             Age = Math.ceil(parseFloat($scope.ItemDetails.ageMonths) / 12);
    //     }
    //     else {
    //         if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears))
    //             Age = parseFloat($scope.ItemDetails.ageYears);
    //     }

    //     if ($scope.ItemDetails.subCategory != null && angular.isDefined($scope.ItemDetails.subCategory)) {
    //         if ($scope.ItemDetails.subCategory.annualDepreciation != null && angular.isDefined($scope.ItemDetails.subCategory.annualDepreciation)) {
    //             depreciationPercent = parseFloat(Age * ($scope.ItemDetails.subCategory.annualDepreciation / 100));
    //         }
    //         else
    //             depreciationPercent = parseFloat(Age * (10 / 100));
    //     }

    //     //if usefulYears not getting form db then calculate usefulYears by formula
    //     //Useful Years = 100 / (Depreciation %) = 100/10 = 10 years
    //     EL = (depreciationPercent == null ? 0 : depreciationPercent.toFixed(2));
    //     CA = parseFloat(Age);
    //     RCV = parseFloat(Price);
    //     /**
    //      * Calculate material cost
    //      */
    //     Price = Price * $scope.ItemDetails.quantity;
    //     taxRate = $scope.ItemDetails.taxRate ? $scope.ItemDetails.taxRate : 0;
    //     $scope.ItemDetails.totalTax = parseFloat((taxRate / 100) * (isNaN(Price) ? 1 : Price)).toFixed(2);
    //     ACV = isNaN(ACV) ? 0 : ACV;
    //     Price = isNaN(Price) ? 0 : (parseFloat($scope.ItemDetails.totalTax) + parseFloat(Price)).toFixed(2);
    //     CA = isNaN(CA) ? 0 : CA;
    //     EL = isNaN(EL) ? 0 : EL;
    //     $scope.ItemDetails.depreciationAmount = parseFloat((parseFloat(Price) * parseFloat(EL)).toFixed(2)) > 0 ? parseFloat((parseFloat(Price) * parseFloat(EL)).toFixed(2)) : 0;
    //     ACV = (parseFloat(Price) - (parseFloat(Price) * parseFloat(EL))) > 0 ? (parseFloat(Price) - (parseFloat(Price) * parseFloat(EL))) : 0;
    //     $scope.ItemDetails.rcvTotal = Price;
    //     $scope.ItemDetails.holdOverValue = parseFloat((Price - ACV).toFixed(2));
    //     if ($scope.ItemDetails.holdOverValue < 0)
    //         $scope.ItemDetails.holdOverValue = 0;

    //     $scope.ItemDetails.acv = parseFloat(ACV.toFixed(2));
    //     $scope.ItemDetails.rcv = parseFloat(RCV.toFixed(2));
    //     // as per request if category is jwelary the acv is equals to replacement cost
    //     if ($scope.ItemDetails.category && ($scope.ItemDetails.category.id == 31)) {
    //         $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
    //     }
    //     if (isNaN($scope.ItemDetails.valueOfItem)) {
    //         $scope.ItemDetails.valueOfItem = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.holdOverValue)) {
    //         $scope.ItemDetails.holdOverValue = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.totalTax)) {
    //         $scope.ItemDetails.totalTax = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.acv)) {
    //         $scope.ItemDetails.acv = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.rcv)) {
    //         $scope.ItemDetails.rcv = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.rcvTax)) {
    //         $scope.ItemDetails.rcvTax = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.rcvTotal)) {
    //         $scope.ItemDetails.rcvTotal = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.acvTotal)) {
    //         $scope.ItemDetails.acvTotal = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.acvTax)) {
    //         $scope.ItemDetails.acvTax = 0;
    //     }
    // }

    $scope.goToMyTeamTab = function () {
        sessionStorage.setItem("BackPage", "");
        $location.path('/SupervisorMyTeam');
    }

    // CTB-2689
    $scope.showAllReplacementQuotes = showAllReplacementQuotes;
    function showAllReplacementQuotes() {
        $scope.tab = 'Item Replacement Quotes';
        sessionStorage.setItem("claimDetailsCurrentTab", "Item Replacement Quotes");
        resetItemListSelection();
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

    $scope.nextMessagePage = function () {
        if (currentMessagePage < totalMessagePages) {
            $scope.isMessagesLoading = true;
            currentMessagePage += 1;
            getMessages();
        }
    }

    $scope.showDocumentsTab = function () {
        //Claim Attachments (Gets all attachments under Policy & Claim / Items / Invoices / Receipts / Others)
        $scope.tab = 'Documents';
    }
    $scope.showClaimParticipantsTab = function () {
        $scope.tab = 'Claim Participants';
    }

    $scope.sendMessageToParticipant = function (participant) {
        $scope.defaultRecepients = [];
        $scope.defaultRecepients.push(participant);
        AddNotePopup(null, null);
    }

    //   Close claim
    $scope.closeClaim = closeClaim;
    function closeClaim() {
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
                        tr += item.description;
                        tr += '</td> ';
                        tr += '<td>';
                        tr += item.status.status;
                        tr += '</td> ';
                        tr += '</tr> ';
                        itemTable += tr;
                    });
                    itemTable += "</tbody></table></div><br>";
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
                    invoiceTable += "</tbody></table></div>";
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
                toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
            $(".page-spinner-bar").addClass("hide");
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

    $scope.ConversationPopup = ConversationPopup;
    function ConversationPopup(item) {
        var obj = {
            "ClaimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ItemId": item.ItemId,
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
    console.log($scope.filterStatus)
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
    // if($scope.statusFilterItems.length == 0){
    //     $scope.statusFilterItems = $scope.FiletrLostDamageList;
    // }

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
    console.log($scope.filterStatus)
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
    console.log($scope.filterCategory)
    if($scope.filterCategory.length!==$scope.uniqueCategory.length)
    {
        document.getElementById('selectallCategory').checked=false;
    }
    else
    {
        document.getElementById('selectallCategory').checked=true;
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
    console.log($scope.filterVendor)
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
    if(document.getElementById('selectallTotalPrice'))
    document.getElementById('selectallTotalPrice').checked=true;
    if(document.getElementById('selectAllVendor'))
    document.getElementById('selectAllVendor').checked=true;
    if(document.getElementById('selectallCategory'))
    document.getElementById('selectallCategory').checked=true;
  }

  showOnlyUnderReview = function()
  {
    $scope.filterStatus = ['UNDER REVIEW'];
  
    $scope.handleCancelbx('status')
    $scope.Filter('status');
    setTimeout(checkUnderReview,2000);
      
  }

  function checkUnderReview(){
    elements = document.getElementsByClassName('status_check');
    angular.forEach(elements,(ele)=>{ 
        if(ele.value=='UNDER REVIEW')
        ele.checked=true;
    })
  }

  // search items by keyword
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

$scope.acceptStandardCost = acceptStandardCost;
function acceptStandardCost(event){
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
                originalCost + twentyPerCost >= $scope.ItemDetails.standardCost)&& $scope.ItemDetails.status.status==="UNDER REVIEW" && standardReplacementCost<60){
            item.adjusterDescription = item.description;         
            $scope.ItemDetails.adjusterDescription = $scope.ItemDetails.standardDescription ?? item.description;                
            $scope.ItemDetails.rcv = standardReplacementCost;
            $scope.ItemDetails.replaced = true;
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
                    toastr.remove();
                    // toastr.success("success");
                    // toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                    // toastr.success(selectedItems.length+ " item(s) have been standard prices for a total of "+standardCostTotal.toFixed(2));

                    $scope.SelectedPostLostItems = [];
                    // Cancel();
                    var res = success.data.data
                    if (res.claimItems) {
                        mapUpdatedItemsToOriginalList(res.claimItems);
                        $scope.calculateSettlement(false);
                        // $scope.statusBasedFilter($scope.FiletrLostDamageList);
                    } else
                        GetPostLostItems();
                    
                        var msg =selectedItems.length+ " item(s) have been standard prices for a total of "+standardCostTotal.toFixed(2);
                        // event.stopPropagation();
                        window.setTimeout(function () {
                            toastr.remove();
                            // toastr.success("success");
                            toastr.success(msg);
                        }, 1000);
                    
                    $(".page-spinner-bar").addClass("hide");
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
    getClaimsStatusContentDetails();
}
$scope.CalculateRCV = function () {
    //ACV = P - ((CA / EL) * P) Formula
    //Get Price of added comparable value

    var Price = 0.0; var taxRate = 0.0;
    var ACV = 0.0; var RCV = 0.0;
    var Age = 0.0;
    var EL = 0.0; var CA = 0.0;
    var depreciationPercent = 0.0;
    Price = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcv);

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
        Price =utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcv*$scope.ItemDetails.replacementQty);
    }

   
    taxRate = ($scope.ItemDetails.taxRate && $scope.ItemDetails.applyTax == true) ? $scope.ItemDetails.taxRate : 0;
    $scope.ItemDetails.totalTax = utilityMethods.parseFloatWithFixedDecimal((taxRate / 100) * (isNaN(Price) ? 1 : Price));

    Price = isNaN(Price) ? 0 : utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.totalTax + Price);
    // EL = isNaN(EL) ? 0 : EL;

    $scope.ItemDetails.rcvTotal = utilityMethods.parseFloatWithFixedDecimal(Price);

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
    
    bindRemarksToRootScope=(event)=>{
        $rootScope.AssignmentRemark = event.target.value ;
        console.log($rootScope.AssignmentRemark);
    }

    $scope.GotoPolicyholderTasks = GotoPolicyholderTasks;
    function GotoPolicyholderTasks() {
        $location.url('AllTasks');
        GetPendingTaskList();
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

});
