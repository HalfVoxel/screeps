class AIAssigned extends Base {
	public var assigned : Ref<AICreep> = null;
	public var assignedScore : Float = 0;

	public function assign (creep : AICreep, score : Float) {
		if (creep.currentTarget != null) {
			creep.currentTarget.toEntity().unassign();
		}
		unassign();

		assigned = creep;
		assignedScore = score;
		creep.currentTarget = this;
	}

	public function unassign () {
		if (assigned != null) {
			if (assigned.toEntity().currentTarget != this) throw "API bugged";

			assigned.toEntity().currentTarget = null;

			assigned = null;
			assignedScore = 0;
		}
	}
}