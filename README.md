**Camunda BPMN Process Automation Project**

This project is designed to automate BPMN processes in Camunda using the Camunda 8 JavaScript SDK, with tests validating each step in the workflow. The project deploys a BPMN diagram, activates process instances, and interacts with Camunda's Operate, Zeebe, and Tasklist APIs for full lifecycle management of BPMN tasks.

**Features**

1.  **Process Deployment and Activation**: Deploys a BPMN process from a specified diagram file and activates it for testing purposes.

2.  **Job Activation and Completion**: Fetches active jobs and completes them with or without variables.

3.  **User Task Handling**: Searches for user tasks in a "CREATED" state and completes them automatically.

4.  **Process Instance Validation**: Validates the activated process instance in Camunda Operate.

**Project Structure**

-  **Classes**:

-  Camunda8 Client: Initializes Camunda clients for Zeebe, Operate, and Tasklist APIs, allowing easy interaction with Camunda's APIs.

-  Tests: Mocha test cases to verify end-to-end process functionality by deploying, activating, and managing tasks in the BPMN process.

-  **Configuration**:

-  .env file to store environment-sensitive configurations like API keys and endpoints.

**Dependencies**

-  **@camunda8/sdk**: Camunda 8 SDK for JavaScript to interact with Zeebe, Operate, and Tasklist.

-  **dotenv**: Loads environment variables from a .env file.

-  **Mocha & Chai**: Testing framework with assertions.

**Usage**

1.  **Setup Environment Variables**: Configure .env with your Camunda credentials (client ID, client secret, cluster ID, region).

2.  **Run Tests**:

-  Deploy and activate a BPMN process.

-  Fetch process instance details from Operate to verify process activation.

-  Fetch and complete active jobs (service tasks).

-  Search for and complete open user tasks in a "CREATED" state.

**Functions Overview**

1.  fetchActiveJobs: Fetches active jobs using Zeebe and logs the job keys.

2.  completeJob: Completes an activated job based on job key.

3.  waitForUserTask: Waits for a user task to be created in a "CREATED" state.

4.  completeTask: Completes an open user task by task ID.

**Running Tests**

Each test case follows a specific sequence to validate the process:

1.  **Process Deployment**: Deploys the BPMN file to Zeebe.

2.  **Process Instance Activation**: Activates a process instance for testing.

3.  **Job Completion**: Completes the service task.

4.  **User Task Management**: Finds and completes open user tasks.

**Example Commands**

Run tests:

```
npm test
```

**Notes**

-  **Compatibility**: This project is compatible with Camunda 8 and may require modifications if tested with other versions.

-  **Dependencies**: Ensure the necessary packages are installed by running npm install.

-  **Environment Variables**: Make sure sensitive information, such as API credentials, is stored securely.