/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require('child_process').spawn;
const mysql = require('mysql2/promise');
require('dotenv').config();

const checkDatabaseConnection = async config => {
	let connection;
	try {
		connection = await mysql.createConnection(config);
		await connection.ping();
		console.log('Successfully connected to the database.');
	} catch (error) {
		console.log('Unable to connect to the database. Retrying in 5 seconds...');
		new Promise(resolve => setTimeout(resolve, process.env.DB_CONNECTION_TIMEOUT || 5000)); // Wait for 5 seconds
		return checkDatabaseConnection(config);
	} finally {
		if (connection) connection.end();
	}
};

const startDatabase = async () => {
	try {
		await exec('docker-compose up -d mysql-dev');
	} catch (error) {
		console.error(
			'Failed to start the database. Please make sure Docker is running and Docker Compose is installed.'
		);
		console.error('Error details:', error.message);
		process.exit(1);
	}
};

const startNestApp = () => {
	const nestStart = spawn('nest', ['start']);

	nestStart.stdout.on('data', data => {
		process.stdout.write(data);
	});

	nestStart.stderr.on('data', data => {
		process.stderr.write(data);
	});

	nestStart.on('close', code => {
		console.log(`NestJS application exited with code ${code}`);
	});
};

const runCommands = async () => {
	try {
		console.log('Starting database...');
		await startDatabase();
		console.log('Database started.');

		console.log('Waiting for database to initialize...');
		await checkDatabaseConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
		});

		console.log('Starting NestJS application...');
		startNestApp();
	} catch (error) {
		console.error('Error:', error);
	}
};

runCommands();
