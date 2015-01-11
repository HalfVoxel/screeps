/* Implementation of the Hungarian Algorithm to determine
 * "best" rightSide.  This is a "reverse" implementation.
 * References:
 * http://en.wikipedia.org/wiki/Hungarian_algorithm
 * http://www.ams.jhu.edu/~castello/362/Handouts/hungarian.pdf (Example #2)
 * http://www.public.iastate.edu/~ddoty/HungarianAlgorithm.html // Non-square
 */
//var TrU = console;

var HG = {

	/* 2 dimension arrays */
	skillMatrix: null,
	matrix: null,
	stars: null,
	/* Single arrays */
	rCov: [],
	cCov: [],
	rows: 0,
	cols: 0,
	dim: 0,
	solutions: 0, // "k"
	FORBIDDEN_VALUE: -999999,


	/* Rows MUST BE the Formation (Jobs)
	 * Columns MUST BE the Squad (Workers)
	 * Therefore, the Rows MUST BE PADDED
	 */
	hungarianAlgortithm: function(costMatrix) {
		if (costMatrix.length == 0) return [];

		HG.init(costMatrix);
		// Step 1
		HG.matrix = HG.subtractRowMins(HG.matrix);
		// Step 2
		HG.findZeros(HG.matrix);
		var done = false;
		while (!done) {
			// Step 3
			var covCols = HG.coverColumns(HG.matrix);
			if (covCols > HG.solutions - 1) {
				done = true;
			}
			if (!done) {
				// Step 4 (calls Step 5)
				done = HG.coverZeros(HG.matrix);
				while (done) {
					// Step 6
					var smallest = HG.findSmallestUncoveredVal(HG.matrix);
					HG.matrix = HG.uncoverSmallest(smallest, HG.matrix);
					done = HG.coverZeros(HG.matrix);
				}
			}
		}
		return HG.getSolution()
	},

	init: function(costMatrix) {
		HG.cols = costMatrix.length;
		HG.rows = costMatrix[0].length;
		HG.dim = Math.max(HG.rows, HG.cols);
		HG.solutions = HG.dim;
		HG.skillMatrix = HG.initMatrix(HG.rows, HG.cols);
		HG.matrix = HG.initMatrix(HG.dim, HG.dim);
		HG.stars = HG.initMatrix(HG.dim, HG.dim);

		// This reverses the matrix.  We need to to create a cost based solution.
		var costMatrix2 = HG.reverseMatrix(HG.findMaxValue(costMatrix), HG.copyMatrix(costMatrix));

		HG.matrix = costMatrix2;

		HG.skillMatrix = costMatrix;

		HG.rCov = new Array(HG.dim);
		HG.cCov = new Array(HG.dim);
		HG.initArray(HG.cCov, 0); // Zero it out
		HG.initArray(HG.rCov, 0);
	},

	copyMatrix: function(source) {
		var sizeX = source.length;
		var matrix = new Array(sizeX);
		for (var i = 0; i < sizeX; i++) {
			matrix[i] = source[i].slice();
		}
		return matrix;
	},

	initMatrix: function(sizeX, sizeY) {
		var matrix = new Array(sizeX);
		for (var i = 0; i < sizeX; i++) {
			matrix[i] = new Array(sizeY);
			HG.initArray(matrix[i], 0);
		}
		return matrix;
	},

	findMaxValue: function(matrix) {
		var max = 0.0;
		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				if (matrix[i][j] > max) {
					max = matrix[i][j];
				}
			}
		}
		return Number(max);
	},

	reverseMatrix: function(max, matrix) {
		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				matrix[i][j] = (Number(max) - Number(matrix[i][j])).toFixed(0);
			}
		}
		return matrix;
	},

	subtractRowMins: function(matrix) {
		for (var i = 0; i < matrix.length; i++) {
			var min = Number.MAX_VALUE;
			for (var j = 0; j < matrix[i].length; j++) {
				if (matrix[i][j] < min) {
					min = Number(matrix[i][j]);
				}
			}
			for (var k = 0; k < matrix[i].length; k++) {
				matrix[i][k] = matrix[i][k] - min;
			}
		}
		return matrix;
	},

	subtractColMins: function(matrix) {
		for (var j = 0; j < matrix[0].length; j++) {
			var min = Number.MAX_VALUE;
			for (var i = 0; i < matrix.length; i++) {
				if (matrix[i][j] < min) {
					min = Number(matrix[i][j]);
				}
			}
			for (var k = 0; k < matrix[0].length; k++) {
				matrix[k][j] = matrix[k][j] - min;
			}
		}
		return matrix;
	},

	findZeros: function(matrix) {
		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				if (matrix[i][j] == 0) {
					if (HG.rCov[i] == 0 && HG.cCov[j] == 0) {
						HG.stars[i][j] = 1;
						HG.cCov[j] = 1;
						HG.rCov[i] = 1;
					}
				}
			}
		}
		// Clear Covers
		HG.initArray(HG.cCov, 0);
		HG.initArray(HG.rCov, 0);
	},

	initArray: function(theArray, initVal) {
		for (var i = 0; i < theArray.length; i++) {
			theArray[i] = Number(initVal);
		}
	},

	coverColumns: function(matrix) {
		var count = 0;
		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				if (HG.stars[i][j] == 1) {
					HG.cCov[j] = 1;
				}
			}
		}
		for (var k = 0; k < HG.cCov.length; k++) {
			count = Number(HG.cCov[k]) + Number(count);
		}
		return count;
	},

	/**
	 * step 4
	 * Cover all the uncovered zeros one by one until no more
	 * cover the row and uncover the column
	 */
	coverZeros: function(matrix) {
		var retVal = true;
		var zero = HG.findUncoveredZero(matrix); // Returns a Coords object..

		while (zero.row > -1 && retVal == true) {
			HG.stars[zero.row][zero.col] = 2 //Prime it
			var starCol = HG.foundStarInRow(zero.row, matrix);
			if (starCol > -1) {
				HG.rCov[zero.row] = 1;
				HG.cCov[starCol] = 0;
			} else {
				HG.starZeroInRow(zero); // Step 5
				retVal = false;
			}
			if (retVal == true) {
				zero = HG.findUncoveredZero(matrix);
			}
		}
		return retVal;
	},

	findUncoveredZero: function(matrix) {
		var coords = new HgCoords();
		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				if (matrix[i][j] == 0 && HG.rCov[i] == 0 && HG.cCov[j] == 0) {
					coords.row = i;
					coords.col = j;
					j = matrix[i].length;
					i = matrix.length - 1;
				}
			}

		}
		return coords;
	},

	foundStarInRow: function(zeroRow, matrix) {
		var retVal = -1;
		for (var j = 0; j < matrix[zeroRow].length; j++) {
			if (HG.stars[zeroRow][j] == 1) {
				retVal = j;
				j = matrix[zeroRow].length;
			}
		}
		return retVal;
	},

	/**
	 * step 5
	 * augmenting path algorithm
	 * go back to step 3
	 */
	starZeroInRow: function(zero) { // Takes a Coords Object
		//TrU.log("Step 5: Uncovered Zero:" + zero.row + "," + zero.col, TrU.DEBUG);
		var done = false;
		var count = 0;
		var path = HG.initMatrix(HG.dim * 2, 2);

		path[count][0] = zero.row;
		path[count][1] = zero.col;
		while (!done) {
			var row = HG.findStarInCol(path[count][1]);
			if (row > -1) {
				count++;
				path[count][0] = row;
				path[count][1] = path[count - 1][1];
			} else {
				done = true;

			}
			if (!done) {
				var col = HG.findPrimeInRow(path[count][0]);
				count++;
				path[count][0] = path[count - 1][0];
				path[count][1] = col;
			}
		}
		HG.convertPath(path, count);

		// Clear Covers
		HG.initArray(HG.cCov, 0);
		HG.initArray(HG.rCov, 0);
		HG.erasePrimes();
	},

	findStarInCol: function(col) {
		var retVal = -1;
		for (var i = 0; i < HG.stars.length; i++) {
			if (HG.stars[i][col] == 1) {
				retVal = i;
				i = HG.stars.length;
			}
		}
		return retVal;
	},

	findPrimeInRow: function(row) {
		var retVal = -1;
		for (var j = 0; j < HG.stars[row].length; j++) {
			if (HG.stars[row][j] == 2) {
				retVal = j;
				j = HG.stars[row].length;
			}
		}
		return retVal;
	},

	logMatrix: function (a,b,c) {

	},

	/* Should convert all primes to stars and reset all stars.
	 * Count is needed to be sure we look at all items in the path
	 */
	convertPath: function(path, count) {
		//HG.logMatrix(path, "Step 5: Converting Path.  Count = " + count);
		for (var i = 0; i < count + 1; i++) {
			var x = path[i][0];
			var y = path[i][1];
			if (HG.stars[x][y] == 1) {
				HG.stars[x][y] = 0;
			} else if (HG.stars[x][y] == 2) {
				HG.stars[x][y] = 1;
			}
		}
	},

	erasePrimes: function() {
		for (var i = 0; i < HG.stars.length; i++) {
			for (var j = 0; j < HG.stars[i].length; j++) {
				if (HG.stars[i][j] == 2) {
					HG.stars[i][j] = 0;
				}
			}
		}
	},

	findSmallestUncoveredVal: function(matrix) {
		var min = Number.MAX_VALUE;
		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				if (HG.rCov[i] == 0 && HG.cCov[j] == 0) {
					if (min > matrix[i][j]) {
						min = matrix[i][j];
					}
				}
			}
		}
		return min;
	},

	/**
	 * step 6
	 * modify the matrix
	 * if the row is covered, add the smallest value
	 * if the column is not covered, subtract the smallest value
	 */
	uncoverSmallest: function(smallest, matrix) {
		//TrU.log("Uncover Smallest: " + smallest);
		//HG.logMatrix(matrix, "B4 Smallest uncovered");

		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				if (HG.rCov[i] == 1) {
					matrix[i][j] += smallest;
				}
				if (HG.cCov[j] == 0) {
					matrix[i][j] -= smallest;
				}
			}
		}
		//HG.logMatrix(matrix, "Smallest uncovered");
		return matrix;
	},

	getSolution: function() {
		var total = 0;
		var lineup = [];
		// Changed from length of stars, since we must ignore some rows due to padding.
		for (var i = 0; i < HG.rows; i++) {
			for (var j = 0; j < HG.cols; j++) {
				if (HG.stars[i][j] == 1) {
					/* the player (worker) at index j is the best player
					 * for poisition (job) at index i in your initial arrays.
					 */
					lineup.push([i, j, HG.skillMatrix[i][j]]);
				}
			}
		}
		return lineup;
	}
}
var Hungarian = HG;

function HgCoords() {
	this.row = -1;
	this.col = -1;
}


// Takes an array of positions as a leftSide.
// Takes a rightSide which contains an array of players
var loadMatrix = function() {
	//matrix = loadYourMatrix(rightSide, leftSide, matrix); // I've removed my implementation here. Far too much stuff
	var matrix = HG.initMatrix(20,20);
	for (var i=0; i < 20; i++ ) {
		for (var j=i; j < 20 && j < i + 8; j++ ) {
			matrix[i][j] = (Math.random()*10)|0;
		}
	}

	// This reverses the matrix.  We need to to create a cost based solution.
	//matrix = HG.reverseMatrix(HG.findMaxValue(matrix), matrix);
	return matrix;
};

//console.log (loadMatrix());
/*for (var i = 0; i < 10; i++ ) {
	console.log (Hungarian.hungarianAlgortithm (loadMatrix()));
}*/