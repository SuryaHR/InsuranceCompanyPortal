angular.module('MetronicApp').controller('SalvageDetailsController', function ($rootScope, $scope, settings, $location, $translate, $translatePartialLoader,
    $filter, $window, AuthHeaderService, SalvageService, $uibModal) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('SalvageDetails');
    $translate.refresh();
    $scope.PackingSlipList = [];
    $scope.UserName = sessionStorage.getItem("UserLastName") + ", " + sessionStorage.getItem("UserFirstName")
    $scope.PaymentTerms;
    $scope.Attachments = [];
    $scope.polishList = [];
    $scope.symmetryList = [];
    $scope.fluorescenceList = [];
    $scope.MetalTypeList = [];
    $scope.MetalColorList = [];
    $scope.StoneTypeList = [];
    $scope.StoneColorList == [];
    $scope.StoneShapeList = [];
    $scope.StoneClarityList = [];
    $scope.showPaymentAlerts = false;
    $scope.SalvageDetails = {};
    $scope.attachmentListSalvage = [];
    $scope.item = { "Subitem": "" }
    $scope.salvageDetails = { "salvageProfile": "" }
    //$scope.salvageDetails.salvageProfile.id = 1;
    $scope.salvageInfoBox = false;
    $scope.showBuyback = false;
    $scope.costToAdjusterPayable = 0;

    $scope.barLabels = [];
    $scope.barData = [];

    $scope.salvageBidsDetails = [
        {
            "date": $scope.currentDate,
            "vendor": {
                "vendorId": sessionStorage.getItem("VendorId")
            },
            "bidValue": ""
        },
        {
            "date": $scope.currentDate,
            "vendor": {
                "vendorId": sessionStorage.getItem("VendorId")
            },
            "bidValue": ""
        },
        {
            "date": $scope.currentDate,
            "vendor": {
                "vendorId": sessionStorage.getItem("VendorId")
            },
            "bidValue": ""
        },
        {
            "date": $scope.currentDate,
            "vendor": {
                "vendorId": sessionStorage.getItem("VendorId")
            },
            "bidValue": ""
        },
        {
            "date": $scope.currentDate,
            "vendor": {
                "vendorId": sessionStorage.getItem("VendorId")
            },
            "bidValue": ""
        },
        {
            "date": $scope.currentDate,
            "vendor": {
                "vendorId": sessionStorage.getItem("VendorId")
            },
            "bidValue": ""
        }
    ];

    //$scope.Subitem = ["Gemstone", "Luxury Watch", "Finished Item", "Ring", " Necklace", "Earring", "Bracelet"];
    $scope.SalvageProfilelist = [{ id: 1, name: "Diamond" }, { id: 2, name: "Gemstone" }, { id: 3, name: "Luxury Watch" }, { id: 4, name: "Finish Item" }];

    //$scope.item.Subitem = $scope.Subitem[0].item;
    $scope.subItem = "1"//$scope.item.Subitem;
    $scope.YAxis_Clarity = [];
    $scope.YAxis_Color = [];
    $scope.YAxis_Carat_Weight = [];

    $scope.XAxis = [
        { item: "Stated" },
        { item: "Estimated" },
        { item: "Actual" }
    ];
    $scope.XAxis_Clarity_values = [{ item: "700" }, { item: "100" }, { item: "400" }];
    $scope.YAxis_Clarity = [
        { label: "I3", value: 100, "tickLength": 5 },
        { label: "I2", value: 200, "tickLength": 5 },
        { label: "I1", value: 300, "tickLength": 5 },
        { label: "SI2", value: 400, "tickLength": 5 },
        { label: "SI1", value: 500, "tickLength": 5 },
        { label: "VS2", value: 600, "tickLength": 5 },
        { label: "VS1", value: 700, "tickLength": 5 },
        { label: "VVS2", value: 800, "tickLength": 5 },
        { label: "VVS1", value: 900, "tickLength": 5 },
        { label: "IF", value: 1000, "tickLength": 5 },
        { label: "F", value: 1100, "tickLength": 5 }
    ];
    $scope.YAxis_Color = [
        { label: "S", value: 100, "tickLength": 5 },
        { label: "R", value: 200, "tickLength": 5 },
        { label: "Q", value: 300, "tickLength": 5 },
        { label: "P", value: 400, "tickLength": 5 },
        { label: "O", value: 500, "tickLength": 5 },
        { label: "N", value: 600, "tickLength": 5 },
        { label: "M", value: 700, "tickLength": 5 },
        { label: "L", value: 800, "tickLength": 5 },
        { label: "K", value: 900, "tickLength": 5 },
        { label: "J", value: 1000, "tickLength": 5 },
        { label: "I", value: 1100, "tickLength": 5 },
        { label: "H", value: 1200, "tickLength": 5 },
        { label: "G", value: 1300, "tickLength": 5 },
        { label: "F", value: 1400, "tickLength": 5 },
        { label: "E", value: 1500, "tickLength": 5 },
        { label: "D", value: 1600, "tickLength": 5 },
    ];
    $scope.$on('getSalvageDetails', function(e) {  
        $scope.$parent.getSalvageDetails = ( $scope.GetSalvageDetails())
    });

    function init() {
        $scope.SoftwareEstimate = { PreEstimate: 0, totalPrice: 0 };
        GetPolicyHolderDetails();
        GetSalvageDetails();
        $scope.imgDiv = false;

        //SLVG-45, 46
        sessionStorage.removeItem("ForwardTab");
    }
    init();

    $scope.ChangeProfile = ChangeProfile;
    function ChangeProfile() {

        if ($scope.salvageDetails.salvageProfile.id == 1) {//Diamond
            $scope.subItem = "1"
            //getDiamondSalvageDetails(11);
        } else if ($scope.salvageDetails.salvageProfile.id == 2) {//gemstone
            $scope.subItem = "2"
            //GetGemstoneSalvageDetails(18);
        } else if ($scope.salvageDetails.salvageProfile.id == 3) {//Luxury Watch
            $scope.subItem = "3"
            //GetLuxuryWatchSalvageDetails(12);
        } else if ($scope.salvageDetails.salvageProfile.id == 4) {//Finish Item
            $scope.subItem = "4"
            //getFinishedItemDetails(10);
        }
    }

    $scope.GetPolicyHolderDetails = GetPolicyHolderDetails;
    function GetPolicyHolderDetails() {
        var param_PolicyHolder = {
            "policyNumber": null,
            "claimNumber": $scope.CommonObj.ClaimNumber
        };
        var getDetails = SalvageService.GetPolicyHolderDetails(param_PolicyHolder);
        getDetails.then(function (success) {
            $scope.PolicyholderDetails = success.data.data;
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
    };

    $scope.GetSalvageDetails = GetSalvageDetails;
    function GetSalvageDetails() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "claimItem": {
                "id": sessionStorage.getItem("AdjusterPostLostItemId")
            }
        };
        var SalvageDetails = SalvageService.GetSalvageDetails(param);
        SalvageDetails.then(function (success) {
            $scope.salvageDetails = success.data.data;
            $scope.salvageDetails.trackerReceivedDate = (angular.isDefined($scope.salvageDetails.trackerReceivedDate) && $scope.salvageDetails.trackerReceivedDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.trackerReceivedDate)) : null;
            $scope.salvageDetails.estimateApprovalDate = (angular.isDefined($scope.salvageDetails.estimateApprovalDate) && $scope.salvageDetails.estimateApprovalDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.estimateApprovalDate)) : null;
            $scope.salvageDetails.bidAcceptedDate = (angular.isDefined($scope.salvageDetails.bidAcceptedDate) && $scope.salvageDetails.bidAcceptedDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.bidAcceptedDate)) : null;
            if ($scope.salvageDetails.salvageId != null) {
                $scope.salvageInfoBox = false;
            } else {
                $scope.salvageInfoBox = true;
            }

            if (angular.isDefined($scope.salvageDetails) && $scope.salvageDetails != null && $scope.salvageDetails.salvageProfile != null) {

                $scope.summaryEstimation = [];
                $scope.postSaleSummary = [];
                let estimationSummaryObj = $scope.salvageDetails.estimationSummary;
                let postSaleSummaryObj = $scope.salvageDetails.postSaleSummary;

                $scope.totalAdditionalStones = estimationSummaryObj && estimationSummaryObj.totalAdditionalStones ? estimationSummaryObj.totalAdditionalStones:0;
                $scope.contractedCommissionPt = estimationSummaryObj && estimationSummaryObj.contractedCommissionPt ? estimationSummaryObj.contractedCommissionPt:0;
                              

                // Set all summary estimate values
                $scope.summaryEstimation.push({                          
                    totalSalvageValue: estimationSummaryObj && estimationSummaryObj.totalSalvageValue ? estimationSummaryObj.totalSalvageValue : 0,
                    totalCommissionValue: estimationSummaryObj && estimationSummaryObj.totalCommissionValue ? estimationSummaryObj.totalCommissionValue:0,
                    contCommPT: estimationSummaryObj && estimationSummaryObj.contCommPT ? estimationSummaryObj.contCommPT:0,
                    contractedCommissionPt : estimationSummaryObj && estimationSummaryObj.contractedCommissionPt ? estimationSummaryObj.contractedCommissionPt:0,
                    totalShippingValue: estimationSummaryObj && estimationSummaryObj.totalShippingValue ? estimationSummaryObj.totalShippingValue:0,
                    totalCuttingValue: estimationSummaryObj && estimationSummaryObj.totalCuttingValue ? estimationSummaryObj.totalCuttingValue:0,
                    totalCertValue: estimationSummaryObj && estimationSummaryObj.totalCertValue ? estimationSummaryObj.totalCertValue:0,
                    totalNetValue: estimationSummaryObj && estimationSummaryObj.totalNetValue ? estimationSummaryObj.totalNetValue:0,
                    totalAdditionalStones: estimationSummaryObj && estimationSummaryObj.totalAdditionalStones ? estimationSummaryObj.totalAdditionalStones:0,
                    totalFeesValue: estimationSummaryObj && estimationSummaryObj.totalFeesValue ? estimationSummaryObj.totalFeesValue:0,                    
                    totalMetalValue : estimationSummaryObj && estimationSummaryObj.totalMetalValue ? estimationSummaryObj.totalMetalValue:0,
                    totalSummrySalvageValue : estimationSummaryObj && estimationSummaryObj.totalSummrySalvageValue ? estimationSummaryObj.totalSummrySalvageValue:0,
                    totalOtherSalvageValue: estimationSummaryObj && estimationSummaryObj.totalOtherSalvageValue ? estimationSummaryObj.totalOtherSalvageValue : 0,
                    lowEstimate: estimationSummaryObj && estimationSummaryObj.lowEstimate ? estimationSummaryObj.lowEstimate : 0,
                    highEstimate :estimationSummaryObj && estimationSummaryObj.highEstimate ? estimationSummaryObj.highEstimate : 0,

                });

                // Set all Post summary estimate values
                $scope.postSaleSummary.push({
                    totalSaleValue: postSaleSummaryObj && postSaleSummaryObj.totalSaleValue ? postSaleSummaryObj.totalSaleValue : 0,
                    totalNetSaleValue : postSaleSummaryObj && postSaleSummaryObj.totalNetSaleValue ? postSaleSummaryObj.totalNetSaleValue : 0,                
                    totalCertReCutShipFee: postSaleSummaryObj && postSaleSummaryObj.totalCertReCutShipFee ? postSaleSummaryObj.totalCertReCutShipFee : 0,
                    totalCommissionValue: postSaleSummaryObj && postSaleSummaryObj.totalCommissionValue ? postSaleSummaryObj.totalCommissionValue : 0,           
                    contCommPT : postSaleSummaryObj && postSaleSummaryObj.contCommPT ? postSaleSummaryObj.contCommPT : 0,
                    contractedCommissionPt: postSaleSummaryObj && postSaleSummaryObj.contractedCommissionPt ? postSaleSummaryObj.contractedCommissionPt : 0,
                    totalShippingValue: postSaleSummaryObj && postSaleSummaryObj.totalShippingValue ? postSaleSummaryObj.totalShippingValue : 0,
                    totalCuttingValue: postSaleSummaryObj && postSaleSummaryObj.totalCuttingValue ? postSaleSummaryObj.totalCuttingValue : 0,
                    totalCertValue: postSaleSummaryObj && postSaleSummaryObj.totalCertValue ? postSaleSummaryObj.totalCertValue : 0,
                    totalAdditionalStones: postSaleSummaryObj && postSaleSummaryObj.totalAdditionalStones ? postSaleSummaryObj.totalAdditionalStones : 0,           
                    totalMetalValue : postSaleSummaryObj && postSaleSummaryObj.totalMetalValue ? postSaleSummaryObj.totalMetalValue : 0,
                    totalSummrySalvageValue : postSaleSummaryObj && postSaleSummaryObj.totalSummrySalvageValue ? postSaleSummaryObj.totalSummrySalvageValue : 0,
                    totalOtherSalvageValue: postSaleSummaryObj && postSaleSummaryObj.totalOtherSalvageValue ? postSaleSummaryObj.totalOtherSalvageValue : 0,
                });

                if ($scope.salvageDetails.salvageProfile.id == 1)//diamond
                {
                    if (angular.isDefined($scope.salvageDetails.id) && $scope.salvageDetails.id != null) {
                        $scope.salvageDetails.salvageDate = (angular.isDefined($scope.salvageDetails.salvageDate) && $scope.salvageDetails.salvageDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.salvageDate)) : null;
                        // $scope.salvageDetails.cuttersDate = (angular.isDefined($scope.salvageDetails.cuttersDate) && $scope.salvageDetails.cuttersDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.cuttersDate)) : null;
                        // $scope.salvageDetails.giaDate = (angular.isDefined($scope.salvageDetails.giaDate) && $scope.salvageDetails.giaDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.giaDate)) : null;
                        // $scope.salvageDetails.bidDate = (angular.isDefined($scope.salvageDetails.bidDate) && $scope.salvageDetails.bidDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.bidDate)) : null;
                        // $scope.salvageDetails.pendingShippingDate = (angular.isDefined($scope.salvageDetails.pendingShippingDate) && $scope.salvageDetails.pendingShippingDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.pendingShippingDate)) : null;
                        $scope.salvageDetails.billingDetails.datePaid = (angular.isDefined($scope.salvageDetails.billingDetails.datePaid) && $scope.salvageDetails.billingDetails.datePaid != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.billingDetails.datePaid)) : null;
                        $scope.salvageDetails.sellingRateDetails.dateOfSale = (angular.isDefined($scope.salvageDetails.sellingRateDetails.dateOfSale) && $scope.salvageDetails.sellingRateDetails.dateOfSale != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.sellingRateDetails.dateOfSale)) : null;
                        $scope.salvageDetails.metalDetails.date = (angular.isDefined($scope.salvageDetails.metalDetails.date) && $scope.salvageDetails.metalDetails.date != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.metalDetails.date)) : null;
                        $scope.subItem = $scope.salvageDetails.salvageProfile.id;
                        $scope.salvageDetails.salvageProfile.id = $scope.salvageDetails.salvageProfile.id;
                        $scope.additionalStoneDetailsDiamond = [];
                        if ($scope.salvageDetails.additionalStoneDetails.length > 0) {
                            angular.forEach($scope.salvageDetails.additionalStoneDetails, function (item) {
                                $scope.additionalStoneDetailsDiamond.push({
                                    "id": angular.isDefined(item.id) ? item.id : null,
                                    "stoneUID": item.additionalStoneUID,
                                    "stoneType": item.stoneType,
                                    "individualWeight": item.individualWeight,
                                    "quantity": item.quantity,
                                    "totalCaratWeight": item.totalCaratWeight,
                                    "pricePerCarat": item.pricePerCarat,
                                    "totalPrice": item.totalPrice
                                });
                            });
                            $scope.NewStoneItemDiamond = false;
                        } else {
                            $scope.additionalStoneDetailsDiamond = [];
                        }

                        /*  $scope.ShowBidDetailsTab = false;
                          var TempSalvageBidDetails = [];
                          if ($scope.salvageDetails.salvageBidsDetails && $scope.salvageDetails.salvageBidsDetails.length > 0) {
                              angular.forEach($scope.salvageDetails.salvageBidsDetails, function (item) {
                                  TempSalvageBidDetails.push({
                                      "date": (angular.isDefined(item.date) && item.date != null) ? ($filter('DateFormatMMddyyyy')(item.date)) : null,
                                      //"vendor": {
                                      //    "vendorId": sessionStorage.getItem("VendorId")
                                      //},
                                      "bidValue": item.bidValue,
                                      "bidsUID": item.bidsUID,
                                      "vendorName": item.vendorName
                                  })
                                  if (item.vendorName != null && item.bidValue != null) {
                                      $scope.ShowBidDetailsTab = true;
                                  }
                              })
                              bidChart();
                          }
                          $scope.salvageDetails.salvageBidsDetails = TempSalvageBidDetails
                          */
                        //$scope.DimondItemList[0].explanation = $scope.SalvageDetails.explanation
                        //$scope.salvageDetails.metalDetails = $scope.salvageDetails.metalDetails;
                        var TempsalvageDiamondStones = [];
                        var number = 1;
                        if ($scope.salvageDetails.salvageDiamondStones.length > 0) {
                            angular.forEach($scope.salvageDetails.salvageDiamondStones, function (item) {
                                TempsalvageDiamondStones.push({
                                    "number": number,
                                    "stoneSource": item.stoneSource,
                                    "originalStone": item.originalStone,
                                    "estimateBeforeRepair": item.estimateBeforeRepair,
                                    "actualAfterRepair": item.actualAfterRepair,
                                    "replacementQuoted": item.replacementQuoted,
                                    "toDelete": item.toDelete,
                                    "explanation": angular.isUndefined(item.explanation) ? null : (item.explanation),
                                    "id": angular.isUndefined(item.id) ? null : item.id
                                });
                                //getNameFromId($scope.DropDownList.salvageColor, item.originalStone.color.id, number, 'originalStoneColor');
                                //getNameFromId($scope.DropDownList.salvageClarity, item.originalStone.clarity.id, Item.number, 'originalStoneClarity');
                                //getNameFromId($scope.DropDownList.salvageColor, item.actualAfterRepair.color.id, Item.number, 'actualAfterRepairColor');
                                //getNameFromId($scope.DropDownList.salvageClarity, Item.actualAfterRepair.clarity.id, Item.number, 'actualAfterRepairClarity');
                                //getNameFromId($scope.DropDownList.cutGrades, Item.actualAfterRepair.cutGrade.id, Item.number, 'actualAfterRepairCutGrade');
                                var TempSalvageBidDetails = [];
                                $scope.salvageDetails.salvageBidsDetails[number] = [];
                                var i = 1;
                                if (item.bidsDetailList && item.bidsDetailList.length > 0) {
                                    angular.forEach(item.bidsDetailList, function (item) {
                                        TempSalvageBidDetails.push({
                                            "date": (angular.isDefined(item.date) && item.date != null) ? ($filter('DateFormatMMddyyyy')(item.date)) : null,
                                            "vendorName": "Bid #" + i,
                                            //"vendor": {
                                            //    "vendorId": sessionStorage.getItem("VendorId")
                                            //},
                                            "bidValue": item.bidValue,
                                            "bidsUID": item.bidsUID,
                                            "id": item.id
                                        })
                                        i++;
                                        if (item.bidValue && item.vendorName) {
                                            $scope.showBidChart = true;
                                        }
                                    })
                                    $scope.salvageDetails.salvageBidsDetails[number] = TempSalvageBidDetails;
                                    // $scope.diamondBid[i].push(TempSalvageBidDetails);
                                    $scope.ShowBidDetailsTab = true;
                                    bidChart(1);
                                }
                                else {
                                    $scope.showBidChart = false;
                                    $scope.salvageDetails.salvageBidsDetails[number] = $scope.salvageBidsDetails;
                                    // $scope.diamondBid[i].push(TempSalvageBidDetails);
                                }
                                number++;
                            });
                        }
                        $scope.DimondItemList = TempsalvageDiamondStones;
                        $scope.attachmentListSalvage = [];
                        if ($scope.salvageDetails.attachmentList && $scope.salvageDetails.attachmentList.length) {
                            angular.forEach($scope.salvageDetails.attachmentList, function (item) {
                                var fileType = item.type ? item.type : item.name.substr((item.name.lastIndexOf('.') + 1));
                                $scope.attachmentListSalvage.push({
                                    "imageId": item.id, "FileName": item.name, "FileExtension": fileType, "FileType": fileType,
                                    "Image": item.url, "File": item.url, "url": item.url, "description": item.description
                                });
                            });
                        }
                        // if Work-flow is consignment & policy buyback
                        if ((angular.isDefined($scope.salvageDetails.workFlow) && $scope.salvageDetails.workFlow.id == 2) ||
                            (angular.isDefined($scope.salvageDetails.workFlow) && $scope.salvageDetails.workFlow.id == 3)) {
                            $scope.DimandMainStone = [];
                            $scope.DimandMainStone.push($scope.salvageDetails.sellingRateDetails.netPrice);
                        }

                        calculateSalvageTotal();
                        window.setTimeout(function () {
                            setGraph($scope.DimondItemList[0]);
                        }, 1000);

                    }
                } else if ($scope.salvageDetails.salvageProfile.id == 2)//Gemstone
                {
                    if (angular.isDefined($scope.salvageDetails.id) && $scope.salvageDetails.id != null) {
                        $scope.salvageDetails.salvageDate = (angular.isDefined($scope.salvageDetails.salvageDate) && $scope.salvageDetails.salvageDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.salvageDate)) : null;
                        // $scope.salvageDetails.cuttersDate = (angular.isDefined($scope.salvageDetails.cuttersDate) && $scope.salvageDetails.cuttersDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.cuttersDate)) : null;
                        // $scope.salvageDetails.giaDate = (angular.isDefined($scope.salvageDetails.giaDate) && $scope.salvageDetails.giaDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.giaDate)) : null;
                        // $scope.salvageDetails.bidDate = (angular.isDefined($scope.salvageDetails.bidDate) && $scope.salvageDetails.bidDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.bidDate)) : null;
                        // $scope.salvageDetails.pendingShippingDate = (angular.isDefined($scope.salvageDetails.pendingShippingDate) && $scope.salvageDetails.pendingShippingDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.pendingShippingDate)) : null;
                        $scope.salvageDetails.billingDetails.datePaid = (angular.isDefined($scope.salvageDetails.billingDetails.datePaid) && $scope.salvageDetails.billingDetails.datePaid != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.billingDetails.datePaid)) : null;
                        $scope.salvageDetails.sellingRateDetails.dateOfSale = (angular.isDefined($scope.salvageDetails.sellingRateDetails.dateOfSale) && $scope.salvageDetails.sellingRateDetails.dateOfSale != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.sellingRateDetails.dateOfSale)) : null;
                        $scope.salvageDetails.metalDetails.date = (angular.isDefined($scope.salvageDetails.metalDetails.date) && $scope.salvageDetails.metalDetails.date != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.metalDetails.date)) : null;
                        $scope.subItem = $scope.salvageDetails.salvageProfile.id;
                        $scope.salvageDetails.salvageProfile.id = $scope.salvageDetails.salvageProfile.id;

                        $scope.additionalStoneDetailsGemstone = [];
                        if ($scope.salvageDetails.additionalStoneDetails.length > 0) {
                            angular.forEach($scope.salvageDetails.additionalStoneDetails, function (item) {
                                $scope.additionalStoneDetailsGemstone.push({
                                    "id": angular.isDefined(item.id) ? item.id : null,
                                    "stoneUID": item.additionalStoneUID,
                                    "stoneType": item.stoneType,
                                    "individualWeight": item.individualWeight,
                                    "quantity": item.quantity,
                                    "totalCaratWeight": item.totalCaratWeight,
                                    "pricePerCarat": item.pricePerCarat,
                                    "totalPrice": item.totalPrice
                                });
                            });
                            $scope.NewStoneItemGemstone = false;
                        } else {
                            $scope.additionalStoneDetailsGemstone = [];
                        }
                        $scope.additionalStoneDetailsGemstone = $scope.additionalStoneDetailsGemstone;
                        /* $scope.ShowBidDetailsTab = false;
                         var TempSalvageBidDetails = [];
                         if ($scope.salvageDetails.salvageBidsDetails.length > 0) {
                             angular.forEach($scope.salvageDetails.salvageBidsDetails, function (item) {
                                 TempSalvageBidDetails.push({
                                     "date": (angular.isDefined(item.date) && item.date != null) ? ($filter('DateFormatMMddyyyy')(item.date)) : null,
                                     //"vendor": {
                                     //    "vendorId": sessionStorage.getItem("VendorId")
                                     //},
                                     "bidValue": item.bidValue,
                                     "bidsUID": item.bidsUID,
                                     "vendorName": item.vendorName
                                 })
                                 if (item.vendorName != null && item.bidValue != null) {
                                     $scope.ShowBidDetailsTab = true;
                                 }
                             })
                             bidChart();
                         }
                         $scope.salvageDetails.salvageBidsDetails = TempSalvageBidDetails
                         */
                        var TempsalvageDiamondStones = [];
                        var number = 1;
                        if ($scope.salvageDetails.salvageDiamondStones.length > 0) {
                            angular.forEach($scope.salvageDetails.salvageDiamondStones, function (item) {
                                TempsalvageDiamondStones.push({
                                    "number": number,
                                    "stoneUID": item.stoneUID,
                                    "originalStone": item.originalStone,
                                    "estimateBeforeRepair": item.estimateBeforeRepair,
                                    "actualAfterRepair": item.actualAfterRepair,
                                    "stoneSource": item.stoneSource
                                    //"replacementQuoted": item.replacementQuoted
                                });
                                console.log('data', TempsalvageDiamondStones);
                                var TempSalvageBidDetails = [];
                                $scope.salvageDetails.salvageBidsDetails[number] = [];
                                var i = 1;
                                if (item.bidsDetailList && item.bidsDetailList.length > 0) {
                                    angular.forEach(item.bidsDetailList, function (item) {
                                        TempSalvageBidDetails.push({
                                            "date": (angular.isDefined(item.date) && item.date != null) ? ($filter('DateFormatMMddyyyy')(item.date)) : null,
                                            "vendorName": "Bid #" + i,
                                            //"vendor": {
                                            //    "vendorId": sessionStorage.getItem("VendorId")
                                            //},
                                            "bidValue": item.bidValue,
                                            "bidsUID": item.bidsUID,
                                            "id": item.id
                                        })
                                        if (item.bidValue && item.vendorName) {
                                            $scope.showBidChart = true;
                                        }
                                        i++;
                                    })
                                    $scope.salvageDetails.salvageBidsDetails[number] = TempSalvageBidDetails;
                                    // $scope.diamondBid[i].push(TempSalvageBidDetails);
                                    $scope.ShowBidDetailsTab = true;
                                    bidChart(1);
                                }
                                else {
                                    $scope.ShowBidDetailsTab = false;
                                    $scope.salvageDetails.salvageBidsDetails[number] = $scope.salvageBidsDetails;
                                    // $scope.diamondBid[i].push(TempSalvageBidDetails);
                                }
                                number++;
                            })
                        }
                        $scope.GemstoneItemList = TempsalvageDiamondStones;
                        $scope.attachmentListSalvage = [];
                        if ($scope.salvageDetails.attachmentList && $scope.salvageDetails.attachmentList.length) {
                            angular.forEach($scope.salvageDetails.attachmentList, function (item) {
                                var fileType = item.type ? item.type : item.name.substr((item.name.lastIndexOf('.') + 1));
                                $scope.attachmentListSalvage.push({
                                    "imageId": item.id, "FileName": item.name, "FileExtension": fileType, "FileType": fileType,
                                    "Image": item.url, "File": item.url, "url": item.url, "description": item.description
                                });
                            });
                        }
                    }

                    // if Work-flow is consignment & policy buyback
                    if (($scope.salvageDetails.workFlow && $scope.salvageDetails.workFlow.id == 2) ||
                        ($scope.salvageDetails.workFlow && $scope.salvageDetails.workFlow.id == 3)) {
                        $scope.salvageMainStone = [];
                        $scope.salvageMainStone.push($scope.salvageDetails.sellingRateDetails.netPrice)
                    }

                    calculateSalvageTotalGemstone()
                } else if ($scope.salvageDetails.salvageProfile.id == 3)//Luxury Watch
                {
                    if (angular.isDefined($scope.salvageDetails.id) && $scope.salvageDetails.id != null) {
                        $scope.subItem = $scope.salvageDetails.salvageProfile.id
                        $scope.additionalStoneDetailsLuxuryWatch = [];
                        if ($scope.salvageDetails.additionalStoneDetails.length > 0) {
                            angular.forEach($scope.salvageDetails.additionalStoneDetails, function (item) {
                                $scope.additionalStoneDetailsLuxuryWatch.push({
                                    "id": angular.isDefined(item.id) ? item.id : null,
                                    "stoneUID": item.additionalStoneUID,
                                    "stoneType": item.stoneType,
                                    "individualWeight": item.individualWeight,
                                    "quantity": item.quantity,
                                    "totalCaratWeight": item.totalCaratWeight,
                                    "pricePerCarat": item.pricePerCarat,
                                    "totalPrice": item.totalPrice
                                });
                            });
                            $scope.NewStoneItemGemstone = false;
                        } else {
                            $scope.additionalStoneDetailsLuxuryWatch = [];
                        }
                        $scope.salvageDetails.salvageDate = (angular.isDefined($scope.salvageDetails.salvageDate) && $scope.salvageDetails.salvageDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.salvageDate)) : null;
                        // $scope.salvageDetails.cuttersDate = (angular.isDefined($scope.salvageDetails.cuttersDate) && $scope.salvageDetails.cuttersDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.cuttersDate)) : null;
                        // $scope.salvageDetails.giaDate = (angular.isDefined($scope.salvageDetails.giaDate) && $scope.salvageDetails.giaDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.giaDate)) : null;
                        // $scope.salvageDetails.bidDate = (angular.isDefined($scope.salvageDetails.bidDate) && $scope.salvageDetails.bidDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.bidDate)) : null;
                        // $scope.salvageDetails.pendingShippingDate = (angular.isDefined($scope.salvageDetails.pendingShippingDate) && $scope.salvageDetails.pendingShippingDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.pendingShippingDate)) : null;
                        $scope.salvageDetails.sellingRateDetails.dateOfSale = (angular.isDefined($scope.salvageDetails.sellingRateDetails.dateOfSale) && $scope.salvageDetails.sellingRateDetails.dateOfSale != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.sellingRateDetails.dateOfSale)) : null;
                        $scope.salvageDetails.metalDetails.date = (angular.isDefined($scope.salvageDetails.metalDetails.date) && $scope.salvageDetails.metalDetails.date != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.metalDetails.date)) : null;
                        $scope.salvageDetails.billingDetails.datePaid = (angular.isDefined($scope.salvageDetails.billingDetails.datePaid) && $scope.salvageDetails.billingDetails.datePaid != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.billingDetails.datePaid)) : null;
                        var TempSalvageBidDetails = [];
                        var i = 1;
                        if ($scope.salvageDetails.salvageBidsDetails.length > 0) {
                            angular.forEach($scope.salvageDetails.salvageBidsDetails, function (item) {
                                TempSalvageBidDetails.push({
                                    "date": (angular.isDefined(item.date) && item.date != null) ? ($filter('DateFormatMMddyyyy')(item.date)) : null,
                                    //"vendor": {
                                    //    "vendorId": angular.isUndefined(item.vendorId) ? null : item.vendorId
                                    //},
                                    "vendorName": "Bid #" + i,
                                    "bidValue": item.bidValue,
                                    "bidsUID": item.bidsUID
                                })
                                if (item.vendorName != null && item.bidValue != null) {
                                    $scope.ShowBidDetailsTab = true;
                                }
                                i++;
                            })
                            $scope.salvageDetails.salvageBidsDetails[1] = TempSalvageBidDetails;

                            $scope.ShowBidDetailsTab = true;
                            bidChart(1);
                        }
                        $scope.salvageDetails.salvageBidsDetails[1] = TempSalvageBidDetails;
                        $scope.attachmentListSalvage = [];
                        if ($scope.salvageDetails.attachmentList && $scope.salvageDetails.attachmentList.length) {
                            angular.forEach($scope.salvageDetails.attachmentList, function (item) {
                                var fileType = item.type ? item.type : item.name.substr((item.name.lastIndexOf('.') + 1));
                                $scope.attachmentListSalvage.push({
                                    "imageId": item.id, "FileName": item.name, "FileExtension": fileType, "FileType": fileType,
                                    "Image": item.url, "File": item.url, "url": item.url, "description": item.description
                                });
                            });
                        }
                        calculateSalvageTotalLuxuryWatch();
                    }
                } else if ($scope.salvageDetails.salvageProfile.id == 4)//Finish Item
                {
                    if (angular.isDefined($scope.salvageDetails.id) && $scope.salvageDetails.id != null) {
                        $scope.subItem = $scope.salvageDetails.salvageProfile.id;
                        $scope.salvageDetails.salvageProfile.id = $scope.salvageDetails.salvageProfile.id;
                        $scope.salvageDetails.metalDetails.date = (angular.isDefined($scope.salvageDetails.metalDetails.date) && $scope.salvageDetails.metalDetails.date != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.metalDetails.date)) : null;
                        $scope.salvageDetails.sellingRateDetails.dateOfSale = (angular.isDefined($scope.salvageDetails.sellingRateDetails.dateOfSale) && $scope.salvageDetails.sellingRateDetails.dateOfSale != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.sellingRateDetails.dateOfSale)) : null;
                        $scope.salvageDetails.billingDetails.datePaid = (angular.isDefined($scope.salvageDetails.billingDetails.datePaid) && $scope.salvageDetails.billingDetails.datePaid != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.billingDetails.datePaid)) : null;
                        var TempsalvageDiamondStones = [];
                        var number = 1;
                        if ($scope.salvageDetails.salvageItemFinished.length > 0) {
                            angular.forEach($scope.salvageDetails.salvageItemFinished, function (item) {

                                var TempSalvageBidDetails = [];
                                var i = 1;
                                $scope.salvageDetails.salvageBidsDetails[number] = [];
                                //console.log(item.bidsDetailList);
                                if (item.bidsDetailList && item.bidsDetailList.length > 0) {
                                    angular.forEach(item.bidsDetailList, function (item) {
                                        TempSalvageBidDetails.push({
                                            "date": (angular.isDefined(item.date) && item.date != null) ? ($filter('DateFormatMMddyyyy')(item.date)) : null,
                                            //"vendor": {
                                            //    "vendorId": angular.isUndefined(item.vendorId) ? null : item.vendorId
                                            //},
                                            "vendorName": "Bid #" + i,
                                            "bidValue": item.bidValue,
                                            "bidsUID": item.bidsUID
                                        })
                                        if (item.vendorName != null && item.bidValue != null) {
                                            $scope.ShowBidDetailsTab = true;
                                        }
                                        i++;
                                    })
                                    $scope.salvageDetails.salvageBidsDetails[number] = TempSalvageBidDetails;

                                    $scope.ShowBidDetailsTab = true;
                                    bidChart(1);
                                } else {
                                    $scope.ShowBidDetailsTab = false;
                                    $scope.salvageDetails.salvageBidsDetails[number] = $scope.salvageBidsDetails;
                                    // $scope.diamondBid[i].push(TempSalvageBidDetails);
                                }
                                //$scope.salvageDetails.salvageBidsDetails[1] = TempSalvageBidDetails;
                                TempsalvageDiamondStones.push({
                                    "number": number,
                                    "id": angular.isUndefined(item.id) ? null : item.id,
                                    "mainStone": item.mainStone,
                                    "stoneSource": item.mainStone && item.mainStone.stoneSoure ? item.mainStone.stoneSoure : null,
                                    "salvageEstimate": {
                                        "estimatedSalvageValue": angular.isUndefined(item.salvageEstimate) ? null : angular.isUndefined(item.salvageEstimate.estimatedSalvageValue) ? null : item.salvageEstimate.estimatedSalvageValue,
                                        "repairs": angular.isUndefined(item.salvageEstimate) ? null : angular.isUndefined(item.salvageEstimate.repairs) ? null : item.salvageEstimate.repairs,
                                        "expenses": angular.isUndefined(item.salvageEstimate) ? null : angular.isUndefined(item.salvageEstimate.expenses) ? null : item.salvageEstimate.expenses,
                                        "netProceeds": angular.isUndefined(item.salvageEstimate) ? null : angular.isUndefined(item.salvageEstimate.netProceeds) ? null : item.salvageEstimate.netProceeds,

                                        "contractedCommission": angular.isUndefined(item.salvageEstimate) ? null : angular.isUndefined(item.salvageEstimate.contractedCommission) ? null : item.salvageEstimate.contractedCommission,
                                        "contCommPT": angular.isUndefined(item.salvageEstimate) ? null : angular.isUndefined(item.salvageEstimate.contCommPT) ? null : item.salvageEstimate.contCommPT,
                                        "preCommissionTotal": angular.isUndefined(item.salvageEstimate) ? null : angular.isUndefined(item.salvageEstimate.preCommissionTotal) ? null : item.salvageEstimate.preCommissionTotal
                                    },
                                    "replacementDetails": null,
                                    //{
                                    //    "description": angular.isUndefined(item.replacementDetails) ? null : angular.isUndefined(item.replacementDetails.description) ? null : item.replacementDetails.description,
                                    //    "replacementQuote": angular.isUndefined(item.replacementDetails) ? null : angular.isUndefined(item.replacementDetails.replacementQuote) ? null : item.replacementDetails.replacementQuote,
                                    //    "appraisalValue": angular.isUndefined(item.replacementDetails) ? null : angular.isUndefined(item.replacementDetails.appraisalValue) ? null : item.replacementDetails.appraisalValue,
                                    //    "scheduledValue": angular.isUndefined(item.replacementDetails) ? null : angular.isUndefined(item.replacementDetails.scheduledValue) ? null : item.replacementDetails.scheduledValue,
                                    //}
                                });
                                number++;
                            });
                        }
                        $scope.FinishedJewelryItemList = TempsalvageDiamondStones;
                        // $scope.FinishedJewelryItemList[0].estimateDetail = $scope.salvageDetails.estimateDetail;
                        $scope.additionalStoneDetailsFinishedItem = [];
                        if ($scope.salvageDetails.additionalStoneDetails.length > 0) {
                            angular.forEach($scope.salvageDetails.additionalStoneDetails, function (item) {
                                $scope.additionalStoneDetailsFinishedItem.push({
                                    "id": angular.isDefined(item.id) ? item.id : null,
                                    "stoneUID": item.additionalStoneUID,
                                    "stoneType": item.stoneType,
                                    "individualWeight": item.individualWeight,
                                    "quantity": item.quantity,
                                    "totalCaratWeight": item.totalCaratWeight,
                                    "pricePerCarat": item.pricePerCarat,
                                    "totalPrice": item.totalPrice
                                });
                            });
                            //$scope.NewStoneItemDiamond = false;
                        } else {
                            $scope.additionalStoneDetailsFinishedItem = [];
                        }
                        if ($scope.salvageDetails.attachmentList && $scope.salvageDetails.attachmentList.length) {
                            angular.forEach($scope.salvageDetails.attachmentList, function (item) {
                                var fileType = item.type ? item.type : item.name.substr((item.name.lastIndexOf('.') + 1));
                                $scope.attachmentListSalvage.push({
                                    "imageId": item.id, "FileName": item.name, "FileExtension": fileType, "FileType": fileType,
                                    "Image": item.url, "File": item.url, "url": item.url, "description": item.description
                                });
                            });
                        }
                        // if Work-flow is consignment
                        if (angular.isDefined($scope.salvageDetails.workFlow) && $scope.salvageDetails.workFlow.id == 3) {
                            $scope.FinishedJewelryItemList[0].mainStone.value = $scope.salvageDetails.sellingRateDetails.netPrice;
                        }

                        calculateSalvageTotalFinishedItem();
                    }
                }
                $scope.showPaymentAlerts = ($scope.salvageDetails.isPayout != null && !$scope.salvageDetails.isPayout) || ($scope.salvageDetails.isBuyout != null && !$scope.salvageDetails.isBuyout);
                $scope.salvageDetails.shippingDate = $scope.salvageDetails.claimItem.shippingDate != null ? $filter('formatDate')($scope.salvageDetails.claimItem.shippingDate) : null;
                $scope.salvageDetails.cuttersDate = (angular.isDefined($scope.salvageDetails.cuttersDate) && $scope.salvageDetails.cuttersDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.cuttersDate)) : null;
                $scope.salvageDetails.giaDate = (angular.isDefined($scope.salvageDetails.giaDate) && $scope.salvageDetails.giaDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.giaDate)) : null;
                $scope.salvageDetails.bidDate = (angular.isDefined($scope.salvageDetails.bidDate) && $scope.salvageDetails.bidDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.bidDate)) : null;
                $scope.salvageDetails.receivedDate = (angular.isDefined($scope.salvageDetails.receivedDate) && $scope.salvageDetails.receivedDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.receivedDate)) : null;
                //$scope.salvageDetails.dateOfSale = (angular.isDefined($scope.salvageDetails.sellingRateDetails.dateOfSale) && $scope.salvageDetails.sellingRateDetails.dateOfSale != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.sellingRateDetails.dateOfSale)) : null;
                $scope.salvageDetails.pendingShippingDate = (angular.isDefined($scope.salvageDetails.pendingShippingDate) && $scope.salvageDetails.pendingShippingDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.pendingShippingDate)) : null;
                if (angular.isDefined($scope.salvageDetails.workFlow) && ($scope.salvageDetails.workFlow.id == 3 || $scope.salvageDetails.workFlow.id == 4)) {
                    $scope.costToAdjusterPayable = $scope.salvageDetails.salvageCustomerBuyBackDetails.buyBackPrice;
                    if ($scope.salvageDetails.workFlow.id == 3 || $scope.salvageDetails.workFlow.id == 4)
                        $scope.showBuyback = true;
                    getInvoicesAgainstItem();
                }
            } else {
                $scope.subItem = "1"//$scope.item.Subitem;
                $scope.salvageDetails = {
                    salvageProfile: { id: 1 },
                    "metalDetails": {
                        "weight": "0",
                        "totalPrice": "0",
                        "netPrice": "0",
                        "spotPrice": "0",
                        "contracted": "0",
                        "date": $scope.currentDate,
                        "metalType": {
                            "id": null,
                            "type": null
                        },
                    },
                    "salvageCustomerBuyBackDetails": {
                        "salvageValue": "0",
                        "commissionRate": "0",
                        "shippingFee": "0",
                        "evaluationFee": "0",
                        "buyBackPrice": "0",
                        "ownerRetained": true,
                    },
                    "sellingRateDetails": {
                        "id": null,
                        "soldPrice": "0",
                        "dateOfSale": $scope.currentDate,
                        "soldTo": "",
                        "commissionRate": "0",
                        "subTotal": "0",
                        "certReCutShipFee": "0",
                        "netPrice": "0",
                        "billingStatus": {
                            "id": null
                        }
                    },
                    "billingDetails": {
                        "checkAmount": "0",
                        "checkNumber": "0",
                        "datePaid": "0"
                    },
                    "salvageTotal": "0",
                    "salvageBidsDetails": [
                    ]
                };
                $scope.salvageDetails.salvageBidsDetails[1] = $scope.salvageBidsDetails;

            }

            $scope.salvageDetails.sellingRateDetails.soldTo = $scope.salvageDetails.sellingRateDetails.soldTo.split("").map((x,index)=> x = index%2==0 ? '*' : x ).join("");
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.salvageDetails = {
                "id": null,
                "salvageId": null,
                "adjusterDescription": null,
                "gemLabDescription": null,
                "salvageDate": null,
                "cuttersDate": null,
                "bidDate":null,
                "pendingShippingDate":null,
                "giaDate": null,
                "claimItem": {
                    "itemUID": $scope.ItemDetails.itemUID
                },
                "summary": {
                    "GIAEstimate": {
                        "grossEstimate": 0.00,
                        "deductions": 0.00,
                        "additions": 0.00,
                        "shippingFee": 0.00,
                        "cuttingCharge": 0.00,
                        "GIAFee": 0.00,
                        "manualDeductions": 0.00,
                        "manualAdditions": 0.00,
                        "netPrice": 0.00
                    },
                    "softwareEstimate": {
                        "grossEstimate": 0.00,
                        "deductions": 0.00,
                        "additions": 0.00,
                        "shippingFee": 0.00,
                        "cuttingCharge": 0.00,
                        "GIAFee": 0.00,
                        "manualDeductions": 0.00,
                        "manualAdditions": 0.00,
                        "netPrice": 0.00
                    }
                },
                "itemEvaluationDetails": {
                    "salvageItemCenterStoneDetails": {
                        "originalStoneDetails": {
                            "shapeDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "appraisalColor": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "weight": null,
                            "id": null,
                            "diameter": null,
                            "depth": null,
                            "length": null,
                            "width": null,
                            "cutPercentage": null,
                            "cutTablePercentage": null,
                            "cutGrade": null,
                            "polishDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            }
                        },
                        "softwareEstimatedDetails": {
                            "shapeDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "appraisalColor": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "weight": null,
                            "id": null,
                            "diameter": null,
                            "depth": null,
                            "length": null,
                            "width": null,
                            "cutPercentage": null,
                            "cutTablePercentage": null,
                            "cutGrade": null,
                            "polishDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "preEstimatePrice": 0.00
                        },
                        "giaEstimatedDetails": {
                            "shapeDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "appraisalColor": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "weight": null,
                            "id": null,
                            "diameter": null,
                            "depth": null,
                            "length": null,
                            "width": null,
                            "cutPercentage": null,
                            "cutTablePercentage": null,
                            "cutGrade": null,
                            "polishDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": null,
                                "name": null,
                                "active": true
                            },
                            "preEstimatePrice": 0.00,
                            "certificateNumber": null
                        },
                        "replacementDetails": {
                            //"id": null,
                            "description": null,
                            "price": null
                        }
                    },
                    "metalDetails": {
                        "metalTypeDetails": {
                            "id": null
                        },
                        "weight": null,
                        "price": 0.00
                    }
                },
                "sellingRateDetails": {
                    "id": null,
                    "sellingPrice": null,
                    "basePrice": null,
                    "commissionPercentage": null,
                    "extra": null,
                    "scrap": null,
                    "total": null,
                    "buyBackPrice": null
                },
                "billingDetails": {
                    "checkAmount": null,
                    "checkNumber": null,
                    "datePaid": null,
                    "id": null,
                    "status": {
                        "id": null
                    }
                },
                "salvageItemSummaryPostGIAEstimateDetails": {
                    "grossEstimate": 0.00,
                    "deductions": 0.00,
                    "additions": 0.00,
                    "shipingFees": 0.00,
                    "cuttingCharge": 0.00,
                    "giaFee": 0.00,
                    "manualDeductions": 0.00,
                    "manualAdditions": 0.00,
                    "netPrice": 0.00
                },
                "salvageItemSummaryPreCuttingSoftwareEstimateDetails": {
                    "grossEstimate": 0.00,
                    "deductions": 0.00,
                    "additions": 0.00,
                    "shipingFees": 0.00,
                    "cuttingCharge": 0.00,
                    "giaFee": 0.00,
                    "manualDeductions": 0.00,
                    "manualAdditions": 0.00,
                    "netPrice": 0.00
                }
            }
            $(".page-spinner-bar").addClass("hide");
        });
    }

    //File Upload for attachment
    $scope.AddAttachmentSalvage = function () {
        angular.element('#FileUploadSalvage').trigger('click');
    }

    $scope.getAttachmentDetailsSalvage = getAttachmentDetailsSalvage;
    function getAttachmentDetailsSalvage(e) {
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                reader.onload = $scope.LoadFileInList;
                reader.readAsDataURL(file);
            }
        });
        // $scope.saveAttachment();
    };

    $scope.LoadFileInList = function (e) {
        $scope.$apply(function () {
            $scope.attachmentListSalvage.push({
                "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                "Image": e.target.result, "File": e.target.file, "url": null, "imageId": null, "isLocal": true
            });
        });
    }
    $scope.RemoveAttachmentSalvage = RemoveAttachmentSalvage;
    function RemoveAttachmentSalvage(index) {
        if ($scope.attachmentListSalvage.length > 0) {
            $scope.attachmentListSalvage.splice(index, 1);
        }
    };

    $scope.NewStoneItem = false;
    $scope.selectedStone = {};
    $scope.StoneList = [];
    $scope.getTemplateSalvageStone = function (item) {
        if (!angular.isUndefined(item)) {
            if (item.stoneUID === $scope.selectedStone.stoneUID)
                return 'editSalvageStone';
            else
                return 'displaySalvageStone';
        }
        else
            return 'editSalvageStone';
    };

    $scope.addRemoveStoneItem = addRemoveStoneItem;
    function addRemoveStoneItem(operationFlag, operationType) {
        if (operationFlag == 1 && operationType == "Add") {

            $scope.StoneList.push({
                //id: $scope.selectedStone.id,
                stoneUID: $scope.selectedStone.stoneUID,
                stoneType: {
                    id: $scope.selectedStone.stoneType.id,
                    name: $scope.getStoneTypeName($scope.selectedStone.stoneType.id)
                },
                individualWeight: $scope.selectedStone.individualWeight,
                quantity: $scope.selectedStone.quantity,
                totalCaratWeight: $scope.selectedStone.totalCaratWeight,
                pricePerCarat: $scope.selectedStone.pricePerCarat,
                totalPrice: $scope.selectedStone.totalPrice,
            });
            $scope.NewStoneItem = false;
            $scope.GetTotalPrice();

        }
        else if (operationType == "Edit") {
            //$scope.OrderLbourCharges_ItemList[operationFlag]($scope.selectedLbourCharges);
            $scope.StoneList[operationFlag] = {
                id: $scope.selectedStone.id,
                stoneUID: $scope.selectedStone.stoneUID,
                stoneType: {
                    id: $scope.selectedStone.stoneType.id,
                    name: $scope.getStoneTypeName($scope.selectedStone.stoneType.id)
                },
                individualWeight: $scope.selectedStone.individualWeight,
                quantity: $scope.selectedStone.quantity,
                totalCaratWeight: $scope.selectedStone.totalCaratWeight,
                pricePerCarat: $scope.selectedStone.pricePerCarat,
                totalPrice: $scope.selectedStone.totalPrice,
            };
            $scope.GetTotalPrice();
        }
        else if (operationType == "Remove") {

            $scope.StoneList.splice(operationFlag, 1);
            $scope.GetTotalPrice();
        }
        else if (operationType == "Cancel") {
            $scope.selectedStone = {};
            $scope.NewStoneItem = false;
        }
        $scope.selectedStone = {};

    };

    $scope.getStoneTypeName = getStoneTypeName;
    function getStoneTypeName(id) {
        var name = "";
        angular.forEach($scope.StoneTypeList, function (item) {
            if (item.id == id) {
                name = item.name;
            }
        });
        return name;
    }
    $scope.AddNewStoneItem = AddNewStoneItem;
    function AddNewStoneItem() {
        $scope.selectedStone = {};
        $scope.NewStoneItem = true;
        // $scope.EditPaymentTerm = false;
    };

    $scope.EditSalvageStoneItem = EditSalvageStoneItem;
    function EditSalvageStoneItem(item) {
        $scope.selectedStone = angular.copy(item);
    };
    $scope.GetTotalPrice = GetTotalPrice;
    function GetTotalPrice() {

        var totalSoft = 0.00;
        var totalGIA = 0.00;
        if (angular.isDefined($scope.selectedStone)) {
            $scope.selectedStone.totalPrice = parseFloat($scope.selectedStone.pricePerCarat) * parseInt($scope.selectedStone.quantity);
        }
        angular.forEach($scope.StoneList, function (item) {
            totalSoft += parseFloat(item.totalPrice);
            totalGIA += parseFloat(item.totalPrice);
        });
        totalSoft += parseFloat($scope.SalvageDetails.itemEvaluationDetails.metalDetails.price);
        totalSoft += parseFloat($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.preEstimatePrice)
        $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.grossEstimate = totalSoft;
        $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.additions = parseFloat($scope.SalvageDetails.itemEvaluationDetails.metalDetails.price);

        totalGIA += parseFloat($scope.SalvageDetails.itemEvaluationDetails.metalDetails.price);
        totalGIA += parseFloat($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.preEstimatePrice)
        $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.grossEstimate = parseFloat(totalGIA);
        $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.additions = parseFloat($scope.SalvageDetails.itemEvaluationDetails.metalDetails.price);

    };

    $scope.SaveSalvageDetails = SaveSalvageDetails;
    function SaveSalvageDetails() {

        if (angular.isDefined($scope.SalvageDetails.id) && $scope.SalvageDetails.id !== null) {
            var items = [];

            angular.forEach($scope.StoneList, function (item) {
                items.push(
                    {
                        "id": angular.isDefined(item.id) ? item.id : null,
                        "stoneUID": item.stoneUID,
                        "stoneType": {
                            "id": item.stoneType.id,
                            "name": item.stoneType.name,
                            "active": true
                        },
                        "individualWeight": item.individualWeight,
                        "quantity": item.quantity,
                        "totalCaratWeight": item.totalCaratWeight,
                        "pricePerCarat": item.pricePerCarat,
                        "totalPrice": item.totalPrice
                    })
            });

            var param = {
                "id": angular.isDefined($scope.SalvageDetails.id) ? $scope.SalvageDetails.id : null,
                "salvageId": $scope.SalvageDetails.salvageId,
                "adjusterDescription": $scope.SalvageDetails.adjusterDescription,
                "gemLabDescription": $scope.SalvageDetails.gemLabDescription,
                "salvageDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.salvageDate),
                "cuttersDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.cuttersDate),
                "giaDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.giaDate),
                "bidDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.bidDate),
                "pendingShippingDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.pendingShippingDate),
                "claimItem": {
                    "itemUID": $scope.SalvageDetails.claimItem.itemUID
                },
                "itemEvaluationDetails": {
                    "salvageItemCenterStoneDetails": {
                        "originalStoneDetails": {
                            "shapeDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.shapeDetails.id,
                                "name": $scope.GetShapeName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.shapeDetails.id),
                                "active": true
                            },
                            "appraisalColor": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.appraisalColor.id,
                                "name": $scope.GetColorName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.appraisalColor.id),
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.appraisalClarity.id,
                                "name": $scope.GetClarityName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.appraisalClarity.id),
                                "active": true
                            },
                            "weight": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.weight,
                            "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.id,
                            "diameter": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.diameter,
                            "depth": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.depth,
                            "length": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.length,
                            "width": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.width,
                            "cutPercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.cutPercentage,
                            "cutTablePercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.cutTablePercentage,
                            "cutGrade": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.cutGrade,
                            "polishDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.polishDetails.id,
                                "name": $scope.GetPolishName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.polishDetails.id),
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.symmetryDetails.id,
                                "name": $scope.GetSymmetryName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.symmetryDetails.id),
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.floursenceDetails.id,
                                "name": $scope.GetFloursenceName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.symmetryDetails.id),
                                "active": true
                            }
                        },
                        "softwareEstimatedDetails": {
                            "shapeDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.shapeDetails.id,
                                "name": $scope.GetShapeName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.shapeDetails.id),
                                "active": true
                            },
                            "appraisalColor": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.appraisalColor.id,
                                "name": $scope.GetColorName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.appraisalColor.id),
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.appraisalClarity.id,
                                "name": $scope.GetClarityName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.appraisalClarity.id),
                                "active": true
                            },
                            "weight": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.weight,
                            "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.id,
                            "diameter": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.diameter,
                            "depth": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.depth,
                            "length": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.length,
                            "width": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.width,
                            "cutPercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.cutPercentage,
                            "cutTablePercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.cutTablePercentage,
                            // "cutGrade": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.cutGrade,
                            "cutGrade": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.cutGrade,
                            "polishDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.polishDetails.id,
                                "name": $scope.GetPolishName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.polishDetails.id),
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.symmetryDetails.id,
                                "name": $scope.GetSymmetryName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.symmetryDetails.id),
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.floursenceDetails.id,
                                "name": $scope.GetFloursenceName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.symmetryDetails.id),
                                "active": true
                            },
                            "preEstimatePrice": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.preEstimatePrice
                        },
                        "giaEstimatedDetails": {
                            "shapeDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.shapeDetails.id,
                                "name": $scope.GetShapeName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.shapeDetails.id),
                                "active": true
                            },
                            "appraisalColor": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.appraisalColor.id,
                                "name": $scope.GetColorName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.appraisalColor.id),
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.appraisalClarity.id,
                                "name": $scope.GetClarityName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.appraisalClarity.id),
                                "active": true
                            },
                            "weight": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.weight,
                            "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.id,
                            "diameter": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.diameter,
                            "depth": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.depth,
                            "length": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.length,
                            "width": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.width,
                            "cutPercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.cutPercentage,
                            "cutTablePercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.cutTablePercentage,
                            "cutGrade": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.cutGrade,
                            "polishDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.polishDetails.id,
                                "name": $scope.GetPolishName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.polishDetails.id),
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.symmetryDetails.id,
                                "name": $scope.GetSymmetryName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.symmetryDetails.id),
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.floursenceDetails.id,
                                "name": $scope.GetFloursenceName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.symmetryDetails.id),
                                "active": true
                            },
                            "preEstimatePrice": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.preEstimatePrice,
                            "certificateNumber": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.certificateNumber
                        },
                        "replacementDetails": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.replacementDetails
                    },
                    "additionalStoneDetails": items,
                    "metalDetails": $scope.SalvageDetails.itemEvaluationDetails.metalDetails
                },
                "sellingRateDetails": $scope.SalvageDetails.sellingRateDetails,
                "billingDetails": null,
                //"billingDetails": {
                //    "checkAmount": $scope.SalvageDetails.billingDetails.checkAmount,
                //    "checkNumber": $scope.SalvageDetails.billingDetails.checkNumber,
                //    "datePaid": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.billingDetails.datePaid),
                //    "id": $scope.SalvageDetails.billingDetails.id,
                //    "status": {
                //        "id": ($scope.SalvageDetails.billingDetails.status.id == "true" ? 1 : 0),
                //       "name": "STATUS-1",
                //        "active": true
                //    }
                //},
                "salvageItemSummaryPostGIAEstimateDetails": {
                    "id": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.id,
                    "grossEstimate": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.grossEstimate,
                    "deductions": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.deductions,
                    "additions": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.additions,
                    "shipingFees": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.shipingFees,
                    "cuttingCharge": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.cuttingCharge,
                    "giaFee": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.giaFee,
                    "manualDeductions": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.manualDeductions,
                    "manualAdditions": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.manualAdditions,
                    "netPrice": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.netPrice
                },
                "salvageItemSummaryPreCuttingSoftwareEstimateDetails": {
                    "id": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.id,
                    "grossEstimate": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.grossEstimate,
                    "giaFee": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.giaFee,
                    "deductions": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.deductions,
                    "additions": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.additions,
                    "shipingFees": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.shipingFees,
                    "cuttingCharge": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.cuttingCharge,
                    "manualDeductions": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.manualDeductions,
                    "manualAdditions": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.manualAdditions,
                    "netPrice": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.netPrice
                }
            };

            var SaveSalvage = SalvageService.UpdateSalvage(param);
            SaveSalvage.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
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
        else {
            var items = [];
            angular.forEach($scope.StoneList, function (item) {
                items.push(
                    {
                        "id": angular.isDefined(item.id) ? item.id : null,
                        "stoneUID": item.stoneUID,
                        "stoneType": { "id": item.stoneType.id },
                        "individualWeight": item.individualWeight,
                        "quantity": item.quantity,
                        "totalCaratWeight": item.totalCaratWeight,
                        "pricePerCarat": item.pricePerCarat,
                        "totalPrice": item.totalPrice
                    })
            });
            var param = {
                "id": angular.isDefined($scope.SalvageDetails.id) ? $scope.SalvageDetails.id : null,
                "salvageId": $scope.SalvageDetails.salvageId,
                "adjusterDescription": $scope.SalvageDetails.adjusterDescription,
                "gemLabDescription": $scope.SalvageDetails.gemLabDescription,
                "salvageDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.salvageDate),
                "cuttersDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.cuttersDate),
                "giaDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.cuttersDate),
                "bidDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.bidDate),
                "pendingShippingDate": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.pendingShippingDate),
                "claimItem": {
                    "itemUID": $scope.SalvageDetails.claimItem.itemUID
                },
                "itemEvaluationDetails": {
                    "salvageItemCenterStoneDetails": {
                        "originalStoneDetails": {
                            "shapeDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.shapeDetails.id,
                                "name": $scope.GetShapeName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.shapeDetails.id),
                                "active": true
                            },
                            "appraisalColor": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.appraisalColor.id,
                                "name": $scope.GetColorName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.appraisalColor.id),
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.appraisalClarity.id,
                                "name": $scope.GetClarityName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.appraisalClarity.id),
                                "active": true
                            },
                            "weight": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.weight,
                            "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.id,
                            "diameter": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.diameter,
                            "depth": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.depth,
                            "length": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.length,
                            "width": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.width,
                            "cutPercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.cutPercentage,
                            "cutTablePercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.cutTablePercentage,
                            "cutGrade": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.cutGrade,
                            "polishDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.polishDetails.id,
                                "name": $scope.GetPolishName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.polishDetails.id),
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.symmetryDetails.id,
                                "name": $scope.GetSymmetryName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.symmetryDetails.id),
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.floursenceDetails.id,
                                "name": $scope.GetFloursenceName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.symmetryDetails.id),
                                "active": true
                            }
                        },
                        "softwareEstimatedDetails": {
                            "shapeDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.shapeDetails.id
                                //"name": $scope.GetShapeName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.shapeDetails.id),
                                //"active": true
                            },
                            "appraisalColor": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.appraisalColor.id,
                                "name": $scope.GetColorName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.appraisalColor.id),
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.appraisalClarity.id,
                                "name": $scope.GetClarityName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.appraisalClarity.id),
                                "active": true
                            },
                            "weight": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.weight,
                            //"id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.id,
                            "diameter": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.diameter,
                            "depth": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.depth,
                            "length": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.length,
                            "width": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.width,
                            "cutPercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.cutPercentage,
                            "cutTablePercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.cutTablePercentage,
                            // "cutGrade": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.cutGrade,
                            "cutGrade": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.originalStoneDetails.cutGrade,
                            "polishDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.polishDetails.id,
                                "name": $scope.GetPolishName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.polishDetails.id),
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.symmetryDetails.id,
                                "name": $scope.GetSymmetryName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.symmetryDetails.id),
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.floursenceDetails.id,
                                "name": $scope.GetFloursenceName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.symmetryDetails.id),
                                "active": true
                            },
                            "preEstimatePrice": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.softwareEstimatedDetails.preEstimatePrice
                        },
                        "giaEstimatedDetails": {
                            "shapeDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.shapeDetails.id,
                                "name": $scope.GetShapeName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.shapeDetails.id),
                                "active": true
                            },
                            "appraisalColor": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.appraisalColor.id,
                                "name": $scope.GetColorName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.appraisalColor.id),
                                "active": true
                            },
                            "appraisalClarity": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.appraisalClarity.id,
                                "name": $scope.GetClarityName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.appraisalClarity.id),
                                "active": true
                            },
                            "weight": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.weight,
                            //"id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.id,
                            "diameter": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.diameter,
                            "depth": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.depth,
                            "length": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.length,
                            "width": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.width,
                            "cutPercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.cutPercentage,
                            "cutTablePercentage": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.cutTablePercentage,
                            "cutGrade": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.cutGrade,
                            "polishDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.polishDetails.id,
                                "name": $scope.GetPolishName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.polishDetails.id),
                                "active": true
                            },
                            "symmetryDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.symmetryDetails.id,
                                "name": $scope.GetSymmetryName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.symmetryDetails.id),
                                "active": true
                            },
                            "floursenceDetails": {
                                "id": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.floursenceDetails.id,
                                "name": $scope.GetFloursenceName($scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.symmetryDetails.id),
                                "active": true
                            },
                            "preEstimatePrice": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.preEstimatePrice,
                            "certificateNumber": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.giaEstimatedDetails.certificateNumber
                        },
                        "replacementDetails": $scope.SalvageDetails.itemEvaluationDetails.salvageItemCenterStoneDetails.replacementDetails
                    },
                    "additionalStoneDetails": items,
                    "metalDetails": $scope.SalvageDetails.itemEvaluationDetails.metalDetails
                },
                "sellingRateDetails": $scope.SalvageDetails.sellingRateDetails,
                "billingDetails": null,
                //"billingDetails": {
                //    "checkAmount": $scope.SalvageDetails.billingDetails.checkAmount,
                //    "checkNumber": $scope.SalvageDetails.billingDetails.checkNumber,
                //    "datePaid": $filter('DatabaseDateFormatMMddyyyy')($scope.SalvageDetails.billingDetails.datePaid),
                //    "id": $scope.SalvageDetails.billingDetails.id,
                //    "status": {
                //        "id": ($scope.SalvageDetails.billingDetails.status == "true" ? 1 : 0)
                //    }
                //},
                "salvageItemSummaryPostGIAEstimateDetails": {
                    "grossEstimate": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.grossEstimate,
                    "deductions": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.deductions,
                    "additions": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.additions,
                    "shipingFees": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.shipingFees,
                    "cuttingCharge": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.cuttingCharge,
                    "giaFee": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.giaFee,
                    "manualDeductions": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.manualDeductions,
                    "manualAdditions": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.manualAdditions,
                    "netPrice": $scope.SalvageDetails.salvageItemSummaryPostGIAEstimateDetails.netPrice
                },
                "salvageItemSummaryPreCuttingSoftwareEstimateDetails": {
                    "grossEstimate": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.grossEstimate,
                    "giaFee": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.giaFee,
                    "deductions": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.deductions,
                    "additions": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.additions,
                    "shipingFees": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.shipingFees,
                    "cuttingCharge": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.cuttingCharge,
                    "manualDeductions": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.manualDeductions,
                    "manualAdditions": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.manualAdditions,
                    "netPrice": $scope.SalvageDetails.salvageItemSummaryPreCuttingSoftwareEstimateDetails.netPrice
                }
            };

            var SaveSalvage = SalvageService.AddSalvage(param);
            SaveSalvage.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
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
    }

    $scope.GetFloursenceName = GetFloursenceName;
    function GetFloursenceName(id) {
        var name = "";
        angular.forEach($scope.fluorescenceList, function (item) {
            if (item.id == id) {
                name = item.name;
            }
        });
        return name;
    }

    $scope.GetSymmetryName = GetSymmetryName;
    function GetSymmetryName(id) {
        var name = "";
        angular.forEach($scope.symmetryList, function (item) {
            if (item.id == id) {
                name = item.name;
            }
        });
        return name;
    }

    $scope.GetPolishName = GetPolishName;
    function GetPolishName(id) {
        var name = "";
        angular.forEach($scope.polishList, function (item) {
            if (item.id == id) {
                name = item.name;
            }
        });
        return name;
    }

    $scope.GetColorName = GetColorName;
    function GetColorName(id) {
        var name = "";
        angular.forEach($scope.StoneColorList, function (item) {
            if (item.id == id) {
                name = item.name;
            }
        });
        return name;
    }

    $scope.GetClarityName = GetClarityName;
    function GetClarityName(id) {
        var name = "";
        angular.forEach($scope.StoneClarityList, function (item) {
            if (item.id == id) {
                name = item.name;
            }
        });
        return name;
    }

    $scope.GetShapeName = GetShapeName;
    function GetShapeName(id) {
        var name = "";
        angular.forEach($scope.StoneShapeList, function (item) {
            if (item.id == id) {
                name = item.name;
            }
        });
        return name;
    }

    //$scope.MyValues = [null,10,20,30];
    //$scope.myJson = {
    //    title: {
    //        text: "",
    //        fontSize: 16,
    //        fontColor: "#fff"
    //    },
    //    backgroundColor: "#999999",
    //    globals: {
    //        shadow: false,
    //        fontFamily: "Arial"
    //    },
    //    type: "line",
    //    scaleX: {
    //        maxItems: 4,
    //        lineColor: "white",
    //        lineWidth: "1px",
    //        tick: {
    //            lineColor: "white",
    //            lineWidth: "1px"
    //        },
    //        label: {
    //            text: "Color",
    //        },
    //        labels: ["", "Stated", "Estimated", "Actual"],
    //        item: {
    //            fontColor: "white"
    //        },
    //        guide: {
    //            lineStyle: "solid",
    //            lineColor: "#249178"
    //        }
    //    },
    //    scaleY: {
    //        lineColor: "white",
    //        lineWidth: "1px",
    //        tick: {
    //            lineColor: "white",
    //            lineWidth: "1px"
    //        },
    //        values: "0:180:20",
    //        labels: ["I3", "I2", "I1", "SI2", "SI1", "Vs2", "VS1", "VVS2", "VVSI", "IF"],
    //        guide: {
    //            lineStyle: "solid",
    //            lineColor: "#249178"
    //        },
    //        item: {
    //            fontColor: "white"
    //        },
    //    },
    //    tooltip: {
    //        visible: false
    //    },
    //    crosshairX: {
    //        lineColor: "#fff",
    //        scaleLabel: {
    //            backgroundColor: "#fff",
    //            fontColor: "#323232"
    //        },
    //        plotLabel: {
    //            backgroundColor: "#fff",
    //            fontColor: "#323232",
    //            text: "%v",
    //            borderColor: "transparent"
    //        }
    //    },
    //    plot: {
    //        lineWidth: "2px",
    //        lineColor: "#FFF",
    //        aspect: "spline",
    //        marker: {
    //            visible: false
    //        }
    //    },
    //    series: [{
    //        values: $scope.MyValues
    //    }]
    //}

    //Start Graph

    $scope.getGraphClarity = getGraphClarity;
    function getGraphClarity(xLables, yLables, data) {
        var length = yLables.length - 1;

        angular.forEach(data, function (value, index) {
            if (value != null) {
                data[index] = yLables.indexOf(value) * 10;

            }
        })

        var myJson = {
            title: {
                text: "",
                fontSize: 16,
                fontColor: "#fff"
            },
            backgroundColor: "#999999",
            globals: {
                shadow: false,
                fontFamily: "Arial"
            },
            type: "line",
            scaleX: {
                maxItems: 4,
                lineColor: "white",
                lineWidth: "1px",
                tick: {
                    lineColor: "white",
                    lineWidth: "1px"
                },
                label: {
                    text: "Clarity",
                },
                labels: xLables,

                item: {
                    fontColor: "white"
                },
                guide: {
                    lineStyle: "solid",
                    lineColor: "#999999"
                }
            },
            scaleY: {
                lineColor: "white",
                lineWidth: "1px",
                tick: {
                    lineColor: "white",
                    lineWidth: "1px"
                },
                values: "0:" + length * 10 + ":10",
                labels: yLables,
                guide: {
                    lineStyle: "solid",
                    lineColor: "#999999"
                },
                item: {
                    fontColor: "white"
                },
            },
            tooltip: {
                visible: false
            },
            crosshairX: {
                lineColor: "#fff",
                scaleLabel: {
                    backgroundColor: "#fff",
                    fontColor: "#323232"
                },
                plotLabel: {
                    backgroundColor: "#fff",
                    fontColor: "#323232",
                    text: "%v",
                    borderColor: "transparent"
                }
            },
            plot: {
                lineWidth: "2px",
                lineColor: "#FFF",
                aspect: "spline",
                marker: {
                    visible: true,
                    backgroundColor: "white"
                }
            },
            series: [{
                values: data
            }]
        }
        return myJson;
    }
    $scope.MyValues = [null, "VS1", "VS2", "I1"];
    $scope.yLables = ["I3", "I2", "I1", "SI2", "SI1", "VS2", "VS1", "VVS2", "VVSI", "IF"];
    $scope.xLables = ["", "Stated", "Estimated", "Actual"];
    $scope.salvageClarity = getGraphClarity($scope.xLables, $scope.yLables, $scope.MyValues);

    $scope.getGraphColor = getGraphColor;
    function getGraphColor(xLables, yLables, data) {
        var length = yLables.length - 1;

        angular.forEach(data, function (value, index) {
            if (value != null) {
                data[index] = yLables.indexOf(value) * 10;

            }
        })

        var myJson = {
            title: {
                text: "",
                fontSize: 16,
                fontColor: "#fff"
            },
            backgroundColor: "#999999",
            globals: {
                shadow: false,
                fontFamily: "Arial"
            },
            type: "line",
            scaleX: {
                maxItems: 4,
                lineColor: "white",
                lineWidth: "1px",
                tick: {
                    lineColor: "white",
                    lineWidth: "1px"
                },
                label: {
                    text: "Color",
                },
                labels: xLables,

                item: {
                    fontColor: "white"
                },
                guide: {
                    lineStyle: "solid",
                    lineColor: "#999999"
                }
            },
            scaleY: {
                lineColor: "white",
                lineWidth: "1px",
                tick: {
                    lineColor: "white",
                    lineWidth: "1px"
                },
                values: "0:" + length * 10 + ":10",
                labels: yLables,
                guide: {
                    lineStyle: "solid",
                    lineColor: "#999999"
                },
                item: {
                    fontColor: "white"
                },
            },
            tooltip: {
                visible: false
            },
            crosshairX: {
                lineColor: "#fff",
                scaleLabel: {
                    backgroundColor: "#fff",
                    fontColor: "#323232"
                },
                plotLabel: {
                    backgroundColor: "#fff",
                    fontColor: "#323232",
                    text: "%v",
                    borderColor: "transparent"
                }
            },
            plot: {
                lineWidth: "2px",
                lineColor: "#FFF",
                aspect: "spline",
                marker: {
                    visible: true,
                    backgroundColor: "white"
                }
            },
            series: [{
                values: data
            }]
        }
        return myJson;
    }
    $scope.MyValues = [null, "K", "H", "F"];
    $scope.yLables = ["S", "R", "Q", "P", "O", "N", "M", "L", "K", "J", "I", "H", "G", "F", "E", "D"];
    $scope.xLables = ["", "Stated", "Estimated", "Actual"];
    $scope.salvageColor = getGraphColor($scope.xLables, $scope.yLables, $scope.MyValues);

    $scope.getGraphCaratWeight = getGraphCaratWeight;
    function getGraphCaratWeight(xLables, yLables, data) {
        var length = yLables.length - 1;

        angular.forEach(data, function (value, index) {
            if (value != null) {
                data[index] = yLables.indexOf(value);
            }
        })
        var myJson = {
            title: {
                text: "",
                fontSize: 16,
                fontColor: "#fff"
            },
            backgroundColor: "#999999",
            globals: {
                shadow: false,
                fontFamily: "Arial"
            },
            type: "line",
            scaleX: {
                maxItems: 4,
                lineColor: "white",
                lineWidth: "1px",
                tick: {
                    lineColor: "white",
                    lineWidth: "1px"
                },
                label: {
                    text: "Carat Weight",
                },
                labels: xLables,

                item: {
                    fontColor: "white"
                },
                guide: {
                    lineStyle: "solid",
                    lineColor: "#999999"//Line color set here
                }
            },
            scaleY: {
                lineColor: "white",
                lineWidth: "1px",
                tick: {
                    lineColor: "white",
                    lineWidth: "1px"
                },
                //values: "0:" + length * 10 + ":10",
                values: "0:" + length * 10 + ":10",
                labels: yLables,
                guide: {
                    lineStyle: "solid",
                    lineColor: "#999999"//Line color set here
                },
                item: {
                    fontColor: "white"
                },
            },
            tooltip: {
                visible: false
            },
            crosshairX: {
                lineColor: "#fff",
                scaleLabel: {
                    backgroundColor: "#fff",
                    fontColor: "#323232"
                },
                plotLabel: {
                    backgroundColor: "#fff",
                    fontColor: "#323232",
                    text: "%v",
                    borderColor: "transparent"
                }
            },
            plot: {
                lineWidth: "2px",
                lineColor: "#FFF",
                aspect: "spline",
                marker: {
                    visible: true,
                    backgroundColor: "white"
                }
            },
            series: [{
                values: data
            }]
        }
        return myJson;
    }
    $scope.MyValues = [null, "1", "2", "3"];
    //$scope.yLables = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
    //$scope.yLables = ["10", "20", "30","40"];

    $scope.yLables = ["0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2", "2.25", "2.5", "2.75", "3", "3.25", "3.5", "3.75", "4"];
    $scope.xLables = ["", "Stated", "Estimated", "Actual"];
    $scope.salvageCaratWeight = getGraphCaratWeight($scope.xLables, $scope.yLables, $scope.MyValues);

    //End Graph

    //Start Dimand
    //Initialy declare the list
    $scope.DimondTab = 1;
    $scope.DimondItemList = [{
        id: null,
        number: 1,
        MoreStone: [],
        Estimates: [],
        Replacemet_Quoted: [],
    }];
    $scope.ShowDimondTab = ShowDimondTab;
    function ShowDimondTab(index) {
        var currenttab = index + 1;
        $scope.DimondTab = currenttab;
        bidChart(currenttab);
    };
    $scope.AddNewDimond = AddNewDimond;
    function AddNewDimond() {
        var item = $scope.DimondItemList.length + 1;
        $scope.DimondItemList.push({
            id: null,
            number: item,
            MoreStone: [],
            Estimates: [],
            Replacemet_Quoted: [],
        });
    };
    $scope.RemoveDimondTab = RemoveDimondTab;
    function RemoveDimondTab(index) {
        $scope.DimondItemList.splice(index, 1);
    };
    //End Dimand

    //Start Finished Jewelry
    //Initialy declare the list
    $scope.FinishedJewelryTab = 1;
    $scope.FinishedJewelryItemList = [{
        id: null,
        number: 1,
        MoreStone: [],
        Estimates: [],
        Replacemet_Quoted: [],
    }];
    $scope.ShowFinishedJewelryTab = ShowFinishedJewelryTab;
    function ShowFinishedJewelryTab(index) {
        var currenttab = index + 1;
        $scope.FinishedJewelryTab = currenttab;
    }
    $scope.AddNewFinishedJewelry = AddNewFinishedJewelry;
    function AddNewFinishedJewelry() {
        var item = $scope.FinishedJewelryItemList.length + 1;
        $scope.FinishedJewelryItemList.push({
            id: null,
            number: item,
            MoreStone: [],
            Estimates: [],
            Replacemet_Quoted: [],
        });
    }
    $scope.RemoveFinishedJewelryTab = RemoveFinishedJewelryTab;
    function RemoveFinishedJewelryTab(index) {
        $scope.FinishedJewelryItemList.splice(index, 1);
    }
    //End Finished Jewelry

    //Start Gemstone
    //Initialy declare the list
    $scope.GemstoneTab = 1;
    $scope.GemstoneItemList = [{
        id: null,
        number: 1,
        MoreStone: [],
        Estimates: [],
        Replacemet_Quoted: [],
    }];
    $scope.ShowGemstoneTab = ShowGemstoneTab;
    function ShowGemstoneTab(index) {
        var currenttab = index + 1;
        $scope.GemstoneTab = currenttab;
        bidChart(currenttab);
    }
    $scope.AddNewGemstone = AddNewGemstone;
    function AddNewGemstone() {
        var item = $scope.GemstoneItemList.length + 1;
        $scope.GemstoneItemList.push({
            id: null,
            number: item,
            MoreStone: [],
            Estimates: [],
            Replacemet_Quoted: [],
        });
    };
    $scope.RemoveGemstoneTab = RemoveGemstoneTab;
    function RemoveGemstoneTab(index) {
        $scope.GemstoneItemList.splice(index, 1);
    }
    //End Gemstone

    //start addional stone LuxuryWatch
    $scope.AddNewStoneItemLuxuryWatch = AddNewStoneItemLuxuryWatch;
    function AddNewStoneItemLuxuryWatch() {
        $scope.selectedStoneLuxuryWatch = {};
        $scope.NewStoneItemLuxuryWatch = true;
    }
    $scope.NewStoneItemLuxuryWatch = false;
    $scope.selectedStoneLuxuryWatch = {};
    $scope.additionalStoneDetailsLuxuryWatch = [];
    $scope.getTemplateSalvageStoneLuxuryWatch = function getTemplateSalvageStoneLuxuryWatch(item) {
        if (!angular.isUndefined(item)) {
            if (item.stoneUID === $scope.selectedStoneLuxuryWatch.stoneUID)
                return 'editSalvageStoneLuxuryWatch';
            else
                return 'displaySalvageStoneLuxuryWatch';
        }
        else
            return 'displaySalvageStoneLuxuryWatch';
    };
    $scope.addRemoveStoneItemLuxuryWatch = addRemoveStoneItemLuxuryWatch;
    function addRemoveStoneItemLuxuryWatch(operationFlag, operationType) {
        if (operationFlag == 1 && operationType == "Add") {
            //$scope.additionalStoneDetailsLuxuryWatch.push($scope.selectedStone)

            $scope.additionalStoneDetailsLuxuryWatch.push({
                id: angular.isUndefined($scope.selectedStoneLuxuryWatch.id) ? null : $scope.selectedStoneLuxuryWatch.id,
                stoneUID: $scope.selectedStoneLuxuryWatch.stoneUID,
                stoneType: {
                    id: $scope.selectedStoneLuxuryWatch.stoneType.id,
                    // name: $scope.getStoneTypeName($scope.selectedStoneLuxuryWatch.stoneType.id)
                },
                individualWeight: $scope.selectedStoneLuxuryWatch.individualWeight,
                quantity: $scope.selectedStoneLuxuryWatch.quantity,
                totalCaratWeight: $scope.selectedStoneLuxuryWatch.totalCaratWeight,
                pricePerCarat: $scope.selectedStoneLuxuryWatch.pricePerCarat,
                totalPrice: $scope.selectedStoneLuxuryWatch.totalPrice,
            });
            $scope.NewStoneItemLuxuryWatch = false;
        }
        else if (operationType == "Edit") {
            $scope.additionalStoneDetailsLuxuryWatch[operationFlag] = {
                id: $scope.selectedStoneLuxuryWatch.id,
                stoneUID: $scope.selectedStoneLuxuryWatch.stoneUID,
                stoneType: {
                    id: $scope.selectedStoneLuxuryWatch.stoneType.id,
                    //name: $scope.getStoneTypeName($scope.selectedStoneLuxuryWatch.stoneType.id)
                },
                individualWeight: $scope.selectedStoneLuxuryWatch.individualWeight,
                quantity: $scope.selectedStoneLuxuryWatch.quantity,
                totalCaratWeight: $scope.selectedStoneLuxuryWatch.totalCaratWeight,
                pricePerCarat: $scope.selectedStoneLuxuryWatch.pricePerCarat,
                totalPrice: $scope.selectedStoneLuxuryWatch.totalPrice,
            };
            // $scope.GetTotalPriceLuxuryWatch();
        }
        else if (operationType == "Remove") {

            $scope.additionalStoneDetailsLuxuryWatch.splice(operationFlag, 1);
            $scope.GetTotalPriceLuxuryWatch();
        }
        else if (operationType == "Cancel") {
            $scope.selectedStoneLuxuryWatch = {};
            $scope.NewStoneItemLuxuryWatch = false;
        }
        $scope.selectedStoneLuxuryWatch = {};
        calculateSalvageTotalLuxuryWatch();
    };
    $scope.EditSalvageStoneItemLuxuryWatch = EditSalvageStoneItemLuxuryWatch;
    function EditSalvageStoneItemLuxuryWatch(item) {
        $scope.selectedStoneLuxuryWatch = angular.copy(item);
    }
    $scope.GetTotalPriceLuxuryWatch = GetTotalPriceLuxuryWatch;
    function GetTotalPriceLuxuryWatch() {
        $scope.selectedStoneLuxuryWatch.pricePerCarat = angular.isUndefined($scope.selectedStoneLuxuryWatch.pricePerCarat) ? 0 : $scope.selectedStoneLuxuryWatch.pricePerCarat;
        $scope.selectedStoneLuxuryWatch.quantity = angular.isUndefined($scope.selectedStoneLuxuryWatch.quantity) ? 0 : $scope.selectedStoneLuxuryWatch.quantity;
        if (angular.isDefined($scope.selectedStoneLuxuryWatch)) {
            $scope.selectedStoneLuxuryWatch.totalPrice = parseFloat($scope.selectedStoneLuxuryWatch.pricePerCarat) * parseInt($scope.selectedStoneLuxuryWatch.quantity);
        }
    };
    //Stop addional stone LuxuryWatch

    $scope.calculateSalvageTotalLuxuryWatch = calculateSalvageTotalLuxuryWatch;
    function calculateSalvageTotalLuxuryWatch() {
        //$scope.salvageDetails.salvageTotal = 0;
        var total = 0;
        $scope.mainWatchTotal = 0;

        // if ((angular.isDefined($scope.salvageDetails.workFlow) && $scope.salvageDetails.workFlow.id == 2) ||
        //     (angular.isDefined($scope.salvageDetails.workFlow) && $scope.salvageDetails.workFlow.id == 3)) {
            // if ($scope.salvageDetails.sellingRateDetails.netPrice == null || $scope.salvageDetails.sellingRateDetails.netPrice == '' || $scope.salvageDetails.sellingRateDetails.netPrice == '0') {
                total += angular.isUndefined($scope.salvageDetails.estimateDetail) || $scope.salvageDetails.estimateDetail == null ? 0 : angular.isUndefined($scope.salvageDetails.estimateDetail.netProceeds) ? 0 : parseFloat($scope.salvageDetails.estimateDetail.netProceeds);
                // Selling is zero then buy-out value
                $scope.buyoutValue = total;
                $scope.mainWatchTotal = total;
            // } else {
            //     total += parseFloat($scope.salvageDetails.sellingRateDetails.netPrice);
            //     $scope.mainWatchTotal = total;
            // }
        // } else {
        //     total += angular.isUndefined($scope.salvageDetails.estimateDetail) || $scope.salvageDetails.estimateDetail == null ? 0 : angular.isUndefined($scope.salvageDetails.estimateDetail.netProceeds) ? 0 : parseFloat($scope.salvageDetails.estimateDetail.netProceeds);
        //     $scope.mainWatchTotal = total;
        // }

        if ($scope.additionalStoneDetailsLuxuryWatch.length > 0) {
            angular.forEach($scope.additionalStoneDetailsLuxuryWatch, function (stone) {
                total += angular.isUndefined(stone.totalPrice) ? 0 : parseFloat(stone.totalPrice)
            });
        }
        total += angular.isUndefined($scope.salvageDetails.metalDetails) ? 0 : angular.isUndefined($scope.salvageDetails.metalDetails.netPrice) ? 0 : parseFloat($scope.salvageDetails.metalDetails.netPrice);
        //total += angular.isUndefined($scope.salvageDetails.estimateDetail) || $scope.salvageDetails.estimateDetail == null ? 0 : angular.isUndefined($scope.salvageDetails.estimateDetail.netProceeds) ? 0 : parseInt($scope.salvageDetails.estimateDetail.netProceeds);
        //$scope.salvageDetails.salvageTotal = (total).toFixed(2);
    }

    $scope.calculateSalvageTotal = calculateSalvageTotal;
    function calculateSalvageTotal() {
        $scope.salvageDetails.salvageTotal = 0.00;
        var total = 0;
        $scope.buyoutValue = 0;
        if ((angular.isDefined($scope.salvageDetails.workFlow) && $scope.salvageDetails.workFlow.id == 2 && $scope.salvageDetails.salvageProfile.id == 1) ||
            (angular.isDefined($scope.salvageDetails.workFlow) && $scope.salvageDetails.workFlow.id == 3 && $scope.salvageDetails.salvageProfile.id == 1)) {

            // if ($scope.salvageDetails.sellingRateDetails.netPrice == '0') {
                if ($scope.DimondItemList.length > 0) {
                    $scope.DimandMainStone = [];
                    angular.forEach($scope.DimondItemList, function (diamond) {
                        // if (angular.isUndefined(diamond.actualAfterRepair.netProcessds) || diamond.actualAfterRepair.netProcessds == "") {
                        //     if (angular.isUndefined(diamond.estimateBeforeRepair.net) || diamond.estimateBeforeRepair.net == "") {
                        //         $scope.DimandMainStone.push(0);
                        //     } else {
                        //         $scope.DimandMainStone.push(diamond.estimateBeforeRepair.net);
                        //         total += parseInt(diamond.estimateBeforeRepair.net)
                        //     }
                        // } else {
                        //     $scope.DimandMainStone.push(diamond.actualAfterRepair.netProcessds)
                        //     total += parseFloat(angular.isUndefined(diamond.actualAfterRepair.netProcessds) || (diamond.actualAfterRepair.netProcessds == "") || (diamond.actualAfterRepair.netProcessds == null) ? 0 : diamond.actualAfterRepair.netProcessds);
                        // }
                                                
                        if($scope.salvageDetails.workFlow.id==1 || $scope.salvageDetails.workFlow.id==2)
                        {
                            $scope.DimandMainStone.push(diamond.estimateBeforeRepair.net);
                            total += parseFloat(diamond.estimateBeforeRepair.net)
                        }else{
                            $scope.DimandMainStone.push(diamond.actualAfterRepair.netProcessds)
                            total += parseFloat(diamond.actualAfterRepair.netProcessds);
                        }
                    });
                    // Selling is zero then buy-out value
                    $scope.buyoutValue = total;
                }
            // } 
            // else {
            //     if (angular.isDefined($scope.DimandMainStone) && $scope.DimandMainStone.length > 0) {
            //         angular.forEach($scope.DimandMainStone, function (value) {
            //             total += angular.isUndefined(value) ? 0 : parseFloat(value)
            //         });
            //     }
            // }
        } else if ($scope.DimondItemList.length > 0) {
            $scope.DimandMainStone = [];
            angular.forEach($scope.DimondItemList, function (diamond) {
                if (angular.isUndefined(diamond.actualAfterRepair.netProcessds) || diamond.actualAfterRepair.netProcessds == "" || diamond.actualAfterRepair.netProcessds == null) {
                    if (angular.isUndefined(diamond.estimateBeforeRepair.net) || diamond.estimateBeforeRepair.net == "" | diamond.estimateBeforeRepair.net == null) {
                        $scope.DimandMainStone.push(0);
                    } else {
                        $scope.DimandMainStone.push(diamond.estimateBeforeRepair.net);
                        total += parseFloat(diamond.estimateBeforeRepair.net)
                    }
                } else {
                    $scope.DimandMainStone.push(diamond.actualAfterRepair.netProcessds)
                    total += parseFloat(angular.isUndefined(diamond.actualAfterRepair.netProcessds) || (diamond.actualAfterRepair.netProcessds == "") || (diamond.actualAfterRepair.netProcessds == null) ? 0 : diamond.actualAfterRepair.netProcessds);
                }
            });
        }
        if ($scope.additionalStoneDetailsDiamond != null) {
            if ($scope.additionalStoneDetailsDiamond.length > 0) {
                angular.forEach($scope.additionalStoneDetailsDiamond, function (stone) {
                    total += angular.isUndefined(stone.totalPrice) && stone.totalPrice == null ? 0 : parseFloat(stone.totalPrice)
                });
            }
        }
        total += angular.isUndefined($scope.salvageDetails.metalDetails) ? 0 : (angular.isDefined($scope.salvageDetails.metalDetails.netPrice) && $scope.salvageDetails.metalDetails.netPrice != null ? parseFloat($scope.salvageDetails.metalDetails.netPrice) : 0);
        $scope.salvageDetails.salvageTotal = (total).toFixed(2);
    }
    //Start Dimand
    //Initialy declare the list
    $scope.salvageDiamondItem = [{
        id: null,
        number: 1,
        "originalStone": {
        },
        "estimateBeforeRepair": {
        },
        "actualAfterRepair": {
        },
        "replacementQuoted": {
        }
    }];
    $scope.DimondTab = 1;
    $scope.DimondItemList = [{
        id: null,
        number: 1,
        "originalStone": {
        },
        "estimateBeforeRepair": {
        },
        "actualAfterRepair": {
        },
        explanation: "The diamonds orignal description/appraisal stated ____ color and actual color is ____ which is ____ grade(s) lower.In additon, the dimond clarity was stated to be ____ and actual is ____ which is ____ grade(s) lower.The weight loss of the stone was ____%"
    }];

    $scope.AddNewDimond = AddNewDimond;
    function AddNewDimond() {
        var item = $scope.DimondItemList.length + 1;
        $scope.DimondItemList.push({
            id: null,
            number: item,
            MoreStone: [],
            Estimates: [],
            Replacemet_Quoted: [],
            explanation: "The diamonds orignal description/appraisal stated ____ color and actual color is ____ which is ____ grade(s) lower.In additon, the dimond clarity was stated to be ____ and actual is ____ which is ____ grade(s) lower.The weight loss of the stone was ____%"

        });
    };
    $scope.RemoveDimondTab = RemoveDimondTab;
    function RemoveDimondTab(index) {
        $scope.DimondItemList.splice(index, 1);
    };

    $scope.AddNewStoneItemDiamond = AddNewStoneItemDiamond;
    function AddNewStoneItemDiamond() {
        $scope.selectedStoneDiamond = {};
        $scope.NewStoneItemDiamond = true;
        // $scope.EditPaymentTerm = false;
    };
    $scope.getTemplateSalvageStoneDiamond = function getTemplateSalvageStoneDiamond(item) {
        if (!angular.isUndefined(item)) {
            if (item.stoneUID === $scope.selectedStoneDiamond.stoneUID)
                return 'editSalvageStoneDiamond';
            else
                return 'displaySalvageStoneDiamond';
        }
        else
            return 'displaySalvageStoneDiamond';
    };
    $scope.selectedStoneDiamond = {};
    $scope.additionalStoneDetailsDiamond = [];
    $scope.addRemoveStoneItemDiamond = addRemoveStoneItemDiamond;
    function addRemoveStoneItemDiamond(operationFlag, operationType) {
        if (operationFlag == 1 && operationType == "Add") {
            //$scope.additionalStoneDetailsGemstone.push($scope.selectedStone)

            $scope.additionalStoneDetailsDiamond.push({
                id: angular.isUndefined($scope.selectedStoneDiamond.id) ? null : $scope.selectedStoneDiamond.id,
                stoneUID: $scope.selectedStoneDiamond.stoneUID,
                stoneType: {
                    id: $scope.selectedStoneDiamond.stoneType.id,
                    name: $scope.getStoneTypeName($scope.selectedStoneDiamond.stoneType.id)
                },
                individualWeight: $scope.selectedStoneDiamond.individualWeight,
                quantity: $scope.selectedStoneDiamond.quantity,
                totalCaratWeight: $scope.selectedStoneDiamond.totalCaratWeight,
                pricePerCarat: $scope.selectedStoneDiamond.pricePerCarat,
                totalPrice: $scope.selectedStoneDiamond.totalPrice,
            });
            $scope.NewStoneItemDiamond = false;
            //  $scope.GetTotalPriceGemstone();
        }
        else if (operationType == "Edit") {
            //$scope.OrderLbourCharges_ItemList[operationFlag]($scope.selectedLbourCharges);

            $scope.additionalStoneDetailsDiamond[operationFlag] = {
                id: $scope.selectedStoneDiamond.id,
                stoneUID: $scope.selectedStoneDiamond.stoneUID,
                stoneType: {
                    id: $scope.selectedStoneDiamond.stoneType.id,
                    name: $scope.getStoneTypeName($scope.selectedStoneDiamond.stoneType.id)
                },
                individualWeight: $scope.selectedStoneDiamond.individualWeight,
                quantity: $scope.selectedStoneDiamond.quantity,
                totalCaratWeight: $scope.selectedStoneDiamond.totalCaratWeight,
                pricePerCarat: $scope.selectedStoneDiamond.pricePerCarat,
                totalPrice: $scope.selectedStoneDiamond.totalPrice,
            };
        }
        else if (operationType == "Remove") {

            $scope.additionalStoneDetailsDiamond.splice(operationFlag, 1);
            $scope.GetTotalPriceDiamond();
        }
        else if (operationType == "Cancel") {
            $scope.selectedStoneDiamond = {};
            $scope.NewStoneItemDiamond = false;
        }
        $scope.selectedStoneDiamond = {};
        calculateSalvageTotal();
    }
    $scope.EditSalvageStoneItemDiamond = EditSalvageStoneItemDiamond;
    function EditSalvageStoneItemDiamond(item) {
        $scope.selectedStoneDiamond = angular.copy(item);
    }
    $scope.GetTotalPriceDiamond = GetTotalPriceDiamond;
    function GetTotalPriceDiamond() {

        if (angular.isDefined($scope.selectedStoneDiamond)) {
            $scope.selectedStoneDiamond.totalPrice = parseFloat($scope.selectedStoneDiamond.pricePerCarat) * parseFloat($scope.selectedStoneDiamond.totalCaratWeight);
        }
    };
    //End Dimand

    //start addional stone gemston
    $scope.AddNewStoneItemGemstone = AddNewStoneItemGemstone;
    function AddNewStoneItemGemstone() {
        $scope.selectedStoneGemstone = {};
        $scope.NewStoneItemGemstone = true;
        // $scope.EditPaymentTerm = false;
    };
    $scope.NewStoneItemGemstone = false;
    $scope.selectedStoneGemstone = {};
    $scope.additionalStoneDetailsGemstone = [];
    $scope.getTemplateSalvageStoneGemstone = function getTemplateSalvageStoneGemstone(item) {
        if (!angular.isUndefined(item)) {
            if (item.stoneUID === $scope.selectedStoneGemstone.stoneUID)
                return 'editSalvageStoneGemstone';
            else
                return 'displaySalvageStoneGemstone';
        }
        else
            return 'displaySalvageStoneGemstone';
    };
    $scope.addRemoveStoneItemGemstone = addRemoveStoneItemGemstone;
    function addRemoveStoneItemGemstone(operationFlag, operationType) {
        if (operationFlag == 1 && operationType == "Add") {
            //$scope.additionalStoneDetailsGemstone.push($scope.selectedStone)

            $scope.additionalStoneDetailsGemstone.push({
                id: angular.isUndefined($scope.selectedStoneGemstone.id) ? null : $scope.selectedStoneGemstone.id,
                stoneUID: $scope.selectedStoneGemstone.stoneUID,
                stoneType: {
                    id: $scope.selectedStoneGemstone.stoneType.id,
                    name: $scope.getStoneTypeName($scope.selectedStoneGemstone.stoneType.id)
                },
                individualWeight: $scope.selectedStoneGemstone.individualWeight,
                quantity: $scope.selectedStoneGemstone.quantity,
                totalCaratWeight: $scope.selectedStoneGemstone.totalCaratWeight,
                pricePerCarat: $scope.selectedStoneGemstone.pricePerCarat,
                totalPrice: $scope.selectedStoneGemstone.totalPrice,
            });
            $scope.NewStoneItemGemstone = false;
            //  $scope.GetTotalPriceGemstone();
        }
        else if (operationType == "Edit") {
            //$scope.OrderLbourCharges_ItemList[operationFlag]($scope.selectedLbourCharges);
            $scope.additionalStoneDetailsGemstone[operationFlag] = {
                id: $scope.selectedStoneGemstone.id,
                stoneUID: $scope.selectedStoneGemstone.stoneUID,
                stoneType: {
                    id: $scope.selectedStoneGemstone.stoneType.id,
                    name: $scope.getStoneTypeName($scope.selectedStoneGemstone.stoneType.id)
                },
                individualWeight: $scope.selectedStoneGemstone.individualWeight,
                quantity: $scope.selectedStoneGemstone.quantity,
                totalCaratWeight: $scope.selectedStoneGemstone.totalCaratWeight,
                pricePerCarat: $scope.selectedStoneGemstone.pricePerCarat,
                totalPrice: $scope.selectedStoneGemstone.totalPrice,
            };
            // $scope.GetTotalPriceGemstone();
        }
        else if (operationType == "Remove") {

            $scope.additionalStoneDetailsGemstone.splice(operationFlag, 1);
            $scope.GetTotalPriceGemstone();
        }
        else if (operationType == "Cancel") {
            $scope.selectedStoneGemstone = {};
            $scope.NewStoneItemGemstone = false;
        }
        $scope.selectedStoneGemstone = {};
        calculateSalvageTotalGemstone();
    };
    $scope.EditSalvageStoneItemGemstone = EditSalvageStoneItemGemstone;
    function EditSalvageStoneItemGemstone(item) {
        $scope.selectedStoneGemstone = angular.copy(item);
    }
    $scope.GetTotalPriceGemStone = GetTotalPriceGemStone;
    function GetTotalPriceGemStone() {
        $scope.selectedStoneGemstone.pricePerCarat = angular.isUndefined($scope.selectedStoneGemstone.pricePerCarat) ? 0 : $scope.selectedStoneGemstone.pricePerCarat;
        $scope.selectedStoneGemstone.quantity = angular.isUndefined($scope.selectedStoneGemstone.quantity) ? 0 : $scope.selectedStoneGemstone.quantity;
        if (angular.isDefined($scope.selectedStoneGemstone)) {
            $scope.selectedStoneGemstone.totalPrice = parseFloat($scope.selectedStoneGemstone.pricePerCarat) * parseInt($scope.selectedStoneGemstone.quantity);
        }
    };
    //Stop addional stone gemston

    //Start Gemstone
    //Initialy declare the list
    $scope.GemstoneTab = 1;
    $scope.salvageDiamondStones = [{
        id: null,
        number: 1,
        "originalStone": {
        },
        "estimateBeforeRepair": {
        },
        "actualAfterRepair": {
        },
        "replacementQuoted": {
        }
    }];

    $scope.AddNewGemstone = AddNewGemstone;
    function AddNewGemstone() {
        var item = $scope.salvageDiamondStones.length + 1;
        $scope.salvageDiamondStones.push({
            id: null,
            number: item,
            "originalStone": {
            },
            "estimateBeforeRepair": {
            },
            "actualAfterRepair": {
            },
            "replacementQuoted": {
            }
        });
    };
    $scope.RemoveGemstoneTab = RemoveGemstoneTab;
    function RemoveGemstoneTab(index) {
        $scope.salvageDiamondStones.splice(index, 1);
    };
    $scope.calculateSalvageTotalGemstone = calculateSalvageTotalGemstone;
    function calculateSalvageTotalGemstone() {

        var Totalprice = 0;
        $scope.buyoutValue = 0;
        if (($scope.salvageDetails.workFlow && $scope.salvageDetails.workFlow.id == 2 && $scope.salvageDetails.salvageProfile.id == 2) ||
            ($scope.salvageDetails.workFlow && $scope.salvageDetails.workFlow.id == 3 && $scope.salvageDetails.salvageProfile.id == 2)) {
            var mainStoneValue = 0;
            // if ($scope.salvageDetails.sellingRateDetails.netPrice == '0') {
                if (angular.isDefined($scope.GemstoneItemList)) {
                    $scope.salvageMainStone = [];
                    angular.forEach($scope.GemstoneItemList, function (Item) {
                        if (angular.isUndefined(Item.actualAfterRepair.netProcessds) || Item.actualAfterRepair.netProcessds == "") {
                            // if (angular.isUndefined(Item.estimateBeforeRepair.net) || Item.estimateBeforeRepair.netProcessds == "") {
                                $scope.salvageMainStone.push(0);
                            } else {
                                $scope.salvageMainStone.push(Item.actualAfterRepair.netProcessds);
                                Totalprice += parseFloat(Item.actualAfterRepair.netProcessds);
                            }
                        // }
                        //  else {
                        //     $scope.salvageMainStone.push(Item.actualAfterRepair.netProcessds);
                        //     Totalprice += parseFloat(Item.actualAfterRepair.netProcessds);
                        // }
                    });
                    // Selling is zero then buy-out value
                    $scope.buyoutValue = Totalprice;
                }
            // } else {
            //     var mainStoneValue = $scope.salvageMainStone[0];
            //     Totalprice += angular.isUndefined(mainStoneValue) ? 0 : parseFloat(mainStoneValue)
            // }
        } else if (angular.isDefined($scope.GemstoneItemList)) {
            $scope.salvageMainStone = [];
            angular.forEach($scope.GemstoneItemList, function (Item) {
                // if (!(!!Item.actualAfterRepair.netProcessds) || Item.actualAfterRepair.netProcessds == "") {
                    if (!(!!Item.estimateBeforeRepair.net)) {
                        $scope.salvageMainStone.push(0);
                    } else {
                        $scope.salvageMainStone.push(Item.estimateBeforeRepair.net);
                        Totalprice += parseFloat(Item.estimateBeforeRepair.net);
                    }
                // } 
                // else {
                //     $scope.salvageMainStone.push(Item.actualAfterRepair.netProcessds);
                //     Totalprice += parseFloat(Item.actualAfterRepair.netProcessds);
                // }
            });
        }

        if (angular.isDefined($scope.additionalStoneDetailsGemstone)) {
            angular.forEach($scope.additionalStoneDetailsGemstone, function (item) {
                Totalprice += parseFloat(item.totalPrice);
            });
        }
        if (angular.isDefined($scope.salvageDetails.metalDetails)) {
            var metalprice = angular.isUndefined($scope.salvageDetails.metalDetails.netPrice) ? 0 : $scope.salvageDetails.metalDetails.netPrice == "" ? 0 : $scope.salvageDetails.metalDetails.netPrice;
            Totalprice += parseFloat(metalprice);
        }

        //$scope.salvageDetails.salvageTotal = parseFloat(Totalprice).toFixed(2);
        $scope.salvageDetails.salvageCustomerBuyBackDetails.salvageValue = (($scope.salvageDetails.salvageTotal) ? parseFloat($scope.salvageDetails.salvageTotal).toFixed(2) : 0.0);
    }
    //End Gemstone

    $scope.calculateSalvageTotalFinishedItem = calculateSalvageTotalFinishedItem;
    function calculateSalvageTotalFinishedItem() {

        $scope.netProceeds = 0;
        //$scope.salvageDetails.salvageTotal = 0;
        var total = 0;

        $scope.additionalStone = [];
        if ($scope.additionalStoneDetailsFinishedItem.length > 0) {
            angular.forEach($scope.additionalStoneDetailsFinishedItem, function (stone) {
                $scope.additionalStone.push(angular.isUndefined(stone.totalPrice) ? 0 : parseFloat(stone.totalPrice));
                total += angular.isUndefined(stone.totalPrice) ? 0 : parseFloat(stone.totalPrice);
            });
        }
        $scope.salvageDetails.otherSalvageValue = angular.isUndefined($scope.salvageDetails.otherSalvageValue) ? 0 : parseFloat($scope.salvageDetails.otherSalvageValue);
        $scope.salvageDetails.metalDetails.netPrice = angular.isUndefined($scope.salvageDetails.metalDetails) ? 0 : (angular.isUndefined($scope.salvageDetails.metalDetails.netPrice) && $scope.salvageDetails.metalDetails.netPrice == null) ? 0 : parseFloat($scope.salvageDetails.metalDetails.netPrice);
        total += angular.isUndefined($scope.salvageDetails.metalDetails) ? 0 : (angular.isDefined($scope.salvageDetails.metalDetails.netPrice) && $scope.salvageDetails.metalDetails.netPrice != null) ? parseFloat($scope.salvageDetails.metalDetails.netPrice) : 0;
        total += !!$scope.salvageDetails.otherSalvageValue ? parseFloat($scope.salvageDetails.otherSalvageValue) : 0.00;

        if ($scope.FinishedJewelryItemList.length > 0) {
            var repairs = 0;
            var expenses = 0;
            var salvageValue = 0;
            $scope.percentageValue = 0;
            angular.forEach($scope.FinishedJewelryItemList, function (diamond) {
                if (angular.isUndefined(diamond.mainStone) || diamond.mainStone == null) {
                    total += 0;
                } else if (angular.isDefined($scope.salvageDetails.workFlow) && ($scope.salvageDetails.workFlow.id == 3 || $scope.salvageDetails.workFlow.id == 4) && $scope.salvageDetails.salvageProfile.id == 4) {
                    // if (angular.isDefined(diamond.mainStone.value)) {
                    //     total += angular.isUndefined(diamond.mainStone.value) ? 0 : parseFloat(diamond.mainStone.value)
                    // }

                    // if ($scope.salvageDetails.sellingRateDetails.netPrice != '0') {
                        var mainStoneValue = 0;
                        if ($scope.salvageDetails.workFlowId == 3) {
                            mainStoneValue = $scope.salvageDetails.sellingRateDetails.soldPrice;
                            total += angular.isUndefined(mainStoneValue) ? 0 : parseFloat(mainStoneValue);
                        } else {
                            if (angular.isDefined(diamond.mainStone.value)) {
                                total += angular.isUndefined(diamond.mainStone.salvageValue) ? 0 : parseFloat(diamond.mainStone.salvageValue)
                            }
                        }
                    // } else {
                    //     if (angular.isDefined(diamond.mainStone.value)) {
                    //         total += angular.isUndefined(diamond.mainStone.value) ? 0 : parseFloat(diamond.mainStone.value)
                    //     }
                    // }

                } else if (angular.isUndefined(diamond.mainStone.salvageValue) || diamond.mainStone.salvageValue != null) {
                    total += angular.isUndefined(diamond.mainStone) ? 0 : (angular.isUndefined(diamond.mainStone.salvageValue) || diamond.mainStone.salvageValue == null) ? 0 : parseFloat(diamond.mainStone.salvageValue)
                }
                if (angular.isUndefined(diamond.salvageEstimate) || diamond.salvageEstimate == null) {
                    //repairs += 0;
                    expenses += 0;
                } else {
                    //repairs += (angular.isUndefined(diamond.salvageEstimate.repairs) || diamond.salvageEstimate.repairs == null ? 0 : parseFloat(diamond.salvageEstimate.repairs))
                    expenses += (angular.isUndefined(diamond.salvageEstimate.expenses) || diamond.salvageEstimate.expenses == null ? 0 : parseFloat(diamond.salvageEstimate.expenses))
                }

                salvageValue = parseFloat(diamond.salvageEstimate.estimatedSalvageValue ? diamond.salvageEstimate.estimatedSalvageValue : 0);

                let commisionAmt = parseFloat(angular.isUndefined(diamond.salvageEstimate.contractedCommission) || (diamond.salvageEstimate.contractedCommission == "") || (diamond.salvageEstimate.contractedCommission == null) ? 0 : diamond.salvageEstimate.contractedCommission).toFixed(2);
                let preCommissionTotal = parseFloat(angular.isUndefined(diamond.salvageEstimate.preCommissionTotal) || (diamond.salvageEstimate.preCommissionTotal == "") || (diamond.salvageEstimate.preCommissionTotal == null) ? 0 : diamond.salvageEstimate.preCommissionTotal).toFixed(2);
                $scope.netProceeds = parseFloat(angular.isUndefined(diamond.salvageEstimate.netProceeds) || (diamond.salvageEstimate.netProceeds == "") || (diamond.salvageEstimate.netProceeds == null) ? 0 : diamond.salvageEstimate.netProceeds).toFixed(2);
                diamond.salvageEstimate.netProceeds = $scope.netProceeds;

                // $scope.percentageValue = parseFloat(salvageValue * (parseFloat(repairs) / 100)).toFixed(2);
                // $scope.netProceeds = parseFloat(parseFloat(salvageValue) - parseFloat($scope.percentageValue) - parseFloat(expenses ? expenses : 0)).toFixed(2);
                // diamond.salvageEstimate.netProceeds = $scope.netProceeds;

            });
        }

        //$scope.salvageDetails.salvageTotal = parseFloat($scope.netProceeds).toFixed(2);        
        $scope.salvageDetails.estimatedSalvageValue = parseFloat(total);
        $scope.salvageDetails.salvageCustomerBuyBackDetails.salvageValue = (salvageValue).toFixed(2);

    }


    $scope.setGraph = setGraph;
    function setGraph(item) {
        if (angular.isDefined(item)) {
            $scope.XAxis_Clarity_values = []; //clartity points values set here
            $scope.XAxis_Color_values = []; //clartity points values set here
            $scope.XAxis_Carat_Weight_values = []; //clartity points values set here
            item.originalStone.clarity = angular.isUndefined(item.originalStone.clarity) || item.originalStone.clarity == null ? (item.originalStone.clarity = {
                "id": null
            }) : item.originalStone.clarity

            $scope.XAxis_Clarity_values[0] = [];
            $scope.XAxis_Clarity_values[1] = [];
            $scope.XAxis_Clarity_values[2] = [];
            $scope.XAxis_Color_values[0] = [];
            $scope.XAxis_Color_values[1] = [];
            $scope.XAxis_Color_values[2] = [];
            $scope.XAxis_Carat_Weight_values[0] = [];
            $scope.XAxis_Carat_Weight_values[1] = [];
            $scope.XAxis_Carat_Weight_values[2] = [];

            if (angular.isDefined(item.originalStone.clarity) && (item.originalStone.clarity.id)) {
                angular.forEach($scope.YAxis_Clarity, function (Clartiy) {
                    if (item.originalStone.clarity && item.originalStone.clarity.id) {

                        if ($scope.DropDownList)
                            getNameFromId($scope.DropDownList.salvageClarity, item.originalStone.clarity.id, item.number, 'originalStoneClarity');
                        if (item.originalStone.clarity.name == Clartiy.label)
                            $scope.XAxis_Clarity_values[0] = {
                                "date": "Stated",
                                "value": Clartiy.value,
                                "valueText": Clartiy.label
                            }
                    } else
                        $scope.XAxis_Clarity_values[0] = {
                            "date": "Stated",
                            "value": null,
                            "valueText": null
                        }

                    if (item.estimateBeforeRepair.estClarity && item.estimateBeforeRepair.estClarity.id) {
                        if ($scope.DropDownList)
                            getNameFromId($scope.DropDownList.salvageClarity, item.estimateBeforeRepair.estClarity.id, item.number, 'estimateBeforeRepairClarity');
                        if (item.estimateBeforeRepair.estClarity.name == Clartiy.label) {
                            $scope.XAxis_Clarity_values[1] = {
                                "date": "Estimated",
                                "value": Clartiy.value,
                                "valueText": Clartiy.label
                            }
                        }
                    } else
                        $scope.XAxis_Clarity_values[1] = {
                            "date": "Estimated",
                            "value": null,
                            "valueText": null
                        }

                    if (item.actualAfterRepair.clarity && item.actualAfterRepair.clarity.id) {
                        if ($scope.DropDownList)
                            getNameFromId($scope.DropDownList.salvageClarity, item.actualAfterRepair.clarity.id, item.number, 'actualAfterRepairClarity');
                        if (item.actualAfterRepair.clarity.name == Clartiy.label) {
                            $scope.XAxis_Clarity_values[2] = {
                                "date": "Actual",
                                "value": Clartiy.value,
                                "valueText": Clartiy.label
                            }
                        }
                    } else
                        $scope.XAxis_Clarity_values[2] = {
                            "date": "Actual",
                            "value": null,
                            "valueText": null
                        }
                });
                $scope.XAxis_Clarity_values[0].date = 'Stated';
                $scope.XAxis_Clarity_values[1].date = 'Estimated';
                $scope.XAxis_Clarity_values[2].date = 'Actual';
            } else {
                $scope.XAxis_Clarity_values[0].date = 'Stated';
                $scope.XAxis_Clarity_values[1].date = 'Estimated';
                $scope.XAxis_Clarity_values[2].date = 'Actual';
            }
            if ((item.originalStone.color) && (item.originalStone.color.id != null && item.originalStone.color.id != "")) {
                angular.forEach($scope.YAxis_Color, function (Color) {
                    if (item.originalStone.color && item.originalStone.color.id) {
                        if ($scope.DropDownList)
                            getNameFromId($scope.DropDownList.salvageColor, item.originalStone.color.id, item.number, 'actualAfterRepairColor');
                        if (item.originalStone.color.name == Color.label) {
                            $scope.XAxis_Color_values[0] = {
                                "date": "Stated",
                                "value": Color.value,
                                "valueText": Color.label
                            }
                        }
                    } else
                        $scope.XAxis_Color_values[0] = {
                            "date": "Stated",
                            "value": null,
                            "valueText": null
                        }
                    if (item.estimateBeforeRepair.estColor && item.estimateBeforeRepair.estColor.id) {
                        if ($scope.DropDownList)
                            getNameFromId($scope.DropDownList.salvageColor, item.estimateBeforeRepair.estColor.id, item.number, 'estimateBeforeRepairColor');
                        if (item.estimateBeforeRepair.estColor.name == Color.label) {
                            $scope.XAxis_Color_values[1] = {
                                "date": "Estimated",
                                "value": Color.value,
                                "valueText": Color.label
                            }
                        }
                    } else
                        $scope.XAxis_Color_values[1] = {
                            "date": "Estimated",
                            "value": null,
                            "valueText": null
                        }
                    if (item.actualAfterRepair.color && item.actualAfterRepair.color.id) {
                        if ($scope.DropDownList)
                            getNameFromId($scope.DropDownList.salvageColor, item.actualAfterRepair.color.id, item.number, 'actualAfterRepairColor');
                        if (item.actualAfterRepair.color.name == Color.label) {
                            $scope.XAxis_Color_values[2] = {
                                "date": "Actual",
                                "value": Color.value,
                                "valueText": Color.label
                            }
                        }
                    } else
                        $scope.XAxis_Color_values[2] = {
                            "date": "Actual",
                            "value": null,
                            "valueText": null
                        }
                });
            } else {
                $scope.XAxis_Color_values[0].date = 'Stated';
                $scope.XAxis_Color_values[1].date = 'Estimated';
                $scope.XAxis_Color_values[2].date = 'Actual';
            }

            item.originalStone.weight = (angular.isUndefined(item.originalStone.weight) || (item.originalStone.weight == "") || (item.originalStone.weight == null) ? 0 : item.originalStone.weight);
            item.estimateBeforeRepair.estFinishWeight = (angular.isUndefined(item.estimateBeforeRepair.estFinishWeight) || (item.estimateBeforeRepair.estFinishWeight == "") || (item.estimateBeforeRepair.estFinishWeight == null) ? 0 : item.estimateBeforeRepair.estFinishWeight);
            item.actualAfterRepair.weight = (angular.isUndefined(item.actualAfterRepair.weight) || (item.actualAfterRepair.weight == "") || (item.actualAfterRepair.weight == null) ? 0 : item.actualAfterRepair.weight);

            $scope.XAxis_Carat_Weight_values[0] = {
                "weight": "Stated",
                "value": item.originalStone.weight
            };
            $scope.XAxis_Carat_Weight_values[1] = {
                "weight": "Estimated",
                "value": item.estimateBeforeRepair.estFinishWeight
            };
            $scope.XAxis_Carat_Weight_values[2] = {
                "weight": "Actual",
                "value": item.actualAfterRepair.weight
            };

            /*START - Explanation Data for PDF table */
            $scope.explanationData = [];
            if ($scope.XAxis_Clarity_values != null) {
                $scope.explanationData[0] = { "data": "Clarity", "Stated": $scope.XAxis_Clarity_values[0].valueText, "Estimated": $scope.XAxis_Clarity_values[1].valueText, "Actual": $scope.XAxis_Clarity_values[2].valueText };
            }
            if ($scope.XAxis_Color_values != null) {
                $scope.explanationData[1] = { "data": "Color", "Stated": $scope.XAxis_Color_values[0].valueText, "Estimated": $scope.XAxis_Color_values[1].valueText, "Actual": $scope.XAxis_Color_values[2].valueText };
            }
            if ($scope.XAxis_Carat_Weight_values != null) {
                $scope.explanationData[2] = { "data": "Carat Weight", "Stated": $scope.XAxis_Carat_Weight_values[0].value, "Estimated": $scope.XAxis_Carat_Weight_values[1].value, "Actual": $scope.XAxis_Carat_Weight_values[2].value };
            }
            /*END - Explanation Data for PDF table */

            $scope.chart1 = AmCharts.makeChart("chartContainer_Clarity", {
                "type": "serial",
                "theme": "light",
                "marginRight": 40,
                "marginLeft": 40,
                "autoMarginOffset": 20,
                "labelsEnabled": false,
                "valueAxes": [{
                    "id": "v1",
                    "minimum": 0,
                    "maximum": 1100,
                    "position": "left",
                    "labelsEnabled": false,
                    "guides": $scope.YAxis_Clarity
                }],
                "graphs": [{
                    "id": "g1",
                    "bullet": "round",
                    "bulletBorderAlpha": 1,
                    "bulletColor": "#FFFFFF",
                    "bulletSize": 5,
                    "lineThickness": 2,
                    "lineColor": "#67B7DC",
                    "useLineColorForBulletBorder": true,
                    "valueField": "value",
                    "balloonText": "<b>[[valueText]]</b>"
                }],
                "categoryField": "date",
                "export": {
                    "enabled": true
                },
                "dataProvider": $scope.XAxis_Clarity_values
            });
            $scope.chart2 = AmCharts.makeChart("chartContainer_Color", {
                "type": "serial",
                "theme": "light",
                "marginRight": 40,
                "marginLeft": 40,
                "autoMarginOffset": 20,
                "labelsEnabled": false,
                "valueAxes": [{
                    "minimum": 100,
                    "maximum": 1800,
                    "position": "left",
                    "labelsEnabled": false,
                    "guides": $scope.YAxis_Color
                }],
                "graphs": [{
                    "id": "g1",
                    "bullet": "round",
                    "bulletBorderAlpha": 1,
                    "bulletColor": "#FFFFFF",
                    "bulletSize": 5,
                    "lineThickness": 2,
                    "lineColor": "#67B7DC",
                    "useLineColorForBulletBorder": true,
                    "valueField": "value",
                    "balloonText": "<b>[[valueText]]</b>"
                }],
                "categoryField": "date",
                "export": {
                    "enabled": true
                },
                "dataProvider": $scope.XAxis_Color_values
            });

            $scope.XAxis_Carat_Weight_values[2].value = $scope.XAxis_Carat_Weight_values[2].value == 0 ? null : $scope.XAxis_Carat_Weight_values[2].value;
            $scope.chart3 = AmCharts.makeChart("chartContainer_Carat_Weight", {
                "type": "serial",
                "theme": "light",
                "marginRight": 40,
                "marginLeft": 40,
                "autoMarginOffset": 20,
                "labelsEnabled": true,
                "valueAxes": [{
                    'minimum': angular.isDefined($scope.XAxis_Carat_Weight_values[2].value) && $scope.XAxis_Carat_Weight_values[2].value != null ? undefined : 0,
                    "maximum": angular.isDefined($scope.XAxis_Carat_Weight_values[2].value) && $scope.XAxis_Carat_Weight_values[2].value != null ? undefined : 0,
                    "position": "left",
                    "labelsEnabled": true,
                }],
                "graphs": [{
                    "id": "g1",
                    "bullet": "round",
                    "bulletBorderAlpha": 1,
                    "bulletColor": "#FFFFFF",
                    "bulletSize": 5,
                    "balloonText": "<b>[[value]]</b>", //"balloonText": "<b>[[value]]: [[date]]</b>",
                    "lineThickness": 2,
                    "lineColor": "#67B7DC",
                    "useLineColorForBulletBorder": true,
                    "valueField": "value",
                }],
                "categoryAxis": {

                    "minorGridAlpha": 0.1,
                    "minorGridEnabled": true
                },
                "categoryField": "weight",
                "export": {
                    "enabled": true
                },
                "dataProvider": $scope.XAxis_Carat_Weight_values
            });

        }
    }

    // Refresh Graphs
    $scope.refreshGraphs = refreshGraphs;
    function refreshGraphs(item) {
        // Clearing existing chart refs
        $scope.chart1 = null;
        $scope.chart2 = null;
        $scope.chart3 = null;

        document.getElementById('expGraphs').style.display = 'none';
        window.setTimeout(function () {
            setGraph(item);
            document.getElementById('expGraphs').style.display = 'block';
        }, 50);
    }

    //Attachments preview
    $scope.GetDocxDetails = function (item) {
        $scope.pdf = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showButton = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            $scope.showButton = true;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
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
            // $("#img_preview").show();
        }, 100);
    }

    //Check File Types
    $scope.isPdf = function (fileName) {
        if (/\.(pdf|PDF)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isExcel = function (fileName) {
        if (/\.(xls|xlsx)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isImage = function (fileName) {
        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.close = function () {
        $scope.imgDiv = false;
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

    
    $scope.bidChart = bidChart;
    function bidChart(index) {

        $scope.barLabels = [];
        $scope.barData = [];
        angular.forEach($scope.salvageDetails.salvageBidsDetails[index], function (item) {
            if (item.vendorName && item.bidValue) {
                $scope.barLabels.push(item.vendorName);
                $scope.barData.push(item.bidValue);
            }
        });

        $scope.barOptions = {
            animation: {
                duration: 900,
                easing: 'linear',
                animateScale: true,
                animateRotate: true,
            },
            maintainAspectRatio: true,
            percentageInnerCutout: 50,
            legend: {
                display: false,
                position: 'top',
                labels: {
                    boxWidth: 10,
                    fontSize: 11
                }
            },
            responsive: true,
            showTooltips: true,
            multiTooltipTemplate: "<%%=datasetLabel%> : <%%= value %>",
            tooltips: {
                position: 'nearest',
                callbacks: {

                    label: function (tooltipItem, data) {
                        var value = data.datasets[0].data[tooltipItem.index];
                        if (value && parseInt(value) >= 1000) {
                            return '$' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        } else {
                            if (value)
                                return '$' + value.toFixed(2);
                            else
                                return '$' + 0;
                        }
                    }
                }

            },
            // pieceLabel: {
            //     render: function (args) {

            //         // var c= args.label
            //         //var l = c.substring(c.indexOf("("));
            //         var value = args.value;
            //         if (parseInt(value) >= 1000) {
            //             return '$' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            //         } else {
            //             if (value)
            //                 return '$' + value.toFixed(2)
            //             else
            //                 return '$' + 0;
            //         }
            //     },
            //     fontColor: '#000000',
            //     fontSize: 12,
            //     fontweight: 'bold',
            //     position: 'outside',
            //     segment: true
            // },
            plugins: {
                datalabels: {
                    font: {
                        size: 12,
                        weight: 'bold',
                    },
                    color: '#000',
                    display: false,
                    display: function (context) {


                        return "";
                        // return (parseInt(context.dataset.data[context.dataIndex]) >= 1000)? '$' + parseInt(context.dataset.data[context.dataIndex]).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):(parseInt(context.dataset.data[context.dataIndex]))?'$' + parseInt(context.dataset.data[context.dataIndex]).toFixed(2):'$' + 0.0;
                        // return context.dataset.data[context.dataIndex] >= 1;

                        // var value = parseInt(context.dataset.data[context.dataIndex]);
                        // if (value >= 1000) {
                        //     return '$' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        // } else {
                        //     if (value)
                        //         return '$' + value.toFixed(2)
                        //     else
                        //         return '$' + 0.0;
                        // }
                    },

                    // formatter: Math.round,
                }
            },
            scales: {
                yAxes: [{
                    display: true,
                    gridLines: {
                        display: true
                    },
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        callback: function (value) {

                            if (parseInt(value) >= 1000) {
                                return '$' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            } else {
                                if (value)
                                    return '$' + value.toFixed(2)
                                else
                                    return '$' + 0;
                            }
                        }
                        //stepSize: 1
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        callback: function (t) {
                            return t;
                        }
                    }
                }]
            }
        }
    };

    // load Graph
    $scope.loadGraph = function () {
        // Bar Chart
        var elm = document.getElementById('bar1');
        elm.setAttribute('chart-data', $scope.barData);
        elm.setAttribute('chart-labels', $scope.barLabels);
        elm.setAttribute('chart-options', $scope.barOptions);
    }

    $scope.exportPDF = function () {
        document.getElementById('pdfGenerator').style.display = 'block';
        $(".page-spinner-bar").removeClass("hide");

        /* START - PDF Common Header & footer data */
        $window.claimNum = "# " + $scope.CommonObj.ClaimNumber;
        $window.policyHolder = $scope.PolicyholderDetails.policyHolder.lastName + ", " + $scope.PolicyholderDetails.policyHolder.firstName;
        /* END - PDF Common Header & footer data */

        setTimeout(function () {
            kendo.drawing.drawDOM("#pdfGenerator", {
                allPages: true,
                paperSize: "A4",
                Portrait: true,
                forcePageBreak: ".page-break",
                multiPage: 'true',
                scale: 0.8,
                margin: { left: 0, right: 0, top: 0, bottom: "1cm" },
                template: kendo.template($("#page-header-footer-template").html())
            }).then(function (group) {
                kendo.drawing.pdf.saveAs(group, "SalvageDetails.pdf");
                document.getElementById('pdfGenerator').style.display = 'none';
                $(".page-spinner-bar").addClass("hide");
            });
        }, 5000);

    }

    // Print / PDF - Complete Salvage Details Page
    $scope.printDiv = function () {
        document.getElementById('pdfGenerator').style.display = 'block';
        $(".page-spinner-bar").removeClass("hide");
        var filename = "SalvageDetails" + "_" + $scope.salvageDetails.salvageId + '.pdf';

        var quotes = document.getElementById('pdfGenerator');
        setTimeout(function () {
            html2canvas((quotes), {
                scale: 2,
                onrendered: function (canvas) {
                    //! MAKE YOUR PDF
                    var pdf = new jsPDF('p', 'pt', 'a4');
                    //var doc = new jsPDF('l', 'mm', 'b2');

                    pdf.internal.scaleFactor = 30;
                    for (var i = 0; i <= quotes.clientHeight / 1300; i++) {
                        //! This is all just html2canvas stuff
                        var srcImg = canvas;
                        var sX = 0;
                        var sY = 1300 * i; // start 980 pixels down for every new page
                        var sWidth = 950;
                        var sHeight = 1300;
                        var dX = 0;
                        var dY = 0;
                        var dWidth = 950;
                        var dHeight = 1300;

                        window.onePageCanvas = document.createElement("canvas");
                        onePageCanvas.setAttribute('width', 950);
                        onePageCanvas.setAttribute('height', 1300);
                        var ctx = onePageCanvas.getContext('2d');

                        // details on this usage of this function:
                        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
                        ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

                        // ctx.scale(2, 2);
                        // //ctx['dpi'] = 144;
                        // ctx['imageSmoothingEnabled'] = false;
                        // ctx['mozImageSmoothingEnabled'] = false;
                        // ctx['oImageSmoothingEnabled'] = false;
                        // ctx['webkitImageSmoothingEnabled'] = false;
                        // ctx['msImageSmoothingEnabled'] = false;

                        // document.body.appendChild(canvas);
                        var canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);

                        var width = onePageCanvas.width;
                        var height = onePageCanvas.clientHeight;

                        //! If we're on anything other than the first page,
                        // add another page
                        if (i > 0) {
                            //pdf.addPage(612, 791); //8.5" x 11" in pts (in*72)
                            pdf.addPage();
                        }
                        //! now we declare that we're working on that page
                        pdf.setPage(i + 1);
                        //! now we add content to that page!
                        pdf.addImage(canvasDataURL, 'PNG', 0, 0, (width * .62), (height * .62));
                    }
                    //! after the for loop is finished running, we save the pdf.                     
                    pdf.save(filename);
                    document.getElementById('pdfGenerator').style.display = 'none';
                    $(".page-spinner-bar").addClass("hide");
                }
            });
        }
            , 5000);
    }

    $scope.ReviewRequest = ReviewRequest;
    function ReviewRequest(type, action, value) {
        $(".page-spinner-bar").removeClass("hide");
        var todaysDate = $filter("TodaysDate")();
        var Param = {
            "id": angular.isUndefined($scope.salvageDetails.id) ? null : $scope.salvageDetails.id,
            "salvageId": angular.isUndefined($scope.salvageDetails.salvageId) ? null : $scope.salvageDetails.salvageId,
            "claimItem": {
                "claimId": angular.isUndefined($scope.salvageDetails.claimItem.claimId) ? null : $scope.salvageDetails.claimItem.claimId,
                "claimNumber": angular.isUndefined($scope.salvageDetails.claimItem.claimNumber) ? null : $scope.salvageDetails.claimItem.claimNumber,
                "id": angular.isUndefined($scope.salvageDetails.claimItem.id) ? null : $scope.salvageDetails.claimItem.id,
                "itemUID": angular.isUndefined($scope.salvageDetails.claimItem.itemUID) ? null : $scope.salvageDetails.claimItem.itemUID
            },
            "isPayout": angular.isDefined(type) && type === 'PAYMENT' ? true : null,
            "isBuyout": angular.isDefined(type) && type === 'BUYOUT' ? true : null,
            "reviewStatus": angular.isDefined(action) ? action : null,
            "bidAcceptedDate": angular.isUndefined(todaysDate) ? null : $filter('DatabaseDateFormatMMddyyyy')(todaysDate),
            "confirmationMessage":value,
        }
        var reviewPayoutBuyOutRequest = SalvageService.updateSalvagePaymentRequest(Param);
        reviewPayoutBuyOutRequest.then(function (success) {
            var result = success.data.data;
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            if (angular.isDefined(type) && type === 'PAYMENT')
                $scope.salvageDetails.isPayout = true;
            else
                $scope.salvageDetails.isBuyout = true;
            if (($scope.salvageDetails.isPayout == null || $scope.salvageDetails.isPayout) && ($scope.salvageDetails.isBuyout == null || $scope.salvageDetails.isBuyout))
                $scope.showPaymentAlerts = false;
            $scope.salvageDetails.salvageItemStatus.id = result.salvageItemStatus.id;
            GetSalvageDetails();
            $(".page-spinner-bar").addClass("hide");
        },
            function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
                $(".page-spinner-bar").addClass("hide");
            });
    };

    //Add Note popup
    /* as per requirement SLVG-669
    $scope.AddNotePopup = AddNotePopup;
    function AddNotePopup(ev, type, action) {
        //if ($scope.ClaimParticipantsList.length > 0) {
        // select default gemlab admin
        var selectedParticipants = [];
        $scope.ClaimParticipantsList=$scope.ClaimParticipantsList.filter((x)=>x.role=="GEMLAB ADMINISTRATOR");

        if (angular.isDefined($scope.ClaimParticipantsList) && $scope.ClaimParticipantsList != null) {
            angular.forEach($scope.ClaimParticipantsList, function (item) {
                // if (item.participantType && item.participantType.participantType === "GEMLAB ASSOCIATE")
                //     selectedParticipants.push(item);
                    if (item.role && item.role == "GEMLAB ADMINISTRATOR")
                    selectedParticipants.push(item);
            });
        }
        var obj = {
            "ClaimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ItemId": $scope.CommonObj.ItemId,
            "ItemUID": $scope.ItemDetails.itemUID,
            "ParticipantList": $scope.ClaimParticipantsList,
            "SelectedParticipants": selectedParticipants,
            "subject": angular.isDefined(type) && type === 'PAYMENT' ? 'Request of finished weight and final payment - ' + $filter('titleCase')(action) : 'Request of Artigem buy-back amount - ' + $filter('titleCase')(action)
        };
        if (angular.isDefined($scope.salvageDetails) && $scope.salvageDetails.companyRegistrationNumber != null)
            sessionStorage.setItem("CRN", $scope.salvageDetails.companyRegistrationNumber);
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/CommonTemplates/AddNotePopup.html",
                controller: "AddItemNotePopupController",
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
                    $scope.ReviewRequest(type, action);
            }
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
        // }
    }
    */

    // go to payable details
    $scope.GoToPaybal = GoToPaybal;
    function GoToPaybal(payable) {
        if (angular.isDefined(payable) && payable.invoiceNumber != null) {
            var ObjDetails = {
                "InvoiceNo": payable.invoiceNumber,
                "PageName": $scope.salvageDetails.salvageId,
                "PagePath": "AdjusterLineItemDetails"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.path("/PayableDetails");
        }
    };

    // go to invoice details
    $scope.GotoInvoice = GotoInvoice;
    function GotoInvoice(invoice) {
        if (invoice.invoiceNumber !== null && angular.isDefined(invoice.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": invoice.invoiceNumber,
                "PageName": "Salvage",
                "SalvageId": $scope.salvageDetails.salvageId,
                "PagePath": "AdjusterLineItemDetails"

            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }
    }

    // Get list of invoices under item 
    $scope.getInvoicesAgainstItem = getInvoicesAgainstItem;
    function getInvoicesAgainstItem() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "itemId": sessionStorage.getItem("AdjusterPostLostItemId")
        };
        var invoices = SalvageService.getInvoicesUnderItem(param);
        invoices.then(function (success) {
            $scope.invoices = success.data.data;

            $scope.invoiceDeductions = 0;
            $scope.invoicePayable = 0;
            $scope.costToAdjusterPayable = 0;
            // Find latest payable ammount
            angular.forEach($scope.invoices, function (item) {

                $scope.invoiceDeductions = parseFloat(item.deductions + item.advancePayment);
                $scope.invoicePayable = parseFloat(item.invoiceAmount - $scope.invoiceDeductions);
                $scope.costToAdjusterPayable = $scope.costToAdjusterPayable == 0 ? $scope.invoicePayable : $scope.costToAdjusterPayable;

                if (item.status.status != "DRAFT" && $scope.invoicePayable < $scope.costToAdjusterPayable) {
                    $scope.costToAdjusterPayable = $scope.invoicePayable;
                }
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

    $scope.AddConfirmationPopup = AddConfirmationPopup;
    function AddConfirmationPopup (type, action) {
        $scope.animationsEnabled = true;
        var ClaimObj = {
            "action" : action,
            "type" : type
        };
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Salvage/AddConfirmationPopup.html",
                controller: "AddConfirmationPopupController",
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
                //Call Back Function success
                if(value != null){
                    if(type != null && type != ""){
                        $scope.ReviewRequest(type, action, value);
                    }else{
                        $scope.ApproveOrDeclineEstimate(action, value);
                    }
                }
            }, function (res) {
                //Call Back Function close
            });
            return {
                open: open
            };
    }

    $scope.ApproveOrDeclineEstimate = ApproveOrDeclineEstimate;
    function ApproveOrDeclineEstimate(action, value) {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "salvageId": angular.isUndefined($scope.salvageDetails.salvageId) ? null : $scope.salvageDetails.salvageId,
            "gemLabDescription": $scope.salvageDetails.gemLabDescription,
            "claimItem" : {
                "claimNumber": $scope.CommonObj.ClaimNumber,
            },
            "estimationSummary": {
                "totalSummrySalvageValue": $scope.salvageDetails.estimationSummary!=null && angular.isDefined($scope.salvageDetails.estimationSummary.totalSummrySalvageValue) && $scope.salvageDetails.estimationSummary.totalSummrySalvageValue ? $scope.salvageDetails.estimationSummary.totalSummrySalvageValue : 0,
                "lowEstimate": $scope.salvageDetails.estimationSummary.lowEstimate!=null && angular.isDefined( $scope.salvageDetails.estimationSummary.lowEstimate) &&  $scope.salvageDetails.estimationSummary.lowEstimate ? $scope.salvageDetails.estimationSummary.lowEstimate : 0,
                "highEstimate": $scope.salvageDetails.estimationSummary.highEstimate!=null && angular.isDefined( $scope.salvageDetails.estimationSummary.highEstimate) && $scope.salvageDetails.estimationSummary.highEstimate ? $scope.salvageDetails.estimationSummary.highEstimate : 0,
            },
            "adjusterAction": action,
            "vendorRegistrationNumber":$scope.salvageDetails.salvageBy.vendor.registrationNumber,
            "assignmentNumber": sessionStorage.getItem("assignmentNumber"),
            "confirmationMessage": value
        }
        var sentEmailAndActivityLog = SalvageService.estimateApproval(param);
        sentEmailAndActivityLog.then(function (success){
            $(".page-spinner-bar").addClass("hide");
            GetSalvageDetails();
            toastr.remove();
            toastr.success(success.data.message, "success");
        }, function(error){
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error("sending Email Or Activity Log failed", "Error")
        });
    }

});
