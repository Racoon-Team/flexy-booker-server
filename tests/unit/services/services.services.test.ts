import * as servicesService from '../../../src/modules/services/servicesServices'
import * as servicesRepository from '../../../src/modules/services/servicesRepository'

jest.mock('../../../src/modules/services/servicesRepository')

describe('Services Service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getServices', () => {
    it('should return services', async () => {
      const mockRows = [{ id: 1, name: 'Test Service' }]
      ;(servicesRepository.getServices as jest.Mock).mockResolvedValue({ rows: mockRows })

      const result = await servicesService.getServices()

      expect(result).toEqual(mockRows)
    })

    it('should pass search parameter to repository', async () => {
      ;(servicesRepository.getServices as jest.Mock).mockResolvedValue({ rows: [] })

      await servicesService.getServices('test')

      expect(servicesRepository.getServices).toHaveBeenCalledWith('test')
    })
  })

  describe('deleteService', () => {
    it('should delete service', async () => {
      ;(servicesRepository.deleteService as jest.Mock).mockResolvedValue(undefined)

      await servicesService.deleteService(1)

      expect(servicesRepository.deleteService).toHaveBeenCalledWith(1)
    })
  })

  describe('createService', () => {
    it('should create service', async () => {
      const mockService = { id: 1, name: 'Service' }
      ;(servicesRepository.createService as jest.Mock).mockResolvedValue(mockService)

      const result = await servicesService.createService({
        business_id: 1,
        name: 'Service',
        schedule: ['10:00'],
      })

      expect(result).toEqual(mockService)
    })

    it('should throw error if business_id is missing', async () => {
      await expect(
        servicesService.createService({
          business_id: 0,
          name: 'Service',
          schedule: ['10:00'],
        }),
      ).rejects.toThrow('Business ID is required')
    })

    it('should throw error if name is empty', async () => {
      await expect(
        servicesService.createService({
          business_id: 1,
          name: '',
          schedule: ['10:00'],
        }),
      ).rejects.toThrow('Service name is required')
    })

    it('should throw error if schedule is empty', async () => {
      await expect(
        servicesService.createService({
          business_id: 1,
          name: 'Service',
          schedule: [],
        }),
      ).rejects.toThrow('At least one schedule slot is required')
    })

    it('should throw error if price is not positive', async () => {
      await expect(
        servicesService.createService({
          business_id: 1,
          name: 'Service',
          schedule: ['10:00'],
          price: 0,
        }),
      ).rejects.toThrow('Too small: expected number to be >0')
    })
  })

  describe('updateService', () => {
    it('should update service', async () => {
      const mockService = { id: 1, name: 'Updated Service' }
      ;(servicesRepository.updateService as jest.Mock).mockResolvedValue(mockService)

      const result = await servicesService.updateService(1, {
        name: 'Updated Service',
        schedule: ['10:00'],
      })

      expect(result).toEqual(mockService)
    })

    it('should throw error if name is empty', async () => {
      await expect(
        servicesService.updateService(1, {
          name: '',
          schedule: ['10:00'],
        }),
      ).rejects.toThrow('Service name is required')
    })

    it('should throw error if schedule is empty', async () => {
      await expect(
        servicesService.updateService(1, {
          name: 'Service',
          schedule: [],
        }),
      ).rejects.toThrow('At least one schedule slot is required')
    })

    it('should throw error if price is not positive', async () => {
      await expect(
        servicesService.updateService(1, {
          name: 'Service',
          schedule: ['10:00'],
          price: -1,
        }),
      ).rejects.toThrow('Too small: expected number to be >0')
    })
  })
})
