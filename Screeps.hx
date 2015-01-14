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

	static public function main():Void {

		haxe.Timer.measure (function () { 
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
			});
	}

	public function new () {}

	public function run () {

			

			IDManager.manager.tick();
			
			//haxe.Timer.measure (function () { 
			if (!disableSpawns) {
				for (spawn in IDManager.spawns) {
					if (spawn.src.my) {
						spawn.tick();
					}
				}
			}
			//}, {methodName:null, lineNumber: 0, fileName: "Spawns", className: null});

			//var times : Array<Float> = [0,0,0,0,0,0,0,0,0];
			//var counts = [0,0,0,0,0,0,0,0,0];

			for (defence in IDManager.defences) {
				defence.tick ();
			}
			
			for (energy in IDManager.energy) {
				energy.tick();
			}

			for (site in IDManager.constructionSites) {
				if (site.src.my) {
					site.tick();
				}
			}

			var assignment = new Assignment ();

			haxe.Timer.measure (function () { 
				for (creep in IDManager.creeps) {
					if (creep.src.my) {
						creep.preprocessAssignment(assignment);
					}
				}
			});

			haxe.Timer.measure (assignment.run);
			IDManager.manager.assignment = assignment;

			for (creep in IDManager.creeps) {
				if (creep.src.my) {
					//var now = haxe.Timer.stamp();
					creep.tick();
					//var t = haxe.Timer.stamp() - now;
					//times[creep.role] += t;
					//counts[creep.role] += 1;
				}
			}

			/*for (i in 0...times.length) {
				trace(i + ": " + (times[i]*1000) + " | " + (times[i]*1000/counts[i]));
			}*/
		//});
	}
}

class Assignment {
	
	var seen : Array<AICreep> = [];
	var seenPos : Array<Int> = [];
	var seenPos2 : Array<{x:Int,y:Int}> = [];

	var matrix = new Array<Array<Int>> ();
	var result : Array<Array<Int>>;

	public function add ( creep : AICreep, x : Int, y : Int, score : Int ) {
		var idx1 = seen.indexOf (creep);
		if (idx1 == -1) {
			idx1 = seen.length;
			seen.push(creep);
		}

		var idx2 = seenPos.indexOf(y*AIMap.MapSize + x);
		if (idx2 == -1) {
			idx2 = seenPos.length;
			seenPos.push(y*AIMap.MapSize + x);
			seenPos2.push({x:x, y:y});
		}

		var size = Std.int(Math.max(seen.length, seenPos.length));
		if (matrix.length < size) {
			while (matrix.length < size) matrix.push ([]);
			for (i in 0...matrix.length) {
				while (matrix[i].length < size) matrix[i].push(0);
			}
		}

		matrix[idx1][idx2] = score;
	}

	public function clearAllFor ( creep : AICreep ) {
		var idx1 = seen.indexOf (creep);
		if (idx1 != -1) {
			for (i in 0...matrix[idx1].length) {
				matrix[idx1][i] = 0;
			}
		}
	}

	public function getMatch ( creep : AICreep ) {
		var idx1 = seen.indexOf(creep);
		if (idx1 != -1) {
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
		trace(result);
	}
}