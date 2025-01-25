import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/document';
import { UMB_SUBMITTABLE_WORKSPACE_CONTEXT, UmbSubmittableWorkspaceContext, UmbWorkspaceActionArgs, UmbWorkspaceActionBase } from '@umbraco-cms/backoffice/workspace';
import { OurUmbracoHeadlessPreviewService, PreviewMode} from "../api";
import { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
 
export default class HeadlessPreviewDocumentSaveAndPreviewWorkspaceAction extends UmbWorkspaceActionBase {

    constructor(host: UmbControllerHost, args: UmbWorkspaceActionArgs<never>) {
		super(host, args);

		// /* The action is disabled by default because the onChange callback
		//  will first be triggered when the condition is changed to permitted */
		this.disable();

		// const condition = new UmbDocumentUserPermissionCondition(host, {
		// 	host,
		// 	config: {
		// 		alias: 'Umb.Condition.UserPermission.Document',
		// 		allOf: [UMB_USER_PERMISSION_DOCUMENT_UPDATE],
		// 	},
		// 	onChange: () => {
		// 		if (condition.permitted) {
		// 			this.enable();
		// 		} else {
		// 			this.disable();
		// 		}
		// 	},
		// });
        
		// TODO: Could we make change label depending on the state?
		this.consumeContext(UMB_SUBMITTABLE_WORKSPACE_CONTEXT, (context) => {
			this.#submitWorkspaceContext = context;
		});
		
        this._setup();
	}

	#submitWorkspaceContext?: UmbSubmittableWorkspaceContext;
    
    private _previewMode?: PreviewMode;

    private async _setup() {
        const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
        const workspaceContext = await this.getContext(UMB_DOCUMENT_WORKSPACE_CONTEXT);

        const nodeGuid = workspaceContext.getUnique();
        const contentTypeGuid =  workspaceContext.getContentTypeId();

        const { data, error } = await OurUmbracoHeadlessPreviewService.getPreviewMode({query: {nodeGuid: nodeGuid ?? undefined, contentTypeGuid}});

        if (error) {
            notificationContext.peek('danger', { data: { message: 'Error loading configuration' } });
          return;
        }

        this._previewMode = data?.data.previewMode;

        if (this._previewMode !== "DisablePreview") {
            this.enable();
        }
    }

    async execute() {
        try {
            const documentWorkspaceContext = await this.getContext(UMB_DOCUMENT_WORKSPACE_CONTEXT);
            
            const nodeGuid = documentWorkspaceContext.getUnique();
        
            if (this._previewMode === "UseStandardPreview") {
                await documentWorkspaceContext.saveAndPreview();
                return;
            }
            else if (this._previewMode === "UseHeadlessPreview") {
                await this.#submitWorkspaceContext?.requestSubmit();

                // Allow time for the "Content saved" notification to pop.
                setTimeout(() => {
                    this._openPreview(nodeGuid ?? "", this._tryGetCulture());
                }, 500);

                return;
            }
        }
        catch (error) {
            console.error('Failed to save and preview document', error);
        }
    }

    // TODO can we get the culture from the workspace context, instead of relying on the URL?
    private _tryGetCulture() {
        const urlSegments = window.location.pathname.split('/');

        const urlCultureRegex = /\/([a-zA-Z]{2}-[a-zA-Z]{2})/;
        const culture = urlSegments.find(x => urlCultureRegex.test(x));

        return culture ?? "";
    }

    private _openPreview(guid: string, culture: string) {
        window.open(`/umbraco/backoffice/headlesspreview?guid=${guid}&culture=${culture}`);
    }
}