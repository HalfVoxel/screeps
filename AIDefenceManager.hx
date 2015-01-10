using AICollectorPoints;
using ArrayTools;

class AIDefenceManager extends Base {

	public override function isStandalone () { return true; }

	public var timeSinceHostileSeen : Int = 0;

	public function configure () {
		initialize ();
		return this;
	}

	public override function tick () {

		timeSinceHostileSeen++;

		var room = Game.getRoom("1-1").extract();

		if (room.find (HostileCreeps).length > 0) timeSinceHostileSeen = 0;

		if (IDManager.defences.length == 0) {

			var map = AIMap.createMap(AIMap.MapSize);

			var exits = new Array<Point>();

			for (y in 0...Room.Height) {
				for (x in 0...Room.Width) {

					// Check edges
					if (x == 0 || y == 0 || y == Room.Height-1 || x == Room.Width-1) {
						var res = room.lookAt({x:x,y:y});
						for (obj in res) {
							if (obj.type == Exit) {
								trace("Discovered exit at " + x + ", " + y);
								AIMap.setRoomPos(map, x, y, 10);
								exits.push(new Point(x,y,0));
								break;
							}
						}
					}
				}
			}

			trace(exits);
			var points = AICollectorPoints.findUntil(exits, manager.map.getTerrainMap(), function (p : Point) { return p.f == 5; }, 100000, false );
			trace(points);

			var nodeResults = points.map (function (p) { return new CNode (p.x, p.y, p.f, p.root); });
			

			AICollectorPoints.connect (nodeResults, false);


			var components = AICollectorPoints.groupIntoComponents (nodeResults, false);

			for (comp in components) {
				var layers = [for (i in 0...3) comp.nodes.filter (function (n) { return n.f == 2+i; })];
				var pointLayers = [for (layer in layers) layer.map(AICollectorPoints.point2intvector2)];
				
				// Increase randomness
				for (layer in pointLayers) layer.shuffle();

				trace("Found component with " + comp.nodes.length + " nodes [" + layers[0].length + ", " + layers[1].length + ", " + layers[2].length +"] " + pointLayers.length);

				new AIDefencePosition().configure (pointLayers[0], pointLayers[1], pointLayers[2]);
			}
		}
	}
}