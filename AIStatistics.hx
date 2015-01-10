class AIStatistics extends Base {

	public override function isStandalone () { return true; }

	var deaths : Array<Int>;
	var spawns : Array<Int>;

	public function configure () {

		deaths = new Array<Int>();
		for ( i in 0...10 ) deaths.push (0);

		spawns = new Array<Int>();
		for ( i in 0...10 ) spawns.push (0);

		initialize ();
		return this;
	}

	public function registerCreated ( role : AIManager.Role ) {
		spawns[cast role]++;
	}

	public function registerDeath ( role : AIManager.Role ) {
		deaths[cast role]++;
	}
}