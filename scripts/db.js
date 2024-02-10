/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require('child_process').spawn;
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseConnection(config) {
	let connection;
	try {
		connection = await mysql.createConnection(config);
		await connection.ping();
		console.log('Successfully connected to the database.');
	} catch (error) {
		console.log('Unable to connect to the database. Retrying in 5 seconds...');
		await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
		return checkDatabaseConnection(config);
	} finally {
		if (connection) connection.end();
	}
}

async function runCommands() {
	try {
		console.log('Starting database...');
		try {
			await exec('docker-compose up -d mysql-dev');
		} catch (error) {
			console.error(
				'Failed to start the database. Please make sure Docker is running and Docker Compose is installed.'
			);
			console.error('Error details:', error.message);
			process.exit(1);
		}
		console.log('Database started.');

		console.log('Waiting for database to initialize...');
		await checkDatabaseConnection({
			host: process.env.MYSQL_HOST,
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASSWORD,
			database: process.env.MYSQL_DATABASE,
		});

		console.log('Starting NestJS application...');
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
	} catch (error) {
		console.error('Error:', error);
	}
}

runCommands();
