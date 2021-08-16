/* eslint-disable jest/no-conditional-expect */
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, mount } from '@vue/test-utils'
import SideBar from '@files/src/components/SideBar/SideBar.vue'

import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const filesPersonalRoute = { name: 'files-personal' }

const getSideBarComponent = function(name) {
  const component = localVue.component(name + '-sidebar-item', {
    render: function(createElement) {
      return createElement('div', name + ' content')
    }
  })
  component.title = () => name
  component.data = () => {
    return {
      loading: false
    }
  }
  return component
}

const sideBars = [
  () => {
    return {
      app: 'details-item',
      enabled: true,
      icon: 'info_outline',
      component: getSideBarComponent('Details'),
      default: true
    }
  },
  () => {
    return {
      app: 'actions-item',
      enabled: true,
      icon: 'slideshow',
      component: getSideBarComponent('Actions')
    }
  },
  () => {
    return {
      app: 'sharing-item',
      enabled: true,
      icon: 'group',
      component: getSideBarComponent('People')
    }
  }
]

function getWrapper(
  route,
  { filename = 'testfile', extension, type = 'file', publicLink = false }
) {
  const mountStubs = { ...stubs, 'oc-button': false }
  const mountOptions = {
    localVue,
    store: createStore({}, filename, extension, type),
    stubs: mountStubs,
    mocks: {
      $route: route,
      publicPage: () => publicLink
    },
    directives: {
      'click-outside': jest.fn()
    }
  }
  return mount(SideBar, mountOptions)
}

const selectors = {
  fileInfo: '.file_info .file_info__body',
  panelHeader: '.sidebar-panel__header .header__title',
  panelNavigation: '.sidebar-panel__navigation',
  panelNavigationButton: '.sidebar-panel__navigation button',
  panelBody: '.sidebar-panel__body',
  actionButton: '#sidebar-panel-actions-item-select',
  peopleButton: '#sidebar-panel-sharing-item-select'
}

const panels = {
  Details: {
    selector: '#sidebar-panel-details-item',
    default: true
  },
  Actions: {
    selector: '#sidebar-panel-actions-item'
  },
  People: {
    selector: '#sidebar-panel-sharing-item'
  }
}

describe('SideBar', () => {
  describe('when user on personal route', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    const allPanels = ['Details', 'Actions', 'People']
    const nonDefaultPanels = ['Actions', 'People']

    it.each(allPanels)('should show fileinfo on all panels', expectedPanel => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const panel = wrapper.find(panels[expectedPanel].selector)
      expect(panel.exists()).toBeTruthy()

      const fileInfo = panel.find(selectors.fileInfo)
      expect(fileInfo.exists()).toBeTruthy()
    })

    it.each(nonDefaultPanels)('should not show navigation on non default panels', expectedPanel => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const panel = wrapper.find(panels[expectedPanel].selector)
      expect(panel.exists()).toBeTruthy()

      const navigation = panel.find(selectors.panelNavigation)
      expect(navigation.exists()).toBeFalsy()
    })

    it.each(nonDefaultPanels)('should show empty body for non-default panels', expectedPanel => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const panel = wrapper.find(panels[expectedPanel].selector)
      expect(panel.exists()).toBeTruthy()

      const body = panel.find(selectors.panelBody)
      expect(body.exists()).toBeTruthy()
      expect(body.text()).toBe('')
    })

    it('should show the body of default panel', () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const panel = wrapper.find(panels.Details.selector)
      expect(panel.exists()).toBeTruthy()

      const body = panel.find(selectors.panelBody)
      expect(body.exists()).toBeTruthy()
      expect(body.text()).toContain('Details content')
    })

    it('should show navigation on default panel', () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const panel = wrapper.find(panels.Details.selector)
      expect(panel.exists()).toBeTruthy()

      const navigation = panel.find(selectors.panelNavigation)
      expect(navigation.exists()).toBeTruthy()

      const navigationButtons = panel.findAll(selectors.panelNavigationButton)
      expect(navigationButtons.length).toBe(2)

      const navigationItems = ['Actions', 'People']
      for (let i = 0; i < 2; i++) {
        const buttonName = navigationButtons.at(i).text()
        expect(navigationItems).toContain(buttonName)
      }
    })

    it('should be able to open a panel', async () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const buttons = {
        Actions: selectors.actionButton,
        People: selectors.peopleButton
      }

      const detailPanel = wrapper.find(panels.Details.selector)
      expect(detailPanel.exists()).toBeTruthy()
      expect(detailPanel.classes()).toContain('is-active')

      for (const key in buttons) {
        const button = wrapper.find(buttons[key])
        expect(button.exists()).toBeTruthy()

        let panel = wrapper.find(panels[key].selector)
        expect(panel.exists()).toBeTruthy()

        const body = panel.find(selectors.panelBody)
        expect(body.text()).toBe('')

        expect(panel.classes()).not.toContain('is-active')

        await button.trigger('click')

        panel = wrapper.find(panels[key].selector)
        expect(panel.classes()).toContain('is-active')
        expect(body.text()).toContain(key + ' content')
      }
    })
  })
})

function getResource({ filename, extension, type }) {
  // convert date to format 'Mon, 12 Jul 2021 11:04:33 GMT'
  const d = new Date()
  d.setDate(d.getDate() - 3)
  const parts = d.toString().split(' ')
  const mdate = `${parts[0]}, ${parts[2]} ${parts[1]} ${parts[3]} ${parts[4]} GMT`
  return {
    id: '4',
    fileId: '4',
    icon: type,
    name: type === 'file' ? `${filename}.${extension}` : filename,
    extension: extension,
    path: type === 'file' ? `/${filename}.${extension}` : `/${filename}`,
    type,
    mdate,
    size: '163',
    indicators: [],
    permissions: 'RDNVW',
    starred: false,
    etag: '"89128c0e8122002db57bd19c9ec33004"',
    shareTypes: [],
    ownerDisplayName: 'user1',
    ownerId: 'user1',
    canDownload: () => true,
    isReceivedShare: () => true,
    canBeDeleted: () => true,
    canRename: () => true
  }
}

function createStore(state, filename, extension, type = 'file') {
  return new Vuex.Store({
    modules: {
      Files: {
        state: {
          ...state,
          appSidebarActivePanel: null
        },
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename, extension, type })
          },
          currentFolder: () => '/',
          versions: () => []
        },
        actions: {
          markFavorite: jest.fn()
        },
        mutations: {
          SET_APP_SIDEBAR_ACTIVE_PANEL(state, panel) {
            state.appSidebarActivePanel = panel
          }
        }
      }
    },
    getters: {
      fileSideBars: () => sideBars,
      capabilities: () => {
        return {
          files: {
            favorites: true
          }
        }
      }
    }
  })
}
