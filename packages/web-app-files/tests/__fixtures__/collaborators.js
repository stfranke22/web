exports.roles = {
  viewer: {
    description: 'Download, preview and share',
    label: 'Viewer',
    name: 'viewer',
    permissions: ['read', 'share']
  },

  editor: {
    description: 'Edit, download, preview and share',
    label: 'Editor',
    name: 'editor',
    permissions: ['read', 'update', 'share']
  },

  advancedPermissions: {
    name: 'advancedRole',
    label: 'Advanced permissions',
    description: 'Set detailed permissions',
    permissions: ['read'],
    additionalPermissions: {
      update: { name: 'update', description: 'Allow editing' },
      share: { name: 'share', description: 'Allow sharing' }
    }
  }
}