import { createFile, getStore, localVue } from './views.setup.js'
import LocationPicker from '@files/src/views/LocationPicker.vue'
import { mount, RouterLinkStub, shallowMount } from '@vue/test-utils'

const component = { ...LocationPicker, mounted: jest.fn() }

const defaultStubs = {
  'oc-breadcrumb': true,
  'oc-grid': true,
  'oc-button': true,
  'oc-icon': true,
  'oc-table-files': true
}

localVue.prototype.$client.files = {
  list: async () => [],
  move: async () => {}
}
localVue.prototype.$client.publicFiles = {
  list: async () => [],
  move: async () => {}
}

const router = {
  push: jest.fn()
}

const listLoaderStub = 'list-loader-stub'
const breadcrumbStub = 'oc-breadcrumb-stub'
const listInfoStub = 'list-info-stub'
const filesPaginationStub = 'pagination-stub'
const translateStub = 'translate-stub'

const selectors = {
  selectionInfo: '.location-picker-selection-info',
  cancelButton: '#location-picker-btn-cancel',
  confirmButton: '#location-picker-btn-confirm',
  filesView: '#files-view',
  noContentMessage: '#files-location-picker-empty',
  filesTable: '#files-location-picker-table',
  paginationCurrentItem: '.oc-pagination-list-item-current'
}

describe('LocationPicker', () => {
  // the function fires up wile route is changed and quickly sets loading to true
  // so needs to be mocked to get a loading wrapper
  jest.spyOn(LocationPicker.methods, 'navigateToTarget').mockImplementation()

  describe('files app bar', () => {
    it.each([
      { action: 'move', item: '' },
      { action: 'copy', item: '' },
      { action: 'move', item: '/parent/child' },
      { action: 'move', item: '/parent' },
      { action: 'copy', item: '/parent/child' },
      { action: 'copy', item: '/parent' },
      { action: 'random-action', item: '/सिम्पल फोल्डर/टेश्ट' },
      { action: '', item: '/parent/child' },
      { action: true, item: '/parent/child' },
      { action: {}, item: '/parent/child' },
      {
        action: 'random-action',
        item: '/सिम्पल फोल्डर/टेश्ट फोल्डर'
      },
      {
        action: 'random-action',
        item: '/123/456'
      },
      {
        action: 'random-action',
        item: '/😂/🔥'
      }
    ])('should show location picker selection info according to route action and item', input => {
      const wrapper = getShallowWrapper({
        $route: getRoute({ action: input.action, item: input.item })
      })

      const selection = wrapper.find(selectors.selectionInfo)

      expect(selection.exists()).toBeTruthy()
      expect(selection).toMatchSnapshot()
    })
    it.each(['copy', 'move'])(
      'should show current hint according to the current route action',
      action => {
        const wrapper = getShallowWrapper({ $route: getRoute({ action: action }) })

        expect(wrapper).toMatchSnapshot()
      }
    )
    describe('should display breadcrumb with items', () => {
      it.each(['parent/child', 'parent//child', '/parent/child', '/parent/child/'])(
        'if route params context is public',
        input => {
          const route = getRoute({ context: 'public', item: input })
          const wrapper = getShallowWrapper({ $route: route })
          const breadcrumbItems = wrapper.find(breadcrumbStub).props().items

          expect(breadcrumbItems.length).toBe(2)
          expect(breadcrumbItems[0]).toMatchObject({
            index: 0,
            text: 'Public link',
            to: {
              name: route.name,
              params: {
                action: route.params.action,
                item: 'parent'
              },
              query: {
                resource: [route.query.resource]
              }
            }
          })
          expect(breadcrumbItems[1]).toMatchObject({
            index: 2,
            text: 'child'
          })
          expect(breadcrumbItems[1].to).toBeUndefined()
        }
      )
      it.each(['parent/child', 'parent//child', '/parent/child', '/parent/child/'])(
        'if route params context is not public',
        input => {
          const route = getRoute({ item: input })
          const wrapper = getShallowWrapper({ $route: route })
          const breadcrumbItems = wrapper.find(breadcrumbStub).props().items

          expect(breadcrumbItems.length).toBe(3)
          expect(breadcrumbItems[0]).toMatchObject({
            index: 0,
            text: 'All files',
            to: {
              name: route.name,
              params: { action: route.params.action, item: '/' },
              query: {
                resource: [route.query.resource]
              }
            }
          })
          expect(breadcrumbItems[1]).toMatchObject({
            index: 1,
            text: 'parent',
            to: {
              name: route.name,
              params: { action: route.params.action, item: 'parent' },
              query: {
                resource: [route.query.resource]
              }
            }
          })
          expect(breadcrumbItems[2]).toMatchObject({
            index: 2,
            text: 'child'
          })
          expect(breadcrumbItems[2].to).toBeUndefined()
        }
      )
    })
    describe('cancel button', () => {
      it('should show the location picker cancel button', () => {
        const wrapper = getShallowWrapper()
        const cancelButton = wrapper.find(selectors.cancelButton)

        expect(cancelButton.exists()).toBeTruthy()
        expect(cancelButton.find(translateStub).exists()).toBeTruthy()
        expect(cancelButton).toMatchSnapshot()
      })
      it('should call "leaveLocationPicker" method when clicked', async () => {
        const spyLeaveLocationPicker = jest.spyOn(LocationPicker.methods, 'leaveLocationPicker')
        const spyRouterPush = jest.spyOn(router, 'push')

        const wrapper = getMountedWrapper()
        const cancelButton = wrapper.find(selectors.cancelButton)

        await cancelButton.trigger('click')

        expect(spyLeaveLocationPicker).toHaveBeenCalledTimes(1)
        expect(spyLeaveLocationPicker).toHaveBeenCalledWith('/some/item')
        expect(spyRouterPush).toHaveBeenCalledTimes(1)
        expect(spyRouterPush).toHaveBeenCalledWith({
          name: 'files-personal',
          params: { item: '/some/item' }
        })
      })
    })
    describe('should show the location picker confirm button', () => {
      it('should be disabled if no current folder', () => {
        const wrapper = getShallowWrapper()

        const confirmButton = wrapper.find(selectors.confirmButton)

        expect(confirmButton.exists()).toBeTruthy()
        expect(confirmButton.attributes().disabled).toBe('true')
      })
      it('should be disabled if current folder does not have "canCreate" property', () => {
        const route = getRoute()
        const store = createStore({ currentFolder: { canCreate: jest.fn(() => false) } })
        const wrapper = getShallowWrapper({ store: store, $route: route })

        const confirmButton = wrapper.find(selectors.confirmButton)

        expect(confirmButton.exists()).toBeTruthy()
        expect(confirmButton.attributes().disabled).toBe('true')
      })
      it.each(['move', 'copy', 'anything else'])(
        'should set button text according to current action',
        action => {
          const wrapper = getShallowWrapper({
            store: createStore({ currentFolder: { canCreate: jest.fn(() => true) } }),
            $route: getRoute({ action: action })
          })

          const confirmButton = wrapper.find(selectors.confirmButton)

          expect(confirmButton.exists()).toBeTruthy()
          expect(confirmButton.attributes().disabled).toBeUndefined()
          expect(confirmButton).toMatchSnapshot()
        }
      )
      it('should call "confirmAction" method when clicked', async () => {
        const spyConfirmAction = jest.spyOn(LocationPicker.methods, 'confirmAction')
        const wrapper = getMountedWrapper({
          store: createStore({ currentFolder: { canCreate: jest.fn(() => true) } })
        })
        const confirmButton = wrapper.find(selectors.confirmButton)

        await confirmButton.trigger('click')
        expect(spyConfirmAction).toHaveBeenCalledTimes(1)
        // TODO: should we add more tests ???
      })
    })
  })

  describe('files view', () => {
    describe('when the view is still loading', () => {
      const wrapper = getShallowWrapper({ data: { loading: true } })
      const filesView = wrapper.find(selectors.filesView)

      it('should show list loader', () => {
        expect(filesView.find(listLoaderStub).exists()).toBeTruthy()
        expect(filesView.find(listLoaderStub)).toMatchSnapshot()
      })
      it('should not show no content message', () => {
        expect(filesView.find(selectors.noContentMessage).exists()).toBeFalsy()
      })
      it('should not show no location picker table', () => {
        expect(filesView.find(selectors.filesTable).exists()).toBeFalsy()
      })
    })
    describe('when the view is not loading anymore', () => {
      const wrapper = getShallowWrapper({
        data: { loading: false },
        store: createStore({ activeFiles: [] })
      })
      const filesView = wrapper.find(selectors.filesView)
      it('should not show list loader', () => {
        expect(filesView.find(listLoaderStub).exists()).toBeFalsy()
      })
      it('should show no content message if active files length is less than one', () => {
        expect(filesView.find(selectors.noContentMessage).exists()).toBeTruthy()
        expect(filesView.find(selectors.noContentMessage)).toMatchSnapshot()
      })
      describe('when active files length is one or more', () => {
        const expectedResources = [
          { id: 100, name: 'file0.txt', type: 'file', path: '/home/file0.txt' }
        ]
        const store = createStore({ activeFiles: expectedResources })
        const route = getRoute({ resource: '/home/some-resource' })
        const wrapper = getShallowWrapper({
          data: { loading: false },
          store: store,
          $route: route
        })
        const filesView = wrapper.find(selectors.filesView)
        it('should not show the no content message component', () => {
          expect(filesView.find(selectors.noContentMessage).exists()).toBeFalsy()
        })
        it('should show location picker table', () => {
          expect(filesView.find(selectors.filesTable).exists()).toBeTruthy()

          const actualProps = filesView.find(selectors.filesTable).props()
          expect(actualProps.resources).toMatchObject(expectedResources)
          expect(actualProps.targetRoute).toMatchObject({
            name: route.name,
            query: {
              resource: [route.query.resource]
            },
            params: { action: route.params.action }
          })
          expect(actualProps.disabled).toMatchObject([expectedResources[0].id])
        })
        it.each([
          {
            id: 100,
            name: 'file0.txt',
            type: 'file',
            path: '/home/file0.txt',
            expectedState: [100]
          },
          {
            id: 101,
            name: 'some-resource',
            type: 'file',
            path: '/home/some-resource',
            expectedState: [101]
          },
          {
            id: 102,
            name: 'some-resource',
            type: 'folder',
            path: '/home/some-resource',
            expectedState: [102]
          },
          {
            id: 103,
            name: 'simple-folder',
            type: 'folder',
            path: '/simple-folder',
            expectedState: []
          }
        ])(
          'should set location item as disabled if not a folder or if its path is included in the active resource',
          input => {
            const store = createStore({ activeFiles: [input] })
            const route = getRoute({ resource: '/home/some-resource' })
            const wrapper = getShallowWrapper({
              data: { loading: false },
              store: store,
              $route: route
            })

            const filesView = wrapper.find(selectors.filesView)
            expect(filesView.find(selectors.filesTable).props().disabled).toMatchObject(
              input.expectedState
            )
          }
        )

        it('should show pagination if there is one or more pages', () => {
          const expectedResources = [createFile({ id: 100 }), createFile({ id: 101 })]
          const store = createStore({
            pages: 1,
            activeFiles: expectedResources,
            totalFilesCount: { files: 1000, folders: 1000 },
            totalFilesSize: 100000,
            currentPage: 58
          })
          const route = getRoute({ resource: '/home/some-resource' })
          const wrapper = getMountedWrapper({
            data: { loading: false },
            store: store,
            $route: route
          })
          const filesView = wrapper.find(selectors.filesView)
          const tablePagination = filesView.find(filesPaginationStub)

          expect(tablePagination.exists()).toBeTruthy()
        })

        it('should load list info component with correct prop values', () => {
          const expectedResources = [createFile({ id: 100 }), createFile({ id: 101 })]
          const store = createStore({
            activeFiles: expectedResources,
            totalFilesCount: { files: 1, folders: 1 },
            totalFilesSize: 100
          })
          const route = getRoute({ resource: '/home/some-resource' })
          const wrapper = getMountedWrapper({
            data: { loading: false },
            store: store,
            $route: route
          })
          const filesView = wrapper.find(selectors.filesView)
          const listInfo = filesView.find(listInfoStub)

          expect(listInfo.exists()).toBeTruthy()
          expect(listInfo.props()).toMatchObject({
            files: store.getters['Files/totalFilesCount'].files,
            folders: store.getters['Files/totalFilesCount'].folders,
            size: store.getters['Files/totalFilesSize']
          })
        })
      })
    })
  })

  function getRoute({
    name = 'some-name',
    path = '/some/path',
    action = 'move',
    context = null,
    item = '/some/item',
    resource = 'some-resource'
  } = {}) {
    return {
      name: name,
      path: path,
      params: {
        action: action,
        item: item,
        context: context
      },
      query: {
        resource: resource
      }
    }
  }

  function createStore({
    pages = null,
    activeFiles = [],
    publicLinkPassword = null,
    currentFolder = null,
    totalFilesCount = { files: null, folders: null },
    totalFilesSize = null,
    currentPage = null
  } = {}) {
    return getStore({
      pages: pages,
      activeFiles: activeFiles,
      publicLinkPassword: publicLinkPassword,
      currentPage: currentPage,
      currentFolder: currentFolder,
      totalFilesSize: totalFilesSize,
      totalFilesCount: totalFilesCount
    })
  }

  function mountOptions(store, $route, data, stubs = defaultStubs) {
    return {
      localVue,
      store: store,
      stubs,
      mocks: {
        $route,
        $router: router
      },
      data() {
        return data
      }
    }
  }

  function getShallowWrapper({ store = createStore(), $route = getRoute(), data = {} } = {}) {
    return shallowMount(component, mountOptions(store, $route, data))
  }

  function getMountedWrapper({ store = createStore(), $route = getRoute(), data = {} } = {}) {
    return mount(
      component,
      mountOptions(store, $route, data, {
        'oc-button': false,
        'list-info': true,
        pagination: true,
        RouterLink: RouterLinkStub
      })
    )
  }
})
