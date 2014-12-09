class Point {
	public var x:Int;
	public var y:Int;
	public var f:Float;
	public var heapIndex : Int;

	public function new (x : Int, y : Int, f : Float ) {
		this.x = x;
		this.y = y;
		this.f = f;
		this.heapIndex = 0;
	}
}

class AICollectorPoints extends Base {

	public static function fromSource ( source : Source ) {
		var terrain = IDManager.manager.map.getTerrainMap();

		findUntil (new Point (source.pos.x, source.pos.y, 0), terrain, function (v : Point) { return v.f == 2; }, 100000);

		
	}

	public static function findUntil (source : Point, terrain : Array<Float>, threshold : (Point) -> Bool, count : Int) {

		var dx = AIMap.dx;
		var dy = AIMap.dy;

		var result = new Array<Point>();

		var seen = new Map<Int,Bool> ();
		var pts = new PriorityQueue<Point>();

		pts.push(source);
		seen[source.y*Room.Width + source.x] = true;
		
		while(!pts.isEmpty()) {
			var state = pts.pop();

			if (threshold(state)) {
				result.push(state);

				if (result.length < count) continue;
				else break;
			}

			for (i in 0...dx.length) {
				var nx = state.x + dx[i];
				var ny = state.y + dy[i];
				if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {
					if (!seen.exists(ny*Room.Width + nx)) {

						if (AIMap.getRoomPos (terrain, nx, ny) == -1) continue;

						var next = new Point (nx, ny, state.f+1);
						pts.push (next);
						seen[ny*Room.Width + nx] = true;
					}
				}
			}
		}

		return result;
	}
}