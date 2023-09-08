function previewService($injector) {
    return {
        changePreviewButton: function(data) {
            var eventsService = $injector.get('eventsService');

            var openPreview = (page) => {
                window.open("/umbraco/backoffice/headlesspreview?id=" + page.id + "&culture=" + tryGetCulture(page));
            }

            var tryGetCulture = (page) => {
                var culture = page?.variants.find(variant => variant.active)?.language?.culture;

                return culture ?? '';
            }

            var interval = setInterval(function() {
                let previewMode = false;

                eventsService.on('content.saved', () => {
                    if (previewMode) {
                        previewMode = false;

                        // Allow time for the "Content saved" notification to pop.
                        setTimeout(() => {
                            openPreview(data.content);
                        }, 500)
                    }
                })

                try {
                    var previewContainer = document.querySelector('umb-button[alias="preview"]');

                    if (previewContainer) {
                        var previewButton = previewContainer.querySelector("button");
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
                                previewMode = true;
                                eventsService.emit('rte.shortcut.save')
                            } else {
                                openPreview(data.content);
                            }
                        });

                        newPreviewButton.querySelector('span').innerHTML = "Preview";
                        previewButton.parentNode.replaceChild(newPreviewButton, previewButton);

                        clearInterval(interval);
                    }
                } catch (e) {
                    clearInterval(interval);
                    throw e;
                }
            }, 10);
        }
    };
}
angular.module('umbraco.services').factory('headlessPreviewService', previewService);