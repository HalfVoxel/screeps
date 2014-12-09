class AIMap extends Base {

	var regroupingMap : Array<Float>;

	public var movementPatternMap : Array<Float>;
	public var movementPatternMapSlow : Array<Float>;

	var terrainMap : Array<Float>;

	var buildLocMap : Array<Float>;

	var buildSpawnMap : Array<Float>;

	public var regroupingPoints : Array<{x:Int, y:Int, value:Float}>;

	var flag : Flag;

	static var tmpMap : Array<Float>;

	public static inline var MapSize = 52;

	public override function isStandalone () { return true; }

	public function getTerrainMap () {
		switch (Game.getRoomByName("1-1")) {
			case Some(room): {
				haxe.Timer.measure(function () {
					if (terrainMap == null) terrainMap = generateTerrainMap (room);
				},{methodName:null, lineNumber: 0, fileName: "TerrainMap", className: null});
			}
			case None: throw "Could not find room";
		}

		return terrainMap;
	}
	public function configure () {
		initialize ();
		return this;
	}

	public static inline function getRoomPos ( map : Array<Float>, x : Int, y : Int ) {
		return map[(y+1)*MapSize + x+1];
	}

	public static inline function setRoomPos ( map : Array<Float>, x : Int, y : Int, value : Float ) {
		map[(y+1)*MapSize + x+1] = value;
	}

	public static inline function addDeltaRoomPos ( map : Array<Float>, x : Int, y : Int, delta : Float ) {
		map[(y+1)*MapSize + x+1] += delta;
	}

	public static function addMap (map : Array<Float>, add : Array<Float>, factor : Float) {
		if (map.length != add.length) throw "Map dimensions must match";

		for (i in 0...map.length) {
			map[i] += add[i]*factor;
		}
	}

	public override function tick () {
		
		if (movementPatternMap == null) movementPatternMap = createMap(MapSize);
		if (movementPatternMapSlow == null) movementPatternMapSlow = createMap(MapSize);

		if (tmpMap == null) tmpMap = createMap(MapSize);

		for (creep in IDManager.creeps) {
			if (creep.my) {
				switch (creep.role) {
					case EnergyCarrier:  {
						var pos = creep.src.pos;
						addDeltaRoomPos (movementPatternMap, pos.x, pos.y, 100);

						if (creep.src.fatigue > 0) {
							addDeltaRoomPos (movementPatternMapSlow, pos.x, pos.y, 100);
						}
					}
					default:
				}
			}
		}

		decay(movementPatternMap, 0.97);
		decay(movementPatternMapSlow, 0.97);

		if (Game.time % 20 == 0) {
			switch (Game.getRoomByName("1-1")) {
				case Some(room): {
					//if (terrainMap == null) terrainMap = generateTerrainMap (room);
					regroupingMap = haxe.Timer.measure (function () { return generateRegroupingMap (room);});
				}
				case None: trace("Could not find room");
			}
		}
	}

	public static function decay (map : Array<Float>, factor : Float) {
		for ( i in 0...map.length ) {
			map[i] *= factor;
		}
	}

	public static var dx = [1, 1, 0, -1, -1, -1, 0, 1];
	public static var dy = [0, 1, 1, 1, 0, -1, -1, -1];

	public static function smooth (map : Array<Float>, iterations : Int ) {
		// Copy

		//if (iterations % 2 != 0) throw "Must smooth with an even number of iterations";

		var map1 = map;
		var map2 = tmpMap;

		var size : Int = Std.int(Math.sqrt(map.length));

		for (it in 0...iterations) {

			for (y in 1...size-1) {
				for (x in 1...size-1) {
					var v = 0.0;

					for (i in -1...2 ) {
						v += map1[y*size + x+i];
					}

					map2[y*size + x] = v;
				}
			}

			for (y in 1...size-1) {
				for (x in 1...size-1) {
					var v = 0.0;

					for (i in -1...2 ) {
						v += map2[(y+i)*size + x];
					}

					v /= 9;

					map1[y*size + x] = v;
				}
			}

			// Swap
			//var tmp = map1;
			//map1 = map2;
			//map2 = tmp;
		}
	}

	public static function smoothWithMask (map : Array<Float>, iterations : Int, mask : Array<Float> ) {
		// Copy

		//if (iterations % 2 != 0) throw "Must smooth with an even number of iterations";

		var map1 = map;
		var map2 = tmpMap;

		var size : Int = Std.int(Math.sqrt(map.length));

		for (it in 0...iterations) {

			for (y in 1...size-1) {
				for (x in 1...size-1) {
					var v = 0.0;
					var cnt = 0;

					for (i in -1...2 ) {
						if (mask[y*size + x*i] >= 0) {
							v += map1[y*size + x+i];
							cnt++;
						}
					}

					if (cnt > 0) v /= cnt;

					map2[y*size + x] = v;
				}
			}

			for (y in 1...size-1) {
				for (x in 1...size-1) {
					var v = 0.0;
					var cnt = 0;

					for (i in -1...2 ) {
						if (mask[(y+i)*size + x] >= 0) {
							v += map2[(y+i)*size + x];
							cnt++;
						}
					}

					if (cnt > 0) v /= cnt;

					map1[y*size + x] = v;
				}
			}

			// Swap
			//var tmp = map1;
			//map1 = map2;
			//map2 = tmp;
		}
	}

	public static function findmin (map : Array<Float>) {
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

	public static function findmins (map : Array<Float>) {
		var min = 10000000.0;
		var minIndex = 0;

		var mins = new Array<{x:Int, y:Int, value:Float}>();

		var size : Int = Std.int(Math.sqrt(map.length));

		for (y in 1...size-1) {
			for (x in 1...size-1) {

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

	public static function createMap ( size : Int ) : Array<Float> {

		var map = new Array<Float>();
		for (y in 0...size) {
			for (x in 0...size) {
				map.push(0);
			}
		}
		return map;
	}

	public static function convertToString ( map : Array<Float> ) {
		var size : Int = Std.int(Math.sqrt(map.length));

		var s = "";
		for (y in 1...size-1) {
			for (x in 1...size-1) {
				s += Std.int(map[y*size + x]) + " ";
			}
			s += "\n";
		}

	}

	public function generateTerrainMap ( room : Room ) {
		var map = createMap (MapSize);

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
			map = createMap (MapSize);
		//}

		zero (map);

		var terrain = getTerrainMap();

		for (y in 0...Room.Width) {
			for (x in 0...Room.Height) {

				var score = getRoomPos (terrain, x,y);
				if (score == -1) score = 10;
				score *= 100;

				score += Math.log(getRoomPos(movementPatternMap, x, y) + 1)*150;
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

		// Convert to room coordinates
		for (i in 0...mins.length) {
			mins[i] = {x: mins[i].x-1, y: mins[i].y-1, value: mins[i].value};
		}

		var spawns = room.find(MySpawns);


		var bestScore = -100000.0;

		var bestPos : {x:Int, y:Int, value:Float} = {x:0,y:0,value:0};

		// Convert to scores
		for (min in mins) {

			var path = spawns[0].pos.findPathTo(min, {ignoreCreeps: true});
			var score : Float = path.length != 0 ? -path.length : -1000;
			score -= min.value*0.5;

			min.value = score;
		}

		for (min1 in mins) {
			for (min2 in mins) {
				if (min1 != min2 && min1.value > min2.value && RoomPosition.squaredDistance(min1, min2) < 8*8 ) {
					min2.value = -1000;
				}
			}
		}

		mins.sort ( function (a,b) { return a.value > b.value ? -1 : (a.value < b.value ? 1 : 0); });

		regroupingPoints = mins;

		//room.createFlag(min.x-1, min.y-1, "" + Std.int(min.value));
		

		for (i in 0...5) {
			if (i < mins.length) {
				room.createFlag(regroupingPoints[i].x, regroupingPoints[i].y, "" + Std.int(i));
			}
		}
		//trace("Placing flag at " + (pos.x-1)  + " " + (pos.y-1));

		

		return map;
	}

	public function getRegroupingPoint ( index : Int ) {
		if (regroupingPoints == null || regroupingPoints.length == 0) return {x:0, y: 0};
		return regroupingPoints[Std.int (Math.min(regroupingPoints.length, index))];
	}

	public function spawnLocation () {
		var map = createMap(MapSize);

		for (spawn in IDManager.spawns) {
			//addDeltaRoomPos (map,spawn.src.pos.x,spawn.src.pos.y, 2000000);

			var targetDistance = 20;
			for (y in 1...MapSize-1) {
				for (x in 1...MapSize-1) {
					var dist = RoomPosition.squaredDistance({x:x-1,y:y-1}, spawn.src.pos);

					var delta = 1 - (Math.sqrt(dist)/targetDistance);
					if (delta > 0) map[y*MapSize + x] += delta*(400);
				}
			}
		}
		for (spawn in IDManager.constructionSites) {
			if (spawn.src.structureType == Spawn) {
				var targetDistance = 20;
				for (y in 1...MapSize-1) {
					for (x in 1...MapSize-1) {
						var dist = RoomPosition.squaredDistance({x:x-1,y:y-1}, spawn.src.pos);

						var delta = 1 - (Math.sqrt(dist)/targetDistance);
						if (delta > 0) map[y*MapSize + x] += delta*(400);
					}
				}
			}
		}

		var sources = IDManager.spawns[0].src.room.find(Sources);
		var sourceConnections = [];
		for (source in sources) {
			var conn = 0;
			for (i in 0...dx.length) {
				var nx = source.pos.x+dx[i];
				var ny = source.pos.y+dy[i];
				if (nx >= 0 && ny >= 0 && nx < Room.Height && ny < Room.Height) {
					var terrain = source.room.lookAt({x:nx, y:ny});
					if (getRoomPos(terrainMap, nx,ny) != -1) {
						conn++;
					}
				}
			}
			
			var targetDistance = 5;
			for (y in 1...MapSize-1) {
				for (x in 1...MapSize-1) {
					var dist = RoomPosition.squaredDistance({x:x-1,y:y-1}, source.pos);
					var manhattan = RoomPosition.chebyshevDistance({x:x-1,y:y-1}, source.pos);
					var delta = 1 - Math.abs(Math.sqrt(dist) - targetDistance)/targetDistance;

					if (delta > 0) map[y*MapSize + x] += delta*(-100);
					if (manhattan < 5) map[y*MapSize + x] += 20000;
				}
			}
		}

		var map2 = createMap(MapSize);		
		
		addMap(map2, movementPatternMap, -0.25);

		smooth(map2, 2);

		for (i in 0...terrainMap.length) {
			if (terrainMap[i] == -1) {
				map2[i] = 200;
			}
		}
		smooth(map2, 1);

		for (i in 0...terrainMap.length) {
			if (terrainMap[i] == -1) {
				map2[i] = 10000;
			}
		}

		addMap (map, map2, 1);

		for (structure in Game.structures) {
			addDeltaRoomPos (map,structure.pos.x,structure.pos.y, 10000);
		}

		for (structure in IDManager.constructionSites) {
			addDeltaRoomPos (map,structure.src.pos.x,structure.src.pos.y, 10000);
		}

		var room = sources[0].room;
		var mins = findmins(map);

		mins.sort ( function (a,b) { return a.value > b.value ? 1 : (a.value < b.value ? -1 : 0); });

		for (i in 0...5) {
			if (i < mins.length) {
				room.createFlag(mins[i].x-1, mins[i].y-1, "Spawn" + Std.int(i));
			}
		}

		buildSpawnMap = map;
		var mn = findmin(map);
		return {x: mn.x-1, y: mn.y-1};
	}

	public function safeBuildingLocation () {
		var map = createMap(MapSize);

		for (spawn in IDManager.spawns) {
			addDeltaRoomPos (map,spawn.src.pos.x,spawn.src.pos.y, -30000);
		}
		smooth(map, 5);
		for (spawn in IDManager.spawns) {
			addDeltaRoomPos (map,spawn.src.pos.x,spawn.src.pos.y, 4000);
		}
		smooth(map, 4);


		var map2 = createMap(MapSize);		
		
		addMap(map2, movementPatternMap, 2);

		smooth(map2, 2);

		for (i in 0...terrainMap.length) {
			if (terrainMap[i] == -1) {
				map[i] = -1000;
			}
		}
		smooth(map2, 1);

		for (i in 0...terrainMap.length) {
			if (terrainMap[i] == -1) {
				map[i] = 10000;
			}
		}

		addMap (map, map2, 1);

		for (structure in IDManager.spawns) {
			addDeltaRoomPos (map,structure.src.pos.x,structure.src.pos.y, 10000);
		}

		for (structure in Game.structures) {
			addDeltaRoomPos (map,structure.pos.x,structure.pos.y, 10000);
		}

		for (structure in IDManager.constructionSites) {
			addDeltaRoomPos (map,structure.src.pos.x,structure.src.pos.y, 10000);
		}

		buildLocMap = map;
		var mn = findmin(map);
		return {x: mn.x-1, y: mn.y-1};
	}
}