import {
  checkRoute,
  isAnySharedWithRoute,
  isFavoritesRoute,
  isPersonalRoute,
  isPublicFilesRoute,
  isPublicPage,
  isSharedWithMeRoute,
  isSharedWithOthersRoute,
  isTrashbinRoute
} from '@files/src/helpers/route.js'

describe('route', () => {
  describe('checkRoute', () => {
    it('should return "true" if given "routes" array contains given "currentRoute"', () => {
      expect(checkRoute(['some-route'], 'some-route')).toBeTruthy()
    })
    it('should return "false" if given "routes" array does not contains given "currentRoute"', () => {
      expect(checkRoute(['some-route'], 'another-route')).toBeFalsy()
    })
  })

  describe('isPersonalRoute', () => {
    it('should return "true" if given route name is "files-personal"', () => {
      expect(isPersonalRoute({ name: 'files-personal' })).toBeTruthy()
    })
    it('should return "false" if given route name is not "files-personal"', () => {
      expect(isPersonalRoute({ name: 'files-favorites' })).toBeFalsy()
    })
  })

  describe('isFavoritesRoute', () => {
    it('should return "true" if given route name is "files-favorites"', () => {
      expect(isFavoritesRoute({ name: 'files-favorites' })).toBeTruthy()
    })
    it('should return "false" if given route name is not "files-favorites"', () => {
      expect(isFavoritesRoute({ name: 'files-personal' })).toBeFalsy()
    })
  })

  describe('isTrashbinRoute', () => {
    it('should return "true" if given route name is "files-trashbin"', () => {
      expect(isTrashbinRoute({ name: 'files-trashbin' })).toBeTruthy()
    })
    it('should return "false" if given route name is not "files-trashbin"', () => {
      expect(isTrashbinRoute({ name: 'files-personal' })).toBeFalsy()
    })
  })

  describe('isSharedWithMeRoute', () => {
    it('should return "true" if given route name is "files-shared-with-me"', () => {
      expect(isSharedWithMeRoute({ name: 'files-shared-with-me' })).toBeTruthy()
    })
    it('should return "false" if given route name is not "files-shared-with-me"', () => {
      expect(isSharedWithMeRoute({ name: 'files-personal' })).toBeFalsy()
    })
  })

  describe('isSharedWithOthersRoute', () => {
    it('should return "true" if given route name is "files-shared-with-others"', () => {
      expect(isSharedWithOthersRoute({ name: 'files-shared-with-others' })).toBeTruthy()
    })
    it('should return "false" if given route name is not "files-shared-with-others"', () => {
      expect(isSharedWithOthersRoute({ name: 'files-shared-with-me' })).toBeFalsy()
    })
  })

  describe('isAnySharedWithRoute', () => {
    it('should return "false" if given route is not "SharedWithMe" and "SharedWithOthers"', () => {
      expect(isAnySharedWithRoute({ name: 'files-personal' })).toBeFalsy()
    })
    it('should return "true" if given route is "SharedWithMe"', () => {
      expect(isAnySharedWithRoute({ name: 'files-shared-with-me' })).toBeTruthy()
    })
    it('should return "true" if given route is "SharedWithOthers"', () => {
      expect(isAnySharedWithRoute({ name: 'files-shared-with-others' })).toBeTruthy()
    })
  })

  describe('isPublicFilesRoute', () => {
    it('should return "true" if given route name is "files-public-list"', () => {
      expect(isPublicFilesRoute({ name: 'files-public-list' })).toBeTruthy()
    })
    it('should return "false" if given route name is not "files-public-list"', () => {
      expect(isPublicFilesRoute({ name: 'files-shared-with-others' })).toBeFalsy()
    })
  })

  describe('isPublicPage', () => {
    it('should return "false" if given route has no meta information', () => {
      expect(isPublicPage({ name: 'files-public-list' })).toBeFalsy()
    })
    it('should return "false" if given route meta auth is "true"', () => {
      expect(isPublicPage({ meta: { auth: true } })).toBeFalsy()
    })
    it('should return "true" if given route meta auth is "false"', () => {
      expect(isPublicPage({ meta: { auth: false } })).toBeTruthy()
    })
  })
})
