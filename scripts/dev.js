/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require('child_process').spawn;
const mysql = require('mysql2/promise');

const fs = require('fs');
const path = require('path');

const checkEnvFile = () => {
	const envPath = path.resolve(process.cwd(), '.env');
	const exampleEnvPath = path.resolve(process.cwd(), '.env.example');

	if (!fs.existsSync(envPath)) {
		fs.copyFileSync(exampleEnvPath, envPath);
	}

	const envContent = fs.readFileSync(envPath, 'utf-8');
	console.log('envContent', envContent);
};

const checkDatabaseConnection = async config => {
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
	const nestStart = spawn('nest', ['start', '--watch']);

	nestStart.stdout.on('data', data => {
		process.stdout.write(data);
	});

	nestStart.stderr.on('data', data => {
		process.stderr.write(data);
	});

	nestStart.on('close', code => {
		console.log(`Flarian application exited with code ${code}`);
	});
};

const runCommands = async () => {
	require('dotenv').config();
	try {
		console.log('Starting database...');
		console.log('Starting MySQL database...', process.env.DB_HOST);
		await startDatabase();
		console.log('Database started.');

		console.log('Waiting for database to initialize...');
		await checkDatabaseConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
		});

		console.log('Starting NestJS application...');
		startNestApp();
	} catch (error) {
		console.error('Error:', error);
	}
};

checkEnvFile();
runCommands();
