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

	public function clear () {
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

		var index = 1;

		nextElementIndex--;

		if (nextElementIndex == 1) return toReturn;
		
		var obj = data[nextElementIndex];
		//data[index] = data[nextElementIndex];

		while(true) {
			if (index*2 < nextElementIndex && obj.f > data[index*2].f) {
				data[index] = data[index*2];
				data[index].heapIndex = index;
				index = index*2;
			} else if ( index*2+1 < nextElementIndex && obj.f > data[index*2+1].f) {
				data[index] = data[index*2+1];
				data[index].heapIndex = index;
				index = index*2+1;
			} else {
				break;
			}
		}

		data[index] = obj;
		data[index].heapIndex = index;

		return toReturn;
	}
}