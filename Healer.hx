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
				if (creep.role == MeleeAttacker) {
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
			src.heal(bestTarget.src);
		} else {
			src.moveTo(manager.map.getRegroupingPoint(id % manager.numRegroupingPoints));
		}
	}
}