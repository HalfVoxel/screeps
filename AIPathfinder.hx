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

	var costs : Array<Float>;
	
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
					if ( costs[y*Room.Width + x] != -1 ) costs[y*Room.Width + x] += 1;
				}
			}
			
		}
	}

	static var dx = [1, 0, -1, 0, 1, 1, -1, -1];
	static var dy = [0, 1, 0, -1, -1, 1, 1, -1];
	
	static var near1x = [0, 1, 1, 0, -1, -1, -1, 0, 1];
	static var near1y = [0, 0, 1, 1, 1, 0, -1, -1, -1];

	var pathID : Int = 0;

	function h ( node : State, hTarget : Vec2 ) {
		//return Math.abs(node.x - hTarget.x) + Math.abs(node.y - hTarget.y);
		return Math.max (Math.abs(node.x-hTarget.x), Math.abs(node.y-hTarget.y))*1.005;
		//var dx = Math.abs(node.x - hTarget.x);
    	//var dy = Math.abs(node.y - hTarget.y);
    	//return (dx + dy) + (1.01 - 2) * Math.min(dx, dy);
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

	public function findPath (from : Vec2, to : Vec2, ignoreStartEnd : Bool, ?customCosts : Array<Float>) {
		pathID++;
		queue.clear();

		/*for (i in 0...8) {
			var nx = to.x + near1x[i];
			var ny = to.y + near1y[i];
			if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {
				nodes[ny*Room.Width + nx].target = true;
			}
		}*/
		nodes[to.y*Room.Width + to.x].target = true;

		var start = nodes[from.y*Room.Width + from.x]; //new State (from.x, from.y, 0, 0.0);

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