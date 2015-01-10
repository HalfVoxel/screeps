class AIRoadConstructionManager extends Base {

	var roadMap : Array<Float>;

	public override function isStandalone () { return true; }

	public function configure () {
		initialize ();
		return this;
	}

	static var near1x = [0, 1, 1, 0, -1, -1, -1, 0, 1];
	static var near1y = [0, 0, 1, 1, 1, 0, -1, -1, -1];

	public function generateBuildPlans () : Array<{type: StructureType, pos: {x:Int,y:Int}}> {

		if ( roadMap == null ) roadMap = AIMap.createMap (Room.Width);

		var room = Game.getRoom("1-1").extract();

		// We start with lots of energy, to avoid building extensions at the start, do this
		var earlyScore = Game.time < 100 ? 50 : 0;

		var constructionSiteScore = IDManager.constructionSites.length*10;

		var latentEnergy = 0;
		for (spawn in IDManager.spawns) {
			latentEnergy += spawn.src.energy;
		}
		for (ent in room.find(Structures)) {
			var structure : Structure = cast ent;
			if (structure.my && structure.structureType == Extension) {
				latentEnergy += structure.energy;
			}
		}

		var movementPattern = IDManager.manager.map.movementPatternMapSlow;


		var tres = 200 + earlyScore + constructionSiteScore - latentEnergy*0.01;

		for (y in 0...Room.Height) {
			for (x in 0...Room.Width) {
				var v = AIMap.getRoomPos (movementPattern, x, y);
				roadMap[y*Room.Width + x] += v*0.01;
			}
		}

		for (site in IDManager.constructionSites) {
			for (i in 0...near1x.length) {
				var nx = site.src.pos.x + near1x[i];
				var ny = site.src.pos.y + near1y[i];
				if (nx >= 0 && ny >= 0 && nx < Room.Width && ny < Room.Height) {
					roadMap[ny*Room.Width + nx] = Math.max (roadMap[ny*Room.Width + nx] - 50, 0);
				}
			}
		}
		AIMap.decay (roadMap, 0.997);

		var result = new Array<{type: StructureType, pos: {x:Int,y:Int}}> ();
		for (y in 0...Room.Height) {
			for (x in 0...Room.Width) {
				if (roadMap[y*Room.Width + x] > tres) {
					result.push({type: Road, pos: {x:x,y:y}});
				}
			}
		}

		return result;
	}
}