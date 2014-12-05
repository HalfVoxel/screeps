
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
}