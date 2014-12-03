//import ;
using Spawn.SpawnExtender;
using Utils;
import Storage.Memory;

class Screeps {
	static public function main():Void {
		
		try {
			IDManager.tick ();

			new Screeps().run();
		} catch (e : Dynamic) {
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