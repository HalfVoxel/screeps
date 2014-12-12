using ArrayTools;
using hxmath.math.Vector2;
using hxmath.math.IntVector2;

typedef HasCostAndData<T> = {
	var cost :Float;
	var data : T;
};

class Point {
	public var x:Int;
	public var y:Int;
	public var f:Float;
	public var heapIndex : Int;
	public var root : Point;

	public function new (x : Int, y : Int, f : Float, ?root : Point ) {
		this.x = x;
		this.y = y;
		this.f = f;
		this.heapIndex = 0;
		this.root = root;
	}
}

class CNode extends Point {
	public var conns : Array<CNode> = new Array<CNode>();
	public var comp : Component;
}

class Component {
	public var nodes : Array<CNode>;
	public var closed : Bool;
	public var mean : Vector2;
	public var root : IntVector2;
	public function new () {}
}

class AICollectorPoints extends Base {

	static var idx : Int = 0;
	static var startTime = 0.0;

	public static function fromSource ( sources : Array<Source> ) {
		var terrain = IDManager.manager.map.getTerrainMap();

		var pts = new Array<CNode>();
		for (source in sources) {
			pts.push (new CNode (source.pos.x, source.pos.y, 0));
		}

		// Ugly cast, but whatever, it's js
		var results : Array<Point> = cast findUntil (cast pts, terrain, function (v : Point) { return v.f == 2; }, 100000);
		var nodeResults = results.map (function (p : Point) { return new CNode (p.x, p.y, p.f, p.root); });

		var room = switch (Game.getRoomByName("1-1")) {
			case Some(room): room;
			case None: throw "Did not find room";
		}

		connect (nodeResults, true);
		var components = groupIntoContours (nodeResults);

		/*for (res in results) {
			room.createFlag (res.x, res.y, "P"+idx);
			idx++;
		}*/

		trace ("Found " + components.length + " " + nodeResults.length);

		var cid = 0;
		for (comp in components) {

			cid++;

			//if (cid > 3) break;
			for (node in comp.nodes) {
				//room.createFlag (node.x, node.y, cid + "." + idx + "." + (comp.closed?'c':'o'));
				idx++;
			}
		}

		var costs = AIMap.createMap (Room.Width);

		// Copy terrain
		for (y in 0...Room.Height) {
			for (x in 0...Room.Width) {
				//costs[y*Room.Width + x] = AIMap.getRoomPos (terrain, x, y);

				// Default penalty 2 so that roads have something to reduce
				//if ( costs[y*Room.Width + x] != -1 ) costs[y*Room.Width + x] += 2;
			}
		}

		// Mark nodes 1 unit from sources as non-traversable
		for (source in sources) {
			setAdjacent (costs, source.pos.x, source.pos.y, -1);
		}

		var pathfinder = IDManager.manager.pathfinder;

		var spawn = IDManager.spawns[0];

		cid = 0;
		for (comp in components) {
			

			//if (cid > 3) break;

			addDeltaNodes (costs, comp.nodes, 20);
		}

		var bitfield : Int = 0;

		var results = new Array<Float>();
		for (_ in components) {
			for (_ in components) {
				results.push(-1);
			}
		}

		startTime = haxe.Timer.stamp();

		function evaluateComponentCombination (stack : Array<CNode>) {

			var totCost = 0.0;

			if (haxe.Timer.stamp () - startTime > 0.3) throw "Killed here";

			var pathto = pathfinder.findPath (spawn.src.pos, stack[0], true , costs );
			totCost += pathfinder.sumCost (pathto, costs);
			addDeltaPath (costs, pathto, 20);

			var paths = new Array<Array<AIPathfinder.Vec2>> ();
			paths.push(pathto.map(state2vec2));

			var last = stack[0];

			if (haxe.Timer.stamp () - startTime > 0.3) throw "Killed here";

			for (node in stack) {

				if (last != node) {
					var intpath = pathfinder.findPath (last, node, true , costs );
					totCost += pathfinder.sumCost (intpath, costs);

					addDeltaPath (costs, intpath, 20);
					paths.push(intpath.map(state2vec2));
				}

				var idx = node.comp.nodes.indexOf(node);
					
				var vecpath = new Array<AIPathfinder.Vec2> ();
				if (node.comp.closed) {
					for (i in 1...node.comp.nodes.length-1) {
						var tmpnode = node.comp.nodes[(idx+i) % node.comp.nodes.length];
						vecpath.push ({x:tmpnode.x, y:tmpnode.y});
					}

					last = node.comp.nodes[(idx+node.comp.nodes.length-1) % node.comp.nodes.length];
				} else {
					if (idx == 0) {
						last = node.comp.nodes[(idx+node.comp.nodes.length-1) % node.comp.nodes.length];

						for (i in 1...node.comp.nodes.length-1) {
							var tmpnode = node.comp.nodes[i];
							vecpath.push ({x:tmpnode.x, y:tmpnode.y});
						}
					} else {

						for (i in 1...node.comp.nodes.length-1) {
							var tmpnode = node.comp.nodes[node.comp.nodes.length - i - 1];
							vecpath.push ({x:tmpnode.x, y:tmpnode.y});
						}

						last = node.comp.nodes[0];
					}
				}

				addDeltaVecPath (costs, vecpath, 20);
				paths.push (vecpath);
			}

			if (haxe.Timer.stamp () - startTime > 0.3) throw "Killed here";

			//var pathfrom = pathfinder.findPath (last, spawn.src.pos, true , costs );
			//totCost += pathfinder.sumCost (pathfrom, costs);
			//addDeltaPath (costs, pathfrom, 20);
			//paths.push(pathfrom.map(state2vec2));

			var invalid = false;

			for (path in paths) {
				if (path != null) addDeltaVecPath (costs, path, -20);
				else {
					invalid = true;
				}
			}

			if (pathto != null) {// && pathfrom != null) {
				

				
			} else {
				//trace ((pathto != null) + " " + (pathfrom != null));
			}

			if (haxe.Timer.stamp () - startTime > 0.3) throw "Killed here";

			if (!invalid) {
				return {cost: totCost, data: paths};
			} else {
				return null;
			}
		};
		for (bitfield in 0...(1 << components.length)) {



			//if (cid <= 4) continue;

			var cnt = 0;
			var anyClosed = false;
			for (i in 0...components.length) {
				if (((bitfield >> i) & 1) != 0) {
					cnt++;
					anyClosed = anyClosed || components[i].closed;
				}
			}

			// Only check for combinations of at most 2 elements
			if (cnt > 2) continue;

			// Closed components are left by themselves
			if (anyClosed && cnt > 1) continue;

			// Skip empty set
			if (cnt == 0) continue;

			var innercomps = new Array<AICollectorPoints.Component> ();

			for (i in 0...components.length) {
				if (((bitfield >> i) & 1) != 0) {
					innercomps.push (components[i]);
				}
			}

			var bestPaths = null;
			var bestScore = 100000.0;

			

			//continue;
			var now = haxe.Timer.stamp();

			var validComb = true;
			for (a in innercomps) {
				for (b in innercomps) {
					if ((a.mean - b.mean).lengthSq > 8*8) {
						validComb = false;
						break;
					}
				}
			}

			if (!validComb) continue;

			var res = dfsMinimize (innercomps, 0, new Array<CNode>(), evaluateComponentCombination);
			bestScore = res.cost;
			bestPaths = res.data;

			if (cid <= 100) {
				var dt = haxe.Timer.stamp() - now;
				trace("Took " + (dt*1000));
			}

			if (bestPaths != null) {
				var pid = 0;
				var id1 = components.indexOf (innercomps[0]);
				var id2 = innercomps.length > 1 ? components.indexOf (innercomps[1]) : id1;

				// Make sure id1 <= id2
				if (id1 > id2) {
					var tmp = id1;
					id1 = id2;
					id2 = tmp;
				}

				trace ("Cost for " + id1 + ", " + id2 + " = " + bestScore);

				results[id1*components.length + id2] = bestScore;
				/*for (path in bestPaths) {
					markVec (room, path, pid+"."+cid+":");
					pid++;

					addDeltaVecPath (costs, path, 6);
				}*/

				//break;
			}
		}

		var res = findBestCombination(results, components.length);

		var output = new Array<{path: Array<IntVector2>, roots: Array<IntVector2>}>();

		cid = 0;
		for (combinationID in res.data) {

			var id1 = combinationID % components.length;
			var id2 = Std.int (combinationID / components.length);

			var innerComps = new Array<AICollectorPoints.Component>();
			innerComps.push (components[id1]);
			if (id2 != id1) innerComps.push (components[id2]);

			trace ("Checking " + id1 + " " + id2);

			var result = dfsMinimize (innerComps, 0, new Array<CNode>(), evaluateComponentCombination);

			var totalPath = new Array<IntVector2>();

			cid++;
			var pid = 0;
			for (path in result.data) {
				for (node in path) totalPath.push (new IntVector2(node.x, node.y));

				pid++;
				//markVec (room, path, pid+"."+cid+":");
				addDeltaVecPath (costs, path, 6);
			}

			totalPath.remove(totalPath[0]);
			
			var roots = new Array<IntVector2>();
			for (comp in innerComps) {
				roots.push(comp.root);
			}

			output.push({path: totalPath, roots: roots});
		}

		trace (res);

		trace (haxe.Timer.stamp() - startTime);
		trace("TESTED: " + cid);

		return output;
	}

	/** Calculates the best combination of some costs so that all entries are covered and the cost is minimized.
	  * Assume you have N elements, you have calculated some costs for combining 1 or 2 elements, these costs are stored
	  * in costs[a*n + b] where a and b are the indices of the things you combined (a == b implies you only used a single element, so no combination).
	  * Example:
	  * We have costs for
	  * 1 A and 2 B costs 5
	  * 1 A costs 3
	  * 1 B costs 6
	  * 1 C costs 10
	  * 1 A and 1 C costs 20
	  * What is the best combination of offers so that we can "buy" A, B and C.
	  * Answer: (A+B for 5) + (C for 10)
	  * Returns the indices of the offers it used.
	  */
	static function findBestCombination (costs : Array<Float>, n : Int) {
		var rec = null;
		var bestCost = 1000000.0;
		var best = null;

		rec = function (used : Int, index : Int, cost : Float, stack : Array<Int>) {
			if (cost > bestCost) {
				return;
			}
			if (index == n) {
				trace ("Reached end with " + cost);
				if (cost < bestCost) {
					bestCost = cost;
					best = stack.copy ();
				}
				return;
			}

			if (((used >> index)&1) != 0) {
				// Already used
				rec (used, index+1, cost, stack);
			} else {
				for (i in index...n) {
					if (((used >>i)&1) == 0 && costs[index*n + i] != -1 ) {
						// Can use
						var nused = used | (1 << index) | (1 << i);

						var ncost = cost + costs[index*n + i];
						stack.push (index*n + i);
						rec (nused, index+1, ncost, stack);
						stack.pop ();
					}
				}

				// Skip using, very bad, high penalty
				rec (used, index+1, cost+10000, stack);
			}
		}

		rec (0, 0, 0, new Array<Int>());

		return {cost: bestCost, data: best};
	}

	/** Converts a state to a vec2 */
	static function state2vec2 (state : AIPathfinder.State) : AIPathfinder.Vec2 {
		return state;
	}

	/** Calculates all permutations of the components and gets the cost for that permutation using f, returns the minimum cost and corresponding permutation */
	static function dfsMinimize<T> (comps : Array<Component>, index : Int, stack : Array<CNode>, f : (Array<CNode>)->HasCostAndData<T>) : HasCostAndData<T> {


		if (index >= comps.length) {
			return f (stack);
		}

		var best : HasCostAndData<T> = null;

		if (comps[index].closed && false) {
			for (node in comps[index].nodes) {
				stack.push (node);
				var res = dfsMinimize (comps, index+1, stack, f);
				if (res != null && (best == null || res.cost < best.cost)) {
					best = res;
				}
				stack.pop();
			}
		} else {
			stack.push(comps[index].nodes[0]);
			var res = dfsMinimize (comps, index+1, stack, f);
			if (res != null && (best == null || res.cost < best.cost)) {
				best = res;
			}
			stack.pop ();

			stack.push(comps[index].nodes[comps[index].nodes.length-1]);
			res = dfsMinimize (comps, index+1, stack, f);
			if (res != null && (best == null || res.cost < best.cost)) {
				best = res;
			}
			stack.pop ();
		}

		return best;
	}

	static function markVec (room : Room, path : Array<AIPathfinder.Vec2>, prefix : String ) {
		var id = 0;
		for (node in path) {

			//room.createFlag ( node.x , node.y , prefix + id );
			room.createConstructionSite ( node.x, node.y, Road );
			id++;
		}
	}

	static function mark (room : Room, path : Array<AIPathfinder.State>, prefix : String ) {
		var id = 0;
		for (node in path) {

			//room.createFlag ( node.x , node.y , prefix + id );
			room.createConstructionSite ( node.x, node.y, Road );
			id++;
		}
	}

	static function flag (room : Room, path : Array<AIPathfinder.State>, prefix : String ) {
		var id = 0;
		for (node in path) {

			room.createFlag ( node.x , node.y , prefix + id );
			id++;
		}
	}

	static function setAdjacent ( map : Array<Float>, x : Int, y : Int, v : Int ) {
		for (i in 0...dx.length) {
			map[(y + dy[i])*Room.Width + x + dx[i]] = v;
		}
	}

	static function addDeltaVecPath ( map : Array<Float>, path : Array<AIPathfinder.Vec2>, diff : Int ) {
		for (node in path) {
			if (map[node.y*Room.Width + node.x] != -1) map[node.y*Room.Width + node.x] += diff;
		}
	}

	static function addDeltaPath ( map : Array<Float>, path : Array<AIPathfinder.State>, diff : Int ) {
		for (node in path) {
			if (map[node.y*Room.Width + node.x] != -1) map[node.y*Room.Width + node.x] += diff;
		}
	}

	static function addDeltaNodes ( map : Array<Float>, path : Array<CNode>, diff : Int ) {
		for (node in path) {
			if (map[node.y*Room.Width + node.x] != -1) map[node.y*Room.Width + node.x] += diff;
		}
	}

	public static var dx = [1, 1, 0, -1, -1, -1, 0, 1];
	public static var dy = [0, 1, 1, 1, 0, -1, -1, -1];

	public static var dxq = [1, 0, -1, 0];
	public static var dyq = [0, 1, 0, -1];

	public static function longestPath ( nodes : Array<CNode> ) {

		for (node in nodes) {
			if ( node.conns.length > 2 ) {
				trace ("NOT A PATH");
				return null;
			}
		}

		if (nodes.length == 0) return [];

		var start = nodes[0];

		var parent = null;
		var node = start;
		var found = true;

		while (found) {
			found = false;
			for (other in node.conns) {
				if (other != parent && other != start) {
					parent = node;
					node = other;
					found = true;
					break;
				}
			}
		}

		start = node;
		parent = null;
		found = true;
		var path = new Array<CNode>();

		while (found) {
			found = false;
			path.push(node);
			for (other in node.conns) {
				if (other != parent && other != start) {
					parent = node;
					node = other;
					found = true;
					break;
				}
			}
		}

		return path;
	}

	public static function connect ( nodes : Array<CNode>, onlySameRoot : Bool ) {
		var seen = new Map<Int,CNode> ();
		for (node in nodes) {
			seen[node.y*Room.Width + node.x] = node;
		}

		// 90 degree connections only
		var dx = dxq;
		var dy = dyq;

		for (node in nodes) {
			for (i in 0...dx.length) {
				var nx = node.x + dx[i];
				var ny = node.y + dy[i];
				if (seen.exists (ny*Room.Width + nx)) {
					var other = seen[ny*Room.Width + nx];
					if (!onlySameRoot || other.root == node.root) {
						node.conns.push (other);
					}
				}
			}
		}
	}

	public static function groupIntoContours ( nodes : Array<CNode> ) {
		var seen = new Map<CNode,Bool> ();

		var rec = null;
		rec = function ( accum : Array<CNode>, node : CNode) {
			if (seen.exists(node)) return;

			seen[node] = true;
			accum.push(node);

			for (other in node.conns) {
				rec(accum, other);
			}
		}

		var components = new Array<Component>();

		for (node in nodes) {
			
			if (!seen.exists(node)) {
				var ls = new Array<CNode>();
				rec(ls, node);

				var comp = new Component();
				comp.nodes = ls;

				comp.nodes = longestPath (comp.nodes);
				comp.root = new IntVector2 (comp.nodes[0].root.x, comp.nodes[0].root.y);

				var mean = new Vector2(0,0);
				for (node in ls) {
					node.comp = comp;
					mean = mean + new Vector2(node.x,node.y);
				}

				comp.mean = Vector2.multiplyScalar (1.0/ls.length, mean);

				// Check if the first node can see the last node
				comp.closed = comp.nodes[0].conns.indexOf(comp.nodes[comp.nodes.length-1]) != -1;

				components.push (comp);
			}
		}

		return components;
	}

	public static function findUntil (sources : Array<Point>, terrain : Array<Float>, threshold : (Point) -> Bool, count : Int) {

		var dx = AIMap.dx;
		var dy = AIMap.dy;

		var result = new Array<Point>();

		var seen = new Map<Int,Bool> ();
		var pts = new PriorityQueue<Point>();

		for (source in sources) {
			pts.push(source);
			source.root = source;
			seen[source.y*Room.Width + source.x] = true;
		}

		while(!pts.isEmpty()) {
			var state = pts.pop();

			if (threshold(state)) {
				result.push(state);

				if (result.length < count) continue;
				else break;
			}

			for (i in 0...dx.length) {
				var nx = state.x + dx[i];
				var ny = state.y + dy[i];
				if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {
					if (!seen.exists(ny*Room.Width + nx)) {

						if (AIMap.getRoomPos (terrain, nx, ny) == -1) continue;

						var next = new Point (nx, ny, state.f+1);
						next.root = state.root;
						pts.push (next);
						seen[ny*Room.Width + nx] = true;
					}
				}
			}
		}

		return result;
	}
}