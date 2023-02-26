angular.module('umbraco.resources')
    .factory('headlessPreviewDashboardResources',
        function ($http) {
            return {
                getConfiguration: function () {
                    return $http.get("/umbraco/backoffice/api/previewapi/getconfiguration");
                },
                saveConfiguration: function (configuration) {
                    return $http.post("/umbraco/backoffice/api/previewapi/saveconfiguration", configuration);
                }
            };
        });