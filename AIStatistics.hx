class AIStatistics extends Base {

	public override function isStandalone () { return true; }

	var deaths : Array<Int>;
	var spawns : Array<Int>;

	var energySpentOnRole : Array<Int>;

	var minedEnergy = 0;
	var collectedEnergy = 0;
	var pickedEnergy = 0;
	
	public function configure () {

		deaths = new Array<Int>();
		for ( i in 0...10 ) deaths.push (0);

		spawns = new Array<Int>();
		for ( i in 0...10 ) spawns.push (0);

		energySpentOnRole = new Array<Int>();
		for ( i in 0...10 ) energySpentOnRole.push (0);

		initialize ();
		return this;
	}

	public static function getBodyPartCost ( part : BodyPart ) : Int {
		return switch (part) {
			case Move: 50;
			case Work: 20;
			case Carry: 50;
			case Attack: 80;
			case RangedAttack: 150;
			case Heal: 200;
			case Tough: 20;
		}
	}

	static var NoExtensionsLimit = 5;
	static var ExtensionsCost = 200;

	public static function calculateSpawnCost ( body : Array<BodyPart> ) {
		var cost = 0;
		for (part in body) {
			cost += getBodyPartCost(part);
		}
		
		if (AISpawn.extensionNeeded(body) > NoExtensionsLimit) {
			cost += ExtensionsCost * (AISpawn.extensionNeeded(body) - NoExtensionsLimit);
		}
		return cost;
	}

	public function onSpawning ( type : AISpawn.SpawnType ) {
		energySpentOnRole[cast type.role] += calculateSpawnCost(type.body);
	}

	public function onCreepCreated ( role : AIManager.Role ) {
		spawns[cast role]++;
	}

	public function onCreepDeath ( role : AIManager.Role ) {
		deaths[cast role]++;
	}

	public function onMinedEnergy ( amount : Int ) {
		minedEnergy += amount;
	}

	public function onCollectedEnergy ( amount : Int ) {
		collectedEnergy += amount;
	}

	public function onPickedEnergy ( amount : Int ) {
		pickedEnergy += amount;
	}
}