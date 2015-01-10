using Math;
using SCExtenders;
import Utils.*;

class Healer extends AICreep {

	public var healingTarget : AICreep;

	public override function configure () {
		initialize (false);
		return this;
	}

	public override function tick () {

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
					var pathLength = src.pos.findPathTo(creep.src.pos).length;

					if (pathLength == 0) continue;

					var pathCost = Math.min (pathLength/20, 1);
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

		healingTarget = bestTarget;

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

		if (bestTarget != null) {
			src.moveTo(bestTarget.src);

			if (src.pos.isNearTo(bestTarget.src.pos)) {
				src.heal(bestTarget.src);
			} else if (src.pos.inRangeTo(bestTarget.src.pos, 3)) {

				src.rangedHeal(bestTarget.src);
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