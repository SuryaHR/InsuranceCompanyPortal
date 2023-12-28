angular.module('MetronicApp').controller('AssignPostLostItemController', function ($rootScope, $scope, settings, $translate, $translatePartialLoader, $location,
    AdjusterListService, SupervisorClaimDetailsService, $uibModal, $filter) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    $translatePartialLoader.addPart('AssignPostLostItem');
    $translate.refresh();
    $(".page-spinner-bar").removeClass("hide");
    $scope.PageSize = $rootScope.settings.pagesize;
    $scope.ErrorMessage = '';
    $scope.AdjusterList = [];
    $scope.PricingSpecialist = [];
    $scope.FiletrLostDamageList = [];
    $scope.ServiceList = [];
    $scope.CategoryList = [];
    $scope.SubCategory = [];
    $scope.Categories = "ALL";
    $scope.OriginalPostLossIndex = null;
    $scope.LostDamagedItemList = [];
    $scope.OriginalPostLossItem = [];
    $scope.SelectedCategories = [];
    $scope.SelectedServiceList = [];
    $scope.VendorWithServiceList = [];
    $scope.SelectedParticipant = [];
    $scope.MinServiceCost = null;
    $scope.CurrentCheckedService = [];
    //$scope.sortKey = "Selected";

    $scope.displayItemSelectError = false;
    $scope.string = sessionStorage.getItem("SelectedItemList");
    if ($scope.string === null || $scope.string === "") {
        $scope.SelectedPostLostItems = [];
    }
    else {
        $scope.SelectedPostLostItems = $scope.string.split(',').map(function (item) { return parseInt(item, 10); });
    }
    function init() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.CommanObj = {
            CompanyId: sessionStorage.getItem("CompanyId"),
            ClaimNumber: sessionStorage.getItem("ClaimNo"),
            ClaimId: sessionStorage.getItem("ClaimId"),
            SearchItemCategory: "ALL",
            ContactInsured: false
        };
       
        $scope.selected = {};
        $scope.AddNewItem = false;

        //Get lost or damaged content  API #78
        GetLostDamagedItem();

        GetCategory();
        GetSubCategory();
        //get adjuster list API #94


        //get Pricing Specialist list

        var param = {
            "companyId": $scope.CommanObj.CompanyId
        };
        var getpromise = SupervisorClaimDetailsService.getVendorForAssignItems(param);
        getpromise.then(function (success) {
            $scope.PricingSpecialist = success.data.data;
            $scope.OriginalPricingSpecialist = success.data.data;
            angular.forEach($scope.OriginalPricingSpecialist, function (specialist, key) {
                specialist.providedService = [];
            });
            $scope.PricingSpecialist = $filter('orderBy')($scope.PricingSpecialist, 'isClaimedVendor');

            angular.forEach($scope.PricingSpecialist, function (value, key) {
                value.specialities = "";
                angular.forEach(value.categoryExpertise, function (value1, key1) {
                    value.specialities += value1.name;
                    if (key1 !== value.categoryExpertise.length - 1) {
                        value.specialities = value.specialities + ", ";
                    }
                });
                value.RoleList = "";

                angular.forEach(value.roles, function (value2, key2) {
                    value.RoleList += value2.roleName;
                    if (key2 !== value.roles.length - 1) {
                        value.RoleList = value.RoleList + ", ";
                    }
                });
            });
            //angular.forEach($scope.PricingSpecialist, function (value, key) {
            //    value.Services = "";
            //    if (value.vendorProvidedServices != null) {
            //        angular.forEach(value.vendorProvidedServices, function (value1, key1) {
            //            angular.forEach(value1.vendorServices, function (value2, key2) {
            //                value.Services += value2.name;
            //                if (key2 !== value1.vendorServices.length - 1) {
            //                    value.Services = value.Services + ", ";
            //                }
            //            });

            //        });

            //    }
            //});
        }, function (error) {
            //$scope.ErrorMessage = error.data.errorMessage;
        });

        //get vendor service list
        var getVendorService = SupervisorClaimDetailsService.getVendorServiceList();
        getVendorService.then(function (success) {
            $scope.ServiceList = success.data.data;
        }, function (error) {
            // $scope.ErrorMessage = error.data.errorMessage;
        });

    }

    init();

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.sortforSelected = function () {
        $scope.sortKey = "Selected";
    }

    $scope.sortVendor = function (key) {
        $scope.sortVendorsortKey = key;   //set the sortKey to the param passed
        $scope.PricingSpecialist = $filter('orderBy')($scope.PricingSpecialist, $scope.sortVendorsortKey, $scope.sortVendorreverse)
        $scope.sortVendorreverse = !$scope.sortVendorreverse; //if true make it false and vice versa
    }

    $scope.GetLostDamagedItem = GetLostDamagedItem;
    function GetLostDamagedItem() {
        var param = {

            "claimNumber": $scope.CommanObj.ClaimNumber
        }

        var getpromise = SupervisorClaimDetailsService.getPostLostItemsWithComparables(param);
        getpromise.then(function (success) {

            $scope.LostDamagedItemList = success.data.data;
            $scope.FiletrLostDamageList = success.data.data;
            getChekced();
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.ContactInsured;
    //Assign claim to adjuster/pricing specialist/vendor API #83
    $scope.AssignPostLostItem = function () {
        if ($scope.SelectedPostLostItems.length === 0 || $scope.SelectedPostLostItems === null || $scope.SelectedParticipant.length == 0) {

            toastr.remove()
            toastr.warning($translate.instant("WarningMessage"), $translate.instant("WarningHeading"));
        }
        else {
            var ItemIds = [];
            angular.forEach($scope.SelectedPostLostItems, function (obj) {
                ItemIds.push({ "id": obj });
            });


            var serviceList = [];
            angular.forEach($scope.SelectedParticipant.providedService, function (item) { serviceList.push({ "id": item.Id }) });

            var param = {
                "vendorDetails": {
                    "vendorId": $scope.SelectedParticipant.vendorId
                },
                "claimedItems": ItemIds,
                "requestedVendorServices": serviceList,
                "canContactInsured": $scope.CommanObj.ContactInsured
            };

            var assignPostLostItem = SupervisorClaimDetailsService.assignPostLostItem(param);
            assignPostLostItem.then(function (success) {

                $scope.status = success.data.status;
                if ($scope.status == 200) {
                    toastr.remove()
                    toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                    $scope.GoBack();
                }
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
            });
        };
    }

    $scope.cancel = function () {
        sessionStorage.setItem("SelectedItemList", "");
        $location.url('SupervisorClaimDetails');
    };

    $scope.GoBack = function (e) {
        sessionStorage.setItem("SelectedItemList", "");
        $location.url('SupervisorClaimDetails');
    }
    //GotoMyClaim()
    $scope.GotoMyClaim = GotoMyClaim;
    function GotoMyClaim() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.GetCategory = GetCategory;
    function GetCategory() {
        //Get category
        var getpromise = SupervisorClaimDetailsService.getCategories();
        getpromise.then(function (success) {
            $scope.CategoryList = success.data.data;

        }, function (error) {
            // $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    $scope.GetSubCategory = GetSubCategory;
    function GetSubCategory() {
        var param = {
            "categoryId": $scope.selected.categoryId
        };
        var respGetSubCategory = SupervisorClaimDetailsService.getSubCategory(param);
        respGetSubCategory.then(function (success) { $scope.SubCategory = success.data.data; }, function (error) { $scope.SubCategory = null; $scope.ErrorMessage = error.data.errorMessage });
    }





    $scope.getChekced = getChekced;
    function getChekced() {

        angular.forEach($scope.FiletrLostDamageList, function (item) {

            angular.forEach($scope.SelectedPostLostItems, function (value) {



                if (item.claimItem.id === parseInt(value)) {

                    item.Selected = true;

                    if (item.claimItem.category != null) {
                        var index = $scope.SelectedCategories.indexOf(item.claimItem.category.name);

                        if (index == -1) {


                            $scope.SelectedCategories.push(item.claimItem.category.name);
                        }
                    }

                }

            });

        });


        $scope.SortPostLossItem();
        $(".page-spinner-bar").addClass("hide");
    }

    $scope.SelectPostLostItem = function (item) {


        var flag = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                flag++;
            }

        });

        var flagNew = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.claimItem.status.status != 'UNDER REVIEW' || item.claimItem.status.id != 3) {
                flagNew++;
            }

        });
        if (flag != flagNew) {
            $scope.selectedAll = false;
        }

        else if (flag == flagNew) {
            $scope.selectedAll = true;
        }

        //for selected item id
        var index = $scope.SelectedPostLostItems.indexOf(item.claimItem.id);

        if (index > -1) {
            $scope.SelectCategory(item);
            $scope.SelectedPostLostItems.splice(index, 1);
            item.Selected = false;

        }
        else {

            $scope.SelectedPostLostItems.push(item.claimItem.id);
            item.Selected = true;
            var index = $scope.SelectedCategories.indexOf(item.claimItem.category.name);

            if (index == -1) {
                $scope.SelectedCategories.push(item.claimItem.category.name);
            }

        }


    };


    $scope.SortPostLossItem = SortPostLossItem;
    function SortPostLossItem() {

        $scope.SelectedContainer = [];
        $scope.UnSelectedContainer = [];
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected === true) {
                $scope.SelectedContainer.push(item);
            }
            else {
                $scope.UnSelectedContainer.push(item);
            }
        });
        //$scope.FiletrLostDamageList = $scope.SelectedContainer.concat($scope.UnSelectedContainer);
        $scope.FiletrLostDamageList = $scope.SelectedContainer;
    }

    //to get selected category
    $scope.SelectCategory = SelectCategory;
    function SelectCategory(item) {

        var a = $scope.SelectedPostLostItems
        //for selected item category
        if (item.claimItem.category != null) {
            var index = $scope.SelectedCategories.indexOf(item.claimItem.category.name);

            if (index > -1) {
                var flag = 0;
                angular.forEach($scope.SelectedPostLostItems, function (obj) {
                    angular.forEach($scope.LostDamagedItemList, function (val) {

                        if (obj == val.claimItem.id) {

                            if (item.claimItem.category.name == val.claimItem.category.name) {
                                flag++;
                            }
                        }
                    })
                });

                if (flag == 1) {
                    $scope.SelectedCategories.splice(index, 1);
                }
            }

            else {
                $scope.SelectedCategories.push(item.claimItem.category.name);
            }
        }


    }

    $scope.checkAll = function () {
        $scope.SelectedPostLostItems = [];
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
            angular.forEach($scope.FiletrLostDamageList, function (item) {
                if (item.claimItem.status.status != 'UNDER REVIEW' || item.claimItem.status.id != 3) {
                    $scope.SelectedPostLostItems.push(item.claimItem.id);
                }

            });

        } else {
            $scope.selectedAll = false;
            $scope.SelectedPostLostItems = [];
            $scope.SelectedCategories = [];

        }

        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.claimItem.status.status != 'UNDER REVIEW' || item.claimItem.status.id != 3) {
                item.Selected = $scope.selectedAll;
            }
        });


        angular.forEach($scope.FiletrLostDamageList, function (item) {

            angular.forEach($scope.SelectedPostLostItems, function (value) {


                if (item.claimItem.id === parseInt(value)) {

                    item.Selected = true;
                    if (item.claimItem.category != null) {
                        var index = $scope.SelectedCategories.indexOf(item.claimItem.category.name);

                        if (index == -1) {


                            $scope.SelectedCategories.push(item.claimItem.category.name);
                        }
                    }

                }

            });

        });

    };

    //Select vendor to asssign the item and get the minimum cost for it
    $scope.SelectParticipant = function (item) {
        if (item.providedService.length == 0) {

            toastr.remove();
            toastr.warning("This vendor does not provide selected service", "Warning");
            return;
        }
        else {
            if (item.vendorId != null) {
                $scope.SelectedParticipant = item;
            }
            //if ($scope.SelectedServiceList.length > 0)
            //    $scope.getMinimumCost();
        }

    }

    $scope.SelectService = function (service, event) {

        if ($scope.CurrentCheckedService.length == 0) {
            FilterListOnChecked(service);
        }
        else {
            var count = 0;
            angular.forEach($scope.CurrentCheckedService, function (currentService, key) {
                if (currentService == service.name) {
                    count++;
                    $scope.CurrentCheckedService.splice(key, 1);
                }
            });

            if (count > 0) {
                RemoveAlreadySelected(service);
            }
            else {

                //$scope.CurrentCheckedService.push(service.name)
                FilterListOnChecked(service);

            }
        }

        //Used for showing only those vendors who are providing selected services
        var List = [];
        angular.forEach($scope.OriginalPricingSpecialist, function (speacialist) {
            if (speacialist.providedService.length > 0) {
                List.push(speacialist);
            }
        });

        //Assigning filtered list to Pricing Specilaist
        if (List.length == 0 && $scope.CurrentCheckedService.length == 0) {
             
            $scope.PricingSpecialist = $scope.OriginalPricingSpecialist
        }
        else {
            $scope.PricingSpecialist = List;
        }


        //For showing provided services by vendor form selection of service list
        angular.forEach($scope.PricingSpecialist, function (speacialist) {
            speacialist.ProvidedServiceString = "";
            angular.forEach(speacialist.providedService, function (service, key) {
                speacialist.ProvidedServiceString += service.Name;
                if (key != speacialist.providedService.length - 1) {
                    speacialist.ProvidedServiceString += ",";
                }
            });
        });

        var count = 0
        angular.forEach($scope.CurrentCheckedService, function (selectedservice) {

            if (selectedservice === service.name) {
                count++
            }

        });
        if (count > 0) {
            service.IsSelected = true;
            count = 0;
        }
        else  {
            service.IsSelected = false;
        }

        if (service.IsSelected == false) {
            toastr.remove();
            toastr.warning("No vendor provide this service", "warning")
            event.stopPropagation();
        }

    };
    //to remove already selected items
    $scope.RemoveAlreadySelected = RemoveAlreadySelected;
    function RemoveAlreadySelected(service) {

        angular.forEach($scope.OriginalPricingSpecialist, function (specialist, key) {

            if (specialist.providedService.length > 0) {
                angular.forEach(specialist.providedService, function (VendorServices) {
                    if (VendorServices.Name == service.name) {
                        VendorServices.Isdelete = true;
                    }
                    else {
                        VendorServices.Isdelete = false;
                    }
                });

                var List = [];
                angular.forEach(specialist.providedService, function (VendorServices) {
                    if (VendorServices.Isdelete === false) {
                        List.push(VendorServices);
                    }
                });

                specialist.providedService = List;


            }
        });
    };


    $scope.FilterListOnChecked = FilterListOnChecked;
    function FilterListOnChecked(service) {
        //Filter list on selection PricingSpecialist       
        //var list = [];
        var count = 0;
        //$scope.PricingSpecialist = [];
        if ($scope.SelectedServiceList.length >= 0) {
          
            angular.forEach($scope.OriginalPricingSpecialist, function (specialist, key) {
              
                if (specialist.vendorProvidedServices !== null) {
                    angular.forEach(specialist.vendorProvidedServices, function (VendorServices) {
                        //Category Loop start
                        angular.forEach($scope.SelectedCategories, function (category) {                        
                            if (category == VendorServices.category.name) {
                                angular.forEach(VendorServices.contentServices, function (contentService) {
                                    if (contentService.service == service.name) {
                                        count++;
                                        specialist.providedService.push({ "Id": contentService.id, "Name": contentService.service })
                                    }
                                });
                            }
                        });
                        //Category Loop End                       
                    });
                    //Vendor Requetsed Services end
                    if (count > 0) {
                        var maincount = 0;
                        angular.forEach($scope.CurrentCheckedService, function (selectedservice) {
                            if (selectedservice == service.name) {
                                maincount++;
                            }
                        });
                        if (maincount == 0)
                        {
                             
                            $scope.CurrentCheckedService.push(service.name);
                        }
                                 
                        if ($scope.PricingSpecialist.indexOf(specialist) < 0) {
                            $scope.PricingSpecialist.push(specialist);
                            count = 0;
                        }
                        count = 0;
                    }

                }
            });
        }
        else {
            $scope.PricingSpecialist = $scope.OriginalPricingSpecialist;
            // $scope.MinServiceCost = 0.0
        }
    }

    //finding minimum cost for vendor serivces
    $scope.getMinimumCost = getMinimumCost;
    function getMinimumCost() {
        $scope.VendorWithServiceCost = [];
        $scope.MinServiceCost = null;
        var VendorService = [];
        var param = { "vendorId": $scope.SelectedParticipant };
        var GetVendorServicesCost = SupervisorClaimDetailsService.getVendorWithServiceCost(param);
        GetVendorServicesCost.then(function (success) {
            VendorService = success.data.data[0].vendorServices;
            angular.forEach(VendorService, function (item) {
                angular.forEach($scope.SelectedServiceList, function (serviceitem) {
                    if (item.id === serviceitem.id)
                    { $scope.MinServiceCost = $scope.MinServiceCost + item.rate }
                });
            });

        }, function (error) { $scope.MinServiceCost = 0.0 });
    };

    $scope.reset = reset;
    function reset() {
        //clear session value for selected item
        sessionStorage.setItem("SelectedItemList", "");
        $scope.SelectedParticipant = null;
        $scope.SelectedPostLostItems = [];
        $scope.SelectedCategories = [];

        $scope.GetLostDamagedItem();
    }

});