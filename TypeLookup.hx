
//#if !macro @:build(AutoBuildingMacro.build()) #end //@:build(AutoBuildingMacro.build())
@:enum
abstract TypeLookup(String) to String {
	var AICreep = "AICreep";
	var AISpawn = "AISpawn";
	var AIEnergy = "AIEnergy";
	var AIMap = "AIMap";
	var AIAssigned = "AIMap";
	var CreepEnergyCarrier = "CreepEnergyCarrier";
	var Healer = "Healer";
	var AIPathfinder = "AIPathfinder";
	var AIConstructionManager = "AIConstructionManager";
	var AIConstructionSite = "AIConstructionSite";
	var AICollectorPoints = "AICollectorPoints";
	var AIRoadConstructionManager = "AIRoadConstructionManager";
	var WorkerPath = "WorkerPath";
	var AISource = "AISource";
	var AIDefenceManager = "AIDefenceManager";
	var AIDefencePosition = "AIDefencePosition";
}