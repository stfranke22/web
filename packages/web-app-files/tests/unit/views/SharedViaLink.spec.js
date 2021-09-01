import { shallowMount, mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { getStore, localVue, createFile } from './views.setup.js'
import SharedViaLink from '@files/src/views/SharedViaLink.vue'

const $route = {
  params: {
    fileId: '2147491323'
  },
  meta: {
    title: 'Resolving private link'
  }
}

const activeFiles = [createFile({ id: 1234, type: 'file' })]

localVue.prototype.$client.requests = {
  ocs: jest.fn(() =>
    Promise.resolve({
      status: 200,
      json: jest.fn(() =>
        Promise.resolve({
          ocs: {
            data: activeFiles
          }
        })
      )
    })
  )
}

const stubs = {
  'router-link': true,
  'no-content-message': true,
  pagination: true,
  'oc-table-files': true,
  'context-actions': true,
  'list-info': true
}

const selectors = {
  listLoader: 'list-loader-stub',
  noContentMessage: '#files-shared-via-link-empty',
  ocTableFiles: '#files-shared-via-link-table',
  contextActions: 'context-actions-stub',
  listInfo: 'list-info-stub'
}

describe('SharedViaLink view', () => {
  jest
    .spyOn(SharedViaLink.mixins[3].methods, '$_filesListPagination_updateCurrentPage')
    .mockImplementation()
  const spyAdjustTableHeaderPosition = jest.spyOn(
    SharedViaLink.mixins[1].methods,
    'adjustTableHeaderPosition'
  )
  const spyShowDefaultPanel = jest
    .spyOn(SharedViaLink.mixins[4].methods, '$_mountSideBar_showDefaultPanel')
    .mockImplementation()
  const spyTriggerDefaultAction = jest
    .spyOn(SharedViaLink.mixins[0].methods, '$_fileActions_triggerDefaultAction')
    .mockImplementation()
  const spyLoadResources = jest.spyOn(SharedViaLink.methods, 'loadResources')
  const spyRowMounted = jest.spyOn(SharedViaLink.methods, 'rowMounted')

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the page has loaded successfully', () => {
    beforeEach(async () => {
      getShallowWrapper()
      await flushPromises()
    })

    it('should load the resources', () => {
      expect(spyLoadResources).toHaveBeenCalledTimes(1)
    })
    it('should adjust the table header position', () => {
      expect(spyAdjustTableHeaderPosition).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the view is still loading', () => {
    it('should show list-loader component', () => {
      const wrapper = getShallowWrapper()

      expect(wrapper.find(selectors.listLoader).exists()).toBeTruthy()
    })
  })

  describe('when the view is not loading anymore', () => {
    it('should not show list-loader component', async () => {
      const wrapper = getShallowWrapper()
      await flushPromises()

      expect(wrapper.find(selectors.listLoader).exists()).toBeFalsy()
    })

    describe('when there are no files to be displayed', () => {
      let wrapper
      beforeEach(async () => {
        stubs['no-content-message'] = false
        wrapper = getWrapper()
        await flushPromises()
      })

      it('should show no-content-message component', () => {
        const noContentMessage = wrapper.find(selectors.noContentMessage)

        expect(noContentMessage.exists()).toBeTruthy()
        expect(noContentMessage).toMatchSnapshot()
      })
      it('should not show oc-table-files component', () => {
        expect(wrapper.find(selectors.ocTableFiles).exists()).toBeFalsy()
      })
    })

    describe('when there are one or more files to be displayed', () => {
      let wrapper
      beforeEach(async () => {
        stubs['oc-table-files'] = false
        wrapper = getWrapper(activeFiles)
        await flushPromises()
      })

      it('should not show no-content-message component', () => {
        expect(wrapper.find(selectors.noContentMessage).exists()).toBeFalsy()
      })
      it('should show oc-table-files component with props', () => {
        const ocTableFiles = wrapper.find(selectors.ocTableFiles)

        expect(ocTableFiles.exists()).toBeTruthy()
        expect(ocTableFiles.props().resources).toMatchObject(activeFiles)
        expect(ocTableFiles.props().areThumbnailsDisplayed).toBe(false)
        expect(ocTableFiles.props().headerPosition).toBe(0)
        expect(ocTableFiles.props().targetRoute).toMatchObject({ name: 'files-personal' })
      })
      it('should set props on context-actions component', () => {
        const contextActions = wrapper.find(selectors.contextActions)

        expect(contextActions.props().item).toMatchObject(activeFiles[0])
      })
      it('should set props on list-info component', () => {
        const listInfo = wrapper.find(selectors.listInfo)

        expect(listInfo.props().files).toEqual(activeFiles.length)
        expect(listInfo.props().folders).toEqual(0)
      })
      it('should trigger showing the sidebar when a "showDetails" event gets emitted', () => {
        const ocTableFiles = wrapper.find(selectors.ocTableFiles)

        expect(spyShowDefaultPanel).toHaveBeenCalledTimes(0)

        ocTableFiles.vm.$emit('showDetails')

        expect(spyShowDefaultPanel).toHaveBeenCalledTimes(1)
      })
      it('should trigger the default action when a "fileClick" event gets emitted', () => {
        const ocTableFiles = wrapper.find(selectors.ocTableFiles)

        expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(0)

        ocTableFiles.vm.$emit('fileClick')

        expect(spyTriggerDefaultAction).toHaveBeenCalledTimes(1)
      })
      it('should lazily load previews when a "rowMounted" event gets emitted', () => {
        expect(spyRowMounted).toHaveBeenCalledTimes(activeFiles.length)
      })
    })
  })
})

function getWrapper(files = []) {
  return mount(SharedViaLink, {
    localVue,
    store: createStore(files),
    stubs,
    mocks: {
      $route
    }
  })
}

function getShallowWrapper(files = []) {
  return shallowMount(SharedViaLink, {
    localVue,
    store: createStore(files),
    mocks: {
      $route
    }
  })
}

function createStore(activeFiles) {
  return getStore({
    activeFiles,
    totalFilesCount: { files: activeFiles.length, folders: 0 }
  })
}
