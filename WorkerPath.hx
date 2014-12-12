using hxmath.math.IntVector2;

class WorkerPath extends Base {

	public override function isStandalone () { return true; }

	public function configure (info : {path: Array<IntVector2>, roots: Array<IntVector2>}) {
		initialize ();

		path = info.path;
		roots = info.roots;

		return this;
	}

	public var path : Array<IntVector2>;

	public var roots : Array<IntVector2>;

	public var assigned = new Array<CreepEnergyCarrier>();

	function clean () {
		for (v in assigned) {
			if (v == null) {
				assigned.remove(v);
				clean ();
			}
		}
	}

	public function nearbyEnergy () : Float {
		clean ();

		var room = switch (Game.getRoomByName("1-1")) {
			case Some(room): room;
			default: throw "Could not find room";
		}

		var sum = 0;
		for (ent in room.find(DroppedEnergy)) {
			for (root in roots) {
				if (ent.pos.isNearTo (root.x, root.y)) {
					var energy : Energy = cast ent;
					sum += energy.energy;
				}
			}
		}

		return sum / ((assigned.length+1)*path.length);
	}

	public function nodeIndex ( pos : IntVector2 ) {
		for (i in 0...path.length) {
			if (path[i].x == pos.x && path[i].y == pos.y) {
				return i;
			}
		}
		return -1;
	}

	public function next ( pos : IntVector2, towardsEnd : Bool ) {
		for (i in 0...path.length) {
			if (path[i].x == pos.x && path[i].y == pos.y) {
				var nid = i+(towardsEnd ? 1 : -1);
				if (nid < 0 || nid >= path.length) return null;
				return path[nid];
			}
		}

		return path[0];
	}
}