typedef Vec2 = {x:Int, y:Int};
class State {
	public var x: Int;
	public var y:Int;
	public var g:Float;
	public var f:Float;
	public var pathID : Int;
	public var target : Bool;
	public var parent : State;
	public var heapIndex : Int;
	public var direction : Int;

	public function new (x : Int, y : Int, g : Int, f : Float, dir : Int) {
		this.x = x;
		this.y = y;
		this.g = g;
		this.f = f;
		this.pathID = 100000;
		this.target = false;
		this.parent = null;
		this.heapIndex = -1;
		this.direction = dir;
	}
}

class AIPathfinder extends Base {

	public var costs : Array<Float>;
	var heuristicPivotCount : Int;
	var calculatedPivots : Int;
	var heuristicValues : Array<Float>;

	var costsWUnits : Array<Float>;

	static var nodes : Array<State>;

	static var dirnodes : Array<State>;

	static var queue : PriorityQueue<State> = new PriorityQueue<State>();

	public override function isStandalone () { return true; }

	public static inline var DIRS = 8;

	public function configure () {
		initialize ();
		return this;
	}

	public override function tick () {
		nodes = new Array<State>();
		for (y in 0...Room.Height) {
			for (x in 0...Room.Width) {
				// y*Room.Width + x
				nodes.push (new State(x,y,0,0, -1));
			}
		}

		/*dirnodes = new Array<State>();
		for (y in 0...Room.Height) {
			for (x in 0...Room.Width) {
				for (dir in 0...DIRS) {
					// y*Room.Width*DIRS + x*DIRS + dir]
					dirnodes.push (new State(x,y,0,0, dir));
				}
			}
		}*/

		if (costs == null) {
			costs = new Array<Float>();

			var terrain = IDManager.manager.map.getTerrainMap();
			for (y in 0...Room.Height) {
				for (x in 0...Room.Width) {
					// y*Room.Width + x
					costs.push (AIMap.getRoomPos (terrain, x,y));

					// Default penalty 1
					if ( costs[y*Room.Width + x] == 0 ) costs[y*Room.Width + x] += 1;
				}
			}

			costsWUnits = costs.copy ();
			
			var room = Game.getFirstRoom ();
			var allCreeps = IDManager.allCreeps;
			for (creep in allCreeps) {
				costsWUnits[creep.pos.y*Room.Width + creep.pos.x] = -1;
			}

			for (structure in IDManager.structures) {
				if (structure.structureType != Rampart && structure.structureType != Road) {
					costsWUnits[structure.pos.y*Room.Width + structure.pos.x] = -1;
				}
			}
		}

		if (calculatedPivots < heuristicPivotCount && heuristicValues != null && heuristicValues.length == nodes.length*heuristicPivotCount && Screeps.getCPULeft () > 40) {
			calculatePivot (heuristicValues, heuristicPivotCount, calculatedPivots);
			calculatedPivots++;
		} else if (calculatedPivots < heuristicPivotCount) {
			trace ("Trying to calculate pivots but: " + (heuristicValues != null) + " " + (heuristicValues != null ? ""+heuristicValues.length : "<null>")+ " == " + (nodes.length*heuristicPivotCount));
		}

		if (heuristicValues == null || heuristicValues.length != nodes.length*heuristicPivotCount) {
			heuristicPivotCount = 5;
			calculatedPivots = 0;
			heuristicValues = calculateHeuristicOptimization (heuristicPivotCount);
		}
	}

	static var dx = [1, 0, -1, 0, 1, 1, -1, -1];
	static var dy = [0, 1, 0, -1, -1, 1, 1, -1];
	
	static var near1x = [0, 1, 1, 0, -1, -1, -1, 0, 1];
	static var near1y = [0, 0, 1, 1, 1, 0, -1, -1, -1];

	var pathID : Int = 0;

	/** Returns the approximate distance between from and any point at most 1 tile away from to.
	  * Returns -1 if there is no possible path.
	  */
	public function approximateCloseDistance ( from : Vec2, to : Vec2 ) {

		var mn = 100000.0;
		for (dy in near1y) {
			for (dx in near1x) {
				mn = Math.min (mn, approximateDistance (from, {x: to.x+dx, y:to.y+dy}));
			}
		}

		// Likely that there is no possible path (default value for heruristic optimization is 10000)
		// normal paths shouldn't be longer than 200 or so
		if (mn > 5000) return -1.0;
		return mn;
	}

	/** Returns the approximate distance between from and to.
	  * Returns large values (> 5000) if there is no possible path.
	  */
	public inline function approximateDistance ( from : Vec2, to : Vec2 ) {
		var val = Math.max (Math.abs(from.x-to.x), Math.abs(from.y-to.y));
		var idx = (from.y*Room.Width + from.x);
		var idx2 = (to.y*Room.Width + to.x);

		for (i in 0...heuristicPivotCount) {
			val = Math.max (val, heuristicValues[idx*heuristicPivotCount+i] - heuristicValues[idx2*heuristicPivotCount+i]);
			val = Math.max (val, heuristicValues[idx2*heuristicPivotCount+i] - heuristicValues[idx*heuristicPivotCount+i] - costs[idx] + costs[idx2]);
		}
		return val;
	}

	inline function h ( node : State, hTarget : Vec2 ) {
		return approximateDistance(node, hTarget);
	}

	function tracePath ( node : State ) {
		var res = [];
		while (node != null) {
			res.push(node);
			node = node.parent;
		}
		res.reverse();
		return res;
	}

	public function sumCost ( path : Array<State>, ?customCosts : Array<Float>) {
		var sum = 0.0;
		for (node in path) {
			var v = costs[node.y*Room.Width + node.x];
			if ( v > 0 ) sum += v;
		}

		if (customCosts != null) {
			for (node in path) {
				var v = customCosts[node.y*Room.Width + node.x];
				if ( v > 0 ) sum += v;
			}
		}

		return sum;
	}

	public function findClosestNodeDefault ( pos : Vec2 ) {
		return findClosestNode (pos, costsWUnits, null);
	}

	public static function findClosestNode ( pos : Vec2, costs : Array<Float>, customCosts : Array<Float> ) {
		var dx = 1;
		var dy = 0;

		var segmentLength = 1;

		var x = pos.x;
		var y = pos.y;

		var nodeCounter = 0;

		for ( i in 0...625) {

			if (x >= 0 && y >= 0 && x < Room.Width && y < Room.Height) {
				if (traversable (x, y, costs, customCosts)) return {x: x, y: y};
			}

			// Step
			x += dx;
			y += dy;

			nodeCounter++;

			if (nodeCounter == segmentLength) {
				var tmp = dx;
				dx = -dy;
				dy = tmp;

				if (dy == 0) {
					segmentLength++;
				}

				nodeCounter = 0;
			}
		}

		return null;
	}

	public function findPathTo (from : Vec2, to : Vec2, ?options : PathOptions) {
		var costMap = options != null && options.ignoreCreeps ? costs : costsWUnits;

		var res = findPathNew (from, to, true, costMap, options);
		if (res == null) return [];
		res.splice (0, 1);
		return res;
	}

	static inline function traversable (x : Int, y : Int, costs : Array<Float>, customCosts : Array<Float>)  {
		return (costs[y*Room.Width + x] != -1) && (customCosts == null || customCosts[y*Room.Width + x] != -1);
	}

	public function findPathNew (from : Vec2, to : Vec2, ignoreStartEnd : Bool, costs : Array<Float>, ?options : PathOptions, ?customCosts : Array<Float>) {
		pathID++;
		queue.clear();
		

		var start = nodes[from.y*Room.Width + from.x];

		if (!ignoreStartEnd) {
			if ( costs[start.y*Room.Width + start.x] == -1 ||  (customCosts != null ? customCosts[start.y*Room.Width + start.x] : 0) == -1 ) {
				return null;
			}
		}
		
		if (RoomPosition.chebyshevDistance (from, to) <= 1) {
			return [nodes[start.y*Room.Width+start.x], nodes[to.y*Room.Width+to.x]];
		}

		var closest = findClosestNode(to, costs, customCosts);

		if (closest == null) return null;

		nodes[closest.y*Room.Width + closest.x].target = true;

		start.parent = null;
		start.pathID = pathID;
		start.g = 0;
		start.f = 0;
		queue.push(start);

		var result = null;

		var searchedNodes = 0;

		while(!queue.isEmpty()) {
			searchedNodes++;
			var state = queue.pop();

			if (state.target) {
				result = tracePath(state);
				break;
			}

			for (i in 0...8) {
				var nx = state.x + dx[i];
				var ny = state.y + dy[i];
				if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {

					//if (directions == null) {
					var other = nodes[ny*Room.Width + nx];

					var edgeCost = costs[ny*Room.Width + nx] + (customCosts != null ? customCosts[ny*Room.Width + nx] : 0);
					if (i >= 4) edgeCost *= 1.4142;

					var nextg = state.g + edgeCost;
					//var nextg = nextg + (i >= 4 ? 0.005 : 0);

					if (other.pathID != pathID || nextg < other.g) {

						if (i >= 4) {
							var bx = costs[ny*Room.Width + state.x] == -1 || (customCosts != null && customCosts[ny*Room.Width + state.x] == -1);
							var by = costs[state.y*Room.Width + nx] == -1 || (customCosts != null && customCosts[state.y*Room.Width + nx] == -1);

							// Diagonal blocked
							if (bx && by) continue;
						}

						if (!other.target) {
							if (costs[ny*Room.Width + nx] == -1) continue;
							if (customCosts != null && customCosts[ny*Room.Width + nx] == -1) continue;
						}

						//if (costs[ny*Room.Width + nx] < 0) throw "INVALID COST " + costs[ny*Room.Width + nx];
						//if (customCosts != null && customCosts[ny*Room.Width + nx] < 0) throw "INVALID COST " + customCosts[ny*Room.Width + nx];

						other.pathID = pathID;
						other.parent = state;
						other.g = nextg;
						other.f = other.g + h(other, closest);
						queue.pushOrTrickle(other);
					}
					/*} else {
						for (dir in 0...DIRS) {
							var other = nodes[ny*Room.Width + nx*DIRS + dir];

							if (other.pathID != pathID || nextg < other.g) {

								if (costs[ny*Room.Width + nx] == -1) continue;
								if (customCosts != null && customCosts[ny*Room.Width + nx] == -1) continue;

								other.pathID = pathID;
								other.parent = state;
								other.g = nextg;
								other.f = other.g + h(other, to);
								queue.push(other);
							}
						}
					}*/
				}
			}
		}

		// Reset target flags
		/*for (i in 0...8) {
			var nx = to.x + near1x[i];
			var ny = to.y + near1y[i];
			if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {
				nodes[ny*Room.Width + nx].target = false;
			}
		}*/
		nodes[closest.y*Room.Width + closest.x].target = false;

		return result;
	}

	public function displaySearched () {
		var room = Game.getRoom("1-1").extract();

		for (node in nodes) {
			if (node.pathID == pathID) {
				room.createFlag (node.x, node.y, node.x+","+node.y, Green);
			}
		}
	}
	public function calculateHeuristicOptimization ( pivotCount : Int ) {

		var heuristicValues = [];
		for (j in 0...nodes.length) {
			for (i in 0...pivotCount) {
				heuristicValues.push (10000.0);
			}
		}
		return heuristicValues;
	}

	public function calculatePivot ( heuristicValues : Array<Float>, pivotCount : Int, pivotIndex : Int ) {

		var nextNode = null;
		var maxVal = -1.0;
		var bx = 0;
		var by = 0;

		for (y in 0...Room.Height) {
			for (x in 0...Room.Width) {
				var idx = y*Room.Width + x;
				if (costs[idx] != -1) {

					var minDistance = 1000.0;
					for (j in pivotCount*idx...pivotCount*(idx+1)) {
						minDistance = Math.min (minDistance, heuristicValues[j]);
					}

					if (minDistance > maxVal) {
						maxVal = minDistance;
						bx = x;
						by = y;
					}
				}
			}
		}

		var result = flood ({x:bx, y:by});

		for (node in result) {
			var idx = node.y*Room.Width + node.x;

			// Flooring mostly for JSON performance (avoiding decimals)
			heuristicValues[idx*pivotCount + pivotIndex] = Math.floor (node.g - costs[idx]);
		}

		trace ("Calculated pivot index " + pivotIndex + " to " + bx+","+by);

		var room = Game.getRoom("").extract();
		room.createFlag (bx,by, "F"+pivotIndex, Cyan);
	}

	public function flood (from : Vec2) {
		pathID++;
		queue.clear();
		

		var start = nodes[from.y*Room.Width + from.x];
		
		start.parent = null;
		start.pathID = pathID;
		start.g = 0;
		start.f = 0;
		queue.push(start);

		var result = [];

		result.push(start);

		while(!queue.isEmpty()) {
			var state = queue.pop();

			for (i in 0...8) {
				var nx = state.x + dx[i];
				var ny = state.y + dy[i];
				if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {

					//if (directions == null) {
					var other = nodes[ny*Room.Width + nx];

					var edgeCost = costs[ny*Room.Width + nx];
					if (i >= 4) edgeCost *= 1.4142;

					var nextg = state.g + edgeCost;
					//var nextg = nextg + (i >= 4 ? 0.005 : 0);

					if (other.pathID != pathID || nextg < other.g) {

						if (i >= 4) {
							var bx = costs[ny*Room.Width + state.x] == -1;
							var by = costs[state.y*Room.Width + nx] == -1;

							// Diagonal blocked
							if (bx && by) continue;
						}
						if (costs[ny*Room.Width + nx] == -1) continue;

						if (other.pathID != pathID) {
							result.push(other);
						}

						other.pathID = pathID;
						other.parent = state;
						other.g = nextg;
						other.f = other.g;
						queue.pushOrTrickle(other);
					}
				}
			}
		}

		return result;
	}

	public function findPath (from : Vec2, to : Vec2, ignoreStartEnd : Bool, ?options : PathOptions, ?customCosts : Array<Float>) {
		pathID++;
		queue.clear();

		nodes[to.y*Room.Width + to.x].target = true;

		var start = nodes[from.y*Room.Width + from.x];

		if (!ignoreStartEnd) {
			if ( costs[start.y*Room.Width + start.x] == -1 ||  (customCosts != null ? customCosts[start.y*Room.Width + start.x] : 0) == -1 ) {
				return null;
			}
		}
		
		start.parent = null;
		start.pathID = pathID;
		start.g = 0;
		start.f = 0;
		queue.push(start);

		var result = null;

		while(!queue.isEmpty()) {
			var state = queue.pop();

			if (state.target) {
				result = tracePath(state);
				break;
			}

			
			/*if (directions != null && state.direction != -1) {
				var delta = state.direction - directions[state.y*Room.Width + state.x];
				var angle = Math.min (Math.abs(delta), delta + DIRS);
				if (angle != 0) {
					angle += angle*0.5;
				}
			}*/

			for (i in 0...8) {
				var nx = state.x + dx[i];
				var ny = state.y + dy[i];
				if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {

					//if (directions == null) {
					var other = nodes[ny*Room.Width + nx];

					var nextg = state.g + costs[ny*Room.Width + nx] + (customCosts != null ? customCosts[ny*Room.Width + nx] : 0);
					var nextg = nextg + (i >= 4 ? 0.005 : 0);

					if (other.pathID != pathID || nextg < other.g) {

						if (i >= 4) {
							var bx = costs[ny*Room.Width + state.x] == -1 || (customCosts != null && customCosts[ny*Room.Width + state.x] == -1);
							var by = costs[state.y*Room.Width + nx] == -1 || (customCosts != null && customCosts[state.y*Room.Width + nx] == -1);

							// Diagonal blocked
							if (bx && by) continue;
						}
						if (costs[ny*Room.Width + nx] == -1) continue;
						if (customCosts != null && customCosts[ny*Room.Width + nx] == -1) continue;

						if (costs[ny*Room.Width + nx] < 0) throw "INVALID COST " + costs[ny*Room.Width + nx];
						if (customCosts != null && customCosts[ny*Room.Width + nx] < 0) throw "INVALID COST " + customCosts[ny*Room.Width + nx];

						other.pathID = pathID;
						other.parent = state;
						other.g = nextg;
						other.f = other.g + h(other, to);
						queue.pushOrTrickle(other);
					}
					/*} else {
						for (dir in 0...DIRS) {
							var other = nodes[ny*Room.Width + nx*DIRS + dir];

							if (other.pathID != pathID || nextg < other.g) {

								if (costs[ny*Room.Width + nx] == -1) continue;
								if (customCosts != null && customCosts[ny*Room.Width + nx] == -1) continue;

								other.pathID = pathID;
								other.parent = state;
								other.g = nextg;
								other.f = other.g + h(other, to);
								queue.push(other);
							}
						}
					}*/
				}
			}
		}

		// Reset target flags
		for (i in 0...8) {
			var nx = to.x + near1x[i];
			var ny = to.y + near1y[i];
			if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {
				nodes[ny*Room.Width + nx].target = false;
			}
		}

		return result;
	}
}