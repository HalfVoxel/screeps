class AIAssigned extends Base {
	public var assigned : Array<AICreep> = [];
	public var assignedScores : Array<Float> = [];
	public var maxAssignedCount = 1;

	public function assign (creep : AICreep, score : Float) {
		if (assigned == null || assignedScores == null) {
			assigned = [];
			assignedScores = [];
		}

		if (creep.currentTarget == this) {
			assignedScores[assigned.indexOf(creep)] = score;
			return;
		}

		while (assigned.length >= maxAssignedCount && assigned.length > 0) {
			var mn = 0;
			for (i in 0...assigned.length) if (assignedScores[i] < assignedScores[mn]) mn = i;

			unassign(assigned[mn]);
		}

		if ( creep.currentTarget != null ) creep.currentTarget.unassign(creep);

		assigned.push (creep);
		assignedScores.push (score);
		creep.currentTarget = this;
	}

	public function cleanup () {

		if (assigned == null || assignedScores == null) {
			assigned = [];
			assignedScores = [];
		}

		for (i in 0...assigned.length) {
			if (assigned[i] == null) {
				assigned.splice (i,1);
				assignedScores.splice(i,1);
				break;
			}
		}
	}

	public override function tick () {
		cleanup ();
	}

	public function betterAssignScore ( score : Float ) {
		if ( assigned.length < maxAssignedCount ) return true;

		cleanup ();

		for ( i in 0...assignedScores.length ) {
			if (assignedScores[i] < score ) return true;
		}

		return false;
	}

	public function unassign ( creep : AICreep) {
		if (creep == null) cleanup ();

		if (assigned != null && creep != null) {
			if (creep.currentTarget != this) {
				trace ("========== API bugged =========");				
				trace ("Expected " + id + " got " + (creep.currentTarget != null ? ""+creep.currentTarget.id : "<null>"));
				trace(creep);
				trace(untyped __js__("typeof(creep)"));
			}

			creep.currentTarget = null;

			var i = assigned.indexOf(creep);
			assigned.splice (i,1);
			assignedScores.splice(i,1);
		}
	}
}