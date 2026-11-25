import { connect } from 'net';

const client = connect({ port: 50042 }, () => {
    console.log('Connected to server');
    client.write('World \n');
});

client.on('data', data => {
    console.log(data.toString());
    client.end();
});

client.on('end', () => {
    console.log('Disconnected from server');
});