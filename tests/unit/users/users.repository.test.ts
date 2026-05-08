import * as usersRepository from '../../../src/modules/users/usersRepository'
import { db } from '../../../src/db/knex'

jest.mock('../../../src/db/knex', () => ({
  db: jest.fn(),
}))

describe('Users Repository', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should insert user and return rows', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@test.com' }
      const returningMock = jest.fn().mockResolvedValue([mockUser])
      const insertMock = jest.fn().mockReturnValue({ returning: returningMock })
      ;(db as unknown as jest.Mock).mockReturnValue({ insert: insertMock })

      const result = await usersRepository.createUser({
        name: 'John',
        email: 'john@test.com',
        password: 'hashed',
        userType: 'cliente',
      })

      expect(db).toHaveBeenCalledWith('users')
      expect(insertMock).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@test.com',
        password: 'hashed',
        user_type: 'cliente',
        address: undefined,
        phone_number: undefined,
      })
      expect(returningMock).toHaveBeenCalledWith(['id', 'name', 'email'])
      expect(result).toEqual({ rows: [mockUser] })
    })
  })

  describe('findUserByEmail', () => {
    it('should find user by email and return rows', async () => {
      const mockUsers = [{ id: 1, name: 'John', email: 'john@test.com' }]
      const selectMock = jest.fn().mockResolvedValue(mockUsers)
      const whereMock = jest.fn().mockReturnValue({ select: selectMock })
      ;(db as unknown as jest.Mock).mockReturnValue({ where: whereMock })

      const result = await usersRepository.findUserByEmail('john@test.com')

      expect(db).toHaveBeenCalledWith('users')
      expect(whereMock).toHaveBeenCalledWith({ email: 'john@test.com' })
      expect(selectMock).toHaveBeenCalledWith('*')
      expect(result).toEqual({ rows: mockUsers })
    })

    it('should return empty rows when user not found', async () => {
      const selectMock = jest.fn().mockResolvedValue([])
      const whereMock = jest.fn().mockReturnValue({ select: selectMock })
      ;(db as unknown as jest.Mock).mockReturnValue({ where: whereMock })

      const result = await usersRepository.findUserByEmail('nobody@test.com')

      expect(result).toEqual({ rows: [] })
    })
  })

  describe('updateSessionToken', () => {
    it('should update session token for user', async () => {
      const updateMock = jest.fn().mockResolvedValue(undefined)
      const whereMock = jest.fn().mockReturnValue({ update: updateMock })
      ;(db as unknown as jest.Mock).mockReturnValue({ where: whereMock })

      await usersRepository.updateSessionToken(1, 'some-token')

      expect(db).toHaveBeenCalledWith('users')
      expect(whereMock).toHaveBeenCalledWith({ id: 1 })
      expect(updateMock).toHaveBeenCalledWith({ session_token: 'some-token' })
    })

    it('should clear session token when null is passed', async () => {
      const updateMock = jest.fn().mockResolvedValue(undefined)
      const whereMock = jest.fn().mockReturnValue({ update: updateMock })
      ;(db as unknown as jest.Mock).mockReturnValue({ where: whereMock })

      await usersRepository.updateSessionToken(1, null)

      expect(updateMock).toHaveBeenCalledWith({ session_token: null })
    })
  })
})
