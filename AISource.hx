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

	public override function earlyTick () {
		if (manager.map != null && maxAssignedCount == -1) {
			var root = new AICollectorPoints.Point (src.pos.x, src.pos.y,0,null);
			var terrain = manager.map.getTerrainMap();
			var results : Array<AICollectorPoints.Point> = cast AICollectorPoints.findUntil ([root], terrain, function (v : AICollectorPoints.Point) { return v.f >= 1; }, 100000);

			this.maxAssignedCount = results.length;
		}

		if ( Game.time % 5 == 0 && src.energy > 0 ) {
			var delta = (src.energy - prevEnergy)/5;

			var sustainable = src.energy + delta*src.ticksToRegeneration;

			// Lerp with t=0.2
			sustainabilityFactor = sustainabilityFactor*0.8 + 0.2*Math.min (Math.max ((sustainable / src.energyCapacity)+1, 0.05), 2);

			//trace(sustainable + " " + sustainabilityFactor);

			prevEnergy = src.energy;
		}
	}
}