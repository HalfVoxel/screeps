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
	static public function main():Void {
		
		/*var c2 = CompileTime.getAllClasses(Base);
		for (type in c2) {
			trace(Type.getClassName (type));
			var v = Type.createInstance(type, []);
			trace(v);
		}*/

		

		var queue = new PriorityQueue<Test>();
		queue.push(new Test(0));
		queue.push(new Test(5));
		queue.push(new Test(10));
		queue.push(new Test(0));
		queue.push(new Test(1));

		trace (queue.pop());
		trace (queue.pop());
		trace (queue.pop());
		trace (queue.pop());

		queue.push(new Test(1));		
	
		trace (queue.pop());
		trace (queue.pop());
		trace (queue.pop());
		trace (queue.pop());

		queue.push(new Test(1));
	
		trace (queue.pop());
		
		new AIPathfinder();

		try {
			haxe.Timer.measure (function () { 
				IDManager.tick ();
			}, {methodName:null, lineNumber: 0, fileName: "IDManager.Tick", className: null});

			new Screeps().run();
		} catch (e : Dynamic) {
			trace(e);
			trace(e.stack);
		}

		try {
			haxe.Timer.measure (function () { 
				IDManager.tickEnd ();
			}, {methodName:null, lineNumber: 0, fileName: "IDManager.TickEnd", className: null});
			
		} catch (e : Dynamic) {
			trace(e.stack);
		}
	}

	public function new () {}

	public function run () {

		haxe.Timer.measure (function () { 

			IDManager.manager.tick();
			
			haxe.Timer.measure (function () { 
				for (spawn in IDManager.spawns) {
					if (spawn.src.my) {
						spawn.tick();
					}
				}
			}, {methodName:null, lineNumber: 0, fileName: "Spawns", className: null});

			var times : Array<Float> = [0,0,0,0,0,0,0,0,0];
			var counts = [0,0,0,0,0,0,0,0,0];

			for (creep in IDManager.creeps) {
				if (creep.src.my) {
					var now = haxe.Timer.stamp();
					creep.tick();
					var t = haxe.Timer.stamp() - now;
					times[creep.role] += t;
					counts[creep.role] += 1;
				}
			}

			for (i in 0...times.length) {
				trace(i + ": " + (times[i]*1000) + " | " + (times[i]*1000/counts[i]));
			}
		});
	}
}