import { expect } from 'chai'; 
import { zbc, operate, tasklist } from '../index.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchActiveJobs() {
    try {
        const jobs = await zbc.activateJobs({
            type: 'service-task', 
            maxJobsToActivate: 5,
            requestTimeout: 6000, // Optional: you can request timeout for fetching jobs
            timeout: 5 * 60 * 1000, // Job timeout duration
            worker: 'my-worker-uuid', // Worker name (any name)
        });

        // Extract job keys from the fetched jobs and log each
        const jobKeys = jobs.map(job => job.jobKey);
        jobKeys.forEach(jobKey => console.log(`Fetched job with key: ${jobKey}`));

        return jobKeys; // Return the job keys for later use
    } catch (error) {
        console.error('Error fetching active jobs:', error);
        return [];
    }
}

async function completeJob(jobId: string) {
    try {
        const result = await zbc.completeJob({
            jobKey: jobId,
            variables: {}, 
        });
        console.log(`Job ${jobId} completed successfully with result:`, result);
    } catch (error) {
        console.error(`Error completing job ${jobId}:`, error);
    }
}

async function waitForUserTask() {
    const maxRetries = 5;
    const delayDuration = 3000; // 3 seconds between retries

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const tasks = await tasklist.searchTasks({ state: "CREATED" });
            if (tasks && tasks.length > 0) {
                console.log(`User task found after ${attempt} attempt(s)`);
                return tasks[0].id; // Return the ID of the first open task found
            }
            console.log(`Attempt ${attempt}: No open user task found. Retrying...`);
            await delay(delayDuration);
        } catch (error) {
            console.error(`Error searching for user task on attempt ${attempt}:`, error);
        }
    }
    throw new Error("User task not found after maximum retries");
}

describe('BPMN Process Tests', function (this: Mocha.Suite) {
    this.timeout(20000); // Set a default timeout for all tests in this suite

    // Shared variables to store process and job details across tests
    let deploymentKey: string;
    let processDefinitionKey: string;
    let processInstanceKey: string;
    let activatedJob: any;

    /**
     * Step 1: Deploy the BPMN process and activate the process instance before all tests
     */
    before(async function (this: Mocha.Context) {
        try {
            const bpmnFilePath = path.resolve(__dirname, '../resources/diagrams/c8-sdk-demo.bpmn');
            const files = [bpmnFilePath];

            // Deploy the BPMN file
            const deployment = await zbc.deployResourcesFromFiles(files);
            expect(deployment).to.have.property('deploymentKey');
            expect(deployment.deployments).to.be.an('array').that.is.not.empty;

            // Extract and store the deployment and process definition keys
            deploymentKey = deployment.deploymentKey;
            const deployments = deployment.deployments as { processDefinition: { processDefinitionKey: string } }[];
            processDefinitionKey = deployments[0].processDefinition.processDefinitionKey;
            console.log(`Process deployed with ID: ${deploymentKey}`);

            // Activate the process instance once for all tests
            const processInstance = await zbc.createProcessInstance({
                processDefinitionKey: processDefinitionKey,
                variables: {},
            });

            processInstanceKey = processInstance.processInstanceKey;
            expect(processInstance).to.have.property('processInstanceKey');
            console.log(`Process instance activated with Key: ${processInstanceKey}`);

        } catch (error) {
            console.error("Error during setup:", error);
            throw error;
        }
    });

    /**
     * Step 2: Fetch the process instance details from Operate and validate it exists
     */
    it('should fetch the activated process from Operate', async function () {
        const maxRetries = 5;
        const delayDuration = 3000; // 3 seconds between retries

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt}: Trying to fetch process instance from Operate...`);
                
                // Fetch the process instance details from Operate
                activatedJob = await operate.getProcessInstance(processInstanceKey);

                if (activatedJob) {
                    console.log("Process instance fetched successfully:", activatedJob);
                    break; // Job found, exit loop
                }
            } catch (error: any) {
                if (error.statusCode === 404 && attempt < maxRetries) {
                    console.warn(`Attempt ${attempt} failed with 404. Waiting ${delayDuration / 1000} seconds before retrying...`);
                    await delay(delayDuration); // Wait and retry
                } else {
                    console.error("Non-404 error encountered or max retries reached:", error);
                    throw error; // Rethrow if not a 404 or max retries are reached
                }
            }
        }

        expect(activatedJob).to.exist;
    });

    /**
     * Step 3: Complete enabled Service Task
     */
    it('should complete the activated service task', async function () {
        const jobKeys = await fetchActiveJobs();
        console.log('Job keys:', jobKeys);

        jobKeys.forEach(jobKey => {
            console.log(`Completing job with key: ${jobKey}`);
            completeJob(jobKey);
        });
    });

    /**
     * Step 5: Search for and complete an open user task
     */
    it('should wait for, find, and complete an open user task', async function () {
        try {
            // Step 5a: Wait for an open user task to be created
            const taskId = await waitForUserTask(); // Wait until a task ID is returned
            console.log(`Found user task with ID: ${taskId}`);
    
            // Step 5b: Complete the task with an empty variables object
            const result = await tasklist.completeTask(taskId, {});
            console.log(`Task ${taskId} completed successfully with response:`, result);
        } catch (error) {
            console.error('Error waiting for, finding, or completing the user task:', error);
        }
    });

});