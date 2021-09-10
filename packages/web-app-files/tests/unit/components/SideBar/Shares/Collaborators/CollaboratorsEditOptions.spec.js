import CollaboratorsEditOptions from '@files/src/components/SideBar/Shares/Collaborators/CollaboratorsEditOptions.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueSelect from 'vue-select'
import RoleItem from '@files/src/components/SideBar/Shared/RoleItem.vue'
import { DateTime } from 'luxon'

import { roles } from '@files/tests/__fixtures__/collaborators.js'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(VueSelect)
localVue.use(RoleItem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  roleLabel: 'label',
  roleSelect: '.files-collaborators-role-button-wrapper',
  expirationDate: '#files-collaborators-collaborator-expiration-input'
}

describe('Collaborator Edit Options', () => {
  describe('Role Selection', () => {
    let wrapper = getMountedWrapper({
      user: 'user0'
    })

    it('should show the label for the role', () => {
      const roleLabel = wrapper.find(selectors.roleLabel)

      expect(roleLabel.exists()).toBeTruthy()

      expect(roleLabel.text()).toMatchSnapshot()
    })

    it('should render default role in the select input if no value is set to the role prop', () => {
      const roleSelect = wrapper.findComponent(VueSelect)

      expect(roleSelect.exists()).toBeTruthy()
      expect(roleSelect.props('options')).toMatchObject([
        roles.viewer,
        roles.editor,
        roles.advancedPermissions
      ])

      expect(roleSelect.props('value')).toMatchObject(roles.viewer)
    })

    it('should set the role according to the provided prop', () => {
      wrapper = getMountedWrapper({
        user: 'user0',
        role: 'editor'
      })

      const roleSelect = wrapper.findComponent(VueSelect)

      expect(roleSelect.props('value')).toMatchObject(roles.editor)
    })

    it('should change the role when new role is selected', async () => {
      wrapper = getMountedWrapper({
        user: 'user0',
        role: 'viewer'
      })

      const roleSelect = wrapper.findComponent(VueSelect)
      expect(roleSelect.props('value')).toMatchObject(roles.viewer)
      expect(wrapper.vm.selectedRole).toEqual(roles.viewer)

      await roleSelect.vm.select(roles.editor)
      expect(wrapper.vm.selectedRole).toEqual(roles.editor)
    })
  })

  describe('Expire Date picker', () => {
    it('should not show expiry date input when disabled', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0',
        shareCapabilities: {
          user: {},
          group: {}
        }
      })

      const expireDate = wrapper.find(selectors.expirationDate)
      expect(expireDate.exists()).toBeFalsy()
    })

    it('should render expiration date picker when the expiration date is enabled', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0'
      })

      const expireDate = wrapper.find(selectors.expirationDate)

      expect(expireDate.exists()).toBeTruthy()
      expect(expireDate.props()).toMatchObject({
        label: 'Expiration date',
        date: null,
        minDatetime: DateTime.now() // min date should be one day ahead of current date
          .plus({ days: 1 })
          .endOf('day')
          .toISO()
      })
    })

    it('should set date field as required when expiration date is enforced', () => {
      const wrapper = getShallowMountedWrapper({
        user: 'user0',
        shareCapabilities: {
          user: {
            expire_date: {
              enabled: true,
              enforced: true,
              days: 5
            }
          },
          group: {
            expire_date: {
              enabled: true
            }
          }
        }
      })

      const expireDate = wrapper.find(selectors.expirationDate)

      expect(expireDate.exists()).toBeTruthy()
      expect(expireDate.props()).toMatchObject({
        label: 'Expiration date (required)',
        date: null,
        minDatetime: DateTime.now() // min date should be one day ahead of current date
          .plus({ days: 1 })
          .endOf('day')
          .toISO(),
        maxDatetime: DateTime.now()
          .plus({ days: 5 })
          .endOf('day')
          .toISO()
      })
    })

    it('should set the expiration date according to the expirationDate prop passed to the component', () => {
      const expirationDate = new Date()
      // set expiration date 10 days into the future
      expirationDate.setDate(expirationDate.getDate() + 10)
      // set expected expire time to the end of the day
      expirationDate.setHours(23, 59, 59, 999)
      // FIXME: timezone offset is manually added in the code
      expirationDate.setMinutes(expirationDate.getMinutes() + expirationDate.getTimezoneOffset())

      const wrapper = getMountedWrapper({
        user: 'user0',
        expirationDate,
        type: 'user'
      })

      const expectedDate = DateTime.now()
        .plus({ days: 10 })
        .endOf('day')
        .toISO()

      const expireDate = wrapper.find(selectors.expirationDate)
      expect(expireDate.exists()).toBeTruthy()

      expect(wrapper.vm.enteredExpirationDate).toBe(expectedDate)
    })
  })
})

function storeOptions(data) {
  let { user, shareCapabilities } = data

  if (!shareCapabilities) {
    shareCapabilities = {
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

  return {
    state: {
      user: userObj(user)
    },
    modules: {
      Files: {
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return { type: 'file' }
          }
        }
      }
    },
    getters: {
      isOcis: () => false,
      user: () => userObj(user),
      capabilities: () => {
        return {
          files_sharing: shareCapabilities
        }
      }
    }
  }
}

function userObj(name) {
  const displayNames = {
    user0: 'User Zero',
    user1: 'User One',
    user2: 'User Two'
  }

  return {
    id: name,
    additionalInfo: null,
    name,
    displayName: displayNames[name]
  }
}

function getMountOptions(data) {
  const { expirationDate, role, permissions, type } = data

  return {
    localVue,
    store: createStore(data),
    propsData: {
      expirationDate,
      existingRole: roles[role],
      collaboratorsPermissions: permissions,
      existingCollaboratorType: type
    },
    stubs: {
      'vue-select': VueSelect,
      'oc-datepicker': true
    }
  }
}

function getMountedWrapper(data) {
  return mount(CollaboratorsEditOptions, getMountOptions(data))
}

function getShallowMountedWrapper(data) {
  return shallowMount(CollaboratorsEditOptions, getMountOptions(data))
}

function createStore(data) {
  return new Vuex.Store(storeOptions(data))
}
