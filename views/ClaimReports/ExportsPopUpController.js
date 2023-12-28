angular.module('MetronicApp').controller('ExportsPopUpController', function ($uibModal, $state,
    $scope, $filter, $window, $location,$rootScope,$translate, $translatePartialLoader,labelObj){
        $scope.columnList = [];
        function init(){
            $scope.lables=labelObj.labels;
            console.log("obj "+labelObj.labels);
        }
        init();
        $scope.cancel = function () {
            $scope.$close();
        };
        $scope.ok = function (e) {
            $scope.$close($scope.columnList);
        }
        $scope.addLabelToList = function(label,event){
            var index = $scope.columnList.indexOf(label);
            if(index > -1){
                $scope.columnList.splice(index, 1);
            }
            else{
                $scope.columnList.push(label);
            }
        }
        //$scope.selectAllColumns = selectAllColumns;
        $scope.selectAllColumns = function (event) {
            if($scope.selectAll){
                angular.forEach($scope.lables, function(lable){
                    $scope.columnList.push(lable)
                });
                //$scope.columnList = $scope.lables;
            }
            else{
                $scope.columnList = [];
            }
        }
    })