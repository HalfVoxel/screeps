using Math;
using SCExtenders;
import Utils.*;

class AICreep extends Base {

	public var src(get, null) : Creep;
	inline function get_src() return cast linked;

	var targetSource : Source;
	public var role : AIManager.Role;
	public var originalRole : AIManager.Role;
	
	public var currentTarget : AIAssigned;

	public var attackTarget : Creep;

	static var dx = [1, 1, 0, -1, -1, -1, 0, 1];
	static var dy = [0, 1, 1, 1, 0, -1, -1, -1];

	public function configure () {

		// Creeps are spawned, so they need to be put in a queue first, therefore to not register it
		initialize(false);
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
		case Builder: builder ();
		default: throw "Not supported";
		}
	}

	function builder () {
		if (currentTarget == null) {
			role = Harvester;
			harvester();
			return;
		}

		var near = src.pos.isNearTo (currentTarget.linked.pos);

		if (src.energy < src.energyCapacity && (!near || src.energy == 0)) {

			switch(src.pos.findClosestFriendlySpawn ()) {
				case Some(spawn): {
					var spawnDist = src.pos.findPathTo (spawn, { ignoreCreeps:true }).length;

					
					if (src.pos.isNearTo(spawn.pos)) {
						spawn.transferEnergy (src, Std.int (Math.min (src.energyCapacity - src.energy, spawn.energy)));
					} else {
						src.moveTo (spawn, {heuristicWeight: 1});
					}
				}
				case None: harvester ();
			}
		} else if (!near) {
			src.moveTo (currentTarget.linked, {heuristicWeight: 1});
		} else {
			var constructionSite : AIConstructionSite = cast currentTarget;
			src.build (constructionSite.src);
		}
	}

	function harvester () {

		// Recalculate source
		if (targetSource != null && targetSource.energy == 0) targetSource = null;

		var source = targetSource;
		if ( source == null || Game.time % 6 == id % 6 ) {

			targetSource = switch(src.pos.findClosestActiveSource ({heuristicWeight: 1})) {
				case Some(closest): {
					var path = src.pos.findPathTo(closest.pos, {heuristicWeight: 1});
					if (path.length != 0 && (source == null || (source.energy == 0 && 4*path.length < source.ticksToRegeneration))) {
						closest;
					} else {
						if (path.length == 0) {
							trace("....");
						}
						source;
						//trace("... " + path.length);
					}
				}
				case None: {
					trace("Found no source!!");
					source;
				}
			}

			//targetSource = best;
		}

		if (src.energy == src.energyCapacity) {
			//manager.carrierNeeded += 2;
		}

		if (targetSource != null) {
			if (src.pos.isNearTo(targetSource.pos)) {
				src.harvest(targetSource);
			} else {
				src.moveTo (targetSource, {heuristicWeight: 1});
			}

			for (creep in IDManager.creeps) {
				if (creep.role == EnergyCarrier) {
					if (src.pos.isNearTo(creep.src.pos)) {
						src.transferEnergy(creep.src);
					}
				}
			}

		}// else {

			/*var bestCarrier = null;

			var bestScore = 0.0;
			var dist = 10000;

			if (false) {
				for (creep in IDManager.creeps) {
					if (creep.role == EnergyCarrier) {
						var fractionOfCap = creep.src.energy / creep.src.energyCapacity;

						if (fractionOfCap == 1) continue;

						var score = 1 - fractionOfCap;

						var path = src.pos.findPathTo (creep.src, { ignoreCreeps:true });

						if (src.pos.isNearTo(creep.src.pos)) score += 1;

						if ( path.length != 0 ) {
							score *= 1/ ((path.length / 25) + 1);

							if ( score > bestScore ) {
								bestScore = score;
								bestCarrier = creep;
								dist = path.length;
							}
						}
					}
				}
			}
		
			var tookAction = false;

			if ( manager.getRoleCount (EnergyCarrier) == 0 ) {
				switch(src.pos.findClosestFriendlySpawn ()) {
					case Some(spawn): {
						var spawnDist = src.pos.findPathTo (spawn, { ignoreCreeps:true }).length;

						if (spawnDist*2 < dist) {
							tookAction = true;
							if (src.pos.isNearTo(spawn.pos)) {
								src.transferEnergy(spawn);
							} else {
								logOnCriticalError(src.moveTo (spawn));
							}
						}
					}
					case None: {}
				}
			}

			for (creep in IDManager.creeps) {
				if (creep.role == EnergyCarrier && src.pos.isNearTo(creep.src.pos)) {
					src.transferEnergy(creep.src);
				}
			}

			if (!tookAction && bestCarrier != null) {
				if (src.pos.isNearTo(bestCarrier.src.pos)) {
					src.transferEnergy(bestCarrier.src);
				} else {
					src.moveTo (bestCarrier.src);
					manager.carrierNeeded += 2;
				}
			}
		}*/
	}

	function meleeAttacker () {

		if (attackTarget == null || RoomPosition.squaredDistance (src.pos, attackTarget.pos) < 4*4 || Game.time % 6 == id % 6) {
			switch(src.pos.findClosestHostileCreep ()) {
				case Some(target): {
					attackTarget = target;
				}
				case None: attackTarget = null;
			}
		}

		if (attackTarget != null) {
			src.moveTo(attackTarget, {heuristicWeight: 1});

			if ( src.pos.isNearTo(attackTarget.pos)) {
				src.attack(attackTarget);
			}
		} else {
			src.moveTo(manager.map.getRegroupingPoint(id % manager.numRegroupingPoints));
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

			for ( x in 0...size ) {
				for ( y in 0...size ) {
					var look = src.room.lookAt({x: x-offset+src.pos.x, y: y-offset+src.pos.y});
					for ( lookItem in look ) {
						if (lookItem.type == Terrain && lookItem.terrain == Wall ) {
							occ[y*size + x] = 6;
						}
					}
				}
			}

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

			//trace(occ);
			//trace(bestx + " " + besty + " " +bestScore + " " + bestDist);

			var target : Creep = cast targets[0];
			src.moveTo(bestx + src.pos.x, besty + src.pos.y, {heuristicWeight: 1});

			if ( src.pos.inRangeTo(target.pos, 3)) {
				src.rangedAttack(target);
			}
		} else {
			switch (src.pos.findClosestHostileCreep ()) {
			case Some(target): src.moveTo(target, {heuristicWeight: 1});
			case None: {
				src.moveTo(manager.map.getRegroupingPoint(id % manager.numRegroupingPoints));
			}
			}
		}
	}
}