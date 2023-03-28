function previewService() {

    return {
        changePreviewButton: function (data) {
            var openPreview = (page) => {
                window.open("/umbraco/backoffice/headlesspreview?id=" + page.id + "&culture=" + tryGetCulture(page));
            }

            var tryGetCulture = (page) => {
                var culture = page?.variants.find(variant => variant.active)?.language?.culture;

                return culture ?? '';
            }

            var interval = setInterval(function () {
                try {
                    var previewContainer = document.querySelector('umb-button[alias="preview"]');
                    if (previewContainer) {
                        var previewButton = previewContainer.querySelector("button");
                        var newPreviewButton = previewButton.cloneNode(true);
                        newPreviewButton.addEventListener("click", () => openPreview(data.content));
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