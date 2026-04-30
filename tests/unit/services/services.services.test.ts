import * as servicesService from '../../../src/modules/services/servicesServices'
import { db } from '../../../src/db/knex'

jest.mock('../../../src/db/knex', () => ({
  db: jest.fn(),
}))

describe('Services Service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getServices', () => {
    it('should return services', async () => {
      const mockRows = [{ id: 1, name: 'Test Service' }]

      const selectMock = jest.fn().mockReturnThis()
      const orderByMock = jest.fn().mockResolvedValue(mockRows)

      ;(db as any).mockReturnValue({
        select: selectMock,
        orderBy: orderByMock,
      })

      const result = await servicesService.getServices()

      expect(result).toEqual(mockRows)
    })
  })

  describe('deleteService', () => {
    it('should delete service', async () => {
      const delMock = jest.fn()

      ;(db as any).mockReturnValue({
        where: () => ({
          del: delMock,
        }),
      })

      await servicesService.deleteService(1)

      expect(delMock).toHaveBeenCalled()
    })
  })

  describe('createService', () => {
    it('should create service', async () => {
      const mockService = { id: 1, name: 'Service' }

      const returningMock = jest.fn().mockResolvedValue([mockService])

      ;(db as any).mockReturnValue({
        insert: () => ({
          returning: returningMock,
        }),
      })

      const result = await servicesService.createService({
        business_id: 1,
        name: 'Service',
        schedule: ['10:00'],
      })

      expect(result).toEqual(mockService)
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
  })
})