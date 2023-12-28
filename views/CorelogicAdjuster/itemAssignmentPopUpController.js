angular.module('MetronicApp').controller('itemAssignmentPopUpController', function($uibModal, $scope,$translate, $filter, $translatePartialLoader, itemsObj){
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.searchVendorItem = {};
    //$scope.selectedAllVendorItem = true; // Default checked All
    $scope.searchVendorItem.categoryId = "0"; // Default All
    $scope.selectedAll = true; // Default All
    $scope.postLostItemsPopup = itemsObj[0].items;
    let allitems = angular.copy(itemsObj[0].items);
    $scope.selectedPostLostItemsPopup = [];
    angular.forEach($scope.postLostItemsPopup, function (item){
        if(item.Selected){    
            if(item.itemUID){
                $scope.selectedPostLostItemsPopup.push(item.itemUID);
            }
            else if(item.claimItem && item.claimItem.itemUID){
                $scope.selectedPostLostItemsPopup.push(item.claimItem.itemUID);
            }
        } else{
            $scope.selectedAll = false;
            //$scope.selectedAllVendorItem  = false;
        }
    });
    console.log("post lost items",$scope.postLostItemsPopup)
    $scope.DdlSourceCategoryList = itemsObj[1].DdlSourceCategoryList;
    console.log($scope.DdlSourceCategoryList);
    $scope.ClaimProfile = sessionStorage.getItem('claimProfile');
    $scope.cancel = function () {
        $scope.postLostItemsPopup = allitems;
        $scope.$close($scope.postLostItemsPopup);
    };

    $scope.SelectVendorPostLostItemPopup = function (ele) {
        if(ele.Selected){
            if(ele.itemUID){
                $scope.selectedPostLostItemsPopup.push(ele.itemUID);
            }
            else if(ele.claimItem && ele.claimItem.itemUID){
                $scope.selectedPostLostItemsPopup.push(ele.claimItem.itemUID);
            }
            
            $scope.selectedAll = true;
            //$scope.selectedAllVendorItem  = true;
            angular.forEach($scope.postLostItemsPopup, function (ele){
                if(!ele.Selected){
                    $scope.selectedAll = false;
                    //$scope.selectedAllVendorItem  = false;
                }
            })
        }else{
            var index = $scope.selectedPostLostItemsPopup.indexOf(ele.itemUID);            
            if(index > -1){
                $scope.selectedPostLostItemsPopup.splice(index, 1);
            }else{
                if(ele.claimItem && ele.claimItem.itemUID){
                    var index = $scope.selectedPostLostItemsPopup.indexOf(ele.claimItem.itemUID);
                    if(index > -1){
                        $scope.selectedPostLostItemsPopup.splice(index, 1);
                    }
                }
            }
            $scope.selectedAll = false;
            //$scope.selectedAllVendorItem  = false;
        }

        // var index = $scope.selectedPostLostItems.indexOf(item.itemUID);
        // if(index > -1){
        //     $scope.selectedPostLostItems.splice(index, 1);
        // }

    }

    $scope.saveSelectedItems = function(event){
        $scope.selectedItems = [];
        angular.forEach($scope.postLostItemsPopup, function (item){
            if(item.itemUID){
                angular.forEach($scope.selectedPostLostItemsPopup, function(itemUID){
                    if(item.itemUID == itemUID){
                        $scope.selectedItems.push(item);
                    }
                });
            }
            else if(item.claimItem && item.claimItem.itemUID){
                angular.forEach($scope.selectedPostLostItemsPopup, function(itemUID){
                    if(item.claimItem.itemUID == itemUID){
                        $scope.selectedItems.push(item);
                    }
                }); 
            }
        });
        
        if($scope.selectedItems && $scope.selectedItems.length==0){
            event.stopPropagation();
            toastr.remove();
            toastr.error("Please select the item to save", "Error");
            return false;
        }else{
            event.stopPropagation();
            toastr.remove();
            toastr.success("Selected items updated successfully", $translate.instant("SuccessHeading"));
            $scope.$close($scope.selectedItems);
        }        
    }
        
    $scope.checkAll = function () {
        $scope.selectedPostLostItemsPopup = [];
        //$scope.selectedAll = !$scope.selectedAll;
        if (!$scope.selectedAll) {
            //$scope.selectedAll = false;
            //$scope.selectedAllVendorItem = false;
            $scope.selectedPostLostItemsPopup = [];
            angular.forEach($scope.postLostItemsPopup, function (ele) {
                ele.Selected =  false;                
                //if ((item.claimItem.status.id != 3 || item.claimItem.status.status != 'UNDER REVIEW') && ((item.claimItem.status.id != 2 || item.claimItem.status.status != 'ASSIGNED'))) {
                    //$scope.SelectedPostLostItems.push(item.claimItem.id);
                //}
            });
        } else {
            //$scope.selectedAllVendorItem = true;
            //$scope.selectedAll = true;
            $scope.selectedPostLostItemsPopup = [];

            angular.forEach($scope.postLostItemsPopup, function (ele) {
                //if ((item.claimItem.status.id != 3 || item.claimItem.status.status != 'UNDER REVIEW') && ((item.claimItem.status.id != 2 || item.claimItem.status.status != 'ASSIGNED'))) {
                    ele.Selected = true;
                    if(ele.itemUID){
                        $scope.selectedPostLostItemsPopup.push(ele.itemUID);
                    }else if(ele.claimItem && ele.claimItem.itemUID){
                        $scope.selectedPostLostItemsPopup.push(ele.claimItem.itemUID);
                    }
                //}
            });
        }
        
    };



    $scope.filterItemsByCategoryInAssignment = function (categoryId) {
        $scope.TempObj = [];
        //$scope.searchVendorItem = {};
        $scope.searchVendorItem.categoryId = categoryId;        
        if (!$scope.searchVendorItem
            || !$scope.searchVendorItem.categoryId) {
                $scope.postLostItemsPopup = $scope.selectedItems;
            if ($scope.SelectedVendorPostLossItem && $scope.SelectedVendorPostLossItem.length != $scope.postLostItemsPopup.length)
                $scope.selectedAllVendorItem = false;
        }
        else {
            if ($scope.searchVendorItem.categoryId != null && $scope.searchVendorItem.categoryId !== '0') {
                angular.forEach(allitems, function (value) {
                    if ($scope.searchVendorItem.categoryId != null && value.category !== null) {
                        if (value.category.id == $scope.searchVendorItem.categoryId) {
                            $scope.TempObj.push(value);
                        }
                    }
                });
                $scope.selectedAllVendorItem = false;
                $scope.postLostItemsPopup = $scope.TempObj;
            }else{
                $scope.selectedAllVendorItem = true;
                $scope.postLostItemsPopup = allitems;
            }
        }
    }
})