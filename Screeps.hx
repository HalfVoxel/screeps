//import ;
using Spawn.SpawnExtender;
using Utils;
import Storage.Memory;

class Screeps {
	static public function main():Void {
		
		/*var c2 = CompileTime.getAllClasses(Base);
		for (type in c2) {
			trace(Type.getClassName (type));
			var v = Type.createInstance(type, []);
			trace(v);
		}*/

		try {
			IDManager.tick ();

			new Screeps().run();
		} catch (e : Dynamic) {
			trace(e);
			trace(e.stack);
		}

		try {
			IDManager.tickEnd ();
		} catch (e : Dynamic) {
			trace(e.stack);
		}
	}

	public function new () {}

	public function run () {

		IDManager.manager.tick();
		
		for (spawn in IDManager.spawns) {
			if (spawn.src.my) {
				spawn.tick();
			}
		}

		for (creep in IDManager.creeps) {
			if (creep.src.my) {
				creep.tick();
			}
		}


	}
}