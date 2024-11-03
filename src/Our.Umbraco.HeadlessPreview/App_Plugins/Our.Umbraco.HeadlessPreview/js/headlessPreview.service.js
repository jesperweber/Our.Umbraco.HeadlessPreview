function previewService($injector) {
    return {
        changePreviewButton: function (data) {
            var eventsService = $injector.get('eventsService');
            var headlessPreviewDashboardResources = $injector.get('headlessPreviewDashboardResources');

            var openPreview = (page) => {
                window.open("/umbraco/backoffice/headlesspreview?id=" + page.id + "&culture=" + tryGetCulture(page));
            }

            var tryGetCulture = (page) => {
                var culture = page?.variants.find(variant => variant.active)?.language?.culture;

                return culture ?? '';
            }

            // Loads the required settings and updates the preview button accordingly
            headlessPreviewDashboardResources.getPreviewMode(data.content.id, data.content.contentTypeAlias)
                .then(function (result) {
                    if (result.data.isSuccess) {
                        var previewMode = result.data.data.previewMode;

                        let saveOnPreview = false;

                        eventsService.on('content.saved', () => {
                            if (saveOnPreview) {
                                saveOnPreview = false;

                                // Allow time for the "Content saved" notification to pop.
                                setTimeout(() => {
                                    openPreview(data.content);
                                }, 500)
                            }
                        })

                        var previewContainer = document.querySelector('umb-button[alias="preview"]');

                        if (previewContainer) {
                            var previewButton = previewContainer.querySelector("button");

                            if (previewMode == "DisablePreview") {
                                previewButton?.remove();
                                return;
                            }

                            if (previewMode == "UseStandardPreview") {
                                return;
                            }

                            var newPreviewButton = previewButton.cloneNode(true);
                            var contentformScope = angular.element('form[name=contentForm]')?.scope();

                            if (contentformScope) {
                                contentformScope.$watch('contentForm.$dirty', (dirty) => {
                                    if (dirty) {
                                        newPreviewButton.querySelector('span').innerHTML = 'Save and Preview';
                                    } else {
                                        newPreviewButton.querySelector('span').innerHTML = 'Preview';
                                    }
                                })
                            }

                            newPreviewButton.addEventListener("click", () => {
                                if (contentformScope?.contentForm?.$dirty) {
                                    saveOnPreview = true;
                                    eventsService.emit('rte.shortcut.save')
                                } else {
                                    openPreview(data.content);
                                }
                            });

                            newPreviewButton.querySelector('span').innerHTML = "Preview";
                            previewButton.parentNode.replaceChild(newPreviewButton, previewButton);
                        }
                    }
                });
        }
    };
}
angular.module('umbraco.services').factory('headlessPreviewService', previewService);