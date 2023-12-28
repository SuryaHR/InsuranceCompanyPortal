angular.module('MetronicApp').service('CalendarUtility', ['$http', '$rootScope', function ($http, $rootScope) {

    // START Calendar past date restriction/settings
    this.calPastDateSetting = function (fromDateCls, toDateCls){ 

        // While 'hiding' calendar fromDate datepicker
        $("."+fromDateCls).datepicker({
            autoclose: true,
            todayHighlight: true,
            toggleActive: true,
            format: 'mm/dd/yyyy',
        }).on('hide', function(selected){            
            var fromDt = $("."+fromDateCls);         
            if(fromDt[0].dataset.date){
                $("."+fromDateCls).datepicker('update', fromDt[0].dataset.date);
            }            
        });

        // While 'Changing fromDate' datepicker
        $("."+fromDateCls).datepicker({
            autoclose: true,
            todayHighlight: true,
            toggleActive: true,
            format: 'mm/dd/yyyy'
        }).on('changeDate', function(selected){
             updateDate($(this).closest('form').find('input:text'), selected);
        });        
    
        function updateDate(inputs, selected){
          var minDate = new Date(selected.date.valueOf());          
          $("."+toDateCls).datepicker('setStartDate', minDate);
          $("."+toDateCls).datepicker('update', '');          
        }

    }
    // END

}]);