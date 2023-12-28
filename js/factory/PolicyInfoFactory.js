angular.module('MetronicApp').factory('PolicyInfoFactory', function () {
    // PolicyholderInfoFactory is a factory used to manipulate data and 
    // will be injected as a Dependency injection into controllers.
    // To access data    
    var data = {
        "policyInfo": {},        
    };
    var addPolicyInfo = function (policyInfo) {
        data = {
            "policyInfo": policyInfo,               
        }        
    };
    var getPolicyInfo = function () {
        return data;
    };
    var removePolicyInfo = function () {
        data = {};        
    };    
    return {
        getPolicyInfo: getPolicyInfo,
        removePolicyInfo: removePolicyInfo,
        addPolicyInfo: addPolicyInfo    
    };
});