using Math;
using SCExtenders;
import Utils.*;
using hxmath.math.IntVector2;

@:enum
abstract ReturningEnum(Int) {
	var Returning = 0;
	var AutoReturning = 1;
	var Collecting = 2;
	var AutoCollecting = 3;
}

class CreepEnergyCarrier extends AICreep {

	var harvesterTarget : AICreep;

	public var currentPath : WorkerPath;
	var returning : CreepEnergyCarrier.ReturningEnum = AutoCollecting;

	var energyDelta = 0;

	public override function configure () {
		initialize (false);
		return this;
	}

	function lerp (a : Float, b : Float, t : Float) {
		return a + (b-a)*t;
	}

	public override function earlyTick () {
		energyDelta = 0;
	}

	public override function tick () {
		energyCarrier (0);
	}

	public function assignToPath ( path : WorkerPath ) {
		if (path == currentPath) return;

		if (currentPath != null) currentPath.assigned.remove (this);
		if (path != null && path.assigned.indexOf(this) == -1) path.assigned.push (this);
		currentPath = path;

		returning = AutoCollecting;
	}

	public function energyCarrier ( iteration : Int ) {
		var bestHarvester = null;

		var actionTaken = false;

		var droppedEnergy : Array<Energy> = IDManager.droppedEnergy;

		// Variation and block remover
		if (Game.time % 60 == 0) currentPath = null;

		if (src.energy < src.energyCapacity) {

			var bestTransferFrom = null;
			var largestEnergyAmount = 0;

			var capacity = src.energyCapacity - src.energy;

			for (ent in droppedEnergy) {
				if (src.pos.isNearTo(ent.pos)) {
					var energy : Energy = cast ent;
					
					if (energy.energy > largestEnergyAmount) {
						bestTransferFrom = energy;
						largestEnergyAmount = energy.energy;
					}
				}
			}

			if (bestTransferFrom != null) {
				//trace ("Picking up " + largestEnergyAmount);
				src.pickup (bestTransferFrom);
				manager.statistics.onPickedEnergy (Std.int(Math.min (capacity, largestEnergyAmount)));
			}
		}

		if (currentPath == null) {
			var bestEnergy = 0.0;

			for (path in manager.workerPaths) {
				var nearbyEnergy = path.nearbyEnergy ();
				if ((currentPath == null || nearbyEnergy > bestEnergy) && nearbyEnergy > 0) {
					
					var next = path.next (new IntVector2(src.pos.x,src.pos.y), true);

					if (next == null) {
						// We happened to be at the endpoint
						assignToPath(path);
						bestEnergy = nearbyEnergy;
					} else {
						var pathto = src.pos.findPathTo (next.x,next.y);
						if (pathto.length != 0 && pathto[pathto.length-1].x == next.x && pathto[pathto.length-1].y == next.y) {
							assignToPath(path);

							bestEnergy = nearbyEnergy;
						}
					}
				}
			}
		}

		if (currentPath == null) {
			src.moveTo(manager.map.getRegroupingPoint(id % manager.numRegroupingPoints));
			return;
		}

		if ( src.energy+energyDelta < src.energyCapacity*1.0 ) {

			var bestScore = -10000.0;

			if (returning != Returning && returning != Collecting) returning = AutoCollecting;

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

			/*var bestEnergy : Energy = null;
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
			}*/
		} else {
			if (returning != Returning) returning = AutoReturning;
		}

		if (src.energy+energyDelta > 0) {
			var transferDone = false;

			var bestTransferTarget = null;
			var bestTransferAmount = 0;

			for (ext in IDManager.structures) {
				if (ext.structureType == Extension && src.pos.isNearTo(ext.pos)) {

					var amount = Std.int(Math.min(ext.energyCapacity-ext.energy, src.energy));
					if ( amount > bestTransferAmount ) {
						bestTransferAmount = amount;
						bestTransferTarget = ext;
					}
				}
			}

			if (bestTransferTarget != null) {

				var amount = Std.int(Math.min(bestTransferTarget.energyCapacity-bestTransferTarget.energy, src.energy));
				trace("Transfering to ext..." + src.pos);
				transferDone = true;
				src.transferEnergy(bestTransferTarget);
				currentPath = null;
				energyDelta -= amount;

				manager.statistics.onCollectedEnergy (amount);

				if (returning != Returning && returning != Collecting) returning = AutoCollecting;
			}

			if (!transferDone) for (spawn in IDManager.spawns) {
				if (src.pos.isNearTo(spawn.src.pos)) {
					//trace("Transfering to spawn..." + src.pos);
					transferDone = true;
					src.transferEnergy(spawn.src);
					currentPath = null;
					energyDelta -= src.energy;

					if (returning != Returning && returning != Collecting) returning = AutoCollecting;
					break;
				}
			}

			if (!transferDone) for (creep in IDManager.creeps) {
				if (creep.my && creep.role == Builder && src.pos.isNearTo(creep.src.pos)) {
					var amount = Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy));
					if ( amount > 0 ) {
						src.transferEnergy(creep.src, Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy)));

						if (src.energy - amount == 0) returning = AutoCollecting;
						break;
					}
				}
				if (currentPath != null && creep.my && creep != this && creep.role == EnergyCarrier && src.pos.isNearTo (creep.src.pos)) {
					var carrier : CreepEnergyCarrier = cast creep;

					if (carrier.currentPath == null || carrier.currentPath.nodeIndex (new IntVector2 (carrier.src.pos.x,carrier.src.pos.y)) < currentPath.nodeIndex (new IntVector2 (src.pos.x,src.pos.y))) {
						var amount = Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy));
						if ( amount > 0 ) {
							//trace("Transfering " + amount + " up in chain " + (creep.src.energy + " + " + amount + " = " + (creep.src.energy + amount) + " <= " + creep.src.energyCapacity));
							src.transferEnergy(creep.src, amount);
							carrier.energyDelta += amount;
							carrier.tick ();

							if (src.energy - amount == 0) returning = AutoCollecting;
							break;
						}
					}
				}
			}
		}

		if (currentPath == null) {
			if (iteration > 0) return;

			energyCarrier (iteration+1); return;
		}

		var next = currentPath.next (new IntVector2 (src.pos.x,src.pos.y), returning == Collecting || returning == AutoCollecting );
		if (next == null) {
			if (currentPath.nodeIndex(new IntVector2 (src.pos.x,src.pos.y)) == 0) {
				src.room.createFlag (src.pos.x,src.pos.y,id+"<>");
				assignToPath(null);
				returning = AutoCollecting;
				return;
			} else {
				returning = Returning;
			}
			trace ("reversing " + currentPath.nodeIndex(new IntVector2 (src.pos.x,src.pos.y)));

			next = currentPath.next (new IntVector2 (src.pos.x,src.pos.y), returning == Collecting || returning == AutoCollecting );
		}

		if (next != null) {
			//trace("Move to " + next + " from " + src.pos);
			src.moveTo (next.x, next.y);
		}

		/*
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

				var highestNear = 0;
				var highestNearEnergy = null;

				if (droppedEnergy != null) {
					for (dropped in droppedEnergy) {
						if (src.pos.isNearTo(dropped.pos)) {
							if (dropped.energy > highestNear) {
								highestNearEnergy = dropped;
								highestNear = dropped.energy;
							}
							
						}
					}
				}

				if (highestNearEnergy != null) {
					src.pickup(highestNearEnergy);
				}

				if (src.energy >= src.energyCapacity && currentTarget != null) {
					currentTarget.unassign (this);
				}
			}
			default: throw "Invalid type '" + currentTarget.type +"'";
			}
		} else if ( bestHarvester != null ) {
			harvesterTarget = bestHarvester;

			src.moveTo (bestHarvester.src.pos, {heuristicWeight: 1});
		} else  

		if ( src.energy > 0 ) {
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

				if (src.pos.isNearTo(closestExt.pos)) {
					var amount = Std.int(Math.min(closestExt.energyCapacity-closestExt.energy, src.energy));
					src.transferEnergy(closestExt, amount);
				}
			} else {
				// Try to move energy around
				moveEnergyAroundRandomly ();
			}
		} else {
			if (manager.carrierNeeded > 0) manager.carrierNeeded -= 0.7;
			src.moveTo(manager.map.getRegroupingPoint(id % manager.numRegroupingPoints));
		}*/


	}

	function moveEnergyAroundRandomly () {
		var randomTarget = null;
		var tries = 0;
		var targetAmount= 0;
		for (creep in IDManager.creeps) {
			if (creep.my && (creep.role == Builder || creep.role == EnergyCarrier) && src.pos.isNearTo(creep.src.pos)) {
				var amount = Std.int(Math.min(creep.src.energyCapacity-creep.src.energy, src.energy));
				if ( amount > 0 ) {
					tries++;
					if (Std.random (tries) == 0) {
						randomTarget = creep;
						targetAmount = amount;
					}
				}
			}
		}

		if (randomTarget != null) src.transferEnergy(randomTarget.src, targetAmount);

	}
}