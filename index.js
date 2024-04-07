import keepAlive from './server.js';
import Monitor from 'ping-monitor';

keepAlive();
const monitor = new Monitor({
		website: 'https://de3bfd58-1690-4d32-b750-00bfcfab18de-00-1ke7tev33yxhc.worf.replit.dev/',
		title: 'NAME',
		interval: 2
});

monitor.on('up', (res) => console.log(`${res.website} its on.`));
monitor.on('down', (res) => console.log(`${res.website} it has died - ${res.statusMessage}`));
monitor.on('stop', (website) => console.log(`${website} has stopped.`) );
monitor.on('error', (error) => console.log(error));