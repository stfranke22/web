import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import RoleItem from '@files/src/components/SideBar/Shared/RoleItem'

const localVue = createLocalVue()

const selectors = {
  roleItem: '.roles-select-role-item',
  roleLabel: '.roles-select-role-item-label',
  roleDescription: '.roles-select-role-item-description'
}

const filesPersonalRoute = { name: 'files-personal' }

function getWrapper(route, role) {
  return shallowMount(RoleItem, {
    localVue,
    stubs: stubs,
    mocks: {
      $route: route
    },
    propsData: {
      role
    }
  })
}

describe('RoleItem', () => {
  const role = {
    id: 'dfdd3eddde',
    label: 'Viewer',
    description: 'Download, Preview and Share'
  }
  const wrapper = getWrapper(filesPersonalRoute, role)

  it('should show the roleItem', () => {
    const roleItem = wrapper.find(selectors.roleItem)
    expect(roleItem.exists()).toBeTruthy()
  })

  it('should show role label', () => {
    const roleLabel = wrapper.find(selectors.roleLabel)
    expect(roleLabel.exists()).toBeTruthy()
    expect(roleLabel.text()).toBe('Viewer')
  })

  it('should show role description', () => {
    const roleDescription = wrapper.find(selectors.roleDescription)
    expect(roleDescription.exists()).toBeTruthy()
    expect(roleDescription.text()).toBe('Download, Preview and Share')
  })
})
