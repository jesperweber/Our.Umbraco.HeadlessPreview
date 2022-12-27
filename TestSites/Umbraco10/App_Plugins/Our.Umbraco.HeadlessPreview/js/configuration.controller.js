function configurationController(dashboardResources, notificationsService, $scope, $filter, $timeout) {
    var vm = this;
    vm.loadingConfiguration = false;
    vm.buttonState = null;
    vm.configuration = {};

    function init() {
        vm.getConfiguration();
    }

    vm.toggleUseUmbracoHostnames = function () {
        vm.configuration.useUmbracoHostnames = !vm.configuration.useUmbracoHostnames;
    }

    vm.getConfiguration = function () {
        vm.loadingConfiguration = true;
        vm.buttonState = "busy";
        dashboardResources.getConfiguration()
            .then(function (result) {
                if (result.data.isSuccess) {
                    vm.configuration.useUmbracoHostnames = result.data.data.useUmbracoHostnames;
                    vm.configuration.staticHostname = result.data.data.staticHostname;
                    vm.configuration.secret = result.data.data.secret;
                    vm.configuration.configuredFromSettingsFile = result.data.data.configuredFromSettingsFile;
                    vm.loadingConfiguration = false;
                    vm.buttonState = null;
                }
            });
    };

    vm.saveConfiguration = function () {
        vm.buttonState = "busy";
        if (!vm.configuration.useUmbracoHostnames && !vm.configuration.staticHostname) {
            notificationsService.error("You must add a static hostname if you are not using Umbraco hostnames");
            vm.buttonState = null;
            return;
        }

        dashboardResources.saveConfiguration(vm.configuration)
            .then(function (result) {
                if (result.data.success) {
                    notificationsService.success("Configuration saved");
                    vm.setPristine();
                } else {
                    notifyErrors(result.data, "Error saving configuration");
                }
                vm.buttonState = null;
            })
            .catch(function (error) {
                console.error(error);
                notifyErrors(error.data, `Error saving configuration: ${error.data.message}`);
                vm.buttonState = null;
            });
    };

    function notifyErrors(data, errorMessage) {
        var status = data.statusCode;

        errorMessage = errorMessage || "Something went wrong";

        if (status === 401) {
            notificationsService.error(data.message);
        } else if (status === 404) {
            notificationsService.error("Url does not exist");
        } else {
            notificationsService.error(errorMessage);
        }
    }

    vm.setPristine = function () {
        $scope.$$childTail.dashboardForm.$setPristine();
    };

    init();
}

angular.module("umbraco").controller("ConfigurationController", configurationController);