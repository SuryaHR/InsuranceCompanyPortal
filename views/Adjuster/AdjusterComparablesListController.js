/* Setup blank page controller */
angular.module('MetronicApp').controller('AdjusterComparablesListController', ['$rootScope', '$scope', 'settings', '$translate', '$translatePartialLoader', function ($rootScope, $scope, settings, $translate, $translatePartialLoader) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();

        // set default layout mode
       
       
       
        
    });

    //set language
    $translatePartialLoader.addPart('AdjusterComparablesList');
    $translate.refresh();

    $scope.comparableList = [{
        image: "../assets/pages/img/avatars/team1.jpg",
        details: [{ BrandName: 'BrandName1', Model: 'Make/Model1', Price: 'Price1', Description: 'Description1' }]

    },

    {
        image: "../assets/pages/img/avatars/team1.jpg",
        details: [{ BrandName: 'BrandName2', Model: 'Make/Model2', Price: 'Price2', Description: 'Description2' }]

    },

    {
        image: "../assets/pages/img/avatars/team1.jpg",
        details: [{ BrandName: 'BrandName3', Model: 'Make/Model3', Price: 'Price3', Description: 'Description3' }]

    },
    {
        image: "../assets/pages/img/avatars/team1.jpg",
        details: [{ BrandName: 'BrandName4', Model: 'Make/Model4', Price: 'Price4', Description: 'Description4' }]

    }
    , {
        image: "../assets/pages/img/avatars/team1.jpg",
        details: [{ BrandName: 'BrandName2', Model: 'Make/Model2', Price: 'Price2', Description: 'Description2' }]

    },

    {
        image: "../assets/pages/img/avatars/team1.jpg",
        details: [{ BrandName: 'BrandName3', Model: 'Make/Model3', Price: 'Price3', Description: 'Description3' }]

    },
    {
        image: "../assets/pages/img/avatars/team1.jpg",
        details: [{ BrandName: 'BrandName4', Model: 'Make/Model4', Price: 'Price4', Description: 'Description4' }]

    }
    ]

   //Sort options for dropdown
    $scope.SortOptions = [{ Id: 1, Value: "Featured" }, { Id: 2, Value: "Pirce-Low TO High" }, { Id: 2, Value: "Pirce-High To Low" }, { Id: 3, Value: "Customer Review" }]
    $scope.sortcolumn =1;


    $scope.ok = function () {
        //Success Call Back is the value to be pass after opertion deone
        $scope.$close();
    };
    $scope.cancel = function () {

        $scope.$close();
    };

  

}]);
