using Spawn.SpawnExtender;

class AISpawn extends Base {

	public var src(get, null) : Spawn;
	inline function get_src() return cast linked.toEntity();

	static var roleTypes : Array<{role: AIManager.Role, body : Array<BodyPart>}> = 
	[
		{role: Harvester, body: [Move,Work,Work,Work,Carry]},
		{role: EnergyCarrier, body: [Move, Carry]},
		{role: MeleeAttacker, body: [Move, Move, Attack, Attack]},
		{role: RangedAttacker, body: [Move, Move, RangedAttack, RangedAttack]}
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

		if (IDManager.creeps.length > 0) {
			for (role in roleTypes) {
				var score = 0.0;
				score = 1 - (manager.getRoleCount(role.role) / (IDManager.creeps.length));

				if (role.role == Harvester && manager.getRoleCount(role.role) < 2) {
					score += 1;
				}

				if (role.role == EnergyCarrier && manager.getRoleCount(EnergyCarrier)*2 >= manager.getRoleCount(Harvester)) {
					score *= 0.5;
				}

				if (role.role == EnergyCarrier) {
					score += manager.carrierNeeded*0.05;
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