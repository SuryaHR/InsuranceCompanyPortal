angular.module('MetronicApp').controller('MERController', function ($translate, $translatePartialLoader, $rootScope, $log, $scope, $window,
    settings, $http, $timeout, $uibModal, $location, $filter, AdjusterLineItemDetailsService, AuthHeaderService) {


    $translatePartialLoader.addPart('MER');
    $translate.refresh();
    $scope.comparableMarkAsReplacement = [];
    $scope.crn = sessionStorage.getItem("CRN");
    init();
    function init() {
        $scope.claimProfile = sessionStorage.getItem("claimProfile");
        // if (angular.isDefined(sessionStorage.getItem("ClaimNo")) && sessionStorage.getItem("ClaimNo") !== null) {
        //     $scope.CommonObj = {
        //         ClaimNumber: sessionStorage.getItem("ClaimNo").toString(),
        //         ClaimId: sessionStorage.getItem("ClaimId").toString(),
        //         ItemId: sessionStorage.getItem("PostLostItemId")
        //     };
        // }
        // else {
        //     $scope.CommonObj = {
        //         ClaimNumber: sessionStorage.getItem("SupervisorClaimNo").toString(),
        //         ClaimId: sessionStorage.getItem("SupervisorClaimId").toString(),
        //         ItemId: sessionStorage.getItem("SupervisorPostLostItemId").toString()
        //     };
        // }
        $scope.CommonObj = {
            ClaimNumber: sessionStorage.getItem("ClaimNumber"),
            ClaimId: sessionStorage.getItem("ClaimId"),
            ItemId: sessionStorage.getItem("ItemId"),
            ItemNumber: sessionStorage.getItem("ItemNumber"),
            ClaimDetailsPage: sessionStorage.getItem("ClaimDetailsPage"),
            LineDetailsPage: sessionStorage.getItem("LineDetailsPage"),
            BackPage: sessionStorage.getItem("BackPage")

        };

        GetInsuranceCompanyDetails();
        $scope.ItemDetails = {};
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        $scope.currentDate = new Date();
        var getItemDetailsOnId = AdjusterLineItemDetailsService.gteItemDetails(param);
        getItemDetailsOnId.then(function (success) {
            $scope.ItemDetails = success.data.data;
            
            // If attachment is .pdf .doc .docx  .xls .xlsx then set to no-image defaultly
            angular.forEach($scope.ItemDetails.attachments, function (item) {
                // .pdf .doc .docx  .xls .xlsx
                var url = item.url;
                if((item.url.toLowerCase()).includes(".pdf") || (item.url.toLowerCase()).includes(".doc") ||
                   (item.url.toLowerCase()).includes(".docx") || (item.url.toLowerCase()).includes(".xls") ||
                   (item.url.toLowerCase()).includes(".xlsx")){

                      item.url = "assets/global/img/no-image.png";
                }
            });

            //Calculate total tax and total value for ACV and RCV
            if ($scope.ItemDetails.rcv !== null && angular.isDefined($scope.ItemDetails.rcv)) {
                if ($scope.ItemDetails.taxRate !== null && angular.isDefined($scope.ItemDetails.taxRate)) {
                    $scope.ItemDetails.rcvTax = ($scope.ItemDetails.rcv * ($scope.ItemDetails.taxRate / 100)).toFixed(2);
                    $scope.ItemDetails.rcvTotal = $scope.ItemDetails.rcvTotal//(parseFloat($scope.ItemDetails.rcvTotal) + parseFloat(($scope.ItemDetails.rcv * ($scope.ItemDetails.taxRate / 100)))).toFixed(2);
                }
                else
                    $scope.ItemDetails.rcvTax = 0.00;
            }
            else {
                $scope.ItemDetails.rcvTotal = $scope.ItemDetails.rcvTotal;
                $scope.ItemDetails.rcvTax = 0.00
            }
            //For acv tax and total acv
            if ($scope.ItemDetails.acv !== null && angular.isDefined($scope.ItemDetails.acv)) {
                if ($scope.ItemDetails.taxRate !== null && angular.isDefined($scope.ItemDetails.taxRate)) {
                    $scope.ItemDetails.acvTax = parseFloat(($scope.ItemDetails.acv * ($scope.ItemDetails.taxRate / 100))).toFixed(2);
                    $scope.ItemDetails.acvTotal = (parseFloat($scope.ItemDetails.acv) + parseFloat(($scope.ItemDetails.acv * ($scope.ItemDetails.taxRate / 100)))).toFixed(2);
                }
                else
                    $scope.ItemDetails.acvTotal = $scope.ItemDetails.acv;

            } else {
                $scope.ItemDetails.acvTotal = $scope.ItemDetails.acv;
                $scope.ItemDetails.acvTax = 0.00;
            }
            $scope.showComparable = true;
            if($scope.ItemDetails.comparableItems && $scope.ItemDetails.comparableItems.length == 1){
                angular.forEach($scope.ItemDetails.comparableItems, function(item){
                    if(item.isReplacementItem){
                        $scope.showComparable = false;
                    }
                })
            }
            $scope.standardCostAccepted = true;
            // if($scope.ItemDetails.isReplaced){
                if($scope.ItemDetails.comparableItems && $scope.ItemDetails.comparableItems.length > 0){
                    $scope.standardCostAccepted = false;
                }
            // }
            // if($scope.ItemDetails.comparableItems && $scope.ItemDetails.comparableItems.length == 0){
            //     if($scope.ItemDetails.isReplaced)
            //     $scope.standardCostAccepted = true;
            //     // angular.forEach($scope.ItemDetails.comparableItems, function(item){
            //     //     if(item.isReplacementItem){
            //     //         $scope.showComparable = false;
            //     //     }
            //     // })
            // }
            $scope.comparableItems = [];
            let i=1;
            if($scope.ItemDetails.comparableItems && $scope.ItemDetails.comparableItems.length > 0){
                angular.forEach($scope.ItemDetails.comparableItems, function(item) {
                    if(item.isReplacementItem == false){
                    item.index = i;
                    i++;
                    $scope.comparableItems.push(item)
                    }
                })
                console.log($scope.comparableItems);
            }
            $scope.ItemDetails.acv = ($scope.ItemDetails.acv !== null && angular.isDefined($scope.ItemDetails.acv)) ? parseFloat($scope.ItemDetails.acv.toFixed(2)) : $scope.ItemDetails.acv;
            $scope.ItemDetails.itemOverage = ($scope.ItemDetails.itemOverage !== null && angular.isDefined($scope.ItemDetails.itemOverage)) ? parseFloat($scope.ItemDetails.itemOverage.toFixed(2)) : $scope.ItemDetails.itemOverage;
            $scope.ItemDetails.totalTax = ($scope.ItemDetails.totalTax !== null && angular.isDefined($scope.ItemDetails.totalTax)) ? parseFloat($scope.ItemDetails.totalTax.toFixed(2)) : $scope.ItemDetails.totalTax;
            $scope.ItemDetails.valueOfItem = ($scope.ItemDetails.valueOfItem !== null && angular.isDefined($scope.ItemDetails.valueOfItem)) ? parseFloat($scope.ItemDetails.valueOfItem.toFixed(2)) : $scope.ItemDetails.valueOfItem;
            $scope.ItemDetails.rcv = ($scope.ItemDetails.rcv !== null && angular.isDefined($scope.ItemDetails.rcv)) ? parseFloat($scope.ItemDetails.rcv.toFixed(2)) : $scope.ItemDetails.rcv;
            //$scope.ItemDetails.dateOfPurchase = $filter('DateFormatMMddyyyy')($scope.ItemDetails.dateOfPurchase);
            // get compairables stored in database and insrt in list Comparables
            var GetExistingComparablesFromDb = AdjusterLineItemDetailsService.GetExistingComparablesFromDb(param);
            GetExistingComparablesFromDb.then(function (successComparables) {
                $scope.Comparables = successComparables.data.data;
                $scope.showComparable = true;
                if($scope.Comparables.comparableItems.length == 1){
                    angular.forEach($scope.Comparables.comparableItems, function(item){
                        if(item.isReplacementItem){
                            $scope.showComparable = false;
                        }
                    })
                }
                //Use of the the hidden part is display only those item which is mark as Replacement
                //$scope.comparableMarkAsReplacement = [];
                //angular.forEach($scope.Comparables.comparableItems, function (comparableItems) {
                //    if (comparableItems.isReplacementItem == true)
                //    {
                //        $scope.comparableMarkAsReplacement.push(comparableItems);
                //        $scope.ReplacementDescription = comparableItems.description;
                //    }
                //});
                //$scope.Comparables.comparableItems = $scope.comparableMarkAsReplacement;
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
        getVendorDetails();

        }, function (error) {
        });
    }

    $scope.GetInsuranceCompanyDetails = GetInsuranceCompanyDetails;
    function GetInsuranceCompanyDetails() {
        var param = {
            "policyNumber": null,
            "claimNumber": $scope.CommonObj.ClaimNumber
        }
        var getCompanyDetails = AdjusterLineItemDetailsService.GetInsuranceCompanyDetails(param);
        getCompanyDetails.then(function (success) {
            $scope.InsuranceCompanyDetails = success.data.data.insuraceAccountDetails;
            $scope.InsuranceCompanyDetails.adjuster.name = $filter('constructName')($scope.InsuranceCompanyDetails.adjuster.lastName, $scope.InsuranceCompanyDetails.adjuster.firstName);
            $scope.policyHolderDetails = success.data.data.policyHolder;
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

    $scope.MarkAsReplacement = MarkAsReplacement;
    function MarkAsReplacement(comp) {
        angular.forEach($scope.Comparables.comparableItems, function (item) {
            if (item.id == comp.id) {
                item.isReplacementItem = true;
                calculateACVRCV(item);
            }
            else {
                item.isReplacementItem = false;
            }
        });
    }

    function calculateACVRCV(item) {
        //Toatal RCV if more than one comparable is added
        $scope.replacementCost = item.unitPrice;
        $scope.ActualCashValue = 0.0;
        //Get age of item
        if ($scope.ItemDetails.ageMonths !== null && angular.isDefined($scope.ItemDetails.ageMonths) && $scope.ItemDetails.ageMonths > 0) {
            if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears) && $scope.ItemDetails.ageYears !== "")
                age = parseFloat($scope.ItemDetails.ageYears) + (parseFloat($scope.ItemDetails.ageMonths) / 12);
            else
                age = (parseFloat($scope.ItemDetails.ageMonths) / 12);
        }
        else {
            if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears))
                age = parseFloat($scope.ItemDetails.ageYears);
            else
                age = 1;
        }

        var frequency = parseFloat(12);
        var DepereciationAmount
        //Get Depereciation rate
        if ($scope.ItemDetails.depriciationRate !== null && angular.isDefined($scope.ItemDetails.depriciationRate) && $scope.ItemDetails.depriciationRate > 0) {
            Depereciation = $scope.ItemDetails.depriciationRate;
            DepereciationAmount = parseFloat($scope.replacementCost) * (Math.pow((1 + (parseFloat(Depereciation) / (100 * frequency))), (frequency * age)));
            $scope.ActualCashValue = (parseFloat($scope.replacementCost) - (DepereciationAmount - parseFloat($scope.replacementCost)));
        }
        else {
            $scope.ActualCashValue = parseFloat($scope.replacementCost);
        }
        $scope.replacementCost = ($scope.replacementCost).toFixed(2);
        $scope.ActualCashValue = ($scope.ActualCashValue).toFixed(2);
        if (isNaN($scope.replacementCost)) {
            $scope.replacementCost = 0;
        }
        if (isNaN($scope.ActualCashValue)) {
            $scope.ActualCashValue = 0;
        }
    }

    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    // $scope.goToClaimDetails = function () {
    //     if (angular.isDefined(sessionStorage.getItem("AdjusterClaimNo")) && sessionStorage.getItem("AdjusterClaimNo")!==null)
    //         $location.url('AdjusterPropertyClaimDetails');
    //     else if(angular.isDefined(sessionStorage.getItem("SupervisorClaimNo")) && sessionStorage.getItem("SupervisorClaimNo")!==null)
    //         $location.url('SupervisorClaimDetails');
    //
    // };

    $scope.GoBack = function () {
        if (angular.isDefined(sessionStorage.getItem("AdjusterClaimNo")) && sessionStorage.getItem("AdjusterClaimNo") !== null)
            $location.url('AdjusterLineItemDetails');
        else if (angular.isDefined(sessionStorage.getItem("SupervisorClaimNo")) && sessionStorage.getItem("SupervisorClaimNo") !== null)
            $location.url('SupervisorLineItemDetails');
    };

    $scope.goToClaimDetails = function () {
        sessionStorage.setItem('claimDetailsCurrentTab','Contents');
        if(sessionStorage.getItem("isCoreLogic")=="true"){
            $location.url('CorelogicAdjusterPropertyClaimDetails')

        }else{
            $location.url($scope.CommonObj.ClaimDetailsPage);

        }
    }

    $scope.GoToVendorAssignments = function(){
        sessionStorage.setItem('claimDetailsCurrentTab','Vendor Assignments');
        $location.url($scope.CommonObj.ClaimDetailsPage);
    }

    $scope.GoToLineItem = GoToLineItem;
    function GoToLineItem(ItemId) {

        if ($scope.CommonObj.ClaimDetailsPage == "AdjusterPropertyClaimDetails") {
            sessionStorage.setItem("AdjusterPostLostItemId", $scope.CommonObj.ItemId);
            sessionStorage.setItem("AdjusterClaimNo", $scope.CommonObj.ClaimNumber);
            sessionStorage.setItem("AdjusterClaimId", $scope.CommonObj.ClaimId);
            $location.url($scope.CommonObj.LineDetailsPage);
        }
        else if ($scope.CommonObj.ClaimDetailsPage == "SupervisorClaimDetails") {
            sessionStorage.setItem("SupervisorClaimNo", $scope.CommonObj.ClaimNumber);
            sessionStorage.setItem("SupervisorClaimId", $scope.CommonObj.ClaimId);
            sessionStorage.setItem("SupervisorPostLostItemId", $scope.CommonObj.ItemId);
            $location.url($scope.CommonObj.LineDetailsPage);
        }
    };


    $scope.CreatePDF = CreatePDF;
    function CreatePDF() {
        ////Get the HTML of div
        //var divElements = document.getElementById('PrintableDiv').innerHTML;
        ////Get the HTML of whole page
        //var oldPage = document.body.innerHTML;

        ////Reset the page's HTML with div's HTML only
        //document.body.innerHTML =
        //  "<html><head><title></title></head><body>" +
        //  divElements + "</body>";
        ////Print Page
        //window.print();
        ////Restore orignal HTML
        //document.body.innerHTML = oldPage;

        var printContents = document.getElementById('PrintableDiv').innerHTML;
        var pdfTitle = "#" + $scope.CommonObj.ClaimNumber + "_" + $scope.policyHolderDetails.lastName + "_" + $scope.ItemDetails.itemNumber;
        var popupWin = window.open('', '_blank', 'width=300,height=300');
        popupWin.document.open();
        popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /> <link href="assets/global/plugins/bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" /><title>' + pdfTitle + '</title></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWin.document.close();

    }

    $scope.getVendorDetails = getVendorDetails;
    function getVendorDetails(){
        $scope.vendorDetails = {
            "logo" :
            {
                "url" : sessionStorage.getItem("vendorLogo")
            },
            "address":sessionStorage.getItem("vendorAddress")

        }
    }

    function addTitleToDocument()
    {   
        document.title =  "#" + $scope.CommonObj.ClaimNumber + "_" + $scope.policyHolderDetails.lastName + "_" + $scope.ItemDetails.itemNumber;
    }

    downloadPDF =()=>
    {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            claimNumber: $scope.CommonObj.ClaimNumber,
            itemId: $scope.CommonObj.ItemId
        }
        var getMERReport = AdjusterLineItemDetailsService.getMERReport(param);
        getMERReport.then(function (success) {
            var result = success.data;
            var headers = success.headers();
            var contentType = headers['content-type'];
            var linkElement = document.createElement('a');
            try{
                var blob = new Blob([result], { type: contentType });
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", "MER-"+$scope.CommonObj.ClaimNumber+"-"+$scope.capitalizeFirstLetter($scope.InsuranceCompanyDetails.policyHolderDetails.lastName)+", "+$scope.capitalizeFirstLetter($scope.InsuranceCompanyDetails.policyHolderDetails.firstName));
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
            }catch (ex) {
                toastr.remove();
                toastr.success(ex);
            }
            $(".page-spinner-bar").addClass("hide");
        }, function(error){
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        })
        // var title = document.title;
        // addTitleToDocument();
        // window.print();
        // document.title = title;
    }
    $scope.capitalizeFirstLetter = capitalizeFirstLetter;
    function capitalizeFirstLetter(str) {

        // converting first letter to uppercase
        const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    
        return capitalized;
    }
});
