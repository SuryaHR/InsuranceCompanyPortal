angular.module('MetronicApp').directive('stringToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            ngModel.$formatters.push(function (value) {
                if (value == '0.0') {
                    return value = null;
                } else {
                    return parseFloat(value, 100);
                }
            });
        }
    };
}).directive('ngMin', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMin, function() {
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            var minValidator = function(value) {
                var min = attr.ngMin || 0;
                if(value)
                value=parseFloat(value);
                if (value && value > min) {
                    ctrl.$setValidity('ngMin', false);
                    return parseFloat(("" + parseFloat(value/10)).substring('.'));
                } else {
                    ctrl.$setValidity('ngMin', true);
                    return value;
                }
            };
            
            ctrl.$parsers.push(minValidator);
            ctrl.$formatters.push(minValidator);
        }
    };
}).directive('inputCurency', function($filter, $timeout){
    var old=0;
    return {
      scope: {
        ngModel  : '=',
        prefix : '=',
        decimals : '=',
        limit:'='
      },
      link: function(scope, el, attrs,ctrl){
        // scope.$watch(attrs.inputCurency, function() {
        //     ctrl.$setViewValue(ctrl.$viewValue);
        // });
        var mm = $filter('currency')(scope.ngModel, scope.prefix, scope.decimals);//"$" + scope.ngModel       
        $timeout( function(){
              el.val(mm);
          }, 100 );
  
        el.bind('focus', function(){
          old = scope.ngModel;
          el.val(scope.ngModel);
        });
        
         el.bind('input', function(){
            currencyRegex = /^(?!0\.00)\d{1,10}(,\d{3})*(\.\d\d)?$/;
            if (currencyRegex.test(el.val())) {  
                if(scope.limit)
                scope.limit = parseFloat(scope.limit) ;    
                if(scope.limit<el.val())  
                scope.ngModel =  parseFloat(("" + parseFloat(el.val()/10)).split('.')[0])
            else
                scope.ngModel = el.val();
            scope.$apply();
            }
        });
        
        el.bind('blur', function(){
          var mm = $filter('currency')(scope.ngModel, scope.prefix, scope.decimals);          
          if(mm)
           el.val(mm);
        });
      }
    }
  })
.controller('EnvironmentHomeOwnersPoliciesController', function ($rootScope, $scope, settings, $http, $uibModal, $timeout,
    $location, $translate, $translatePartialLoader, HomeOwenerPolicyService, AuthHeaderService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('HomeOwnersPolicies');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.AddHOPolicyShow;
    $scope.HOPolicy;
    $scope.HOPolicyList = [];
    $scope.FilterList = [];
    $scope.Category = [];
    $scope.init = init;
    $scope.PolicyTypeDetails;// = {};
    $scope.categoryList = [];
    $scope.showHOPOlicytype = false;
    $scope.selected = {
        StateId: "0"
    };
    $scope.isCatogoryDeleted = false;
    function init() {
        $scope.Show = false;
        $scope.AddHOPolicyShow = false;
        $scope.HOPolicy = true;
        GetPolicyByStates();
        GetPOlicyType();
        var GetCategory = HomeOwenerPolicyService.getCategory();
        GetCategory.then(function (success) { $scope.Category = success.data.data; $scope.categoryList = success.data.data.categories; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
        });

        getState();
    }
    $scope.init();

    $scope.Remove = function (index) {
        $scope.isCatogoryDeleted = true;
        $scope.categoryList.splice(index, 1)
        $scope.checkLimit($scope.PolicyTypeDetails.specilaLimit);
    };


    $scope.AddCategory = function () {
        var CategoryObj = {
            "categoryId": '',
            "categoryName": '',
            "coverageLimit": 5000,
            "deductible": '',
            "description": '',
            "isDelete": '',
            "individualItemLimit":500
        };

        if ($scope.categoryList !== null && $scope.categoryList.length > 0)
            $scope.categoryList.splice(0, 0, CategoryObj)
        else {
            $scope.categoryList = [];
            $scope.categoryList.push(CategoryObj);
        }
    }

    $scope.AddHOPolicy = AddHOPolicy;
    function AddHOPolicy() {
        $scope.PolicyTypeDetails = {};
        $scope.PolicyTypeDetails.specilaLimit = 25000;
        $scope.limit=  $scope.PolicyTypeDetails.specilaLimit;

        $scope.categoryList = [];
       
        $scope.categoryList= [{"categoryId":15,"categoryName":"JEWELRY","coverageLimit":1500,"deductible":null,"description":null,"isDelete":null,"individualItemLimit":1500},
                              {"categoryId":7,"categoryName":"CAMERAS & PHOTOGRAPHY","coverageLimit":1500,"deductible":null,"description":null,"isDelete":null,"individualItemLimit":1500},
                              {"categoryId":22,"categoryName":"MUSICAL INSTRUMENTS & SUPPLIES","coverageLimit":2500,"deductible":null,"description":null,"isDelete":null,"individualItemLimit":2500},
                              {"categoryId":20,"categoryName":"MISCELLANEOUS","coverageLimit":1500,"deductible":null,"description":null,"isDelete":null,"individualItemLimit":500},
                              {"categoryId":23,"categoryName":"OFFICE EQUIPMENT","coverageLimit":2500,"deductible":null,"description":null,"isDelete":null,"individualItemLimit":2500}];
        $scope.AddHOPolicyShow = true;
        $scope.HOPolicy = false;

    }
    $scope.EditHOPolicy = EditHOPolicy;
    function EditHOPolicy(item) {
        $(".page-spinner-bar").removeClass("hide");
        var param = { "id": item.id };

        var GetDetails = HomeOwenerPolicyService.GetPolicyTypeDetails(param);
        GetDetails.then(function (success) {

            $(".page-spinner-bar").addClass("hide");
            $scope.PolicyTypeDetails = success.data.data[0];
            $scope.categoryList = success.data.data[0].policyTypeCategories;
            $scope.AddHOPolicyShow = true;
            $scope.HOPolicy = false;
            $scope.selected.stateId = $scope.PolicyTypeDetails.state.id;
            $scope.checkLimit($scope.PolicyTypeDetails.specilaLimit);
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.BtnBackClick = BtnBackClick;
    function BtnBackClick() {
        $scope.AddHOPolicyShow = false;
        $scope.HOPolicy = true;
        $scope.showHOPOlicytype= false;
        $scope.disableAddCoverage = false;
        GetPolicyByStates();

    }

    $scope.Save = Save;
    function Save() {
        $scope.catList = [];
        angular.forEach($scope.categoryList, function (item) {
            $scope.catList.push(
                {
                    "categoryId": item.categoryId,
                    "categoryName": null,
                    "coverageLimit": item.coverageLimit,
                    "deductible": null,
                    "description": null,
                    "isDelete": null,
                    "individualItemLimit":item.individualItemLimit
                })
        });

        var param = {
            "description": $scope.PolicyTypeDetails.description,
            "id": $scope.PolicyTypeDetails.id,
            "policyTypeCategories": $scope.catList,
            "totalCoverage": $scope.PolicyTypeDetails.totalCoverage,
            "totalDeductible": $scope.PolicyTypeDetails.totalDeductible,
            "typeName": $scope.PolicyTypeDetails.typeName,
            "specilaLimit":$scope.PolicyTypeDetails.specilaLimit,
            "state": {
                "id": $scope.selected.stateId
            },
        };
        var savePolicyType = HomeOwenerPolicyService.SavePolicyType(param);
        savePolicyType.then(function (success) {
            GetPOlicyType();
            $scope.BtnBackClick();
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data) && error.data !== null)
                toastr.error(error.data.errorMessage, "Error");
            else
                toastr.error("Failed to save policy type details. Please try again..", "Error");
        });
    }

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.Delete = Delete;
    function Delete(item, index) {

        bootbox.confirm({
            size: "",
            title: $translate.instant('Delete'),
            message: $translate.instant('Are you sure to delete policy type?'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('Yes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('No'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                   var PolictType = {
                       "id": item.id
                   };
                   var DeleteFrom = HomeOwenerPolicyService.DeletePolicyType(PolictType);
                   DeleteFrom.then(function () {
                       $scope.HOPolicyList.splice(index, 1);
                       toastr.remove()
                       toastr.success("Policy type deleted successfully.", "Confirmation");
                   }, function (error) {
                       toastr.remove()
                       if (angular.isDefined(error.data) && error.data !== null)
                           toastr.error(error.data.errorMessage, "Error");
                       else
                           toastr.error("Failed to delete the policy type. Please try again..", "Error");
                   });
                }
               
            }
        });

    }
    function GetPOlicyType() {
        var GetPolicyType = HomeOwenerPolicyService.getPolicytype();
        GetPolicyType.then(function (success) { $scope.HOPolicyList = success.data.data; $scope.FilterList = success.data.data; }, function (error) { });
    }

    // GetPolicyByStates
    function GetPolicyByStates() {
        var GetPolicyTypeByState = HomeOwenerPolicyService.getPolicyTypeByState();
        GetPolicyTypeByState.then(function (success) { $scope.HOPolicyListByState = success.data.data;
       // console.log($scope.HOPolicyListByState);
         }, function (error) { });
    }
    $scope.GotoDashboard = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }


    function getState() {
        var param =
                {
                    "isTaxRate": false,
                    "isTimeZone": false
                };
        var getState = HomeOwenerPolicyService.getState(param);
        getState.then(function (success) {
             
            $scope.stateList = success.data.data;
        }, function (error) {

        });
    };

    $scope.GetByState = GetByState;
    function GetByState() {
        $(".page-spinner-bar").removeClass("hide");

        var a = $scope.selected.StateId;
        if (a === "0") {
            $scope.HOPolicyList = $scope.FilterList;
        }
        else {
            var param =
                 {
                     "state": {
                         "id": a // state id
                     }
                 };

            var getPolicyByState = HomeOwenerPolicyService.filterByState(param);
            getPolicyByState.then(function (success) {
                $(".page-spinner-bar").addClass("hide");

                $scope.HOPolicyList = success.data.data;
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");

            });
        }

    }
    // GetByState
    $scope.filterByState = function(item){
        $scope.showHOPOlicytype= true;
        $scope.selected.StateId = item.id;
        $scope.selected.stateId = item.id;
        $scope.stateName = item.stateName;
        GetByState();
    }
    // showHOPOlicytype= true;AddHOPolicyShow=false
    $scope.getHOPByStates = function(){
        $scope.showHOPOlicytype= true;
        $scope.AddHOPolicyShow=false;
        $scope.HOPolicy = true;

    }
    $scope.checkLimit = function(specilaLimit){
        if($scope.categoryList){
            var totalcategoryLimit = 0.00;
            specilaLimit = (specilaLimit)?parseFloat(specilaLimit):0.00
            $scope.limit = specilaLimit;
            angular.forEach($scope.categoryList,function(item){
                totalcategoryLimit = totalcategoryLimit+((item && item.coverageLimit)?parseFloat(item.coverageLimit):0);
            })
        if(specilaLimit<=totalcategoryLimit){
            $scope.disableAddCoverage = true;
            $scope.limit = $scope.limit-totalcategoryLimit;

        }
        else{
        $scope.disableAddCoverage = false;
        $scope.limit = $scope.limit-totalcategoryLimit;
        }


        }
    }
    $scope.resetLimit = function(index){
    
            //console.log('here!');
            $scope.limit = parseFloat($scope.PolicyTypeDetails.specilaLimit);
            var totalcategoryLimit =0;
            var total = 0;
            var i=0;
            angular.forEach($scope.categoryList,function(item){
                if(i!=index)
                totalcategoryLimit = totalcategoryLimit+((item && item.coverageLimit)?parseFloat(item.coverageLimit):0);
                i++;
                total = total+((item && item.coverageLimit)?parseFloat(item.coverageLimit):0);
            })
            $scope.PolicyTypeDetails.specilaLimit = total;
            $scope.limit = total;
            //$scope.limit = $scope.limit-totalcategoryLimit;

        
    }
     // populateolicyInfo
     $scope.populatePolicyInfo = function(){
        var param = {
            "typeName": $scope.PolicyTypeDetails.typeName,
            "state": {
                "id": $scope.selected.stateId
            }
        }
        var getPolicyInfoByState = HomeOwenerPolicyService.getPolicyInfoByState(param);
        getPolicyInfoByState.then(function (success) {
            if (success.data.data !== null && (angular.isDefined(success.data.data))) {
                bootbox.confirm({
                    size: "",
                    closeButton: false,
                    title: "Policyholder Info",
                    message: "HO policy type already exists! do you want to prepopulate the data? Please Confirm!",
                    className: "modalcustom", buttons: {
                        confirm: {
                            label: 'Yes',
                            className: 'btn-success'
                        },
                        cancel: {
                            label: 'No',
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        //if (result)  call delet function
                        $(".page-spinner-bar").removeClass("hide");
                        $timeout(function () {
                            if (result) {
                                $scope.PolicyTypeDetails = success.data.data;
                                $scope.categoryList = success.data.data.policyTypeCategories;
                                $scope.AddHOPolicyShow = true;
                                $scope.HOPolicy = false;
                                $scope.selected.stateId = $scope.PolicyTypeDetails.state.id;

                            }
                            $(".page-spinner-bar").addClass("hide");
                        }, 500);


                    }
                });
            }
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

    }


    $scope.chechForDuplicateCategory = chechForDuplicateCategory;
    function chechForDuplicateCategory(item){
        //var categoryListIds = [];
        var flag = 0;
        angular.forEach($scope.categoryList, function (i) {
            if(i.categoryId == item.categoryId){
                flag++;
            }
    });
    if(flag > 1){
        item.categoryId = null;
        //$scope.selectedCategoryId = [];
        toastr.remove();
        window.setTimeout(function(){
            toastr.warning("This category is already added against a policy. Please choose a different category.", "Warning");
          },500);
        
    }
    }
});