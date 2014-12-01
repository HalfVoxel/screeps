using Spawn.SpawnExtender;

enum Category {
	Military;
	Economy;
}

class AISpawn extends Base {

	public var src(get, null) : Spawn;
	inline function get_src() return cast linked;

	static var roleTypes : Array<{role: AIManager.Role, body : Array<BodyPart>, category : AISpawn.Category}> = 
	[
		{role: Harvester, body: [Move,Work,Work,Work,Carry], category: Economy},
		{role: EnergyCarrier, body: [Move, Carry, Carry], category: Economy},
		{role: MeleeAttacker, body: [Tough, Move, Move, Attack, Attack], category: Military},
		{role: RangedAttacker, body: [Move, Move, RangedAttack, RangedAttack], category: Military}
	];

	public function new () {
		super();
		type = TypeLookup.AISpawn;
	}

	public function configure () {
		initialize();
		return this;
	}

	function getBestRole () {
		var bestRole = roleTypes[0];
		var bestRoleScore = -1000.0;

		var hostileMilitary = src.room.find(HostileCreeps).length;
		var friendlyMilitary = manager.getRoleCount(MeleeAttacker) + manager.getRoleCount(RangedAttacker);

		if (IDManager.creeps.length > 0) {
			for (role in roleTypes) {
				var score = 0.0;
				score = 1 - (manager.getRoleCount(role.role) / (IDManager.creeps.length));

				if (hostileMilitary >= friendlyMilitary && role.category == Military) {
					score *= 2;
				}

				if (role.role == Harvester && manager.getRoleCount(role.role) < 2) {
					score += 1;
				}

				if (role.role == EnergyCarrier) {
					score += manager.carrierNeeded*0.05 / manager.getRoleCount(Harvester);
				}

				if (role.role == EnergyCarrier && manager.getRoleCount(EnergyCarrier)*2 >= manager.getRoleCount(Harvester)) {
					score *= 0.5;
				}

				if (score > bestRoleScore) {
					bestRoleScore = score;
					bestRole = role;
				}
			}
		}

		return bestRole;
	}

	public override function tick () {
		if (src.spawning == null) {
			var bestRole = getBestRole ();

			var res = src.spawn(bestRole.body);
			switch (res) {
				case Ok(name): {
					IDManager.queueAddCreep(name, new AICreep().configure(bestRole.role));
					trace("Spawning with name: " + name);

					if (bestRole.role == EnergyCarrier) {
						manager.carrierNeeded = -5;//Math.round(manager.carrierNeeded*0.05);
					}
				}
				case Error(err): //trace("Failed with " + err);
			}
		}
	}
}