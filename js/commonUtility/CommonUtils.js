angular.module('MetronicApp').factory('CommonUtils', ['$http', '$rootScope', function () {

/* This setReportFilters() method will save selected filters for the reports in session
    param roleRptName -  Role+Report Name
    param filtersMap  -  list of filers item / value pair
*/
var setReportFilters = 
function setReportFilters(roleRptName, filtersMap){
      let filterRpt = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))):null;
      if(filterRpt){
          filterRpt.set(roleRptName, filtersMap);
      }else{
          filterRpt = new Map();
          filterRpt.set(roleRptName, filtersMap);
      }            
      sessionStorage.setItem('filterReports', JSON.stringify(Object.fromEntries(filterRpt)));
}

return {
    setReportFilters : setReportFilters
};

}]);
