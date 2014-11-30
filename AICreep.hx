using Math;

class AICreep extends Base {

	public var src(get, null) : Creep;
	inline function get_src() return cast linked.toEntity();

	var targetSource : SCRef<Source>;
	var role : AIManager.Role;

	public var currentTarget : Ref<AIAssigned>;

	static var dx = [1, 1, 0, -1, -1, -1, 0, 1];
	static var dy = [0, 1, 1, 1, 0, -1, -1, -1];

	public function new () {
		super();
		type = TypeLookup.AICreep;
	}
	
	public function configure ( role : AIManager.Role ) {
		this.role = role;
		initialize();
		return this;
	}

	public override function onCreated () {
		manager.modRoleCount(role, 1);
	}

	public override function onDestroyed () {
		manager.modRoleCount(role, -1);
	}

	public override function tick () {
		switch(role) {
		case Harvester: harvester ();
		case MeleeAttacker: meleeAttacker ();
		case RangedAttacker: rangedAttacker ();
		case EnergyCarrier: energyCarrier ();
		}
	}

	function harvester () {

		var source : Source = targetSource;
		if ( source == null || source.energy == 0 ) {

			var closest : Source = cast src.pos.findNearest (SourcesActive);

			if (closest != null) {
				var path = src.pos.findPathTo(closest);
				if (path != null && (source == null || 2*path.length < source.ticksToRegeneration)) {
					targetSource = closest;
				}
			}
		}

		var target : Source = targetSource;

		if (src.energy < src.energyCapacity && source != null) {
			if (src.pos.isNearTo(target.pos)) {
				src.harvest(source);
			} else {
				src.moveTo (source);
			}
		} else {

			var bestCarrier = null;

			var bestScore = 0.0;
			var dist = 10000;

			for (creep in IDManager.creeps) {
				if (creep.role == EnergyCarrier) {
					var fractionOfCap = creep.src.energy / creep.src.energyCapacity;

					var score = 1 - fractionOfCap;

					var path = src.pos.findPathTo (creep.src, { ignoreCreeps:true });
					if ( path != null ) {
						score *= 1/ ((path.length / 25) + 1);

						if ( score > bestScore ) {
							bestScore = score;
							bestCarrier = creep;
							dist = path.length;
						}
					}
				}
			}

			
			var spawn : Spawn = cast src.pos.findNearest (MySpawns);
			var spawnDist = spawn != null ? src.pos.findPathTo (spawn, { ignoreCreeps:true }).length : 1000;

			if (spawn != null && spawnDist*2 < dist) {
				if (src.pos.isNearTo(spawn.pos)) {
					src.transferEnergy(spawn);
				} else {
					src.moveTo (spawn);
				}
			} else if (bestCarrier != null) {
				if (src.pos.isNearTo(bestCarrier.src.pos)) {
					src.transferEnergy(bestCarrier.src);
				} else {
					src.moveTo (bestCarrier.src);
					manager.carrierNeeded += 2;
				}
			}
		}
	}

	function lerp (a : Float, b : Float, t : Float) {
		return a + (b-a)*t;
	}

	function energyCarrier () {

		var bestHarvester = null;

		var actionTaken = false;

		if ( src.energy < src.energyCapacity*0.8 ) {
			
			var bestScore = 0.0;

			for (creep in IDManager.creeps) {
				if (creep.role == Harvester) {
					var fractionOfCap = creep.src.energy / creep.src.energyCapacity;
					var fractionOfMyCap = creep.src.energy / src.energyCapacity;

					var score = lerp (fractionOfMyCap, fractionOfCap, fractionOfCap);

					var path = src.pos.findPathTo (creep.src, { ignoreCreeps:true });
					if ( path != null ) {
						score *= 1/ ((path.length / 25) + 1);

						if ( score > bestScore ) {
							bestScore = score;
							bestHarvester = creep;
						}
					}
				}
			}

			var droppedEnergy : Array<Energy> = cast src.room.find(DroppedEnergy);
			var bestEnergy : Energy = null;
			var bestEnergyScore = 0.0;

			for (dropped in droppedEnergy) {
				var path = src.pos.findPathTo(dropped, { ignoreCreeps: false});
				if ( path != null && dropped.energy > path.length+15 ) { // Needs to contain at least 15 energy when we get to it

					var score = dropped.energy - path.length*2;
					var aienergy : AIEnergy = IDManager.from(dropped);
					var mult = aienergy.assigned != null && aienergy.assigned != this ? 0.7 : 1;
					//trace("Got ");
					//trace (aienergy);
					if (score > bestEnergyScore && score*mult > aienergy.assignedScore) {
						bestEnergyScore = score;
						bestEnergy = dropped;
					}
				}
			}

			if (bestEnergy != null) {
				var energy : AIEnergy = IDManager.from (bestEnergy);
				trace("Got2 ");
				
				energy.assign(this, bestEnergyScore);
				trace ("Now assigned to " + energy + " " + currentTarget);
			}
		}	

		trace("target... " + currentTarget );
		if (currentTarget != null) {
			trace("Persuing target...");
			var obj : AIAssigned = currentTarget;
			switch (obj.type) {
			case AIEnergy: {
				var energy : Energy = cast obj.linked;
				trace (energy + " " + energy.pos);
				trace ("res " + src.moveTo(energy.pos));
				if ( src.pos.isNearTo(energy.pos) ) {
					src.pickup(energy);
					obj.unassign();
				}
			}
			default: throw "Invalid type '" + obj.type +"'";
			}
		} else if ( bestHarvester != null ) {
			src.moveTo (bestHarvester.src.pos);
		} else {
			var target : Spawn = cast src.pos.findNearest (MySpawns);

			if ( target != null ) {
				src.moveTo(target);

				if (src.pos.isNearTo(target.pos)) {
					src.transferEnergy(target);
				}
			}
		}
	}

	function meleeAttacker () {
		var target : Creep = cast src.pos.findNearest (HostileCreeps);

		if (target != null) {
			src.moveTo(target);

			if ( src.pos.isNearTo(target.pos)) {
				src.attack(target);
			}
		}
	}

	function rangedAttacker () {
		var targets = src.pos.findInRange (HostileCreeps, 3);

		if (targets.length > 0) {
			var occ = new Array<Int>();
			var occ2 = new Array<Int>();
			var size = 3+3+1;
			var offset = Math.floor(size/2);
			for ( x in 0...size ) {
				for ( y in 0...size ) {
					occ.push(0);
					occ2.push(0);
				}
			}

			for (target in targets) {
				var nx = (target.pos.x - src.pos.x) + offset;
				var ny = (target.pos.y - src.pos.y) + offset;
				occ[ny*size + nx] = 4;
			}

			for ( i in 0...4) {
				for ( j in 0...occ2.length ) {
					occ2[j] = 0;
				}

				for ( x in 0...size ) {
					for ( y in 0...size ) {
						occ2[y*size + x] = Math.round (Math.max (occ[y*size + x], occ2[y*size + x]));

						for ( di in 0...dx.length) {
							var nx = x + dx[di];
							var ny = y + dy[di];
							if (nx >= 0 && ny >= 0 && nx < size && ny < size ) {
								occ2[ny*size + nx] = Math.round (Math.max (occ2[ny*size + nx], occ[y*size + x]-1));
							}
						}
					}
				}

				var tmp = occ;
				occ = occ2;
				occ2 = tmp;
			}

			// result is in occ

			var bestx = 0;
			var besty = 0;
			var bestScore = 1000;
			var bestDist = 1000;

			for ( x in 0...size ) {
				for ( y in 0...size ) {
					// Means out of range, we don't want that
					if ( occ[y*size + x] == 0 ) occ[y*size + x] = 5;
				}
			}

			for ( x in 0...size ) {
				for ( y in 0...size ) {
					var score = occ[y*size + x];

					var dist = (x-offset)*(x-offset) + (y-offset)*(y-offset);
					if (score < bestScore || (score == bestScore && dist < bestDist)) {
						bestScore = score;
						bestDist = dist;
						bestx = x;
						besty = y;
					}
				}
			}
			bestx -= offset;
			besty -= offset;

			trace(occ);
			trace(bestx + " " + besty + " " +bestScore + " " + bestDist);

			var target : Creep = cast targets[0];
			src.moveTo(bestx + src.pos.x, besty + src.pos.y);

			if ( src.pos.inRangeTo(target.pos, 3)) {
				src.rangedAttack(target);
			}
		} else {
			var target : Creep = cast src.pos.findNearest (HostileCreeps);
			if (target != null) {
				src.moveTo(target);
			}
		}
	}
}