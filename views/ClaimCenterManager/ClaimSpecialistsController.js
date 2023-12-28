angular.module('MetronicApp').controller('ClaimSpecialistsController', function ($rootScope,$filter, $translate, $translatePartialLoader, $scope, settings, $location, ClaimSpecialistsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('ClaimSpecialists');
    $translate.refresh();
    $scope.PageLength = $rootScope.settings.pagesize;
    $scope.ErrorMessage = "";
    SpecialistName = "";

    $scope.SpecialistList = [];
    //Current categoryId of specialty
    $scope.SpecialtyOfSpecialist = [];
    //List of all the category present in system
    $scope.OriginalCategoryList = [];
    $scope.SeletedUserId;
   function init() {
        var CompanyId = {          
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var SpecialistListPromise = ClaimSpecialistsService.GetSpecialist(CompanyId);
        SpecialistListPromise.then(function (success) { $scope.SpecialistList = success.data.data; }, function (error) {

            $scope.ErrorMessage = error.data.errormessage;
        });
        var CategoryList = ClaimSpecialistsService.GetCategoryList();
        CategoryList.then(function (succcess) { $scope.CategoryList = succcess.data.data; $scope.OriginalCategoryList = succcess.data.data; }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
   init();

    //Sort New ClaimSpecialists  Grid wiith radiobutton
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //RadioButton Event get Specilty of selected Specialists
    $scope.SelectSpecialist = SelectSpecialist;
    function SelectSpecialist(item) {
        $scope.AddSpecialtyList = []; $scope.CategoryList = [];
        $scope.SeletedUserId = item.id;
        $scope.SpecialistName = item.name;
        angular.copy($scope.OriginalCategoryList,$scope.CategoryList);
        angular.copy(item.specialities, $scope.SpecialtyOfSpecialist)
           
        angular.forEach($scope.SpecialtyOfSpecialist, function (item) {
            $scope.CategoryList = $filter('filter')($scope.CategoryList, { 'categoryId': '!' + item.id });
        });
    }

    //Add Category to expert button > click
    $scope.AddToExpertCategory = AddToExpertCategory;
    function AddToExpertCategory() {
        angular.forEach($scope.AddSpecialtyList, function (item) {
            if ($scope.SpecialtyOfSpecialist.indexOf(item) === -1)
            $scope.SpecialtyOfSpecialist.push(item);
        });
        angular.forEach($scope.AddSpecialtyList, function (item) {
            $scope.CategoryList = $filter('filter')($scope.CategoryList, { 'categoryId': '!' + item.id });
        });
       
        $scope.AddSpecialtyList = [];       
    }

    //Remove Category to expert button < click
    $scope.RemoveFromExpertCategory = RemoveFromExpertCategory;
    function RemoveFromExpertCategory() {
        //Splice item form specialty list
        angular.forEach($scope.RemoveSpecialtyList, function (item) {
            var objindex = $scope.SpecialtyOfSpecialist.indexOf(item);
           if(objindex!==undefined || objindex >-1)
           {
               $scope.SpecialtyOfSpecialist.splice(objindex, 1)
           }
        });
        //Splice item form Category list       
        angular.copy($scope.OriginalCategoryList, $scope.CategoryList);
        angular.forEach($scope.SpecialtyOfSpecialist, function (item) {
            $scope.CategoryList = $filter('filter')($scope.CategoryList, { 'categoryId': '!' + item.id });
        });      
        $scope.RemoveSpecialtyList = [];       
    }

    //Add Category to specialist specialty Check item is in list or not on checkbox click
    $scope.AddSpecialtyList = [];
    $scope.AddCategoryToExpert = AddCategoryToExpert;
    function AddCategoryToExpert(item)
    {
        var cat = {
            "id": item.categoryId,
            "speciality": item.categoryName
        };       
        var flag = true;var index=0;
        if ($scope.AddSpecialtyList.length !== 0) {
            for (var i = 0; i < $scope.AddSpecialtyList.length; i++) {
                if ($scope.AddSpecialtyList[i].id===item.categoryId) {
                    flag = false; 
                    index=i;
                }
            }
            if(flag)
                $scope.AddSpecialtyList.push(cat);
            else
                $scope.AddSpecialtyList.splice(index,1)
        }
        else {
            $scope.AddSpecialtyList.push(cat);
        }
    }

    //Remove Category from specialist specialty
    $scope.RemoveSpecialtyList = [];
    $scope.RemoveExpertCategory = RemoveExpertCategory;
    function RemoveExpertCategory(item) {//Remove specialty of specialist Check item is in list or not on checkbox click      
        if ($scope.RemoveSpecialtyList.indexOf(item) === -1) {
            $scope.RemoveSpecialtyList.push(item);
        }
        else {
            $scope.RemoveSpecialtyList.splice($scope.RemoveSpecialtyList.indexOf(item), 1)
        }
    }

    //Get checkbox is cheed or not
    $scope.GetIsChecked = function (list, item) {
        list.indexOf(item) > -1
    }

    //Save
    $scope.SaveDetails=SaveDetails;
    function SaveDetails()
    {
        var CategoryList=[];
        angular.forEach($scope.SpecialtyOfSpecialist, function (item) {
            CategoryList.push({ "id": item.id });
        });      
        var param = {
            "id": $scope.SeletedUserId,
            "specialities": CategoryList
        };      
        var SavePromise = ClaimSpecialistsService.AssignCategoryToSpecialist(param);
        SavePromise.then(function (success) { }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
        }
});