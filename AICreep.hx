using Math;
using SCExtenders;
import Utils.*;

class AICreep extends Base {

	public var src(get, null) : Creep;
	inline function get_src() return cast linked;

	public var role : AIManager.Role;
	public var originalRole : AIManager.Role;
	
	public var currentTarget : AIAssigned;

	public var attackTarget : Creep;

	static var dx = [1, 1, 0, -1, -1, -1, 0, 1];
	static var dy = [0, 1, 1, 1, 0, -1, -1, -1];

	var buildObstructed = 0;

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

	static var near1x = [0, 1, 1, 0, -1, -1, -1, 0, 1];
	static var near1y = [0, 0, 1, 1, 1, 0, -1, -1, -1];

	function builder () {
		if (currentTarget == null) {
			role = Harvester;
			harvester();
			return;
		}


		var bestLocScore = -10000.0;
		var bestLoc : RoomPosition = null;
		var assignedIndex = currentTarget.assigned.indexOf(this);

		var options = new Array<{score:Float, loc:RoomPosition}>();

		for (i in 0...AIMap.dx.length) {
			var nx = currentTarget.linked.pos.x + AIMap.dx[i];
			var ny = currentTarget.linked.pos.y + AIMap.dy[i];

			if (AIMap.getRoomPos(manager.map.getTerrainMap(), nx, ny) == -1) continue;

			var movementNearThis = 0.0;
			var movementOnThis = AIMap.getRoomPos (manager.map.movementPatternMap, nx, ny);

			for (j in 0...AIMap.dx.length) {
				var nx2 = nx + AIMap.dx[j];
				var ny2 = ny + AIMap.dy[j];

				movementNearThis += AIMap.getRoomPos (manager.map.movementPatternMap, nx2, ny2);
			}

			var invalid = false;
			for (ent in IDManager.structures) {
				if (ent.pos.x == nx && ent.pos.y == ny) {
					invalid = true;
					break;
				}
			}
			for (ent in IDManager.constructionSites) {
				if (ent.src.pos.x == nx && ent.src.pos.y == ny) {
					movementOnThis += 100;
				}	
			}

			if (!invalid) {
				var score = (movementNearThis/8) - 3*movementOnThis;
				options.push ({ score : score, loc :  src.room.getPositionAt(nx, ny)} );
			}
		}

		trace(assignedIndex + " " + options.length);
		options.sort ( function (a, b) { return a.score < b.score ? 1 : (a.score == b.score ? -1 : 0); });

		bestLoc = options[Std.int(Math.max (0, Math.min(assignedIndex, options.length-1)))].loc;

		src.room.createFlag(currentTarget.linked.pos.x,currentTarget.linked.pos.y,"P");

		src.room.createFlag(bestLoc.x,bestLoc.y,"TG");

		var near = src.pos.x == bestLoc.x && src.pos.y == bestLoc.y;//isNearTo (currentTarget.linked.pos);

		if (buildObstructed > 5) {
			if (currentTarget != null) {
				currentTarget.unassign (this);
				role = Harvester;
				harvester ();
				buildObstructed = 0;
				return;
			}
		}

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
			var path = src.pos.findPathTo (bestLoc);
			if (path.length == 0 || !bestLoc.isNearTo (cast path[path.length-1])) {
				currentTarget.unassign (this);
				builder ();
				return;
			}
			src.moveTo (bestLoc, {heuristicWeight: 1});
		} else {
			var constructionSite : AIConstructionSite = cast currentTarget;
			switch (src.build (constructionSite.src)) {
				case InvalidTarget: buildObstructed++;
				default: buildObstructed = Std.int(Math.max(buildObstructed-1, 0));
			}
		}
	}

	function harvester () {

		var targetSource : AISource = cast currentTarget;

		// Recalculate source
		//if (targetSource != null && targetSource.energy == 0) targetSource = null;

		if ( targetSource == null || Game.time % 6 == id % 6 ) {
			var source = targetSource;

			var pathToSource = source != null ? src.pos.findPathTo(source.src.pos, {heuristicWeight: 1}) : [];
			var earliestEnergyGather = Game.time +  (source != null && pathToSource.length != 0 ? Game.time +Math.max (4*pathToSource.length, source.src.energy > 0 ? 0 : source.src.ticksToRegeneration) : 1000);

			if (src.id == "id11418155875539" ) trace("@" + src.pos + " " + src.id);
			//targetSource = switch(src.pos.findClosestActiveSource ({heuristicWeight: 1})) {
			for (otherSource in IDManager.sources) {

				var path = src.pos.findPathTo(otherSource.src.pos, {heuristicWeight: 1});

				var newEarliestEnergyGather = Game.time + (path.length != 0 ? Math.max (4*path.length, otherSource.src.energy > 30 ? 0 : otherSource.src.ticksToRegeneration) : 1000);

				if (src.id == "id11418155875539" ) trace(earliestEnergyGather + " " + newEarliestEnergyGather + " " + otherSource.src.pos + " " + path.length + " " + pathToSource.length);

				var actuallyNear = otherSource.src.pos.isNearTo (cast path[path.length-1]);
				if (path.length != 0 && actuallyNear && newEarliestEnergyGather < earliestEnergyGather && (targetSource == otherSource || otherSource.betterAssignScore(-newEarliestEnergyGather))) {
					source = otherSource;
					earliestEnergyGather = newEarliestEnergyGather;
				}
			}

			if (source != null) {
				source.assign(this, -earliestEnergyGather);
			} else if (targetSource != null){
				targetSource.unassign(this);
			}
		}

		// Refresh
		targetSource = cast currentTarget;

		//if (src.id == "id11418155875539" ) return;

		if (src.energy == src.energyCapacity) {
			//manager.carrierNeeded += 2;
		}

		if (targetSource != null) {
			if (src.pos.isNearTo(targetSource.src.pos)) {
				src.harvest(targetSource.src);
			} else {
				switch (src.moveTo (targetSource.src, {heuristicWeight: 1})) {
					case InvalidTarget|NoPath: buildObstructed++;
					default: buildObstructed = Std.int(Math.max(buildObstructed-1, 0));
				}
			}

			for (creep in IDManager.creeps) {
				if (creep.role == EnergyCarrier) {
					if (src.pos.isNearTo(creep.src.pos)) {
						src.transferEnergy(creep.src);
					}
				}
			}

			if (buildObstructed > 5) {
				targetSource.unassign(this);
			}

		} else {
			src.moveTo(manager.map.getRegroupingPoint(id % manager.numRegroupingPoints));
		}
		// else {

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