  /**
   * @author bhouston / http://exocortex.com/
   * Original source from: 2013, April 22: https://github.com/niklasvh/base64-arraybuffer (MIT-LICENSED)
   */
  
  var THREE = function() {};
  /**
   * @author bhouston / http://exocortex.com/
   * Original source from: 2013, April 22: https://github.com/niklasvh/base64-arraybuffer (MIT-LICENSED)
   */
  
  THREE.Base64 = function () {
  };
  
  // Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
  // use window.btoa' step. According to my tests, this appears to be a faster approach:
  // http://jsperf.com/encoding-xhr-image-data/5
  // source: https://gist.github.com/jonleighton/958841
  THREE.Base64.fromArrayBuffer = function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
      i, len = bytes.buffer.byteLength, base64 = "";
    

    for (i = 0; i < len; i+=3) {
      base64 += THREE.Base64.base64String[bytes[i] >> 2];
      base64 += THREE.Base64.base64String[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += THREE.Base64.base64String[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += THREE.Base64.base64String[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }
  
    return base64;
  };
  
  THREE.Base64.fromArrayBuffer = function ( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa( binary );
};

  THREE.Base64.base64String = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  
  THREE.Base64.base64ToIndexSlow = function( c ) {
    return THREE.Base64.base64String.indexOf( c );
  };
  
  THREE.Base64.base64ToIndex = function() {
    var indexOfA = "A".charCodeAt(0);
    var indexOfZ = "Z".charCodeAt(0);
    var indexOfa = "a".charCodeAt(0);
    var indexOfz = "z".charCodeAt(0);
    var indexOf0 = "0".charCodeAt(0);
    var indexOf9 = "9".charCodeAt(0);
    var indexOfSlash = "/".charCodeAt(0);
    var indexOfPlus = "+".charCodeAt(0);
  
    return function( index ) {
      if( index < indexOfA ) {
        if( index >= indexOf0 ) {
          // 0-9
          return 52 + index - indexOf0;
        }
        if( index === indexOfPlus ) {
          // +
          return 62
        }
        // /
        return 63;
      }
      if( index <= indexOfZ ) {
        // A-Z
        return index - indexOfA;      
      }
      // a-z
      return 26 + index - indexOfa;
    };
  
  }();
  
  
  THREE.Base64.base64ToIndexNew = function() {
    var test = {};
    for(var i = 0;i< THREE.Base64.base64String.length;i++){
      
      test[THREE.Base64.base64String[i]] = i;
  
    };
  
    /*return function(index){
      return test[index];
    };*/
    return test;

  }();
  
  THREE.Base64.toArrayBuffer = function() {
  
    var base64ToIndex = THREE.Base64.base64ToIndex;
    //var arraybuffer = new ArrayBuffer (50000);

    return function(base64) {
  
      var bufferLength = base64.length * 0.75,
        len = base64.length, i, p = 0,
        encoded1, encoded2, encoded3, encoded4;
  
      if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
          bufferLength--;
        }
      }

      //if (arraybuffer.byteLength < bufferLength) {
        var arraybuffer = new ArrayBuffer(bufferLength);
      //}
      var bytes = new Uint8Array(arraybuffer);
  
      for (i = 0; i < len; i+=4) {
        encoded1 = THREE.Base64.base64ToIndexNew[base64[i]];
        encoded2 = THREE.Base64.base64ToIndexNew[base64[i+1]];
        encoded3 = THREE.Base64.base64ToIndexNew[base64[i+2]];
        encoded4 = THREE.Base64.base64ToIndexNew[base64[i+3]];
  
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
      }
  
      //return {data: arraybuffer, length: bufferLength};
      return arraybuffer;
    };
  
  }();
  
  

  THREE.Base64.toArrayOfFloats = function( base64 ) {
    
    var arrayBuffer = THREE.Base64.toArrayBuffer( base64 );
    var floatArray = new Float32Array( arrayBuffer );
    var length = floatArray.length;

    var arrayOfFloats = [];
    for( var i = 0; i < length; i ++ ) {
      arrayOfFloats.push( floatArray[i] );
    }
  
    return arrayOfFloats;
  
  };/* Implementation of the Hungarian Algorithm to determine
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
}*/(function () { "use strict";
var $hxClasses = {};
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HasID = function() { };
$hxClasses["HasID"] = HasID;
HasID.__name__ = true;
var Base = function() {
};
$hxClasses["Base"] = Base;
Base.__name__ = true;
Base.__interfaces__ = [HasID];
Base.instantiate = function(type) {
	var v = Type.createInstance(type,[]);
	v.initialize(false);
	return v;
};
Base.prototype = {
	isStandalone: function() {
		return false;
	}
	,initialize: function(register) {
		if(register == null) register = true;
		this.my = true;
		this.internalInitialize();
		IDManager.initialize(this,register);
		this.onCreated();
		return this;
	}
	,internalInitialize: function() {
	}
	,tick: function() {
	}
	,onCreated: function() {
	}
	,onDestroyed: function() {
	}
	,earlyTick: function() {
	}
	,destroy: function() {
		IDManager.destroy(this);
	}
};
var AIAssigned = function() {
	this.maxAssignedCount = 1;
	this.assignedScores = [];
	this.assigned = [];
	Base.call(this);
};
$hxClasses["AIAssigned"] = AIAssigned;
AIAssigned.__name__ = true;
AIAssigned.__super__ = Base;
AIAssigned.prototype = $extend(Base.prototype,{
	assign: function(creep,score) {
		if(this.assigned == null || this.assignedScores == null) {
			this.assigned = [];
			this.assignedScores = [];
		}
		if(creep.currentTarget == this) {
			this.assignedScores[HxOverrides.indexOf(this.assigned,creep,0)] = score;
			return;
		}
		while(this.assigned.length >= this.maxAssignedCount && this.assigned.length > 0) {
			var mn = 0;
			var _g1 = 0;
			var _g = this.assigned.length;
			while(_g1 < _g) {
				var i = _g1++;
				if(this.assignedScores[i] < this.assignedScores[mn]) mn = i;
			}
			this.unassign(this.assigned[mn]);
		}
		if(creep.currentTarget != null) creep.currentTarget.unassign(creep);
		this.assigned.push(creep);
		this.assignedScores.push(score);
		creep.currentTarget = this;
	}
	,cleanup: function() {
		if(this.assigned == null || this.assignedScores == null) {
			this.assigned = [];
			this.assignedScores = [];
		}
		var _g1 = 0;
		var _g = this.assigned.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.assigned[i] == null) {
				this.assigned.splice(i,1);
				this.assignedScores.splice(i,1);
				break;
			}
		}
	}
	,tick: function() {
		this.cleanup();
	}
	,betterAssignScore: function(score) {
		if(this.assigned.length < this.maxAssignedCount) return true;
		this.cleanup();
		var _g1 = 0;
		var _g = this.assignedScores.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.assignedScores[i] < score) return true;
		}
		return false;
	}
	,unassign: function(creep) {
		if(creep == null) this.cleanup();
		if(this.assigned != null && creep != null) {
			if(creep.currentTarget != this) {
				haxe.Log.trace("========== API bugged =========",{ fileName : "AIAssigned.hx", lineNumber : 68, className : "AIAssigned", methodName : "unassign"});
				haxe.Log.trace("Expected " + this.id + " got " + (creep.currentTarget != null?"" + creep.currentTarget.id:"<null>"),{ fileName : "AIAssigned.hx", lineNumber : 69, className : "AIAssigned", methodName : "unassign"});
				haxe.Log.trace(creep,{ fileName : "AIAssigned.hx", lineNumber : 70, className : "AIAssigned", methodName : "unassign"});
				haxe.Log.trace(typeof(creep),{ fileName : "AIAssigned.hx", lineNumber : 71, className : "AIAssigned", methodName : "unassign"});
			}
			creep.currentTarget = null;
			var i = HxOverrides.indexOf(this.assigned,creep,0);
			this.assigned.splice(i,1);
			this.assignedScores.splice(i,1);
		}
	}
	,internalInitialize: function() {
		this.type = "AIMap";
	}
});
var Point = function(x,y,f,root) {
	this.x = x;
	this.y = y;
	this.f = f;
	this.heapIndex = 0;
	this.root = root;
};
$hxClasses["Point"] = Point;
Point.__name__ = true;
var CNode = function(x,y,f,root) {
	this.conns = new Array();
	Point.call(this,x,y,f,root);
};
$hxClasses["CNode"] = CNode;
CNode.__name__ = true;
CNode.__super__ = Point;
CNode.prototype = $extend(Point.prototype,{
});
var Component = function() {
};
$hxClasses["Component"] = Component;
Component.__name__ = true;
var AICollectorPoints = function() {
	Base.call(this);
};
$hxClasses["AICollectorPoints"] = AICollectorPoints;
AICollectorPoints.__name__ = true;
AICollectorPoints.fromSource = function(sources) {
	var terrain = IDManager.manager.map.getTerrainMap();
	var pts = new Array();
	var _g = 0;
	while(_g < sources.length) {
		var source = sources[_g];
		++_g;
		pts.push(new CNode(source.pos.x,source.pos.y,0));
	}
	var results = AICollectorPoints.findUntil(pts,terrain,function(v) {
		return v.f == 2;
	},100000);
	var nodeResults = results.map(function(p) {
		return new CNode(p.x,p.y,p.f,p.root);
	});
	var room;
	var this1;
	{
		var res = null;
		var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
		while( $it0.hasNext() ) {
			var room1 = $it0.next();
			res = room1;
		}
		this1 = res;
	}
	if(this1 == null) throw "Extracting null Maybe";
	room = this1;
	AICollectorPoints.connect(nodeResults,true);
	var components = AICollectorPoints.groupIntoComponents(nodeResults,true);
	haxe.Log.trace("Found " + components.length + " " + nodeResults.length,{ fileName : "AICollectorPoints.hx", lineNumber : 66, className : "AICollectorPoints", methodName : "fromSource"});
	var cid = 0;
	var _g1 = 0;
	while(_g1 < components.length) {
		var comp = components[_g1];
		++_g1;
		cid++;
		var _g11 = 0;
		var _g2 = comp.nodes;
		while(_g11 < _g2.length) {
			var node = _g2[_g11];
			++_g11;
			AICollectorPoints.idx++;
		}
	}
	var costs = AIMap.createMap(50);
	var _g3 = 0;
	while(_g3 < 50) {
		var y = _g3++;
		var _g12 = 0;
		while(_g12 < 50) {
			var x = _g12++;
		}
	}
	var _g4 = 0;
	while(_g4 < sources.length) {
		var source1 = sources[_g4];
		++_g4;
		AICollectorPoints.setAdjacent(costs,source1.pos.x,source1.pos.y,-1);
	}
	var pathfinder = IDManager.manager.pathfinder;
	var spawn = IDManager.spawns[0];
	cid = 0;
	var _g5 = 0;
	while(_g5 < components.length) {
		var comp1 = components[_g5];
		++_g5;
		AICollectorPoints.addDeltaNodes(costs,comp1.nodes,20);
	}
	var bitfield = 0;
	var results1 = new Array();
	var _g6 = 0;
	while(_g6 < components.length) {
		var _ = components[_g6];
		++_g6;
		var _g13 = 0;
		while(_g13 < components.length) {
			var _1 = components[_g13];
			++_g13;
			results1.push(-1);
		}
	}
	AICollectorPoints.startTime = haxe.Timer.stamp();
	var evaluateComponentCombination = function(stack) {
		var totCost = 0.0;
		var pathto = pathfinder.findPath(spawn.linked.pos,stack[0],true,null,costs);
		if(pathto == null) return null;
		totCost += pathfinder.sumCost(pathto,costs);
		AICollectorPoints.addDeltaPath(costs,pathto,20);
		var paths = new Array();
		paths.push(pathto.map(AICollectorPoints.state2vec2));
		var last = stack[0];
		var _g7 = 0;
		while(_g7 < stack.length) {
			var node1 = stack[_g7];
			++_g7;
			if(last != node1) {
				var intpath = pathfinder.findPath(last,node1,true,null,costs);
				if(intpath == null) return null;
				totCost += pathfinder.sumCost(intpath,costs);
				AICollectorPoints.addDeltaPath(costs,intpath,20);
				paths.push(intpath.map(AICollectorPoints.state2vec2));
			}
			var idx = HxOverrides.indexOf(node1.comp.nodes,node1,0);
			var vecpath = new Array();
			if(node1.comp.closed) {
				var _g21 = 1;
				var _g14 = node1.comp.nodes.length - 1;
				while(_g21 < _g14) {
					var i = _g21++;
					var tmpnode = node1.comp.nodes[(idx + i) % node1.comp.nodes.length];
					vecpath.push({ x : tmpnode.x, y : tmpnode.y});
				}
				last = node1.comp.nodes[(idx + node1.comp.nodes.length - 1) % node1.comp.nodes.length];
			} else if(idx == 0) {
				last = node1.comp.nodes[(idx + node1.comp.nodes.length - 1) % node1.comp.nodes.length];
				var _g22 = 1;
				var _g15 = node1.comp.nodes.length - 1;
				while(_g22 < _g15) {
					var i1 = _g22++;
					var tmpnode1 = node1.comp.nodes[i1];
					vecpath.push({ x : tmpnode1.x, y : tmpnode1.y});
				}
			} else {
				var _g23 = 1;
				var _g16 = node1.comp.nodes.length - 1;
				while(_g23 < _g16) {
					var i2 = _g23++;
					var tmpnode2 = node1.comp.nodes[node1.comp.nodes.length - i2 - 1];
					vecpath.push({ x : tmpnode2.x, y : tmpnode2.y});
				}
				last = node1.comp.nodes[0];
			}
			AICollectorPoints.addDeltaVecPath(costs,vecpath,20);
			paths.push(vecpath);
		}
		var invalid = false;
		var _g8 = 0;
		while(_g8 < paths.length) {
			var path = paths[_g8];
			++_g8;
			if(path != null) AICollectorPoints.addDeltaVecPath(costs,path,-20); else invalid = true;
		}
		if(pathto != null) {
		} else {
		}
		if(!invalid) return { cost : totCost, data : paths}; else return null;
	};
	var _g17 = 0;
	var _g9 = 1 << components.length;
	while(_g17 < _g9) {
		var bitfield1 = _g17++;
		var cnt = 0;
		var anyClosed = false;
		var _g31 = 0;
		var _g24 = components.length;
		while(_g31 < _g24) {
			var i3 = _g31++;
			if((bitfield1 >> i3 & 1) != 0) {
				cnt++;
				anyClosed = anyClosed || components[i3].closed;
			}
		}
		if(cnt > 1) continue;
		if(anyClosed && cnt > 1) continue;
		if(cnt == 0) continue;
		var innercomps = new Array();
		var _g32 = 0;
		var _g25 = components.length;
		while(_g32 < _g25) {
			var i4 = _g32++;
			if((bitfield1 >> i4 & 1) != 0) innercomps.push(components[i4]);
		}
		var bestPaths = null;
		var bestScore = 100000.0;
		var now = haxe.Timer.stamp();
		var validComb = true;
		var _g26 = 0;
		while(_g26 < innercomps.length) {
			var a = innercomps[_g26];
			++_g26;
			var _g33 = 0;
			while(_g33 < innercomps.length) {
				var b = innercomps[_g33];
				++_g33;
				if((function($this) {
					var $r;
					var this2;
					{
						var b1 = b.mean;
						var this3;
						var self = a.mean;
						this3 = new hxmath.math.Vector2Default(self.x,self.y);
						var self1 = this3;
						self1.x -= b1.x;
						self1.y -= b1.y;
						this2 = self1;
					}
					var self2 = this2;
					$r = self2.x * self2.x + self2.y * self2.y;
					return $r;
				}(this)) > 64) {
					validComb = false;
					break;
				}
			}
		}
		if(!validComb) continue;
		var res1 = AICollectorPoints.dfsMinimize(innercomps,0,new Array(),evaluateComponentCombination);
		if(res1 == null) continue;
		bestScore = res1.cost;
		bestPaths = res1.data;
		if(cid <= 100) {
			var dt = haxe.Timer.stamp() - now;
			haxe.Log.trace("Took " + dt * 1000,{ fileName : "AICollectorPoints.hx", lineNumber : 268, className : "AICollectorPoints", methodName : "fromSource"});
		}
		if(bestPaths != null) {
			var pid = 0;
			var id1 = HxOverrides.indexOf(components,innercomps[0],0);
			var id2;
			if(innercomps.length > 1) id2 = HxOverrides.indexOf(components,innercomps[1],0); else id2 = id1;
			if(id1 > id2) {
				var tmp = id1;
				id1 = id2;
				id2 = tmp;
			}
			haxe.Log.trace("Cost for " + id1 + ", " + id2 + " = " + bestScore,{ fileName : "AICollectorPoints.hx", lineNumber : 283, className : "AICollectorPoints", methodName : "fromSource"});
			results1[id1 * components.length + id2] = bestScore;
		}
	}
	var res2 = AICollectorPoints.findBestCombination(results1,components.length);
	var output = new Array();
	cid = 0;
	var _g10 = 0;
	var _g18 = res2.data;
	while(_g10 < _g18.length) {
		var combinationID = _g18[_g10];
		++_g10;
		var id11 = combinationID % components.length;
		var id21 = combinationID / components.length | 0;
		var innerComps = new Array();
		innerComps.push(components[id11]);
		if(id21 != id11) innerComps.push(components[id21]);
		haxe.Log.trace("Checking " + id11 + " " + id21,{ fileName : "AICollectorPoints.hx", lineNumber : 311, className : "AICollectorPoints", methodName : "fromSource"});
		var result = AICollectorPoints.dfsMinimize(innerComps,0,new Array(),evaluateComponentCombination);
		var totalPath = new Array();
		cid++;
		var pid1 = 0;
		var _g27 = 0;
		var _g34 = result.data;
		while(_g27 < _g34.length) {
			var path1 = _g34[_g27];
			++_g27;
			var _g41 = 0;
			while(_g41 < path1.length) {
				var node2 = path1[_g41];
				++_g41;
				totalPath.push(hxmath.math._IntVector2.IntVector2_Impl_._new(node2.x,node2.y));
			}
			pid1++;
			AICollectorPoints.addDeltaVecPath(costs,path1,6);
		}
		HxOverrides.remove(totalPath,totalPath[0]);
		var roots = new Array();
		var _g28 = 0;
		while(_g28 < innerComps.length) {
			var comp2 = innerComps[_g28];
			++_g28;
			roots.push(comp2.root);
		}
		output.push({ path : totalPath, roots : roots});
	}
	haxe.Log.trace(res2,{ fileName : "AICollectorPoints.hx", lineNumber : 337, className : "AICollectorPoints", methodName : "fromSource"});
	haxe.Log.trace(haxe.Timer.stamp() - AICollectorPoints.startTime,{ fileName : "AICollectorPoints.hx", lineNumber : 339, className : "AICollectorPoints", methodName : "fromSource"});
	haxe.Log.trace("TESTED: " + cid,{ fileName : "AICollectorPoints.hx", lineNumber : 340, className : "AICollectorPoints", methodName : "fromSource"});
	return output;
};
AICollectorPoints.findBestCombination = function(costs,n) {
	var rec = null;
	var bestCost = 1000000.0;
	var best = null;
	rec = function(used,index,cost,stack) {
		if(cost > bestCost) return;
		if(index == n) {
			haxe.Log.trace("Reached end with " + cost,{ fileName : "AICollectorPoints.hx", lineNumber : 369, className : "AICollectorPoints", methodName : "findBestCombination"});
			if(cost < bestCost) {
				bestCost = cost;
				best = stack.slice();
			}
			return;
		}
		if((used >> index & 1) != 0) rec(used,index + 1,cost,stack); else {
			var _g = index;
			while(_g < n) {
				var i = _g++;
				if((used >> i & 1) == 0 && costs[index * n + i] != -1) {
					var nused = used | 1 << index | 1 << i;
					var ncost = cost + costs[index * n + i];
					stack.push(index * n + i);
					rec(nused,index + 1,ncost,stack);
					stack.pop();
				}
			}
			rec(used,index + 1,cost + 10000,stack);
		}
	};
	rec(0,0,0,new Array());
	return { cost : bestCost, data : best};
};
AICollectorPoints.state2vec2 = function(state) {
	return state;
};
AICollectorPoints.point2intvector2 = function(p) {
	return hxmath.math._IntVector2.IntVector2_Impl_._new(p.x,p.y);
};
AICollectorPoints.dfsMinimize = function(comps,index,stack,f) {
	if(index >= comps.length) return f(stack);
	var best = null;
	if(comps[index].closed && false) {
		var _g = 0;
		var _g1 = comps[index].nodes;
		while(_g < _g1.length) {
			var node = _g1[_g];
			++_g;
			stack.push(node);
			var res = AICollectorPoints.dfsMinimize(comps,index + 1,stack,f);
			if(res != null && (best == null || res.cost < best.cost)) best = res;
			stack.pop();
		}
	} else {
		stack.push(comps[index].nodes[0]);
		var res1 = AICollectorPoints.dfsMinimize(comps,index + 1,stack,f);
		if(res1 != null && (best == null || res1.cost < best.cost)) best = res1;
		stack.pop();
		stack.push(comps[index].nodes[comps[index].nodes.length - 1]);
		res1 = AICollectorPoints.dfsMinimize(comps,index + 1,stack,f);
		if(res1 != null && (best == null || res1.cost < best.cost)) best = res1;
		stack.pop();
	}
	return best;
};
AICollectorPoints.markVec = function(room,path,prefix) {
	var id = 0;
	var _g = 0;
	while(_g < path.length) {
		var node = path[_g];
		++_g;
		room.createConstructionSite(node.x,node.y,"road");
		id++;
	}
};
AICollectorPoints.mark = function(room,path,prefix) {
	var id = 0;
	var _g = 0;
	while(_g < path.length) {
		var node = path[_g];
		++_g;
		room.createConstructionSite(node.x,node.y,"road");
		id++;
	}
};
AICollectorPoints.flag = function(room,path,prefix) {
	var id = 0;
	var _g = 0;
	while(_g < path.length) {
		var node = path[_g];
		++_g;
		room.createFlag(node.x,node.y,prefix + id);
		id++;
	}
};
AICollectorPoints.setAdjacent = function(map,x,y,v) {
	var _g1 = 0;
	var _g = AICollectorPoints.dx.length;
	while(_g1 < _g) {
		var i = _g1++;
		map[(y + AICollectorPoints.dy[i]) * 50 + x + AICollectorPoints.dx[i]] = v;
	}
};
AICollectorPoints.addDeltaVecPath = function(map,path,diff) {
	var _g = 0;
	while(_g < path.length) {
		var node = path[_g];
		++_g;
		if(map[node.y * 50 + node.x] != -1) map[node.y * 50 + node.x] += diff;
	}
};
AICollectorPoints.addDeltaPath = function(map,path,diff) {
	var _g = 0;
	while(_g < path.length) {
		var node = path[_g];
		++_g;
		if(map[node.y * 50 + node.x] != -1) map[node.y * 50 + node.x] += diff;
	}
};
AICollectorPoints.addDeltaNodes = function(map,path,diff) {
	var _g = 0;
	while(_g < path.length) {
		var node = path[_g];
		++_g;
		if(map[node.y * 50 + node.x] != -1) map[node.y * 50 + node.x] += diff;
	}
};
AICollectorPoints.longestPath = function(nodes) {
	var _g = 0;
	while(_g < nodes.length) {
		var node = nodes[_g];
		++_g;
		if(node.conns.length > 2) {
			haxe.Log.trace("NOT A PATH",{ fileName : "AICollectorPoints.hx", lineNumber : 514, className : "AICollectorPoints", methodName : "longestPath"});
			return null;
		}
	}
	if(nodes.length == 0) return [];
	var start = nodes[0];
	var parent = null;
	var node1 = start;
	var found = true;
	while(found) {
		found = false;
		var _g1 = 0;
		var _g11 = node1.conns;
		while(_g1 < _g11.length) {
			var other = _g11[_g1];
			++_g1;
			if(other != parent && other != start) {
				parent = node1;
				node1 = other;
				found = true;
				break;
			}
		}
	}
	start = node1;
	parent = null;
	found = true;
	var path = new Array();
	while(found) {
		found = false;
		path.push(node1);
		var _g2 = 0;
		var _g12 = node1.conns;
		while(_g2 < _g12.length) {
			var other1 = _g12[_g2];
			++_g2;
			if(other1 != parent && other1 != start) {
				parent = node1;
				node1 = other1;
				found = true;
				break;
			}
		}
	}
	return path;
};
AICollectorPoints.connect = function(nodes,onlySameRoot) {
	var seen = new haxe.ds.IntMap();
	var _g = 0;
	while(_g < nodes.length) {
		var node = nodes[_g];
		++_g;
		seen.set(node.y * 50 + node.x,node);
		node;
	}
	var dx = AICollectorPoints.dxq;
	var dy = AICollectorPoints.dyq;
	var _g1 = 0;
	while(_g1 < nodes.length) {
		var node1 = nodes[_g1];
		++_g1;
		var _g2 = 0;
		var _g11 = dx.length;
		while(_g2 < _g11) {
			var i = _g2++;
			var nx = node1.x + dx[i];
			var ny = node1.y + dy[i];
			if(nx >= 0 && ny >= 0 && nx < 50 && ny < 50 && seen.exists(ny * 50 + nx)) {
				var other = seen.get(ny * 50 + nx);
				if(!onlySameRoot || other.root == node1.root) node1.conns.push(other);
			}
		}
	}
};
AICollectorPoints.groupIntoComponents = function(nodes,assume1D) {
	var seen = new haxe.ds.ObjectMap();
	var rec = null;
	rec = function(accum,node) {
		if(seen.h.__keys__[node.__id__] != null) return;
		seen.set(node,true);
		true;
		accum.push(node);
		var _g = 0;
		var _g1 = node.conns;
		while(_g < _g1.length) {
			var other = _g1[_g];
			++_g;
			rec(accum,other);
		}
	};
	var components = new Array();
	var _g2 = 0;
	while(_g2 < nodes.length) {
		var node1 = nodes[_g2];
		++_g2;
		if(!(seen.h.__keys__[node1.__id__] != null)) {
			var ls = new Array();
			rec(ls,node1);
			var comp = new Component();
			comp.nodes = ls;
			if(assume1D) comp.nodes = AICollectorPoints.longestPath(comp.nodes);
			comp.root = hxmath.math._IntVector2.IntVector2_Impl_._new(comp.nodes[0].root.x,comp.nodes[0].root.y);
			var mean = new hxmath.math.Vector2Default(0,0);
			var _g11 = 0;
			while(_g11 < ls.length) {
				var node2 = ls[_g11];
				++_g11;
				node2.comp = comp;
				var b = new hxmath.math.Vector2Default(node2.x,node2.y);
				var this1;
				var self = mean;
				this1 = new hxmath.math.Vector2Default(self.x,self.y);
				var self1 = this1;
				self1.x += b.x;
				self1.y += b.y;
				mean = self1;
			}
			var s = 1.0 / ls.length;
			var this2;
			var self2 = mean;
			this2 = new hxmath.math.Vector2Default(self2.x,self2.y);
			var self3 = this2;
			self3.x *= s;
			self3.y *= s;
			comp.mean = self3;
			if(assume1D) comp.closed = HxOverrides.indexOf(comp.nodes[0].conns,comp.nodes[comp.nodes.length - 1],0) != -1;
			components.push(comp);
		}
	}
	return components;
};
AICollectorPoints.findUntil = function(sources,terrain,threshold,count,onlyBorder) {
	if(onlyBorder == null) onlyBorder = true;
	var dx = AIMap.dx;
	var dy = AIMap.dy;
	var result = new Array();
	var seen = new haxe.ds.IntMap();
	var pts = new PriorityQueue_Point();
	var _g = 0;
	while(_g < sources.length) {
		var source = sources[_g];
		++_g;
		pts.push(source);
		source.root = source;
		seen.set(source.y * 50 + source.x,true);
		true;
	}
	while(!pts.isEmpty()) {
		var state = pts.pop();
		if(threshold(state)) {
			result.push(state);
			if(result.length < count) continue; else break;
		}
		if(!onlyBorder) result.push(state);
		var _g1 = 0;
		var _g2 = dx.length;
		while(_g1 < _g2) {
			var i = _g1++;
			var nx = state.x + dx[i];
			var ny = state.y + dy[i];
			if(nx >= 0 && ny >= 0 && nx < 50 && ny < 50) {
				if(!seen.exists(ny * 50 + nx)) {
					if(terrain[(ny + 1) * 52 + nx + 1] == -1) continue;
					var next = new Point(nx,ny,state.f + 1);
					next.root = state.root;
					pts.push(next);
					seen.set(ny * 50 + nx,true);
					true;
				}
			}
		}
	}
	return result;
};
AICollectorPoints.__super__ = Base;
AICollectorPoints.prototype = $extend(Base.prototype,{
	internalInitialize: function() {
		this.type = "AICollectorPoints";
	}
});
var AIConstructionManager = function() {
	Base.call(this);
};
$hxClasses["AIConstructionManager"] = AIConstructionManager;
AIConstructionManager.__name__ = true;
AIConstructionManager.__super__ = Base;
AIConstructionManager.prototype = $extend(Base.prototype,{
	isStandalone: function() {
		return true;
	}
	,configure: function() {
		this.initialize();
		return this;
	}
	,tick: function() {
		if(this.roadManager == null) this.roadManager = new AIRoadConstructionManager().configure();
		if(Game.time % 10 != 5) return;
		var room;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		var complexityScore = this.manager.getComplexityScore();
		var latentEnergy = 0;
		var _g = 0;
		var _g1 = IDManager.spawns;
		while(_g < _g1.length) {
			var spawn = _g1[_g];
			++_g;
			latentEnergy += spawn.linked.energy;
		}
		var _g2 = 0;
		var _g11 = room.find(7);
		while(_g2 < _g11.length) {
			var ent = _g11[_g2];
			++_g2;
			var structure = ent;
			if(structure.my && structure.structureType == "extension") latentEnergy += structure.energy;
		}
		var roleCounts = [0,0,0,0,0,0,0];
		var _g12 = 0;
		var _g3 = roleCounts.length;
		while(_g12 < _g3) {
			var i = _g12++;
			roleCounts[i] = this.manager.getRoleCount(i);
		}
		var mxRoleCount = 0;
		var _g4 = 0;
		while(_g4 < roleCounts.length) {
			var val = roleCounts[_g4];
			++_g4;
			mxRoleCount = Std["int"](Math.max(mxRoleCount,val));
		}
		var dupScore = mxRoleCount / 5;
		var extensions = 0;
		var _g5 = 0;
		var _g13 = room.find(8);
		while(_g5 < _g13.length) {
			var ent1 = _g13[_g5];
			++_g5;
			var structure1 = ent1;
			if(structure1.structureType == "extension") extensions++;
		}
		var alreadyBuiltScore = -extensions * 10;
		var constructionSiteScore = 0.0;
		var _g6 = 0;
		var _g14 = IDManager.constructionSites;
		while(_g6 < _g14.length) {
			var site = _g14[_g6];
			++_g6;
			var _g21 = site.linked.structureType;
			switch(_g21) {
			case "road":
				constructionSiteScore -= 2;
				break;
			case "spawn":
				constructionSiteScore -= 15;
				break;
			case "extension":
				constructionSiteScore -= 12;
				break;
			default:
				constructionSiteScore -= 10;
			}
		}
		var earlyScore;
		if(IDManager.timeSinceStart < 200) earlyScore = -5; else earlyScore = 0;
		var latentEnergyScore = Math.max(latentEnergy - 300,0) / 120;
		haxe.Log.trace(dupScore + " " + alreadyBuiltScore + " " + constructionSiteScore + " " + latentEnergyScore + " " + complexityScore / 80 + " " + earlyScore,{ fileName : "AIConstructionManager.hx", lineNumber : 72, className : "AIConstructionManager", methodName : "tick"});
		var extensionScore = dupScore + alreadyBuiltScore + constructionSiteScore + latentEnergyScore + complexityScore / 80 + earlyScore;
		haxe.Log.trace("Extension Score: " + extensionScore,{ fileName : "AIConstructionManager.hx", lineNumber : 75, className : "AIConstructionManager", methodName : "tick"});
		if(extensionScore > 7) {
			var pos = this.manager.map.safeBuildingLocation();
			room.createFlag(pos,"Extension");
			haxe.Log.trace("Creating...",{ fileName : "AIConstructionManager.hx", lineNumber : 81, className : "AIConstructionManager", methodName : "tick"});
			haxe.Log.trace(room.createConstructionSite(pos.x,pos.y,"extension"),{ fileName : "AIConstructionManager.hx", lineNumber : 82, className : "AIConstructionManager", methodName : "tick"});
		}
		var spawns = IDManager.spawns.length;
		alreadyBuiltScore = -spawns * 15;
		var usedResourcesScore = this.manager.getRoleCount(0) / 3;
		var spawnScore = alreadyBuiltScore + 2 * constructionSiteScore + latentEnergyScore + complexityScore / 50 + earlyScore + usedResourcesScore;
		haxe.Log.trace("Spawn Score: " + spawnScore,{ fileName : "AIConstructionManager.hx", lineNumber : 96, className : "AIConstructionManager", methodName : "tick"});
		if(spawnScore > 7) {
			var pos1 = this.manager.map.spawnLocation();
			room.createFlag(pos1,"Spawn");
			haxe.Log.trace("Creating... ",{ fileName : "AIConstructionManager.hx", lineNumber : 103, className : "AIConstructionManager", methodName : "tick"});
			haxe.Log.trace(room.createConstructionSite(pos1.x,pos1.y,"spawn"),{ fileName : "AIConstructionManager.hx", lineNumber : 104, className : "AIConstructionManager", methodName : "tick"});
		}
		var buildPlans = this.roadManager.generateBuildPlans();
		var addedSites = 0;
		var _g7 = 0;
		while(_g7 < buildPlans.length) {
			var plan = buildPlans[_g7];
			++_g7;
			if(IDManager.constructionSites.length + addedSites < IDManager.spawns.length * 5) {
				room.createConstructionSite(plan.pos.x,plan.pos.y,plan.type);
				addedSites++;
			}
		}
	}
	,internalInitialize: function() {
		this.type = "AIConstructionManager";
	}
});
var AIConstructionSite = function() {
	AIAssigned.call(this);
};
$hxClasses["AIConstructionSite"] = AIConstructionSite;
AIConstructionSite.__name__ = true;
AIConstructionSite.__super__ = AIAssigned;
AIConstructionSite.prototype = $extend(AIAssigned.prototype,{
	get_src: function() {
		return this.linked;
	}
	,configure: function() {
		this.initialize();
		return this;
	}
	,tick: function() {
		if(this.previousProgress > this.linked.progress) this.lastProgress = Game.time;
		this.previousProgress = this.linked.progress;
		if(((Game.time - this.lastProgress) / 50 | 0) % 2 == 1) {
			haxe.Log.trace("Builders probably stuck",{ fileName : "AIConstructionSite.hx", lineNumber : 27, className : "AIConstructionSite", methodName : "tick"});
			this.maxAssignedCount = 0;
			this.cleanup();
			var _g = 0;
			var _g1 = this.assigned;
			while(_g < _g1.length) {
				var creep = _g1[_g];
				++_g;
				this.unassign(creep);
			}
			return;
		}
		var _g2 = this.linked.structureType;
		switch(_g2) {
		case "spawn":
			this.maxAssignedCount = Std["int"](Math.min((this.manager.getRoleCount(0) + this.manager.getRoleCount(5)) / 2,6));
			break;
		case "extension":
			this.maxAssignedCount = 3;
			break;
		case "road":
			this.maxAssignedCount = 1;
			break;
		case "constructedWall":
			this.maxAssignedCount = 2;
			break;
		case "rampart":
			this.maxAssignedCount = 1;
			break;
		}
		this.cleanup();
		if(this.assigned.length < this.maxAssignedCount || Game.time % 20 == 0) {
			var bestScore = -100000.0;
			var best = null;
			var _g3 = 0;
			var _g11 = IDManager.creeps;
			while(_g3 < _g11.length) {
				var creep1 = _g11[_g3];
				++_g3;
				if((creep1.role == 0 || creep1.role == 5) && creep1.linked.getActiveBodyparts("carry") > 0) {
					var score;
					if(creep1.role == 5) score = 10.0; else score = 0.0;
					if(creep1.originalRole == 5) score += 30;
					if(creep1.currentTarget == this) if(this.assigned.length < this.maxAssignedCount) score += -100; else score += 19; else if(creep1.currentTarget != null && creep1.currentTarget.type == "AIConstructionSite") continue;
					if(score > bestScore) {
						var path = creep1.linked.pos.findPathTo(this.linked.pos);
						if(path.length != 0 && this.linked.pos.isNearTo(path[path.length - 1])) {
							best = creep1;
							bestScore = score;
						}
					}
				}
			}
			if(best != null && best.currentTarget != this) {
				best.role = 5;
				this.assign(best,bestScore);
			}
		}
	}
	,internalInitialize: function() {
		this.type = "AIConstructionSite";
	}
});
var AICreep = function() {
	this.buildObstructed = 0;
	Base.call(this);
};
$hxClasses["AICreep"] = AICreep;
AICreep.__name__ = true;
AICreep.calculateRangedMassDamage = function(pos) {
	Profiler.start("calculateRangedMassDamage");
	var damage = 0;
	var _g = 0;
	var _g1 = IDManager.hostileCreeps;
	while(_g < _g1.length) {
		var ent = _g1[_g];
		++_g;
		if(!ent.my) {
			var dist;
			var b = ent.pos;
			dist = Std["int"](Math.max(Math.abs(pos.x - b.x),Math.abs(pos.y - b.y)));
			if(dist <= 3 && ent.getActiveBodyparts("ranged_attack") > 0) damage += AICreep.RangedMassAttackDamage[dist];
		}
	}
	Profiler.stop();
	return damage;
};
AICreep.__super__ = Base;
AICreep.prototype = $extend(Base.prototype,{
	get_src: function() {
		return this.linked;
	}
	,configure: function() {
		this.initialize(false);
		return this;
	}
	,onCreated: function() {
		this.manager.modRoleCount(this.role,1);
		this.manager.statistics.onCreepCreated(this.role);
	}
	,onDestroyed: function() {
		this.manager.modRoleCount(this.role,-1);
		this.manager.statistics.onCreepDeath(this.role);
	}
	,tick: function() {
		var _g = this.role;
		switch(_g) {
		case 0:
			this.harvester();
			break;
		case 1:case 6:
			this.meleeAttacker();
			break;
		case 2:
			this.rangedAttacker();
			break;
		case 5:
			this.builder();
			break;
		default:
			throw "Not supported";
		}
	}
	,builder: function() {
		if(this.currentTarget == null) {
			this.role = 0;
			this.harvester();
			return;
		}
		var bestLocScore = -10000.0;
		var bestLoc = null;
		var assignedIndex = HxOverrides.indexOf(this.currentTarget.assigned,this,0);
		var options = new Array();
		var _g1 = 0;
		var _g = AIMap.dx.length;
		while(_g1 < _g) {
			var i = _g1++;
			var nx = this.currentTarget.linked.pos.x + AIMap.dx[i];
			var ny = this.currentTarget.linked.pos.y + AIMap.dy[i];
			if(AIMap.getRoomPos(this.manager.map.getTerrainMap(),nx,ny) == -1) continue;
			var movementNearThis = 0.0;
			var movementOnThis = this.manager.map.movementPatternMapSlow[(ny + 1) * 52 + nx + 1];
			var _g3 = 0;
			var _g2 = AIMap.dx.length;
			while(_g3 < _g2) {
				var j = _g3++;
				var nx2 = nx + AIMap.dx[j];
				var ny2 = ny + AIMap.dy[j];
				movementNearThis += this.manager.map.movementPatternMapSlow[(ny2 + 1) * 52 + nx2 + 1];
			}
			var invalid = false;
			var _g21 = 0;
			var _g31 = IDManager.structures;
			while(_g21 < _g31.length) {
				var ent = _g31[_g21];
				++_g21;
				if(ent.pos.x == nx && ent.pos.y == ny) {
					invalid = true;
					break;
				}
			}
			var _g22 = 0;
			var _g32 = IDManager.creeps;
			while(_g22 < _g32.length) {
				var ent1 = _g32[_g22];
				++_g22;
				if((ent1.role == 0 || ent1.role == 5 && ent1 != this) && ent1.linked.pos.x == nx && ent1.linked.pos.y == ny) {
					invalid = true;
					break;
				}
			}
			var _g23 = 0;
			var _g33 = IDManager.constructionSites;
			while(_g23 < _g33.length) {
				var ent2 = _g33[_g23];
				++_g23;
				if(ent2.linked.pos.x == nx && ent2.linked.pos.y == ny) movementOnThis += 100;
			}
			if(!invalid) {
				var score = movementNearThis / 8 * 10 - 30 * movementOnThis - Math.abs(nx - this.linked.pos.x) - Math.abs(ny - this.linked.pos.y);
				if(this.prevBestBuildSpot != null && this.prevBestBuildSpot.x == nx && this.prevBestBuildSpot.y == ny && score > 0) score *= 2.0;
				options.push({ score : score, loc : this.linked.room.getPositionAt(nx,ny)});
			}
		}
		options.sort(function(a,b) {
			if(a.score < b.score) return 1; else if(a.score > b.score) return -1; else return 0;
		});
		bestLoc = options[0].loc;
		if(this.prevBestBuildSpot != null && (bestLoc.x != this.prevBestBuildSpot.x || bestLoc.y != this.prevBestBuildSpot.y)) {
		}
		this.prevBestBuildSpot = bestLoc;
		if(Game.flags["TG." + this.id] != null) Game.flags["TG." + this.id].remove();
		this.linked.room.createFlag(bestLoc.x,bestLoc.y,"TG." + this.id,"red");
		var near = this.linked.pos.x == bestLoc.x && this.linked.pos.y == bestLoc.y;
		var almostThere = this.linked.pos.isNearTo(bestLoc) || this.linked.pos.isNearTo(this.currentTarget.linked.pos);
		if(this.buildObstructed > 5) {
			if(this.currentTarget != null) {
				this.currentTarget.unassign(this);
				this.role = 0;
				this.harvester();
				this.buildObstructed = 0;
				return;
			}
		}
		if(this.linked.energy < this.linked.energyCapacity && (!almostThere || this.linked.energy == 0)) {
			var _g4 = maybe._Maybe.Maybe_Impl_.option(SCExtenders.findClosestFriendlySpawn(this.linked.pos));
			switch(_g4[1]) {
			case 0:
				var spawn = _g4[2];
				var spawnDist = this.linked.pos.findPathTo(spawn,{ ignoreCreeps : true}).length;
				if(this.linked.pos.isNearTo(spawn.pos)) spawn.transferEnergy(this.linked,Std["int"](Math.min(this.linked.energyCapacity - this.linked.energy,spawn.energy))); else this.linked.moveTo(spawn,{ heuristicWeight : 1});
				break;
			case 1:
				this.harvester();
				break;
			}
		} else if(!near) {
			var path = this.linked.pos.findPathTo(bestLoc);
			if(path.length == 0 || !bestLoc.isNearTo(path[path.length - 1])) {
				this.currentTarget.unassign(this);
				this.builder();
				return;
			}
			this.linked.moveTo(bestLoc,{ heuristicWeight : 1});
		}
		if(this.linked.pos.isNearTo(this.currentTarget.linked.pos)) {
			var constructionSite = this.currentTarget;
			var _g5 = this.linked.build(constructionSite.linked);
			switch(_g5) {
			case -7:
				this.buildObstructed++;
				break;
			default:
				this.buildObstructed = Std["int"](Math.max(this.buildObstructed - 1,0));
			}
		}
	}
	,timeToTraversePath: function(path) {
		if(path.length == 0) return 1000.0;
		var pathCost = this.manager.pathfinder.sumCost(path);
		var movement = this.linked.getActiveBodyparts("move");
		var weight = this.linked.body.length - movement;
		if(movement == 0) return 1000.0;
		return Math.min(path.length,pathCost * weight / movement);
	}
	,timeToTraversePathCost: function(pathCost) {
		if(pathCost < 0) return 1000.0;
		var movement = this.linked.getActiveBodyparts("move");
		if(movement == 0) return 1000.0;
		var weight = this.linked.body.length - movement;
		return pathCost * weight / movement;
	}
	,harvester: function() {
		var targetSource = this.currentTarget;
		if((targetSource == null || Game.time % 6 == this.id % 6) && this.linked.fatigue == 0) {
			var source = targetSource;
			var options = [];
			var _g = 0;
			var _g1 = IDManager.sources;
			while(_g < _g1.length) {
				var otherSource = _g1[_g];
				++_g;
				var approximateDistance = this.manager.pathfinder.approximateCloseDistance(this.linked.pos,otherSource.linked.pos);
				options.push({ dist : approximateDistance, source : otherSource});
			}
			options.sort(function(a,b) {
				if(a.dist > b.dist) return 1; else if(a.dist < b.dist) return -1; else return 0;
			});
			var earliestEnergyGather = Game.time + 1000000.0;
			var _g2 = 0;
			while(_g2 < options.length) {
				var option = options[_g2];
				++_g2;
				var otherSource1 = option.source;
				var path = this.manager.pathfinder.findPathTo(this.linked.pos,otherSource1.linked.pos);
				var timeToTraverse = this.timeToTraversePath(path);
				var sustainabilityFactor;
				if(otherSource1 == source) sustainabilityFactor = 1; else sustainabilityFactor = otherSource1.sustainabilityFactor;
				var newEarliestEnergyGather = Game.time + Math.max(timeToTraverse,otherSource1.linked.energy > 30?0:otherSource1.linked.ticksToRegeneration) / sustainabilityFactor;
				var actuallyNear = option.dist >= 0;
				if(actuallyNear && newEarliestEnergyGather < earliestEnergyGather && (targetSource == otherSource1 || otherSource1.betterAssignScore(-newEarliestEnergyGather))) {
					source = otherSource1;
					earliestEnergyGather = newEarliestEnergyGather;
					break;
				}
			}
			if(source != null) source.assign(this,-earliestEnergyGather); else if(targetSource != null) targetSource.unassign(this);
		}
		targetSource = this.currentTarget;
		if(this.linked.energy == this.linked.energyCapacity) {
		}
		if(targetSource != null) {
			if(this.linked.pos.isNearTo(targetSource.linked.pos)) {
				var _g3 = this.linked.harvest(targetSource.linked);
				switch(_g3) {
				case 0:
					this.manager.statistics.onMinedEnergy(this.linked.getActiveBodyparts("work") * 2);
					break;
				default:
				}
			} else {
				var _g4 = this.linked.moveTo(targetSource.linked,{ heuristicWeight : 1});
				switch(_g4) {
				case -7:case -2:
					this.buildObstructed++;
					break;
				default:
					this.buildObstructed = Std["int"](Math.max(this.buildObstructed - 1,0));
				}
			}
			var _g5 = 0;
			var _g11 = IDManager.creeps;
			while(_g5 < _g11.length) {
				var creep = _g11[_g5];
				++_g5;
				if(creep.role == 3) {
					if(this.linked.pos.isNearTo(creep.linked.pos)) this.linked.transferEnergy(creep.linked);
				}
			}
			if(this.buildObstructed > 5) targetSource.unassign(this);
		} else this.linked.moveTo(this.manager.map.getRegroupingPoint(this.id % this.manager.numRegroupingPoints));
	}
	,assignToDefences: function() {
		if(this.currentDefencePosition != null) return;
		var bestDef = null;
		var bestScore = 0.0;
		var _g = 0;
		var _g1 = IDManager.defences;
		while(_g < _g1.length) {
			var defence = _g1[_g];
			++_g;
			var score = defence.assignScore(this);
			if(score > bestScore) {
				bestScore = score;
				bestDef = defence;
			}
		}
		if(bestDef != null) bestDef.assign(this);
	}
	,moveToDefault: function() {
		if(this.currentDefencePosition != null) {
			var target = this.currentDefencePosition.getTargetPosition(this);
			var _g = this.linked.moveTo(target.x,target.y);
			switch(_g) {
			case -2:
				this.linked.moveTo(this.manager.map.getRegroupingPoint(this.id % this.manager.numRegroupingPoints));
				break;
			default:
			}
		} else this.linked.moveTo(this.manager.map.getRegroupingPoint(this.id % this.manager.numRegroupingPoints));
	}
	,meleeAttacker: function() {
		this.assignToDefences();
		var match = this.manager.assignment.getMatch(this);
		if(this.attackTarget == null || (function($this) {
			var $r;
			var a = $this.linked.pos;
			var b = $this.attackTarget.pos;
			$r = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
			return $r;
		}(this)) < 16 || Game.time % 6 == this.id % 6) {
			var _g = maybe._Maybe.Maybe_Impl_.option(SCExtenders.findClosestHostileCreep(this.linked.pos));
			switch(_g[1]) {
			case 0:
				var target = _g[2];
				this.attackTarget = target;
				break;
			case 1:
				this.attackTarget = null;
				break;
			}
		}
		if(match != null) this.linked.moveTo(match.x,match.y);
		if(this.attackTarget != null) {
			if(match == null) {
				if(this.linked.hits <= this.linked.hitsMax * 0.6) {
					haxe.Log.trace("Flee!!",{ fileName : "AICreep.hx", lineNumber : 421, className : "AICreep", methodName : "meleeAttacker"});
					this.moveToDefault();
				} else this.linked.moveTo(this.attackTarget,{ heuristicWeight : 1});
			}
			if(this.linked.pos.isNearTo(this.attackTarget.pos)) this.linked.attack(this.attackTarget);
		} else if(match == null) this.moveToDefault();
	}
	,preprocessAssignment: function(assignment) {
		if(this.role == 2) this.preprocessAssignmentRanged(assignment); else if(this.role == 1) this.preprocessAssignmentMelee(assignment);
	}
	,preprocessAssignmentMelee: function(assignment) {
		Profiler.start("preprocessAssignmentMelee");
		var targets = this.linked.pos.findInRange(3,2);
		var healthFactor = 0.5 + (1 - this.linked.hits / this.linked.hitsMax);
		if(this.linked.hits < this.linked.hitsMax) healthFactor += 0.5;
		var anyNonZero = false;
		var _g = 0;
		var _g1 = AICreep.near1x;
		while(_g < _g1.length) {
			var nx = _g1[_g];
			++_g;
			var _g2 = 0;
			var _g3 = AICreep.near1y;
			while(_g2 < _g3.length) {
				var ny = _g3[_g2];
				++_g2;
				var pos = this.linked.room.getPositionAt(this.linked.pos.x + nx,this.linked.pos.y + ny);
				if(AIMap.getRoomPos(this.manager.map.getTerrainMap(),this.linked.pos.x + nx,this.linked.pos.y + ny) < 0) continue;
				var anyOnThisPosition = false;
				var _g4 = 0;
				while(_g4 < targets.length) {
					var target = targets[_g4];
					++_g4;
					if(pos.equalsTo(target.pos)) {
						anyOnThisPosition = true;
						break;
					}
				}
				if(anyOnThisPosition) continue;
				var damage = 0;
				var _g41 = 0;
				while(_g41 < targets.length) {
					var target1 = targets[_g41];
					++_g41;
					if(pos.equalsTo(target1.pos)) {
					}
					if(pos.isNearTo(target1.pos)) {
						damage = this.linked.getActiveBodyparts("attack") * AICreep.MeleeAttackDamage;
						break;
					}
				}
				var potentialDamageOnMe = healthFactor * this.manager.map.potentialDamageMap[(this.linked.pos.y + ny + 1) * 52 + (this.linked.pos.x + nx) + 1];
				if(damage > 0) anyNonZero = true;
				var finalScore = 500 + (damage - potentialDamageOnMe | 0);
				assignment.add(this,this.linked.pos.x + nx,this.linked.pos.y + ny,finalScore);
			}
		}
		if(!anyNonZero) assignment.clearAllFor(this);
		Profiler.stop();
	}
	,preprocessAssignmentRanged: function(assignment) {
		Profiler.start("preprocessAssignmentRanged");
		var targets = this.linked.pos.findInRange(3,4);
		if(targets.length > 0) {
			var occ = new Array();
			var occ2 = new Array();
			var size = 9;
			var offset = Math.floor(size / 2);
			var _g = 0;
			while(_g < size) {
				var x = _g++;
				var _g1 = 0;
				while(_g1 < size) {
					var y = _g1++;
					occ.push(0);
					occ2.push(0);
				}
			}
			var _g2 = 0;
			while(_g2 < targets.length) {
				var target = targets[_g2];
				++_g2;
				var nx = target.pos.x - this.linked.pos.x + offset;
				var ny = target.pos.y - this.linked.pos.y + offset;
				occ[ny * size + nx] = 4;
			}
			var _g3 = 0;
			while(_g3 < 4) {
				var i = _g3++;
				var _g21 = 0;
				var _g11 = occ2.length;
				while(_g21 < _g11) {
					var j = _g21++;
					occ2[j] = 0;
				}
				var _g12 = 0;
				while(_g12 < size) {
					var y1 = _g12++;
					var _g22 = 0;
					while(_g22 < size) {
						var x1 = _g22++;
						occ2[y1 * size + x1] = Math.round(Math.max(occ[y1 * size + x1],occ2[y1 * size + x1]));
						var _g4 = 0;
						var _g31 = AICreep.dx.length;
						while(_g4 < _g31) {
							var di = _g4++;
							var nx1 = x1 + AICreep.dx[di];
							var ny1 = y1 + AICreep.dy[di];
							if(nx1 >= 0 && ny1 >= 0 && nx1 < size && ny1 < size) occ2[ny1 * size + nx1] = Math.round(Math.max(occ2[ny1 * size + nx1],occ[y1 * size + x1] - 1));
						}
					}
				}
				var tmp = occ;
				occ = occ2;
				occ2 = tmp;
			}
			var terrainMap = this.manager.map.getTerrainMap();
			var _g5 = 0;
			while(_g5 < size) {
				var y2 = _g5++;
				var _g13 = 0;
				while(_g13 < size) {
					var x2 = _g13++;
					if(terrainMap[(this.linked.pos.y + y2 - offset + 1) * 52 + (this.linked.pos.x + x2 - offset) + 1] < 0) occ[y2 * size + x2] = 6;
				}
			}
			var bestx = 0;
			var besty = 0;
			var bestScore = 1000;
			var bestDist = 1000;
			var _g6 = 0;
			while(_g6 < size) {
				var y3 = _g6++;
				var _g14 = 0;
				while(_g14 < size) {
					var x3 = _g14++;
					if(occ[y3 * size + x3] == 0) occ[y3 * size + x3] = 5;
				}
			}
			var _g7 = 0;
			while(_g7 < size) {
				var y4 = _g7++;
				var _g15 = 0;
				while(_g15 < size) {
					var x4 = _g15++;
					var score = occ[y4 * size + x4];
					var dist = (x4 - offset) * (x4 - offset) + (y4 - offset) * (y4 - offset);
					if(score < bestScore || score == bestScore && dist < bestDist) {
						bestScore = score;
						bestDist = dist;
						bestx = x4;
						besty = y4;
					}
				}
			}
			bestx -= offset;
			besty -= offset;
			if(bestScore < 5) {
				var potentialDamageOnMe = this.manager.map.potentialDamageMap[(this.linked.pos.y + besty + 1) * 52 + (this.linked.pos.x + bestx) + 1];
				assignment.add(this,this.linked.pos.x + bestx,this.linked.pos.y + besty,100 + (5 - bestScore - potentialDamageOnMe | 0));
			}
			var healthFactor = 0.5 + (1 - this.linked.hits / this.linked.hitsMax);
			if(this.linked.hits < this.linked.hitsMax) healthFactor += 1;
			var anyNonZero = false;
			var _g8 = 0;
			var _g16 = AICreep.near1x;
			while(_g8 < _g16.length) {
				var nx2 = _g16[_g8];
				++_g8;
				var _g23 = 0;
				var _g32 = AICreep.near1y;
				while(_g23 < _g32.length) {
					var ny2 = _g32[_g23];
					++_g23;
					var ox = nx2 + offset;
					var oy = ny2 + offset;
					var score1 = occ[oy * size + ox];
					if(score1 >= 5 || score1 == 0) score1 = 0; else score1 = 5 - score1;
					var potentialDamageOnMe1 = healthFactor * this.manager.map.potentialDamageMap[(this.linked.pos.y + ny2 + 1) * 52 + (this.linked.pos.x + nx2) + 1];
					var rangedParts = this.linked.getActiveBodyparts("ranged_attack");
					var massDamage = rangedParts * AICreep.calculateRangedMassDamage(this.linked.room.getPositionAt(this.linked.pos.x + nx2,this.linked.pos.y + ny2));
					var rangedDamage;
					if(score1 > 0) rangedDamage = rangedParts * 10; else rangedDamage = 0;
					var finalScore = 500 + Std["int"](Math.max(massDamage,rangedDamage) - potentialDamageOnMe1);
					if(massDamage > 0 || rangedDamage > 0) anyNonZero = true;
					assignment.add(this,this.linked.pos.x + nx2,this.linked.pos.y + ny2,finalScore);
				}
			}
			if(!anyNonZero) assignment.clearAllFor(this);
		}
		Profiler.stop();
	}
	,rangedAttacker: function() {
		this.assignToDefences();
		var targets = this.linked.pos.findInRange(3,3);
		var match = this.manager.assignment.getMatch(this);
		if(match != null) {
		}
		if(targets.length > 0) {
			var occ = new Array();
			var occ2 = new Array();
			var size = 5;
			var offset = Math.floor(size / 2);
			var _g = 0;
			while(_g < size) {
				var x = _g++;
				var _g1 = 0;
				while(_g1 < size) {
					var y = _g1++;
					occ.push(0);
					occ2.push(0);
				}
			}
			var _g2 = 0;
			while(_g2 < targets.length) {
				var target = targets[_g2];
				++_g2;
				var nx = target.pos.x - this.linked.pos.x + offset;
				var ny = target.pos.y - this.linked.pos.y + offset;
				occ[ny * size + nx] = 4;
			}
			var _g3 = 0;
			while(_g3 < 4) {
				var i = _g3++;
				var _g21 = 0;
				var _g11 = occ2.length;
				while(_g21 < _g11) {
					var j = _g21++;
					occ2[j] = 0;
				}
				var _g12 = 0;
				while(_g12 < size) {
					var x1 = _g12++;
					var _g22 = 0;
					while(_g22 < size) {
						var y1 = _g22++;
						occ2[y1 * size + x1] = Math.round(Math.max(occ[y1 * size + x1],occ2[y1 * size + x1]));
						var _g4 = 0;
						var _g31 = AICreep.dx.length;
						while(_g4 < _g31) {
							var di = _g4++;
							var nx1 = x1 + AICreep.dx[di];
							var ny1 = y1 + AICreep.dy[di];
							if(nx1 >= 0 && ny1 >= 0 && nx1 < size && ny1 < size) occ2[ny1 * size + nx1] = Math.round(Math.max(occ2[ny1 * size + nx1],occ[y1 * size + x1] - 1));
						}
					}
				}
				var tmp = occ;
				occ = occ2;
				occ2 = tmp;
			}
			var terrainMap = this.manager.map.getTerrainMap();
			var _g5 = 0;
			while(_g5 < size) {
				var x2 = _g5++;
				var _g13 = 0;
				while(_g13 < size) {
					var y2 = _g13++;
					if(terrainMap[(this.linked.pos.y + y2 - offset + 1) * 52 + (this.linked.pos.x + x2 - offset) + 1] < 0) occ[y2 * size + x2] = 6;
				}
			}
			var bestx = 0;
			var besty = 0;
			var bestScore = 1000;
			var bestDist = 1000;
			var _g6 = 0;
			while(_g6 < size) {
				var x3 = _g6++;
				var _g14 = 0;
				while(_g14 < size) {
					var y3 = _g14++;
					if(occ[y3 * size + x3] == 0) occ[y3 * size + x3] = 5;
				}
			}
			var _g7 = 0;
			while(_g7 < size) {
				var x4 = _g7++;
				var _g15 = 0;
				while(_g15 < size) {
					var y4 = _g15++;
					var score = occ[y4 * size + x4];
					var dist = (x4 - offset) * (x4 - offset) + (y4 - offset) * (y4 - offset);
					if(score < bestScore || score == bestScore && dist < bestDist) {
						bestScore = score;
						bestDist = dist;
						bestx = x4;
						besty = y4;
					}
				}
			}
			bestx -= offset;
			besty -= offset;
			var target1 = targets[0];
			if(this.linked.hits <= this.linked.hitsMax * 0.6) this.moveToDefault(); else if(match != null) this.linked.moveTo(match.x,match.y,{ heuristicWeight : 1}); else this.linked.moveTo(bestx + this.linked.pos.x,besty + this.linked.pos.y,{ heuristicWeight : 1});
			var potentialDamage = AICreep.calculateRangedMassDamage(this.linked.pos);
			if(this.linked.pos.inRangeTo(target1.pos,3) && AICreep.RangedAttackDamage >= potentialDamage) this.linked.rangedAttack(target1); else this.linked.rangedMassAttack();
		} else if(this.linked.hits <= this.linked.hitsMax * 0.6) this.moveToDefault(); else if(match != null) this.linked.moveTo(match.x,match.y,{ heuristicWeight : 1}); else {
			var _g8 = maybe._Maybe.Maybe_Impl_.option(SCExtenders.findClosestHostileCreep(this.linked.pos));
			switch(_g8[1]) {
			case 0:
				var target2 = _g8[2];
				this.linked.moveTo(target2,{ heuristicWeight : 1});
				break;
			case 1:
				this.moveToDefault();
				break;
			}
		}
	}
	,internalInitialize: function() {
		this.type = "AICreep";
	}
});
var AIDefenceManager = function() {
	this.timeSinceHostileSeen = 0;
	Base.call(this);
};
$hxClasses["AIDefenceManager"] = AIDefenceManager;
AIDefenceManager.__name__ = true;
AIDefenceManager.__super__ = Base;
AIDefenceManager.prototype = $extend(Base.prototype,{
	isStandalone: function() {
		return true;
	}
	,configure: function() {
		this.initialize();
		return this;
	}
	,tick: function() {
		this.timeSinceHostileSeen++;
		var room;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		if(room.find(3).length > 0) this.timeSinceHostileSeen = 0;
		if(IDManager.defences.length == 0) {
			var map = AIMap.createMap(52);
			var exits = new Array();
			var _g = 0;
			while(_g < 50) {
				var y = _g++;
				var _g1 = 0;
				while(_g1 < 50) {
					var x = _g1++;
					if(x == 0 || y == 0 || y == 49 || x == 49) {
						var res1 = room.lookAt({ x : x, y : y});
						var _g2 = 0;
						while(_g2 < res1.length) {
							var obj = res1[_g2];
							++_g2;
							if(obj.type == "exit") {
								haxe.Log.trace("Discovered exit at " + x + ", " + y,{ fileName : "AIDefenceManager.hx", lineNumber : 38, className : "AIDefenceManager", methodName : "tick"});
								map[(y + 1) * 52 + x + 1] = 10;
								exits.push(new Point(x,y,0));
								break;
							}
						}
					}
				}
			}
			var points = AICollectorPoints.findUntil(exits,this.manager.map.getTerrainMap(),function(p) {
				return p.f == 5;
			},100000,false);
			var nodeResults = points.map(function(p1) {
				return new CNode(p1.x,p1.y,p1.f,p1.root);
			});
			AICollectorPoints.connect(nodeResults,false);
			var components = AICollectorPoints.groupIntoComponents(nodeResults,false);
			var _g3 = 0;
			while(_g3 < components.length) {
				var comp = components[_g3];
				++_g3;
				var layers;
				var _g11 = [];
				var _g21 = 0;
				while(_g21 < 3) {
					var i = [_g21++];
					_g11.push(comp.nodes.filter((function(i) {
						return function(n) {
							return n.f == 2 + i[0];
						};
					})(i)));
				}
				layers = _g11;
				var pointLayers;
				var _g22 = [];
				var _g31 = 0;
				while(_g31 < layers.length) {
					var layer = layers[_g31];
					++_g31;
					_g22.push(layer.map(AICollectorPoints.point2intvector2));
				}
				pointLayers = _g22;
				var _g32 = 0;
				while(_g32 < pointLayers.length) {
					var layer1 = pointLayers[_g32];
					++_g32;
					ArrayTools.shuffle(layer1);
				}
				haxe.Log.trace("Found component with " + comp.nodes.length + " nodes [" + layers[0].length + ", " + layers[1].length + ", " + layers[2].length + "] " + pointLayers.length,{ fileName : "AIDefenceManager.hx", lineNumber : 67, className : "AIDefenceManager", methodName : "tick"});
				new AIDefencePosition().configure(pointLayers[0],pointLayers[1],pointLayers[2]);
			}
		}
	}
	,internalInitialize: function() {
		this.type = "AIDefenceManager";
	}
});
var AIDefencePosition = function() {
	this.spread = new Array();
	this.assigned = new Array();
	this.layers = new Array();
	Base.call(this);
};
$hxClasses["AIDefencePosition"] = AIDefencePosition;
AIDefencePosition.__name__ = true;
AIDefencePosition.__super__ = Base;
AIDefencePosition.prototype = $extend(Base.prototype,{
	isStandalone: function() {
		return true;
	}
	,configure: function(meleeLoc,rangedLoc,extraLoc) {
		this.initialize();
		this.layers.push(meleeLoc);
		this.layers.push(rangedLoc);
		this.layers.push(extraLoc);
		this.spread.push(false);
		this.spread.push(false);
		this.spread.push(false);
		var _g1 = 0;
		var _g = this.layers.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.assigned.push(new Array());
		}
		return this;
	}
	,getAssignedIndex: function(creep) {
		var _g1 = 0;
		var _g = this.assigned.length;
		while(_g1 < _g) {
			var layer = _g1++;
			var _g3 = 0;
			var _g2 = this.assigned[layer].length;
			while(_g3 < _g2) {
				var index = _g3++;
				if(this.assigned[layer][index] == creep) return haxe.ds.Option.Some({ layer : layer, index : index});
			}
		}
		return haxe.ds.Option.None;
	}
	,tick: function() {
		if(this.manager.defence.timeSinceHostileSeen == 0) {
			var _g1 = 0;
			var _g = this.layers.length;
			while(_g1 < _g) {
				var i = _g1++;
				this.spread[i] = false;
			}
		}
		if(this.manager.defence.timeSinceHostileSeen == 1) {
			var _g11 = 0;
			var _g2 = this.layers.length;
			while(_g11 < _g2) {
				var i1 = _g11++;
				this.spread[i1] = true;
			}
		}
		var _g12 = 0;
		var _g3 = this.layers.length;
		while(_g12 < _g3) {
			var i2 = _g12++;
			if(this.manager.defence.timeSinceHostileSeen > (i2 + 1) * 20) this.spread[i2] = false;
		}
	}
	,assignScore: function(creep) {
		this.clean();
		var layer;
		var _g = creep.role;
		switch(_g) {
		case 1:case 6:
			layer = 0;
			break;
		case 2:
			layer = 1;
			break;
		case 4:
			layer = 2;
			break;
		default:
			return 0;
		}
		var totalFullness = 0.0;
		var _g1 = 0;
		var _g2 = this.layers.length;
		while(_g1 < _g2) {
			var i = _g1++;
			if(this.layers[i].length > 0) totalFullness += this.assigned[i].length / this.layers[i].length; else totalFullness += 1;
		}
		totalFullness /= this.layers.length;
		var mult = 1.0;
		while(layer < this.layers.length && this.assigned[layer].length >= this.layers[layer].length) {
			layer++;
			mult *= 0.5;
		}
		var layerFullness;
		if(layer < this.layers.length && this.layers[layer].length > 0) layerFullness = this.assigned[layer].length / this.layers[layer].length; else layerFullness = 1;
		if(layerFullness == 1) return 0;
		return (1 - (layerFullness + totalFullness) * 0.5) * mult;
	}
	,clean: function() {
		var _g = 0;
		var _g1 = this.assigned;
		while(_g < _g1.length) {
			var layer = _g1[_g];
			++_g;
			var _g3 = 0;
			var _g2 = layer.length;
			while(_g3 < _g2) {
				var i = _g3++;
				if(layer[i] == null || layer[i].currentDefencePosition != this) {
					layer.splice(i,1);
					this.clean();
					return;
				}
			}
		}
	}
	,getTargetPosition: function(creep) {
		{
			var _g = this.getAssignedIndex(creep);
			switch(_g[1]) {
			case 0:
				var index = _g[2];
				if(this.spread[index.layer]) return this.manager.map.getRegroupingPoint(creep.id % this.manager.numRegroupingPoints); else return this.layers[index.layer][index.index];
				break;
			case 1:
				throw creep.id + " is not assigned to this defence position";
				break;
			}
		}
	}
	,assign: function(creep) {
		if(creep.currentDefencePosition == this) return true;
		this.clean();
		var layer;
		var _g = creep.role;
		switch(_g) {
		case 1:case 6:
			layer = 0;
			break;
		case 2:
			layer = 1;
			break;
		case 4:
			layer = 2;
			break;
		default:
			return false;
		}
		while(layer < this.layers.length && this.assigned[layer].length >= this.layers[layer].length) layer++;
		if(layer == this.layers.length) return false;
		this.assigned[layer].push(creep);
		creep.currentDefencePosition = this;
		return true;
	}
	,internalInitialize: function() {
		this.type = "AIDefencePosition";
	}
});
var AIEnergy = function() {
	this.lastNegativeDelta = 0;
	AIAssigned.call(this);
};
$hxClasses["AIEnergy"] = AIEnergy;
AIEnergy.__name__ = true;
AIEnergy.__super__ = AIAssigned;
AIEnergy.prototype = $extend(AIAssigned.prototype,{
	get_src: function() {
		return this.linked;
	}
	,tick: function() {
		var delta;
		if(this.linked.energy > this.prev) delta = this.linked.energy - this.prev; else {
			delta = 0;
			this.lastNegativeDelta = Game.time;
		}
		this.prev = this.linked.energy;
		if(((Game.time - this.lastNegativeDelta) / 50 | 0) % 2 == 1) {
			this.maxAssignedCount = 0;
			haxe.Log.trace("Units are probably stuck",{ fileName : "AIEnergy.hx", lineNumber : 25, className : "AIEnergy", methodName : "tick"});
			if(IDManager.spawns.length > 0) {
				var path = this.linked.pos.findPathTo(IDManager.spawns[0].linked.pos);
				if(path.length != 0 && IDManager.spawns[0].linked.pos.isNearTo(path[path.length - 1])) this.lastNegativeDelta = Game.time;
			}
		} else this.maxAssignedCount = Math.ceil((this.linked.energy + delta * 10) / 90);
	}
	,getQueuePoint: function(index) {
		if(this.queuePts == null) this.generateQueuePoints();
		if(this.queuePts.length == 0) return this.linked.pos;
		return this.queuePts[Std["int"](Math.min(Math.max(index,0),this.queuePts.length - 1))];
	}
	,generateQueuePoints: function() {
		var map = AIMap.createMap(52);
		var terrain = IDManager.manager.map.getTerrainMap();
		var _g = 0;
		var _g1 = IDManager.spawns;
		while(_g < _g1.length) {
			var spawn = _g1[_g];
			++_g;
			var path = this.linked.pos.findPathTo(spawn.linked,{ ignoreCreeps : true});
			var _g2 = 0;
			while(_g2 < path.length) {
				var node = path[_g2];
				++_g2;
				map[(node.y + 1) * 52 + node.x + 1] = 100;
			}
		}
		AIMap.smooth(map,1);
		var terrain1 = IDManager.manager.map.getTerrainMap();
		var result = AICollectorPoints.findUntil([new Point(this.linked.pos.x,this.linked.pos.y,0)],terrain1,function(v) {
			return map[(v.y + 1) * 52 + v.x + 1] == 0;
		},5);
		this.queuePts = new Array();
		var _g3 = 0;
		while(_g3 < result.length) {
			var pt = result[_g3];
			++_g3;
			this.queuePts.push({ x : pt.x, y : pt.y});
		}
	}
	,configure: function() {
		this.initialize();
		this.lastNegativeDelta = Game.time;
	}
	,internalInitialize: function() {
		this.type = "AIEnergy";
	}
});
var AIManager = function() {
	this.numRegroupingPoints = 1;
	this.extensionEnergyNeeded = 0;
	this.carrierNeeded = 0;
	this.roleCounter = [];
};
$hxClasses["AIManager"] = AIManager;
AIManager.__name__ = true;
AIManager.prototype = {
	configureProfiler: function() {
		Profiler.setInstance(this.profiler);
		this.profiler = Profiler.getInstance();
		Profiler.tick();
	}
	,tick: function() {
		if(this.carrierNeeded > 0) this.carrierNeeded *= 0.95;
		this.extensionEnergyNeeded *= 0.9;
		if(this.defence == null) this.defence = new AIDefenceManager().configure();
		if(this.statistics == null) this.statistics = new AIStatistics().configure();
		if(this.constructionManager == null) this.constructionManager = new AIConstructionManager().configure();
		if(this.map == null) this.map = new AIMap().configure();
		if(this.pathfinder == null) this.pathfinder = new AIPathfinder().configure();
		var friendlyMilitary = this.getRoleCount(1) + this.getRoleCount(6) + this.getRoleCount(2) + this.getRoleCount(4);
		this.numRegroupingPoints = (friendlyMilitary / 15 | 0) + 1;
		this.defence.tick();
		var room;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		var _g = 0;
		var _g1 = room.find(6);
		while(_g < _g1.length) {
			var ent = _g1[_g];
			++_g;
			var energy = ent;
			this.carrierNeeded += 0.01 * Math.max(energy.energy - 100,0) / this.getRoleCount(3);
		}
		this.pathfinder.tick();
		if(Game.time % 10 == 8) {
			var _g2 = 0;
			var _g11 = IDManager.constructionSites;
			while(_g2 < _g11.length) {
				var site = _g11[_g2];
				++_g2;
			}
		}
		if((this.workerPaths == null || this.workerPaths.length == 0) && IDManager.spawns.length > 0 && Game.time % 20 == 12) {
			if(this.workerPaths != null) {
				var _g3 = 0;
				var _g12 = this.workerPaths;
				while(_g3 < _g12.length) {
					var path = _g12[_g3];
					++_g3;
					path.destroy();
				}
			}
			this.workerPaths = new Array();
			var infos = AICollectorPoints.fromSource(room.find(5));
			var _g4 = 0;
			while(_g4 < infos.length) {
				var info = infos[_g4];
				++_g4;
				var workerPath = new WorkerPath().configure(info);
				this.workerPaths.push(workerPath);
			}
		}
		this.map.tick();
		this.constructionManager.tick();
	}
	,getComplexityScore: function() {
		var complexityScore = IDManager.creeps.length * 2 + IDManager.spawns.length * 50;
		var _g = 0;
		var _g1 = IDManager.creeps;
		while(_g < _g1.length) {
			var creep = _g1[_g];
			++_g;
			complexityScore += creep.linked.body.length;
		}
		return complexityScore;
	}
	,getOriginalRoleCount: function(role) {
		var counter = 0;
		var _g = 0;
		var _g1 = IDManager.creeps;
		while(_g < _g1.length) {
			var creep = _g1[_g];
			++_g;
			if(creep.originalRole == role) counter++;
		}
		return counter;
	}
	,getRoleCount: function(role) {
		var counter = 0;
		var _g = 0;
		var _g1 = IDManager.creeps;
		while(_g < _g1.length) {
			var creep = _g1[_g];
			++_g;
			if(creep.role == role) counter++;
		}
		return counter;
	}
	,modRoleCount: function(role,diff) {
	}
};
var _AIManager = {};
_AIManager.Role_Impl_ = function() { };
$hxClasses["_AIManager.Role_Impl_"] = _AIManager.Role_Impl_;
_AIManager.Role_Impl_.__name__ = true;
var AIMap = function() {
	Base.call(this);
};
$hxClasses["AIMap"] = AIMap;
AIMap.__name__ = true;
AIMap.getRoomPos = function(map,x,y) {
	return map[(y + 1) * 52 + x + 1];
};
AIMap.setRoomPos = function(map,x,y,value) {
	map[(y + 1) * 52 + x + 1] = value;
};
AIMap.addDeltaRoomPos = function(map,x,y,delta) {
	map[(y + 1) * 52 + x + 1] += delta;
};
AIMap.addMap = function(map,add,factor) {
	if(map.length != add.length) throw "Map dimensions must match\n" + Std.string(haxe.CallStack.callStack());
	var _g1 = 0;
	var _g = map.length;
	while(_g1 < _g) {
		var i = _g1++;
		map[i] += add[i] * factor;
	}
};
AIMap.decay = function(map,factor) {
	var _g1 = 0;
	var _g = map.length;
	while(_g1 < _g) {
		var i = _g1++;
		map[i] *= factor;
	}
};
AIMap.mask = function(map,mask) {
	var _g1 = 0;
	var _g = map.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(mask[i] > 0) map[i] = map[i]; else map[i] = 0;
	}
};
AIMap.maskWithReplacement = function(map,mask,replacement) {
	var _g1 = 0;
	var _g = map.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(mask[i] >= 0) map[i] = map[i]; else map[i] = replacement;
	}
};
AIMap.smoothCross = function(map,iterations) {
	var map1 = map;
	var map2 = AIMap.tmpMap;
	var size = Std["int"](Math.sqrt(map.length));
	var _g = 0;
	while(_g < iterations) {
		var it = _g++;
		var _g2 = 1;
		var _g1 = size - 1;
		while(_g2 < _g1) {
			var y = _g2++;
			var _g4 = 1;
			var _g3 = size - 1;
			while(_g4 < _g3) {
				var x = _g4++;
				var v = map1[y * size + x];
				var _g5 = 0;
				while(_g5 < 4) {
					var i = _g5++;
					v += map1[(y + AIMap.dy[i]) * size + x + AIMap.dx[i]];
				}
				map2[y * size + x] = v / 5;
			}
		}
		var tmp = map1;
		map1 = map2;
		map2 = tmp;
	}
	if(iterations % 2 == 1) {
		AIMap.zero(map2);
		AIMap.addMap(map2,map1,1);
	}
};
AIMap.smoothBox = function(map,iterations) {
	var map1 = map;
	var map2 = AIMap.tmpMap;
	var size = Std["int"](Math.sqrt(map.length));
	var _g = 0;
	while(_g < iterations) {
		var it = _g++;
		var _g2 = 1;
		var _g1 = size - 1;
		while(_g2 < _g1) {
			var y = _g2++;
			var _g4 = 1;
			var _g3 = size - 1;
			while(_g4 < _g3) {
				var x = _g4++;
				var v = 0.0;
				var _g5 = -1;
				while(_g5 < 2) {
					var i = _g5++;
					v += map1[y * size + x + i];
				}
				map2[y * size + x] = v;
			}
		}
		var _g21 = 1;
		var _g11 = size - 1;
		while(_g21 < _g11) {
			var y1 = _g21++;
			var _g41 = 1;
			var _g31 = size - 1;
			while(_g41 < _g31) {
				var x1 = _g41++;
				var v1 = 0.0;
				var _g51 = -1;
				while(_g51 < 2) {
					var i1 = _g51++;
					v1 += map2[(y1 + i1) * size + x1];
				}
				v1 /= 9;
				map1[y1 * size + x1] = v1;
			}
		}
	}
};
AIMap.smooth = function(map,iterations) {
	var map1 = map;
	var map2 = AIMap.tmpMap;
	var gauss = [];
	var kernelSize = iterations * 2 + 1;
	var sigma = kernelSize * 0.182;
	var _g = 0;
	while(_g < kernelSize) {
		var i = _g++;
		var x = i - iterations;
		gauss.push(1 / Math.sqrt(2 * Math.PI * sigma * sigma) * Math.exp(-(x * x) / (2 * sigma * sigma)));
	}
	var size = Std["int"](Math.sqrt(map.length));
	var _g1 = 1;
	var _g2 = size - 1;
	while(_g1 < _g2) {
		var y = _g1++;
		var _g3 = 1;
		var _g21 = size - 1;
		while(_g3 < _g21) {
			var x1 = _g3++;
			var v = 0.0;
			var _g5 = Std["int"](Math.max(x1 - iterations,0));
			var _g4 = Std["int"](Math.min(x1 + iterations + 1,size - 1));
			while(_g5 < _g4) {
				var i1 = _g5++;
				v += map1[y * size + i1] * gauss[i1 - x1 + iterations];
			}
			map2[y * size + x1] = v;
		}
	}
	var _g11 = 1;
	var _g6 = size - 1;
	while(_g11 < _g6) {
		var y1 = _g11++;
		var _g31 = 1;
		var _g22 = size - 1;
		while(_g31 < _g22) {
			var x2 = _g31++;
			var v1 = 0.0;
			var _g51 = Std["int"](Math.max(y1 - iterations,0));
			var _g41 = Std["int"](Math.min(y1 + iterations + 1,size - 1));
			while(_g51 < _g41) {
				var i2 = _g51++;
				v1 += map2[i2 * size + x2] * gauss[i2 - y1 + iterations];
			}
			map1[y1 * size + x2] = v1;
		}
	}
};
AIMap.smoothWithMask = function(map,iterations,mask) {
	var map1 = map;
	var map2 = AIMap.tmpMap;
	var size = Std["int"](Math.sqrt(map.length));
	var _g = 0;
	while(_g < iterations) {
		var it = _g++;
		var _g2 = 1;
		var _g1 = size - 1;
		while(_g2 < _g1) {
			var y = _g2++;
			var _g4 = 1;
			var _g3 = size - 1;
			while(_g4 < _g3) {
				var x = _g4++;
				var v = 0.0;
				var cnt = 0;
				var _g5 = -1;
				while(_g5 < 2) {
					var i = _g5++;
					if(mask[y * size + x * i] >= 0) {
						v += map1[y * size + x + i];
						cnt++;
					}
				}
				if(cnt > 0) v /= cnt;
				map2[y * size + x] = v;
			}
		}
		var _g21 = 1;
		var _g11 = size - 1;
		while(_g21 < _g11) {
			var y1 = _g21++;
			var _g41 = 1;
			var _g31 = size - 1;
			while(_g41 < _g31) {
				var x1 = _g41++;
				var v1 = 0.0;
				var cnt1 = 0;
				var _g51 = -1;
				while(_g51 < 2) {
					var i1 = _g51++;
					if(mask[(y1 + i1) * size + x1] >= 0) {
						v1 += map2[(y1 + i1) * size + x1];
						cnt1++;
					}
				}
				if(cnt1 > 0) v1 /= cnt1;
				map1[y1 * size + x1] = v1;
			}
		}
	}
};
AIMap.findmin = function(map) {
	var min = 10000000.0;
	var minIndex = 0;
	var _g1 = 1;
	var _g = 51;
	while(_g1 < _g) {
		var y = _g1++;
		var _g3 = 1;
		var _g2 = 51;
		while(_g3 < _g2) {
			var x = _g3++;
			if(map[y * 52 + x] < min) {
				min = map[y * 52 + x];
				minIndex = y * 52 + x;
			}
		}
	}
	return { x : minIndex % 52 | 0, y : minIndex / 52 | 0};
};
AIMap.findmins = function(map) {
	var min = 10000000.0;
	var minIndex = 0;
	var mins = new Array();
	var size = Std["int"](Math.sqrt(map.length));
	var _g1 = 1;
	var _g = size - 1;
	while(_g1 < _g) {
		var y = _g1++;
		var _g3 = 1;
		var _g2 = size - 1;
		while(_g3 < _g2) {
			var x = _g3++;
			var minimum = true;
			var val = map[y * 52 + x];
			var _g5 = 0;
			var _g4 = AIMap.dx.length;
			while(_g5 < _g4) {
				var i = _g5++;
				minimum = minimum && val < map[(y + AIMap.dy[i]) * 52 + (x + AIMap.dx[i])];
			}
			if(minimum) mins.push({ x : x, y : y, value : val});
		}
	}
	return mins;
};
AIMap.createMap = function(size) {
	var map = new Array();
	var _g = 0;
	while(_g < size) {
		var y = _g++;
		var _g1 = 0;
		while(_g1 < size) {
			var x = _g1++;
			map.push(0);
		}
	}
	return map;
};
AIMap.convertToString = function(map) {
	var size = Std["int"](Math.sqrt(map.length));
	var s = "";
	var _g1 = 1;
	var _g = size - 1;
	while(_g1 < _g) {
		var y = _g1++;
		var _g3 = 1;
		var _g2 = size - 1;
		while(_g3 < _g2) {
			var x = _g3++;
			s += (map[y * size + x] | 0) + " ";
		}
		s += "\n";
	}
};
AIMap.zero = function(map) {
	var _g1 = 0;
	var _g = map.length;
	while(_g1 < _g) {
		var i = _g1++;
		map[i] = 0;
	}
};
AIMap.setMap = function(map,value) {
	var _g1 = 0;
	var _g = map.length;
	while(_g1 < _g) {
		var i = _g1++;
		map[i] = value;
	}
};
AIMap.generatePotentialDamageMap = function() {
	var map = AIMap.createMap(52);
	var creeps = ((function($this) {
		var $r;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room = $it0.next();
				res = room;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		$r = this1;
		return $r;
	}(this))).find(3);
	var _g = 0;
	while(_g < creeps.length) {
		var creep = creeps[_g];
		++_g;
		if(!creep.my) {
			var ranged = creep.getActiveBodyparts("ranged_attack");
			var melee = creep.getActiveBodyparts("attack");
			haxe.Log.trace("Found " + ranged + " " + melee,{ fileName : "AIMap.hx", lineNumber : 669, className : "AIMap", methodName : "generatePotentialDamageMap"});
			if(ranged > 0) {
				var range = 3;
				var _g2 = -range;
				var _g1 = range + 1;
				while(_g2 < _g1) {
					var dx = _g2++;
					var nx = creep.pos.x + dx;
					if(nx >= 0 && nx < 50) {
						var _g4 = -range;
						var _g3 = range + 1;
						while(_g4 < _g3) {
							var dy = _g4++;
							var ny = creep.pos.y + dy;
							if(ny >= 0 && ny < 50) {
								var dist = Std["int"](Math.max(Math.abs(dx),Math.abs(dy)));
								map[(ny + 1) * 52 + nx + 1] += AIMap.RangedAttackDamageAverage[dist] * ranged;
							}
						}
					}
				}
			}
			if(melee > 0) {
				haxe.Log.trace("Found melee attacker " + melee,{ fileName : "AIMap.hx", lineNumber : 689, className : "AIMap", methodName : "generatePotentialDamageMap"});
				var range1 = 1;
				var _g21 = -range1;
				var _g11 = range1 + 1;
				while(_g21 < _g11) {
					var dx1 = _g21++;
					var nx1 = creep.pos.x + dx1;
					if(nx1 >= 0 && nx1 < 50) {
						var _g41 = -range1;
						var _g31 = range1 + 1;
						while(_g41 < _g31) {
							var dy1 = _g41++;
							var ny1 = creep.pos.y + dy1;
							if(ny1 >= 0 && ny1 < 50) map[(ny1 + 1) * 52 + nx1 + 1] += AIMap.MeleeAttackDamage * melee;
						}
					}
				}
			}
		}
	}
	AIMap.smoothBox(map,1);
	return map;
};
AIMap.__super__ = Base;
AIMap.prototype = $extend(Base.prototype,{
	isStandalone: function() {
		return true;
	}
	,getTerrainMap: function() {
		if(this.terrainMap == null) this.terrainMap = this.generateTerrainMap((function($this) {
			var $r;
			var this1;
			{
				var res = null;
				var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
				while( $it0.hasNext() ) {
					var room = $it0.next();
					res = room;
				}
				this1 = res;
			}
			if(this1 == null) throw "Extracting null Maybe";
			$r = this1;
			return $r;
		}(this)));
		return this.terrainMap;
	}
	,configure: function() {
		this.initialize();
		return this;
	}
	,tick: function() {
		var _g = this;
		if(this.movementPatternMap == null) this.movementPatternMap = AIMap.createMap(52);
		if(this.movementPatternMapSlow == null) this.movementPatternMapSlow = AIMap.createMap(52);
		if(this.terrainMap == null) this.getTerrainMap();
		if(AIMap.tmpMap == null) AIMap.tmpMap = AIMap.createMap(52);
		var _g1 = 0;
		var _g11 = IDManager.creeps;
		while(_g1 < _g11.length) {
			var creep = _g11[_g1];
			++_g1;
			if(creep.my) {
				var _g2 = creep.role;
				switch(_g2) {
				case 3:
					var pos = creep.linked.pos;
					this.movementPatternMap[(pos.y + 1) * 52 + pos.x + 1] += 100;
					if(creep.linked.fatigue > 0) this.movementPatternMapSlow[(pos.y + 1) * 52 + pos.x + 1] += 50;
					break;
				default:
				}
			}
		}
		AIMap.decay(this.movementPatternMap,0.97);
		AIMap.decay(this.movementPatternMapSlow,0.985);
		this.potentialDamageMap = AIMap.generatePotentialDamageMap();
		if(Game.time % 20 == 3) {
			var room;
			var this1;
			{
				var res = null;
				var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
				while( $it0.hasNext() ) {
					var room1 = $it0.next();
					res = room1;
				}
				this1 = res;
			}
			if(this1 == null) throw "Extracting null Maybe";
			room = this1;
			this.regroupingMap = haxe.Timer.measure(function() {
				return _g.generateRegroupingMap(room);
			},{ fileName : "AIMap.hx", lineNumber : 87, className : "AIMap", methodName : "tick"});
		}
	}
	,generateTerrainMap: function(room) {
		var map = AIMap.createMap(52);
		var tiles = room.lookAtArea(0,0,49,49);
		var _g = 0;
		while(_g < 50) {
			var y = _g++;
			var _g1 = 0;
			while(_g1 < 50) {
				var x = _g1++;
				var res = tiles[y][x];
				var score = 2;
				var _g2 = 0;
				while(_g2 < res.length) {
					var item = res[_g2];
					++_g2;
					if(item.type == "terrain") {
						if(item.terrain == "wall") {
							score = -1;
							break;
						}
						if(item.terrain == "swamp") score = 10;
					}
					if(item.type == "exit") {
						score = -1;
						break;
					}
				}
				map[(y + 1) * 52 + x + 1] = score;
			}
		}
		return map;
	}
	,generateRegroupingMap: function(room) {
		Profiler.start("generateRegroupingMap");
		var map;
		map = AIMap.createMap(52);
		AIMap.zero(map);
		var terrain = this.getTerrainMap();
		var _g = 0;
		while(_g < 50) {
			var y = _g++;
			var _g1 = 0;
			while(_g1 < 50) {
				var x = _g1++;
				var score = terrain[(y + 1) * 52 + x + 1];
				if(score == -1) score = 10;
				score *= 100;
				score += Math.log(this.movementPatternMap[(y + 1) * 52 + x + 1] + 1) * 150;
				map[(y + 1) * 52 + x + 1] = score;
			}
		}
		var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.spawns);
		while( $it0.hasNext() ) {
			var spawn = $it0.next();
			if(spawn.my) map[(spawn.pos.y + 1) * 52 + spawn.pos.x + 1] += -6500; else map[(spawn.pos.y + 1) * 52 + spawn.pos.x + 1] += 500;
		}
		haxe.Timer.measure(function() {
			AIMap.smooth(map,4);
		},{ fileName : "AIMap.hx", lineNumber : 477, className : "AIMap", methodName : "generateRegroupingMap"});
		var $it1 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.spawns);
		while( $it1.hasNext() ) {
			var spawn1 = $it1.next();
			if(spawn1.my) map[(spawn1.pos.y + 1) * 52 + spawn1.pos.x + 1] += 1000;
		}
		AIMap.smooth(map,6);
		var $it2 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.flags);
		while( $it2.hasNext() ) {
			var flag = $it2.next();
			flag.remove();
		}
		var mins = AIMap.findmins(map);
		var _g11 = 0;
		var _g2 = mins.length;
		while(_g11 < _g2) {
			var i = _g11++;
			mins[i] = { x : mins[i].x - 1, y : mins[i].y - 1, value : mins[i].value};
		}
		var spawns = room.find(12);
		var bestScore = -100000.0;
		var bestPos_x = 0;
		var bestPos_y = 0;
		var bestPos_value = 0;
		var _g3 = 0;
		while(_g3 < mins.length) {
			var min = mins[_g3];
			++_g3;
			var path = spawns[0].pos.findPathTo(min,{ ignoreCreeps : true});
			var score1;
			if(path.length != 0) score1 = -path.length; else score1 = -1000;
			score1 -= min.value * 0.5;
			min.value = score1;
		}
		var _g4 = 0;
		while(_g4 < mins.length) {
			var min1 = mins[_g4];
			++_g4;
			var _g12 = 0;
			while(_g12 < mins.length) {
				var min2 = mins[_g12];
				++_g12;
				if(min1 != min2 && min1.value > min2.value && (min1.x - min2.x) * (min1.x - min2.x) + (min1.y - min2.y) * (min1.y - min2.y) < 64) min2.value = -1000;
			}
		}
		mins.sort(function(a,b) {
			if(a.value > b.value) return -1; else if(a.value < b.value) return 1; else return 0;
		});
		this.regroupingPoints = mins;
		var _g5 = 0;
		while(_g5 < 5) {
			var i1 = _g5++;
			if(i1 < mins.length) room.createFlag(this.regroupingPoints[i1].x,this.regroupingPoints[i1].y,"" + (i1 | 0));
		}
		Profiler.stop();
		return map;
	}
	,getRegroupingPoint: function(index) {
		if(this.regroupingPoints == null || this.regroupingPoints.length == 0) return { x : 0, y : 0};
		return this.regroupingPoints[Std["int"](Math.min(this.regroupingPoints.length,index))];
	}
	,spawnLocation: function() {
		var map = AIMap.createMap(52);
		var _g = 0;
		var _g1 = IDManager.spawns;
		while(_g < _g1.length) {
			var spawn = _g1[_g];
			++_g;
			var targetDistance = 20;
			var _g3 = 1;
			var _g2 = 51;
			while(_g3 < _g2) {
				var y = _g3++;
				var _g5 = 1;
				var _g4 = 51;
				while(_g5 < _g4) {
					var x = _g5++;
					var dist;
					var a_x = x - 1;
					var a_y = y - 1;
					var b = spawn.linked.pos;
					dist = (a_x - b.x) * (a_x - b.x) + (a_y - b.y) * (a_y - b.y);
					var delta = 1 - Math.sqrt(dist) / targetDistance;
					if(delta > 0) map[y * 52 + x] += delta * 400;
				}
			}
		}
		var _g6 = 0;
		var _g11 = IDManager.constructionSites;
		while(_g6 < _g11.length) {
			var spawn1 = _g11[_g6];
			++_g6;
			if(spawn1.linked.structureType == "spawn") {
				var targetDistance1 = 20;
				var _g31 = 1;
				var _g21 = 51;
				while(_g31 < _g21) {
					var y1 = _g31++;
					var _g51 = 1;
					var _g41 = 51;
					while(_g51 < _g41) {
						var x1 = _g51++;
						var dist1;
						var a_x1 = x1 - 1;
						var a_y1 = y1 - 1;
						var b1 = spawn1.linked.pos;
						dist1 = (a_x1 - b1.x) * (a_x1 - b1.x) + (a_y1 - b1.y) * (a_y1 - b1.y);
						var delta1 = 1 - Math.sqrt(dist1) / targetDistance1;
						if(delta1 > 0) map[y1 * 52 + x1] += delta1 * 400;
					}
				}
			}
		}
		var sources = IDManager.spawns[0].linked.room.find(5);
		var sourceConnections = [];
		var _g7 = 0;
		while(_g7 < sources.length) {
			var source = sources[_g7];
			++_g7;
			var conn = 0;
			var _g22 = 0;
			var _g12 = AIMap.dx.length;
			while(_g22 < _g12) {
				var i = _g22++;
				var nx = source.pos.x + AIMap.dx[i];
				var ny = source.pos.y + AIMap.dy[i];
				if(nx >= 0 && ny >= 0 && nx < 50 && ny < 50) {
					var terrain = source.room.lookAt({ x : nx, y : ny});
					if(this.terrainMap[(ny + 1) * 52 + nx + 1] != -1) conn++;
				}
			}
			var targetDistance2 = 5;
			var _g23 = 1;
			var _g13 = 51;
			while(_g23 < _g13) {
				var y2 = _g23++;
				var _g42 = 1;
				var _g32 = 51;
				while(_g42 < _g32) {
					var x2 = _g42++;
					var dist2;
					var a_x2 = x2 - 1;
					var a_y2 = y2 - 1;
					var b2 = source.pos;
					dist2 = (a_x2 - b2.x) * (a_x2 - b2.x) + (a_y2 - b2.y) * (a_y2 - b2.y);
					var manhattan;
					var a_x3 = x2 - 1;
					var a_y3 = y2 - 1;
					var b3 = source.pos;
					manhattan = Std["int"](Math.max(Math.abs(a_x3 - b3.x),Math.abs(a_y3 - b3.y)));
					var delta2 = 1 - Math.abs(Math.sqrt(dist2) - targetDistance2) / targetDistance2;
					if(delta2 > 0) map[y2 * 52 + x2] += delta2 * -100;
					if(manhattan < 5) map[y2 * 52 + x2] += 20000;
				}
			}
		}
		var map2 = AIMap.createMap(52);
		AIMap.addMap(map2,this.movementPatternMap,-0.25);
		AIMap.smooth(map2,2);
		var _g14 = 0;
		var _g8 = this.terrainMap.length;
		while(_g14 < _g8) {
			var i1 = _g14++;
			if(this.terrainMap[i1] == -1) map2[i1] = 200;
		}
		AIMap.smoothBox(map2,1);
		var _g15 = 0;
		var _g9 = this.terrainMap.length;
		while(_g15 < _g9) {
			var i2 = _g15++;
			if(this.terrainMap[i2] == -1) map2[i2] = 10000;
		}
		AIMap.addMap(map,map2,1);
		var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.structures);
		while( $it0.hasNext() ) {
			var structure = $it0.next();
			map[(structure.pos.y + 1) * 52 + structure.pos.x + 1] += 10000;
		}
		var _g10 = 0;
		var _g16 = IDManager.constructionSites;
		while(_g10 < _g16.length) {
			var structure1 = _g16[_g10];
			++_g10;
			map[(structure1.linked.pos.y + 1) * 52 + structure1.linked.pos.x + 1] += 10000;
		}
		var room = sources[0].room;
		var mins = AIMap.findmins(map);
		mins.sort(function(a,b4) {
			if(a.value > b4.value) return 1; else if(a.value < b4.value) return -1; else return 0;
		});
		var _g17 = 0;
		while(_g17 < 5) {
			var i3 = _g17++;
			if(i3 < mins.length) room.createFlag(mins[i3].x - 1,mins[i3].y - 1,"Spawn" + (i3 | 0));
		}
		this.buildSpawnMap = map;
		var mn = AIMap.findmin(map);
		return { x : mn.x - 1, y : mn.y - 1};
	}
	,safeBuildingLocation: function() {
		var map = AIMap.createMap(52);
		var _g = 0;
		var _g1 = IDManager.spawns;
		while(_g < _g1.length) {
			var spawn = _g1[_g];
			++_g;
			map[(spawn.linked.pos.y + 1) * 52 + spawn.linked.pos.x + 1] += -80000;
		}
		AIMap.smooth(map,8);
		var _g2 = 0;
		var _g11 = IDManager.spawns;
		while(_g2 < _g11.length) {
			var spawn1 = _g11[_g2];
			++_g2;
			map[(spawn1.linked.pos.y + 1) * 52 + spawn1.linked.pos.x + 1] += 40000;
		}
		AIMap.smooth(map,3);
		var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.structures);
		while( $it0.hasNext() ) {
			var structure = $it0.next();
			map[(structure.pos.y + 1) * 52 + structure.pos.x + 1] += 4000;
		}
		AIMap.smooth(map,3);
		AIMap.addMap(map,this.terrainMap,100);
		AIMap.maskWithReplacement(map,this.terrainMap,1000);
		var map2 = AIMap.createMap(52);
		AIMap.addMap(map2,this.movementPatternMap,-2);
		AIMap.smooth(map2,2);
		AIMap.smoothBox(map2,1);
		var _g12 = 0;
		var _g3 = this.terrainMap.length;
		while(_g12 < _g3) {
			var i = _g12++;
			if(this.terrainMap[i] == -1) map[i] = 10000;
		}
		AIMap.addMap(map,map2,1);
		AIMap.zero(map2);
		var _g4 = 0;
		var _g13 = IDManager.spawns;
		while(_g4 < _g13.length) {
			var structure1 = _g13[_g4];
			++_g4;
			map2[(structure1.linked.pos.y + 1) * 52 + structure1.linked.pos.x + 1] += 10000;
		}
		var $it1 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.structures);
		while( $it1.hasNext() ) {
			var structure2 = $it1.next();
			map2[(structure2.pos.y + 1) * 52 + structure2.pos.x + 1] += 10000;
		}
		var _g5 = 0;
		var _g14 = IDManager.constructionSites;
		while(_g5 < _g14.length) {
			var structure3 = _g14[_g5];
			++_g5;
			map2[(structure3.linked.pos.y + 1) * 52 + structure3.linked.pos.x + 1] += 10000;
		}
		AIMap.smoothBox(map2,1);
		AIMap.addMap(map,map2,1);
		AIMap.setMap(map2,-1);
		var room;
		var this1;
		{
			var res = null;
			var $it2 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it2.hasNext() ) {
				var room1 = $it2.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		var _g6 = 0;
		var _g15 = IDManager.sources;
		while(_g6 < _g15.length) {
			var source = _g15[_g6];
			++_g6;
			map2[(source.linked.pos.y + 1) * 52 + source.linked.pos.x + 1] += -1000;
		}
		AIMap.smoothBox(map2,1);
		var _g7 = 0;
		var _g16 = IDManager.manager.workerPaths;
		while(_g7 < _g16.length) {
			var workerPath = _g16[_g7];
			++_g7;
			var _g21 = 0;
			var _g31 = workerPath.path;
			while(_g21 < _g31.length) {
				var node = _g31[_g21];
				++_g21;
				map2[(node.y + 1) * 52 + node.x + 1] += 10;
			}
		}
		AIMap.maskWithReplacement(map2,this.terrainMap,-1);
		AIMap.smoothCross(map2,1);
		var _g8 = 0;
		var _g17 = IDManager.manager.workerPaths;
		while(_g8 < _g17.length) {
			var workerPath1 = _g17[_g8];
			++_g8;
			var _g22 = 0;
			var _g32 = workerPath1.path;
			while(_g22 < _g32.length) {
				var node1 = _g32[_g22];
				++_g22;
				map2[(node1.y + 1) * 52 + node1.x + 1] = -1;
			}
		}
		AIMap.maskWithReplacement(map,map2,10000);
		this.buildLocMap = map;
		var mn = AIMap.findmin(map);
		return { x : mn.x - 1, y : mn.y - 1};
	}
	,internalInitialize: function() {
		this.type = "AIMap";
	}
});
var State = function(x,y,g,f,dir) {
	this.x = x;
	this.y = y;
	this.g = g;
	this.f = f;
	this.pathID = 100000;
	this.target = false;
	this.parent = null;
	this.heapIndex = -1;
	this.direction = dir;
};
$hxClasses["State"] = State;
State.__name__ = true;
var PriorityQueue_State = function() {
	this.nextElementIndex = 1;
	this.data = new Array();
	this.data.push(null);
};
$hxClasses["PriorityQueue_State"] = PriorityQueue_State;
PriorityQueue_State.__name__ = true;
PriorityQueue_State.prototype = {
	isEmpty: function() {
		return this.nextElementIndex == 1;
	}
	,clear: function() {
		var _g1 = 1;
		var _g = this.nextElementIndex;
		while(_g1 < _g) {
			var i = _g1++;
			this.data[i].heapIndex = -1;
		}
		this.nextElementIndex = 1;
	}
	,push: function(v) {
		if(v.heapIndex < this.nextElementIndex && this.data[v.heapIndex] == v) {
			this.trickle(v.heapIndex);
			return;
		}
		if(this.data.length == this.nextElementIndex) this.data.push(v); else this.data[this.nextElementIndex] = v;
		v.heapIndex = this.nextElementIndex;
		this.trickle(this.nextElementIndex);
		this.nextElementIndex++;
	}
	,pushOrTrickle: function(v) {
		if(v.heapIndex != -1) {
			if(this.data[v.heapIndex] != v) throw "Invalid state";
			this.trickle(v.heapIndex);
		} else this.push(v);
	}
	,trickle: function(index) {
		while(index != 1) {
			var parent = Math.floor(index / 2);
			if(this.data[parent].f > this.data[index].f) {
				var tmp = this.data[parent];
				this.data[parent] = this.data[index];
				this.data[parent].heapIndex = parent;
				this.data[index] = tmp;
				this.data[index].heapIndex = index;
				index = parent;
			} else break;
		}
	}
	,pop: function() {
		if(this.nextElementIndex == 1) return null;
		var toReturn = this.data[1];
		toReturn.heapIndex = -1;
		var index = 1;
		this.nextElementIndex--;
		if(this.nextElementIndex == 1) return toReturn;
		var obj = this.data[this.nextElementIndex];
		while(true) {
			var swapIndex = this.nextElementIndex;
			var ind2 = index * 2;
			if(ind2 + 1 < this.nextElementIndex) {
				if(this.data[swapIndex].f > this.data[ind2].f) swapIndex = ind2;
				if(this.data[swapIndex].f > this.data[ind2 + 1].f) swapIndex = ind2 + 1;
			} else if(ind2 < this.nextElementIndex) {
				if(this.data[swapIndex].f > this.data[ind2].f) swapIndex = ind2;
			}
			if(swapIndex != this.nextElementIndex) {
				this.data[index] = this.data[swapIndex];
				this.data[index].heapIndex = index;
				index = swapIndex;
			} else break;
		}
		this.data[index] = obj;
		this.data[index].heapIndex = index;
		return toReturn;
	}
};
var AIPathfinder = function() {
	this.pathID = 0;
	Base.call(this);
};
$hxClasses["AIPathfinder"] = AIPathfinder;
AIPathfinder.__name__ = true;
AIPathfinder.findClosestNode = function(pos,costs,customCosts) {
	var dx = 1;
	var dy = 0;
	var segmentLength = 1;
	var x = pos.x;
	var y = pos.y;
	var nodeCounter = 0;
	var _g = 0;
	while(_g < 625) {
		var i = _g++;
		if(x >= 0 && y >= 0 && x < 50 && y < 50) {
			if(costs[y * 50 + x] != -1 && (customCosts == null || customCosts[y * 50 + x] != -1)) return { x : x, y : y};
		}
		x += dx;
		y += dy;
		nodeCounter++;
		if(nodeCounter == segmentLength) {
			var tmp = dx;
			dx = -dy;
			dy = tmp;
			if(dy == 0) segmentLength++;
			nodeCounter = 0;
		}
	}
	return null;
};
AIPathfinder.traversable = function(x,y,costs,customCosts) {
	return costs[y * 50 + x] != -1 && (customCosts == null || customCosts[y * 50 + x] != -1);
};
AIPathfinder.__super__ = Base;
AIPathfinder.prototype = $extend(Base.prototype,{
	isStandalone: function() {
		return true;
	}
	,configure: function() {
		this.initialize();
		return this;
	}
	,tick: function() {
		AIPathfinder.nodes = new Array();
		var _g = 0;
		while(_g < 50) {
			var y = _g++;
			var _g1 = 0;
			while(_g1 < 50) {
				var x = _g1++;
				AIPathfinder.nodes.push(new State(x,y,0,0,-1));
			}
		}
		if(this.costs == null) {
			this.costs = new Array();
			var terrain = IDManager.manager.map.getTerrainMap();
			var _g2 = 0;
			while(_g2 < 50) {
				var y1 = _g2++;
				var _g11 = 0;
				while(_g11 < 50) {
					var x1 = _g11++;
					this.costs.push(terrain[(y1 + 1) * 52 + x1 + 1]);
					if(this.costs[y1 * 50 + x1] == 0) this.costs[y1 * 50 + x1] += 1;
				}
			}
			AIPathfinder.costsWUnits = this.costs.slice();
			var room;
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			room = res;
			var allCreeps = IDManager.allCreeps;
			var _g3 = 0;
			while(_g3 < allCreeps.length) {
				var creep = allCreeps[_g3];
				++_g3;
				AIPathfinder.costsWUnits[creep.pos.y * 50 + creep.pos.x] = -1;
			}
			var _g4 = 0;
			var _g12 = IDManager.structures;
			while(_g4 < _g12.length) {
				var structure = _g12[_g4];
				++_g4;
				AIPathfinder.costsWUnits[structure.pos.y * 50 + structure.pos.x] = -1;
			}
		}
		if(this.calculatedPivots < this.heuristicPivotCount && this.heuristicValues != null && this.heuristicValues.length == AIPathfinder.nodes.length * this.heuristicPivotCount && Screeps.getCPULeft() > 40) {
			this.calculatePivot(this.heuristicValues,this.heuristicPivotCount,this.calculatedPivots);
			this.calculatedPivots++;
		} else if(this.calculatedPivots < this.heuristicPivotCount) haxe.Log.trace("Trying to calculate pivots but: " + Std.string(this.heuristicValues != null) + " " + (this.heuristicValues != null?"" + this.heuristicValues.length:"<null>") + " == " + AIPathfinder.nodes.length * this.heuristicPivotCount,{ fileName : "AIPathfinder.hx", lineNumber : 100, className : "AIPathfinder", methodName : "tick"});
		if(this.heuristicValues == null || this.heuristicValues.length != AIPathfinder.nodes.length * this.heuristicPivotCount) {
			this.heuristicPivotCount = 5;
			this.calculatedPivots = 0;
			this.heuristicValues = this.calculateHeuristicOptimization(this.heuristicPivotCount);
		}
	}
	,approximateCloseDistance: function(from,to) {
		var mn = 100000.0;
		var _g = 0;
		var _g1 = AIPathfinder.near1y;
		while(_g < _g1.length) {
			var dy = _g1[_g];
			++_g;
			var _g2 = 0;
			var _g3 = AIPathfinder.near1x;
			while(_g2 < _g3.length) {
				var dx = _g3[_g2];
				++_g2;
				mn = Math.min(mn,this.approximateDistance(from,{ x : to.x + dx, y : to.y + dy}));
			}
		}
		if(mn > 5000) return -1.0;
		return mn;
	}
	,approximateDistance: function(from,to) {
		var val = Math.max(Math.abs(from.x - to.x),Math.abs(from.y - to.y));
		var idx = from.y * 50 + from.x;
		var idx2 = to.y * 50 + to.x;
		var _g1 = 0;
		var _g = this.heuristicPivotCount;
		while(_g1 < _g) {
			var i = _g1++;
			val = Math.max(val,this.heuristicValues[idx * this.heuristicPivotCount + i] - this.heuristicValues[idx2 * this.heuristicPivotCount + i]);
			val = Math.max(val,this.heuristicValues[idx2 * this.heuristicPivotCount + i] - this.heuristicValues[idx * this.heuristicPivotCount + i] - this.costs[idx] + this.costs[idx2]);
		}
		return val;
	}
	,h: function(node,hTarget) {
		return this.approximateDistance(node,hTarget);
	}
	,tracePath: function(node) {
		var res = [];
		while(node != null) {
			res.push(node);
			node = node.parent;
		}
		res.reverse();
		return res;
	}
	,sumCost: function(path,customCosts) {
		var sum = 0.0;
		var _g = 0;
		while(_g < path.length) {
			var node = path[_g];
			++_g;
			var v = this.costs[node.y * 50 + node.x];
			if(v > 0) sum += v;
		}
		if(customCosts != null) {
			var _g1 = 0;
			while(_g1 < path.length) {
				var node1 = path[_g1];
				++_g1;
				var v1 = customCosts[node1.y * 50 + node1.x];
				if(v1 > 0) sum += v1;
			}
		}
		return sum;
	}
	,findClosestNodeDefault: function(pos) {
		return AIPathfinder.findClosestNode(pos,AIPathfinder.costsWUnits,null);
	}
	,findPathTo: function(from,to,options) {
		var costMap;
		if(options != null && options.ignoreCreeps) costMap = this.costs; else costMap = AIPathfinder.costsWUnits;
		var res = this.findPathNew(from,to,true,costMap,options);
		if(res == null) return [];
		res.splice(0,1);
		return res;
	}
	,findPathNew: function(from,to,ignoreStartEnd,costs,options,customCosts) {
		this.pathID++;
		AIPathfinder.queue.clear();
		var closest = AIPathfinder.findClosestNode(to,costs,customCosts);
		if(closest == null) return null;
		AIPathfinder.nodes[closest.y * 50 + closest.x].target = true;
		var start = AIPathfinder.nodes[from.y * 50 + from.x];
		if(!ignoreStartEnd) {
			if(costs[start.y * 50 + start.x] == -1 || (customCosts != null?customCosts[start.y * 50 + start.x]:0) == -1) return null;
		}
		start.parent = null;
		start.pathID = this.pathID;
		start.g = 0;
		start.f = 0;
		AIPathfinder.queue.push(start);
		var result = null;
		var searchedNodes = 0;
		while(!AIPathfinder.queue.isEmpty()) {
			searchedNodes++;
			var state = AIPathfinder.queue.pop();
			if(state.target) {
				result = this.tracePath(state);
				break;
			}
			var _g = 0;
			while(_g < 8) {
				var i = _g++;
				var nx = state.x + AIPathfinder.dx[i];
				var ny = state.y + AIPathfinder.dy[i];
				if(nx >= 0 && ny >= 0 && nx < 50 && ny < 50) {
					var other = AIPathfinder.nodes[ny * 50 + nx];
					var edgeCost;
					edgeCost = costs[ny * 50 + nx] + (customCosts != null?customCosts[ny * 50 + nx]:0);
					if(i >= 4) edgeCost *= 1.4142;
					var nextg = state.g + edgeCost;
					if(other.pathID != this.pathID || nextg < other.g) {
						if(i >= 4) {
							var bx = costs[ny * 50 + state.x] == -1 || customCosts != null && customCosts[ny * 50 + state.x] == -1;
							var by = costs[state.y * 50 + nx] == -1 || customCosts != null && customCosts[state.y * 50 + nx] == -1;
							if(bx && by) continue;
						}
						if(!other.target) {
							if(costs[ny * 50 + nx] == -1) continue;
							if(customCosts != null && customCosts[ny * 50 + nx] == -1) continue;
						}
						other.pathID = this.pathID;
						other.parent = state;
						other.g = nextg;
						other.f = other.g + this.approximateDistance(other,closest);
						AIPathfinder.queue.pushOrTrickle(other);
					}
				}
			}
		}
		AIPathfinder.nodes[closest.y * 50 + closest.x].target = false;
		return result;
	}
	,displaySearched: function() {
		var room;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		var _g = 0;
		var _g1 = AIPathfinder.nodes;
		while(_g < _g1.length) {
			var node = _g1[_g];
			++_g;
			if(node.pathID == this.pathID) room.createFlag(node.x,node.y,node.x + "," + node.y,"green");
		}
	}
	,calculateHeuristicOptimization: function(pivotCount) {
		var heuristicValues = [];
		var _g1 = 0;
		var _g = AIPathfinder.nodes.length;
		while(_g1 < _g) {
			var j = _g1++;
			var _g2 = 0;
			while(_g2 < pivotCount) {
				var i = _g2++;
				heuristicValues.push(10000.0);
			}
		}
		return heuristicValues;
	}
	,calculatePivot: function(heuristicValues,pivotCount,pivotIndex) {
		var nextNode = null;
		var maxVal = -1.0;
		var bx = 0;
		var by = 0;
		var _g = 0;
		while(_g < 50) {
			var y = _g++;
			var _g1 = 0;
			while(_g1 < 50) {
				var x = _g1++;
				var idx = y * 50 + x;
				if(this.costs[idx] != -1) {
					var minDistance = 1000.0;
					var _g3 = pivotCount * idx;
					var _g2 = pivotCount * (idx + 1);
					while(_g3 < _g2) {
						var j = _g3++;
						minDistance = Math.min(minDistance,heuristicValues[j]);
					}
					if(minDistance > maxVal) {
						maxVal = minDistance;
						bx = x;
						by = y;
					}
				}
			}
		}
		var result = this.flood({ x : bx, y : by});
		var _g4 = 0;
		while(_g4 < result.length) {
			var node = result[_g4];
			++_g4;
			var idx1 = node.y * 50 + node.x;
			heuristicValues[idx1 * pivotCount + pivotIndex] = Math.floor(node.g - this.costs[idx1]);
		}
		haxe.Log.trace("Calculated pivot index " + pivotIndex + " to " + bx + "," + by,{ fileName : "AIPathfinder.hx", lineNumber : 403, className : "AIPathfinder", methodName : "calculatePivot"});
		var room;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		room.createFlag(bx,by,"F" + pivotIndex,"cyan");
	}
	,flood: function(from) {
		this.pathID++;
		AIPathfinder.queue.clear();
		var start = AIPathfinder.nodes[from.y * 50 + from.x];
		start.parent = null;
		start.pathID = this.pathID;
		start.g = 0;
		start.f = 0;
		AIPathfinder.queue.push(start);
		var result = [];
		result.push(start);
		while(!AIPathfinder.queue.isEmpty()) {
			var state = AIPathfinder.queue.pop();
			var _g = 0;
			while(_g < 8) {
				var i = _g++;
				var nx = state.x + AIPathfinder.dx[i];
				var ny = state.y + AIPathfinder.dy[i];
				if(nx >= 0 && ny >= 0 && nx < 50 && ny < 50) {
					var other = AIPathfinder.nodes[ny * 50 + nx];
					var edgeCost = this.costs[ny * 50 + nx];
					if(i >= 4) edgeCost *= 1.4142;
					var nextg = state.g + edgeCost;
					if(other.pathID != this.pathID || nextg < other.g) {
						if(i >= 4) {
							var bx = this.costs[ny * 50 + state.x] == -1;
							var by = this.costs[state.y * 50 + nx] == -1;
							if(bx && by) continue;
						}
						if(this.costs[ny * 50 + nx] == -1) continue;
						if(other.pathID != this.pathID) result.push(other);
						other.pathID = this.pathID;
						other.parent = state;
						other.g = nextg;
						other.f = other.g;
						AIPathfinder.queue.pushOrTrickle(other);
					}
				}
			}
		}
		return result;
	}
	,findPath: function(from,to,ignoreStartEnd,options,customCosts) {
		this.pathID++;
		AIPathfinder.queue.clear();
		AIPathfinder.nodes[to.y * 50 + to.x].target = true;
		var start = AIPathfinder.nodes[from.y * 50 + from.x];
		if(!ignoreStartEnd) {
			if(this.costs[start.y * 50 + start.x] == -1 || (customCosts != null?customCosts[start.y * 50 + start.x]:0) == -1) return null;
		}
		start.parent = null;
		start.pathID = this.pathID;
		start.g = 0;
		start.f = 0;
		AIPathfinder.queue.push(start);
		var result = null;
		while(!AIPathfinder.queue.isEmpty()) {
			var state = AIPathfinder.queue.pop();
			if(state.target) {
				result = this.tracePath(state);
				break;
			}
			var _g = 0;
			while(_g < 8) {
				var i = _g++;
				var nx = state.x + AIPathfinder.dx[i];
				var ny = state.y + AIPathfinder.dy[i];
				if(nx >= 0 && ny >= 0 && nx < 50 && ny < 50) {
					var other = AIPathfinder.nodes[ny * 50 + nx];
					var nextg;
					nextg = state.g + this.costs[ny * 50 + nx] + (customCosts != null?customCosts[ny * 50 + nx]:0);
					var nextg1;
					nextg1 = nextg + (i >= 4?0.005:0);
					if(other.pathID != this.pathID || nextg1 < other.g) {
						if(i >= 4) {
							var bx = this.costs[ny * 50 + state.x] == -1 || customCosts != null && customCosts[ny * 50 + state.x] == -1;
							var by = this.costs[state.y * 50 + nx] == -1 || customCosts != null && customCosts[state.y * 50 + nx] == -1;
							if(bx && by) continue;
						}
						if(this.costs[ny * 50 + nx] == -1) continue;
						if(customCosts != null && customCosts[ny * 50 + nx] == -1) continue;
						if(this.costs[ny * 50 + nx] < 0) throw "INVALID COST " + this.costs[ny * 50 + nx];
						if(customCosts != null && customCosts[ny * 50 + nx] < 0) throw "INVALID COST " + customCosts[ny * 50 + nx];
						other.pathID = this.pathID;
						other.parent = state;
						other.g = nextg1;
						other.f = other.g + this.approximateDistance(other,to);
						AIPathfinder.queue.pushOrTrickle(other);
					}
				}
			}
		}
		var _g1 = 0;
		while(_g1 < 8) {
			var i1 = _g1++;
			var nx1 = to.x + AIPathfinder.near1x[i1];
			var ny1 = to.y + AIPathfinder.near1y[i1];
			if(nx1 >= 0 && ny1 >= 0 && nx1 < 50 && ny1 < 50) AIPathfinder.nodes[ny1 * 50 + nx1].target = false;
		}
		return result;
	}
	,internalInitialize: function() {
		this.type = "AIPathfinder";
	}
});
var AIRoadConstructionManager = function() {
	Base.call(this);
};
$hxClasses["AIRoadConstructionManager"] = AIRoadConstructionManager;
AIRoadConstructionManager.__name__ = true;
AIRoadConstructionManager.__super__ = Base;
AIRoadConstructionManager.prototype = $extend(Base.prototype,{
	isStandalone: function() {
		return true;
	}
	,configure: function() {
		this.initialize();
		return this;
	}
	,generateBuildPlans: function() {
		if(this.roadMap == null) this.roadMap = AIMap.createMap(50);
		var room;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		var earlyScore;
		if(IDManager.timeSinceStart < 100) earlyScore = 50; else earlyScore = 0;
		var constructionSiteScore = IDManager.constructionSites.length * 10;
		var latentEnergy = 0;
		var _g = 0;
		var _g1 = IDManager.spawns;
		while(_g < _g1.length) {
			var spawn = _g1[_g];
			++_g;
			latentEnergy += spawn.linked.energy;
		}
		var _g2 = 0;
		var _g11 = room.find(7);
		while(_g2 < _g11.length) {
			var ent = _g11[_g2];
			++_g2;
			var structure = ent;
			if(structure.my && structure.structureType == "extension") latentEnergy += structure.energy;
		}
		var movementPattern = IDManager.manager.map.movementPatternMapSlow;
		var tres = 200 + earlyScore + constructionSiteScore - latentEnergy * 0.01;
		var _g3 = 0;
		while(_g3 < 50) {
			var y = _g3++;
			var _g12 = 0;
			while(_g12 < 50) {
				var x = _g12++;
				var v = movementPattern[(y + 1) * 52 + x + 1];
				this.roadMap[y * 50 + x] += v * 0.01;
			}
		}
		var _g4 = 0;
		var _g13 = IDManager.constructionSites;
		while(_g4 < _g13.length) {
			var site = _g13[_g4];
			++_g4;
			var _g31 = 0;
			var _g21 = AIRoadConstructionManager.near1x.length;
			while(_g31 < _g21) {
				var i = _g31++;
				var nx = site.linked.pos.x + AIRoadConstructionManager.near1x[i];
				var ny = site.linked.pos.y + AIRoadConstructionManager.near1y[i];
				if(nx >= 0 && ny >= 0 && nx < 50 && ny < 50) this.roadMap[ny * 50 + nx] = Math.max(this.roadMap[ny * 50 + nx] - 50,0);
			}
		}
		AIMap.decay(this.roadMap,0.997);
		var result = new Array();
		var _g5 = 0;
		while(_g5 < 50) {
			var y1 = _g5++;
			var _g14 = 0;
			while(_g14 < 50) {
				var x1 = _g14++;
				if(this.roadMap[y1 * 50 + x1] > tres) result.push({ type : "road", pos : { x : x1, y : y1}});
			}
		}
		return result;
	}
	,internalInitialize: function() {
		this.type = "AIRoadConstructionManager";
	}
});
var AISource = function() {
	this.sustainabilityFactor = 1.0;
	this.prevEnergy = 0.0;
	AIAssigned.call(this);
};
$hxClasses["AISource"] = AISource;
AISource.__name__ = true;
AISource.__super__ = AIAssigned;
AISource.prototype = $extend(AIAssigned.prototype,{
	get_src: function() {
		return this.linked;
	}
	,configure: function() {
		this.initialize();
		this.maxAssignedCount = -1;
		return this;
	}
	,earlyTick: function() {
		if(this.manager.map != null && this.maxAssignedCount == -1) {
			var root = new Point(this.linked.pos.x,this.linked.pos.y,0,null);
			var terrain = this.manager.map.getTerrainMap();
			var results = AICollectorPoints.findUntil([root],terrain,function(v) {
				return v.f >= 1;
			},100000);
			this.maxAssignedCount = results.length;
		}
		if(Game.time % 5 == 0 && this.linked.energy > 0) {
			var delta = (this.linked.energy - this.prevEnergy) / 5;
			var sustainable = this.linked.energy + delta * this.linked.ticksToRegeneration;
			this.sustainabilityFactor = this.sustainabilityFactor * 0.8 + 0.2 * Math.min(Math.max(sustainable / this.linked.energyCapacity + 1,0.05),2);
			this.prevEnergy = this.linked.energy;
		}
	}
	,internalInitialize: function() {
		this.type = "AISource";
	}
});
var Category = { __ename__ : true, __constructs__ : ["Military","Economy"] };
Category.Military = ["Military",0];
Category.Military.__enum__ = Category;
Category.Economy = ["Economy",1];
Category.Economy.__enum__ = Category;
var CreepEnergyCarrier = function() {
	this.energyDelta = 0;
	this.returning = 3;
	AICreep.call(this);
};
$hxClasses["CreepEnergyCarrier"] = CreepEnergyCarrier;
CreepEnergyCarrier.__name__ = true;
CreepEnergyCarrier.__super__ = AICreep;
CreepEnergyCarrier.prototype = $extend(AICreep.prototype,{
	configure: function() {
		this.initialize(false);
		return this;
	}
	,lerp: function(a,b,t) {
		return a + (b - a) * t;
	}
	,earlyTick: function() {
		this.energyDelta = 0;
	}
	,tick: function() {
		this.energyCarrier(0);
	}
	,assignToPath: function(path) {
		if(path == this.currentPath) return;
		if(this.currentPath != null) HxOverrides.remove(this.currentPath.assigned,this);
		if(path != null && HxOverrides.indexOf(path.assigned,this,0) == -1) path.assigned.push(this);
		this.currentPath = path;
		this.returning = 3;
	}
	,energyCarrier: function(iteration) {
		var bestHarvester = null;
		var actionTaken = false;
		var droppedEnergy = IDManager.droppedEnergy;
		if(Game.time % 60 == 0) this.currentPath = null;
		if(this.linked.energy < this.linked.energyCapacity) {
			var bestTransferFrom = null;
			var largestEnergyAmount = 0;
			var capacity = this.linked.energyCapacity - this.linked.energy;
			var _g = 0;
			while(_g < droppedEnergy.length) {
				var ent = droppedEnergy[_g];
				++_g;
				if(this.linked.pos.isNearTo(ent.pos)) {
					var energy = ent;
					if(energy.energy > largestEnergyAmount) {
						bestTransferFrom = energy;
						largestEnergyAmount = energy.energy;
					}
				}
			}
			if(bestTransferFrom != null) {
				this.linked.pickup(bestTransferFrom);
				this.manager.statistics.onPickedEnergy(Std["int"](Math.min(capacity,largestEnergyAmount)));
			}
		}
		if(this.currentPath == null) {
			var bestEnergy = 0.0;
			var _g1 = 0;
			var _g11 = this.manager.workerPaths;
			while(_g1 < _g11.length) {
				var path = _g11[_g1];
				++_g1;
				var nearbyEnergy = path.nearbyEnergy();
				if((this.currentPath == null || nearbyEnergy > bestEnergy) && nearbyEnergy > 0) {
					var next = path.next(hxmath.math._IntVector2.IntVector2_Impl_._new(this.linked.pos.x,this.linked.pos.y),true);
					if(next == null) {
						this.assignToPath(path);
						bestEnergy = nearbyEnergy;
					} else {
						var pathto = this.linked.pos.findPathTo(next.x,next.y);
						if(pathto.length != 0 && pathto[pathto.length - 1].x == next.x && pathto[pathto.length - 1].y == next.y) {
							this.assignToPath(path);
							bestEnergy = nearbyEnergy;
						}
					}
				}
			}
		}
		if(this.currentPath == null) {
			this.linked.moveTo(this.manager.map.getRegroupingPoint(this.id % this.manager.numRegroupingPoints));
			return;
		}
		if(this.linked.energy + this.energyDelta < this.linked.energyCapacity * 1.0) {
			var bestScore = -10000.0;
			if(this.returning != 0 && this.returning != 2) this.returning = 3;
		} else if(this.returning != 0) this.returning = 1;
		if(this.linked.energy + this.energyDelta > 0) {
			var transferDone = false;
			var bestTransferTarget = null;
			var bestTransferAmount = 0;
			var _g2 = 0;
			var _g12 = IDManager.structures;
			while(_g2 < _g12.length) {
				var ext = _g12[_g2];
				++_g2;
				if(ext.structureType == "extension" && this.linked.pos.isNearTo(ext.pos)) {
					var amount = Std["int"](Math.min(ext.energyCapacity - ext.energy,this.linked.energy));
					if(amount > bestTransferAmount) {
						bestTransferAmount = amount;
						bestTransferTarget = ext;
					}
				}
			}
			if(bestTransferTarget != null) {
				var amount1 = Std["int"](Math.min(bestTransferTarget.energyCapacity - bestTransferTarget.energy,this.linked.energy));
				haxe.Log.trace("Transfering to ext..." + Std.string(this.linked.pos),{ fileName : "CreepEnergyCarrier.hx", lineNumber : 247, className : "CreepEnergyCarrier", methodName : "energyCarrier"});
				transferDone = true;
				this.linked.transferEnergy(bestTransferTarget);
				this.currentPath = null;
				this.energyDelta -= amount1;
				this.manager.statistics.onCollectedEnergy(amount1);
				if(this.returning != 0 && this.returning != 2) this.returning = 3;
			}
			if(!transferDone) {
				var _g3 = 0;
				var _g13 = IDManager.spawns;
				while(_g3 < _g13.length) {
					var spawn = _g13[_g3];
					++_g3;
					if(this.linked.pos.isNearTo(spawn.linked.pos)) {
						transferDone = true;
						this.linked.transferEnergy(spawn.linked);
						this.currentPath = null;
						this.energyDelta -= this.linked.energy;
						if(this.returning != 0 && this.returning != 2) this.returning = 3;
						break;
					}
				}
			}
			if(!transferDone) {
				var _g4 = 0;
				var _g14 = IDManager.creeps;
				while(_g4 < _g14.length) {
					var creep = _g14[_g4];
					++_g4;
					if(creep.my && creep.role == 5 && this.linked.pos.isNearTo(creep.linked.pos)) {
						var amount2 = Std["int"](Math.min(creep.linked.energyCapacity - creep.linked.energy,this.linked.energy));
						if(amount2 > 0) {
							this.linked.transferEnergy(creep.linked,Std["int"](Math.min(creep.linked.energyCapacity - creep.linked.energy,this.linked.energy)));
							if(this.linked.energy - amount2 == 0) this.returning = 3;
							break;
						}
					}
					if(this.currentPath != null && creep.my && creep != this && creep.role == 3 && this.linked.pos.isNearTo(creep.linked.pos)) {
						var carrier = creep;
						if(carrier.currentPath == null || carrier.currentPath.nodeIndex(hxmath.math._IntVector2.IntVector2_Impl_._new(carrier.linked.pos.x,carrier.linked.pos.y)) < this.currentPath.nodeIndex(hxmath.math._IntVector2.IntVector2_Impl_._new(this.linked.pos.x,this.linked.pos.y))) {
							var amount3 = Std["int"](Math.min(creep.linked.energyCapacity - creep.linked.energy,this.linked.energy));
							if(amount3 > 0) {
								this.linked.transferEnergy(creep.linked,amount3);
								carrier.energyDelta += amount3;
								carrier.tick();
								if(this.linked.energy - amount3 == 0) this.returning = 3;
								break;
							}
						}
					}
				}
			}
		}
		if(this.currentPath == null) {
			if(iteration > 0) return;
			this.energyCarrier(iteration + 1);
			return;
		}
		var next1 = this.currentPath.next(hxmath.math._IntVector2.IntVector2_Impl_._new(this.linked.pos.x,this.linked.pos.y),this.returning == 2 || this.returning == 3);
		if(next1 == null) {
			if(this.currentPath.nodeIndex(hxmath.math._IntVector2.IntVector2_Impl_._new(this.linked.pos.x,this.linked.pos.y)) == 0) {
				this.linked.room.createFlag(this.linked.pos.x,this.linked.pos.y,this.id + "<>");
				this.assignToPath(null);
				this.returning = 3;
				return;
			} else this.returning = 0;
			haxe.Log.trace("reversing " + this.currentPath.nodeIndex(hxmath.math._IntVector2.IntVector2_Impl_._new(this.linked.pos.x,this.linked.pos.y)),{ fileName : "CreepEnergyCarrier.hx", lineNumber : 316, className : "CreepEnergyCarrier", methodName : "energyCarrier"});
			next1 = this.currentPath.next(hxmath.math._IntVector2.IntVector2_Impl_._new(this.linked.pos.x,this.linked.pos.y),this.returning == 2 || this.returning == 3);
		}
		if(next1 != null) this.linked.moveTo(next1.x,next1.y);
	}
	,moveEnergyAroundRandomly: function() {
		var randomTarget = null;
		var tries = 0;
		var targetAmount = 0;
		var _g = 0;
		var _g1 = IDManager.creeps;
		while(_g < _g1.length) {
			var creep = _g1[_g];
			++_g;
			if(creep.my && (creep.role == 5 || creep.role == 3) && this.linked.pos.isNearTo(creep.linked.pos)) {
				var amount = Std["int"](Math.min(creep.linked.energyCapacity - creep.linked.energy,this.linked.energy));
				if(amount > 0) {
					tries++;
					if(Std.random(tries) == 0) {
						randomTarget = creep;
						targetAmount = amount;
					}
				}
			}
		}
		if(randomTarget != null) this.linked.transferEnergy(randomTarget.linked,targetAmount);
	}
	,internalInitialize: function() {
		this.type = "CreepEnergyCarrier";
	}
});
var Healer = function() {
	AICreep.call(this);
};
$hxClasses["Healer"] = Healer;
Healer.__name__ = true;
Healer.__super__ = AICreep;
Healer.prototype = $extend(AICreep.prototype,{
	configure: function() {
		this.initialize(false);
		return this;
	}
	,preprocessAssignment: function(assignment) {
		this.preprocessAssignmentHealer(assignment);
	}
	,preprocessAssignmentHealer: function(assignment) {
		Profiler.start("preprocessAssignmentHealer");
		var targets = IDManager.creeps;
		var hostileTargets = this.linked.pos.findInRange(3,1);
		if(targets.length > 0) {
			Profiler.start("preprocessAssignmentHealer_create");
			var occ = new Array();
			var occ2 = new Array();
			var size = 5;
			var offset = Math.floor(size / 2);
			var _g = 0;
			while(_g < size) {
				var x = _g++;
				var _g1 = 0;
				while(_g1 < size) {
					var y = _g1++;
					occ.push(0);
					occ2.push(0);
				}
			}
			Profiler.stop();
			Profiler.start("preprocessAssignmentHealer_put");
			var _g2 = 0;
			while(_g2 < targets.length) {
				var target = targets[_g2];
				++_g2;
				var nx = target.linked.pos.x - this.linked.pos.x + offset;
				var ny = target.linked.pos.y - this.linked.pos.y + offset;
				if(target.my && nx >= 0 && nx < size && ny >= 0 && ny < size) {
					var healthFraction = target.linked.hits / target.linked.hitsMax;
					occ[ny * size + nx] = Math.max(occ[ny * size + nx],1 - healthFraction * healthFraction);
					if(target.role != 4 && target.role != 2) occ[ny * size + nx] = 0;
				} else occ[ny * size + nx] = 0;
			}
			Profiler.stop();
			Profiler.start("preprocessAssignmentHealer_smooth");
			var _g3 = 0;
			while(_g3 < 1) {
				var i = _g3++;
				var _g21 = 0;
				var _g11 = occ2.length;
				while(_g21 < _g11) {
					var j = _g21++;
					occ2[j] = occ[j];
				}
				var _g12 = 0;
				while(_g12 < size) {
					var y1 = _g12++;
					var _g22 = 0;
					while(_g22 < size) {
						var x1 = _g22++;
						var _g4 = 0;
						var _g31 = AICreep.dx.length;
						while(_g4 < _g31) {
							var di = _g4++;
							var nx1 = x1 + AICreep.dx[di];
							var ny1 = y1 + AICreep.dy[di];
							if(nx1 >= 0 && ny1 >= 0 && nx1 < size && ny1 < size) occ2[ny1 * size + nx1] = Math.max(occ2[ny1 * size + nx1],occ[y1 * size + x1]);
						}
					}
				}
				var tmp = occ;
				occ = occ2;
				occ2 = tmp;
			}
			var terrainMap = this.manager.map.getTerrainMap();
			var _g5 = 0;
			while(_g5 < size) {
				var x2 = _g5++;
				var _g13 = 0;
				while(_g13 < size) {
					var y2 = _g13++;
					if(terrainMap[(this.linked.pos.y + y2 - offset + 1) * 52 + (this.linked.pos.x + x2 - offset) + 1] < 0) occ[y2 * size + x2] = 0;
				}
			}
			var anyNonZero = false;
			Profiler.stop();
			Profiler.start("preprocessAssignmentHealer_score");
			var _g6 = 0;
			var _g14 = AICreep.near1x;
			while(_g6 < _g14.length) {
				var nx2 = _g14[_g6];
				++_g6;
				var _g23 = 0;
				var _g32 = AICreep.near1y;
				while(_g23 < _g32.length) {
					var ny2 = _g32[_g23];
					++_g23;
					var ox = nx2 + offset;
					var oy = ny2 + offset;
					var score = occ[oy * size + ox] * 80;
					if(AIMap.getRoomPos(this.manager.map.getTerrainMap(),this.linked.pos.x + nx2,this.linked.pos.y + ny2) < 0) continue;
					var anyOnThisPosition = false;
					var _g41 = 0;
					while(_g41 < hostileTargets.length) {
						var target1 = hostileTargets[_g41];
						++_g41;
						if(target1.pos.x == this.linked.pos.x + nx2 && target1.pos.y == this.linked.pos.y + ny2) {
							anyOnThisPosition = true;
							break;
						}
					}
					if(anyOnThisPosition) continue;
					var potentialDamageOnMe = this.manager.map.potentialDamageMap[(this.linked.pos.y + ny2 + 1) * 52 + (this.linked.pos.x + nx2) + 1];
					var finalScore = 200 + (score - potentialDamageOnMe | 0);
					if(score == 0) finalScore -= 30; else anyNonZero = true;
					assignment.add(this,this.linked.pos.x + nx2,this.linked.pos.y + ny2,finalScore);
				}
			}
			if(!anyNonZero) assignment.clearAllFor(this);
			Profiler.stop();
		}
		Profiler.stop();
	}
	,findGoodHealingTarget: function(shortDistance) {
		var bestTarget = null;
		var bestScore = 0.0;
		var _g = 0;
		var _g1 = IDManager.creeps;
		while(_g < _g1.length) {
			var creep = _g1[_g];
			++_g;
			if(creep != this) {
				var score = 0.0;
				var healthFraction = creep.linked.hits / creep.linked.hitsMax;
				score += 1 - healthFraction * healthFraction;
				if(creep.role == 1) score += 0.05;
				if(creep.role == 2) score += 0.02;
				if(score > bestScore) {
					var pathCost = 0.0;
					if(shortDistance) {
						if(!this.linked.pos.isNearTo(creep.linked.pos)) continue;
					} else {
						var pathLength = this.linked.pos.findPathTo(creep.linked.pos).length;
						if(pathLength == 0) continue;
						pathCost = Math.min(pathLength / 20,1);
					}
					pathCost *= pathCost;
					score *= 1 - 0.3 * pathCost;
					var _g2 = 0;
					var _g3 = IDManager.creeps;
					while(_g2 < _g3.length) {
						var ent = _g3[_g2];
						++_g2;
						if(ent.type == "Healer" && ent != this) {
							var healer = ent;
							if(healer.healingTarget == creep) score *= 0.5;
						}
					}
					if(creep == this.healingTarget) score *= 1.5;
					if(score > bestScore) {
						bestScore = score;
						bestTarget = creep;
					}
				}
			}
		}
		if(bestTarget == null) {
			var _g4 = 0;
			var _g11 = IDManager.creeps;
			while(_g4 < _g11.length) {
				var creep1 = _g11[_g4];
				++_g4;
				if(creep1.role == 1 || creep1.role == 6) {
					bestTarget = creep1;
					break;
				}
			}
		}
		if(bestTarget == null) {
			var _g5 = 0;
			var _g12 = IDManager.creeps;
			while(_g5 < _g12.length) {
				var creep2 = _g12[_g5];
				++_g5;
				if(creep2.role == 2) {
					bestTarget = creep2;
					break;
				}
			}
		}
		return bestTarget;
	}
	,tick: function() {
		var match = this.manager.assignment.getMatch(this);
		if(match != null) {
			this.linked.moveTo(this.linked.room.getPositionAt(match.x,match.y),{ reusePath : 0});
			this.healingTarget = this.findGoodHealingTarget(true);
			if(this.healingTarget != null) {
				if(this.linked.pos.isNearTo(this.healingTarget.linked.pos)) this.linked.heal(this.healingTarget.linked); else if(this.linked.pos.inRangeTo(this.healingTarget.linked.pos,3)) this.linked.rangedHeal(this.healingTarget.linked);
			} else {
				this.healingTarget = this.findGoodHealingTarget(false);
				if(this.healingTarget != null) this.linked.rangedHeal(this.healingTarget.linked);
			}
		} else {
			this.healingTarget = this.findGoodHealingTarget(false);
			if(this.healingTarget != null) {
				this.linked.moveTo(this.healingTarget.linked);
				if(this.linked.pos.isNearTo(this.healingTarget.linked.pos)) this.linked.heal(this.healingTarget.linked); else if(this.linked.pos.inRangeTo(this.healingTarget.linked.pos,3)) this.linked.rangedHeal(this.healingTarget.linked); else {
					var _g = 0;
					var _g1 = IDManager.creeps;
					while(_g < _g1.length) {
						var creep = _g1[_g];
						++_g;
						if(creep != this) {
							if(this.linked.pos.inRangeTo(creep.linked.pos,3) && creep.linked.hits < creep.linked.hitsMax) {
								this.linked.rangedHeal(creep.linked);
								break;
							}
						}
					}
				}
			} else this.moveToDefault();
		}
	}
	,internalInitialize: function() {
		this.type = "Healer";
	}
});
var AISpawn = function() {
	this.highestHostileMilitaryScore = 0;
	Base.call(this);
};
$hxClasses["AISpawn"] = AISpawn;
AISpawn.__name__ = true;
AISpawn.extensionNeeded = function(body) {
	var counter = 0;
	var _g = 0;
	while(_g < body.length) {
		var part = body[_g];
		++_g;
		if(part != "tough") counter++;
	}
	return counter;
};
AISpawn.__super__ = Base;
AISpawn.prototype = $extend(Base.prototype,{
	get_src: function() {
		return this.linked;
	}
	,configure: function() {
		this.initialize();
		return this;
	}
	,getBestRole: function() {
		var bestRole = AISpawn.roleTypes[0][0];
		var bestRoleScore = -1000.0;
		var hostileMilitary = 0;
		var _g = 0;
		var _g1 = this.linked.room.find(3);
		while(_g < _g1.length) {
			var v = _g1[_g];
			++_g;
			var creep = v;
			hostileMilitary += creep.getActiveBodyparts("attack") + creep.getActiveBodyparts("ranged_attack") + creep.getActiveBodyparts("heal");
		}
		if(hostileMilitary > this.highestHostileMilitaryScore) this.highestHostileMilitaryScore = hostileMilitary;
		var friendlyMilitary = 0;
		var _g2 = 0;
		var _g11 = IDManager.creeps;
		while(_g2 < _g11.length) {
			var v1 = _g11[_g2];
			++_g2;
			friendlyMilitary += v1.linked.getActiveBodyparts("attack") + v1.linked.getActiveBodyparts("ranged_attack") + v1.linked.getActiveBodyparts("heal");
		}
		var complexityScore = this.manager.getComplexityScore();
		var sourceSlots = Lambda.fold(IDManager.sources,function(s,acc) {
			if(s.sustainabilityFactor >= 0.8) return s.maxAssignedCount + acc; else return s.assigned.length + acc;
		},0);
		if(this.linked.energy > this.linked.energyCapacity * 0.9) complexityScore *= 100000;
		var maxExtensions = 5;
		var _g3 = 0;
		var _g12 = this.linked.room.find(8);
		while(_g3 < _g12.length) {
			var entity = _g12[_g3];
			++_g3;
			var structure = entity;
			if(structure.structureType == "extension" && structure.energy >= 200) maxExtensions++;
		}
		var energyNeededForConstruction = 0;
		var _g4 = 0;
		var _g13 = IDManager.constructionSites;
		while(_g4 < _g13.length) {
			var site = _g13[_g4];
			++_g4;
			energyNeededForConstruction += site.linked.progressTotal - site.linked.progress;
		}
		var militaryTimeScore = 0;
		if(IDManager.creeps.length > 0) {
			var _g5 = 0;
			var _g14 = AISpawn.roleTypes;
			while(_g5 < _g14.length) {
				var roleGroup = _g14[_g5];
				++_g5;
				var _g21 = -roleGroup.length;
				while(_g21 < 0) {
					var i = _g21++;
					var role = roleGroup[-i - 1];
					if(role.advancedThreshold > complexityScore) continue;
					if(AISpawn.extensionNeeded(role.body) > maxExtensions) continue;
					var score = 0.0;
					var roleCount = this.manager.getOriginalRoleCount(role.role);
					var totalCount = IDManager.creeps.length;
					totalCount = totalCount - roleCount + roleCount / role.amountProportion;
					roleCount = roleCount / role.amountProportion;
					score = 1 - roleCount / totalCount;
					if(hostileMilitary >= friendlyMilitary && hostileMilitary > 0 && role.category == Category.Military) {
						score += 5;
						score *= 2;
					}
					if(this.highestHostileMilitaryScore * 2 >= friendlyMilitary && this.highestHostileMilitaryScore > 0 && role.category == Category.Military) {
						score += 1;
						score *= 2;
					}
					if(role.category == Category.Military) score += militaryTimeScore;
					if(role.role == 0 && this.manager.getRoleCount(role.role) < 2) score += 1;
					if(role.role == 0 && this.manager.getRoleCount(0) < sourceSlots && hostileMilitary == 0) score += 0.00333333333333333355 * complexityScore;
					if(role.role == 0 && this.manager.getRoleCount(0) >= sourceSlots) score *= 0.25;
					if(role.role == 0 && this.manager.getRoleCount(0) >= sourceSlots * 0.8) score *= 0.7;
					if(role.role == 3) score += this.manager.carrierNeeded * 0.08;
					if(role.role == 3 && this.manager.getRoleCount(3) == 0 && hostileMilitary == 0) score += 0.5;
					if(role.role == 3 && this.manager.getRoleCount(3) * 2 >= this.manager.getRoleCount(0)) score *= 0.5;
					if(role.role == 5) score += 0.0005 * energyNeededForConstruction / (this.manager.getOriginalRoleCount(5) + 1);
					if(score > bestRoleScore) {
						bestRoleScore = score;
						bestRole = role;
					}
				}
			}
		}
		return bestRole;
	}
	,tick: function() {
		if(this.linked.spawning == null) {
			var bestRole = this.getBestRole();
			var res = SpawnExtender.spawn(this.linked,bestRole.body);
			switch(res[1]) {
			case 1:
				var name = res[2];
				var creep = Base.instantiate(bestRole.type);
				creep.originalRole = creep.role = bestRole.role;
				IDManager.queueAddCreep(name,creep);
				haxe.Log.trace("Spawning with name: " + name,{ fileName : "AISpawn.hx", lineNumber : 210, className : "AISpawn", methodName : "tick"});
				this.manager.statistics.onSpawning(bestRole);
				if(bestRole.role == 3) this.manager.carrierNeeded = -5;
				break;
			case 0:
				var err = res[2];
				if(err == -13) this.manager.extensionEnergyNeeded += 1; else {
				}
				break;
			}
		}
	}
	,internalInitialize: function() {
		this.type = "AISpawn";
	}
});
var AIStatistics = function() {
	this.pickedEnergy = 0;
	this.collectedEnergy = 0;
	this.minedEnergy = 0;
	Base.call(this);
};
$hxClasses["AIStatistics"] = AIStatistics;
AIStatistics.__name__ = true;
AIStatistics.getBodyPartCost = function(part) {
	switch(part) {
	case "move":
		return 50;
	case "work":
		return 20;
	case "carry":
		return 50;
	case "attack":
		return 80;
	case "ranged_attack":
		return 150;
	case "heal":
		return 200;
	case "tough":
		return 20;
	}
};
AIStatistics.calculateSpawnCost = function(body) {
	var cost = 0;
	var _g = 0;
	while(_g < body.length) {
		var part = body[_g];
		++_g;
		cost += AIStatistics.getBodyPartCost(part);
	}
	if(AISpawn.extensionNeeded(body) > AIStatistics.NoExtensionsLimit) cost += AIStatistics.ExtensionsCost * (AISpawn.extensionNeeded(body) - AIStatistics.NoExtensionsLimit);
	return cost;
};
AIStatistics.__super__ = Base;
AIStatistics.prototype = $extend(Base.prototype,{
	isStandalone: function() {
		return true;
	}
	,configure: function() {
		this.deaths = new Array();
		var _g = 0;
		while(_g < 10) {
			var i = _g++;
			this.deaths.push(0);
		}
		this.spawns = new Array();
		var _g1 = 0;
		while(_g1 < 10) {
			var i1 = _g1++;
			this.spawns.push(0);
		}
		this.energySpentOnRole = new Array();
		var _g2 = 0;
		while(_g2 < 10) {
			var i2 = _g2++;
			this.energySpentOnRole.push(0);
		}
		this.initialize();
		return this;
	}
	,onSpawning: function(type) {
		this.energySpentOnRole[type.role] += AIStatistics.calculateSpawnCost(type.body);
	}
	,onCreepCreated: function(role) {
		this.spawns[role]++;
	}
	,onCreepDeath: function(role) {
		this.deaths[role]++;
	}
	,onMinedEnergy: function(amount) {
		this.minedEnergy += amount;
	}
	,onCollectedEnergy: function(amount) {
		this.collectedEnergy += amount;
	}
	,onPickedEnergy: function(amount) {
		this.pickedEnergy += amount;
	}
	,internalInitialize: function() {
		this.type = "AIStatistics";
	}
});
var ArrayTools = function() { };
$hxClasses["ArrayTools"] = ArrayTools;
ArrayTools.__name__ = true;
ArrayTools.permutationIndex = function(n,k) {
	haxe.Log.trace(n + " " + k,{ fileName : "ArrayTools.hx", lineNumber : 53, className : "ArrayTools", methodName : "permutationIndex"});
	var fac = ArrayTools.factoradic(n,k,{ fileName : "ArrayTools.hx", lineNumber : 54, className : "ArrayTools", methodName : "permutationIndex"});
	if(fac == null) return null;
	var perm = new Array();
	var _g = 0;
	while(_g < n) {
		var i = _g++;
		fac[i] += 1;
	}
	var _g1 = 1;
	var _g2 = n + 1;
	while(_g1 < _g2) {
		var j = _g1++;
		var i1 = n - j;
		perm[i1] = fac[i1];
		var _g21 = i1 + 1;
		while(_g21 < n) {
			var k1 = _g21++;
			if(perm[k1] >= perm[i1]) ++perm[k1];
		}
	}
	var _g3 = 0;
	while(_g3 < n) {
		var k2 = _g3++;
		--perm[k2];
	}
	return perm;
};
ArrayTools.permute = function(arr,i,idx) {
	if(arr == null) return;
	var length = arr.length;
	if(idx == null) {
		if(i == null) {
			ArrayTools.shuffle(arr);
			return;
		} else idx = ArrayTools.permutationIndex(length,i);
	}
	var _g = 0;
	while(_g < length) {
		var j = _g++;
		if(idx[j] <= j) continue;
		var tmp = arr[j];
		arr[j] = arr[idx[j]];
		arr[idx[j]] = tmp;
	}
};
ArrayTools.fastCreateArray = function(itl,it) {
	if(itl != null) {
		var r = new Array();
		var last_index = itl.length;
		var itr = $iterator(itl)();
		var _g = 0;
		while(_g < last_index) {
			var i = _g++;
			r[i] = itr.next();
		}
		return r;
	} else return Lambda.array(it);
};
ArrayTools.shuffle = function(arr) {
	var n = arr.length;
	while(n > 1) {
		var k = Std.random(n);
		n--;
		var temp = arr[n];
		arr[n] = arr[k];
		arr[k] = temp;
	}
};
ArrayTools.concat = function(arr1,arr2) {
	arr1 = arr1.concat(arr2);
};
ArrayTools.permutator = function(arr,i,idx) {
	if(arr == null) return null;
	if(idx == null) {
		if(i == null) {
			idx = ArrayTools.indexArray(arr.length);
			ArrayTools.shuffle(idx);
			return ArrayTools.permutator(arr,null,idx);
		} else idx = ArrayTools.permutationIndex(arr.length,i);
	}
	var current = 0;
	return { next : function() {
		return arr[idx[current++]];
	}, hasNext : function() {
		return current < arr.length;
	}};
};
ArrayTools.indexArray = function(n) {
	var idx = new Array();
	var _g = 0;
	while(_g < n) {
		var i = _g++;
		idx[i] = i;
	}
	return idx;
};
ArrayTools.permutators = function(arr) {
	var idx = ArrayTools.indexArray(arr.length);
	var cur_idx = idx.slice();
	var first = true;
	return { next : function() {
		return ArrayTools.permutator(arr,null,cur_idx);
	}, hasNext : function() {
		if(first) {
			first = false;
			return true;
		} else if(ArrayTools.equivalent(idx,cur_idx)) return false; else {
			ArrayTools.nextPermutationIndex(cur_idx);
			return true;
		}
	}};
};
ArrayTools.allCombinators = function(arr) {
	var max_index = arr.length;
	var choose_index = 1;
	return { next : function() {
		return ArrayTools.combinators(arr,choose_index++);
	}, hasNext : function() {
		return choose_index <= max_index;
	}};
};
ArrayTools.combinators = function(arr,k) {
	var idx = ArrayTools.indexArray(k);
	var cur_idx = idx.slice();
	var cur_index = 0;
	var first = true;
	return { next : function() {
		return ArrayTools.combinator(arr,k,null,cur_idx,{ fileName : "ArrayTools.hx", lineNumber : 238, className : "ArrayTools", methodName : "combinators"});
	}, hasNext : function() {
		if(first) return true; else if(ArrayTools.equivalent(idx,cur_idx)) return false; else {
			ArrayTools.nextCombinationIndex(cur_idx,arr.length);
			return true;
		}
	}};
};
ArrayTools.combinator = function(arr,k,i,idx,pos) {
	if(arr == null) return null;
	var length = arr.length;
	if(idx == null) {
		if(i == null) {
			idx = ArrayTools.randomCombinationIndex(arr.length,k);
			return ArrayTools.combinator(arr,k,null,idx,{ fileName : "ArrayTools.hx", lineNumber : 267, className : "ArrayTools", methodName : "combinator"});
		} else idx = ArrayTools.combinationIndex(arr.length,k,i,{ fileName : "ArrayTools.hx", lineNumber : 269, className : "ArrayTools", methodName : "combinator"});
	}
	if(idx == null) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var current = 0;
	return { next : function() {
		return arr[idx[current++]];
	}, hasNext : function() {
		return current < k;
	}};
};
ArrayTools.randomCombinationIndex = function(n,k) {
	if(k < 1) {
		throw "invalid k value";
		return null;
	}
	var idx_arr = new Array();
	var _g = 0;
	while(_g < n) {
		var i = _g++;
		idx_arr[i] = i;
	}
	var k_arr = new Array();
	var _g1 = 0;
	while(_g1 < k) {
		var i1 = _g1++;
		var idx = Std.random(idx_arr.length);
		var tmp = idx_arr[idx];
		idx_arr[idx] = idx_arr[idx_arr.length - 1];
		idx_arr[idx_arr.length - 1] = tmp;
		k_arr.push(idx_arr.pop());
	}
	k_arr.sort(function(x,y) {
		return x - y;
	});
	return k_arr;
};
ArrayTools.combinationIndex = function(n,k,i,pos) {
	var dual = ArrayTools.choose(n,k,{ fileName : "ArrayTools.hx", lineNumber : 324, className : "ArrayTools", methodName : "combinationIndex"}) - 1 - i;
	if(dual < 0) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var comb_arr = ArrayTools.combinadic(n,k,dual,{ fileName : "ArrayTools.hx", lineNumber : 329, className : "ArrayTools", methodName : "combinationIndex"});
	var comb_len = comb_arr.length;
	var _g = 0;
	while(_g < comb_len) {
		var i1 = _g++;
		comb_arr[i1] = n - comb_arr[i1] - 1;
	}
	return comb_arr;
};
ArrayTools.combination = function(arr,k,i,idx,pos) {
	if(arr == null) return null;
	var length = arr.length;
	var idx1 = new Array();
	if(idx1 == null) {
		if(i == null) idx1 = ArrayTools.randomCombinationIndex(arr.length,k); else idx1 = ArrayTools.combinationIndex(arr.length,k,i,{ fileName : "ArrayTools.hx", lineNumber : 356, className : "ArrayTools", methodName : "combination"});
	}
	if(idx1 == null) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var r = new Array();
	var idx_length = idx1.length;
	var _g = 0;
	while(_g < idx_length) {
		var j = _g++;
		r[j] = arr[idx1[j]];
	}
	return r;
};
ArrayTools.combinations = function(arr,k) {
	var length = arr.length;
	var idx = ArrayTools.indexArray(k);
	var cur_idx = idx.slice();
	var done = false;
	var r = new Array();
	while(!done) {
		r.push(ArrayTools.combination(arr,k,null,cur_idx,{ fileName : "ArrayTools.hx", lineNumber : 388, className : "ArrayTools", methodName : "combinations"}));
		ArrayTools.nextCombinationIndex(cur_idx,k);
		if(ArrayTools.equivalent(idx,cur_idx)) done = true;
	}
	return r;
};
ArrayTools.nextCombinationIndex = function(idx,n) {
	var cur_last_idx = idx.length - 1;
	var done = false;
	while(!done) {
		var ceiling = n;
		if(cur_last_idx != idx.length - 1) ceiling = idx[cur_last_idx + 1];
		if(idx[cur_last_idx] < ceiling - 1) {
			idx[cur_last_idx] += 1;
			var _g1 = cur_last_idx + 1;
			var _g = idx.length;
			while(_g1 < _g) {
				var i = _g1++;
				idx[i] = idx[i - 1] + 1;
			}
			done = true;
		} else if(cur_last_idx != 0) cur_last_idx--; else {
			idx = ArrayTools.indexArray(idx.length);
			done = true;
		}
	}
};
ArrayTools.nextPermutationIndex = function(idx) {
	var cur_last_idx = idx.length - 1;
	var done = false;
	var itr = IterTools.range(idx.length - 2,-1);
	while( itr.hasNext() ) {
		var i = itr.next();
		if(idx[i] < idx[i + 1]) {
			var smallest = i + 1;
			var _g1 = i + 1;
			var _g = idx.length;
			while(_g1 < _g) {
				var j = _g1++;
				if(idx[smallest] > idx[j] && idx[j] > idx[i]) smallest = j;
			}
			var tmp = idx[i];
			idx[i] = idx[smallest];
			idx[smallest] = tmp;
			var sort_these = idx.splice(i + 1,idx.length - i);
			sort_these.sort(function(x,y) {
				return x - y;
			});
			var _g2 = 0;
			while(_g2 < sort_these.length) {
				var i1 = sort_these[_g2];
				++_g2;
				idx.push(i1);
			}
			break;
		} else if(i == 0) idx.sort(function(x1,y1) {
			return x1 - y1;
		});
	}
};
ArrayTools.equivalent = function(arr1,arr2) {
	if(arr1.length != arr2.length) return false;
	var _g1 = 0;
	var _g = arr1.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(arr1[i] != arr2[i]) return false;
	}
	return true;
};
ArrayTools.combinadic = function(n,k,i,pos) {
	if(i > ArrayTools.choose(n,k,{ fileName : "ArrayTools.hx", lineNumber : 467, className : "ArrayTools", methodName : "combinadic"})) {
		throw "initialization error for " + pos.methodName + ": Index \"i\" is greater than \"n\" choose \"k\"";
		return null;
	} else {
		var ans = new Array();
		var a = n;
		var b = k;
		var x = i;
		var _g = 0;
		while(_g < k) {
			var i1 = _g++;
			ans[i1] = ArrayTools.largestN(n,b,x,{ fileName : "ArrayTools.hx", lineNumber : 478, className : "ArrayTools", methodName : "combinadic"});
			x = x - ArrayTools.choose(ans[i1],b,{ fileName : "ArrayTools.hx", lineNumber : 479, className : "ArrayTools", methodName : "combinadic"});
			a = ans[i1];
			b -= 1;
		}
		return ans;
	}
};
ArrayTools.deepCopy = function(arr) {
	if(arr.length > 0 && ((arr[0] instanceof Array) && arr[0].__enum__ == null)) {
		var r = new Array();
		var _g1 = 0;
		var _g = arr.length;
		while(_g1 < _g) {
			var i = _g1++;
			r.push(ArrayTools.deepCopy(arr[i]));
		}
		return r;
	} else return arr.slice();
};
ArrayTools.largestN = function(max_n,k,x,pos) {
	if(x < 0 || max_n < 0 || k < 0) {
		throw "initialization error for " + pos.methodName;
		return null;
	} else {
		var n = max_n - 1;
		while(ArrayTools.choose(n,k,{ fileName : "ArrayTools.hx", lineNumber : 526, className : "ArrayTools", methodName : "largestN"}) > x) --n;
		return n;
	}
};
ArrayTools.factoradic = function(n,k,pos) {
	if(n < 0 || k < 0) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var factoradic = new Array();
	factoradic[n - 1] = 0;
	var _g1 = 1;
	var _g = n + 1;
	while(_g1 < _g) {
		var j = _g1++;
		haxe.Log.trace(k + " " + j,{ fileName : "ArrayTools.hx", lineNumber : 549, className : "ArrayTools", methodName : "factoradic"});
		factoradic[n - j] = k % j;
		k = k / j | 0;
	}
	return factoradic;
};
ArrayTools.choose = function(n,k,pos) {
	if(n < 0 || k < 0) {
		throw "initialization error for " + pos.methodName;
		return null;
	} else if(n < k) return 0; else if(n == k) return 1; else {
		var result = 1;
		var _g1 = k + 1;
		var _g = n + 1;
		while(_g1 < _g) {
			var i = _g1++;
			if(i > n - k) {
			}
			result *= i;
		}
		return Math.floor(result / ArrayTools.factorial(n - k,{ fileName : "ArrayTools.hx", lineNumber : 583, className : "ArrayTools", methodName : "choose"}));
	}
};
ArrayTools.factorial = function(n,pos) {
	if(n < 0) {
		throw "initialization error for " + pos.methodName;
		return null;
	} else {
		var result = 1;
		var _g1 = 2;
		var _g = n + 1;
		while(_g1 < _g) {
			var i = _g1++;
			result *= i;
		}
		return result;
	}
};
ArrayTools.swapAndPop = function(arr,e) {
	var tmp = null;
	var _g1 = 0;
	var _g = arr.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(arr[i] == e) {
			var tmp1 = arr[arr.length - 1];
			arr[arr.length - 1] = arr[i];
			arr[i] = tmp1;
			tmp1 = arr.pop();
			return true;
			break;
		}
	}
	return false;
};
var _BodyPart = {};
_BodyPart.BodyPart_Impl_ = function() { };
$hxClasses["_BodyPart.BodyPart_Impl_"] = _BodyPart.BodyPart_Impl_;
_BodyPart.BodyPart_Impl_.__name__ = true;
var _Color = {};
_Color.Color_Impl_ = function() { };
$hxClasses["_Color.Color_Impl_"] = _Color.Color_Impl_;
_Color.Color_Impl_.__name__ = true;
var HasStringID = function() { };
$hxClasses["HasStringID"] = HasStringID;
HasStringID.__name__ = true;
var _CreepEnergyCarrier = {};
_CreepEnergyCarrier.ReturningEnum_Impl_ = function() { };
$hxClasses["_CreepEnergyCarrier.ReturningEnum_Impl_"] = _CreepEnergyCarrier.ReturningEnum_Impl_;
_CreepEnergyCarrier.ReturningEnum_Impl_.__name__ = true;
var _Direction = {};
_Direction.Direction_Impl_ = function() { };
$hxClasses["_Direction.Direction_Impl_"] = _Direction.Direction_Impl_;
_Direction.Direction_Impl_.__name__ = true;
var _DynamicObject = {};
_DynamicObject.DynamicObject_Impl_ = function() { };
$hxClasses["_DynamicObject.DynamicObject_Impl_"] = _DynamicObject.DynamicObject_Impl_;
_DynamicObject.DynamicObject_Impl_.__name__ = true;
_DynamicObject.DynamicObject_Impl_._new = function() {
	return { };
};
_DynamicObject.DynamicObject_Impl_.set = function(this1,key,value) {
	this1[key] = value;
};
_DynamicObject.DynamicObject_Impl_.get = function(this1,key) {
	return this1[key];
};
_DynamicObject.DynamicObject_Impl_.exists = function(this1,key) {
	return Object.prototype.hasOwnProperty.call(this1,key);
};
_DynamicObject.DynamicObject_Impl_.remove = function(this1,key) {
	return Reflect.deleteField(this1,key);
};
_DynamicObject.DynamicObject_Impl_.keys = function(this1) {
	return Reflect.fields(this1);
};
_DynamicObject.DynamicObject_Impl_.iterator = function(this1) {
	return new DynObjIterator(this1);
};
var DynObjIterator = function(obj) {
	this.i = 0;
	this.keys = Reflect.fields(obj);
	this.obj = obj;
};
$hxClasses["DynObjIterator"] = DynObjIterator;
DynObjIterator.__name__ = true;
DynObjIterator.prototype = {
	hasNext: function() {
		return this.i < this.keys.length;
	}
	,next: function() {
		var key = this.keys[this.i++];
		return this.obj[key];
	}
};
var _EntityType = {};
_EntityType.EntityType_Impl_ = function() { };
$hxClasses["_EntityType.EntityType_Impl_"] = _EntityType.EntityType_Impl_;
_EntityType.EntityType_Impl_.__name__ = true;
var _FindType = {};
_FindType.FindType_Impl_ = function() { };
$hxClasses["_FindType.FindType_Impl_"] = _FindType.FindType_Impl_;
_FindType.FindType_Impl_.__name__ = true;
var HxOverrides = function() { };
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = true;
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var IDManager = function() { };
$hxClasses["IDManager"] = IDManager;
IDManager.__name__ = true;
IDManager.tick = function() {
	if((function($this) {
		var $r;
		var this1 = Memory;
		$r = this1.lastGameTime;
		return $r;
	}(this)) == null || Game.time - (function($this) {
		var $r;
		var this2 = Memory;
		$r = this2.lastGameTime;
		return $r;
	}(this)) > 10) {
		haxe.Log.trace("Found discontinuity in time. Assuming new game has been loaded. " + Std.string((function($this) {
			var $r;
			var this3 = Memory;
			$r = this3.lastGameTime;
			return $r;
		}(this))) + " -> " + Game.time,{ fileName : "IDManager.hx", lineNumber : 33, className : "IDManager", methodName : "tick"});
		haxe.Log.trace("Clearing old data...",{ fileName : "IDManager.hx", lineNumber : 35, className : "IDManager", methodName : "tick"});
		var this4 = Memory;
		this4.counter = 0;
		var this5 = Memory;
		this5.objects = null;
		var this6 = Memory;
		this6.refmap = null;
		var this7 = Memory;
		this7.manager = null;
		var this8 = Memory;
		this8.creepQueue = null;
		var this9 = Memory;
		this9.arrays = null;
		var this10 = Memory;
		this10.gameStartTime = Game.time;
		var this11 = Memory;
		this11.refmap = null;
	} else if(Game.time - (function($this) {
		var $r;
		var this12 = Memory;
		$r = this12.lastGameTime;
		return $r;
	}(this)) > 1) haxe.Log.trace("======= SKIPPED " + (Game.time - (function($this) {
		var $r;
		var this13 = Memory;
		$r = this13.lastGameTime;
		return $r;
	}(this)) - 1) + " FRAMES =======",{ fileName : "IDManager.hx", lineNumber : 46, className : "IDManager", methodName : "tick"});
	if((function($this) {
		var $r;
		var this14 = Memory;
		$r = this14.gameStartTime;
		return $r;
	}(this)) == null) {
		var this15 = Memory;
		this15.gameStartTime = Game.time;
		haxe.Log.trace("Found no definition of gameStartTime",{ fileName : "IDManager.hx", lineNumber : 51, className : "IDManager", methodName : "tick"});
	}
	IDManager.timeSinceStart = Game.time - (function($this) {
		var $r;
		var this16 = Memory;
		$r = this16.gameStartTime;
		return $r;
	}(this));
	var this17 = Memory;
	this17.lastGameTime = Game.time;
	if((function($this) {
		var $r;
		var this18 = Memory;
		$r = this18.counter;
		return $r;
	}(this)) == null) {
		var this19 = Memory;
		this19.counter = 1;
	}
	var this20 = Memory;
	IDManager.manager = this20.manager;
	if(IDManager.manager == null) IDManager.manager = new AIManager(); else IDManager.manager = IDManager.copyFields(IDManager.manager,new AIManager());
	var objects;
	if((function($this) {
		var $r;
		var this21 = Memory;
		$r = this21.objects;
		return $r;
	}(this)) == null) objects = new Array(); else {
		var this22 = Memory;
		objects = this22.objects;
	}
	var this23 = Memory;
	IDManager.creepQueue = this23.creepQueue;
	if(IDManager.creepQueue == null) IDManager.creepQueue = { };
	var this24 = Memory;
	IDManager.objs2ref = this24.refmap;
	if(IDManager.objs2ref == null) IDManager.objs2ref = { };
	IDManager.loadedObjects = new Array();
	var toRemove = [];
	var _g = 0;
	var _g1 = Reflect.fields(IDManager.creepQueue);
	while(_g < _g1.length) {
		var queItem = _g1[_g];
		++_g;
		if(Game.creeps[queItem] != null) {
			var ent = new AICreep();
			IDManager.addLink(Game.creeps[queItem],IDManager.copyFields(IDManager.creepQueue[queItem],ent));
			IDManager.loadedObjects.push(ent);
			toRemove.push(queItem);
		}
	}
	var _g2 = 0;
	while(_g2 < toRemove.length) {
		var key = toRemove[_g2];
		++_g2;
		Reflect.deleteField(IDManager.creepQueue,key);
	}
	var room;
	var res = null;
	var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
	while( $it0.hasNext() ) {
		var room1 = $it0.next();
		res = room1;
	}
	room = res;
	var toDestroy = new Array();
	var _g3 = 0;
	while(_g3 < objects.length) {
		var obj = objects[_g3];
		++_g3;
		var ent1 = obj;
		var linkStr;
		if(ent1.linked != null) linkStr = ent1.linked.substring(1); else linkStr = null;
		var destroyed;
		var this25 = Game.getObjectById(linkStr);
		destroyed = this25 == null;
		var ent2 = Type.createInstance(Type.resolveClass(ent1.type),[]);
		if(ent2.isStandalone()) destroyed = false;
		IDManager.copyFields(obj,ent2);
		if(!destroyed) {
			var _g11 = ent2.type;
			switch(_g11) {
			case "AICreep":case "CreepEnergyCarrier":case "Healer":
				IDManager.creeps.push(ent2);
				break;
			case "AISpawn":
				IDManager.spawns.push(ent2);
				break;
			case "AISource":
				IDManager.sources.push(ent2);
				break;
			case "AIEnergy":
				IDManager.energy.push(ent2);
				break;
			case "AIDefencePosition":
				IDManager.defences.push(ent2);
				break;
			case "AIConstructionSite":
				IDManager.constructionSites.push(ent2);
				break;
			default:
			}
		}
		if(destroyed) {
			haxe.Log.trace(Game.time + ": Detected destruction of " + ent2.id + " of type " + Std.string(ent2.type),{ fileName : "IDManager.hx", lineNumber : 128, className : "IDManager", methodName : "tick"});
			toDestroy.push(ent2);
		} else {
			IDManager.id2objs.set(ent2.id,ent2);
			ent2;
			IDManager.loadedObjects.push(ent2);
		}
	}
	IDManager.rewriteForDeserialization(IDManager.manager);
	var _g4 = 0;
	var _g12 = IDManager.loadedObjects;
	while(_g4 < _g12.length) {
		var ent3 = _g12[_g4];
		++_g4;
		IDManager.rewriteForDeserialization(ent3);
		ent3.manager = IDManager.manager;
		if(!ent3.isStandalone()) {
			var owned = ent3.linked;
			if(owned.my != null) ent3.my = owned.my; else ent3.my = false;
		}
	}
	var _g5 = 0;
	while(_g5 < toDestroy.length) {
		var ent4 = toDestroy[_g5];
		++_g5;
		IDManager.rewriteForDeserialization(ent4);
		ent4.manager = IDManager.manager;
	}
	var _g6 = 0;
	while(_g6 < toDestroy.length) {
		var ent5 = toDestroy[_g6];
		++_g6;
		ent5.onDestroyed();
	}
	var $it1 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.spawns);
	while( $it1.hasNext() ) {
		var obj1 = $it1.next();
		if(_Ref.Ref_Impl_.compT(IDManager.objs2ref[obj1.id],null)) IDManager.addLink(obj1,new AISpawn().configure());
	}
	var _g7 = 0;
	var _g13 = room.find(5);
	while(_g7 < _g13.length) {
		var obj2 = _g13[_g7];
		++_g7;
		if(_Ref.Ref_Impl_.compT(IDManager.objs2ref[obj2.id],null)) IDManager.addLink(obj2,new AISource().configure());
	}
	IDManager.structures = room.find(7);
	IDManager.allCreeps = room.find(1);
	IDManager.hostileCreeps = room.find(3);
	IDManager.droppedEnergy = room.find(6);
	var _g8 = 0;
	var _g14 = room.find(11);
	while(_g8 < _g14.length) {
		var obj3 = _g14[_g8];
		++_g8;
		if(_Ref.Ref_Impl_.compT(IDManager.objs2ref[obj3.id],null)) IDManager.addLink(obj3,new AIConstructionSite().configure());
	}
	var _g9 = 0;
	var _g15 = IDManager.loadedObjects;
	while(_g9 < _g15.length) {
		var ob = _g15[_g9];
		++_g9;
		ob.earlyTick();
	}
};
IDManager.rewriteForSerialization = function(obj) {
	

		var rec3 = function (arr) {
			if (arr.length == 0 || typeof arr[0] == 'number') {
				return {data: arr, key: null};
			}

			var arr2 = [];
			var conversion = null;
			for (var i = 0; i < arr.length; i++) {
				var val = arr[i];
	    		if (val != null) {
					if (val.hasOwnProperty('id')) {
						if (typeof(val.id) == 'string') {
							conversion = 'a';
							arr2.push (val.id);
						} else {
							conversion = 'b';
							arr2.push (val.id);
						}
					} else if (val instanceof Array && val.length > 20 && typeof(val[0]) == 'number') {

						var buffer = new ArrayBuffer(val.length*4);
						var floatBuffer = new Float32Array(buffer);
						for (var i = 0; i < val.length; i++ ) {
							floatBuffer[i] = val[i];
						}

						conversion = 'c';
						arr2.push (THREE.Base64.fromArrayBuffer(buffer));
					} else if (val instanceof Float32Array) {
						var encoded = THREE.Base64.fromArrayBuffer(val.buffer);
						arr2.push (encoded);
						conversion = 'd';
					} else if (typeof(val) == 'object') {
						rec(val);
						arr2.push (val);
					}
				} else {
					arr2.push (null);
				}
			}
			return {data: arr2, key: conversion};
		};

		var rec2 = function (obj, key) {
			if ( obj.hasOwnProperty(key)) {

	    		var val = obj[key];
	    		if (val != null) {
					if (val.hasOwnProperty('id')) {
						if (typeof(val.id) == 'string') {
							obj['a_'+key] = val.id;
							obj[key] = null;
						} else {
							obj['b_'+key] = val.id;
							obj[key] = null;
						}
					} else if (val instanceof Array && val.length > 20 && typeof(val[0]) == 'number') {

						var buffer = new ArrayBuffer(val.length*4);
						var floatBuffer = new Float32Array(buffer);
						for (var i = 0; i < val.length; i++ ) {
							floatBuffer[i] = val[i];
						}
						obj['c_'+key] = THREE.Base64.fromArrayBuffer(buffer);
						obj[key] = null;
					} else if (val instanceof Float32Array) {
						var encoded = THREE.Base64.fromArrayBuffer(val.buffer);
						obj['d_'+key] = encoded;
						obj[key] = null;
					} else if (val instanceof Array) {
						var info = rec3 (val);
						if (info.key != null) {
							obj[info.key+'_'+key] = info.data;
							obj[key] = null;
						}
					} else if (typeof(val) == 'object') {
						rec(val);
					}
				}
		    }
		}
		var rec;
		rec = function (obj) {
			for (var key in obj) {
		    	rec2(obj, key);
			}
	    };
	    rec(obj);
		;
};
IDManager.rewriteForDeserialization = function(obj) {
	

		var rec2 = function (arr, id) {

			if (arr.length == 0 || typeof arr[0] == 'number') {
				return arr;
			}

			var arr2 = [];
			if ( id == 'a' ) {
				for (var i=0; i < arr.length; i++)
					// Screeps ref
					arr2.push (IDManager.bySCID(arr[i]));
			} else if ( id == 'b' ) {
				for (var i=0; i < arr.length; i++)
					// Screeps ref
					arr2.push (IDManager.byID(arr[i]));
			} else if ( id == 'c') {
				for (var i=0; i < arr.length; i++)
					arr2.push (THREE.Base64.toArrayOfFloats (arr[i]));
			} else if ( id == 'd') {
				for (var i=0; i < arr.length; i++) {
					var buffer = THREE.Base64.toArrayBuffer (arr[i]);
					arr2.push (new Float32Array(buffer));
				}
			}
			return arr2;
		};

		var rec3 = function (obj, key) {
    		/*var val = obj[key];
    		if (val != null) {

    			if (key[1] == '_') {

    				var id = key[0];
	    			var newName = key.substring(2);

    				if (val instanceof Array) {
    					obj[newName] = rec2 (val, id);
    				} else {
		    			if ( id == 'a' ) {
		    				// Screeps ref
							obj[newName] = IDManager.bySCID(val);
						} else if ( id == 'b' ) {
							// Our ref
							obj[newName] = IDManager.byID(val);
						} else if ( id == 'c') {
							obj[newName] = THREE.Base64.toArrayOfFloats (val);
						} else if ( id == 'd') {
							var buffer = THREE.Base64.toArrayBuffer (val);
							obj[newName] = new Float32Array(buffer);
						}
					}
					obj[key] = null;
				} else if (typeof(val) == 'object') {
					rec(val);
				}
			}*/

		   var val = obj[key];
		   if (val != null) {

			   if (typeof(val) == 'string') {
					if (val[0] == '#') {
						// Screeps ref
						obj[key] = IDManager.bySCID(val.substring(1));
					} else if ( val[0] == '@' ) {
						// Our ref
						obj[key] = IDManager.byID(parseInt(val.substring(1)));
					} else if ( val[0] == '%' ) {
						obj[key] = Memory['arrays'][parseInt(val.substring(1))];
					}
			   } else if (typeof(val) == 'object') {
					rec(val);
			   }
			}
		}
		var rec;
		rec = function (obj) {
			for (var key in obj) {
				if ( obj.hasOwnProperty(key)) {
					rec3 (obj, key);
				}
			}
	    };
	    rec(obj);
		;
};
IDManager.copyFields = function(from,to) {
	
	    for (var key in from) {
	    	if ( from.hasOwnProperty(key)) {
		        //copy all the fields
		        to[key] = from[key];
		    }
	    }
	return to;
};
IDManager.replacer = function(key,obj) {
	
		if (obj != null) {
			if (obj.hasOwnProperty('id') && key != '') {
				if (typeof obj.id == 'string') {
					return '#' + obj.id;
				} else {
					return '@' + obj.id;
				}
			} else if (obj.length != undefined && obj.length > 20 && typeof obj[0] == 'number') {
				Memory['arrays'].push (obj);
				Memory['arrayContext'].push (key);
				return '%' + (Memory['arrays'].length-1);
			}
		}
		;
	return obj;
};
IDManager.reviewer = function(key,obj) {
	
			if (typeof obj == 'string') {
				if (obj[0] == '+') {
					return byID (parseInt(obj));
				} else {
					return bySCID (obj);
				}
			}
		;
	return obj;
};
IDManager.tickEnd = function() {
	var this1 = Memory;
	this1.refmap = IDManager.objs2ref;
	var this2 = Memory;
	this2.objects = null;
	var this3 = Memory;
	this3.manager = null;
	var this4 = Memory;
	this4.creepQueue = null;
	var this5 = Memory;
	this5.arrays = [];
	var this6 = Memory;
	this6.arrayContext = [];
	IDManager.manager.map.movementPatternMap = null;
	IDManager.manager.pathfinder.costs = null;
	IDManager.manager.map.potentialDamageMap = null;
	IDManager.manager.assignment = null;
	var t1 = haxe.Timer.stamp();
	var objects = new Array();
	var _g = 0;
	var _g1 = IDManager.loadedObjects;
	while(_g < _g1.length) {
		var obj = _g1[_g];
		++_g;
		obj.manager = undefined;
		objects.push(JSON.parse(JSON.stringify(obj,IDManager.replacer)));
	}
	var _g2 = 0;
	var _g11 = Reflect.fields(IDManager.creepQueue);
	while(_g2 < _g11.length) {
		var key = _g11[_g2];
		++_g2;
		var obj1 = IDManager.creepQueue[key];
		obj1.manager = undefined;
		var value = JSON.parse(JSON.stringify(obj1,IDManager.replacer));
		IDManager.creepQueue[key] = value;
	}
	var this7 = Memory;
	this7.creepQueue = IDManager.creepQueue;
	var this8 = Memory;
	this8.objects = objects;
	var this9 = Memory;
	var value1 = JSON.parse(JSON.stringify(IDManager.manager,IDManager.replacer));
	this9.manager = value1;
};
IDManager.initialize = function(obj,register) {
	if(register == null) register = true;
	obj.manager = IDManager.manager;
	var id;
	var this1 = Memory;
	id = this1.counter;
	var this2 = Memory;
	this2.counter = id + 1;
	obj.id = id;
	IDManager.id2objs.set(id,obj);
	obj;
	if(register) IDManager.loadedObjects.push(obj);
};
IDManager.queueAddCreep = function(name,creep) {
	var this1 = Memory;
	this1[name + "_id"] = creep.id;
	haxe.Log.trace("Queing " + creep.id,{ fileName : "IDManager.hx", lineNumber : 479, className : "IDManager", methodName : "queueAddCreep"});
	var value = IDManager.copyFields(creep,{ });
	IDManager.creepQueue[name] = value;
};
IDManager.addLink = function(obj1,obj2) {
	var linkedEntity = obj2.linked;
	if(linkedEntity != null) throw "The Base object needs to be specifically created for the specified Entity.";
	obj2.linked = obj1;
	IDManager.objs2ref[obj1.id] = obj2.id;
	var owned = obj1;
	if(owned.my != null) obj2.my = owned.my; else obj2.my = false;
};
IDManager.destroy = function(obj) {
	HxOverrides.remove(IDManager.loadedObjects,obj);
};
IDManager.bySCID = function(id) {
	return Game.getObjectById(id);
};
IDManager.byID = function(id) {
	return IDManager.id2objs.get(id);
};
var IterTools = function() { };
$hxClasses["IterTools"] = IterTools;
IterTools.__name__ = true;
IterTools.chain = function(itr,nonIterableTransform) {
	if(nonIterableTransform == null) nonIterableTransform = function(x) {
		return IterTools.repeat(x,1);
	};
	var cur_itr = null;
	var setCurItr = function() {
		var cur_val = itr.next();
		if(IterTools.isIterable(cur_val)) cur_itr = $iterator(cur_val)(); else cur_itr = nonIterableTransform(cur_val);
	};
	while(cur_itr == null && itr.hasNext()) setCurItr();
	return { next : function() {
		return cur_itr.next();
	}, hasNext : function() {
		if(cur_itr.hasNext()) return true; else if(itr.hasNext()) {
			while(cur_itr == null && itr.hasNext() || cur_itr != null && !cur_itr.hasNext()) setCurItr();
			return cur_itr.hasNext();
		} else return false;
	}};
};
IterTools.longestLength = function(itr) {
	var max_length = 0;
	while( itr.hasNext() ) {
		var i = itr.next();
		if(IterTools.isIterable(i)) {
			var count = Lambda.count(i);
			if(count > max_length) max_length = count;
		}
	}
	return max_length;
};
IterTools.shortestLength = function(it) {
	var max_length = null;
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		if(IterTools.isIterable(i)) {
			var count = Lambda.count(i);
			if(max_length == null) max_length = count; else if(count < max_length) max_length = count;
		}
	}
	return max_length;
};
IterTools.zip = function(itr,longest,nonIterableTransform,fill) {
	if(longest == null) longest = false;
	if(fill != null) longest = true;
	if(nonIterableTransform == null) nonIterableTransform = function(x) {
		throw "NonIterable element in \"it\" for zip";
		return null;
	};
	var list_itr = new List();
	var max_length = 0;
	while( itr.hasNext() ) {
		var i = itr.next();
		if(IterTools.isIterable(i)) {
			var itr1 = $iterator(i)();
			list_itr.add(itr1);
		} else {
			var itr2 = nonIterableTransform(i);
			if(itr2 != null) list_itr.add(itr2);
		}
	}
	var zipCheck = IterTools.zipCheckHelper(longest);
	var itr_list_itr = list_itr.iterator();
	var status = { first : false};
	return { next : function() {
		return IterTools.zipNextHelper(itr_list_itr,fill,status);
	}, hasNext : function() {
		if(!itr_list_itr.hasNext()) itr_list_itr = list_itr.iterator(); else if(itr_list_itr.hasNext() && status.first) {
			while( itr_list_itr.hasNext() ) {
				var i1 = itr_list_itr.next();
				i1.next();
			}
		}
		return zipCheck(list_itr);
	}};
};
IterTools.zipCheckHelper = function(longest) {
	var fold_func;
	var start;
	if(longest) {
		fold_func = function(item,accum) {
			return accum || item.hasNext();
		};
		start = false;
	} else {
		fold_func = function(item1,accum1) {
			return accum1 && item1.hasNext();
		};
		start = true;
	}
	var f = function(x) {
		return Lambda.fold(x,fold_func,start);
	};
	return f;
};
IterTools.zipNextHelper = function(itr,fill,status) {
	return { next : function() {
		var cur = itr.next();
		var val = Dynamic;
		status.first = false;
		if(cur.hasNext()) val = cur.next(); else val = fill;
		return val;
	}, hasNext : function() {
		if(itr.hasNext()) return true; else return false;
	}};
};
IterTools.combinator = function(it,k,i,idx,pos) {
	var itr = $iterator(it)();
	var n = IterTools.getLength(null,it);
	if(idx == null) {
		if(i == null) idx = ArrayTools.randomCombinationIndex(n,k); else idx = ArrayTools.combinationIndex(n,k,i,{ fileName : "IterTools.hx", lineNumber : 288, className : "IterTools", methodName : "combinator"});
	}
	if(idx == null) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var idx_itr = HxOverrides.iter(idx);
	var cur_index = 0;
	var cur_target = idx_itr.next();
	return { next : function() {
		cur_target = idx_itr.next();
		return itr.next();
	}, hasNext : function() {
		while(itr.hasNext() && cur_index < cur_target) {
			cur_index++;
			itr.next();
		}
		return itr.hasNext();
	}};
};
IterTools.permutator = function(it,i,idx,pos) {
	var length = IterTools.getLength(null,it);
	if(idx == null) {
		if(i == null) {
			idx = ArrayTools.indexArray(length);
			ArrayTools.shuffle(idx);
		} else idx = ArrayTools.permutationIndex(length,i);
	}
	if(idx == null) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var idx_ptr = HxOverrides.iter(idx);
	var itr = $iterator(it)();
	var cur_idx = 0;
	return { next : function() {
		return itr.next();
	}, hasNext : function() {
		var next_idx = idx_ptr.next();
		if(next_idx == null) return false; else if(next_idx > cur_idx) {
			cur_idx++;
			itr = IterTools.skip(itr,next_idx - cur_idx,{ fileName : "IterTools.hx", lineNumber : 350, className : "IterTools", methodName : "permutator"});
		} else if(next_idx <= cur_idx) itr = IterTools.skip($iterator(it)(),next_idx,{ fileName : "IterTools.hx", lineNumber : 353, className : "IterTools", methodName : "permutator"});
		return itr.hasNext();
	}};
};
IterTools.skip = function(itr,count,pos) {
	if(count < 0) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var _g = 0;
	while(_g < count) {
		var i = _g++;
		if(!itr.hasNext()) return itr;
		itr.next();
	}
	return itr;
};
IterTools.emptyIterator = function(e) {
	return { next : function() {
		return null;
	}, hasNext : function() {
		return false;
	}};
};
IterTools.range = function(from,to) {
	if(from == null) from = 0;
	var by = 1;
	if(from > to) by *= -1;
	var set_from = from;
	return { next : function() {
		var return_val = from;
		from += by;
		return return_val;
	}, hasNext : function() {
		return to == null || from - to != 0;
	}};
};
IterTools.fieldItr = function(itr,get_field) {
	return { next : function() {
		return Reflect.field(itr.next(),get_field);
	}, hasNext : function() {
		return itr.hasNext();
	}};
};
IterTools.dropWhile = function(itr,predicate) {
	var drop = true;
	var end = false;
	var cur_val = itr.next();
	if(predicate == null) predicate = IterTools.isNotNull;
	return { next : function() {
		return cur_val;
	}, hasNext : function() {
		if(drop) {
			while(drop) {
				if(!itr.hasNext()) return false;
				cur_val = itr.next();
				if(predicate(cur_val)) drop = false;
			}
			return true;
		} else {
			var one_more = itr.hasNext();
			cur_val = itr.next();
			return one_more;
		}
	}};
};
IterTools.slice = function(itr,start,end,step,pos) {
	if(step == null) step = 1;
	if(start == null) start = 0;
	if(start < 0 || end < 0 || step < 0 || start > end) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var cur_init = 0;
	while(cur_init < start && itr.hasNext()) {
		cur_init++;
		itr.next();
	}
	return { next : function() {
		cur_init++;
		return itr.next();
	}, hasNext : function() {
		if(!itr.hasNext()) return false; else if(end != null && cur_init > end) return false; else {
			var cur_step = step;
			while(cur_step > 1 && itr.hasNext()) {
				itr.next();
				cur_step--;
			}
		}
		return itr.hasNext();
	}};
};
IterTools.cycle = function(itr,times,reInit,pos) {
	var store_arr = new Array();
	var store_complete = false;
	if(times < 0) {
		throw "initialization error for " + pos.methodName;
		return null;
	}
	var count = 0;
	return { next : function() {
		return itr.next();
	}, hasNext : function() {
		if(count >= times) return false; else if(itr.hasNext()) return true; else {
			count++;
			if(count >= times) return false; else itr = reInit();
			return itr.hasNext();
		}
	}};
};
IterTools.repeat = function(obj,times) {
	if(times < 0) return null;
	var count = 0;
	return { next : function() {
		count++;
		return obj;
	}, hasNext : function() {
		return times == null || count < times;
	}};
};
IterTools.takeWhile = function(itr,predicate) {
	var cur_val = itr.next();
	if(predicate == null) predicate = IterTools.isNotNull;
	return { next : function() {
		var return_val = cur_val;
		cur_val = itr.next();
		return return_val;
	}, hasNext : function() {
		if(!itr.hasNext()) return false; else if(!predicate(cur_val)) return false; else return true;
	}};
};
IterTools.filter = function(itr,transformer) {
	var cur_val = itr.next();
	if(transformer == null) transformer = IterTools.isNotNull;
	return { next : function() {
		var return_val = cur_val;
		cur_val = itr.next();
		return return_val;
	}, hasNext : function() {
		if(!itr.hasNext()) return false; else if(cur_val != null && !transformer(cur_val)) return false; else return true;
	}};
};
IterTools.count = function(start) {
	if(start == null) start = 0;
	return { next : function() {
		return start++;
	}, hasNext : function() {
		return start < 2147483648;
	}};
};
IterTools.groupBy = function(itr,transformer) {
	if(transformer == null) transformer = IterTools.identity;
	var cur_value = itr.next();
	var group = { key : null, next : function() {
		return null;
	}, hasNext : function() {
		return false;
	}};
	return { next : function() {
		var this_key = transformer(cur_value);
		var this_next = function() {
			var return_value = cur_value;
			cur_value = itr.next();
			return return_value;
		};
		var this_hasNext = function() {
			if(!itr.hasNext()) return false;
			if(this_key != transformer(cur_value)) return false; else return true;
		};
		group = { key : this_key, next : this_next, hasNext : this_hasNext};
		return group;
	}, hasNext : function() {
		while(group.hasNext()) group.next();
		return itr.hasNext();
	}};
};
IterTools.map = function(itr,transform) {
	return { next : function() {
		return transform(itr.next());
	}, hasNext : function() {
		return itr.hasNext();
	}};
};
IterTools.mapi = function(itr,transform) {
	var cnt = 0;
	return { next : function() {
		return transform(cnt++,itr.next());
	}, hasNext : function() {
		return itr.hasNext();
	}};
};
IterTools.getLength = function(itl,it) {
	if(itl != null) return itl.length; else if(it != null) return Lambda.count(it); else return null;
};
IterTools.itb = function(itr,store) {
	if(store == null) store = false;
	if(store) return new StoredIterator(itr); else return { iterator : function() {
		return itr;
	}};
};
IterTools.isIterable = function(d) {
	return d != null && (Object.prototype.hasOwnProperty.call(d,"iterator") || (d instanceof Array) && d.__enum__ == null);
};
IterTools.unfold = function(seed,transformer,incrementor,predicate) {
	if(predicate == null) predicate = IterTools.isNotNull;
	var cur_val = seed;
	return { hasNext : function() {
		return predicate(cur_val);
	}, next : function() {
		var ret_val = transformer(seed);
		cur_val = incrementor(cur_val);
		return ret_val;
	}};
};
IterTools.isNotNull = function(e) {
	return e != null;
};
IterTools.identity = function(e) {
	return e;
};
IterTools.greaterThanZero = function(e) {
	return e > 0;
};
var StoredIterator = function(itr) {
	this.stored_arr = new Array();
	this.itr = itr;
	if(!itr.hasNext()) {
		this.started = true;
		this.finished = true;
	} else {
		this.started = false;
		this.finished = false;
	}
};
$hxClasses["StoredIterator"] = StoredIterator;
StoredIterator.__name__ = true;
StoredIterator.prototype = {
	isFinished: function() {
		return this.started && this.finished;
	}
	,isStarted: function() {
		return this.started;
	}
	,iterator: function() {
		if(this.started && !this.finished && !this.itr.hasNext()) this.finished = true;
		if(this.started && !this.finished && this.itr.hasNext()) {
			throw "Second StoredIterator.iterator() called before Iterator argument was completely stored";
			return null;
		} else if(this.finished) return HxOverrides.iter(this.stored_arr); else {
			this.started = true;
			var t = this;
			return { itr : this.itr, stored_arr : this.stored_arr, hasNext : function() {
				return t.itr.hasNext();
			}, next : function() {
				var ret_val = t.itr.next();
				t.stored_arr.push(ret_val);
				return ret_val;
			}};
		}
	}
	,toString: function() {
		if(this.started && !this.finished && this.itr.hasNext()) {
			throw "StoredIterator.toString() called before Iterator argument was completely stored";
			return null;
		} else {
			var $it0 = this.itr;
			while( $it0.hasNext() ) {
				var i = $it0.next();
				this.stored_arr.push(i);
			}
		}
		return this.stored_arr.toString();
	}
};
var Lambda = function() { };
$hxClasses["Lambda"] = Lambda;
Lambda.__name__ = true;
Lambda.array = function(it) {
	var a = new Array();
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		a.push(i);
	}
	return a;
};
Lambda.fold = function(it,f,first) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		first = f(x,first);
	}
	return first;
};
Lambda.count = function(it,pred) {
	var n = 0;
	if(pred == null) {
		var $it0 = $iterator(it)();
		while( $it0.hasNext() ) {
			var _ = $it0.next();
			n++;
		}
	} else {
		var $it1 = $iterator(it)();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(pred(x)) n++;
		}
	}
	return n;
};
var List = function() {
	this.length = 0;
};
$hxClasses["List"] = List;
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
};
var IMap = function() { };
$hxClasses["IMap"] = IMap;
IMap.__name__ = true;
Math.__name__ = true;
var Node = function() { };
$hxClasses["Node"] = Node;
Node.__name__ = true;
var _PathfindingAlgorithm = {};
_PathfindingAlgorithm.PathfindingAlgorithm_Impl_ = function() { };
$hxClasses["_PathfindingAlgorithm.PathfindingAlgorithm_Impl_"] = _PathfindingAlgorithm.PathfindingAlgorithm_Impl_;
_PathfindingAlgorithm.PathfindingAlgorithm_Impl_.__name__ = true;
var PriorityQueue = function() {
	this.nextElementIndex = 1;
	this.data = new Array();
	this.data.push(null);
};
$hxClasses["PriorityQueue"] = PriorityQueue;
PriorityQueue.__name__ = true;
PriorityQueue.prototype = {
	isEmpty: function() {
		return this.nextElementIndex == 1;
	}
	,clear: function() {
		var _g1 = 1;
		var _g = this.nextElementIndex;
		while(_g1 < _g) {
			var i = _g1++;
			this.data[i].heapIndex = -1;
		}
		this.nextElementIndex = 1;
	}
	,push: function(v) {
		if(v.heapIndex < this.nextElementIndex && this.data[v.heapIndex] == v) {
			this.trickle(v.heapIndex);
			return;
		}
		if(this.data.length == this.nextElementIndex) this.data.push(v); else this.data[this.nextElementIndex] = v;
		v.heapIndex = this.nextElementIndex;
		this.trickle(this.nextElementIndex);
		this.nextElementIndex++;
	}
	,pushOrTrickle: function(v) {
		if(v.heapIndex != -1) {
			if(this.data[v.heapIndex] != v) throw "Invalid state";
			this.trickle(v.heapIndex);
		} else this.push(v);
	}
	,trickle: function(index) {
		while(index != 1) {
			var parent = Math.floor(index / 2);
			if(this.data[parent].f > this.data[index].f) {
				var tmp = this.data[parent];
				this.data[parent] = this.data[index];
				this.data[parent].heapIndex = parent;
				this.data[index] = tmp;
				this.data[index].heapIndex = index;
				index = parent;
			} else break;
		}
	}
	,pop: function() {
		if(this.nextElementIndex == 1) return null;
		var toReturn = this.data[1];
		toReturn.heapIndex = -1;
		var index = 1;
		this.nextElementIndex--;
		if(this.nextElementIndex == 1) return toReturn;
		var obj = this.data[this.nextElementIndex];
		while(true) {
			var swapIndex = this.nextElementIndex;
			var ind2 = index * 2;
			if(ind2 + 1 < this.nextElementIndex) {
				if(this.data[swapIndex].f > this.data[ind2].f) swapIndex = ind2;
				if(this.data[swapIndex].f > this.data[ind2 + 1].f) swapIndex = ind2 + 1;
			} else if(ind2 < this.nextElementIndex) {
				if(this.data[swapIndex].f > this.data[ind2].f) swapIndex = ind2;
			}
			if(swapIndex != this.nextElementIndex) {
				this.data[index] = this.data[swapIndex];
				this.data[index].heapIndex = index;
				index = swapIndex;
			} else break;
		}
		this.data[index] = obj;
		this.data[index].heapIndex = index;
		return toReturn;
	}
};
var PriorityQueue_Point = function() {
	this.nextElementIndex = 1;
	this.data = new Array();
	this.data.push(null);
};
$hxClasses["PriorityQueue_Point"] = PriorityQueue_Point;
PriorityQueue_Point.__name__ = true;
PriorityQueue_Point.prototype = {
	isEmpty: function() {
		return this.nextElementIndex == 1;
	}
	,clear: function() {
		var _g1 = 1;
		var _g = this.nextElementIndex;
		while(_g1 < _g) {
			var i = _g1++;
			this.data[i].heapIndex = -1;
		}
		this.nextElementIndex = 1;
	}
	,push: function(v) {
		if(v.heapIndex < this.nextElementIndex && this.data[v.heapIndex] == v) {
			this.trickle(v.heapIndex);
			return;
		}
		if(this.data.length == this.nextElementIndex) this.data.push(v); else this.data[this.nextElementIndex] = v;
		v.heapIndex = this.nextElementIndex;
		this.trickle(this.nextElementIndex);
		this.nextElementIndex++;
	}
	,pushOrTrickle: function(v) {
		if(v.heapIndex != -1) {
			if(this.data[v.heapIndex] != v) throw "Invalid state";
			this.trickle(v.heapIndex);
		} else this.push(v);
	}
	,trickle: function(index) {
		while(index != 1) {
			var parent = Math.floor(index / 2);
			if(this.data[parent].f > this.data[index].f) {
				var tmp = this.data[parent];
				this.data[parent] = this.data[index];
				this.data[parent].heapIndex = parent;
				this.data[index] = tmp;
				this.data[index].heapIndex = index;
				index = parent;
			} else break;
		}
	}
	,pop: function() {
		if(this.nextElementIndex == 1) return null;
		var toReturn = this.data[1];
		toReturn.heapIndex = -1;
		var index = 1;
		this.nextElementIndex--;
		if(this.nextElementIndex == 1) return toReturn;
		var obj = this.data[this.nextElementIndex];
		while(true) {
			var swapIndex = this.nextElementIndex;
			var ind2 = index * 2;
			if(ind2 + 1 < this.nextElementIndex) {
				if(this.data[swapIndex].f > this.data[ind2].f) swapIndex = ind2;
				if(this.data[swapIndex].f > this.data[ind2 + 1].f) swapIndex = ind2 + 1;
			} else if(ind2 < this.nextElementIndex) {
				if(this.data[swapIndex].f > this.data[ind2].f) swapIndex = ind2;
			}
			if(swapIndex != this.nextElementIndex) {
				this.data[index] = this.data[swapIndex];
				this.data[index].heapIndex = index;
				index = swapIndex;
			} else break;
		}
		this.data[index] = obj;
		this.data[index].heapIndex = index;
		return toReturn;
	}
};
var Profiler = function() {
};
$hxClasses["Profiler"] = Profiler;
Profiler.__name__ = true;
Profiler.setInstance = function(prof) {
	Profiler.instance = prof;
};
Profiler.verifyStackZero = function() {
	if(Profiler.instance.stack.length != 0) {
		haxe.Log.trace("Profiler stack was not empty",{ fileName : "Profiler.hx", lineNumber : 44, className : "Profiler", methodName : "verifyStackZero"});
		haxe.Log.trace(Profiler.instance.stack,{ fileName : "Profiler.hx", lineNumber : 45, className : "Profiler", methodName : "verifyStackZero"});
		Profiler.instance.stack = [];
	}
};
Profiler.getInstance = function() {
	if(Profiler.instance == null) {
		Profiler.instance = new Profiler();
		Profiler.instance.instancedAt = haxe.Timer.stamp();
		Profiler.instance.startedAt = haxe.Timer.stamp();
		Profiler.instance.sectionMap = { };
		Profiler.instance.stack = new Array();
		Profiler.instance.selfTime = 0;
		Profiler.instance.selfTime += haxe.Timer.stamp() - Profiler.instance.startedAt;
	}
	return Profiler.instance;
};
Profiler.start = function(section) {
	Profiler.instance.startedAt = haxe.Timer.stamp();
	var elem = null;
	if(Profiler.instance.sectionMap[section] == null) {
		elem = new SectionData(section);
		Profiler.instance.sectionMap[section] = elem;
	} else {
		elem = Profiler.instance.sectionMap[section];
		elem.startTime = haxe.Timer.stamp();
	}
	Profiler.instance.stack.push(elem);
	Profiler.instance.selfTime += haxe.Timer.stamp() - Profiler.instance.startedAt;
};
Profiler.stop = function() {
	if(Profiler.instance.stack.length > 0) {
		var elem = Profiler.instance.stack.pop();
		SectionData.stop(elem);
	} else throw "ERROR: Cannot end profiler here. Stack is empty\n" + haxe.CallStack.toString(haxe.CallStack.callStack());
};
Profiler.get = function(section) {
	Profiler.instance.startedAt = haxe.Timer.stamp();
	if(Profiler.instance.sectionMap[section] != null) return Profiler.instance.sectionMap[section].totalTime;
	Profiler.instance.selfTime += haxe.Timer.stamp() - Profiler.instance.startedAt;
	return 0;
};
Profiler.startThis = function() {
	Profiler.instance.startedAt = haxe.Timer.stamp();
};
Profiler.stopThis = function() {
	Profiler.instance.selfTime += haxe.Timer.stamp() - Profiler.instance.startedAt;
};
Profiler.tick = function() {
	var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Profiler.instance.sectionMap);
	while( $it0.hasNext() ) {
		var v = $it0.next();
		v.thisTick = 0;
	}
};
Profiler.clamp = function(min,val,max) {
	if(min > val) return min; else if(max < val) return max; else return val;
};
Profiler.toString = function() {
	var s = "";
	var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Profiler.instance.sectionMap);
	while( $it0.hasNext() ) {
		var v = $it0.next();
		s += v.name + ":\t\t" + Math.round(v.totalTime * 1000) + "\t Average: " + Math.round(v.totalTime / v.counter * 1000) + "\n";
	}
	return s;
};
Profiler.toStringThisTick = function() {
	var s = "";
	var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Profiler.instance.sectionMap);
	while( $it0.hasNext() ) {
		var v = $it0.next();
		s += v.name + ":\t\t" + Math.round(v.thisTick * 1000) + "\n";
	}
	return s;
};
var SectionData = function(name) {
	this.name = name;
	this.totalTime = 0;
	this.counter = 0;
	this.startTime = haxe.Timer.stamp();
};
$hxClasses["SectionData"] = SectionData;
SectionData.__name__ = true;
SectionData.stop = function(v) {
	var time = haxe.Timer.stamp() - v.startTime;
	v.thisTick += time;
	v.totalTime += time;
	v.counter++;
};
SectionData.start = function(v) {
	v.startTime = haxe.Timer.stamp();
};
SectionData.time = function(v) {
	return v.totalTime;
};
SectionData.toString = function(v) {
	return v.name + ":\t\t" + Math.round(v.totalTime * 1000) + "\t Average: " + Math.round(v.totalTime / v.counter * 1000);
};
SectionData.toStringThisTick = function(v) {
	return v.name + ":\t\t" + Math.round(v.thisTick * 1000);
};
var _Ref = {};
_Ref.Ref_Impl_ = function() { };
$hxClasses["_Ref.Ref_Impl_"] = _Ref.Ref_Impl_;
_Ref.Ref_Impl_.__name__ = true;
_Ref.Ref_Impl_._new = function(v) {
	return v;
};
_Ref.Ref_Impl_.fromBase = function(s) {
	return s.id;
};
_Ref.Ref_Impl_.toEntity = function(this1) {
	return IDManager.id2objs.get(this1);
};
_Ref.Ref_Impl_.compT = function(lhs,rhs) {
	return lhs == null ? (rhs == null) : (IDManager.byID(lhs) == rhs);
};
_Ref.Ref_Impl_.compRef = function(lhs,rhs) {
	
		var val1 = lhs != null ? IDManager.byID(lhs) : null;
		var val2 = rhs != null ? IDManager.byID(rhs) : null;;
	return val1 == val2;
};
_Ref.Ref_Impl_.ncompT = function(lhs,rhs) {
	return lhs == null ? rhs != null : IDManager.byID(lhs) != rhs;
};
_Ref.Ref_Impl_.ncompRef = function(lhs,rhs) {
	
		var val1 = lhs != null ? IDManager.byID(lhs) : null;
		var val2 = rhs != null ? IDManager.byID(rhs) : null;;
	return val1 != val2;
};
var Reflect = function() { };
$hxClasses["Reflect"] = Reflect;
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
var _Results = {};
_Results.AttackResult_Impl_ = function() { };
$hxClasses["_Results.AttackResult_Impl_"] = _Results.AttackResult_Impl_;
_Results.AttackResult_Impl_.__name__ = true;
_Results.MassAttackResult_Impl_ = function() { };
$hxClasses["_Results.MassAttackResult_Impl_"] = _Results.MassAttackResult_Impl_;
_Results.MassAttackResult_Impl_.__name__ = true;
_Results.MoveResult_Impl_ = function() { };
$hxClasses["_Results.MoveResult_Impl_"] = _Results.MoveResult_Impl_;
_Results.MoveResult_Impl_.__name__ = true;
_Results.CreateFlagResult_Impl_ = function() { };
$hxClasses["_Results.CreateFlagResult_Impl_"] = _Results.CreateFlagResult_Impl_;
_Results.CreateFlagResult_Impl_.__name__ = true;
_Results.SayResult_Impl_ = function() { };
$hxClasses["_Results.SayResult_Impl_"] = _Results.SayResult_Impl_;
_Results.SayResult_Impl_.__name__ = true;
_Results.CreateConstructionSiteResult_Impl_ = function() { };
$hxClasses["_Results.CreateConstructionSiteResult_Impl_"] = _Results.CreateConstructionSiteResult_Impl_;
_Results.CreateConstructionSiteResult_Impl_.__name__ = true;
_Results.PathResult_Impl_ = function() { };
$hxClasses["_Results.PathResult_Impl_"] = _Results.PathResult_Impl_;
_Results.PathResult_Impl_.__name__ = true;
_Results.ActionResult_Impl_ = function() { };
$hxClasses["_Results.ActionResult_Impl_"] = _Results.ActionResult_Impl_;
_Results.ActionResult_Impl_.__name__ = true;
_Results.SpawnError_Impl_ = function() { };
$hxClasses["_Results.SpawnError_Impl_"] = _Results.SpawnError_Impl_;
_Results.SpawnError_Impl_.__name__ = true;
_Results.EnergyActionResult_Impl_ = function() { };
$hxClasses["_Results.EnergyActionResult_Impl_"] = _Results.EnergyActionResult_Impl_;
_Results.EnergyActionResult_Impl_.__name__ = true;
_Results.PickupResult_Impl_ = function() { };
$hxClasses["_Results.PickupResult_Impl_"] = _Results.PickupResult_Impl_;
_Results.PickupResult_Impl_.__name__ = true;
_Results.TransferResult_Impl_ = function() { };
$hxClasses["_Results.TransferResult_Impl_"] = _Results.TransferResult_Impl_;
_Results.TransferResult_Impl_.__name__ = true;
_Results.EnergyResult_Impl_ = function() { };
$hxClasses["_Results.EnergyResult_Impl_"] = _Results.EnergyResult_Impl_;
_Results.EnergyResult_Impl_.__name__ = true;
_Results.SuicideResult_Impl_ = function() { };
$hxClasses["_Results.SuicideResult_Impl_"] = _Results.SuicideResult_Impl_;
_Results.SuicideResult_Impl_.__name__ = true;
var LookResult = function() { };
$hxClasses["LookResult"] = LookResult;
LookResult.__name__ = true;
var _RoomMode = {};
_RoomMode.RoomMode_Impl_ = function() { };
$hxClasses["_RoomMode.RoomMode_Impl_"] = _RoomMode.RoomMode_Impl_;
_RoomMode.RoomMode_Impl_.__name__ = true;
var SCExtenders = function() { };
$hxClasses["SCExtenders"] = SCExtenders;
SCExtenders.__name__ = true;
SCExtenders.findClosestDroppedEnergy = function(obj,opts) {
	var v = obj.findClosest(6,opts);
	return v;
};
SCExtenders.findClosestActiveSource = function(obj,opts) {
	var v = obj.findClosest(4,opts);
	return v;
};
SCExtenders.findClosestFriendlySpawn = function(obj,opts) {
	var v = obj.findClosest(12,opts);
	return v;
};
SCExtenders.findClosestHostileCreep = function(obj,opts) {
	var v = obj.findClosest(3,opts);
	return v;
};
var Test = function(v) {
	this.f = v;
};
$hxClasses["Test"] = Test;
Test.__name__ = true;
var Screeps = function() {
};
$hxClasses["Screeps"] = Screeps;
Screeps.__name__ = true;
Screeps.getCPULeft = function() {
	var used = 0.0;
	Game.getUsedCpu(function(time) {
		used = time;
	});
	return Game.cpuLimit - used;
};
Screeps.killBecauseOfLowCPU = function() {
	var kill = Screeps.getCPULeft() < 50;
	if(kill) haxe.Log.trace("Killed here\n" + Std.string(haxe.CallStack.callStack()),{ fileName : "Screeps.hx", lineNumber : 30, className : "Screeps", methodName : "killBecauseOfLowCPU"});
	return kill;
};
Screeps.main = function() {
	var stamp1 = haxe.Timer.stamp();
	try {
		IDManager.tick();
		new Screeps().run();
	} catch( e ) {
		haxe.Log.trace(e,{ fileName : "Screeps.hx", lineNumber : 45, className : "Screeps", methodName : "main"});
		haxe.Log.trace(e.stack,{ fileName : "Screeps.hx", lineNumber : 46, className : "Screeps", methodName : "main"});
	}
	try {
		IDManager.tickEnd();
	} catch( e1 ) {
		haxe.Log.trace(e1.stack,{ fileName : "Screeps.hx", lineNumber : 55, className : "Screeps", methodName : "main"});
	}
	var stamp2 = haxe.Timer.stamp();
	var used = 0.0;
	Game.getUsedCpu(function(time) {
		used = time;
	});
	haxe.Log.trace("Total Time: " + Math.round((stamp2 - stamp1) * 1000) + " Budget: " + Game.cpuLimit + " Actual Used: " + used,{ fileName : "Screeps.hx", lineNumber : 65, className : "Screeps", methodName : "main"});
	console.log ('CPU:'+used);
};
Screeps.prototype = {
	run: function() {
		IDManager.manager.configureProfiler();
		Profiler.start("Run_manager");
		IDManager.manager.tick();
		Profiler.stop();
		Profiler.verifyStackZero();
		if(Screeps.killBecauseOfLowCPU()) return;
		Profiler.start("Run_spawn");
		if(!Screeps.disableSpawns) {
			var _g = 0;
			var _g1 = IDManager.spawns;
			while(_g < _g1.length) {
				var spawn = _g1[_g];
				++_g;
				if(spawn.linked.my) spawn.tick();
			}
		}
		Profiler.stop();
		Profiler.verifyStackZero();
		if(Screeps.killBecauseOfLowCPU()) return;
		Profiler.start("Run_defence");
		var _g2 = 0;
		var _g11 = IDManager.defences;
		while(_g2 < _g11.length) {
			var defence = _g11[_g2];
			++_g2;
			defence.tick();
		}
		Profiler.stop();
		Profiler.verifyStackZero();
		if(Screeps.killBecauseOfLowCPU()) return;
		Profiler.start("Run_energy");
		var _g3 = 0;
		var _g12 = IDManager.energy;
		while(_g3 < _g12.length) {
			var energy = _g12[_g3];
			++_g3;
			energy.tick();
		}
		Profiler.stop();
		Profiler.verifyStackZero();
		if(Screeps.killBecauseOfLowCPU()) return;
		Profiler.start("Run_construction");
		var _g4 = 0;
		var _g13 = IDManager.constructionSites;
		while(_g4 < _g13.length) {
			var site = _g13[_g4];
			++_g4;
			if(site.linked.my) site.tick();
		}
		Profiler.stop();
		Profiler.verifyStackZero();
		if(Screeps.killBecauseOfLowCPU()) return;
		Profiler.start("Run_preprocess");
		var assignment = new Assignment();
		var _g5 = 0;
		var _g14 = IDManager.creeps;
		while(_g5 < _g14.length) {
			var creep = _g14[_g5];
			++_g5;
			if(creep.linked.my) {
				creep.preprocessAssignment(assignment);
				if(Screeps.killBecauseOfLowCPU()) return;
			}
		}
		assignment.run();
		IDManager.manager.assignment = assignment;
		Profiler.stop();
		Profiler.verifyStackZero();
		if(Screeps.killBecauseOfLowCPU()) return;
		Profiler.start("Run_creeps");
		var _g6 = 0;
		var _g15 = IDManager.creeps;
		while(_g6 < _g15.length) {
			var creep1 = _g15[_g6];
			++_g6;
			if(creep1.linked.my) {
				creep1.tick();
				if(Screeps.killBecauseOfLowCPU()) return;
			}
		}
		Profiler.stop();
		Profiler.verifyStackZero();
		this.profilePathfinding();
	}
	,profilePathfinding: function() {
		return;
		var room;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		var pts = [];
		var _g = 0;
		while(_g < 10) {
			var i = _g++;
			var p1 = { x : Std.random(50), y : Std.random(50)};
			var p2 = { x : Std.random(50), y : Std.random(50)};
			pts.push({ p1 : p1, p2 : p2});
		}
		var _g1 = 0;
		while(_g1 < pts.length) {
			var pt = pts[_g1];
			++_g1;
			var p11 = pt.p1;
			var p21 = pt.p2;
			var path2 = IDManager.manager.pathfinder.findPathTo(p11,p21);
			var p1c = IDManager.manager.pathfinder.findClosestNodeDefault(p11);
			var p2c = IDManager.manager.pathfinder.findClosestNodeDefault(p21);
			var approx = IDManager.manager.pathfinder.approximateDistance(p1c,p2c);
			var realCost = IDManager.manager.pathfinder.sumCost(path2);
			haxe.Log.trace(realCost + " ≈ " + approx,{ fileName : "Screeps.hx", lineNumber : 211, className : "Screeps", methodName : "profilePathfinding"});
		}
		Profiler.start("ScreepsPath");
		var _g2 = 0;
		while(_g2 < pts.length) {
			var pt1 = pts[_g2];
			++_g2;
			var p12 = pt1.p1;
			var p22 = pt1.p2;
			var path1 = room.findPath(p12,p22,{ heuristicWeight : 1});
		}
		Profiler.stop();
		Profiler.start("AstarPath");
		var _g3 = 0;
		while(_g3 < pts.length) {
			var pt2 = pts[_g3];
			++_g3;
			var p13 = pt2.p1;
			var p23 = pt2.p2;
			var path21 = IDManager.manager.pathfinder.findPathTo(p13,p23);
		}
		Profiler.stop();
		var _g4 = 0;
		while(_g4 < pts.length) {
			var pt3 = pts[_g4];
			++_g4;
			var p14 = pt3.p1;
			var p24 = pt3.p2;
			var path11 = room.findPath(p14,p24);
			var path22 = IDManager.manager.pathfinder.findPathTo(p14,p24);
			IDManager.manager.pathfinder.displaySearched();
			room.createFlag(p14.x,p14.y,"S","cyan");
			room.createFlag(p24.x,p24.y,"T","orange");
			var j = 0;
			var _g11 = 0;
			while(_g11 < path11.length) {
				var node = path11[_g11];
				++_g11;
				room.createFlag(node.x,node.y,"a" + j,"blue");
				j++;
			}
			j = 0;
			var _g12 = 0;
			while(_g12 < path22.length) {
				var node1 = path22[_g12];
				++_g12;
				room.createFlag(node1.x,node1.y,"b" + j,"red");
				j++;
			}
			break;
		}
	}
};
var Assignment = function() {
	this.matrix = new Array();
	this.seenPos2 = [];
	this.seenPos = [];
	this.seen = [];
};
$hxClasses["Assignment"] = Assignment;
Assignment.__name__ = true;
Assignment.prototype = {
	clearMatrix: function() {
		this.seen = null;
		this.seenPos = null;
		this.seenPos2 = null;
		this.matrix = null;
		this.result = null;
	}
	,add: function(creep,x,y,score) {
		var idx1 = HxOverrides.indexOf(this.seen,creep,0);
		if(idx1 == -1) {
			idx1 = this.seen.length;
			this.seen.push(creep);
		}
		var idx2 = HxOverrides.indexOf(this.seenPos,y * 52 + x,0);
		if(idx2 == -1) {
			idx2 = this.seenPos.length;
			this.seenPos.push(y * 52 + x);
			this.seenPos2.push({ x : x, y : y});
		}
		var size = Std["int"](Math.max(this.seen.length,this.seenPos.length));
		if(this.matrix.length < size) {
			while(this.matrix.length < size) this.matrix.push([]);
			var _g1 = 0;
			var _g = this.matrix.length;
			while(_g1 < _g) {
				var i = _g1++;
				while(this.matrix[i].length < size) this.matrix[i].push(0);
			}
		}
		this.matrix[idx1][idx2] = score;
	}
	,clearAllFor: function(creep) {
		var idx1 = HxOverrides.indexOf(this.seen,creep,0);
		if(idx1 != -1) {
			var _g1 = 0;
			var _g = this.matrix[idx1].length;
			while(_g1 < _g) {
				var i = _g1++;
				this.matrix[idx1][i] = 0;
			}
		}
	}
	,getMatch: function(creep) {
		var idx1 = HxOverrides.indexOf(this.seen,creep,0);
		if(idx1 != -1) {
			var idx2 = this.result[idx1][1];
			if(idx2 < this.seenPos2.length && this.result[idx1][2] > 0) return this.seenPos2[idx2];
		}
		return null;
	}
	,run: function() {
		var mat = this.matrix;
		this.result = Hungarian.hungarianAlgortithm (mat);
	}
};
var SpawnExtender = function() { };
$hxClasses["SpawnExtender"] = SpawnExtender;
SpawnExtender.__name__ = true;
SpawnExtender.spawn = function(spawn,body,name,memory) {
	var res = spawn.createCreep(body,name,memory);
	if(typeof(res) == "string") return SpawnResult.Ok(res); else return SpawnResult.Error(res);
};
var SpawnResult = { __ename__ : true, __constructs__ : ["Error","Ok"] };
SpawnResult.Error = function(e) { var $x = ["Error",0,e]; $x.__enum__ = SpawnResult; return $x; };
SpawnResult.Ok = function(name) { var $x = ["Ok",1,name]; $x.__enum__ = SpawnResult; return $x; };
var SpawnProgress = function() { };
$hxClasses["SpawnProgress"] = SpawnProgress;
SpawnProgress.__name__ = true;
var Std = function() { };
$hxClasses["Std"] = Std;
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
Std.random = function(x) {
	if(x <= 0) return 0; else return Math.floor(Math.random() * x);
};
var Storage = function() { };
$hxClasses["Storage"] = Storage;
Storage.__name__ = true;
Storage.get_Memory = function() {
	return Memory;
};
var StringBuf = function() {
	this.b = "";
};
$hxClasses["StringBuf"] = StringBuf;
StringBuf.__name__ = true;
var _StructureType = {};
_StructureType.StructureType_Impl_ = function() { };
$hxClasses["_StructureType.StructureType_Impl_"] = _StructureType.StructureType_Impl_;
_StructureType.StructureType_Impl_.__name__ = true;
var _TerrainType = {};
_TerrainType.TerrainType_Impl_ = function() { };
$hxClasses["_TerrainType.TerrainType_Impl_"] = _TerrainType.TerrainType_Impl_;
_TerrainType.TerrainType_Impl_.__name__ = true;
var Type = function() { };
$hxClasses["Type"] = Type;
Type.__name__ = true;
Type.resolveClass = function(name) {
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
};
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw "Too many arguments";
	}
	return null;
};
var _TypeLookup = {};
_TypeLookup.TypeLookup_Impl_ = function() { };
$hxClasses["_TypeLookup.TypeLookup_Impl_"] = _TypeLookup.TypeLookup_Impl_;
_TypeLookup.TypeLookup_Impl_.__name__ = true;
var Utils = function() { };
$hxClasses["Utils"] = Utils;
Utils.__name__ = true;
Utils.log = function(message) {
	if(Game.notify != null) Game.notify(message); else haxe.Log.trace(message,{ fileName : "Utils.hx", lineNumber : 8, className : "Utils", methodName : "log"});
};
Utils.logOnCriticalError = function(v) {
	if(v != 0 && v != -11 && v != -12 && v != -6 && v != -9 && v != -8) Utils.log(v == null?"null":"" + v);
};
Utils.assertCommand = function(v) {
	if(v != 0) Utils.log(v == null?"null":"" + v);
};
var WorkerPath = function() {
	this.assigned = new Array();
	Base.call(this);
};
$hxClasses["WorkerPath"] = WorkerPath;
WorkerPath.__name__ = true;
WorkerPath.__super__ = Base;
WorkerPath.prototype = $extend(Base.prototype,{
	isStandalone: function() {
		return true;
	}
	,configure: function(info) {
		this.initialize();
		this.path = info.path;
		this.roots = info.roots;
		return this;
	}
	,clean: function() {
		if(this.assigned == null) this.assigned = [];
		var _g1 = 0;
		var _g = this.assigned.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.assigned[i] == null || this.assigned[i].currentPath != this) {
				this.assigned.splice(i,1);
				break;
			}
		}
	}
	,nearbyEnergy: function() {
		this.clean();
		var room;
		var this1;
		{
			var res = null;
			var $it0 = $iterator(_DynamicObject.DynamicObject_Impl_)(Game.rooms);
			while( $it0.hasNext() ) {
				var room1 = $it0.next();
				res = room1;
			}
			this1 = res;
		}
		if(this1 == null) throw "Extracting null Maybe";
		room = this1;
		var sum = 0;
		var _g = 0;
		var _g1 = room.find(6);
		while(_g < _g1.length) {
			var ent = _g1[_g];
			++_g;
			var _g2 = 0;
			var _g3 = this.roots;
			while(_g2 < _g3.length) {
				var root = _g3[_g2];
				++_g2;
				if(ent.pos.isNearTo(root.x,root.y)) {
					var energy = ent;
					sum += energy.energy;
				}
			}
		}
		return sum / (Math.pow(this.assigned.length + 1,1.5) * this.path.length);
	}
	,nodeIndex: function(pos) {
		var _g1 = 0;
		var _g = this.path.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.path[i].x == pos.x && this.path[i].y == pos.y) return i;
		}
		return -1;
	}
	,next: function(pos,towardsEnd) {
		var _g1 = 0;
		var _g = this.path.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.path[i].x == pos.x && this.path[i].y == pos.y) {
				var nid;
				nid = i + (towardsEnd?1:-1);
				if(nid < 0 || nid >= this.path.length) return null;
				return this.path[nid];
			}
		}
		var best = this.path[0];
		var bestDist = 1000000;
		var _g11 = 0;
		var _g2 = this.path.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			var dist = (this.path[i1].x - pos.x) * (this.path[i1].x - pos.x) + (this.path[i1].y - pos.y) * (this.path[i1].y - pos.y);
			if(dist < bestDist) {
				best = this.path[i1];
				bestDist = dist;
			}
		}
		return best;
	}
	,internalInitialize: function() {
		this.type = "WorkerPath";
	}
});
var haxe = {};
haxe.StackItem = { __ename__ : true, __constructs__ : ["CFunction","Module","FilePos","Method","LocalFunction"] };
haxe.StackItem.CFunction = ["CFunction",0];
haxe.StackItem.CFunction.__enum__ = haxe.StackItem;
haxe.StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe.StackItem; return $x; };
haxe.StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe.StackItem; return $x; };
haxe.StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe.StackItem; return $x; };
haxe.StackItem.LocalFunction = function(v) { var $x = ["LocalFunction",4,v]; $x.__enum__ = haxe.StackItem; return $x; };
haxe.CallStack = function() { };
$hxClasses["haxe.CallStack"] = haxe.CallStack;
haxe.CallStack.__name__ = true;
haxe.CallStack.callStack = function() {
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe.StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe.StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe.CallStack.makeStack(new Error().stack);
	a.shift();
	Error.prepareStackTrace = oldValue;
	return a;
};
haxe.CallStack.toString = function(stack) {
	var b = new StringBuf();
	var _g = 0;
	while(_g < stack.length) {
		var s = stack[_g];
		++_g;
		b.b += "\nCalled from ";
		haxe.CallStack.itemToString(b,s);
	}
	return b.b;
};
haxe.CallStack.itemToString = function(b,s) {
	switch(s[1]) {
	case 0:
		b.b += "a C function";
		break;
	case 1:
		var m = s[2];
		b.b += "module ";
		if(m == null) b.b += "null"; else b.b += "" + m;
		break;
	case 2:
		var line = s[4];
		var file = s[3];
		var s1 = s[2];
		if(s1 != null) {
			haxe.CallStack.itemToString(b,s1);
			b.b += " (";
		}
		if(file == null) b.b += "null"; else b.b += "" + file;
		b.b += " line ";
		if(line == null) b.b += "null"; else b.b += "" + line;
		if(s1 != null) b.b += ")";
		break;
	case 3:
		var meth = s[3];
		var cname = s[2];
		if(cname == null) b.b += "null"; else b.b += "" + cname;
		b.b += ".";
		if(meth == null) b.b += "null"; else b.b += "" + meth;
		break;
	case 4:
		var n = s[2];
		b.b += "local function #";
		if(n == null) b.b += "null"; else b.b += "" + n;
		break;
	}
};
haxe.CallStack.makeStack = function(s) {
	if(typeof(s) == "string") {
		var stack = s.split("\n");
		var m = [];
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			m.push(haxe.StackItem.Module(line));
		}
		return m;
	} else return s;
};
haxe.Log = function() { };
$hxClasses["haxe.Log"] = haxe.Log;
haxe.Log.__name__ = true;
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
};
haxe.Timer = function() { };
$hxClasses["haxe.Timer"] = haxe.Timer;
haxe.Timer.__name__ = true;
haxe.Timer.measure = function(f,pos) {
	var t0 = haxe.Timer.stamp();
	var r = f();
	haxe.Log.trace(haxe.Timer.stamp() - t0 + "s",pos);
	return r;
};
haxe.Timer.stamp = function() {
	return new Date().getTime() / 1000;
};
haxe.ds = {};
haxe.ds.IntMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.IntMap"] = haxe.ds.IntMap;
haxe.ds.IntMap.__name__ = true;
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key);
	}
};
haxe.ds.ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
$hxClasses["haxe.ds.ObjectMap"] = haxe.ds.ObjectMap;
haxe.ds.ObjectMap.__name__ = true;
haxe.ds.ObjectMap.__interfaces__ = [IMap];
haxe.ds.ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe.ds.ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
};
haxe.ds.Option = { __ename__ : true, __constructs__ : ["Some","None"] };
haxe.ds.Option.Some = function(v) { var $x = ["Some",0,v]; $x.__enum__ = haxe.ds.Option; return $x; };
haxe.ds.Option.None = ["None",1];
haxe.ds.Option.None.__enum__ = haxe.ds.Option;
haxe.ds.StringMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.StringMap"] = haxe.ds.StringMap;
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
var hxmath = {};
hxmath.math = {};
hxmath.math.IntVector2Default = function(x,y) {
	this.x = x;
	this.y = y;
};
$hxClasses["hxmath.math.IntVector2Default"] = hxmath.math.IntVector2Default;
hxmath.math.IntVector2Default.__name__ = true;
hxmath.math._IntVector2 = {};
hxmath.math._IntVector2.IntVector2_Impl_ = function() { };
$hxClasses["hxmath.math._IntVector2.IntVector2_Impl_"] = hxmath.math._IntVector2.IntVector2_Impl_;
hxmath.math._IntVector2.IntVector2_Impl_.__name__ = true;
hxmath.math._IntVector2.IntVector2_Impl_._new = function(x,y) {
	return new hxmath.math.IntVector2Default(x,y);
};
hxmath.math._IntVector2.IntVector2_Impl_.toVector2 = function(this1) {
	var self = this1;
	return new hxmath.math.Vector2Default(self.x,self.y);
};
hxmath.math._IntVector2.IntVector2_Impl_.get_zero = function() {
	return hxmath.math._IntVector2.IntVector2_Impl_._new(0,0);
};
hxmath.math.Orient2DResult = { __ename__ : true, __constructs__ : ["Left","Colinear","Right"] };
hxmath.math.Orient2DResult.Left = ["Left",0];
hxmath.math.Orient2DResult.Left.__enum__ = hxmath.math.Orient2DResult;
hxmath.math.Orient2DResult.Colinear = ["Colinear",1];
hxmath.math.Orient2DResult.Colinear.__enum__ = hxmath.math.Orient2DResult;
hxmath.math.Orient2DResult.Right = ["Right",2];
hxmath.math.Orient2DResult.Right.__enum__ = hxmath.math.Orient2DResult;
hxmath.math.MathUtil = function() { };
$hxClasses["hxmath.math.MathUtil"] = hxmath.math.MathUtil;
hxmath.math.MathUtil.__name__ = true;
hxmath.math.MathUtil.lerpCyclic = function(a,b,t,max) {
	if(Math.abs(a - b) > 0.5 * max) {
		if(a < b) a += max; else b += max;
	}
	return (((1.0 - t) * a + t * b) % max + max) % max;
};
hxmath.math.MathUtil.sign = function(x,w) {
	if(w == null) w = 0;
	if(Math.abs(x) < w) return 0; else if(x <= -w) return -1; else return 1;
};
hxmath.math.MathUtil.rangeDistance = function(aStart,aWidth,bStart,bWidth) {
	if(aStart + aWidth < bStart) return bStart - (aStart + aWidth); else if(bStart + bWidth < aStart) return aStart - (bStart + bWidth); else return 0;
};
hxmath.math.MathUtil.openRangeContains = function(aStart,aWidth,x) {
	return x > aStart && x < aStart + aWidth;
};
hxmath.math.MathUtil.openRangesIntersect = function(aStart,aWidth,bStart,bWidth) {
	return !(aStart >= bStart + bWidth || bStart >= aStart + aWidth);
};
hxmath.math.MathUtil.closedRangeContains = function(aStart,aWidth,x) {
	return x >= aStart && x <= aStart + aWidth;
};
hxmath.math.MathUtil.radToDeg = function(rad) {
	return 180 / Math.PI * rad;
};
hxmath.math.MathUtil.degToRad = function(deg) {
	return Math.PI / 180 * deg;
};
hxmath.math.MathUtil.wrap = function(x,n) {
	return (x % n + n) % n;
};
hxmath.math.MathUtil.clamp = function(value,min,max) {
	if(value < min) return min; else if(value > max) return max; else return value;
};
hxmath.math.MathUtil.orient2d = function(a,b,c) {
	var result = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
	if(result > 0) return hxmath.math.Orient2DResult.Left; else if(result < 0) return hxmath.math.Orient2DResult.Right; else return hxmath.math.Orient2DResult.Colinear;
};
hxmath.math.MathUtil.det2x2 = function(m00,m10,m01,m11) {
	return m00 * m11 - m10 * m01;
};
hxmath.math.MathUtil.det3x3 = function(m00,m10,m20,m01,m11,m21,m02,m12,m22) {
	return m00 * (m11 * m22 - m21 * m12) - m10 * (m01 * m22 - m21 * m02) + m20 * (m01 * m12 - m11 * m02);
};
hxmath.math.MathUtil.det4x4 = function(m00,m10,m20,m30,m01,m11,m21,m31,m02,m12,m22,m32,m03,m13,m23,m33) {
	return m00 * (m11 * (m22 * m33 - m32 * m23) - m21 * (m12 * m33 - m32 * m13) + m31 * (m12 * m23 - m22 * m13)) - m10 * (m01 * (m22 * m33 - m32 * m23) - m21 * (m02 * m33 - m32 * m03) + m31 * (m02 * m23 - m22 * m03)) + m20 * (m01 * (m12 * m33 - m32 * m13) - m11 * (m02 * m33 - m32 * m03) + m31 * (m02 * m13 - m12 * m03)) - m30 * (m01 * (m12 * m23 - m22 * m13) - m11 * (m02 * m23 - m22 * m03) + m21 * (m02 * m13 - m12 * m03));
};
hxmath.math.Vector2Default = function(x,y) {
	this.x = x;
	this.y = y;
};
$hxClasses["hxmath.math.Vector2Default"] = hxmath.math.Vector2Default;
hxmath.math.Vector2Default.__name__ = true;
hxmath.math._Vector2 = {};
hxmath.math._Vector2.Vector2_Impl_ = function() { };
$hxClasses["hxmath.math._Vector2.Vector2_Impl_"] = hxmath.math._Vector2.Vector2_Impl_;
hxmath.math._Vector2.Vector2_Impl_.__name__ = true;
hxmath.math._Vector2.Vector2_Impl_._new = function(x,y) {
	return new hxmath.math.Vector2Default(x,y);
};
hxmath.math._Vector2.Vector2_Impl_.fromArray = function(rawData) {
	if(rawData.length != 2) throw "Invalid rawData.";
	return new hxmath.math.Vector2Default(rawData[0],rawData[1]);
};
hxmath.math._Vector2.Vector2_Impl_.fromPolar = function(angle,radius) {
	var x = radius * Math.cos(angle);
	var y = radius * Math.sin(angle);
	return new hxmath.math.Vector2Default(x,y);
};
hxmath.math._Vector2.Vector2_Impl_.fromVector2Shape = function(other) {
	return new hxmath.math.Vector2Default(other.x,other.y);
};
hxmath.math._Vector2.Vector2_Impl_.toIntVector2 = function(this1,func) {
	var self = this1;
	if(func == null) func = Std["int"];
	return hxmath.math._IntVector2.IntVector2_Impl_._new(func(self.x),func(self.y));
};
hxmath.math._Vector2.Vector2_Impl_.dot = function(a,b) {
	return a.x * b.x + a.y * b.y;
};
hxmath.math._Vector2.Vector2_Impl_.multiply = function(a,s) {
	var this1;
	var self = a;
	this1 = new hxmath.math.Vector2Default(self.x,self.y);
	var self1 = this1;
	self1.x *= s;
	self1.y *= s;
	return self1;
};
hxmath.math._Vector2.Vector2_Impl_.divide = function(a,s) {
	var this1;
	var self = a;
	this1 = new hxmath.math.Vector2Default(self.x,self.y);
	var self1 = this1;
	self1.x /= s;
	self1.y /= s;
	return self1;
};
hxmath.math._Vector2.Vector2_Impl_.add = function(a,b) {
	var this1;
	var self = a;
	this1 = new hxmath.math.Vector2Default(self.x,self.y);
	var self1 = this1;
	self1.x += b.x;
	self1.y += b.y;
	return self1;
};
hxmath.math._Vector2.Vector2_Impl_.subtract = function(a,b) {
	var this1;
	var self = a;
	this1 = new hxmath.math.Vector2Default(self.x,self.y);
	var self1 = this1;
	self1.x -= b.x;
	self1.y -= b.y;
	return self1;
};
hxmath.math._Vector2.Vector2_Impl_.negate = function(a) {
	return new hxmath.math.Vector2Default(-a.x,-a.y);
};
hxmath.math._Vector2.Vector2_Impl_.equals = function(a,b) {
	return a == null && b == null || !(a == null) && !(b == null) && a.x == b.x && a.y == b.y;
};
hxmath.math._Vector2.Vector2_Impl_.notEquals = function(a,b) {
	return !(a == b);
};
hxmath.math._Vector2.Vector2_Impl_.lerp = function(a,b,t) {
	var a1;
	var s = 1.0 - t;
	var this1;
	var self = a;
	this1 = new hxmath.math.Vector2Default(self.x,self.y);
	var self1 = this1;
	self1.x *= s;
	self1.y *= s;
	a1 = self1;
	var b1;
	var this2;
	var self2 = b;
	this2 = new hxmath.math.Vector2Default(self2.x,self2.y);
	var self3 = this2;
	self3.x *= t;
	self3.y *= t;
	b1 = self3;
	var this3;
	var self4 = a1;
	this3 = new hxmath.math.Vector2Default(self4.x,self4.y);
	var self5 = this3;
	self5.x += b1.x;
	self5.y += b1.y;
	return self5;
};
hxmath.math._Vector2.Vector2_Impl_.multiplyWith = function(this1,s) {
	var self = this1;
	self.x *= s;
	self.y *= s;
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.divideWith = function(this1,s) {
	var self = this1;
	self.x /= s;
	self.y /= s;
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.addWith = function(this1,a) {
	var self = this1;
	self.x += a.x;
	self.y += a.y;
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.subtractWith = function(this1,a) {
	var self = this1;
	self.x -= a.x;
	self.y -= a.y;
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.copyTo = function(this1,other) {
	var self = this1;
	var _g = 0;
	while(_g < 2) {
		var i = _g++;
		var value;
		var self1 = self;
		switch(i) {
		case 0:
			value = self1.x;
			break;
		case 1:
			value = self1.y;
			break;
		default:
			throw "Invalid element";
		}
		var self2 = other;
		switch(i) {
		case 0:
			self2.x = value;
			break;
		case 1:
			self2.y = value;
			break;
		default:
			throw "Invalid element";
		}
	}
};
hxmath.math._Vector2.Vector2_Impl_.clone = function(this1) {
	var self = this1;
	return new hxmath.math.Vector2Default(self.x,self.y);
};
hxmath.math._Vector2.Vector2_Impl_.getArrayElement = function(this1,i) {
	var self = this1;
	switch(i) {
	case 0:
		return self.x;
	case 1:
		return self.y;
	default:
		throw "Invalid element";
	}
};
hxmath.math._Vector2.Vector2_Impl_.setArrayElement = function(this1,i,value) {
	var self = this1;
	switch(i) {
	case 0:
		return self.x = value;
	case 1:
		return self.y = value;
	default:
		throw "Invalid element";
	}
};
hxmath.math._Vector2.Vector2_Impl_.applyNegate = function(this1) {
	var self = this1;
	self.x = -self.x;
	self.y = -self.y;
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.applyScalarFunc = function(this1,func) {
	var self = this1;
	var _g = 0;
	while(_g < 2) {
		var i = _g++;
		var value = func((function($this) {
			var $r;
			var self1 = self;
			$r = (function($this) {
				var $r;
				switch(i) {
				case 0:
					$r = self1.x;
					break;
				case 1:
					$r = self1.y;
					break;
				default:
					$r = (function($this) {
						var $r;
						throw "Invalid element";
						return $r;
					}($this));
				}
				return $r;
			}($this));
			return $r;
		}(this)));
		var self2 = self;
		switch(i) {
		case 0:
			self2.x = value;
			break;
		case 1:
			self2.y = value;
			break;
		default:
			throw "Invalid element";
		}
	}
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.angleWith = function(this1,b) {
	var self = this1;
	return Math.acos((self.x * b.x + self.y * b.y) / ((function($this) {
		var $r;
		var self1 = self;
		$r = Math.sqrt(self1.x * self1.x + self1.y * self1.y);
		return $r;
	}(this)) * (function($this) {
		var $r;
		var self2 = b;
		$r = Math.sqrt(self2.x * self2.x + self2.y * self2.y);
		return $r;
	}(this))));
};
hxmath.math._Vector2.Vector2_Impl_.signedAngleWith = function(this1,b) {
	var self = this1;
	return hxmath.math.MathUtil.sign(self.x * b.y - b.x * self.y,null) * (function($this) {
		var $r;
		var self1 = self;
		$r = Math.acos((self1.x * b.x + self1.y * b.y) / ((function($this) {
			var $r;
			var self2 = self1;
			$r = Math.sqrt(self2.x * self2.x + self2.y * self2.y);
			return $r;
		}($this)) * (function($this) {
			var $r;
			var self3 = b;
			$r = Math.sqrt(self3.x * self3.x + self3.y * self3.y);
			return $r;
		}($this))));
		return $r;
	}(this));
};
hxmath.math._Vector2.Vector2_Impl_.normalize = function(this1) {
	var self = this1;
	var length;
	var self1 = self;
	length = Math.sqrt(self1.x * self1.x + self1.y * self1.y);
	if(length > 0.0) {
		var self2 = self;
		self2.x /= length;
		self2.y /= length;
		self2;
	}
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.normalizeTo = function(this1,newLength) {
	var self = this1;
	var self1 = self;
	var length;
	var self2 = self1;
	length = Math.sqrt(self2.x * self2.x + self2.y * self2.y);
	if(length > 0.0) {
		var self3 = self1;
		self3.x /= length;
		self3.y /= length;
		self3;
	}
	self1;
	var self4 = self;
	self4.x *= newLength;
	self4.y *= newLength;
	self4;
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.clamp = function(this1,min,max) {
	var self = this1;
	var length;
	var self1 = self;
	length = Math.sqrt(self1.x * self1.x + self1.y * self1.y);
	if(length < min) {
		var self2 = self;
		var self3 = self2;
		var length1;
		var self4 = self3;
		length1 = Math.sqrt(self4.x * self4.x + self4.y * self4.y);
		if(length1 > 0.0) {
			var self5 = self3;
			self5.x /= length1;
			self5.y /= length1;
			self5;
		}
		self3;
		var self6 = self2;
		self6.x *= min;
		self6.y *= min;
		self6;
		self2;
	} else if(length > max) {
		var self7 = self;
		var self8 = self7;
		var length2;
		var self9 = self8;
		length2 = Math.sqrt(self9.x * self9.x + self9.y * self9.y);
		if(length2 > 0.0) {
			var self10 = self8;
			self10.x /= length2;
			self10.y /= length2;
			self10;
		}
		self8;
		var self11 = self7;
		self11.x *= max;
		self11.y *= max;
		self11;
		self7;
	}
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.rotate = function(this1,angle,pivot) {
	var self = this1;
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	var dx = self.x - pivot.x;
	var dy = self.y - pivot.y;
	self.x = dx * Math.cos(angle) - dy * Math.sin(angle);
	self.y = dx * Math.sin(angle) + dy * Math.cos(angle);
	return self;
};
hxmath.math._Vector2.Vector2_Impl_.get_zero = function() {
	return new hxmath.math.Vector2Default(0.0,0.0);
};
hxmath.math._Vector2.Vector2_Impl_.get_xAxis = function() {
	return new hxmath.math.Vector2Default(1.0,0.0);
};
hxmath.math._Vector2.Vector2_Impl_.get_yAxis = function() {
	return new hxmath.math.Vector2Default(0.0,1.0);
};
hxmath.math._Vector2.Vector2_Impl_.get_length = function(this1) {
	var self = this1;
	return Math.sqrt(self.x * self.x + self.y * self.y);
};
hxmath.math._Vector2.Vector2_Impl_.get_lengthSq = function(this1) {
	var self = this1;
	return self.x * self.x + self.y * self.y;
};
hxmath.math._Vector2.Vector2_Impl_.get_angle = function(this1) {
	var self = this1;
	return Math.atan2(self.y,self.x);
};
hxmath.math._Vector2.Vector2_Impl_.get_normal = function(this1) {
	var self = this1;
	var this2;
	var self1 = self;
	this2 = new hxmath.math.Vector2Default(self1.x,self1.y);
	var self2 = this2;
	var length;
	var self3 = self2;
	length = Math.sqrt(self3.x * self3.x + self3.y * self3.y);
	if(length > 0.0) {
		var self4 = self2;
		self4.x /= length;
		self4.y /= length;
		self4;
	}
	return self2;
};
hxmath.math._Vector2.Vector2_Impl_.get_leftRot = function(this1) {
	var self = this1;
	return new hxmath.math.Vector2Default(-self.y,self.x);
};
hxmath.math._Vector2.Vector2_Impl_.get_rightRot = function(this1) {
	var self = this1;
	return new hxmath.math.Vector2Default(self.y,-self.x);
};
var js = {};
js.Boot = function() { };
$hxClasses["js.Boot"] = js.Boot;
js.Boot.__name__ = true;
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
};
js.Boot.__trace = function(v,i) {
	var msg;
	if(i != null) msg = i.fileName + ":" + i.lineNumber + ": "; else msg = "";
	msg += js.Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0;
		var _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js.Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof console != "undefined" && console.log != null) console.log(msg);
};
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
var maybe = {};
maybe._Maybe = {};
maybe._Maybe.Maybe_Impl_ = function() { };
$hxClasses["maybe._Maybe.Maybe_Impl_"] = maybe._Maybe.Maybe_Impl_;
maybe._Maybe.Maybe_Impl_.__name__ = true;
maybe._Maybe.Maybe_Impl_._new = function(i) {
	return i;
};
maybe._Maybe.Maybe_Impl_.or = function(this1,defaultValue) {
	if(this1 != null) return this1; else return defaultValue;
};
maybe._Maybe.Maybe_Impl_.isNone = function(this1) {
	return this1 == null;
};
maybe._Maybe.Maybe_Impl_.extract = function(this1) {
	if(this1 == null) throw "Extracting null Maybe";
	return this1;
};
maybe._Maybe.Maybe_Impl_.option = function(this1) {
	if(this1 != null) return haxe.ds.Option.Some(this1); else return haxe.ds.Option.None;
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
$hxClasses.Math = Math;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.__name__ = true;
$hxClasses.Array = Array;
Array.__name__ = true;
Date.__name__ = ["Date"];
var Dynamic = $hxClasses.Dynamic = { __name__ : ["Dynamic"]};
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
AICollectorPoints.idx = 0;
AICollectorPoints.startTime = 0.0;
AICollectorPoints.dx = [1,1,0,-1,-1,-1,0,1];
AICollectorPoints.dy = [0,1,1,1,0,-1,-1,-1];
AICollectorPoints.dxq = [1,0,-1,0];
AICollectorPoints.dyq = [0,1,0,-1];
AICreep.dx = [1,1,0,-1,-1,-1,0,1];
AICreep.dy = [0,1,1,1,0,-1,-1,-1];
AICreep.near1x = [0,1,1,0,-1,-1,-1,0,1];
AICreep.near1y = [0,0,1,1,1,0,-1,-1,-1];
AICreep.RangedMassAttackDamage = [10,10,4,1];
AICreep.RangedAttackDamage = 10;
AICreep.MeleeAttackDamage = 30;
_AIManager.Role_Impl_.Harvester = 0;
_AIManager.Role_Impl_.MeleeAttacker = 1;
_AIManager.Role_Impl_.RangedAttacker = 2;
_AIManager.Role_Impl_.EnergyCarrier = 3;
_AIManager.Role_Impl_.Healer = 4;
_AIManager.Role_Impl_.Builder = 5;
_AIManager.Role_Impl_.MeleeWall = 6;
AIMap.MapSize = 52;
AIMap.dx = [1,1,0,-1,-1,-1,0,1];
AIMap.dy = [0,1,1,1,0,-1,-1,-1];
AIMap.RangedMassAttackDamage = [10,10,4,1];
AIMap.RangedAttackDamageAverage = [10,10,6,4];
AIMap.MeleeAttackDamage = 20;
AIPathfinder.queue = new PriorityQueue_State();
AIPathfinder.DIRS = 8;
AIPathfinder.dx = [1,0,-1,0,1,1,-1,-1];
AIPathfinder.dy = [0,1,0,-1,-1,1,1,-1];
AIPathfinder.near1x = [0,1,1,0,-1,-1,-1,0,1];
AIPathfinder.near1y = [0,0,1,1,1,0,-1,-1,-1];
AIRoadConstructionManager.near1x = [0,1,1,0,-1,-1,-1,0,1];
AIRoadConstructionManager.near1y = [0,0,1,1,1,0,-1,-1,-1];
AISpawn.roleTypes = [[{ type : AICreep, role : 0, body : ["move","work","work","work","work"], category : Category.Economy, advancedThreshold : 0, amountProportion : 1.1},{ type : AICreep, role : 0, body : ["move","work","work","work","work","work","work"], category : Category.Economy, advancedThreshold : 300, amountProportion : 1.1}],[{ type : CreepEnergyCarrier, role : 3, body : ["carry","move","carry"], category : Category.Economy, advancedThreshold : 0, amountProportion : 0.8},{ type : CreepEnergyCarrier, role : 3, body : ["move","carry","move","carry"], category : Category.Economy, advancedThreshold : 100, amountProportion : 0.8},{ type : CreepEnergyCarrier, role : 3, body : ["move","carry","carry","move","carry"], category : Category.Economy, advancedThreshold : 200, amountProportion : 0.8},{ type : CreepEnergyCarrier, role : 3, body : ["move","carry","carry","move","move","carry"], category : Category.Economy, advancedThreshold : 300, amountProportion : 0.8}],[{ type : AICreep, role : 1, body : ["tough","tough","tough","tough","tough","tough","move","move","move","attack","attack"], category : Category.Military, advancedThreshold : 0, amountProportion : 1.2},{ type : AICreep, role : 1, body : ["tough","move","attack","move","attack","attack","attack"], category : Category.Military, advancedThreshold : 300, amountProportion : 0.2},{ type : AICreep, role : 1, body : ["tough","move","attack","attack","attack","move","move","attack"], category : Category.Military, advancedThreshold : 300, amountProportion : 1.2}],[{ type : AICreep, role : 2, body : ["ranged_attack","ranged_attack","move","ranged_attack","move"], category : Category.Military, advancedThreshold : 0, amountProportion : 2.4},{ type : AICreep, role : 2, body : ["tough","move","move","ranged_attack","ranged_attack","move","ranged_attack"], category : Category.Military, advancedThreshold : 300, amountProportion : 2.4},{ type : AICreep, role : 2, body : ["tough","move","move","ranged_attack","ranged_attack","move","ranged_attack","ranged_attack"], category : Category.Military, advancedThreshold : 300, amountProportion : 2.4}],[{ type : Healer, role : 4, body : ["move","move","heal","heal"], category : Category.Military, advancedThreshold : 0, amountProportion : 0.6},{ type : Healer, role : 4, body : ["move","move","heal","move","heal"], category : Category.Military, advancedThreshold : 200, amountProportion : 0.6},{ type : Healer, role : 4, body : ["move","heal","move","move","heal","heal"], category : Category.Military, advancedThreshold : 400, amountProportion : 0.6},{ type : Healer, role : 4, body : ["move","heal","move","move","move","heal","heal"], category : Category.Military, advancedThreshold : 400, amountProportion : 0.6}],[{ type : AICreep, role : 5, body : ["move","work","work","carry","carry"], category : Category.Economy, advancedThreshold : 100, amountProportion : 0.2},{ type : AICreep, role : 5, body : ["move","work","carry","move","work","carry"], category : Category.Economy, advancedThreshold : 0, amountProportion : 0.2},{ type : AICreep, role : 5, body : ["move","work","carry","work","move","work","carry"], category : Category.Economy, advancedThreshold : 0, amountProportion : 0.2},{ type : AICreep, role : 5, body : ["move","work","carry","move","work","move","work","carry"], category : Category.Economy, advancedThreshold : 0, amountProportion : 0.2}]];
AIStatistics.NoExtensionsLimit = 5;
AIStatistics.ExtensionsCost = 200;
_BodyPart.BodyPart_Impl_.Move = "move";
_BodyPart.BodyPart_Impl_.Work = "work";
_BodyPart.BodyPart_Impl_.Carry = "carry";
_BodyPart.BodyPart_Impl_.Attack = "attack";
_BodyPart.BodyPart_Impl_.RangedAttack = "ranged_attack";
_BodyPart.BodyPart_Impl_.Heal = "heal";
_BodyPart.BodyPart_Impl_.Tough = "tough";
_Color.Color_Impl_.Red = "red";
_Color.Color_Impl_.Purple = "purple";
_Color.Color_Impl_.Blue = "blue";
_Color.Color_Impl_.Cyan = "cyan";
_Color.Color_Impl_.Green = "green";
_Color.Color_Impl_.Yellow = "yellow";
_Color.Color_Impl_.Orange = "orange";
_Color.Color_Impl_.Brown = "brown";
_Color.Color_Impl_.Grey = "grey";
_Color.Color_Impl_.White = "white";
_CreepEnergyCarrier.ReturningEnum_Impl_.Returning = 0;
_CreepEnergyCarrier.ReturningEnum_Impl_.AutoReturning = 1;
_CreepEnergyCarrier.ReturningEnum_Impl_.Collecting = 2;
_CreepEnergyCarrier.ReturningEnum_Impl_.AutoCollecting = 3;
_Direction.Direction_Impl_.Top = 1;
_Direction.Direction_Impl_.TopRight = 2;
_Direction.Direction_Impl_.Right = 3;
_Direction.Direction_Impl_.BottomRight = 4;
_Direction.Direction_Impl_.Bottom = 5;
_Direction.Direction_Impl_.BottomLeft = 6;
_Direction.Direction_Impl_.Left = 7;
_Direction.Direction_Impl_.TopLeft = 8;
_EntityType.EntityType_Impl_.Creeps = 1;
_EntityType.EntityType_Impl_.MyCreeps = 2;
_EntityType.EntityType_Impl_.HostileCreeps = 3;
_EntityType.EntityType_Impl_.MySpawns = 12;
_EntityType.EntityType_Impl_.HostileSpawns = 13;
_EntityType.EntityType_Impl_.Sources = 5;
_EntityType.EntityType_Impl_.SourcesActive = 4;
_EntityType.EntityType_Impl_.DroppedEnergy = 6;
_EntityType.EntityType_Impl_.Structures = 7;
_EntityType.EntityType_Impl_.MyStructures = 8;
_EntityType.EntityType_Impl_.HostileStructures = 9;
_EntityType.EntityType_Impl_.Flags = 10;
_EntityType.EntityType_Impl_.ConstructionSites = 11;
_EntityType.EntityType_Impl_.ExitTop = 14;
_EntityType.EntityType_Impl_.ExitRight = 15;
_EntityType.EntityType_Impl_.ExitBottom = 16;
_EntityType.EntityType_Impl_.ExitLeft = 17;
_FindType.FindType_Impl_.Creep = "creep";
_FindType.FindType_Impl_.Terrain = "terrain";
_FindType.FindType_Impl_.Spawn = "spawn";
_FindType.FindType_Impl_.Source = "source";
_FindType.FindType_Impl_.Exit = "exit";
IDManager.scId2objs = new haxe.ds.StringMap();
IDManager.id2objs = new haxe.ds.IntMap();
IDManager.creeps = new Array();
IDManager.spawns = new Array();
IDManager.defences = new Array();
IDManager.sources = new Array();
IDManager.energy = new Array();
IDManager.constructionSites = new Array();
IDManager.structures = new Array();
IDManager.timeSinceStart = 0;
_PathfindingAlgorithm.PathfindingAlgorithm_Impl_.Dijkstra = "dijkstra";
_PathfindingAlgorithm.PathfindingAlgorithm_Impl_.Astar = "astar";
_Results.AttackResult_Impl_.Ok = 0;
_Results.AttackResult_Impl_.NotOwner = -1;
_Results.AttackResult_Impl_.Busy = -4;
_Results.AttackResult_Impl_.InvalidTarget = -7;
_Results.AttackResult_Impl_.NotInRange = -9;
_Results.AttackResult_Impl_.NoBodyPart = -12;
_Results.MassAttackResult_Impl_.Ok = 0;
_Results.MassAttackResult_Impl_.NotOwner = -1;
_Results.MassAttackResult_Impl_.Busy = -4;
_Results.MassAttackResult_Impl_.NoBodyPart = -12;
_Results.MoveResult_Impl_.Ok = 0;
_Results.MoveResult_Impl_.NotOwner = -1;
_Results.MoveResult_Impl_.Busy = -4;
_Results.MoveResult_Impl_.Tired = -11;
_Results.MoveResult_Impl_.NoBodyPart = -12;
_Results.CreateFlagResult_Impl_.Ok = 0;
_Results.CreateFlagResult_Impl_.NameExists = -3;
_Results.CreateFlagResult_Impl_.InvalidArgs = -10;
_Results.SayResult_Impl_.Ok = 0;
_Results.SayResult_Impl_.NotOwner = -1;
_Results.SayResult_Impl_.Busy = -4;
_Results.SayResult_Impl_.InvalidArgs = -10;
_Results.CreateConstructionSiteResult_Impl_.Ok = 0;
_Results.CreateConstructionSiteResult_Impl_.InvalidTarget = -7;
_Results.CreateConstructionSiteResult_Impl_.InvalidArgs = -10;
_Results.PathResult_Impl_.Ok = 0;
_Results.PathResult_Impl_.NotOwner = -1;
_Results.PathResult_Impl_.Busy = -4;
_Results.PathResult_Impl_.Tired = -11;
_Results.PathResult_Impl_.NoBodyPart = -12;
_Results.PathResult_Impl_.InvalidTarget = -7;
_Results.PathResult_Impl_.NoPath = -2;
_Results.ActionResult_Impl_.Ok = 0;
_Results.ActionResult_Impl_.NotOwner = -1;
_Results.ActionResult_Impl_.Busy = -4;
_Results.ActionResult_Impl_.InvalidTarget = -7;
_Results.ActionResult_Impl_.NotInRange = -9;
_Results.ActionResult_Impl_.NoBodyPart = -12;
_Results.SpawnError_Impl_.NotOwner = -1;
_Results.SpawnError_Impl_.NameExists = -3;
_Results.SpawnError_Impl_.Busy = -4;
_Results.SpawnError_Impl_.NotEnoughEnergy = -6;
_Results.SpawnError_Impl_.InvalidArgs = -10;
_Results.SpawnError_Impl_.NotEnoughExtensions = -13;
_Results.EnergyActionResult_Impl_.Ok = 0;
_Results.EnergyActionResult_Impl_.NotOwner = -1;
_Results.EnergyActionResult_Impl_.Busy = -4;
_Results.EnergyActionResult_Impl_.NotEnoughEnergy = -6;
_Results.EnergyActionResult_Impl_.InvalidTarget = -7;
_Results.EnergyActionResult_Impl_.NotInRange = -9;
_Results.EnergyActionResult_Impl_.NoBodyPart = -12;
_Results.PickupResult_Impl_.Ok = 0;
_Results.PickupResult_Impl_.NotOwner = -1;
_Results.PickupResult_Impl_.Busy = -4;
_Results.PickupResult_Impl_.InvalidTarget = -7;
_Results.PickupResult_Impl_.Full = -8;
_Results.PickupResult_Impl_.NotInRange = -9;
_Results.PickupResult_Impl_.NoBodyPart = -12;
_Results.TransferResult_Impl_.Ok = 0;
_Results.TransferResult_Impl_.NotOwner = -1;
_Results.TransferResult_Impl_.Busy = -4;
_Results.TransferResult_Impl_.NotEnoughEnergy = -6;
_Results.TransferResult_Impl_.InvalidTarget = -7;
_Results.TransferResult_Impl_.Full = -8;
_Results.TransferResult_Impl_.NotInRange = -9;
_Results.EnergyResult_Impl_.Ok = 0;
_Results.EnergyResult_Impl_.NotOwner = -1;
_Results.EnergyResult_Impl_.Busy = -4;
_Results.EnergyResult_Impl_.NotEnoughEnergy = -6;
_Results.SuicideResult_Impl_.Ok = 0;
_Results.SuicideResult_Impl_.NotOwner = -1;
_Results.SuicideResult_Impl_.Busy = -4;
_RoomMode.RoomMode_Impl_.Simulation = "simulation";
_RoomMode.RoomMode_Impl_.Survival = "survival";
_RoomMode.RoomMode_Impl_.World = "world";
Screeps.disableSpawns = false;
_StructureType.StructureType_Impl_.Spawn = "spawn";
_StructureType.StructureType_Impl_.Extension = "extension";
_StructureType.StructureType_Impl_.Road = "road";
_StructureType.StructureType_Impl_.Wall = "constructedWall";
_StructureType.StructureType_Impl_.Rampart = "rampart";
_TerrainType.TerrainType_Impl_.Swamp = "swamp";
_TerrainType.TerrainType_Impl_.Plain = "plain";
_TerrainType.TerrainType_Impl_.Wall = "wall";
_TerrainType.TerrainType_Impl_.Rampart = "rampart";
_TypeLookup.TypeLookup_Impl_.AICreep = "AICreep";
_TypeLookup.TypeLookup_Impl_.AISpawn = "AISpawn";
_TypeLookup.TypeLookup_Impl_.AIEnergy = "AIEnergy";
_TypeLookup.TypeLookup_Impl_.AIMap = "AIMap";
_TypeLookup.TypeLookup_Impl_.AIAssigned = "AIMap";
_TypeLookup.TypeLookup_Impl_.CreepEnergyCarrier = "CreepEnergyCarrier";
_TypeLookup.TypeLookup_Impl_.Healer = "Healer";
_TypeLookup.TypeLookup_Impl_.AIPathfinder = "AIPathfinder";
_TypeLookup.TypeLookup_Impl_.AIConstructionManager = "AIConstructionManager";
_TypeLookup.TypeLookup_Impl_.AIConstructionSite = "AIConstructionSite";
_TypeLookup.TypeLookup_Impl_.AICollectorPoints = "AICollectorPoints";
_TypeLookup.TypeLookup_Impl_.AIRoadConstructionManager = "AIRoadConstructionManager";
_TypeLookup.TypeLookup_Impl_.WorkerPath = "WorkerPath";
_TypeLookup.TypeLookup_Impl_.AISource = "AISource";
_TypeLookup.TypeLookup_Impl_.AIDefenceManager = "AIDefenceManager";
_TypeLookup.TypeLookup_Impl_.AIDefencePosition = "AIDefencePosition";
_TypeLookup.TypeLookup_Impl_.AIStatistics = "AIStatistics";
haxe.ds.ObjectMap.count = 0;
hxmath.math.MathUtil.eps = 1e-6;
hxmath.math._Vector2.Vector2_Impl_.elementCount = 2;
maybe._Maybe.Maybe_Impl_.__meta__ = { statics : { option : { to : null}}};
Screeps.main();
})();

//# sourceMappingURL=out.js.map