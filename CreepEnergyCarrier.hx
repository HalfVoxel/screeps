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

		var droppedEnergy : Array<Energy> = null;

		droppedEnergy = cast src.room.find(DroppedEnergy);

		if ( src.energy < src.energyCapacity*0.9 ) {
			
			var bestScore = -10000.0;

			/*for (creep in IDManager.creeps) {
				if (creep.role == Harvester) {
					var fractionOfCap = creep.src.energy / creep.src.energyCapacity;
					var fractionOfMyCap = creep.src.energy / src.energyCapacity;

					var score = lerp (fractionOfMyCap, fractionOfCap, fractionOfCap);

					// Ticks until full
					var predictedFull = 20.0;
					var workParts = creep.src.getActiveBodyparts(Work);

					if (fractionOfCap > 0.99) {
						predictedFull = 0;
					} else if (workParts > 0) {
						for (ent in creep.src.room.find(SourcesActive)) {
							if (creep.src.pos.isNearTo (ent.pos)) {
								predictedFull = (creep.src.energyCapacity - creep.src.energy)/ (workParts * 2);
								break;
							}
						}
					}

					score -= predictedFull / 4;

					var alreadyCovered = 0;
					for (carrier in IDManager.creeps) {
						if (carrier.type == CreepEnergyCarrier && carrier != this) {
							if ( carrier.src.pos.isNearTo (creep.src.pos) && carrier.src.energy+creep.src.energy < carrier.src.energyCapacity ) {
								alreadyCovered++;
							}
							if ((cast carrier : CreepEnergyCarrier).harvesterTarget == creep) {
								alreadyCovered++;
							}
						}
					}

					if (alreadyCovered > 0 && (harvesterTarget != creep || alreadyCovered >= 2)) score -= 10;
					if (alreadyCovered >= 2 && harvesterTarget != creep) continue;

					if (harvesterTarget == creep && creep.targetSource != null && creep.targetSource.energy > 0 && src.pos.isNearTo(creep.src.pos)) {
						score += 2;
					}

					var path = src.pos.findPathTo (creep.src, { ignoreCreeps:true });
					if ( path.length != 0) {

						score *= 1/ ((path.length / 25) + 1);

						// Bonus score for keeping the same target
						if (creep == harvesterTarget) {
							score += 0.5;
							score *= 6;
						}

						if ( score > bestScore ) {

							//score *= 1.0 / (targeting+1);

							if ( score > bestScore ) {
								bestScore = score;
								bestHarvester = creep;
							}
						}
					}
				}
			}*/

			var bestEnergy : Energy = null;
			var bestEnergyScore = -100000;
			var keepMultiplier = 1.0;

			for (dropped in droppedEnergy) {
				var path = src.pos.findPathTo(dropped.pos, { ignoreCreeps: true});

				var underHarvester = false;
				for (creep in IDManager.creeps) {
					if (creep.role == Harvester && creep.src.pos.x == dropped.pos.x && creep.src.pos.y == dropped.pos.y) {
						underHarvester = true;
					}
				}

				if ( path.length!= 0 && (underHarvester || dropped.energy > path.length+50) ) { // Needs to contain at least 20 energy when we get to it

					var score = dropped.energy - path.length*15;
					var aienergy : AIEnergy = IDManager.from(dropped);
					var mult = aienergy.assigned.length != 0 && currentTarget != aienergy ? 0.7 : 1;
					var keepm = currentTarget == aienergy ? 1.5 : (aienergy.assigned.length > 2 ? 2.0/aienergy.assigned.length : 1);

					//trace (aienergy);
					if (score*keepm > bestEnergyScore*keepMultiplier && aienergy.betterAssignScore (score*mult)) {
						bestEnergyScore = score;
						bestEnergy = dropped;
						keepMultiplier = keepm;
					}
				}
			}

			if (bestEnergy != null) {
				var energy : AIEnergy = IDManager.from (bestEnergy);
				
				energy.assign(this, bestEnergyScore);
			}
		}

		if (src.energy >= src.energyCapacity && currentTarget != null) {
			currentTarget.unassign (this);
		}

		if (currentTarget != null) {
			harvesterTarget = null;

			switch (currentTarget.type) {
			case AIEnergy: {

				var path = src.pos.findPathTo(currentTarget.linked.pos, { ignoreCreeps: false, heuristicWeight: 1});
				var aienergy : AIEnergy = cast currentTarget;
				var energy = aienergy.src;

				if (path.length == 0) {
					var index = aienergy.assigned.indexOf(this);
					var quePt = aienergy.getQueuePoint(index);
					src.moveTo (quePt.x, quePt.y, {heuristicWeight: 1});
				} else {
					src.moveTo(energy.pos, {heuristicWeight: 1});
				}

				if ( src.pos.isNearTo(energy.pos) ) {
					src.pickup(energy);
					currentTarget.unassign(this);
				}

				if (droppedEnergy != null) {
					for (dropped in droppedEnergy) {
						if (src.pos.isNearTo(dropped.pos)) {
							src.pickup(cast dropped);
						}
					}
				}
			}
			default: throw "Invalid type '" + currentTarget.type +"'";
			}
		} else if ( bestHarvester != null ) {
			harvesterTarget = bestHarvester;

			src.moveTo (bestHarvester.src.pos, {heuristicWeight: 1});
		} else if ( src.energy > 0 ) {
			harvesterTarget = null;

			var closestExt = null;
			var closestExtScore = -10000.0;

			for (ent in src.room.find(MyStructures)) {
				var structure : Structure = cast ent;
				if (structure.structureType == Extension && structure.energy < structure.energyCapacity*0.9) {
					var score = (structure.energy < 100 ? 40 : 0) + (structure.energy < 200 ? 10 : 0) - Math.sqrt (RoomPosition.squaredDistance(src.pos, structure.pos)) + 10*manager.extensionEnergyNeeded;
					if (score > closestExtScore) {
						closestExtScore = score;
						closestExt = structure;
					}
				}
			}

			switch ( src.pos.findClosestFriendlySpawn () ) {
				case Some(target): {

					if (target.energy < target.energyCapacity) {
						var score = (target.energy < 200 ? 40 : 0) + (target.energy < 400 ? 10 : 0) - Math.sqrt (RoomPosition.squaredDistance(src.pos, target.pos));
						if (score > closestExtScore) {
							closestExtScore = score;
							closestExt = target;
						}
					}
				}
				case None:
			}
			if (closestExt != null) {
				switch (src.moveTo(closestExt, {heuristicWeight: 1})) {
					case NoPath|NoBodyPart: {
						// Try to move energy around
						for (creep in IDManager.creeps) {
							if (creep.my && (creep.role == Builder || creep.role == EnergyCarrier) && src.pos.isNearTo(creep.src.pos)) {

								var amount = Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy));
								if ( amount > 0 ) {
									src.transferEnergy(creep.src, Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy)));
									break;
								}
							}
						}
					}
					default:
				}

				if (src.pos.isNearTo(closestExt.pos)) {
					var amount = Std.int(Math.min(closestExt.energyCapacity-closestExt.energy, src.energy));
					src.transferEnergy(closestExt, amount);
				}
			} else {
				// Try to move energy around
				for (creep in IDManager.creeps) {
					if (creep.my && (creep.role == Builder || creep.role == EnergyCarrier) && src.pos.isNearTo(creep.src.pos) && Std.random(5) == 0) {
						var amount = Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy));
						if ( amount > 0 ) {
							src.transferEnergy(creep.src, amount);
							break;
						}
					}
				}
			}
		} else {
			if (manager.carrierNeeded > 0) manager.carrierNeeded -= 0.7;
			src.moveTo(manager.map.getRegroupingPoint(id % manager.numRegroupingPoints));
		}

		if (src.energy > 0) {
			for (spawn in IDManager.spawns) {
				if (src.pos.isNearTo(spawn.src.pos)) {
					src.transferEnergy(spawn.src);
					break;
				}
			}

			for (creep in IDManager.creeps) {
				if (creep.my && creep.role == Builder && src.pos.isNearTo(creep.src.pos)) {
					var amount = Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy));
					if ( amount > 0 ) {
						src.transferEnergy(creep.src, Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy)));
						break;
					}
				}
			}
		}
	}
}