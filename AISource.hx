class AISource extends AIAssigned {
	
	public var src(get, null) : Source;
	inline function get_src() return cast linked;

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
	}
}