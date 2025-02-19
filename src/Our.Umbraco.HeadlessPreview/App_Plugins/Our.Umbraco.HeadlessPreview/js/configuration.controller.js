function ConfigurationController(headlessPreviewDashboardResources, notificationsService, $scope) {
    var vm = this;
    vm.loadingConfiguration = false;
    vm.buttonState = null;
    vm.toggledInfos = [];
    vm.configuration = {};

    function init() {
        vm.getConfiguration();
    }

    vm.getConfiguration = function () {
        vm.loadingConfiguration = true;
        vm.buttonState = "busy";
        headlessPreviewDashboardResources.getConfiguration()
            .then(function (result) {
                if (result.data.isSuccess) {
                    vm.configuration.templateUrl = result.data.data.templateUrl;
                    vm.configuration.disabled = result.data.data.disabled;
                    vm.configuration.previewModeSettings = result.data.data.previewModeSettings;
                    vm.configuration.configuredFromSettingsFileOrCode = result.data.data.configuredFromSettingsFileOrCode;
                    vm.loadingConfiguration = false;
                    vm.buttonState = null;
                }
            });
    };

    vm.saveConfiguration = function () {
        vm.buttonState = "busy";

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

    vm.toggleInfo = function (infoGroup) {
        var infoGroupState = vm.toggledInfos[infoGroup];

        if (!infoGroupState) {
            vm.toggledInfos[infoGroup] = true;
        }
        else {
            vm.toggledInfos[infoGroup] = !vm.toggledInfos[infoGroup];
        }
        console.log(vm.toggledInfos[infoGroup])
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