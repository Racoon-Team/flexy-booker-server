import * as servicesController from '../../../src/modules/services/servicesController'
import * as servicesService from '../../../src/modules/services/servicesServices'

jest.mock('../../../src/modules/services/servicesServices')

describe('Services Controller', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = {}
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }

    jest.spyOn(console, 'error').mockImplementation(() => {})

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getServices', () => {
    it('should return services', async () => {
      const mockServices = [{ id: 1, name: 'Service' }]

      ;(servicesService.getServices as jest.Mock).mockResolvedValue(mockServices)

      await servicesController.getServices(req, res)

      expect(res.json).toHaveBeenCalledWith(mockServices)
    })

    it('should return 500 on error', async () => {
      ;(servicesService.getServices as jest.Mock).mockRejectedValue(new Error())

      await servicesController.getServices(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Error getting services' })
    })
  })

  describe('createService', () => {
    it('should create service', async () => {
      req.body = { name: 'Service', schedule: ['10:00'] }

      const mockService = { id: 1 }

      ;(servicesService.createService as jest.Mock).mockResolvedValue(mockService)

      await servicesController.createService(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockService)
    })

    it('should return 400 on error', async () => {
      req.body = {}

      ;(servicesService.createService as jest.Mock).mockRejectedValue(
        new Error('Service name is required'),
      )

      await servicesController.createService(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Service name is required',
      })
    })
  })

  describe('deleteService', () => {
    it('should delete service', async () => {
      req.params = { id: '1' }

      ;(servicesService.deleteService as jest.Mock).mockResolvedValue(true)

      await servicesController.deleteService(req, res)

      expect(res.json).toHaveBeenCalledWith({
        message: 'Service deleted successfully',
      })
    })

    it('should return 500 on error', async () => {
      req.params = { id: '1' }

      ;(servicesService.deleteService as jest.Mock).mockRejectedValue(new Error())

      await servicesController.deleteService(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error deleting service',
      })
    })
  })
})