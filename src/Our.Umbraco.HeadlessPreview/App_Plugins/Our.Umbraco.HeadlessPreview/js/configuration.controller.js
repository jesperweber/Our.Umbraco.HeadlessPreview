function ConfigurationController(headlessPreviewDashboardResources, notificationsService, $scope) {
    var vm = this;
    vm.loadingConfiguration = false;
    vm.buttonState = null;
    vm.configuration = {};

    function init() {
        vm.getConfiguration();
    }

    vm.toggleUseUmbracoHostnames = function () {
        vm.configuration.useUmbracoHostnames = !vm.configuration.useUmbracoHostnames;
        vm.updateTemplateUrl();
    }

    vm.updateTemplateUrl = function () {

        var hostname = vm.configuration.useUmbracoHostnames ? "[siteHostname]" : vm.configuration.staticHostname?.trimEnd('/');
        var relativePath = vm.configuration.relativePath?.trimStart('/');

        var parametersToAdd = "?slug=[relativePathOfPage]";
        if (vm.configuration.secret)
            parametersToAdd += "&secret=" + vm.configuration.secret;

        vm.configuration.templateUrl = hostname + "/" + relativePath + parametersToAdd
    }

    vm.getConfiguration = function () {
        vm.loadingConfiguration = true;
        vm.buttonState = "busy";
        headlessPreviewDashboardResources.getConfiguration()
            .then(function (result) {
                if (result.data.isSuccess) {
                    vm.configuration.useUmbracoHostnames = result.data.data.useUmbracoHostnames;
                    vm.configuration.staticHostname = result.data.data.staticHostname;
                    vm.configuration.relativePath = result.data.data.relativePath;
                    vm.configuration.secret = result.data.data.secret;
                    vm.configuration.configuredFromSettingsFile = result.data.data.configuredFromSettingsFile;
                    vm.loadingConfiguration = false;
                    vm.buttonState = null;

                    vm.updateTemplateUrl();
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

        headlessPreviewDashboardResources.saveConfiguration(vm.configuration)
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

angular.module("umbraco").controller("HeadlessPreview.ConfigurationController", ConfigurationController);