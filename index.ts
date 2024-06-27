import { getCompletedTask, loadTask } from "./queue";
import { setTimeout as sleep } from "node:timers/promises";

async function doStuff(passNum: number) {
  const randomNum = Math.round(Math.random() * passNum);
  await sleep(1000);
  console.log("Num", randomNum, passNum);
  if (randomNum === passNum) {
    console.log("yahooo");
    return "queue works omg";
  }

  throw new Error("Lost the fucking gacha. Got " + randomNum);
}

function log() {
  console.log("naisu");
}
const taskId = loadTask(log);
const task2Id = loadTask(doStuff, 5);

getCompletedTask(taskId, 9999999999).then((task) => {
  console.log(task);
});

getCompletedTask(taskId, 9999999999).then((task) => {
  console.log(task2Id);
});
