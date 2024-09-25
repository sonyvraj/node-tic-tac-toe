import express from 'express';  // EXPRESS SERVER BUILD
import { Server } from 'socket.io'; // IMPORT SOCKET
import http from 'http'; // FOR CLIENT SERVER COMMUNICATION

let app = express();  // NEW APP !
let server = http.createServer(app);
let io = new Server(server);

let PORT = process.env.PORT || 8080;

let currentPlayer;
const RUNNING = 'RUNNING';
const PLAYER_X_WINS = 'PLAYER_X_WINS';
const PLAYER_O_WINS = 'PLAYER_O_WINS';
const CATS_GAME = 'CATS_GAME';
let i=0;
 
let currentgamestate = RUNNING;
let gameOver = false;

let playerXmoves = [
  [0, 0, 0],
  [0, 0, 0],            // IN JS... 0 -> FALSEY !!
  [0, 0, 0]
];
let playerOmoves = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];


let playerX;
let playerO;

io.on('connection', socket => {
    if (playerX) {
        console.log('A second player has joined! Starting game...');
        playerO = socket;
        playerX.emit('info', 'A second player has joined! Time to start the game!');
        playerO.emit('info', 'You are the second player, the game will now start!');

        startGame();
    } else {
        console.log('The first player has joined, waiting for second player...');
        playerX = socket;
        playerX.emit('info', 'You are the first player, we are waiting for a second player to join...');
    }
    
    socket.on('new move', input => {
        let [yMove, xMove] = parseInput(input);

        let currentPlayerMoves = currentPlayer === 'PlayerX' ? playerXmoves : playerOmoves;

        currentPlayerMoves[yMove][xMove] = 1;

        currentgamestate = gameState(playerXmoves, playerOmoves);
        gameOver = [PLAYER_X_WINS, PLAYER_O_WINS, CATS_GAME]. includes(currentgamestate);

        playerX.emit('player moves', { playerXmoves, playerOmoves });
        playerO.emit('player moves', { playerXmoves, playerOmoves });

        currentPlayer = currentPlayer === 'PlayerX' ? 'PlayerO' : 'PlayerX';

        if(!gameOver) {
            if (currentPlayer === 'PlayerX') {
                playerX.emit('your turn');
                playerO.emit('other player turn');
            } else { 
                playerO.emit('your turn');
                playerX.emit('other player turn');
            }
        } else {
            if (currentgamestate === PLAYER_X_WINS) {
                playerX.emit('win', 'The game is over! You WON!!');
                playerO.emit('lost', 'The game is over! You LOST!!');
            } else if (currentgamestate === PLAYER_O_WINS) {
                playerX.emit('lost', 'The game is over! You LOST!!');
                playerO.emit('win', 'The game is over! You WON!!');
            } else if (currentgamestate === CATS_GAME) {
                playerX.emit('tie', 'The game is over! It\'s a Tie!!');
                playerO.emit('tie', 'The game is over! It\'s a Tie!!');
            }
              
        }

    })

});

function startGame() {
    console.log('The game has started!');
    playerX.emit('player moves', { playerXmoves, playerOmoves });
    playerO.emit('player moves', { playerXmoves, playerOmoves });

    currentPlayer = Math.random() > 0.5 ? 'PlayerX' : 'PlayerO';

    if (currentPlayer === 'PlayerX') {
        playerX.emit('your turn');
        playerO.emit('other player turn');
    } else { 
        playerO.emit('your turn');
        playerX.emit('other player turn');
    }
    
}

function parseInput(Input) {
    let [letter, number] = Input.split('');
    return [
      ['A','B','C'].indexOf(letter),
      ['1','2','3'].indexOf(number)
    ]
}

function gameState(X, O) {
    let playerXwins = isHorizontalWins(X) || isVerticalWins(X) || isDiagonalWins(X);
    let playerOwins = isHorizontalWins(O) || isVerticalWins(O) || isDiagonalWins(O);
  
    if(playerXwins) {
      return PLAYER_X_WINS;
    }
    if(playerOwins) {
      return PLAYER_O_WINS;
    }
    i++;
    if(i===9) {
      return CATS_GAME;
    }
    return RUNNING;
}
  
function isHorizontalWins(moves) {
  return moves.some(row => row.every(x => x===1));
}
  
function isVerticalWins(moves) {
    return [0,1,2].some(column => moves.every(x => x[column] === 1));
}
  
function isDiagonalWins(moves) {
    return (moves[0][0] && moves[1][1] && moves[2][2])
      || (moves[0][2] && moves[1][1] && moves[2][0]);
}
  

server.listen(PORT, () => {
    console.log('Server is listening on port ' + PORT);
});