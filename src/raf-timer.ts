interface TaskItem {
  /** 定时器回调函数 */
  callback: (ts: number) => void
  /** 定时器运行间隔 */
  interval: number
  /** 距离上次执行的时间 */
  elapsed: number
  /** 最大运行次数 */
  maxTime?: number
  /** 已运行次数 */
  runTime: number
  /** 当前任务是否需要在下个循环周期时清除，内部变量 */
  needClear?: boolean
}
export type TimerCallback = TaskItem['callback']

/**
 * 创建一个计时器
 * @returns 
 */
export const createRAFTimer = () => {
  // 计时器句柄
  let ticker = 0
  // 是否暂停状态
  let paused = false
  // 计时器实际运行时间，不包括暂停区间
  let timeStamp = 0
  // 上一次时序记录的时间戳
  let lastTimeStamp = 0

  let tasks: TaskItem[] = []
  let taskNeedClear = false

  const timerHandler = (time: DOMHighResTimeStamp) => {
    const delta = time - (lastTimeStamp || time)
    lastTimeStamp = time
    timeStamp += delta
    if (taskNeedClear) {
      tasks = tasks.filter((item) => !item.needClear)
      taskNeedClear = false
    }
    tasks.forEach((item) => {
      const { callback, maxTime, runTime, elapsed, interval, needClear } = item
      if (needClear) {
        return
      }
      if (maxTime && runTime >= maxTime) {
        item.needClear = true
        taskNeedClear = true
        return
      }
      if (elapsed >= interval) {
        try {
          callback(timeStamp)
        } catch (e) {}
        item.elapsed = 0
        item.runTime += 1
      } else {
        item.elapsed += delta
      }
    })
    ticker = window.requestAnimationFrame(timerHandler)
  }

  /** start timer(开始计时器) */
  const start = () => {
    ticker = window.requestAnimationFrame(timerHandler)
  }
  /** stop timer(停止计时器) */
  const stop = () => {
    window.cancelAnimationFrame(ticker)
  }
  /** start/stop toggle (开启和停止切换) */
  const pauseToggle = () => {
    paused = !paused
    paused ? stop() : start()
  }

  /**
   * add new task (添加定时任务，注意：无引用关系函数无法被remove，如需提前移除，需要确保函数可被寻到)
   * @param callback task callback (任务回调函数)
   * @param interval callback trigger interval, unit: ms (回调触发间隔，单位：ms)
   * @param maxTime max time callback trigger (回调函数的最大触发次数)
   */
  const addTask = (callback: TaskItem['callback'], interval: number, maxTime?: number) => {
    tasks.push({ callback, elapsed: 0, interval, maxTime, runTime: 0 })
  }

  /**
   * remove task (移除定时任务)
   * @param callback task callback (任务回调函数)
   */
  const removeTask = (callback: TaskItem['callback']) => {
    tasks = tasks.filter((item) => item.callback !== callback)
  }

  return { start, stop, pauseToggle, addTask, removeTask }
}

/** 计时器实例 */
export type TimerInstance = ReturnType<typeof createRAFTimer>