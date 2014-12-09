class AIEnergy extends AIAssigned {
	
	public var src(get, null) : Energy;
	inline function get_src() return cast linked;

	public var prev : Int;
	public var queuePts : Array<{x:Int, y:Int}>;

	public override function tick () {
		var delta;
		if (src.energy > prev) {
			delta = src.energy - prev;
		} else {
			delta = 0;
		}
		prev = src.energy;
		this.maxAssignedCount = Math.ceil ((src.energy+delta*10) / 90);
	}

	public function getQueuePoint ( index : Int ) : {x:Int,y:Int} {
		if (queuePts == null) {
			generateQueuePoints ();
		}

		if (queuePts.length == 0) return src.pos;

		return queuePts[Std.int(Math.min(Math.max(index, 0), queuePts.length-1))];
	}

	function generateQueuePoints () {
		var map = AIMap.createMap(AIMap.MapSize);
		var terrain = IDManager.manager.map.getTerrainMap();

		for (spawn in IDManager.spawns) {
			var path = src.pos.findPathTo (spawn.src, {ignoreCreeps: true});
			for (node in path) {
				AIMap.setRoomPos (map, node.x, node.y, 100);
			}
		}

		AIMap.smooth (map, 1);

		var terrain = IDManager.manager.map.getTerrainMap();

		var result = AICollectorPoints.findUntil (new AICollectorPoints.Point (src.pos.x, src.pos.y, 0), terrain, function (v : AICollectorPoints.Point) {
			return AIMap.getRoomPos (map,v.x,v.y) == 0;
		}, 5);

		queuePts = new Array<{x:Int, y:Int}>();
		for (pt in result) queuePts.push({x:pt.x,y:pt.y});

		/*var i = 0;
		for (pt in queuePts) {
			src.room.createFlag(pt.x, pt.y, "Q" + id + "."+i);
			i++;
		}*/
	}

	public function configure () {
		initialize ();
	}
}