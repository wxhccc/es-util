/* eslint-env node, jest */
import * as esUtil from '../src'

const { eventTargetEmitter, NOMETHOD } = esUtil
it('should return an instance contain on, off, and so on', function () {
  const instance = eventTargetEmitter()
  expect(instance).toHaveProperty('on')
  expect(instance).toHaveProperty('off')
})
it('method `on` can add listeners to watchers', function () {
  const { on, getListeners } = eventTargetEmitter()
  expect(getListeners('test')).toHaveLength(0)
  on('test', jest.fn())
  expect(getListeners('test')).toHaveLength(1)
})
it('add NOMETHOD listeners to watchers', function () {
  const { on, getListeners } = eventTargetEmitter()
  expect(getListeners(NOMETHOD)).toHaveLength(0)
  on(NOMETHOD, jest.fn())
  expect(getListeners(NOMETHOD)).toHaveLength(1)
})
it('same listeners can only be add by once', function () {
  const { on, getListeners } = eventTargetEmitter()
  expect(getListeners('test')).toHaveLength(0)
  const fn = jest.fn()
  on('test', fn)
  on('test', fn)
  expect(getListeners('test')).toHaveLength(1)
})
it('listeners can be remove by method `off`', function () {
  const { on, off, getListeners } = eventTargetEmitter()
  expect(getListeners('test')).toHaveLength(0)
  const fn = jest.fn()
  on('test', fn)
  expect(getListeners('test')).toHaveLength(1)
  off('test', fn)
  expect(getListeners('test')).toHaveLength(0)
})
it('listener bind fromLimit or namespace is not same witch bind nothing', function () {
  const { on, getListeners } = eventTargetEmitter()
  expect(getListeners('test')).toHaveLength(0)
  const fn = jest.fn()
  on('test', fn)
  on('test', fn, { namespace: 'ns1' })
  expect(getListeners('test')).toHaveLength(1)
  expect(getListeners('test', { namespace: 'ns1' })).toHaveLength(1)
})

it('listener will trigger when run emit', function () {
  const { on, emit } = eventTargetEmitter()
  const fn = jest.fn()
  on('test', fn)
  emit('test', 111)
  expect(fn).toBeCalledWith(111)
})

it('listener bind fromLimit or namespace will trigger too when method is same', function () {
  const { on, emit } = eventTargetEmitter()
  const fn = jest.fn()
  on('test', fn, { namespace: 'ns1' })
  emit('test', 111)
  expect(fn).toBeCalledWith(111)
})
