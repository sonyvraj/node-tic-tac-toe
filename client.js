import socketIoClient from 'socket.io-client';
import * as readline from 'readline/promises';

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let URL = process.env.IS_DEV 
    ? ''
    : 'http://127.0.0.1:8080'

let socket = socketIoClient(URL);

socket.on('info', (data) => {
   console.log(data);
});

socket.on('win', (data) => {
  console.log(data);
  rl.close();
  socket.disconnect();
});

socket.on('lost', (data) => {
  console.log(data);
  rl.close();
  socket.disconnect();
});

socket.on('tie', (data) => {
  console.log(data);
  rl.close();
  socket.disconnect();
});

socket.on('player moves', ({ playerXmoves, playerOmoves }) => {
  drawGrid(playerXmoves, playerOmoves);
});

socket.on('your turn', async () => {
  let inputValid = false;
  let response;
  while (!inputValid) {
    response = await rl.question("It's your turn please enter your next move: ");
    inputValid = isValidInput(response);
    if(!inputValid) {
      console.log('Invalid input, please enter a capital letter followed by a number...');
    }
  }
  socket.emit('new move', response);
  
});

socket.on('other player turn', () => {
  console.log("Waiting for the other player's input...");
});

function isValidInput(Input) {
  let [letter, number] = Input.split('');
  return ['A','B','C'].includes(letter) && ['1','2','3'].includes(number);
}

function drawGrid(X, O) {
  console.log();
  drawNumberlabels();
  drawVerticalLines(X[0], O[0], 'A');
  drawHorizontalLines();
  drawVerticalLines(X[1], O[1], 'B');
  drawHorizontalLines();
  drawVerticalLines(X[2], O[2], 'C');
  console.log();
}

function drawNumberlabels() {
  console.log('  1   2   3  ');
}

function drawVerticalLines(X, O, label) {
  let space1char = X[0] ? 'X' : O[0] ? 'O' : ' ';
  let space2char = X[1] ? 'X' : O[1] ? 'O' : ' ';
  let space3char = X[2] ? 'X' : O[2] ? 'O' : ' ';
  console.log(`${label} ${space1char} | ${space2char} | ${space3char} `);
}

function drawHorizontalLines() {
  console.log(' ---+---+---');
}