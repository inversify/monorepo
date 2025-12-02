import { Bench, Task, TaskResult, TaskResultCompleted } from 'tinybench';

const FIXED_DECIMALS: number = 3;

function isCompletedTaskResult(
  taskResult: TaskResult,
): taskResult is TaskResult & TaskResultCompleted {
  return taskResult.state === 'completed';
}

function areTasksWithCompletedResults(
  tasks: Task[],
): tasks is (Task & { result: TaskResult & TaskResultCompleted })[] {
  return tasks.every(isTaskWithCompletedResult);
}

function isTaskWithCompletedResult(
  task: Task,
): task is Task & { result: TaskResult & TaskResultCompleted } {
  return isCompletedTaskResult(task.result);
}

export function printBenchmarkResults(benchmark: Bench): void {
  console.log(benchmark.name);
  console.table(benchmark.table());

  const tasks: Task[] = benchmark.tasks;

  const [referenceTask, ...otherTasks]: Task[] = tasks;

  if (referenceTask === undefined) {
    console.log('No tasks found in the benchmark. Exiting...');
    return;
  }

  if (
    !isTaskWithCompletedResult(referenceTask) ||
    !areTasksWithCompletedResults(otherTasks)
  ) {
    console.log('Not all tasks have completed results. Exiting...');
    return;
  }

  const referenceMean: number = referenceTask.result.throughput.mean;

  for (const task of otherTasks) {
    const mean: number = task.result.throughput.mean;

    const speedup: number = referenceMean / mean;

    console.log(
      `${referenceTask.name} vs ${task.name} Speedup: ${speedup.toFixed(FIXED_DECIMALS)}x`,
    );
  }

  console.log();
}
