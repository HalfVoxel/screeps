using Math;
using SCExtenders;
import Utils.*;

class Healer extends AICreep {

	public var healingTarget : AICreep;

	public override function configure () {
		initialize (false);
		return this;
	}

	public override function preprocessAssignment ( assignment : Screeps.Assignment ) {

		var targets = IDManager.creeps;

		var hostileTargets = src.pos.findInRange (HostileCreeps, 1);

		if (targets.length > 0) {
			var occ = new Array<Float>();
			var occ2 = new Array<Float>();
			var size = 2+2+1;
			var offset = Math.floor(size/2);
			for ( x in 0...size ) {
				for ( y in 0...size ) {
					occ.push(0);
					occ2.push(0);
				}
			}

			for (target in targets) {

				var nx = (target.src.pos.x - src.pos.x) + offset;
				var ny = (target.src.pos.y - src.pos.y) + offset;

				if (target.my && nx >= 0 && nx < size && ny >= 0 && ny < size) {

					var healthFraction = target.src.hits / target.src.hitsMax;

					occ[ny*size + nx] = Math.max (occ[ny*size + nx], 1 - healthFraction*healthFraction);

					if (target.role != Healer && target.role != RangedAttacker) {
						occ[ny*size + nx] = 0;
					}
				} else {
					occ[ny*size + nx] = 0;
				}
			}

			for ( i in 0...1) {
				for ( j in 0...occ2.length ) {
					//occ2[j] = 0;
					occ2[j] = occ[j];
				}

				for ( y in 0...size ) {
					for ( x in 0...size ) {
						for ( di in 0...AICreep.dx.length) {
							var nx = x + AICreep.dx[di];
							var ny = y + AICreep.dy[di];
							if (nx >= 0 && ny >= 0 && nx < size && ny < size ) {
								occ2[ny*size + nx] = Math.max (occ2[ny*size + nx], occ[y*size + x]);
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
							occ[y*size + x] = 0;
						}
					}
				}
			}

			var anyNonZero = false;

			for (nx in AICreep.near1x) {
				for (ny in AICreep.near1y) {
					var ox = nx + offset;
					var oy = ny + offset;
					var score = occ[oy*size + ox] * 80;
					
					if (AIMap.getRoomPos (manager.map.getTerrainMap(), src.pos.x + nx, src.pos.y + ny) < 0) {
						continue;
					}

					var anyOnThisPosition = false;
					for (target in hostileTargets) {
						if (target.pos.x == src.pos.x+nx && target.pos.y == src.pos.y+ny) {
							anyOnThisPosition = true;
							break;
						}
					}
					if (anyOnThisPosition) {
						continue;
					}

					var potentialDamageOnMe = AIMap.getRoomPos (manager.map.potentialDamageMap, src.pos.x + nx, src.pos.y + ny);

					var finalScore = 200 + Std.int(score - potentialDamageOnMe);

					if (score == 0) finalScore -= 30;
					else anyNonZero = true;

					assignment.add (this, src.pos.x + nx, src.pos.y + ny, finalScore);

					/*
					if (massDamage > 10) {
						assignment.add (this, src.pos.x + nx, src.pos.y + ny, massDamage);
					} else if (score-bestScore <= 1) {
						assignment.add (this, src.pos.x + nx, src.pos.y + ny, 10+(5-score));
					}*/
				}
			}

			if (!anyNonZero) {
				assignment.clearAllFor (this);
			}
		}
	}

	function findGoodHealingTarget ( shortDistance : Bool ) {
		var bestTarget : AICreep = null;
		var bestScore = 0.0;

		for (creep in IDManager.creeps) {
			if (creep != this) {
				var score = 0.0;

				var healthFraction = creep.src.hits / creep.src.hitsMax;
				score += 1 - healthFraction*healthFraction;

				if (creep.role == MeleeAttacker) score += 0.05;
				if (creep.role == RangedAttacker) score += 0.02;

				if (score > bestScore) {
					var pathCost = 0.0;

					if (shortDistance) {
						if (!src.pos.isNearTo (creep.src.pos)) continue;
					} else {
						var pathLength = src.pos.findPathTo(creep.src.pos).length;

						if (pathLength == 0) continue;

					 	pathCost = Math.min (pathLength/20, 1);
					 }

					pathCost *= pathCost;
					score *= 1 - 0.3*pathCost;

					// Bonus points for distributing healers between multiple targets
					for (ent in IDManager.creeps) {
						if (ent.type == Healer && ent != this) {
							var healer : Healer = cast ent;
							if (healer.healingTarget == creep) {
								score *= 0.5;
							}
						}
					}

					// Bonus points for sticking to the same target
					if (creep == healingTarget) {
						score *= 1.5;
					}

					if (score > bestScore) {
						bestScore = score;
						bestTarget = creep;
					}
				}
			}
		}

		if (bestTarget == null) {
			for (creep in IDManager.creeps) {
				if (creep.role == MeleeAttacker || creep.role == MeleeWall) {
					bestTarget = creep;
					break;
				}
			}
		}

		if (bestTarget == null) {
			for (creep in IDManager.creeps) {
				if (creep.role == RangedAttacker) {
					bestTarget = creep;
					break;
				}
			}
		}

		return bestTarget;
	}

	public override function tick () {

		var match = manager.assignment.getMatch (this);

		if (match != null) {
			src.moveTo(src.room.getPositionAt (match.x, match.y), {reusePath: 0});

			healingTarget = findGoodHealingTarget (true);

			if (healingTarget != null) {
				if (src.pos.isNearTo(healingTarget.src.pos)) {
					src.heal(healingTarget.src);
				} else if (src.pos.inRangeTo(healingTarget.src.pos, 3)) {
					src.rangedHeal(healingTarget.src);
				}
			} else {
				healingTarget = findGoodHealingTarget (false);
				if (healingTarget != null) {
					src.rangedHeal(healingTarget.src);
				}
			}
		} else {

			healingTarget = findGoodHealingTarget(false);

			if (healingTarget != null) {
				src.moveTo(healingTarget.src);

				if (src.pos.isNearTo(healingTarget.src.pos)) {
					src.heal(healingTarget.src);
				} else if (src.pos.inRangeTo(healingTarget.src.pos, 3)) {

					src.rangedHeal(healingTarget.src);
				} else {
					for (creep in IDManager.creeps) {
						if (creep != this) {
							if (src.pos.inRangeTo(creep.src.pos, 3) && creep.src.hits < creep.src.hitsMax) {
								src.rangedHeal(creep.src);
								break;
							}
						}
					}
				}
				
			} else {
				moveToDefault ();
				//src.moveTo(manager.map.getRegroupingPoint(id % manager.numRegroupingPoints));
			}
		}
	}
}