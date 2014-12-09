class AIManager {

	public var roleCounter : Array<Int> = [];

	public var carrierNeeded : Float = 0;
	public var extensionEnergyNeeded : Float = 0;

	public var numRegroupingPoints = 1;

	public var map : AIMap;
	public var constructionManager : AIConstructionManager;
	public var pathfinder : AIPathfinder;

	public function new () {}

	public function tick () {

		if (carrierNeeded > 0) carrierNeeded *= 0.95;
		extensionEnergyNeeded *= 0.9;

		if (constructionManager == null) constructionManager = new AIConstructionManager ().configure ();
		if (map == null) map = new AIMap().configure();
		if (pathfinder == null) pathfinder = new AIPathfinder().configure();

		var friendlyMilitary = getRoleCount(MeleeAttacker) + getRoleCount(RangedAttacker) + getRoleCount(Healer);

		numRegroupingPoints = Std.int (friendlyMilitary / 15)+1;

		var room = switch (Game.getRoomByName("1-1")) {
			case Some(room): room;
			case None: throw "Could not find room";
		}

		for (ent in room.find(DroppedEnergy)) {
			var energy : Energy = cast ent;
			carrierNeeded += 0.01 * Math.max (energy.energy - 100,0) / getRoleCount(Harvester);
		}
		
		//pathfinder.tick();
		map.tick();
		constructionManager.tick ();

		/*var spawn1 = IDManager.spawns[0];
		var room = spawn1.src.room;

		var source = spawn1.src.room.find(SourcesActive)[1];

		var path = pathfinder.findPath(spawn1.src.pos, source.pos);
		var costs = AIMap.createMap (Room.Width);

		trace(path.length);
		for (pos in path) {
			costs[pos.y*Room.Width + pos.x] = 10;
		}

		var path2 = pathfinder.findPath(path[path.length-1], spawn1.src.pos);
		
		var idx = 0;
		for (pos in path) {
			room.createFlag (pos.x, pos.y, "1."+idx);
			idx++;
		}

		idx =0;
		for (pos in path2) {
			room.createFlag (pos.x, pos.y, "2."+idx);
			idx++;
		}*/
	}

	public function getComplexityScore () {
		var complexityScore = IDManager.creeps.length*2 + IDManager.spawns.length*50;
		for (creep in IDManager.creeps) {
			complexityScore += creep.src.body.length;
		}
		return complexityScore;
	}

	public function getOriginalRoleCount ( role : Role ) {
		/*while (cast(role,Int) >= roleCounter.length) {
			roleCounter.push(0);
		}
		return roleCounter[role];*/
		var counter = 0;
		for (creep in IDManager.creeps) {
			if (creep.originalRole == role) counter++;
		}
		return counter;
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
	var Builder = 5;
}
