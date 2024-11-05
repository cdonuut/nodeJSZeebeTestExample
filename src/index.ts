import { Camunda8 } from '@camunda8/sdk';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
config({ path: path.resolve(__dirname, '../.env') });

// Initialize Camunda8 SDK
const c8 = new Camunda8();
export const zbc = c8.getCamundaRestClient();  // Export zbc for use in other modules
export const operate = c8.getOperateApiClient(); // Export operate to use it on tests
export const tasklist = c8.getTasklistApiClient(); // Export Tasklist for Task Completion

// Test the connection by getting the Zeebe topology
zbc.getTopology()
    .catch(err => console.error("Error connecting to Zeebe:", err));

console.log("Zeebe client initialized.");