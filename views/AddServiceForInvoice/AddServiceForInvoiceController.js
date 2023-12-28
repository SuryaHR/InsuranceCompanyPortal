angular.module('MetronicApp').controller('AddServiceForInvoiceController', function ($rootScope, $scope, $uibModal, $translate, $translatePartialLoader, ServiceRequestOfferedService, ObjInvoice) {

    $scope.Cancel = function () {
        $scope.$close();
    };

    $scope.serviceList = [];
    $scope.OrigionalServiceList;
    $scope.SelectedServices = [];

    function init() {

        getVendorProvidedService();
    }
    init();

    $scope.getVendorProvidedService = getVendorProvidedService
    function getVendorProvidedService() {

        $scope.OrigionalServiceList = ObjInvoice.VendorProvidedServices;
        
        BindData();
        //var param =
        //    {
        //        "categoryId": null
        //    }
        //var GetServiceRequestList = ServiceRequestOfferedService.getVendorServices(param);
        //GetServiceRequestList.then(function (success) {
        //    $scope.OrigionalServiceList = success.data.data;
            
        //    $scope.BindData()
        //}, function (error) {
        //    toastr.remove();
        //    toastr.error(((error !== null) ? error.data.errorMessage : $translate.instant('Something goes wrong, please try again.')), "Error");
        //});

    };

    //$scope.filterByCategory = filterByCategory;
    //function filterByCategory() {
    //    var List = [];
    //    angular.forEach($scope.OrigionalServiceList.categoriesAndServices, function (categories) {
    //        if (categories.category.id == ObjInvoice.CategoryId) {

    //            List.push(categories.contentServices);
    //        }
    //    });

    //    $scope.OrigionalServiceList = List;

    //    angular.forEach($scope.OrigionalServiceList, function (items) {
    //        var FilteredList = [];
    //        angular.forEach(items, function (item) {
    //        angular.forEach(ObjInvoice.VendorProvidedServices, function (service) {
    //            if (item.id == service.id)
    //            {
    //                
    //                FilteredList.push(service);
    //            }
    //        });
    //        });
    //    });

    //}

    $scope.BindData = BindData;
    function BindData() {
        angular.forEach($scope.OrigionalServiceList, function (item) {
                  
                $scope.serviceList.push({
                    "serviceId": item.id, "name": item.service, "IsSelected": false, "IsExists": false, "IsAvailable": item.isAvailable, "quantity": 0, "rate": 0, "salesTax": 0,
                    "amount": 0,
                })
         
        });

        if (ObjInvoice.ServiceCostList.length > 0) {
            angular.forEach($scope.serviceList, function (item) {
                angular.forEach(ObjInvoice.ServiceCostList, function (invoice) {
                    if (invoice.serviceId == item.serviceId) {
                        item.IsSelected = true;
                        item.quantity = invoice.quantity;
                        item.rate = invoice.rate;
                        item.salesTax = invoice.salesTax;
                        item.amount = invoice.amount;
                    }

                });
            });
        }

    };

    $scope.Ok = function () {
        var lst = [];
        angular.forEach($scope.serviceList, function (service) {
            if (service.IsSelected || service.IsExists) {
                lst.push({
                    "serviceId": service.serviceId, "name": service.name, "description": null, "quantity": service.quantity, "rate": service.rate, "salesTax": service.salesTax,
                    "amount": service.amount, "IsSelected": service.IsSelected, "IsExists": service.IsExists
                });
            }
        });
        $scope.$close(lst);
    };

});