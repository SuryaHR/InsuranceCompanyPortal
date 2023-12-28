angular.module('MetronicApp').service('ItemDetailService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    var ItemDetails = {};
    
    return {
        getItemDetails: function () {
            return ItemDetails;
        },
        setItemDetails: function (value) {
            ItemDetails = value;
        }
    };
    
    }]);