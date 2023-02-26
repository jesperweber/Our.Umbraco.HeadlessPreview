var contentLoadedName = 'headlessPreview.content.loaded';
angular.module(contentLoadedName, []).config(['$provide', $provide => {
    $provide.decorator("$rootScope", function preview($delegate, headlessPreviewService) {
        $delegate.$on('content.loaded', (_, data) => {

            headlessPreviewService.changePreviewButton(data);

        });
        return $delegate;
    });
}]);
angular.module('umbraco').requires.push(contentLoadedName);

var contentSavedName = 'headlessPreview.content.saved';
angular.module(contentSavedName, []).config(['$provide', $provide => {
    $provide.decorator("$rootScope", function preview($delegate, headlessPreviewService) {
        $delegate.$on('content.saved', (_, data) => {

            headlessPreviewService.changePreviewButton(data);

        });
        return $delegate;
    });
}]);
angular.module('umbraco').requires.push(contentSavedName);
