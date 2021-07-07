# chunked-queue

Manage long-running tasks without losing interactivity

![tests](https://github.com/GlobeletJS/chunked-queue/actions/workflows/node.js.yml/badge.svg)

## Motivation
Long-running tasks in JavaScript can block the event loop. If another,
higher-priority task needs to run in the meantime, it will have to wait
until the current task is finished.

One solution for this is to break the long-running task into chunks. Then,
each chunk can be run in a [setTimeout][] callback. If a higher-priority task
comes up, it will be able to run in between the chunks.

chunked-queue manages the list of chunks for you. You can even give it
multiple lists of chunks, and set (and update) priorities for each list,
to make sure the most urgent task finishes first.

Instead of [setTimeout][], chunked-queue uses [zero-timeout][], to avoid the
[minimum delay][] between setTimeout callbacks.

[setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
[zero-timeout]: https://github.com/GlobeletJS/zero-timeout
[minimum delay]: https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers

## Usage
chunked-queue is provided as an ESM import.
```javascript
import * as chunkedQueue from 'chunked-queue';
```

To initialize a new queue, call the `init` method, with no parameters:
```javascript
const queue = chunkedQueue.init();
```

## API
The initialized queue object exposes four methods

### enqueueTask
```javascript
const taskId = queue.enqueueTask(newTask);
```

The supplied `newTask` object may have the following properties:
- `newTask.chunks` (REQUIRED): An array of zero-argument functions, in the
  order in which they are to be called. NOTE: These are assumed to be
  *synchronous*
- `newTask.getPriority` (OPTIONAL): A method that when called, returns a
  priority number for this task. Lower priority numbers will be run first.
  If not supplied, this task will be given a constant priority of 0.

The return value is an integer ID, which can later be used to cancel the task.

### cancelTask
```javascript
queue.cancelTask(taskId);
```
Cancels the task represented by the supplied taskId.

### sortTasks
```javascript
queue.sortTasks();
```
Sorts the tasks in the queue, according to the values returned by the
`.getPriority()` method on each task.

This lets you re-set the priorities of the tasks after they are queued.
Simply update the `.getPriority` methods to return smaller values for the
tasks which have become more urgent.

### countTasks
```javascript
numTasks = queue.countTasks();
```
Returns the number of tasks in the queue
