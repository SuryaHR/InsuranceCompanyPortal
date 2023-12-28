//"use strict";

angular.module('MetronicApp').controller('AssignLineItemController',
function AssignClaimForManagerController($translate, $translatePartialLoader, $rootScope, $scope, AssignLineItemService,
     $http, $location,items, AdjusterList) {

    $translatePartialLoader.addPart('AssignLineItem');
    $translate.refresh();

    $scope.ErrorMessage = "";
    $scope.assignedUserId;
    $scope.Category = "";
    $scope.CategoryList = "";
    $scope.SubCategory = "";
    $scope.SubCategoryList = "";
    $scope.AdjusterList = "";
    $scope.PricingSpecialistList = "";
    $scope.VendorsList = "";
    $scope.ServiceList=[1,2,3,4,5,6,7]
    $scope.displayAdjuster = false;
    $scope.displaySpecialist = false; 
    $scope.displayVendor = false;
    $scope.CommonObj =
        {
            CompanyId:sessionStorage.getItem("CompanyId").toString()

        }
    function init()
    {
       
        var getpromise = AssignLineItemService.getCategory();
        getpromise.then(function (success) { $scope.CategoryList = success.data.data;}, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        //--------------------------------------------------------------------------------------------------------------

    
        var param = { "categoryId": 14 };
        var getpromise = AssignLineItemService.getSubCategory(param);
        getpromise.then(function (success) { $scope.SubCategoryList = success.data.data; }, function (error) {$scope.ErrorMessage = error.data.errorMessage; });
    }

    init();

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.AssignItem = function () {
        
        $scope.Error = "";
        //success call back
        //if ($scope.assignedUserId > 0) {
        //    var param = {
        //        "claimId": $scope.objClaim.claimId,
        //        "assignedUserId": $scope.assignedUserId,
        //        "claimStatusId": $scope.objClaim.claimStatusId
        //    };
        //    var promisePost = AssignClaimForManagerService.AssignClaim(param);
        //    promisePost.then(function (pl) {
        //        
        //        if (pl.data === '') {
        //            if (pl.data.status == 200)
        //                $scope.$close("Claim assgin successfully..");
        //            else
        //                $scope.$close("Fail to assgin claim..");
        //        }
        //    }, function (errorPl) {            //Error Message
        //        $scope.$close("Fail to assgin..");
        //    });
        //} else { $scope.Error = "Please select adjuster.." }

        //get category list #29
        var param = {

                "itemId" : 530,
                "assignedUserId" : 252,
                "itemStatusId" : 2
        }
        var getpromise = AssignLineItemService.AssignLineItem(param);
        getpromise.then(function (success) {
            
            $scope.Status = success.data.status;
            if($scope.Status==200)
            {
                $scope.$close();
            }

        }, function (error) {

            $scope.ErrorMessage = error.data.errorMessage;
        });

        $scope.$close();
    };
    $scope.cancel = function () {
        $scope.$close();
    };

    $scope.getAdjusterId = getAdjusterId;
    function getAdjusterId(id) {
        $scope.Error = "";
        $scope.assignedUserId = id;
    }

    //Get adjustor list
    $scope.getAdjusterList=function()
    {
        $scope.displayAdjuster = true;
        $scope.displaySpecialist = false;
        $scope.displayVendor = false;
        //API #34
        var param = { "companyId":$scope.CommonObj.CompanyId }
        var getpromise = AssignLineItemService.getAdjusterList(param);
        getpromise.then(function (success) { $scope.AdjusterList = success.data.data;}, function (error) { $scope.ErrorMessage = error.data.errorMessage;});
    }

    //Get third party vendor list
    $scope.getThirdPartyVendor = function () {
        $scope.displayAdjuster = false;
        $scope.displaySpecialist = false;
        $scope.displayVendor = true;

        //API #116
        var param = { "companyId": $scope.CommonObj.CompanyId }
        var getpromise = AssignLineItemService.getThirdPartyVendor(param);
         getpromise.then(function (success) { $scope.VendorsList = success.data.data;}, function (error) {$scope.ErrorMessage = error.data.errorMessage; });
    }

    //Get pricing specialist list
    $scope.getPricingSpecialist = function () {
      
        $scope.displayAdjuster = false;
        $scope.displayVendor = false;
        $scope.displaySpecialist = true;

        //API #40
        var param = { "companyId": $scope.CommonObj.CompanyId }
        var getpromise = AssignLineItemService.getPricingSpecialist(param);
        getpromise.then(function (success) { $scope.PricingSpecialistList = success.data.data;}, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
});