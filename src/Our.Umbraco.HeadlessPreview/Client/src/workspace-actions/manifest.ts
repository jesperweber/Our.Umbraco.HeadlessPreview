import { UMB_ENTITY_IS_NOT_TRASHED_CONDITION_ALIAS } from '@umbraco-cms/backoffice/recycle-bin';
import { ManifestWorkspaceActions } from '@umbraco-cms/backoffice/workspace';
export const manifests: Array<ManifestWorkspaceActions> = [
    {
        type: 'workspaceAction',
        kind: 'default',
        overwrites: 'Umb.WorkspaceAction.Document.SaveAndPreview2', // Alias of thing you want to overwrite
        alias: 'HeadlessPreview.WorkspaceAction.Document.SaveAndPublish',
        name: 'Headless Preview Save And Publish Document Workspace Action',
        api: () => import('./save-and-preview.action'), // Our implementation
        weight: 100,
        meta: {
            look: 'default',
            color: 'default',
            label: 'Headless Save and preview'
        },
        conditions: [
            {
                alias: 'Umb.Condition.WorkspaceAlias',
                match: 'Umb.Workspace.Document',  // Only show for Document workspace
            },
            {
                alias: UMB_ENTITY_IS_NOT_TRASHED_CONDITION_ALIAS, // Ensure the item is not in trash
            },
        ]
    },  
];