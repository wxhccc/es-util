/**
 * @jest-environment jsdom
 */
/* eslint-env node, jest */
import { createRAFTimer } from '../src'

const wait = (timeout: number) =>
  new Promise((resolve) => window.setTimeout(resolve, timeout))
const timer = createRAFTimer()
const autoTimer = createRAFTimer({
  autoStartWhenAddTask: true,
  autoStopWhenNoTask: true
})

describe('#createRAFTimer', function () {
  describe('#no options timer', function () {
    it('should not run task when no start', async () => {
      const fn = jest.fn()
      timer.addTask(fn, 200, 1)
      await wait(300)
      expect(fn).not.toBeCalled()
      return
    })
    it('should run once if maxTime is 1', async () => {
      const fn = jest.fn()
      expect(fn).not.toBeCalled()
      timer.start()
      timer.addTask(fn, 200, 1)
      await wait(500)
      expect(fn).toBeCalledTimes(1)
      timer.stop()
    })
    it('should run 4 times in 1000ms when interval is 200ms', async () => {
      const fn = jest.fn()
      expect(fn).not.toBeCalled()
      timer.start()
      timer.addTask(fn, 200)
      await wait(1000)
      expect(fn).toBeCalledTimes(4)
      timer.stop()
    })
  })
  describe('#timer with options, will auto start or stop', function () {
    it('should auto start when add task, then run task once', async () => {
      const fn = jest.fn()
      autoTimer.addTask(fn, 200, 1)
      await wait(300)
      expect(fn).toBeCalled()
    })
    it('should auto stop when no task', async () => {
      const fn = jest.fn()
      expect(fn).not.toBeCalled()
      autoTimer.addTask(fn, 200, 1)
      await wait(300)
      expect(fn).toBeCalledTimes(1)
      expect(autoTimer.isPaused()).toBe(true)
    })
    it('should auto restart when addTask', async () => {
      const fn = jest.fn()
      autoTimer.addTask(fn, 200, 1)
      await wait(300)
      expect(fn).toBeCalledTimes(1)
      expect(autoTimer.isPaused()).toBe(true)
      autoTimer.addTask(fn, 200)
      expect(autoTimer.isPaused()).toBe(false)
      timer.stop()
    })
  })
})
