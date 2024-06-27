import crypto from "node:crypto";

// TODO: Can add some cooldown to tasks which have failed or even remove them if they fail too much
interface Task<T extends any[]> {
  id: string;
  name: string;
  execute: (...args: T) => Promise<any> | any;
  completed: boolean;
  executeCount: number;
  response: any;
  args: T;
}

const tasks: Task<any[]>[] = [];
const completedTasks: Task<any[]>[] = [];

export function loadTask<T extends any[]>(
  cb: (...args: T) => Promise<any> | any,
  ...args: T
) {
  const taskId = crypto.randomUUID();
  tasks.push({
    name: cb.name,
    execute: cb,
    executeCount: 0,
    completed: false,
    id: taskId,
    response: null,
    args: args,
  });
  return taskId;
}

export function getCompletedTask(
  taskId: string,
  timeout: number = 30000
): Promise<Task<any[]>> {
  return new Promise((resolve, reject) => {
    let int: Timer;
    const timer = setTimeout(() => {
      clearInterval(int);
      reject("timeout: couldn't get the task as its not completed yet.");
    }, timeout);

    int = setInterval(() => {
      const task = getTask(taskId, "completed_only");
      if (task) {
        clearTimeout(timer);
        clearInterval(int);
        resolve(task);
      }
    }, 1000);
  });
}

export function getTask(
  taskId: string,
  taskType: "completed_only" | "running_only" | "all" = "all"
) {
  const t =
    taskType === "completed_only"
      ? completedTasks
      : taskType === "running_only"
      ? tasks
      : [...tasks, ...completedTasks];
  for (const task of t) {
    if (task.id === taskId) {
      return task;
    }
  }
  return null;
}

// executes tasks
const taskQueue = async () => {
  const task = tasks.shift();
  if (!task) return;
  task.executeCount++;
  try {
    task.response = await task.execute(...task.args);
    task.completed = true;
    completedTasks.push(task);
  } catch (error: any) {
    console.error(`Task ${task.id} failed: ${error.message}`);
    tasks.push(task); // pushing at the back of queue
  }
};

setInterval(taskQueue, 0);
