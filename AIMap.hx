class AIMap extends Base {

	var regroupingMap : Array<Float>;

	var movementPatternMap : Array<Float>;

	var terrainMap : Array<Float>;

	public var regroupingPoint : {x:Int, y:Int};

	var flag : Flag;

	static var tmpMap : Array<Float>;

	static inline var MapSize = 52;

	public override function isStandalone () { return true; }

	public function getTerrainMap () {
		switch (Game.getRoomByName("1-1")) {
			case Some(room): {
				if (terrainMap == null) terrainMap = generateTerrainMap (room);
			}
			case None: throw "Could not find room";
		}

		return terrainMap;
	}
	public function configure () {
		type = AIMap;
		initialize ();
		return this;
	}

	public static inline function getRoomPos ( map : Array<Float>, x : Int, y : Int ) {
		return map[(y+1)*MapSize + x+1];
	}

	static inline function setRoomPos ( map : Array<Float>, x : Int, y : Int, value : Float ) {
		map[(y+1)*MapSize + x+1] = value;
	}

	static inline function addDeltaRoomPos ( map : Array<Float>, x : Int, y : Int, delta : Float ) {
		map[(y+1)*MapSize + x+1] += delta;
	}

	public override function tick () {
		
		if (movementPatternMap == null) movementPatternMap = createMap();
		if (tmpMap == null) tmpMap = createMap();

		for (creep in IDManager.creeps) {
			if (creep.my) {
				switch (creep.role) {
					case EnergyCarrier | Harvester:  {
						var pos = creep.src.pos;
						addDeltaRoomPos (movementPatternMap, pos.x, pos.y, 100);
					}
					default:
				}
			}
		}

		decay(movementPatternMap);

		if (Game.time % 5 == 0) {
			switch (Game.getRoomByName("1-1")) {
				case Some(room): {
					//if (terrainMap == null) terrainMap = generateTerrainMap (room);
					regroupingMap = haxe.Timer.measure (function () { return generateRegroupingMap (room);});
				}
				case None: trace("Could not find room");
			}
		}
	}

	function decay (map : Array<Float>) {
		for ( i in 0...map.length ) {
			map[i] = map[i]*0.9;
		}
	}

	static var dx = [1, 1, 0, -1, -1, -1, 0, 1];
	static var dy = [0, 1, 1, 1, 0, -1, -1, -1];

	function smooth (map : Array<Float>, iterations : Int ) {
		// Copy

		if (iterations % 2 != 0) throw "Must smooth with an even number of iterations";

		var map1 = map;
		var map2 = tmpMap;

		for (it in 0...iterations) {

			for (y in 1...MapSize-1) {
				for (x in 1...MapSize-1) {
					var v = 0.0;

					for (i in -1...2 ) {
						v += map1[y*MapSize + x+i];
					}

					map2[y*MapSize + x] = v;
				}

				for (x in 1...MapSize-1) {
					var v = 0.0;

					for (i in -1...2 ) {
						v += map2[(y+i)*MapSize + x];
					}

					v /= 9;

					map1[y*MapSize + x] = v;
				}
			}

			// Swap
			//var tmp = map1;
			//map1 = map2;
			//map2 = tmp;
		}
	}

	function findmin (map : Array<Float>) {
		var min = 10000000.0;
		var minIndex = 0;

		for (y in 1...MapSize-1) {
			for (x in 1...MapSize-1) {
				if (map[y*MapSize + x] < min) {
					min = map[y*MapSize + x];
					minIndex = y*MapSize + x;
				}
			}
		}

		return {x: Std.int(minIndex % MapSize), y: Std.int(minIndex / MapSize)};
	}

	function findmins (map : Array<Float>) {
		var min = 10000000.0;
		var minIndex = 0;

		var mins = new Array<{x:Int, y:Int, value:Float}>();

		for (y in 1...MapSize-1) {
			for (x in 1...MapSize-1) {

				var minimum = true;
				var val = map[y*MapSize + x];
				for (i in 0...dx.length ) {
					minimum = minimum && val < map[(y+dy[i])*MapSize + (x+dx[i])];
				}

				if (minimum) {
					mins.push({x: x, y: y, value: val});
				}
			}
		}

		return mins;
	}

	function createMap () : Array<Float> {
		var map = new Array<Float>();
		for (y in 0...MapSize) {
			for (x in 0...MapSize) {
				map.push(0);
			}
		}
		return map;
	}

	function convertToString ( map : Array<Float> ) {
		var s = "";
		for (y in 1...MapSize-1) {
			for (x in 1...MapSize-1) {
				s += Std.int(map[y*MapSize + x]) + " ";
			}
			s += "\n";
		}

	}

	public function generateTerrainMap ( room : Room ) {
		var map = createMap ();

		for (y in 0...Room.Width) {
			for (x in 0...Room.Height) {
				var res = room.lookAt({x: x,y: y});

				var score = 0.0;
				for (item in res) {
					if (item.type == Terrain) {
						if (item.terrain == Wall) {
							score = -1;
						}
						if (item.terrain == Swamp) {
							score += 2;
						}
					}
				}

				setRoomPos(map, x, y, score);
			}
		}

		return map;
	}

	public function zero ( map : Array<Float> ) {
		for ( i in 0...map.length ) {
			map[i] = 0;
		}
	}

	public function generateRegroupingMap ( room : Room ) {
		var map;
		//if (regroupingMap != null) {
		//	map = regroupingMap;
		//} else {
			map = createMap ();
		//}

		zero (map);

		var terrain = getTerrainMap();

		for (y in 0...Room.Width) {
			for (x in 0...Room.Height) {

				var score = getRoomPos (terrain, x,y);
				if (score == -1) score = 10;
				score *= 100;

				score += Math.log(getRoomPos(movementPatternMap, x, y) + 1)*100;
				setRoomPos(map, x, y, score);
			}
		}

		for (spawn in Game.spawns) {
			if (spawn.my) {
				addDeltaRoomPos(map, spawn.pos.x, spawn.pos.y, -6500);
			} else {
				addDeltaRoomPos(map, spawn.pos.x, spawn.pos.y, 500);
			}
		}

		haxe.Timer.measure (function () { smooth(map, 4); });

		for (spawn in Game.spawns) {
			if (spawn.my) {
				addDeltaRoomPos(map, spawn.pos.x, spawn.pos.y, 1000);
			}
		}
		
		smooth(map, 6);

		//var pos = findmin(map);

		//flag = Game.flags["MyFlag"];

		for (flag in Game.flags) {
			flag.remove();
		}

		var mins = findmins(map);

		var spawns = room.find(MySpawns);


		var bestScore = -100000.0;
		var bestPos : {x:Int, y:Int, value:Float} = {x:0,y:0,value:0};
		for (min in mins) {
			var path = spawns[0].pos.findPathTo(min, {ignoreCreeps: true});
			var score : Float = path != null ? -path.length : -1000;
			score -= min.value*0.5;

			if (score > bestScore) {
				bestScore = score;
				bestPos = min;
			}
		}

		regroupingPoint = bestPos;

		//room.createFlag(min.x-1, min.y-1, "" + Std.int(min.value));
		room.createFlag(bestPos.x-1, bestPos.y-1, "" + Std.int(bestPos.value));
		//trace("Placing flag at " + (pos.x-1)  + " " + (pos.y-1));

		

		return map;
	}
}