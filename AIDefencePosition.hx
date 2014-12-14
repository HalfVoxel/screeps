import hxmath.math.*;
import haxe.ds.*;

class AIDefencePosition extends Base {

	public override function isStandalone () { return true; }

	var layers = new Array<Array<IntVector2>>();

	var assigned = new Array<Array<AICreep>>();

	public function configure ( meleeLoc : Array<IntVector2>, rangedLoc : Array<IntVector2>, extraLoc : Array<IntVector2>) {
		initialize ();

		layers.push(meleeLoc);
		layers.push(rangedLoc);
		layers.push(extraLoc);

		for (i in 0...layers.length) {
			assigned.push (new Array<AICreep>());
		}
		return this;
	}

	function getAssignedIndex ( creep : AICreep ) : Option<{layer:Int, index:Int}> {
		for (layer in 0...assigned.length) {
			for (index in 0...assigned[layer].length) {
				if (assigned[layer][index] == creep) {
					return Some ({layer:layer, index: index});
				}
			}
		}
		return None;
	}

	public function assignScore ( creep : AICreep ) : Float {

		clean ();

		var layer = switch (creep.role) {
			case MeleeAttacker|MeleeWall: 0;
			case RangedAttacker: 1;
			case Healer: 2;
			default: return 0;
		}

		var totalFullness = 0.0;
		for (i in 0...layers.length) totalFullness += layers[i].length > 0 ? assigned[i].length / layers[i].length : 1;
		totalFullness /= layers.length;

		var layerFullness = layers[layer].length > 0 ? assigned[layer].length / layers[layer].length : 1;
		
		//trace (totalFullness + " " + layerFullness + " : " + creep.role);
		if (layerFullness == 1) return 0;

		return 1 - (layerFullness + totalFullness)*0.5;
	}

	function clean () {
		for (layer in assigned) {
			for (i in 0...layer.length) {
				if (layer[i] == null || layer[i].currentDefencePosition != this) {
					// Remove
					layer.splice (i, 1);

					clean ();
					return;
				}
			}
		}
	}

	public function getTargetPosition ( creep : AICreep ) {
		switch (getAssignedIndex (creep)) {
			case Some(index): return layers[index.layer][index.index];
			case None: throw creep.id + " is not assigned to this defence position";
		}
	}

	public function assign ( creep : AICreep ) {
		if (creep.currentDefencePosition == this) return true;

		clean ();

		var layer = switch (creep.role) {
			case MeleeAttacker|MeleeWall: 0;
			case RangedAttacker: 1;
			case Healer: 2;
			default: return false;
		}

		while (layer < layers.length && assigned[layer].length >= layers[layer].length) {
			layer++;
		}

		if (layer == layers.length) return false;

		assigned[layer].push (creep);
		creep.currentDefencePosition = this;
		return true;
	}
}