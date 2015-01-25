typedef HasF = {
	public var f (default, null) : Float;
	public var heapIndex (default, default) : Int;
}

@:generic
class PriorityQueue<T:HasF> {

	var data : Array<T>;

	var nextElementIndex : Int = 1;

	public function new () {
		data = new Array<T>();
		data.push(null);
	}

	public function isEmpty () {
		return nextElementIndex == 1;
	}

	/** can be optimized */
	public function clear () {

		for (i in 1...nextElementIndex) {
			data[i].heapIndex = -1;
		}

		nextElementIndex = 1;
	}

	public function push (v : T) {

		if (v.heapIndex < nextElementIndex && data[v.heapIndex] == v) {
			trickle(v.heapIndex);
			return;
		}

		if (data.length == nextElementIndex) data.push(v);
		else data[nextElementIndex] = v;

		v.heapIndex = nextElementIndex;

		trickle(nextElementIndex);
		nextElementIndex++;
	}

	public function pushOrTrickle  (v : T ) {
		if (v.heapIndex != -1) {
			if (data[v.heapIndex] != v) throw "Invalid state";

			trickle (v.heapIndex);
		} else {
			push (v);
		}
	}

	function trickle (index : Int) {

		while (index != 1) {
			var parent = Math.floor(index / 2);
			if (data[parent].f > data[index].f) {
				var tmp = data[parent];
				data[parent] = data[index];
				data[parent].heapIndex = parent;

				data[index] = tmp;
				data[index].heapIndex = index;
				index = parent;
			} else {
				break;
			}
		}
	}

	public function pop () : T {

		if (nextElementIndex == 1) return null;

		var toReturn = data[1];
		toReturn.heapIndex = -1;

		var index = 1;

		nextElementIndex--;

		if (nextElementIndex == 1) return toReturn;
		
		var obj = data[nextElementIndex];

		while(true) {
			var swapIndex = nextElementIndex;
			var ind2 = index*2;
			if (ind2+1 < nextElementIndex) {
				if (data[swapIndex].f > data[ind2].f) {
					swapIndex = ind2;
				}
				if (data[swapIndex].f > data[ind2+1].f) {
					swapIndex = ind2+1;
				}
			} else if (ind2 < nextElementIndex) {
				if (data[swapIndex].f > data[ind2].f) {
					swapIndex = ind2;
				}
			}
			
			if (swapIndex != nextElementIndex) {
				data[index] = data[swapIndex];
				data[index].heapIndex = index;
				index = swapIndex;
			} else {
				break;
			}
		}

		data[index] = obj;
		data[index].heapIndex = index;

		return toReturn;
	}
}