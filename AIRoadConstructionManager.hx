class AIRoadConstructionManager extends Base {

	var roadMap : Array<Float>;

	public override function isStandalone () { return true; }

	public function configure () {
		initialize ();
		return this;
	}

	public function generateBuildPlans () : Array<{type: StructureType, pos: {x:Int,y:Int}}> {

		if ( roadMap == null ) roadMap = AIMap.createMap (Room.Width);

		var room = null;
		switch (Game.getRoomByName("1-1")) {
			case Some(v): room = v;
			case None: throw "Could not find room";
		}

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


		var tres = 200 + constructionSiteScore - latentEnergy*0.01;

		for (y in 0...Room.Height) {
			for (x in 0...Room.Width) {
				var v = AIMap.getRoomPos (movementPattern, x, y);
				roadMap[y*Room.Width + x] += v*0.1;
			}
		}

		AIMap.decay (roadMap, 0.99);

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