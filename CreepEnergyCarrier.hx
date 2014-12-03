using Math;
using SCExtenders;
import Utils.*;

class CreepEnergyCarrier extends AICreep {

	var harvesterTarget : AICreep;

	public override function configure () {
		initialize (false);
		return this;
	}

	function lerp (a : Float, b : Float, t : Float) {
		return a + (b-a)*t;
	}

	public override function tick () {

		var bestHarvester = null;

		var actionTaken = false;

		if ( src.energy < src.energyCapacity*0.8 ) {
			
			var bestScore = -10000.0;

			for (creep in IDManager.creeps) {
				if (creep.role == Harvester) {
					var fractionOfCap = creep.src.energy / creep.src.energyCapacity;
					var fractionOfMyCap = creep.src.energy / src.energyCapacity;

					var score = lerp (fractionOfMyCap, fractionOfCap, fractionOfCap);

					// Bonus score for keeping the same target
					if (creep == harvesterTarget) {
						score *= 2;
					}

					// Ticks until full
					var predictedFull = 20.0;
					var workParts = creep.src.getActiveBodyparts(Work);

					if (fractionOfCap == 100) {
						predictedFull = 0;
					} else {
						for (ent in creep.src.room.find(SourcesActive)) {
							if (creep.src.pos.isNearTo (ent.pos)) {
								predictedFull = (creep.src.energyCapacity - creep.src.energy)/ (workParts * 2);
								break;
							}
						}
					}
					
					score += -predictedFull / 4;

					var alreadyCovered = false;
					for (carrier in IDManager.creeps) {
						if (carrier.type == CreepEnergyCarrier && carrier != this) {
							if ( carrier.src.pos.isNearTo (creep.src.pos)) {
								alreadyCovered = true;
								break;
							}
							if ((cast carrier : CreepEnergyCarrier).harvesterTarget == creep) {
								alreadyCovered = true;
								break;
							}
						}
					}

					if (alreadyCovered) score -= 10;

					var path = src.pos.findPathTo (creep.src, { ignoreCreeps:true });
					if ( path != null) {

						score *= 1/ ((path.length / 25) + 1);

						if ( score > bestScore ) {

							/*var targeting = 0;
							for (other in IDManager.creeps) {
								if (other.role == EnergyCarrier) {
									if (other.currentCreepTarget == creep && other != this) {
										targeting++;
									}
								}
							}*/

							//score *= 1.0 / (targeting+1);

							if ( score > bestScore ) {
								bestScore = score;
								bestHarvester = creep;
							}
						}
					}
				}
			}

			var droppedEnergy : Array<Energy> = cast src.room.find(DroppedEnergy);
			var bestEnergy : Energy = null;
			var bestEnergyScore = 0.0;

			for (dropped in droppedEnergy) {
				var path = src.pos.findPathTo(dropped, { ignoreCreeps: false});
				if ( path != null && dropped.energy > path.length+50 ) { // Needs to contain at least 20 energy when we get to it

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
				
				energy.assign(this, bestEnergyScore);
			}
		}	

		if (currentTarget != null) {
			harvesterTarget = null;

			trace("Persuing target...");
			var obj : AIAssigned = currentTarget;
			switch (obj.type) {
			case AIEnergy: {
				var energy : Energy = cast obj.linked;
				src.moveTo(energy.pos);
				if ( src.pos.isNearTo(energy.pos) ) {
					src.pickup(energy);
					obj.unassign();
				}
			}
			default: throw "Invalid type '" + obj.type +"'";
			}
		} else if ( bestHarvester != null ) {
			harvesterTarget = bestHarvester;

			src.moveTo (bestHarvester.src.pos);
		} else {
			harvesterTarget = null;

			switch ( src.pos.findClosestFriendlySpawn () ) {
				case Some(target): {
					src.moveTo(target);

					if (src.pos.isNearTo(target.pos)) {
						src.transferEnergy(target);
					}
				}
				case None:
			}
		}
	}
}