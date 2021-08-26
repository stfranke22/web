import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, mount } from '@vue/test-utils'
import FileInfo from '@files/src/components/SideBar/FileInfo.vue'

import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const filesPersonalRoute = { name: 'files-personal' }
const filesPublicRoute = { name: 'files-public-list' }

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
    propsData: {
      isContentDisplayed: true
    }
  }
  return mount(FileInfo, mountOptions)
}

const selectors = {
  fileNameItem: '.file_info h2',
  favoritesButton: '.file_info button.file_info__favorite',
  fileDescription: '.file_info__body div'
}

describe('SideBar', () => {
  describe('when the user on files personal route', () => {
    it('should show file name', () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const fileName = wrapper.find(selectors.fileNameItem)
      expect(fileName.isVisible()).toBeTruthy()
      expect(fileName.text()).toBe('testfile.jpg')
    })

    it('should show favorites button in files personal page', () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const favoritesButton = wrapper.find(selectors.favoritesButton)
      expect(favoritesButton.exists()).toBeTruthy()
    })

    it('should not show favorites button in public link page', () => {
      const wrapper = getWrapper(filesPublicRoute, {
        filename: 'testfile',
        extension: 'jpg',
        publicLink: true
      })

      const favoritesButton = wrapper.find(selectors.favoritesButton)
      expect(favoritesButton.exists()).toBeFalsy()
    })

    it('should call the favorite trigger when button is clicked', async () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const favoriteTrigger = jest.fn()
      wrapper.vm.markFavorite = favoriteTrigger
      const favoritesButton = wrapper.find(selectors.favoritesButton)
      await favoritesButton.trigger('click.native.stop')
      expect(favoriteTrigger).toHaveBeenCalledTimes(1)
    })

    it('should show file size and modified date', () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'jpg'
      })

      const fileDescription = wrapper.find(selectors.fileDescription)
      expect(fileDescription.exists()).toBeTruthy()
      const description = fileDescription.text()
      const fileSize = description.split(',')[0].trim()
      const fileModified = description.split(',')[1].trim()

      expect(fileSize).toBe('163 B')
      expect(fileModified).toBe('2 days ago')
    })
  })
})

function getResource({ filename, extension, type }) {
  // convert date from 2 days ago to format 'Mon, 12 Jul 2021 11:04:33 GMT'
  const d = new Date()
  d.setDate(d.getDate() - 2)
  const mdate = d.toGMTString()
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
          currentFolder: { path: '' }
        },
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename, extension, type })
          }
        },
        actions: {
          markFavorite: jest.fn()
        }
      }
    },
    getters: {
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
