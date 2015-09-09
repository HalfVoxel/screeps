class AISource extends AIAssigned {
	
	public var src(get, null) : Source;
	inline function get_src() return cast linked;

	var prevEnergy = 0.0;

	public var sustainabilityFactor = 1.0;

	public function configure () {
		initialize ();
		this.maxAssignedCount = -1;

		return this;
	}

	public function sustainabilityWithoutMe (other : AICreep) {

		var harvestPower = 0;
		for (creep in assigned) {
			if (creep != null && creep != other) {
				harvestPower += 2*creep.src.getActiveBodyparts (Work);
			}
		}

		// Will yield 1 when there is no workers at the source
		// 0 when there are precisely enough workers
		// -1 when there are twice as many workers as needed

		// Source regenerates every 300 ticks
		var estimatedSustainability = 1 - (harvestPower*300 / src.energyCapacity);
		estimatedSustainability = Math.min (Math.max (estimatedSustainability+1, 0.02), 2);
		return estimatedSustainability;
	}

	public override function earlyTick () {
		if (manager.map != null && maxAssignedCount == -1) {
			var root = new AICollectorPoints.Point (src.pos.x, src.pos.y,0,null);
			var terrain = manager.map.getTerrainMap();
			var results : Array<AICollectorPoints.Point> = cast AICollectorPoints.findUntil ([root], terrain, function (v : AICollectorPoints.Point) { return v.f >= 1; }, 100000);

			this.maxAssignedCount = results.length;
		}

		if ( Game.time % 5 == 0 /*&& src.energy > 0*/ ) {
			var delta = (src.energy - prevEnergy)/5;

			var sustainable = src.energy + delta*src.ticksToRegeneration;

			var harvestPower = 0;
			for (creep in assigned) {
				if (creep != null) {
					harvestPower += 2*creep.src.getActiveBodyparts (Work);
				}
			}

			// Will yield 1 when there is no workers at the source
			// 0 when there are precisely enough workers
			// -1 when there are twice as many workers as needed

			// Source regenerates every 300 ticks
			var estimatedSustainability = 1 - (harvestPower*300 / src.energyCapacity);
			//var empiricalSustainability = sustainable / src.energyCapacity;
			var sustainability = estimatedSustainability;// + empiricalSustainability*0.2;


			// Will yeild 2 when there are no workers
			// 1 when precisely enough
			// 0.05 when twice as many or more
			// Lerp with t=0.8
			sustainabilityFactor = sustainabilityFactor*0.2 + 0.8*Math.min (Math.max (sustainability+1, 0.02), 2);
			trace (sustainabilityFactor + " " + estimatedSustainability );
			//trace(sustainable + " " + sustainabilityFactor);

			prevEnergy = src.energy;
		}
	}
}