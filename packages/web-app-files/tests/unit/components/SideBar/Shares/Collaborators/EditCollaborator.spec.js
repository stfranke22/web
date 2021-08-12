import Editcollaborator from '@files/src/components/SideBar/Shares/Collaborators/EditCollaborator.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueSelect from 'vue-select'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  error: '.oc-files-collaborators-collaborator-error-alert',
  editHint: '#collaborator-edit-hint',

  collaborator: 'collaborator-stub',
  editOptions: 'collaborators-edit-options-stub',

  cancelButton: '.files-collaborators-collaborator-cancel',
  saveButton: '#files-collaborators-collaborator-save-share-button',

  rolebutton: '#files-collaborators-role-button',
  expirationInput: '#files-collaborators-collaborator-expiration-input',

  savingInProgress: 'oc-spinner-stub[arialabel="Saving Share"]'
}

describe('Edit Collaborator', () => {
  describe('Error message', () => {
    it('should display errors when form has errors', async () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0', collaborators: [] })

      await wrapper.setData({ errors: 'some error' })

      const errorMsg = wrapper.find(selectors.error)
      expect(errorMsg.exists()).toBeTruthy()

      expect(errorMsg.text()).toBe('some error')
    })

    it('should not display errors when the form has no errors', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0', collaborators: [] })

      const errorMsg = wrapper.find(selectors.error)
      expect(errorMsg.exists()).toBeFalsy()
    })
  })

  describe('Add People Button', () => {
    it('should render edit collaborator hint', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0', collaborators: [] })

      const editHint = wrapper.find(selectors.editHint)
      expect(editHint.exists()).toBe(true)

      expect(editHint.text()).toBe('Editing share with User One')
    })

    it('should render current collaborator', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })

      const currentCollaborator = wrapper.find(selectors.collaborator)
      expect(currentCollaborator.exists()).toBe(true)

      expect(currentCollaborator.props()).toMatchObject({
        collaborator: buildCollaboratorsArray(
          {
            fileOwner: 'user0',
            username: 'user1'
          },
          1
        ),
        modifiable: false,
        firstColumn: false
      })
    })

    it('should render collaborator edit options', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })

      const editOptions = wrapper.find(selectors.editOptions)
      expect(editOptions.exists()).toBe(true)

      expect(editOptions.props()).toMatchObject({
        collaboratorsPermissions: {},
        existingCollaboratorType: 'user',
        existingRole: {
          description: 'Download, preview and share',
          label: 'Viewer',
          name: 'viewer',
          permissions: ['read', 'share']
        },
        expirationDate: null
      })
    })
  })

  describe('Action Buttons', () => {
    it('should render the cancel button', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })
      const cancelButton = wrapper.find(selectors.cancelButton)
      expect(cancelButton.exists()).toBe(true)
      expect(cancelButton.text()).toBe('Cancel')
    })

    it('should render the save button', () => {
      const wrapper = getShallowMountedWrapper({ user: 'user0' })
      const saveButton = wrapper.find(selectors.saveButton)
      expect(saveButton.exists()).toBe(true)
      expect(saveButton.attributes().disabled).toBe('true')
      expect(saveButton.text()).toBe('Save')
    })

    it('cancel button should work', async () => {
      const cancelTrigger = jest.spyOn(Editcollaborator.methods, '$_ocCollaborators_cancelChanges')

      const wrapper = getMountedWrapper({ user: 'user0' })
      const cancelButton = wrapper.find(selectors.cancelButton)

      expect(cancelTrigger).not.toHaveBeenCalled()
      await cancelButton.trigger('click')
      expect(cancelTrigger).toHaveBeenCalledTimes(1)
    })

    it('save button should work', async () => {
      const saveTrigger = jest.spyOn(Editcollaborator.methods, '$_ocCollaborators_saveChanges')

      const wrapper = getMountedWrapper({ user: 'user0' })
      const saveButton = wrapper.find(selectors.saveButton)

      const roleSelect = wrapper.findComponent(VueSelect)
      expect(roleSelect.props('value')).toMatchObject(roles.viewer)
      expect(wrapper.vm.selectedRole).toMatchObject(roles.viewer)

      await roleSelect.vm.select(roles.editor)
      expect(roleSelect.props('value')).toMatchObject(roles.editor)
      expect(wrapper.vm.selectedRole).toMatchObject(roles.editor)

      expect(saveTrigger).not.toHaveBeenCalled()
      await saveButton.trigger('click')
      expect(saveTrigger).toHaveBeenCalledTimes(1)
    })

    it('should not display saving in progress indicator by default', () => {
      const wrapper = getMountedWrapper({ user: 'user0' })

      const spinner = wrapper.find(selectors.savingInProgress)
      expect(spinner.exists()).toBe(false)
    })

    it('should display the loading indicator when saving is in progress', async () => {
      const wrapper = getMountedWrapper({ user: 'user0' })

      await wrapper.setData({ saving: true })
      const spinner = wrapper.find(selectors.savingInProgress)
      expect(spinner.exists()).toBe(true)
    })
  })
})

function getResource({ filename = 'testFile', extension = 'txt', type = 'file', owner = 'user0' }) {
  return {
    id: '4',
    fileId: '4',
    icon: type,
    name: type === 'file' ? `${filename}.${extension}` : filename,
    extension: extension,
    path: type === 'file' ? `/${filename}.${extension}` : `/${filename}`,
    type,
    mdate: 'Mon, 12 Jul 2021 11:04:33 GMT',
    size: '163',
    indicators: [],
    permissions: 'RDNVW',
    starred: false,
    etag: '"89128c0e8122002db57bd19c9ec33004"',
    shareTypes: [],
    downloadURL: '',
    ownerDisplayName: displayNames[owner],
    ownerId: owner,
    canDownload: () => true,
    isReceivedShare: () => true,
    canBeDeleted: () => true,
    canRename: () => true,
    canShare: () => true
  }
}

const buildCollaboratorsArray = (collaborator, idx) => {
  let {
    username,
    fileOwner,
    owner,
    permissions = 17,
    shareType = 0,
    role = 'viewer'
  } = collaborator

  if (!owner) {
    owner = fileOwner
  }

  return {
    id: idx,
    key: 'collaborator-' + idx,
    collaborator: userObj(username),
    fileOwner: userObj(fileOwner),
    owner: userObj(owner),
    permissions: permissions || 17,
    shareType: shareType || 0,
    customPermissions: {},
    role: roles[role]
  }
}

const storeOptions = data => {
  let { user, owner } = data
  if (!owner) {
    owner = user
  }

  const storeOpts = {
    state: {
      user: userObj(user)
    },
    modules: {
      Files: {
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename: 'testfile', extension: 'jpg', type: 'file' })
          }
        },
        actions: {
          changeShare: jest.fn()
        }
      }
    },
    getters: {
      isOcis: () => false,
      user: () => userObj(user),
      capabilities: () => {
        return {
          files_sharing: {
            user: {
              expire_date: {
                enabled: true,
                days: 10
              }
            },
            group: {
              expire_date: {
                enabled: true,
                days: 10
              }
            }
          }
        }
      }
    }
  }

  return storeOpts
}

const roles = {
  viewer: {
    description: 'Download, preview and share',
    label: 'Viewer',
    name: 'viewer',
    permissions: ['read', 'share']
  },

  editor: {
    description: 'Download, preview, eidtand share',
    label: 'Editor',
    name: 'editor',
    permissions: ['read', 'write', 'upload', 'share']
  }
}

const displayNames = {
  user0: 'User Zero',
  user1: 'User One',
  user2: 'User Two'
}

const userObj = name => {
  return {
    id: name,
    additionalInfo: null,
    name,
    displayName: displayNames[name],
    displayname: displayNames[name] // FIXME: some values use different property name for display name
  }
}

const getMountOptions = data => {
  const collaborator = buildCollaboratorsArray(
    {
      fileOwner: 'user0',
      username: 'user1'
    },
    1
  )

  return {
    localVue,
    propsData: {
      collaborator
    },
    store: createStore(data),
    stubs: {
      'oc-button': false,
      'oc-icon': true,
      'oc-spinner': true,
      'avatar-image': true,
      'oc-alert': true
    }
  }
}

function getMountedWrapper(data) {
  return mount(Editcollaborator, getMountOptions(data))
}

function getShallowMountedWrapper(data) {
  return shallowMount(Editcollaborator, getMountOptions(data))
}

function createStore(data) {
  return new Vuex.Store(storeOptions(data))
}
