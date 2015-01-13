using Spawn.SpawnExtender;	

enum Category {
	Military;
	Economy;
}

typedef SpawnType = {
	type : Class<AICreep>,
	role: AIManager.Role,
	body : Array<BodyPart>,
	category : AISpawn.Category,
	advancedThreshold : Float,
	amountProportion: Float,
};

class AISpawn extends Base {

	public var src(get, null) : Spawn;
	inline function get_src() return cast linked;

	static var roleTypes : Array<Array<SpawnType>> = 
	[
		[
		//{type: AICreep, role: Harvester, body: [Move,Work,Work,Work], category: Economy, advancedThreshold: 0, amountProportion: 1.1},
		{type: AICreep, role: Harvester, body: [Move,Work,Work,Work,Work], category: Economy, advancedThreshold: 0, amountProportion: 1.1},
		{type: AICreep, role: Harvester, body: [Move,Work,Work,Work,Work, Work, Work], category: Economy, advancedThreshold: 300, amountProportion: 1.1}
		],

		[
		{type: CreepEnergyCarrier, role: EnergyCarrier, body: [Carry, Move, Carry], category: Economy, advancedThreshold: 0, amountProportion: 0.8},
		{type: CreepEnergyCarrier, role: EnergyCarrier, body: [Move, Carry, Move, Carry], category: Economy, advancedThreshold: 100, amountProportion: 0.8},
		{type: CreepEnergyCarrier, role: EnergyCarrier, body: [Move, Carry, Carry, Move, Carry], category: Economy, advancedThreshold: 200, amountProportion: 0.8},
		{type: CreepEnergyCarrier, role: EnergyCarrier, body: [Move, Carry, Carry, Move, Move, Carry], category: Economy, advancedThreshold: 300, amountProportion: 0.8}
		],

		[
		//{type: AICreep, role: MeleeAttacker, body: [Tough, Attack, Attack, Move, Attack], category: Military, advancedThreshold: 0, amountProportion: 1.2},
		{type: AICreep, role: MeleeAttacker, body: [Tough, Tough, Tough, Tough, Tough, Tough, Move, Move, Move, Attack, Attack], category: Military, advancedThreshold: 0, amountProportion: 1.2},
		//{type: AICreep, role: MeleeAttacker, body: [Tough, Move, Attack, Attack, Move, Attack], category: Military, advancedThreshold: 150, amountProportion: 1.2},
		{type: AICreep, role: MeleeAttacker, body: [Tough, Move, Attack, Move, Attack, Attack, Attack], category: Military, advancedThreshold: 300, amountProportion: 0.2},
		{type: AICreep, role: MeleeAttacker, body: [Tough, Move, Attack, Attack, Attack, Move, Move, Attack], category: Military, advancedThreshold: 300, amountProportion: 1.2}
		],

		/*[
		{type: AICreep, role: MeleeWall, body: [Tough, Tough, Tough, Move, Attack], category: Military, advancedThreshold: 0, amountProportion: 1},
		],*/

		[
		//{type: AICreep, role: RangedAttacker, body: [Move, RangedAttack, RangedAttack, Move], category: Military, advancedThreshold: 0, amountProportion: 1.4},
		{type: AICreep, role: RangedAttacker, body: [RangedAttack, RangedAttack, Move, RangedAttack, Move], category: Military, advancedThreshold: 0, amountProportion: 2.4},
		//{type: AICreep, role: RangedAttacker, body: [Move, Move, RangedAttack, RangedAttack, Move, RangedAttack], category: Military, advancedThreshold: 0, amountProportion: 2.4},
		{type: AICreep, role: RangedAttacker, body: [Tough, Move, Move, RangedAttack, RangedAttack, Move, RangedAttack], category: Military, advancedThreshold: 300, amountProportion: 2.4},
		{type: AICreep, role: RangedAttacker, body: [Tough, Move, Move, RangedAttack, RangedAttack, Move, RangedAttack, RangedAttack], category: Military, advancedThreshold: 300, amountProportion: 2.4},
		],

		[
		{type: Healer, role: Healer, body: [Move, Move, Heal, Heal], category: Military, advancedThreshold: 0, amountProportion: 0.6},
		{type: Healer, role: Healer, body: [Move, Move, Heal, Move, Heal], category: Military, advancedThreshold: 200, amountProportion: 0.6},
		{type: Healer, role: Healer, body: [Move, Heal, Move, Move, Heal, Heal], category: Military, advancedThreshold: 400, amountProportion: 0.6},
		{type: Healer, role: Healer, body: [Move, Heal, Move, Move, Move, Heal, Heal], category: Military, advancedThreshold: 400, amountProportion: 0.6}
		],

		[
		{type: AICreep, role: Builder, body: [Move, Work, Work, Carry, Carry], category: Economy, advancedThreshold: 100, amountProportion: 0.2},
		{type: AICreep, role: Builder, body: [Move, Work, Carry, Move, Work, Carry], category: Economy, advancedThreshold: 0, amountProportion: 0.2},
		{type: AICreep, role: Builder, body: [Move, Work, Carry, Work, Move, Work, Carry], category: Economy, advancedThreshold: 0, amountProportion: 0.2},
		{type: AICreep, role: Builder, body: [Move, Work, Carry, Move, Work, Move, Work, Carry], category: Economy, advancedThreshold: 0, amountProportion: 0.2}
		]
	];

	public function configure () {
		initialize();
		return this;
	}

	var highestHostileMilitaryScore = 0;

	public function extensionNeeded ( body : Array<BodyPart> ) {
		var counter = 0;
		for (part in body) {
			if (part != Tough) {
				counter++;
			}
		}
		return counter;
	}

	function getBestRole () {
		var bestRole = roleTypes[0][0];
		var bestRoleScore = -1000.0;

		var hostileMilitary = 0;
		for (v in src.room.find(HostileCreeps)) {
			var creep : Creep = cast v;
			hostileMilitary += creep.getActiveBodyparts(Attack) + creep.getActiveBodyparts(RangedAttack) + creep.getActiveBodyparts(Heal);
		}

		if (hostileMilitary > highestHostileMilitaryScore) highestHostileMilitaryScore = hostileMilitary;

		var friendlyMilitary = 0;
		for (v in IDManager.creeps) friendlyMilitary += v.src.getActiveBodyparts(Attack) + v.src.getActiveBodyparts(RangedAttack) + v.src.getActiveBodyparts(Heal);

		var complexityScore = manager.getComplexityScore ();

		var sourceSlots = Lambda.fold (IDManager.sources, function(s,acc) { return s.maxAssignedCount + acc; }, 0);// src.room.find(Sources).length;

		
		// We got lots of energy, do whatever
		if (src.energy > src.energyCapacity*0.9) {
			complexityScore *= 100000;
		}

		var maxExtensions = 5;
		for (entity in src.room.find(MyStructures)) {
			var structure : Structure = cast entity;
			if (structure.structureType == Extension && structure.energy >= 200) {
				maxExtensions++;
			}
		}

		var energyNeededForConstruction = 0;
		for (site in IDManager.constructionSites) {
			energyNeededForConstruction += site.src.progressTotal - site.src.progress;
		}

		var militaryTimeScore = Game.time/3000;

		trace ("Spawning");
		trace("Complexity score: " + complexityScore + " mx: " + maxExtensions);

		if (IDManager.creeps.length > 0) {
			for (roleGroup in roleTypes) {
				// Iterating backwards to break ties in favour of higher leveled units
				for (i in -roleGroup.length...0) {
					var role = roleGroup[-i-1];

					if (role.advancedThreshold > complexityScore) continue;
					if (extensionNeeded (role.body) > maxExtensions) continue;

					var score = 0.0;

					var roleCount : Float = manager.getOriginalRoleCount(role.role);
					var totalCount : Float = IDManager.creeps.length;
					totalCount = totalCount - roleCount + (roleCount/role.amountProportion);
					roleCount = roleCount/role.amountProportion;

					score = 1 - (roleCount / totalCount);

					if (hostileMilitary >= friendlyMilitary && hostileMilitary > 0 && role.category == Military) {
						score += 5;
						score *= 2;
					}

					if (highestHostileMilitaryScore*2 >= friendlyMilitary && highestHostileMilitaryScore > 0 && role.category == Military) {
						score += 1;
						score *= 2;
					}

					if (role.category == Military) {
						score += militaryTimeScore;
					}

					if (role.role == Harvester && manager.getRoleCount(role.role) < 2) {
						score += 1;
					}

					if (role.role == Harvester && manager.getRoleCount(role.role) < sourceSlots && hostileMilitary == 0) {
						score += 1 * (1/300) * complexityScore;
					}

					// Too many harvesters
					if (role.role == Harvester && manager.getRoleCount(role.role) >= sourceSlots) score *= 0.25;

					if (role.role == EnergyCarrier) {
						score += manager.carrierNeeded*0.08;// / manager.getRoleCount(Harvester);
					}

					if (role.role == EnergyCarrier && manager.getRoleCount(EnergyCarrier) == 0 && hostileMilitary == 0) {
						score += 0.5;
					}

					if (role.role == EnergyCarrier && manager.getRoleCount(EnergyCarrier)*2 >= manager.getRoleCount(Harvester)) {
						score *= 0.5;
					}

					if (role.role == Builder) {
						score += 0.0005*energyNeededForConstruction / (manager.getOriginalRoleCount(Builder)+1);
					}

					if (score > bestRoleScore) {
						bestRoleScore = score;
						bestRole = role;
					}
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
					var creep = Base.instantiate (bestRole.type);
					creep.originalRole = creep.role = bestRole.role;
					IDManager.queueAddCreep(name, creep);
					trace("Spawning with name: " + name);

					manager.statistics.onSpawning (bestRole);

					if (bestRole.role == EnergyCarrier) {
						manager.carrierNeeded = -5;//Math.round(manager.carrierNeeded*0.05);
					}
				}
				case Error(err): {
					if (err == NotEnoughExtensions) {
						manager.extensionEnergyNeeded += 1;
					} else {
						//trace("Failed with " + err);
					}
				}
			}
		}
	}
}