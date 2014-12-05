typedef Vec2 = {x:Int, y:Int};
class State {
	public var x: Int;
	public var y:Int;
	public var g:Int;
	public var f:Float;
	public var pathID : Int;
	public var target : Bool;
	public var parent : State;
	public var heapIndex : Int;

	public function new (x : Int, y : Int, g : Int, f : Float) {
		this.x = x;
		this.y = y;
		this.g = g;
		this.f = f;
		this.pathID = 100000;
		this.target = false;
		this.parent = null;
		this.heapIndex = 100000;
	}
}

class AIPathfinder extends Base {

	var costs : Array<Float>;
	
	static var nodes : Array<State>;

	static var queue : PriorityQueue<State> = new PriorityQueue<State>();

	public override function isStandalone () { return true; }

	public function configure () {

		initialize ();
		return this;
	}

	public override function tick () {
		nodes = new Array<State>();
		for (y in 0...Room.Height) {
			for (x in 0...Room.Width) {
				nodes[y*Room.Width + x] = new State(x,y,0,0);
			}
		}

		if (costs == null) {
			costs = new Array<Float>();
			var terrain = IDManager.manager.map.getTerrainMap();
			for (y in 0...Room.Height) {
				for (x in 0...Room.Width) {
					costs[y*Room.Width + x] = AIMap.getRoomPos (terrain, x,y);
				}
			}			
			
		}
	}

	static var dx = [1, 1, 0, -1, -1, -1, 0, 1];
	static var dy = [0, 1, 1, 1, 0, -1, -1, -1];
	
	static var near1x = [0, 1, 1, 0, -1, -1, -1, 0, 1];
	static var near1y = [0, 0, 1, 1, 1, 0, -1, -1, -1];

	var pathID : Int = 0;

	function h ( node : State, hTarget : Vec2 ) {
		return Math.abs(node.x - hTarget.x) + Math.abs(node.y - hTarget.y);
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

	public function findPath (from : Vec2, to : Vec2) {
		pathID++;
		queue.clear();

		for (i in 0...8) {
			var nx = to.x + near1x[i];
			var ny = to.y + near1y[i];
			if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {
				nodes[ny*Room.Width + nx].target = true;
			}
		}

		var start = new State (from.x, from.y, 0, 0.0);
		start.parent = null;
		start.pathID = pathID;
		queue.push(start);

		var result = null;

		while(!queue.isEmpty()) {
			var state = queue.pop();

			if (state.target) {
				result = tracePath(state);
				break;
			}

			var nextg = Math.floor(costs[state.y*Room.Width + state.x]);

			for (i in 0...8) {
				var nx = state.x + dx[i];
				var ny = state.y + dy[i];
				if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {
					var other = nodes[ny*Room.Width + nx];

					if (other.pathID != pathID || nextg < other.g) {

						if (costs[ny*Room.Width + nx] == -1) continue;

						other.pathID = pathID;
						other.parent = state;
						other.g = nextg;
						other.f = other.g + h(other, to);
						queue.push(other);
					}
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