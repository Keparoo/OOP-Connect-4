/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class Game {
	constructor(p1, p2, height = 6, width = 7) {
		const isColor = (strColor) => {
			const option = new Option().style;
			option.color = strColor;
			return option.color === strColor;
		};
		// Check both colors are valid different colors
		if (isColor(p1.color) && isColor(p2.color) && p1.color !== p2.color) {
			this.p1 = p1;
			this.p2 = p2;
			document.querySelector('#footer').innerText = '';
		} else {
			document.querySelector('#footer').innerText =
				'Please 2 valid different colors!';
			throw new Error('Invalid Color');
		}

		this.WIDTH = width;
		this.HEIGHT = height;
		this.currPlayer = this.p1; // active player: 1 or 2
		this.board = [];
		this.htmlBoard = ''; // array of rows, each row is array of cells  (board[y][x])
		this.makeBoard();
		this.makeHtmlBoard();
		this.gameOver = true;
	}
	/** makeBoard: create in-JS board structure:
    *   board = array of rows, each row is array of cells  (board[y][x])
    */

	makeBoard() {
		this.board = [];
		for (let y = 0; y < this.HEIGHT; y++) {
			this.board.push(Array.from({ length: this.WIDTH }));
		}
	}

	/** makeHtmlBoard: make HTML table and row of column tops. */
	makeHtmlBoard() {
		this.htmlBoard = document.getElementById('board');
		this.htmlBoard.innerHTML = '';

		// make column tops (clickable area for adding a piece to that column)
		const top = document.createElement('tr');
		top.setAttribute('id', 'column-top');

		this.bindGameClick = this.handleClick.bind(this);
		top.addEventListener('click', this.bindGameClick);

		for (let x = 0; x < this.WIDTH; x++) {
			const headCell = document.createElement('td');
			headCell.setAttribute('id', x);
			top.append(headCell);
		}

		this.htmlBoard.append(top);

		// make main part of board
		for (let y = 0; y < this.HEIGHT; y++) {
			const row = document.createElement('tr');

			for (let x = 0; x < this.WIDTH; x++) {
				const cell = document.createElement('td');
				cell.setAttribute('id', `${y}-${x}`);
				row.append(cell);
			}

			this.htmlBoard.append(row);
		}
	}

	// Validate legal color
	isColor(strColor) {
		const option = new Option().style;
		option.color = strColor;
		return option.color === strColor;
	}

	/** findSpotForCol: given column x, return top empty y (null if filled) */
	findSpotForCol(x) {
		for (let y = this.HEIGHT - 1; y >= 0; y--) {
			if (!this.board[y][x]) return y;
		}
		return null;
	}

	/** placeInTable: update DOM to place piece into HTML table of board */
	placeInTable(y, x) {
		const piece = document.createElement('div');
		piece.classList.add('piece');
		piece.style.backgroundColor = this.currPlayer.color;
		// piece.classList.add(`p${this.currPlayer}`);
		piece.style.top = -50 * (y + 2);

		const spot = document.getElementById(`${y}-${x}`);
		spot.append(piece);
	}

	startGame() {
		this.makeBoard();
		this.makeHtmlBoard();
	}

	/** endGame: announce game end */
	endGame(msg) {
		const top = document.querySelector('#column-top');
		top.removeEventListener('click', this.bindGameClick);
		alert(msg);
	}

	/** handleClick: handle click of column top to play piece */
	handleClick(evt) {
		// get x from ID of clicked cell
		const x = +evt.target.id;

		// get next spot in column (if none, ignore click)
		const y = this.findSpotForCol(x);
		if (y === null) {
			return;
		}

		// place piece in board and add to HTML table
		this.board[y][x] = this.currPlayer;
		this.placeInTable(y, x);

		// check for win
		if (this.checkForWin()) {
			return this.endGame(`The ${this.currPlayer.color} player  won!`);
		}

		// check for tie
		if (this.board.every((row) => row.every((cell) => cell))) {
			return this.endGame('Tie!');
		}

		// switch players
		this.currPlayer === this.p1
			? (this.currPlayer = this.p2)
			: (this.currPlayer = this.p1);
	}

	/** checkForWin: check board cell-by-cell for "does a win start here?" */
	checkForWin() {
		function _win(cells) {
			// Check four cells to see if they're all color of current player
			//  - cells: list of four (y, x) cells
			//  - returns true if all are legal coordinates & all match currPlayer
			return cells.every(
				([ y, x ]) =>
					y >= 0 &&
					y < this.HEIGHT &&
					x >= 0 &&
					x < this.WIDTH &&
					this.board[y][x] === this.currPlayer
			);
		}
		this.bindWin = _win.bind(this);

		for (let y = 0; y < this.HEIGHT; y++) {
			for (let x = 0; x < this.WIDTH; x++) {
				// get "check list" of 4 cells (starting here) for each of the different
				// ways to win
				const horiz = [ [ y, x ], [ y, x + 1 ], [ y, x + 2 ], [ y, x + 3 ] ];
				const vert = [ [ y, x ], [ y + 1, x ], [ y + 2, x ], [ y + 3, x ] ];
				const diagDR = [
					[ y, x ],
					[ y + 1, x + 1 ],
					[ y + 2, x + 2 ],
					[ y + 3, x + 3 ]
				];
				const diagDL = [
					[ y, x ],
					[ y + 1, x - 1 ],
					[ y + 2, x - 2 ],
					[ y + 3, x - 3 ]
				];

				// find winner (only checking each win-possibility as needed)
				if (
					this.bindWin(horiz) ||
					this.bindWin(vert) ||
					this.bindWin(diagDR) ||
					this.bindWin(diagDL)
				) {
					return true;
				}
			}
		}
	}
}

class Player {
	constructor(color) {
		this.color = color;
	}
}

document.querySelector('#reset').addEventListener('click', (e) => {
	e.preventDefault();
	let p1 = new Player(document.querySelector('#p1color').value);
	let p2 = new Player(document.querySelector('#p2color').value);
	new Game(p1, p2);
});
