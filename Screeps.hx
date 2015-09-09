//import ;
using Spawn.SpawnExtender;
using Utils;
import Storage.Memory;

class Test {
	public var f:Float;
	public var heapIndex : Int;

	public function new (v : Float) {
		f = v;
	}
}

class Screeps {
	static var disableSpawns = false;

	public static function getCPULeft () {
		var used = 0.0;
		Game.getUsedCpu (function (time) {
			used = time;
		});

		return Game.cpuLimit - used;
	}

	static function killBecauseOfLowCPU () {
		var kill = getCPULeft () < 50;
		if (kill) {
			trace ("Killed here\n"+haxe.CallStack.callStack());
		}
		return kill;
	}

	static public function main():Void {

		var stamp1 = haxe.Timer.stamp();

		try {
			//haxe.Timer.measure (function () {
				IDManager.tick ();
			//}, {methodName:null, lineNumber: 0, fileName: "IDManager.Tick", className: null});
			new Screeps().run();
		} catch (e : Dynamic) {
			trace(e);
			trace(e.stack);
		}

		try {
			//haxe.Timer.measure (function () {
				IDManager.tickEnd ();
			//}, {methodName:null, lineNumber: 0, fileName: "IDManager.TickEnd", className: null});

		} catch (e : Dynamic) {
			trace(e.stack);
		}

		var stamp2 = haxe.Timer.stamp();

		var used = 0.0;
		Game.getUsedCpu (function (time) {
			used = time;
		});

		trace ("Total Time: " + Math.round ((stamp2-stamp1)*1000) + " Budget: "+Game.cpuLimit + " Actual Used: "+used);
		untyped __js__ ("console.log ('CPU:'+used)");

	}

	public function new () {}

	public function run () {

		IDManager.manager.configureProfiler();

		Profiler.start ("Run_manager");

		IDManager.manager.tick();

		Profiler.stop ();
		Profiler.verifyStackZero ();

		if (killBecauseOfLowCPU()) return;

		Profiler.start ("Run_spawn");
		//haxe.Timer.measure (function () {
		if (!disableSpawns) {
			for (spawn in IDManager.spawns) {
				if (spawn.src.my) {
					spawn.tick();
				}
			}
		}

		Profiler.stop ();
		Profiler.verifyStackZero ();
		if (killBecauseOfLowCPU()) return;

		//}, {methodName:null, lineNumber: 0, fileName: "Spawns", className: null});

		//var times : Array<Float> = [0,0,0,0,0,0,0,0,0];
		//var counts = [0,0,0,0,0,0,0,0,0];

		Profiler.start ("Run_defence");
		for (defence in IDManager.defences) {
			defence.tick ();
		}

		Profiler.stop ();
		Profiler.verifyStackZero ();
		if (killBecauseOfLowCPU()) return;

		Profiler.start ("Run_energy");
		for (energy in IDManager.energy) {
			energy.tick();
		}

		Profiler.stop ();
		Profiler.verifyStackZero ();
		if (killBecauseOfLowCPU()) return;

		Profiler.start ("Run_construction");
		for (site in IDManager.constructionSites) {
			if (site.src.my) {
				site.tick();
			}
		}

		Profiler.stop ();
		Profiler.verifyStackZero ();
		if (killBecauseOfLowCPU()) return;

		Profiler.start ("Run_preprocess");
		var assignment = new Assignment ();

		// If we run out of time
		// Make sure military units get to run first
		IDManager.creeps.sort (function (a,b) {
			var Acounter = a.src.getActiveBodyparts(Attack) + a.src.getActiveBodyparts(RangedAttack) + a.src.getActiveBodyparts(Heal);
			var AhealthFrac = (a.src.hits / a.src.hitsMax);

			var Bcounter = b.src.getActiveBodyparts(Attack) + b.src.getActiveBodyparts(RangedAttack) + b.src.getActiveBodyparts(Heal);
			var BhealthFrac = (b.src.hits / b.src.hitsMax);

			var Ascore = Acounter / AhealthFrac;
			var Bscore = Bcounter / BhealthFrac;

			//trace ("Score for " + a.role + " : " + Ascore + " ( " + Acounter + " " + AhealthFrac + ")");
			return if (Ascore > Bscore) -1;
			else if (Ascore < Bscore) 1;
			else 0;
		});

		for (creep in IDManager.creeps) {
			if (creep.src.my) {
				creep.preprocessAssignment(assignment);
				if (killBecauseOfLowCPU()) break;
			}
		}

		Profiler.stop ();
		Profiler.start ("Run_assignment");
		assignment.run ();
		IDManager.manager.assignment = assignment;

		Profiler.stop ();
		Profiler.verifyStackZero ();
		if (killBecauseOfLowCPU()) return;

		Profiler.start ("Run_creeps");
		for (creep in IDManager.creeps) {
			if (creep.src.my) {
				Profiler.start ("Run"+creep.originalRole);
				//var now = haxe.Timer.stamp();
				creep.tick();

				Profiler.stop ();
				//var t = haxe.Timer.stamp() - now;
				//times[creep.role] += t;
				//counts[creep.role] += 1;
				if (killBecauseOfLowCPU()) return;
			}
		}




		/*if (Game.time % 6 == 0) {
			profilePathfinding ();
		} else if (Game.time % 4 == 0) {
			for (flag in Game.flags) {
				flag.remove();
			}
		}*/
		/*for (i in 0...times.length) {
			trace(i + ": " + (times[i]*1000) + " | " + (times[i]*1000/counts[i]));
		}*/


		Profiler.stop ();
		Profiler.verifyStackZero ();
		//trace (Profiler.toString());

		profilePathfinding ();
	}

	function profilePathfinding () {

		return;

		var room = Game.getFirstRoom();

		var pts = [];

		for ( i in 0...10 ) {
			var p1 = {x: Std.random (50), y: Std.random (50)};
			var p2 = {x: Std.random (50), y: Std.random (50)};
			pts.push({p1: p1, p2: p2});
		}

		for (pt in pts) {
			var p1 = pt.p1;
			var p2 = pt.p2;

			var path2 = IDManager.manager.pathfinder.findPathTo (p1, p2);

			var p1c = IDManager.manager.pathfinder.findClosestNodeDefault (p1);
			var p2c = IDManager.manager.pathfinder.findClosestNodeDefault (p2);

			var approx = IDManager.manager.pathfinder.approximateDistance (p1c, p2c);

			var realCost = IDManager.manager.pathfinder.sumCost (path2);

			trace (realCost + " ≈ " + approx);
		}

		Profiler.start("ScreepsPath");
		for (pt in pts) {
			var p1 = pt.p1;
			var p2 = pt.p2;
			var path1 = room.findPath (p1, p2, {heuristicWeight: 1});
		}
		Profiler.stop ();

		Profiler.start("AstarPath");
		for (pt in pts) {
			var p1 = pt.p1;
			var p2 = pt.p2;
			var path2 = IDManager.manager.pathfinder.findPathTo (p1, p2);
		}
		Profiler.stop ();

		for (pt in pts) {
			var p1 = pt.p1;
			var p2 = pt.p2;

			var path1 = room.findPath (p1, p2);

			var path2 = IDManager.manager.pathfinder.findPathTo (p1, p2);

			IDManager.manager.pathfinder.displaySearched ();

			room.createFlag (p1.x, p1.y, "S", Cyan);
			room.createFlag (p2.x, p2.y, "T", Orange);

			var j = 0;
			for (node in path1) {
				room.createFlag (node.x, node.y, "a"+j, Blue);
				j++;
			}

			j = 0;
			for (node in path2) {
				room.createFlag (node.x, node.y, "b"+j, Red);
				j++;
			}
			break;
		}
	}
}

class Assignment {

	var seen = new Map<Int,Int> ();
	var counter = 0;
	var counterPos = 0;
	var seenPos = new Map<Int,Int> ();
	var seenPos2 : Array<{x:Int,y:Int}> = [];

	var matrix = new Array<Array<Int>> ();
	var result : Array<Array<Int>>;

	public function new () {
	}

	public function clearMatrix () {
		seen = null;
		seenPos = null;
		seenPos2 = null;
		matrix = null;
		result = null;
	}

	public function add ( creep : AICreep, x : Int, y : Int, score : Int ) {
		var idx1;
		if (seen.exists(creep.id)) {
			idx1 = seen[creep.id];
		} else {
			idx1 = counter;
			seen[creep.id] = idx1;
			counter++;
		}

		var idx2;
		if (seenPos.exists (y*AIMap.MapSize + x)) {
			idx2 = seenPos[y*AIMap.MapSize + x];
		} else {
			idx2 = counterPos;
			seenPos.set(y*AIMap.MapSize + x, idx2);
			seenPos2.push({x:x, y:y});
			counterPos++;
		}

		var size = Std.int(Math.max(counter, counterPos));
		if (matrix.length < size) {
			while (matrix.length < size) matrix.push ([]);
			for (i in 0...matrix.length) {
				while (matrix[i].length < size) matrix[i].push(0);
			}
		}

		matrix[idx1][idx2] = score;
	}

	public function clearAllFor ( creep : AICreep ) {
		var idx1 = seen[creep.id];
		if (idx1 != null) {
			for (i in 0...matrix[idx1].length) {
				matrix[idx1][i] = 0;
			}
		}
	}

	public function getMatch ( creep : AICreep ) {
		var idx1 = seen[creep.id];
		if (idx1 != null) {
			var idx2 = result[idx1][1];
			if (idx2 < seenPos2.length && result[idx1][2] > 0) {
				return seenPos2[idx2];
			}
		}
		return null;
	}

	public function run () {
		var mat = matrix;
		result = untyped __js__ ("Hungarian.hungarianAlgortithm (mat)");
		//trace(result);
	}
}
