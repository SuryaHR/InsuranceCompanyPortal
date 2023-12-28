angular.module('MetronicApp').controller('ViewQuoteController', function ($rootScope, $location, $filter, $uibModal, $scope, $translate, $translatePartialLoader
    , QuoteService, AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language 
    $translatePartialLoader.addPart('ViewQuote');
    $translate.refresh();
    $scope.ddlStateList = [];
    $scope.CommonObject = {};
    $scope.ClaimContents;
    $scope.QuoteDetails = [];
    $scope.TotalOriginalCost = 0;
    $scope.totalReplacementCost =0;

    $scope.profile = sessionStorage.getItem('claimProfile');
    $scope.isButtonDisable=false;
    function init() {
    $scope.userRole = sessionStorage.getItem("RoleList");

    $scope.ReplacementItem = [];
        $scope.CommonObject = {
            ClaimNumber: sessionStorage.getItem("ClaimNumber"),
            ClaimId: sessionStorage.getItem("ClaimId"),
            ItemUID: sessionStorage.getItem("ItemUID"),
            ItemNumber: sessionStorage.getItem("ItemNumber"),
            assignmentNumber: sessionStorage.getItem("assignmentNumber"),
            vendorNumber: sessionStorage.getItem("vendorNumber"),
            quoteNumber: sessionStorage.getItem("quoteNumber")
        };
        GetReplacementItem();
        // GetQuoteDetails();
        
        var param = {
            "isTaxRate": false,
            "isTimeZone": false
        };
        var getStates = QuoteService.getStates(param);
        getStates.then(function (success) {
            $scope.ddlStateList = success.data.data;
        },
            function (error) {
                if (angular.isDefined(error.data) && error.data !== null) {
                    toastr.error(error.data.errorMessage, "Error");
                }
                else {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
            });
    }
    init();

    $scope.showAllReplacementQuotes = showAllReplacementQuotes;
    function showAllReplacementQuotes() {
        $scope.tab = 'Item Replacement Quotes';
        sessionStorage.setItem("claimDetailsCurrentTab", "Item Replacement Quotes");
        if($scope.userRole = 'CLAIM SUPERVISOR'){
            $location.url('SupervisorClaimDetails');
        }
        else{
        $location.url('AdjusterPropertyClaimDetails');
        }
    }

    $scope.GetReplacementItem = GetReplacementItem;
    function GetReplacementItem() {
        var param = { "assignmentNumber": $scope.CommonObject.assignmentNumber };
        var getReplacementItem = QuoteService.GetReplacementItem(param);
        getReplacementItem.then(function (success) {
            $scope.ReplacementItemDetails = success.data.data;
            GetQuoteDetails();
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

    $scope.Tax = "0";
    $scope.TaxRate = "0";
    $scope.GetQuoteDetails = GetQuoteDetails;
    function GetQuoteDetails() {
        $scope.TotalLaborCharge = 0;
        $scope.TotalCustomCharge = 0;        
        $scope.totalReplacementCost =0;   
        $scope.SubTotal =0;
        $scope.Total = 0;
        $scope.totalTax = 0;
        $scope.unitCostTotal = 0;
        var param =
        {
            "quoteNumber":$scope.CommonObject.quoteNumber,
            "assignmentNumber": $scope.CommonObject.assignmentNumber,
            "vrn": $scope.CommonObject.vendorNumber,
        };
        var getDetails = QuoteService.getQuoteDetails(param);
        getDetails.then(function (success) {
            $scope.QuoteDetails = success.data.data;
            $scope.isButtonDisable = (angular.isDefined($scope.QuoteDetails.quoteStatus) && $scope.QuoteDetails.quoteStatus.status != "CREATED");
            // if($scope.QuoteDetails.itemComparables!=null)
            //     $scope.ReplacementItem = $scope.QuoteDetails.itemComparables;

            angular.forEach($scope.ReplacementItemDetails, function(itemdetails){
                if(angular.isDefined(itemdetails.claimItem) && itemdetails.claimItem != null && (itemdetails.claimItem.status.status=="VALUED" ||itemdetails.claimItem.status.status=='REPLACED' || itemdetails.claimItem.status.status=='PARTIAL REPLACED' || itemdetails.claimItem.status.status=='SETTLED'))
                {
                    $scope.ReplacementItem.push(itemdetails);
                }
                if(!!itemdetails?.comparableItems)
                angular.forEach(itemdetails.comparableItems, function (item) {
                    if (item.isReplacementItem === true) {
                        item.quantity = parseFloat(item.quantity ? item.quantity:1);
                        $scope.SubTotal = parseFloat($scope.SubTotal) + (parseFloat(item.unitPrice) * item.quantity);
                        $scope.TotalLaborCharge = parseFloat($scope.TotalLaborCharge)+ parseFloat(item.labourCharges);
                        $scope.TotalCustomCharge = parseFloat($scope.TotalCustomCharge)+ parseFloat(item.customCharges);
                    }
                });
                else
                {
                    var total = parseFloat(itemdetails.claimItem.rcv * itemdetails.claimItem.replacementQty);
                    $scope.SubTotal =parseFloat($scope.SubTotal)+ total;
                    $scope.Total = parseFloat($scope.Total) + parseFloat($scope.SubTotal); 
                }
                $scope.TaxRate = parseFloat(itemdetails.claimItem.taxRate == null ? 0 : itemdetails.claimItem.taxRate);
                $scope.Tax = parseFloat($scope.TaxRate / 100) * parseFloat($scope.SubTotal);
                // added for issue coming while accept. st cost
                $scope.totalTax +=  itemdetails.claimItem.totalTax;
                $scope.unitCostTotal += (itemdetails.claimItem.rcv * itemdetails.claimItem.replacementQty);
            });

            $scope.TotalOriginalCost = $scope.ReplacementItem.map(item=>item.claimItem.totalStatedAmount).reduce((a,b)=>a+b,0);
            $scope.totalReplacementCost = $scope.ReplacementItem.map(item=>item.claimItem.rcvTotal).reduce((a,b)=>a+b,0);
        },
            function (error) {
                if (angular.isDefined(error.data) && error.data !== null) {
                    toastr.error(error.data.errorMessage, "Error");
                }
                else {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
            })
    }

    //GotoMyClaim()
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
    //go goPropertyClaimDetails function
    $scope.goPropertyClaimDetails = goPropertyClaimDetails;
    function goPropertyClaimDetails(e) {
        sessionStorage.setItem('claimDetailsCurrentTab','Contents');
        if($scope.userRole == 'CLAIM SUPERVISOR'){
            $location.url('SupervisorClaimDetails');
        }
        else{
        $location.url('AdjusterPropertyClaimDetails');
        }
    }
    //go LineItemDetails function
    $scope.goLineItemDetails = goLineItemDetails;
    function goLineItemDetails() {
        $location.url('AdjusterLineItemDetails');
    }

   

    $scope.exportQuoteToPDF = exportQuoteToPDF;
    function exportQuoteToPDF(vendorQuoteId) {
        $(".page-spinner-bar").removeClass("hide");
        var data = {
            "profile": $scope.profile,
           "vendorQuoteId":vendorQuoteId
        }
        var reports = QuoteService.exportQuoteToPDF(data);
        reports.then(function success(response) {
            var headers = response.headers();
            // var filename = headers['x-filename'];
            var contentType = headers['content-type'];
            var linkElement = document.createElement('a');
            try {
                var blob = new Blob([response.data], { type: contentType });
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", "QUOT-"+$scope.CommonObject.ClaimNumber+"-"+$scope.capitalizeFirstLetter($scope.QuoteDetails.insuredBaseDetails.lastName)+","+$scope.capitalizeFirstLetter($scope.QuoteDetails.insuredBaseDetails.firstName));
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
            } catch (ex) {
                toastr.remove();
                toastr.success(ex);
            }
        }, function (error) {
            var decodedString = String.fromCharCode.apply(null, new Uint8Array(error.data));
            var obj = JSON.parse(decodedString);
            toastr.remove();
            toastr.error(obj['errorMessage']);
            $(".page-spinner-bar").addClass("hide");
        });
    }


    $scope.updateQuote=updateQuote
    function updateQuote(QuoteDetails,quoteStatus) {

        if(quoteStatus == 2)
        {
            $scope.animationsEnabled = true;
            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/Adjuster/ViewQuoteApprovePopUp.html",
                    controller: "ViewQuoteApprovePopUpController",
                    backdrop: 'static',
                    keyboard: false,
                });
                out.result.then(function (value){
                    if(angular.isDefined(value)){
                    QuoteDetails.quoteStatus.id=quoteStatus;
                    QuoteDetails.quoteStatus.status="APPROVED";
                    QuoteDetails.approvedMessage = value;

                    angular.forEach(QuoteDetails.itemComparables, function (item) {
                        item.claimItem.description = item.claimItem.description && item.claimItem.description!="" ? encodeURIComponent(item.claimItem.description) : "";
                        item.claimItem.adjusterDescription = item.claimItem.adjusterDescription && item.claimItem.adjusterDescription!="" ? encodeURIComponent(item.claimItem.adjusterDescription) : "";
                        
                        angular.forEach(item.comparableItems, function (comp) {
                            comp.description = comp.description && comp.description!="" ? encodeURIComponent(comp.description) : "";
                            comp.adjusterDescription = comp.adjusterDescription && comp.adjusterDescription!="" ? encodeURIComponent(comp.adjusterDescription) : "";
            
                            angular.forEach(comp.subJewelryReplacements, function (subItem) {
                                subItem.description = subItem.description && subItem.description!="" ? encodeURIComponent(subItem.description) : "";
                                subItem.replacementDescription = subItem.replacementDescription && subItem.replacementDescription!="" ? encodeURIComponent(subItem.replacementDescription) : "";
                            });
                        });                        
                    });

                    $(".page-spinner-bar").removeClass("hide");
                    var ApproveReplacementQuote =  QuoteService.updateQuoteDetails(QuoteDetails);
                     ApproveReplacementQuote.then(function (success) {
                         $(".page-spinner-bar").addClass("hide");
                         toastr.remove();
                        toastr.success("Quote #"+QuoteDetails.quoteNumber+" was successfully approved", "Confirmation");
                        $scope.isButtonDisable = (angular.isDefined($scope.QuoteDetails.quoteStatus) && $scope.QuoteDetails.quoteStatus.status != "CREATED");
                        $window.location.reload();
                        }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });
                }else{
                    toastr.remove();
                    toastr.error("view qoute is not approved", "Error");
                }
                }, function () {

        });
        return {
            open: open
        };
    }else if(quoteStatus == 3){

        bootbox.confirm({
            size: "",
            closeButton: false,
            title: "Reject Quote ",
            message: "Are you sure you want to reject the quoted replacement cost?",
            className: "modalcustom", buttons: {
                confirm: {
                    label: 'Reject',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'Cancel',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {

                    QuoteDetails.quoteStatus.id=quoteStatus;
                    QuoteDetails.quoteStatus.status="REJECTED";

                    $(".page-spinner-bar").removeClass("hide");
                    var ApproveReplacementQuote =  QuoteService.updateQuoteDetails(QuoteDetails);
                     ApproveReplacementQuote.then(function (success) {
                         $(".page-spinner-bar").addClass("hide");
                        toastr.remove();
                        toastr.success("Quote # "+QuoteDetails.quoteNumber+" was successfully rejected", "Confirmation");
                        $scope.isButtonDisable = (angular.isDefined($scope.QuoteDetails.quoteStatus) && $scope.QuoteDetails.quoteStatus.status != "CREATED");

                      //  GetQuoteDetails();
                        $window.location.reload();

                        }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });
                }
            }
        });

    }
}

$scope.goToVendorAssignment = goToVendorAssignment;
function goToVendorAssignment(){
    sessionStorage.setItem('claimDetailsCurrentTab','Vendor Assignments');
    if($scope.userRole == 'CLAIM SUPERVISOR'){
        $location.url('SupervisorClaimDetails');
    }
    else{
    $location.url('AdjusterPropertyClaimDetails');
    } 
}

$scope.capitalizeFirstLetter = capitalizeFirstLetter;
    function capitalizeFirstLetter(str) {

        // converting first letter to uppercase
        const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    
        return capitalized;
    }

});