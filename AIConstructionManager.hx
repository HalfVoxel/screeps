class AIConstructionManager extends Base {

	public override function isStandalone () { return true; }

	var roadManager : AIRoadConstructionManager;

	public function configure () {
		initialize ();
		return this;
	}

	public override function tick () {

		if ( roadManager == null ) {
			roadManager = new AIRoadConstructionManager ().configure ();
		}

		// Performance
		if (Game.time % 10 != 5) return;

		var room = Game.getFirstRoom();

		var complexityScore = manager.getComplexityScore ();

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

		var roleCounts = [0,0,0,0,0,0,0];
		for (i in 0...roleCounts.length) roleCounts[i] = manager.getRoleCount(cast i);

		var mxRoleCount = 0;
		for (val in roleCounts) mxRoleCount = Std.int(Math.max(mxRoleCount, val));


		var dupScore = mxRoleCount/5;


		// Extensions
		var extensions = 0;
		for (ent in room.find(MyStructures)) {
			var structure : Structure = cast ent;
			if (structure.structureType == Extension) {
				extensions++;
			}
		}

		var alreadyBuiltScore = -extensions*10;
		var constructionSiteScore = 0.0;
		for (site in IDManager.constructionSites) {
			switch(site.src.structureType) {
				case Road: constructionSiteScore -= 2;
				case Spawn: constructionSiteScore -= 15;
				case Extension: constructionSiteScore -= 12;
				default: constructionSiteScore -= 10;
			}
		}

		// We start with lots of energy, to avoid building extensions at the start, do this
		var earlyScore = IDManager.timeSinceStart < 200 ? -5 : 0;


		var latentEnergyScore = (Math.max (latentEnergy-300, 0)/120);

		trace(dupScore + " " + alreadyBuiltScore + " " + constructionSiteScore + " " + latentEnergyScore + " " + (complexityScore/80) + " " + earlyScore);
		var extensionScore = dupScore + alreadyBuiltScore + constructionSiteScore + latentEnergyScore + (complexityScore/80) + earlyScore;

		trace("Extension Score: "+ extensionScore);

		if (extensionScore > 7) {
			var pos = manager.map.safeBuildingLocation ();
			room.createFlag(pos, "Extension");

			trace ("Creating...");
			trace (room.createConstructionSite(pos.x, pos.y, Extension));
		}



		// Spawns

		var spawns = IDManager.spawns.length;
		alreadyBuiltScore = -spawns*15;

		var usedResourcesScore = (manager.getRoleCount(Harvester)/3)*1;

		var spawnScore = alreadyBuiltScore + 2*constructionSiteScore + latentEnergyScore + (complexityScore/50) + earlyScore + usedResourcesScore;

		trace ("Spawn Score: " + spawnScore);

		if (spawnScore > 7) {
			var pos = manager.map.spawnLocation ();

			room.createFlag(pos, "Spawn");

			trace ("Creating... ");
			trace (room.createConstructionSite(pos.x, pos.y, Spawn));
		}

		var buildPlans = roadManager.generateBuildPlans ();
		var addedSites = 0;

		for (plan in buildPlans) {
			if (IDManager.constructionSites.length+addedSites < IDManager.spawns.length*5) {
				room.createConstructionSite (plan.pos.x, plan.pos.y, plan.type);
				addedSites++;
			}
		}
	}
}
