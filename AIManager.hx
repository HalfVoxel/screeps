class AIManager {

	public var roleCounter : Array<Int> = [];

	public var carrierNeeded : Float = 0;

	public var map : AIMap;
	public var pathfinder : AIPathfinder;

	public function new () {}

	public function tick () {

		if (carrierNeeded > 0) carrierNeeded -= 1.3;

		if (map == null) map = new AIMap().configure();
		if (pathfinder == null) pathfinder = new AIPathfinder().configure();

		pathfinder.tick();
		map.tick();

		var path = pathfinder.findPath({x:7, y:7}, {x: 33, y: 22});
		trace(path.length);
		var room = Game.getRoomByName("1-1");
		for (pos in path) {
			trace(pos.x + " " + pos.y);
			switch (room) {
				case Some(room): room.createFlag(pos.x, pos.y);
				case None: trace("No room");
			}
		}
		
	}

	public function getRoleCount ( role : Role ) {
		/*while (cast(role,Int) >= roleCounter.length) {
			roleCounter.push(0);
		}
		return roleCounter[role];*/
		var counter = 0;
		for (creep in IDManager.creeps) {
			if (creep.role == role) counter++;
		}
		return counter;
	}

	public function modRoleCount ( role : Role, diff : Int ) {
		/*while (cast(role,Int) >= roleCounter.length) {
			roleCounter.push(0);
		}
		roleCounter[role] += diff;*/
	}
}

@:enum
abstract Role(Int) to Int from Int {
	var Harvester = 0;
	var MeleeAttacker = 1;
	var RangedAttacker = 2;
	var EnergyCarrier = 3;
	var Healer = 4;
}