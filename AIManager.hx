class AIManager {

	public var roleCounter : Array<Int> = [];

	public var carrierNeeded : Float = 0;
	public var extensionEnergyNeeded : Float = 0;

	public var numRegroupingPoints = 1;

	public var map : AIMap;
	public var constructionManager : AIConstructionManager;
	public var pathfinder : AIPathfinder;
	public var defence : AIDefenceManager;
	public var statistics : AIStatistics;
	public var assignment : Screeps.Assignment;
	public var workerPaths : Array<WorkerPath>;
	public var profiler : Profiler;

	public function new () {}

	/** Makes sure the profiler is working */
	public function configureProfiler () {
		Profiler.setInstance (profiler);
		profiler = Profiler.getInstance();
		Profiler.tick ();
	}

	public function tick () {
		if (carrierNeeded > 0) carrierNeeded *= 0.95;
		extensionEnergyNeeded *= 0.9;

		if (defence == null) defence = new AIDefenceManager ().configure ();
		if (statistics == null) statistics = new AIStatistics ().configure ();

		if (constructionManager == null) constructionManager = new AIConstructionManager ().configure ();
		if (map == null) map = new AIMap().configure();
		if (pathfinder == null) pathfinder = new AIPathfinder().configure();

		var friendlyMilitary = getRoleCount(MeleeAttacker) + getRoleCount(MeleeWall) + getRoleCount(RangedAttacker) + getRoleCount(Healer);

		numRegroupingPoints = Std.int (friendlyMilitary / 15)+1;

		defence.tick ();

		var room = Game.getFirstRoom();

		for (ent in room.find(DroppedEnergy)) {
			var energy : Energy = cast ent;
			carrierNeeded += 0.01 * Math.max (energy.energy - 100,0) / getRoleCount(EnergyCarrier);
		}

		pathfinder.tick();

		if (Game.time % 10 == 8) {
			for (site in IDManager.constructionSites) {
				//site.src.remove ();
			}
		}

		if ((workerPaths == null || workerPaths.length == 0) && IDManager.spawns.length > 0 && Game.time % 20 == 12) {
			if (workerPaths != null) for (path in workerPaths) path.destroy ();

			workerPaths = new Array<WorkerPath>();
			var infos = AICollectorPoints.fromSource (cast room.find(Sources));
			for (info in infos) {
				var workerPath = new WorkerPath().configure(info);
				workerPaths.push(workerPath);
			}
		}


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
	var MeleeWall = 6;
}
