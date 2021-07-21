import "zero-timeout";

export function init() {
  const tasks = [];
  let taskId = 0;
  let queueIsRunning = false;

  return {
    enqueueTask,
    cancelTask,
    sortTasks,
    countTasks: () => tasks.length,
  };

  function enqueueTask(newTask) {
    const defaultPriority = () => 0;
    taskId += 1;
    tasks.push({
      id: taskId,
      getPriority: newTask.getPriority || defaultPriority,
      chunks: newTask.chunks,
    });
    if (!queueIsRunning) window.setZeroTimeout(runTaskQueue);
    return taskId;
  }

  function cancelTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) task.canceled = true;
  }

  function sortTasks() {
    tasks.sort( (a, b) => compareNums(a.getPriority(), b.getPriority()) );
  }

  function compareNums(a, b) {
    if (a === b) return 0;
    return (a === undefined || a < b) ? -1 : 1;
  }

  function runTaskQueue() {
    // Remove canceled and completed tasks
    while (isDone(tasks[0])) tasks.shift();

    queueIsRunning = (tasks.length > 0);
    if (!queueIsRunning) return;

    // Get the next chunk from the current task, and run it
    const chunk = tasks[0].chunks.shift();
    chunk();

    window.setZeroTimeout(runTaskQueue);
  }

  function isDone(task) {
    return task && (task.canceled || task.chunks.length < 1);
  }
}
