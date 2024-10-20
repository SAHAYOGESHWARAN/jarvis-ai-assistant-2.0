const schedule = require('node-schedule');

const tasks = [];

function scheduleTask(time, taskDescription) {
    const job = schedule.scheduleJob(time, function() {
        console.log(`Task Reminder: ${taskDescription}`);
        // Add any additional action here, e.g., send notification
    });

    tasks.push({ job, description: taskDescription });
    return `Task scheduled: ${taskDescription} at ${time}`;
}

function cancelTask(taskDescription) {
    const task = tasks.find(t => t.description === taskDescription);
    if (task) {
        task.job.cancel();
        tasks.splice(tasks.indexOf(task), 1);
        return `Task canceled: ${taskDescription}`;
    }
    return `Task not found: ${taskDescription}`;
}

module.exports = { scheduleTask, cancelTask };
